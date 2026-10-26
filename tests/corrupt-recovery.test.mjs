import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyState,makeBackup,inspectBackup} from '../site/js/store-core.js';
import {encodeRawRecord,rawRecordFingerprint,prepareCorruptRestore} from '../site/js/recovery-core.js';

test('raw recovery fingerprint survives structured clone and detects nested changes',()=>{
 const raw={version:1,data:{revision:12,steps:'damaged',notes:['keep this',null]}};
 assert.equal(rawRecordFingerprint(raw),rawRecordFingerprint(structuredClone(raw)));
 const changed=structuredClone(raw);changed.data.notes[0]='other tab';
 assert.notEqual(rawRecordFingerprint(raw),rawRecordFingerprint(changed));
 assert.notEqual(rawRecordFingerprint({value:undefined}),rawRecordFingerprint({}));
 assert.notEqual(rawRecordFingerprint([undefined]),rawRecordFingerprint(new Array(1)));
 assert.notEqual(rawRecordFingerprint(NaN),rawRecordFingerprint(null));
 assert.notEqual(rawRecordFingerprint(-0),rawRecordFingerprint(0));
});

test('raw recovery preserves non-JSON structured values in downloadable encoding',()=>{
 const raw={n:NaN,infinity:Infinity,negativeZero:-0,big:2n,date:new Date('2026-10-26T12:00:00Z'),invalidDate:new Date(NaN),map:new Map([[1,'one']]),set:new Set([2]),bytes:new Uint16Array([42]),regex:/hello/gi};raw.self=raw;
 const encoded=encodeRawRecord(raw);
 assert.deepEqual(JSON.parse(JSON.stringify(encoded)),encoded);
 assert.equal(rawRecordFingerprint(raw),rawRecordFingerprint(structuredClone(raw)));
 assert.throws(()=>rawRecordFingerprint(new Blob(['uncomparable synchronously'])),e=>e.code==='storage_invalid');
});

test('corrupt restore validates backup and advances beyond raw and backup revision',()=>{
 const backup=makeBackup({...emptyState(),revision:4}),original=structuredClone(backup);
 assert.equal(prepareCorruptRestore({data:{revision:12}},backup).revision,13);
 assert.equal(prepareCorruptRestore({data:{revision:'broken'}},backup).revision,5);
 assert.equal(prepareCorruptRestore(null,backup).revision,5);
 assert.deepEqual(backup,original);
 assert.throws(()=>prepareCorruptRestore({},{}),e=>e.code==='invalid_backup');
 assert.throws(()=>prepareCorruptRestore({data:{revision:Number.MAX_SAFE_INTEGER}},backup),e=>e.code==='storage_invalid');
});

test('raw recovery exports cannot be mistaken for ordinary workspace backups',()=>{
 const envelope={format:'work-tracker-raw-recovery',version:1,exported_at:new Date().toISOString(),record_encoding:'tagged-json-v1',record:encodeRawRecord({version:99})};
 assert.throws(()=>inspectBackup(envelope),e=>e.code==='invalid_backup');
});
