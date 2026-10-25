import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {emptyState,applyMutation,makeBackup,inspectBackup,prepareRestore,day,instant} from '../site/js/store-core.js';
import {overviewData} from '../site/js/planning.js';

function fixture(){
 let state=emptyState();const now=new Date(2026,9,25,12).toISOString();
 const save=(path,fields,method='PATCH')=>{const result=applyMutation(state,path,method,{...fields,request_id:randomUUID(),expected_revision:state.revision},{now,newId:randomUUID});state=result.data;return result.entity_id;};
 const project=save('/api/projects',{title:'Integration QA'},'POST');
 const goal=save('/api/goals',{project_id:project,title:'First goal'},'POST');
 const step=save('/api/steps',{goal_id:goal,title:'Carried-over work',planned_for:'2026-10-20',due_date:'2026-10-24'},'POST');
 return {get state(){return state;},save,project,goal,step,now};
}

test('large UTF-8 workspace export is accepted for restore without an import-only size cap',()=>{
 const w=fixture();const text='ملاحظة محفوظة — preserved context\n'.repeat(340000);
 w.save('/api/entries',{project_id:w.project,kind:'summary',text},'POST');
 const serialized=JSON.stringify(makeBackup(w.state,w.now));assert.ok(Buffer.byteLength(serialized)>10*1024*1024);
 const decoded=inspectBackup(serialized);assert.equal(decoded.backup.data.entries.at(-1).text,text);
 const current=structuredClone(w.state);w.save(`/api/projects/${w.project}`,{next_action:'Later action'});
 const restored=prepareRestore(w.state,decoded.backup,w.state.revision);
 assert.deepEqual({...restored.data,revision:current.revision},current);
 assert.equal(restored.safety.data.projects[0].next_action,'Later action');
});

test('paused, deferred, reopened, moved and restored work obeys the planning rules together',()=>{
 const w=fixture();const at=new Date(2026,9,25,13);let view=overviewData(w.state,at);
 assert.deepEqual(view.todaySteps.map(s=>s.id),[w.step]);assert.deepEqual(view.weekSteps.map(s=>s.id),[w.step]);assert.equal(view.deadlines[0].overdue,true);
 const originalPlanned=w.state.steps[0].planned_for;
 w.save(`/api/projects/${w.project}/status`,{status:'paused',reason:'Waiting'});view=overviewData(w.state,at);
 assert.equal(view.todaySteps.length,0);assert.equal(view.weekSteps.length,0);assert.equal(view.activeGoals.length,0);assert.equal(view.deadlines[0].project.status,'paused');
 w.save(`/api/projects/${w.project}/status`,{status:'active'});assert.equal(w.state.steps[0].planned_for,originalPlanned);assert.equal(overviewData(w.state,at).todaySteps.length,1);
 w.save(`/api/steps/${w.step}/status`,{status:'deferred'});view=overviewData(w.state,at);assert.equal(view.weekSteps.length,0);assert.equal(view.deadlines.length,1);
 w.save(`/api/steps/${w.step}/dates`,{planned_for:'2026-10-25'});assert.equal(overviewData(w.state,at).todaySteps.length,1);
 w.save(`/api/steps/${w.step}`,{status:'completed',completion_at:w.now});view=overviewData(w.state,at);assert.equal(view.stepsCompleted,1);assert.equal(view.goalsCompleted,0);assert.equal(view.todaySteps.length,0);
 w.save(`/api/steps/${w.step}/status`,{status:'pending'});view=overviewData(w.state,at);assert.equal(view.stepsCompleted,1);assert.equal(view.todaySteps.length,1);
 const laterGoal=w.save('/api/goals',{project_id:w.project,title:'Later'},'POST');w.save(`/api/steps/${w.step}/move`,{goal_id:laterGoal},'POST');view=overviewData(w.state,at);assert.equal(view.stepsCompleted,1);assert.equal(view.todaySteps[0].goal_id,laterGoal);
 w.save(`/api/steps/${w.step}/archive`,{},'POST');view=overviewData(w.state,at);assert.equal(view.todaySteps.length,0);assert.equal(view.deadlines.length,0);assert.equal(view.stepsCompleted,1);
 w.save(`/api/steps/${w.step}/restore`,{},'POST');view=overviewData(w.state,at);assert.equal(view.todaySteps.length,1);assert.equal(view.deadlines.length,1);assert.equal(view.stepsCompleted,1);
 const recovered=prepareRestore(emptyState(),makeBackup(w.state,w.now),0).data;assert.deepEqual(overviewData(recovered,at),view);
});

test('strict calendar and timestamp rejection also protects imported backup dates',()=>{
 for(const value of ['2026-02-29','2026-04-31','2026-13-01','2026-00-01','2026-01-00','26-01-01','2026-1-01','not a date'])assert.throws(()=>day(value),e=>e.code==='invalid_input');
 for(const value of ['2026-02-30T09:00:00Z','2026-10-25T25:00:00Z','2026-10-25T09:60:00Z','2026-10-25T09:00:00','2026-10-25'])assert.throws(()=>instant(value,'occurred_at'),e=>e.code==='invalid_input');
 assert.equal(instant('2026-10-25T12:34:56.789+03:00','occurred_at'),'2026-10-25T09:34:56.789Z');
 const w=fixture(),backup=makeBackup(w.state,w.now);backup.data.entries[0].occurred_at='2026-02-30T09:00:00Z';
 assert.throws(()=>inspectBackup(backup),e=>e.code==='invalid_backup');
});
