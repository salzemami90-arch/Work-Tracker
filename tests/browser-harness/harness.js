import {readState,mutate,exportBackup,restoreBackup,listRecoveryCopies,exportRecoveryCopy} from './js/api.js';
const runButton=document.querySelector('#run'),results=document.querySelector('#results'),summary=document.querySelector('#summary');
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function assert(value,message){if(!value)throw new Error(message);}
async function expectCode(fn,code){try{await fn();}catch(error){assert(error?.code===code,`Expected ${code}, got ${error?.code||error?.name||String(error)}`);return;}throw new Error(`Expected rejection: ${code}`);}
async function withMethodFault(name,fn,shouldFail=()=>true){
 const prototype=IDBObjectStore.prototype,descriptor=Object.getOwnPropertyDescriptor(prototype,name);
 assert(descriptor&&typeof descriptor.value==='function',`Cannot patch ${name} for isolated fault test`);
 Object.defineProperty(prototype,name,{...descriptor,value:function(...args){if(shouldFail(this))throw new DOMException('Isolated QA simulated quota failure','QuotaExceededError');return descriptor.value.apply(this,args);}});
 try{return await fn();}finally{Object.defineProperty(prototype,name,descriptor);}
}
runButton.addEventListener('click',async()=>{
 if(runButton.disabled)return;runButton.disabled=true;results.replaceChildren();summary.textContent='Running…';
 let passed=0,failed=0;const started=performance.now();let projectId,goalId,stepId,projectRequest,projectPayload,snapshot;
 async function test(name,fn){const row=document.createElement('li');row.textContent=`RUNNING — ${name}`;results.append(row);try{const evidence=await fn();passed++;row.className='pass';row.textContent=`PASS — ${name}`;const detail=document.createElement('small');detail.textContent=evidence||'Verified';row.append(detail);}catch(error){failed++;row.className='fail';row.textContent=`FAIL — ${name}\n${error?.stack||error?.message||String(error)}`;}summary.textContent=`Running: ${passed} passed, ${failed} failed`;}
 const save=async(path,method,body)=>{const state=await readState();return mutate(path,method,{...body,expected_revision:state.revision,request_id:crypto.randomUUID()});};
 try{
  await test('Create and read actual IndexedDB records',async()=>{
   const baseline=await readState();projectRequest=crypto.randomUUID();projectPayload={title:`QA transaction ${new Date().toISOString()}`,icon:'tools',description:'Isolated harness data',expected_revision:baseline.revision,request_id:projectRequest};
   const created=await mutate('/api/projects','POST',projectPayload);projectId=created.entity_id;
   goalId=(await save('/api/goals','POST',{project_id:projectId,title:'QA goal'})).entity_id;
   stepId=(await save('/api/steps','POST',{goal_id:goalId,title:'QA step',planned_for:'2026-10-25',due_date:'2026-10-31'})).entity_id;
   const loaded=await readState();assert(loaded.projects.some(p=>p.id===projectId),'Project missing');assert(loaded.goals.some(g=>g.id===goalId&&g.project_id===projectId),'Goal relationship missing');assert(loaded.steps.some(s=>s.id===stepId&&s.goal_id===goalId),'Step relationship missing');assert(loaded.revision===baseline.revision+3,'Expected three committed revisions');
   return `Created project, goal, step at revision ${loaded.revision}; IDs and relationships survived a separate read.`;
  });
  if(!projectId||!goalId||!stepId)throw new Error('Fixture creation failed; dependent tests cannot run.');
  await test('Retry deduplication after newer revisions returns current state',async()=>{
   const before=await readState();const result=await mutate('/api/projects','POST',{...projectPayload,expected_revision:before.revision});const after=await readState();
   assert(result.entity_id===projectId,'Retry changed entity ID');assert(equal(after,before),'Retry mutated saved state');assert(equal(result.data,before),'Retry did not return latest state');
   return `Same request ID returned original project ID and current revision ${before.revision}, with no duplicate record/event.`;
  });
  await test('Reused request ID with conflicting content is rejected',async()=>{
   const before=await readState();await expectCode(()=>mutate('/api/projects','POST',{...projectPayload,title:'QA conflicting title',expected_revision:before.revision}),'request_conflict');assert(equal(await readState(),before),'Conflict changed saved data');return 'request_conflict; state and revision unchanged.';
  });
  await test('Stale tab revision cannot overwrite a newer save',async()=>{
   const old=await readState();await save(`/api/projects/${projectId}`,'PATCH',{next_action:'QA newer tab action'});const before=await readState();
   await expectCode(()=>mutate(`/api/projects/${projectId}`,'PATCH',{next_action:'QA stale overwrite',expected_revision:old.revision,request_id:crypto.randomUUID()}),'stale_revision');assert(equal(await readState(),before),'Stale update changed saved data');return `Revision ${old.revision} rejected after revision ${before.revision}; newer action retained.`;
  });
  await test('Quota failure rolls back state, history, and retry record together',async()=>{
   const before=await readState(),request_id=crypto.randomUUID(),payload={text:'QA quota recovery note',expected_revision:before.revision,request_id};
   await withMethodFault('put',async()=>{await expectCode(()=>mutate(`/api/steps/${stepId}/notes`,'POST',payload),'save_failed');},store=>store.name==='requests');
   assert(equal(await readState(),before),'Quota failure changed state/history');
   const retried=await mutate(`/api/steps/${stepId}/notes`,'POST',payload);const after=await readState();assert(after.revision===before.revision+1,'Same request retry did not commit once');assert(after.entries.filter(e=>e.request_id===request_id).length===1,'Retry event missing or duplicated');assert(equal(retried.data,after),'Retry response mismatch');
   return 'Simulated QuotaExceededError on retry metadata after queuing the workspace write left state unchanged; restoring put and retrying the same request created exactly one event.';
  });
  await test('Export is a consistent restorable snapshot',async()=>{
   snapshot=await exportBackup();const loaded=await readState();assert(equal(snapshot.data,loaded),'Export differs from saved state');assert(snapshot.format==='work-tracker'&&snapshot.version===1,'Unexpected backup header');return `${snapshot.data.projects.length} projects, ${snapshot.data.goals.length} goals, ${snapshot.data.steps.length} steps, ${snapshot.data.entries.length} events in a revision-consistent snapshot.`;
  });
  await test('Recovery-copy write failure prevents replacement',async()=>{
   assert(snapshot,'Backup unavailable');await save(`/api/projects/${projectId}`,'PATCH',{next_action:'QA state retained if recovery write fails'});const before=await readState(),copies=await listRecoveryCopies();
   await withMethodFault('add',async()=>{await expectCode(()=>restoreBackup(snapshot,before.revision),'save_failed');});
   assert(equal(await readState(),before),'Failed recovery copy replaced state');assert(equal(await listRecoveryCopies(),copies),'Failed recovery copy changed recovery list');
   return 'Simulated recovery-store add failure aborted replacement; current data and recovery-copy list are unchanged.';
  });
  await test('Replacement write failure rolls back the queued safety copy',async()=>{
   assert(snapshot,'Backup unavailable');const before=await readState(),copies=await listRecoveryCopies();
   await withMethodFault('put',async()=>{await expectCode(()=>restoreBackup(snapshot,before.revision),'save_failed');},store=>store.name==='workspace');
   assert(equal(await readState(),before),'Failed replacement changed state');assert(equal(await listRecoveryCopies(),copies),'Failed replacement left a partial safety copy');
   return 'Workspace put failed after safety-copy add was queued; both stores rolled back without partial records.';
  });
  await test('Successful restore preserves a downloadable exact recovery copy',async()=>{
   assert(snapshot,'Backup unavailable');const before=await readState(),copies=await listRecoveryCopies();const restored=await restoreBackup(snapshot,before.revision);const after=await readState();
   assert(after.revision===before.revision+1,'Restore revision not monotonic');assert(equal({...after,revision:snapshot.data.revision},snapshot.data),'Restored content differs from backup');
   const listed=await listRecoveryCopies();assert(listed.length===copies.length+1,'Recovery copy not listed');assert(listed.some(c=>c.id===restored.recovery_id),'New recovery ID absent');const recovery=await exportRecoveryCopy(restored.recovery_id);assert(equal(recovery.data,before),'Recovery export differs from pre-restore data');
   // Restore that recovery copy too, proving the safety copy is actually usable.
   await restoreBackup(recovery,after.revision);const recovered=await readState();assert(equal({...recovered,revision:before.revision},before),'Recovery copy did not recover pre-restore work');
   return `Backup restored at revision ${after.revision}; exported safety copy exactly matched prior state and was restored successfully at revision ${recovered.revision}.`;
  });
  await test('Unavailable browser storage fails explicitly without resetting data',async()=>{
   const before=await readState(),descriptor=Object.getOwnPropertyDescriptor(globalThis,'indexedDB');
   try{Object.defineProperty(globalThis,'indexedDB',{value:undefined,configurable:true});const blocked=await import(`./js/api.js?unavailable=${crypto.randomUUID()}`);await expectCode(()=>blocked.readState(),'storage_unavailable');}
   finally{if(descriptor)Object.defineProperty(globalThis,'indexedDB',descriptor);else Reflect.deleteProperty(globalThis,'indexedDB');}
   assert(equal(await readState(),before),'Unavailable storage check changed data');return 'Fresh API module returned storage_unavailable; original database state remained unchanged after restoring the global.';
  });
 }catch(error){failed++;const row=document.createElement('li');row.className='fail';row.textContent=`FAIL — Harness dependency\n${error?.stack||String(error)}`;results.append(row);}
 finally{summary.textContent=`${failed?'FAIL':'PASS'} — ${passed} passed, ${failed} failed (${Math.round(performance.now()-started)} ms)`;runButton.disabled=false;}
});
