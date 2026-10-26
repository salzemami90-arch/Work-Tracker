import {readState,mutate,exportBackup,restoreBackup,listRecoveryCopies,exportRecoveryCopy,inspectCorruptWorkspace,restoreCorruptBackup,inspectBackup} from './js/api.js';
import {encodeRawRecord} from './js/recovery-core.js';
const runButton=document.querySelector('#run'),results=document.querySelector('#results'),summary=document.querySelector('#summary');
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function assert(value,message){if(!value)throw new Error(message);}
// Direct writes are confined to this isolated QA origin to simulate damaged
// storage and races. Always restore the fixture after each recovery test.
async function rawWorkspace(record,write=false){
 const db=await new Promise((resolve,reject)=>{const request=indexedDB.open('work-tracker-browser-v1',1);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
 try{return await new Promise((resolve,reject)=>{const tx=db.transaction('workspace',write?'readwrite':'readonly'),store=tx.objectStore('workspace');let result;const request=write?store.put(record,'current'):store.get('current');request.onsuccess=()=>{result=request.result;};tx.oncomplete=()=>resolve(result);tx.onabort=()=>reject(tx.error||new Error('Fixture transaction failed'));});}finally{db.close();}
}
async function withCorruptFixture(fn){
 const original=await rawWorkspace();const raw={version:1,data:{revision:original.data.revision+100,steps:'damaged',keep:'Exact original evidence',special:undefined}};
 try{await rawWorkspace(raw,true);return await fn(raw);}finally{await rawWorkspace(original,true);}
}
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
  await test('Corrupt workspace requires explicit recovery and rejects invalid backup',async()=>withCorruptFixture(async raw=>{
   const copies=await listRecoveryCopies();await expectCode(()=>readState(),'storage_invalid');await expectCode(()=>restoreBackup(snapshot,raw.data.revision),'storage_invalid');
   const {recovery_token}=await inspectCorruptWorkspace();await expectCode(()=>restoreCorruptBackup({},recovery_token),'invalid_backup');
   assert(equal(encodeRawRecord(await rawWorkspace()),encodeRawRecord(raw)),'Rejected operation changed corrupt record');assert(equal(await listRecoveryCopies(),copies),'Rejected operation made recovery copy');
   return 'Normal restore does not bypass corrupt storage; invalid explicit backup leaves raw data and recovery list unchanged.';
  }));
  await test('Corrupt recovery token cannot overwrite a changed record or healthy workspace',async()=>withCorruptFixture(async raw=>{
   const {recovery_token}=await inspectCorruptWorkspace(),copies=await listRecoveryCopies(),changed=structuredClone(raw);changed.data.keep='A different tab changed this';await rawWorkspace(changed,true);
   await expectCode(()=>restoreCorruptBackup(snapshot,recovery_token),'stale_revision');assert(equal(encodeRawRecord(await rawWorkspace()),encodeRawRecord(changed)),'Stale token overwrote changed record');
   const fresh=await inspectCorruptWorkspace();await rawWorkspace({version:1,data:snapshot.data},true);await expectCode(()=>restoreCorruptBackup(snapshot,fresh.recovery_token),'stale_revision');await expectCode(()=>inspectCorruptWorkspace(),'stale_revision');
   assert(equal(await readState(),snapshot.data),'Recovery overwrote healthy record');assert(equal(await listRecoveryCopies(),copies),'Race created partial recovery copy');
   return 'Exact raw snapshot checked transactionally; changed corrupt data and a concurrently recovered healthy workspace were both retained.';
  }));
  await test('Corrupt recovery atomically rolls back failures in every write store',async()=>withCorruptFixture(async raw=>{
   const {recovery_token}=await inspectCorruptWorkspace(),copies=await listRecoveryCopies();
   for(const [method,storeName] of [['add','recovery'],['put','workspace'],['clear','requests']]){
    await withMethodFault(method,()=>expectCode(()=>restoreCorruptBackup(snapshot,recovery_token),'save_failed'),store=>store.name===storeName);
    assert(equal(encodeRawRecord(await rawWorkspace()),encodeRawRecord(raw)),`${storeName} failure changed raw data`);assert(equal(await listRecoveryCopies(),copies),`${storeName} failure left a partial copy`);
   }
   return 'Failures in raw safety-copy creation, workspace replacement, and retry clearing each rolled back all stores; token remains retryable.';
  }));
  await test('Explicit corrupt recovery preserves raw evidence and restores valid saved work',async()=>withCorruptFixture(async raw=>{
   const {recovery_token}=await inspectCorruptWorkspace(),result=await restoreCorruptBackup(snapshot,recovery_token),state=await readState();
   assert(state.revision===raw.data.revision+1,'Recovery revision did not advance');assert(equal({...state,revision:snapshot.data.revision},snapshot.data),'Recovery content mismatch');
   const copy=(await listRecoveryCopies()).find(item=>item.id===result.recovery_id);assert(copy?.kind==='raw'&&copy.counts===null,'Raw recovery metadata incorrect');
   const exported=await exportRecoveryCopy(result.recovery_id);assert(exported.format==='work-tracker-raw-recovery'&&exported.record_encoding==='tagged-json-v1','Raw export header incorrect');assert(equal(exported.record,encodeRawRecord(raw)),'Raw copy lost original values');
   await expectCode(()=>Promise.resolve(inspectBackup(exported)),'invalid_backup');await expectCode(()=>restoreCorruptBackup(snapshot,recovery_token),'stale_revision');
   await expectCode(()=>mutate(`/api/projects/${projectId}`,'PATCH',{next_action:'Stale pre-recovery action',expected_revision:raw.data.revision,request_id:crypto.randomUUID()}),'stale_revision');
   return 'Verified exact raw evidence (including undefined), valid restored state, monotonic revision, single-use token, and rejection of stale edits/raw-file import.';
  }));
  await test('Unavailable browser storage fails explicitly without resetting data',async()=>{
   const before=await readState(),descriptor=Object.getOwnPropertyDescriptor(globalThis,'indexedDB');
   try{Object.defineProperty(globalThis,'indexedDB',{value:undefined,configurable:true});const blocked=await import(`./js/api.js?unavailable=${crypto.randomUUID()}`);await expectCode(()=>blocked.readState(),'storage_unavailable');}
   finally{if(descriptor)Object.defineProperty(globalThis,'indexedDB',descriptor);else Reflect.deleteProperty(globalThis,'indexedDB');}
   assert(equal(await readState(),before),'Unavailable storage check changed data');return 'Fresh API module returned storage_unavailable; original database state remained unchanged after restoring the global.';
  });
 }catch(error){failed++;const row=document.createElement('li');row.className='fail';row.textContent=`FAIL — Harness dependency\n${error?.stack||String(error)}`;results.append(row);}
 finally{summary.textContent=`${failed?'FAIL':'PASS'} — ${passed} passed, ${failed} failed (${Math.round(performance.now()-started)} ms)`;runButton.disabled=false;}
});
