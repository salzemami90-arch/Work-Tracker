import {ApiError,inspectBackup} from './store-core.js?v=1.0.4';

// Lossless, deterministic representation of the record types this app writes,
// including malformed values. Never fall back to a lossy JSON.stringify guard.
export function encodeRawRecord(record){
 const seen=new Map();
 function encode(value){
  if(value===null)return ['null'];
  const type=typeof value;
  if(type==='undefined')return ['undefined'];
  if(type==='string'||type==='boolean')return [type,value];
  if(type==='bigint')return ['bigint',String(value)];
  if(type==='number')return ['number',Number.isNaN(value)?'NaN':Object.is(value,-0)?'-0':value===Infinity?'Infinity':value===-Infinity?'-Infinity':value];
  if(type!=='object')throw new ApiError('storage_invalid');
  if(seen.has(value))return ['ref',seen.get(value)];
  const id=seen.size;seen.set(value,id);
  if(value instanceof Date)return ['date',id,Number.isNaN(value.getTime())?'invalid':value.toISOString()];
  if(value instanceof RegExp)return ['regexp',id,value.source,value.flags];
  if(value instanceof ArrayBuffer)return ['buffer',id,Array.from(new Uint8Array(value))];
  if(ArrayBuffer.isView(value))return ['view',id,value.constructor.name,value.byteOffset,value.byteLength,encode(value.buffer)];
  if(value instanceof Map)return ['map',id,Array.from(value,([key,item])=>[encode(key),encode(item)])];
  if(value instanceof Set)return ['set',id,Array.from(value,encode)];
  if(Array.isArray(value))return ['array',id,value.length,Object.keys(value).map(key=>[key,encode(value[key])])];
  if(Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null)return ['object',id,Object.keys(value).map(key=>[key,encode(value[key])])];
  // Unknown records (for example Blob) cannot be compared synchronously inside
  // an IndexedDB transaction. Refuse replacement instead of weakening the guard.
  throw new ApiError('storage_invalid');
 }
 return encode(record);
}
export const rawRecordFingerprint=record=>JSON.stringify(encodeRawRecord(record));

export function prepareCorruptRestore(record,backup){
 const data=inspectBackup(backup).backup.data;
 const rawRevision=record?.data?.revision;
 const revision=Math.max(Number.isSafeInteger(rawRevision)&&rawRevision>=0?rawRevision:0,data.revision);
 if(revision===Number.MAX_SAFE_INTEGER)throw new ApiError('storage_invalid');
 data.revision=revision+1;
 return data;
}
