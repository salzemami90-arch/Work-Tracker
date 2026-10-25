import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyState,applyMutation,validateState,makeBackup,inspectBackup,prepareRestore,fingerprint,day,instant,ICONS} from '../site/js/store-core.js';
import {randomUUID} from 'node:crypto';
const NOW='2026-10-25T10:00:00.000Z';
function workspace(){
 let state=emptyState();
 const save=(path,method,fields={})=>{const result=applyMutation(state,path,method,{request_id:randomUUID(),expected_revision:state.revision,...fields},{now:NOW,newId:randomUUID});state=result.data;return result.entity_id;};
 const project=save('/api/projects','POST',{title:'Fictional workshop',icon:'camera'});
 const source=save('/api/goals','POST',{title:'First release',project_id:project});
 const target=save('/api/goals','POST',{title:'Later release',project_id:project});
 const step=save('/api/steps','POST',{title:'Write an outline',goal_id:source});
 return {save,get state(){return state;},project,source,target,step};
}
function rejectsUnchanged(w,path,method,body,code='invalid_input'){
 const before=structuredClone(w.state);
 assert.throws(()=>w.save(path,method,body),e=>e.code===code);
 assert.deepEqual(w.state,before);
}

test('empty workspace has no samples and supported new icons round-trip',()=>{
 assert.deepEqual(emptyState().projects,[]);
 assert.equal(ICONS.length,24);
 const w=workspace();assert.equal(w.state.projects[0].icon,'camera');assert.deepEqual(validateState(w.state),w.state);
 for(const icon of ICONS)w.save(`/api/projects/${w.project}`,'PATCH',{icon});
 assert.equal(w.state.projects[0].icon,'tools');assert.deepEqual(validateState(w.state),w.state);
 rejectsUnchanged(w,`/api/projects/${w.project}`,'PATCH',{icon:'<svg>'});
});

test('rename, move, removal, and restoration retain original achievement and notes',()=>{
 const w=workspace();w.save(`/api/steps/${w.step}`,'PATCH',{status:'completed',completion_at:'2026-10-20T10:30:00Z'});
 w.save(`/api/steps/${w.step}/notes`,'POST',{text:'Earlier discovery',agent_name:'Example helper'});
 const original=structuredClone(w.state);const stepBefore=original.steps[0];
 w.save(`/api/goals/${w.source}/title`,'PATCH',{title:'النشر الأول'});
 w.save(`/api/steps/${w.step}/title`,'PATCH',{title:'Outline <script> stays text'});
 w.save(`/api/steps/${w.step}/move`,'POST',{goal_id:w.target,reason:'After release'});
 w.save(`/api/steps/${w.step}/notes`,'POST',{text:'New note after move'});
 w.save(`/api/steps/${w.step}/archive`,'POST',{reason:'Keep the achievement'});
 w.save(`/api/steps/${w.step}/restore`,'POST',{});
 for(const key of ['id','status','completed_at','created_at','description','archived_at'])assert.equal(w.state.steps[0][key],stepBefore[key]);
 assert.deepEqual(w.state.entries.slice(0,original.entries.length),original.entries);
 assert.equal(w.state.steps[0].goal_id,w.target);
 assert.equal(w.state.entries.filter(e=>e.action==='step_completed').length,1);
 const moved=w.state.entries.find(e=>e.action==='step_moved');assert.equal(moved.details.source_goal.title,'النشر الأول');assert.equal(moved.details.destination_goal.title,'Later release');
 assert.deepEqual(w.state.entries.filter(e=>e.kind==='note').map(e=>e.goal_id),[w.source,w.target]);
 assert.deepEqual(validateState(w.state),w.state);
});

test('invalid/cross-project moves, blank titles, and unsupported fields cannot mutate state',()=>{
 const w=workspace();const foreign=w.save('/api/projects','POST',{title:'Separate project'});const goal=w.save('/api/goals','POST',{title:'Separate goal',project_id:foreign});
 rejectsUnchanged(w,`/api/steps/${w.step}/move`,'POST',{goal_id:goal});
 rejectsUnchanged(w,`/api/steps/${w.step}/move`,'POST',{goal_id:w.source});
 rejectsUnchanged(w,`/api/steps/${w.step}/move`,'POST',{goal_id:randomUUID()},'not_found');
 rejectsUnchanged(w,`/api/goals/${w.source}/title`,'PATCH',{title:'  '});
 rejectsUnchanged(w,`/api/steps/${w.step}/title`,'PATCH',{title:42});
 rejectsUnchanged(w,`/api/projects/${w.project}`,'PATCH',{owner:'Unsupported field'});
});

test('goal completion requires acknowledgement and never completes unfinished children',()=>{
 const w=workspace();rejectsUnchanged(w,`/api/goals/${w.source}/status`,'PATCH',{status:'completed'},'unfinished_steps');
 w.save(`/api/goals/${w.source}/status`,'PATCH',{status:'completed',ack_remaining:true});
 assert.equal(w.state.steps[0].status,'pending');assert.equal(w.state.projects[0].status,'active');
 assert.equal(w.state.entries.filter(e=>e.action==='goal_completed').length,1);assert.equal(w.state.entries.filter(e=>e.action==='step_completed').length,0);
 w.save(`/api/goals/${w.source}/status`,'PATCH',{status:'active'});
 assert.equal(w.state.goals[0].completed_at,null);assert.equal(w.state.entries.filter(e=>e.action==='goal_completed').length,1);
 assert.deepEqual(validateState(w.state),w.state);
});

test('planned dates and deadlines remain separate, validate actual calendar dates, and can clear',()=>{
 const w=workspace();const id=w.save('/api/steps','POST',{goal_id:w.source,title:'Dated work',due_date:'2026-11-01',planned_for:'2026-10-24'});
 w.save(`/api/steps/${id}/dates`,'PATCH',{planned_for:'2026-10-26'});
 assert.equal(w.state.steps[1].due_date,'2026-11-01');
 w.save(`/api/steps/${id}/dates`,'PATCH',{planned_for:''});assert.equal(w.state.steps[1].planned_for,null);
 rejectsUnchanged(w,`/api/steps/${id}/dates`,'PATCH',{due_date:'2026-02-30'});
 rejectsUnchanged(w,`/api/goals/${w.source}/dates`,'PATCH',{planned_for:'2026-10-25'});
 assert.equal(day('2028-02-29'),'2028-02-29');assert.throws(()=>instant('2026-02-30T10:00:00Z','date'));assert.throws(()=>instant('2026-10-25T10:00:00','date'));
});

test('manual notes, issues, and summaries keep explicit project context',()=>{
 const w=workspace();for(const kind of ['note','issue','summary'])w.save('/api/entries','POST',{project_id:w.project,goal_id:w.source,step_id:w.step,kind,text:'Recorded context',occurred_at:'2026-10-20T10:00:00Z'});
 const entries=w.state.entries.slice(-3);assert.deepEqual(entries.map(e=>e.kind),['note','issue','summary']);assert.ok(entries.every(e=>e.step_id===w.step&&e.project_id===w.project));
 assert.equal(w.state.steps[0].status,'pending');assert.deepEqual(validateState(w.state),w.state);
});

test('stale edits and reused request IDs are rejected; fingerprint ignores only revision and request ID',()=>{
 const w=workspace();rejectsUnchanged(w,`/api/steps/${w.step}/title`,'PATCH',{title:'Stale',expected_revision:0},'stale_revision');
 rejectsUnchanged(w,`/api/steps/${w.step}/title`,'PATCH',{title:'Duplicate',request_id:w.state.entries[0].request_id},'request_conflict');
 const a={title:'One',reason:'why',request_id:randomUUID(),expected_revision:1};const b={expected_revision:3,request_id:randomUUID(),reason:'why',title:'One'};
 assert.equal(fingerprint('/x','PATCH',a),fingerprint('/x','PATCH',b));assert.notEqual(fingerprint('/x','PATCH',a),fingerprint('/x','PATCH',{...b,title:'Two'}));
});

test('versioned backup round-trip and restore preserve data with monotonic revision and safety snapshot',()=>{
 const w=workspace();w.save(`/api/steps/${w.step}/notes`,'POST',{text:'Before backup'});const backup=makeBackup(w.state,NOW);const parsed=inspectBackup(JSON.stringify(backup));assert.deepEqual(parsed.backup.data,w.state);
 const saved=structuredClone(w.state);w.save(`/api/steps/${w.step}/title`,'PATCH',{title:'Later version'});const current=structuredClone(w.state);
 const result=prepareRestore(current,parsed.backup,current.revision);
 assert.equal(result.data.revision,current.revision+1);assert.deepEqual({...result.data,revision:saved.revision},saved);assert.deepEqual(result.safety.data,current);assert.deepEqual(w.state,current);
 assert.throws(()=>prepareRestore(current,backup,0),e=>e.code==='stale_revision');
});

test('malformed backups, unsupported versions, duplicate IDs, and foreign references fail without changes',()=>{
 const w=workspace();const before=structuredClone(w.state);const original=makeBackup(w.state,NOW);
 for(const alter of [b=>b.version=2,b=>b.data.steps[0].goal_id=randomUUID(),b=>b.data.steps.push(structuredClone(b.data.steps[0])),b=>b.data.goals[0].status='invalid',b=>b.data.projects[0].due_date='2026-02-31',b=>delete b.data.steps[0].created_at,b=>b.data.entries[0].details.entity_id=randomUUID()]){
  const backup=structuredClone(original);alter(backup);assert.throws(()=>prepareRestore(w.state,backup,w.state.revision),e=>e.code==='invalid_backup');assert.deepEqual(w.state,before);
 }
 assert.throws(()=>inspectBackup('{broken'),e=>e.code==='invalid_backup');
});

test('pause/resume preserves every child status, date, and previous event',()=>{
 const w=workspace();w.save(`/api/steps/${w.step}/dates`,'PATCH',{planned_for:'2026-10-20',due_date:'2026-10-26'});
 const before=structuredClone(w.state);
 w.save(`/api/projects/${w.project}/status`,'PATCH',{status:'paused',reason:'Awaiting supplier'});
 assert.equal(w.state.projects[0].pause_reason,'Awaiting supplier');assert.equal(w.state.projects[0].status,'paused');
 assert.deepEqual(w.state.goals,before.goals);assert.deepEqual(w.state.steps,before.steps);assert.deepEqual(w.state.entries.slice(0,before.entries.length),before.entries);
 rejectsUnchanged(w,`/api/projects/${w.project}/status`,'PATCH',{status:'paused'});
 w.save(`/api/projects/${w.project}/status`,'PATCH',{status:'active',reason:'Supplier responded'});
 assert.equal(w.state.projects[0].pause_reason,'');assert.deepEqual(w.state.steps,before.steps);
 assert.deepEqual(w.state.entries.slice(-2).map(e=>e.action),['project_paused','project_resumed']);
 assert.deepEqual(validateState(w.state),w.state);
});

test('deferral, rescheduling, completion and reopening preserve original achievement dates',()=>{
 const w=workspace();w.save(`/api/steps/${w.step}/dates`,'PATCH',{planned_for:'2026-10-20',due_date:'2026-10-26'});
 w.save(`/api/steps/${w.step}/status`,'PATCH',{status:'deferred',reason:'Waiting for information'});
 assert.equal(w.state.steps[0].planned_for,null);assert.equal(w.state.steps[0].due_date,'2026-10-26');assert.equal(w.state.steps[0].status,'deferred');
 w.save(`/api/steps/${w.step}/dates`,'PATCH',{planned_for:'2026-10-28'});
 assert.equal(w.state.steps[0].status,'pending');assert.equal(w.state.entries.at(-1).action,'step_resumed');assert.equal(w.state.entries.at(-1).details.resumed_from_deferral,true);
 w.save(`/api/steps/${w.step}`,'PATCH',{status:'completed',completion_at:'2026-10-22T09:00:00Z'});
 const achievement=structuredClone(w.state.entries.at(-1));
 rejectsUnchanged(w,`/api/steps/${w.step}/status`,'PATCH',{status:'deferred'});
 w.save(`/api/steps/${w.step}/status`,'PATCH',{status:'pending',reason:'More work found'});
 assert.equal(w.state.steps[0].completed_at,null);assert.equal(w.state.steps[0].planned_for,'2026-10-28');assert.equal(w.state.entries.at(-1).action,'step_reopened');
 assert.deepEqual(w.state.entries.find(e=>e.id===achievement.id),achievement);
 w.save(`/api/steps/${w.step}`,'PATCH',{status:'completed',completion_at:'2026-10-25T09:00:00Z'});
 assert.deepEqual(w.state.entries.filter(e=>e.action==='step_completed').map(e=>e.occurred_at),['2026-10-22T09:00:00.000Z','2026-10-25T09:00:00.000Z']);
 w.save(`/api/steps/${w.step}/archive`,'POST');rejectsUnchanged(w,`/api/steps/${w.step}/status`,'PATCH',{status:'pending'});
 assert.deepEqual(validateState(w.state),w.state);
});

test('reordering swaps siblings only and rejects boundaries and archived steps',()=>{
 const w=workspace();const sibling=w.save('/api/steps','POST',{title:'Second',goal_id:w.source});const archived=w.save('/api/steps','POST',{title:'Removed',goal_id:w.source});const foreign=w.save('/api/steps','POST',{title:'Other goal',goal_id:w.target});
 w.save(`/api/steps/${archived}/archive`,'POST');const before=structuredClone(w.state);
 rejectsUnchanged(w,`/api/steps/${w.step}/reorder`,'PATCH',{direction:'up'});
 w.save(`/api/steps/${w.step}/reorder`,'PATCH',{direction:'down'});
 assert.deepEqual(w.state.steps.filter(s=>s.goal_id===w.source&&!s.archived_at).sort((a,b)=>a.position-b.position).map(s=>s.id),[sibling,w.step]);
 assert.deepEqual(w.state.steps.find(s=>s.id===foreign),before.steps.find(s=>s.id===foreign));
 assert.deepEqual(w.state.steps.find(s=>s.id===archived),before.steps.find(s=>s.id===archived));
 assert.deepEqual(w.state.entries.at(-1).details.order_before,[w.step,sibling]);
 rejectsUnchanged(w,`/api/steps/${w.step}/reorder`,'PATCH',{direction:'down'});rejectsUnchanged(w,`/api/steps/${archived}/reorder`,'PATCH',{direction:'up'});
 w.save(`/api/goals/${w.target}/reorder`,'PATCH',{direction:'up'});
 assert.deepEqual(w.state.goals.slice().sort((a,b)=>a.position-b.position).map(g=>g.id),[w.target,w.source]);
 const secondProject=w.save('/api/projects','POST',{title:'Another project'});w.save(`/api/projects/${secondProject}/reorder`,'PATCH',{direction:'up'});
 assert.equal(w.state.projects.find(p=>p.id===secondProject).position,0);assert.deepEqual(validateState(w.state),w.state);
});

test('entity edits validate nonempty changes and keep completion and note context',()=>{
 const w=workspace();w.save(`/api/steps/${w.step}`,'PATCH',{status:'completed'});
 const completed=w.state.steps[0].completed_at;
 for(const [table,id] of [['projects',w.project],['goals',w.source],['steps',w.step]]){
  w.save(`/api/${table}/${id}`,'PATCH',{title:'Updated '+table,description:'Detailed context',reason:'Clarified'});
  const item=w.state[table].find(e=>e.id===id);assert.equal(item.description,'Detailed context');
  rejectsUnchanged(w,`/api/${table}/${id}`,'PATCH',{});rejectsUnchanged(w,`/api/${table}/${id}`,'PATCH',{title:' '});
 }
 assert.equal(w.state.steps[0].completed_at,completed);assert.equal(w.state.steps[0].status,'completed');
 rejectsUnchanged(w,`/api/steps/${w.step}`,'PATCH',{description:'Incomplete completion payload',completion_at:NOW});
 assert.deepEqual(validateState(w.state),w.state);
});

test('manual entry edits retain identity/context and preserve before/after in immutable audit events',()=>{
 const w=workspace();w.save('/api/entries','POST',{project_id:w.project,goal_id:w.source,step_id:w.step,kind:'summary',text:'First report',agent_name:'Helper A',occurred_at:'2026-09-20T09:00:00Z'});
 const original=structuredClone(w.state.entries.at(-1));
 w.save(`/api/steps/${w.step}/move`,'POST',{goal_id:w.target});
 w.save(`/api/entries/${original.id}`,'PATCH',{text:'Corrected report',agent_name:'Helper B',occurred_at:'2026-09-21T09:00:00Z',reason:'Corrected date and details'});
 const updated=w.state.entries.find(e=>e.id===original.id),audit=w.state.entries.at(-1);
 assert.equal(updated.kind,'summary');assert.equal(updated.goal_id,w.source);assert.equal(updated.step_id,w.step);assert.equal(updated.recorded_at,original.recorded_at);assert.equal(updated.request_id,original.request_id);
 assert.equal(updated.text,'Corrected report');assert.equal(updated.agent_name,'Helper B');assert.equal(audit.action,'entry_edited');assert.equal(audit.kind,'event');assert.deepEqual(audit.details.before,original);assert.deepEqual(audit.details.after,updated);assert.equal(audit.details.entry_id,original.id);assert.equal(audit.details.entity_id,w.step);
 rejectsUnchanged(w,`/api/entries/${audit.id}`,'PATCH',{text:'Rewrite history'});rejectsUnchanged(w,`/api/entries/${original.id}`,'PATCH',{text:' '});rejectsUnchanged(w,`/api/entries/${original.id}`,'PATCH',{occurred_at:'2026-02-30T09:00:00Z'});rejectsUnchanged(w,`/api/entries/${original.id}`,'PATCH',{kind:'issue'});rejectsUnchanged(w,`/api/entries/${original.id}`,'PATCH',{reason:'No editable field'});
 assert.deepEqual(validateState(w.state),w.state);
 w.save(`/api/entries/${original.id}`,'PATCH',{text:'Final report'});assert.deepEqual(w.state.entries.find(e=>e.id===audit.id),audit);
});

test('new workflows survive a full backup round-trip and update project activity time',()=>{
 const w=workspace();w.save(`/api/steps/${w.step}`,'PATCH',{status:'completed'});w.save(`/api/steps/${w.step}/status`,'PATCH',{status:'pending'});w.save(`/api/steps/${w.step}/status`,'PATCH',{status:'deferred'});
 w.save(`/api/projects/${w.project}/status`,'PATCH',{status:'paused',reason:'Pause'});w.save(`/api/goals/${w.target}/reorder`,'PATCH',{direction:'up'});
 w.save('/api/entries','POST',{project_id:w.project,kind:'note',text:'Independent project note'});const note=w.state.entries.at(-1);w.save(`/api/entries/${note.id}`,'PATCH',{text:'Revised independent note'});
 const decoded=inspectBackup(JSON.stringify(makeBackup(w.state,NOW))).backup.data;assert.deepEqual(decoded,w.state);
 const later='2026-10-26T11:00:00.000Z';const result=applyMutation(w.state,'/api/entries','POST',{project_id:w.project,kind:'issue',text:'New issue',request_id:randomUUID(),expected_revision:w.state.revision},{now:later,newId:randomUUID});
 assert.equal(result.data.projects[0].updated_at,later);assert.deepEqual(result.data.goals,w.state.goals);assert.deepEqual(result.data.steps,w.state.steps);
});
