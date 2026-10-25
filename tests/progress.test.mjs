import test from 'node:test';
import assert from 'node:assert/strict';
import {stepProgress,goalCounts,projectIconName} from '../static/js/progress.js';

test('new, completed, removed and restored steps change only current-plan progress',()=>{
 const done={id:'a',goal_id:'g',status:'completed',completed_at:'2026-10-25T12:00:00Z'};
 const pending={id:'b',goal_id:'g',status:'pending'};
 assert.deepEqual(stepProgress([], 'g'),{total:0,done:0,remaining:0,percent:0});
 assert.deepEqual(stepProgress([done,pending], 'g'),{total:2,done:1,remaining:1,percent:50});
 assert.equal(stepProgress([done,{...pending,archived_at:'now'}], 'g').percent,100);
 assert.equal(stepProgress([{...done,archived_at:'now'},pending], 'g').done,0);
 assert.equal(stepProgress([done,pending,{id:'c',goal_id:'other',status:'completed'}], 'g').total,2);
 assert.equal(stepProgress([done,pending,{id:'c',goal_id:'g',status:'deferred'}], 'g').remaining,2);
 assert.equal(done.completed_at,'2026-10-25T12:00:00Z');
});

test('goal totals distinguish active, completed and paused projects without auto-completing goals',()=>{
 const goals=[{project_id:'p',status:'active'},{project_id:'p',status:'completed'},
 {project_id:'q',status:'active'},{project_id:'q',status:'completed'}];
 assert.deepEqual(goalCounts(goals,[{id:'p',status:'active'},{id:'q',status:'paused'}]),{total:4,active:1,completed:2,paused:1});
 assert.deepEqual(goalCounts([],[]),{total:0,active:0,completed:0,paused:0});
 assert.equal(goals[0].status,'active');
});

test('icon choice uses an allowlisted local drawing and a stable legacy fallback',()=>{
 assert.equal(projectIconName({icon:'chart'}),'chart');
 assert.equal(projectIconName({icon:'<svg onload=bad>'}),'folder');
 assert.equal(projectIconName({}),'folder');
});
