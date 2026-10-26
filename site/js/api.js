/** IndexedDB is local to this browser and site address. No network or shared records. */
import {ApiError,emptyState,requestInfo,applyMutation,validateState,makeBackup,inspectBackup,prepareRestore} from './store-core.js?v=1.0.3';
import {encodeRawRecord,rawRecordFingerprint,prepareCorruptRestore} from './recovery-core.js?v=1.0.3';
export {ApiError,inspectBackup};
const DATABASE='work-tracker-browser-v1';
const VERSION=1;
let opening;
const recoveryTokens=new Map();
function database(){
 if(opening)return opening;
 opening=new Promise((resolve,reject)=>{
  if(!globalThis.indexedDB){reject(new ApiError('storage_unavailable'));return;}
  const request=indexedDB.open(DATABASE,VERSION);
  request.onupgradeneeded=()=>{const db=request.result;for(const name of ['workspace','requests','recovery'])db.createObjectStore(name);};
  request.onerror=()=>reject(new ApiError('storage_unavailable'));
  request.onblocked=()=>reject(new ApiError('storage_unavailable'));
  request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();opening=null;};resolve(db);};
 }).catch(error=>{opening=null;throw error;});
 return opening;
}
function decode(record){
 if(record===undefined)return emptyState();
 if(record?.version!==VERSION)throw new ApiError('storage_invalid');
 try{return validateState(record.data);}catch{throw new ApiError('storage_invalid');}
}
function transaction(db,names,mode,run){return new Promise((resolve,reject)=>{
 let result,error;const tx=db.transaction(names,mode);
 tx.oncomplete=()=>resolve(result);tx.onabort=()=>reject(error||new ApiError('save_failed'));tx.onerror=()=>{};
 const finish=value=>{result=value;};const abort=e=>{error=e instanceof ApiError?e:new ApiError('save_failed');tx.abort();};
 try{run(tx,finish,abort);}catch(e){abort(e);}
 });}
export async function readState(){const db=await database();return transaction(db,['workspace'],'readonly',(tx,finish,abort)=>{const request=tx.objectStore('workspace').get('current');request.onsuccess=()=>{try{finish(decode(request.result));}catch(e){abort(e);}};});}
export async function mutate(path,method,payload){
 const identity=requestInfo(path,method,payload);const db=await database();
 return transaction(db,['workspace','requests'],'readwrite',(tx,finish,abort)=>{
  const requests=tx.objectStore('requests'),work=tx.objectStore('workspace');const duplicate=requests.get(identity.request_id);
  duplicate.onsuccess=()=>{const current=work.get('current');current.onsuccess=()=>{try{
   const state=decode(current.result);
   if(duplicate.result){if(duplicate.result.fingerprint!==identity.fingerprint)throw new ApiError('request_conflict',{},409);finish({ok:true,revision:state.revision,data:state,entity_id:duplicate.result.entity_id});return;}
   const result=applyMutation(state,path,method,payload);work.put({version:VERSION,data:result.data},'current');requests.put({...identity,entity_id:result.entity_id},identity.request_id);finish(result);
  }catch(e){abort(e);}};};
 });
}
export async function exportBackup(){return makeBackup(await readState());}
function requireCorrupt(record){
 try{decode(record);}catch(error){if(error.code==='storage_invalid')return;throw error;}
 throw new ApiError('stale_revision',{},409);
}
export async function inspectCorruptWorkspace(){
 const db=await database();return transaction(db,['workspace'],'readonly',(tx,finish,abort)=>{
  const current=tx.objectStore('workspace').get('current');current.onsuccess=()=>{try{
   requireCorrupt(current.result);const fingerprint=rawRecordFingerprint(current.result),recovery_token=crypto.randomUUID();
   recoveryTokens.clear();recoveryTokens.set(recovery_token,fingerprint);finish({recovery_token});
  }catch(error){abort(error);}};
 });
}
export async function restoreCorruptBackup(backup,recoveryToken){
 const checked=inspectBackup(backup).backup;
 if(!recoveryTokens.has(recoveryToken))throw new ApiError('stale_revision',{},409);
 const fingerprint=recoveryTokens.get(recoveryToken),db=await database();
 const result=await transaction(db,['workspace','requests','recovery'],'readwrite',(tx,finish,abort)=>{
  const work=tx.objectStore('workspace'),current=work.get('current');current.onsuccess=()=>{try{
   requireCorrupt(current.result);
   if(rawRecordFingerprint(current.result)!==fingerprint)throw new ApiError('stale_revision',{},409);
   const data=prepareCorruptRestore(current.result,checked),id=crypto.randomUUID(),created_at=new Date().toISOString();
   tx.objectStore('recovery').add({id,created_at,kind:'raw',record:current.result},id);
   work.put({version:VERSION,data},'current');tx.objectStore('requests').clear();
   finish({ok:true,revision:data.revision,data,entity_id:null,recovery_id:id});
  }catch(error){abort(error);}};
 });
 recoveryTokens.delete(recoveryToken);return result;
}
export async function restoreBackup(backup,expectedRevision){
 const checked=inspectBackup(backup).backup;const db=await database();
 return transaction(db,['workspace','requests','recovery'],'readwrite',(tx,finish,abort)=>{
  const work=tx.objectStore('workspace');const current=work.get('current');current.onsuccess=()=>{try{
   const prepared=prepareRestore(decode(current.result),checked,expectedRevision);const id=crypto.randomUUID();
   tx.objectStore('recovery').add({id,created_at:new Date().toISOString(),backup:prepared.safety},id);
   work.put({version:VERSION,data:prepared.data},'current');tx.objectStore('requests').clear();
   finish({ok:true,revision:prepared.data.revision,data:prepared.data,entity_id:null,recovery_id:id});
  }catch(e){abort(e);}};
 });
}
export async function listRecoveryCopies(){const db=await database();return transaction(db,['recovery'],'readonly',(tx,finish,abort)=>{const request=tx.objectStore('recovery').getAll();request.onsuccess=()=>{try{finish(request.result.map(({id,created_at,backup,kind})=>({id,created_at,kind:kind==='raw'?'raw':'backup',counts:kind==='raw'?null:Object.fromEntries(['projects','goals','steps','entries'].map(k=>[k,backup.data[k].length]))})).sort((a,b)=>b.created_at.localeCompare(a.created_at)));}catch(error){abort(error);}};});}
export async function exportRecoveryCopy(id){const db=await database();return transaction(db,['recovery'],'readonly',(tx,finish,abort)=>{const request=tx.objectStore('recovery').get(id);request.onsuccess=()=>{if(!request.result){abort(new ApiError('not_found'));return;}try{const copy=request.result;finish(copy.kind==='raw'?{format:'work-tracker-raw-recovery',version:1,exported_at:copy.created_at,record_encoding:'tagged-json-v1',record:encodeRawRecord(copy.record)}:inspectBackup(copy.backup).backup);}catch(e){abort(e);}};});}
