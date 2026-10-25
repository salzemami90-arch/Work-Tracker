export class ApiError extends Error {
 constructor(code, fields={}, status=0){super(code);this.code=code;this.fields=fields;this.status=status;}
}
export async function readState(){return request('/api/state');}
async function request(path, options={}) {
 let response;
 try {response=await fetch(path,{cache:'no-store',...options});} catch {throw new ApiError('connection');}
 let result;
 try {result=await response.json();} catch {throw new ApiError('connection');}
 if(!response.ok || result.ok===false) throw new ApiError(result.error?.code || 'save_failed',result.error?.fields || {},response.status);
 return result;
}
export async function mutate(path,method,payload){
 return request(path,{method,headers:{'Content-Type':'application/json','X-Request-Token':document.querySelector('meta[name="request-token"]').content},body:JSON.stringify(payload)});
}
