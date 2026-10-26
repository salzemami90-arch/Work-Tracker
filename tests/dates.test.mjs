import test from 'node:test';
import assert from 'node:assert/strict';
import {localDateInput,resolveLocalTimestamp} from '../site/js/dates.js';

test('unchanged completion and note dates retain seconds and chronology',()=>{
 const created='2026-10-26T16:20:30.125Z',completed='2026-10-26T16:20:45.789Z';
 const result=resolveLocalTimestamp(localDateInput(completed),completed,'completion_at');
 assert.equal(result,completed);assert.ok(result>created);
 assert.equal(resolveLocalTimestamp(localDateInput(created),created,'occurred_at'),created);
});
test('explicit earlier dates still honor the selected local time',()=>{
 const initial='2026-10-26T16:20:45.789Z',selected='2026-10-25T11:30';
 assert.equal(resolveLocalTimestamp(selected,initial,'occurred_at'),new Date(selected).toISOString());
});
test('invalid timestamp fields fail without silently using the current time',()=>{
 assert.throws(()=>resolveLocalTimestamp('','2026-10-26T16:20:45Z','completion_at'),e=>e.code==='invalid_input'&&e.fields.completion_at==='invalid');
});
