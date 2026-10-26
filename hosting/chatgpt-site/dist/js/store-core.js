/** Pure browser-workspace operations. Persistence commits state and audit together. */
export class ApiError extends Error {
 constructor(code, fields={}, status=400){super(code);this.code=code;this.fields=fields;this.status=status;}
}
export const ICONS=['folder','chart','spark','award','document','book','code','heart','briefcase','building','shopping','beauty','pet','bulb','camera','video','mic','globe','plane','home','calendar','target','coffee','tools'];
export const emptyState=()=>({revision:0,settings:{language:'en'},demo_mode:false,projects:[],goals:[],steps:[],entries:[]});
const fail=(field,reason='invalid')=>{throw new ApiError('invalid_input',{[field]:reason});};
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
function uuid(v,field){if(typeof v!=='string'||!uuidPattern.test(v))fail(field,'invalid_id');return v;}
function text(v,field,{required=false,trim=false}={}){if(typeof v!=='string'||(required&&!v.trim()))fail(field,required?'required':'invalid_text');return trim?v.trim():v;}
export function day(v,field='due_date'){if(v===null||v==='')return null;if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v+'T12:00:00Z'))||new Date(v+'T12:00:00Z').toISOString().slice(0,10)!==v)fail(field,'invalid_date');return v;}
export function instant(v,field){if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(v)||Number.isNaN(Date.parse(v)))fail(field,'invalid_date');day(v.slice(0,10),field);return new Date(v).toISOString();}
function keys(v,allowed,field){if(!object(v)||Object.keys(v).some(k=>!allowed.includes(k)))fail(field,'unsupported_field');}
function find(state,table,id,field='id'){uuid(id,field);const entity=state[table].find(e=>e.id===id);if(!entity)throw new ApiError('not_found',{[field]:'not_found'},404);return entity;}
function canonical(value){if(Array.isArray(value))return value.map(canonical);if(object(value))return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));return value;}
export function fingerprint(path,method,payload){return JSON.stringify(canonical({path,method,payload:Object.fromEntries(Object.entries(payload).filter(([k])=>!['request_id','expected_revision'].includes(k)))}));}
export function requestInfo(path,method,payload){if(!object(payload))fail('form');uuid(payload.request_id,'request_id');if(!Number.isSafeInteger(payload.expected_revision)||payload.expected_revision<0)fail('expected_revision');return {request_id:payload.request_id,fingerprint:fingerprint(path,method,payload)};}

export function applyMutation(original,path,method,payload,{now=new Date().toISOString(),newId=()=>crypto.randomUUID()}={}){
 requestInfo(path,method,payload);
 if(original.entries.some(e=>e.request_id===payload.request_id))throw new ApiError('request_conflict',{},409);
 if(payload.expected_revision!==original.revision)throw new ApiError('stale_revision',{},409);
 if(original.revision>=Number.MAX_SAFE_INTEGER)throw new ApiError('save_failed');
 const state=structuredClone(original);const match=path.match(/^\/api\/(projects|goals|steps|entries|settings)(?:\/([0-9a-f-]+))?(?:\/(title|move|notes|archive|restore|dates|status|reorder))?$/);
 if(!match)throw new ApiError('not_found',{},404);
 const [,table,id,action]=match;let allowed=[],entity=null,before=null,project=null,goal=null,step=null,entityType=table.slice(0,-1),eventAction='',kind='event',occurred=now,extra={},resultId=null;
 const creation=method==='POST'&&!id&&['projects','goals','steps'].includes(table);
 if(creation)allowed=['title','description','due_date',...(table==='projects'?['icon','next_action']:table==='goals'?['project_id']:['goal_id','planned_for'])];
 else if(table==='projects'&&id&&!action&&method==='PATCH')allowed=['title','description','icon','next_action'];
 else if(table==='goals'&&id&&!action&&method==='PATCH')allowed=['title','description'];
 else if(['goals','steps'].includes(table)&&id&&action==='title'&&method==='PATCH')allowed=['title'];
 else if(table==='steps'&&id&&action==='move'&&method==='POST')allowed=['goal_id'];
 else if(table==='steps'&&id&&!action&&method==='PATCH')allowed=['title','description','status','completion_at'];
 else if(table==='steps'&&id&&action==='notes'&&method==='POST')allowed=['text','occurred_at'];
 else if(table==='steps'&&id&&['archive','restore'].includes(action)&&method==='POST')allowed=[];
 else if(['projects','goals','steps'].includes(table)&&id&&action==='dates'&&method==='PATCH')allowed=['due_date',...(table==='steps'?['planned_for']:[])];
 else if(['projects','goals','steps'].includes(table)&&id&&action==='status'&&method==='PATCH')allowed=table==='goals'?['status','ack_remaining']:['status'];
 else if(['projects','goals','steps'].includes(table)&&id&&action==='reorder'&&method==='PATCH')allowed=['direction'];
 else if(table==='entries'&&id&&!action&&method==='PATCH')allowed=['text','occurred_at'];
 else if(table==='settings'&&!id&&method==='PATCH')allowed=['language'];
 else if(table==='entries'&&!id&&method==='POST')allowed=['project_id','goal_id','step_id','kind','text','occurred_at'];
 else throw new ApiError('not_found',{},404);
 keys(payload,[...allowed,'request_id','expected_revision','reason','agent_name'],'form');
 let reason=text(payload.reason??'','reason'),helper=text(payload.agent_name??'','agent_name')||null;
 if(creation){
  const itemId=newId();uuid(itemId,'id');
  entity={id:itemId,title:text(payload.title,'title',{required:true,trim:true}),description:text(payload.description??'','description'),status:table==='steps'?'pending':'active',due_date:day(payload.due_date??null),created_at:now,updated_at:now};
  let siblings=state[table];
  if(table==='projects'){const icon=payload.icon??'folder';if(!ICONS.includes(icon))fail('icon');Object.assign(entity,{icon,next_action:text(payload.next_action??'','next_action'),pause_reason:''});project=entity;}
  else if(table==='goals'){project=find(state,'projects',payload.project_id,'project_id');Object.assign(entity,{project_id:project.id,completed_at:null});goal=entity;siblings=siblings.filter(g=>g.project_id===project.id);}
  else {goal=find(state,'goals',payload.goal_id,'goal_id');project=find(state,'projects',goal.project_id);Object.assign(entity,{goal_id:goal.id,planned_for:day(payload.planned_for??null,'planned_for'),completed_at:null,archived_at:null});step=entity;siblings=siblings.filter(s=>s.goal_id===goal.id);}
  entity.position=siblings.reduce((max,s)=>Math.max(max,s.position),-1)+1;state[table].push(entity);eventAction=entityType+'_created';
 }else if(table==='settings'){
  if(!['en','ar'].includes(payload.language))fail('language');before=structuredClone(state.settings);state.settings.language=payload.language;entity=state.settings;entityType='settings';eventAction='language_changed';
 }else if(table==='entries'){
  if(id){
   const entry=find(state,'entries',id);
   if(!['note','issue','summary'].includes(entry.kind))fail('entry','immutable_event');
   if(!['text','occurred_at','agent_name'].some(key=>key in payload))fail('form','missing_change');
   const entryBefore=structuredClone(entry);
   if('text' in payload)entry.text=text(payload.text,'text',{required:true});
   if('occurred_at' in payload)entry.occurred_at=instant(payload.occurred_at,'occurred_at');
   if('agent_name' in payload)entry.agent_name=helper;
   project=find(state,'projects',entry.project_id,'project_id');
   if(entry.goal_id)goal=find(state,'goals',entry.goal_id,'goal_id');
   if(entry.step_id)step=find(state,'steps',entry.step_id,'step_id');
   entity=step||goal||project;entityType=step?'step':goal?'goal':'project';
   before=entryBefore;extra={entry_id:entry.id,before:entryBefore,after:structuredClone(entry)};
   eventAction='entry_edited';resultId=entry.id;
  }else{
   project=find(state,'projects',payload.project_id,'project_id');
   if(payload.goal_id){goal=find(state,'goals',payload.goal_id,'goal_id');if(goal.project_id!==project.id)fail('goal_id');}
   if(payload.step_id){step=find(state,'steps',payload.step_id,'step_id');const parent=find(state,'goals',step.goal_id);if(parent.project_id!==project.id||(goal&&parent.id!==goal.id))fail('step_id');goal=parent;}
   if(!['note','summary','issue'].includes(payload.kind))fail('kind');kind=payload.kind;reason=text(payload.text,'text',{required:true});occurred='occurred_at' in payload?instant(payload.occurred_at,'occurred_at'):now;entity=step||goal||project;entityType=step?'step':goal?'goal':'project';eventAction=kind+'_added';
  }
 }else{
  entity=find(state,table,id);before=structuredClone(entity);
  if(table==='steps'){step=entity;goal=find(state,'goals',step.goal_id);project=find(state,'projects',goal.project_id);}
  else if(table==='goals'){goal=entity;project=find(state,'projects',goal.project_id);}
  else project=entity;
  if(action==='title'){entity.title=text(payload.title,'title',{required:true,trim:true});eventAction=entityType+'_renamed';}
  else if(action==='dates'){
   if(!('due_date' in payload)&&!('planned_for' in payload))fail('form','missing_change');
   if('due_date' in payload)entity.due_date=day(payload.due_date);if('planned_for' in payload)entity.planned_for=day(payload.planned_for,'planned_for');eventAction=entityType+'_dates_updated';
   if(table==='steps'&&entity.status==='deferred'&&entity.planned_for){if(entity.archived_at)fail('step','archived');entity.status='pending';extra.resumed_from_deferral=true;eventAction='step_resumed';}
  }else if(action==='move'){
   const target=find(state,'goals',payload.goal_id,'goal_id');if(target.project_id!==project.id||target.id===goal.id)fail('goal_id');
   extra={source_goal:{id:goal.id,title:goal.title},destination_goal:{id:target.id,title:target.title}};
   entity.goal_id=target.id;entity.position=state.steps.filter(s=>s.goal_id===target.id).reduce((m,s)=>Math.max(m,s.position),-1)+1;goal=target;eventAction='step_moved';
  }else if(action==='notes'){
   reason=text(payload.text,'text',{required:true});occurred='occurred_at' in payload?instant(payload.occurred_at,'occurred_at'):now;kind='note';eventAction='note_added';
  }else if(action==='archive'||action==='restore'){
   if((action==='archive')===Boolean(entity.archived_at))fail('step',action==='archive'?'already_archived':'not_archived');entity.archived_at=action==='archive'?now:null;eventAction=action==='archive'?'step_archived':'step_restored';
  }else if(action==='status'){
   if(table==='projects'){
    if(!['active','paused'].includes(payload.status)||entity.status===payload.status)fail('status');
    entity.status=payload.status;entity.pause_reason=payload.status==='paused'?reason:'';
    eventAction=payload.status==='paused'?'project_paused':'project_resumed';
   }else if(table==='steps'){
    if(entity.archived_at||!['pending','deferred'].includes(payload.status)||entity.status===payload.status)fail('status');
    if(entity.status==='completed'&&payload.status==='deferred')fail('status','reopen_first');
    const previous=entity.status;entity.status=payload.status;entity.completed_at=null;
    if(payload.status==='deferred')entity.planned_for=null;
    eventAction=payload.status==='deferred'?'step_deferred':previous==='completed'?'step_reopened':'step_resumed';
   }else{
    if(!['completed','active'].includes(payload.status)||entity.status===payload.status)fail('status');
    if('ack_remaining' in payload&&typeof payload.ack_remaining!=='boolean')fail('ack_remaining');
    if(payload.status==='completed'&&state.steps.some(s=>s.goal_id===id&&!s.archived_at&&s.status!=='completed')&&payload.ack_remaining!==true)throw new ApiError('unfinished_steps',{ack_remaining:'required'});
    entity.status=payload.status;entity.completed_at=payload.status==='completed'?now:null;eventAction=payload.status==='completed'?'goal_completed':'goal_reopened';
   }
  }else if(action==='reorder'){
   if(!['up','down'].includes(payload.direction)||entity.archived_at)fail('direction');
   const siblings=state[table].filter(item=>table==='projects'||(table==='goals'?item.project_id===entity.project_id:item.goal_id===entity.goal_id&&!item.archived_at)).sort((a,b)=>a.position-b.position);
   const index=siblings.findIndex(item=>item.id===id),destination=index+(payload.direction==='up'?-1:1);
   if(destination<0||destination>=siblings.length)fail('direction','at_boundary');
   extra.order_before=siblings.map(item=>item.id);
   const neighbor=siblings[destination];
   [entity.position,neighbor.position]=[neighbor.position,entity.position];neighbor.updated_at=now;
   [siblings[index],siblings[destination]]=[siblings[destination],siblings[index]];
   extra.order_after=siblings.map(item=>item.id);eventAction=entityType+'_reordered';
  }else if(table==='steps'&&'status' in payload){
   if(payload.status!=='completed'||entity.status==='completed'||entity.archived_at)fail('status');occurred='completion_at' in payload?instant(payload.completion_at,'completion_at'):now;entity.status='completed';entity.completed_at=occurred;
   if('title' in payload)entity.title=text(payload.title,'title',{required:true,trim:true});if('description' in payload)entity.description=text(payload.description,'description');eventAction='step_completed';
  }else{
   const editable=table==='projects'?['title','description','icon','next_action']:['title','description'];
   if(!editable.some(key=>key in payload))fail('form','missing_change');
   if('completion_at' in payload)fail('completion_at','completion_required');
   if('title' in payload)entity.title=text(payload.title,'title',{required:true,trim:true});if('description' in payload)entity.description=text(payload.description,'description');
   if('icon' in payload){if(!ICONS.includes(payload.icon))fail('icon');entity.icon=payload.icon;}if('next_action' in payload)entity.next_action=text(payload.next_action,'next_action');
   const changedFields=editable.filter(key=>key in payload);eventAction=changedFields.length===1&&changedFields[0]==='icon'?'icon_updated':changedFields.length===1&&changedFields[0]==='next_action'?'next_action_updated':entityType+'_updated';
  }
  if(action!=='notes')entity.updated_at=now;
 }
 if(project)project.updated_at=now;
 const details={entity_type:entityType,entity_id:entity.id??null,title:entity.title??null,before,after:structuredClone(entity),...extra};
 if(project)details.project_title=project.title;if(goal)details.goal_title=goal.title;
 state.entries.push({id:newId(),project_id:project?.id??null,goal_id:goal?.id??null,step_id:step?.id??null,kind,action:eventAction,text:reason,agent_name:helper,occurred_at:occurred,recorded_at:now,details,request_id:payload.request_id});
 state.revision++;state.demo_mode=false;
 return {ok:true,revision:state.revision,data:state,entity_id:resultId??entity.id??null};
}

export function validateState(input){
 keys(input,['revision','settings','demo_mode','projects','goals','steps','entries'],'data');
 if(!Number.isSafeInteger(input.revision)||input.revision<0)fail('revision');keys(input.settings,['language'],'settings');if(!['en','ar'].includes(input.settings.language))fail('language');
 if(input.demo_mode!==undefined&&input.demo_mode!==false)fail('demo_mode');
 const seen=new Set(),requests=new Set();
 for(const table of ['projects','goals','steps','entries']){
  if(!Array.isArray(input[table]))fail(table);
  for(const item of input[table]){
   if(!object(item))fail(table);uuid(item.id,'id');if(seen.has(item.id))fail('id','duplicate');seen.add(item.id);
   if(table==='entries'){
    keys(item,['id','project_id','goal_id','step_id','kind','action','text','agent_name','occurred_at','recorded_at','details','request_id'],'entry');
    if(!['note','issue','summary','event'].includes(item.kind))fail('kind');text(item.text,'text');if(item.action!==null)text(item.action,'action');if(item.agent_name!==null)text(item.agent_name,'agent_name');instant(item.occurred_at,'occurred_at');instant(item.recorded_at,'recorded_at');if(!object(item.details))fail('details');
    if(item.request_id!==null){uuid(item.request_id,'request_id');if(requests.has(item.request_id))fail('request_id','duplicate');requests.add(item.request_id);}
   }else{
    keys(item,['id','title','description','status','due_date','position','created_at','updated_at',...(table==='projects'?['next_action','pause_reason','icon']:table==='goals'?['project_id','completed_at']:['goal_id','planned_for','completed_at','archived_at'])],table);
    text(item.title,'title',{required:true});text(item.description,'description');if(!Number.isSafeInteger(item.position)||item.position<0)fail('position');instant(item.created_at,'created_at');instant(item.updated_at,'updated_at');day(item.due_date);
    if(!(table==='projects'?['active','paused']:table==='goals'?['active','completed']:['pending','completed','deferred']).includes(item.status))fail('status');
    if(table==='projects'){if(!ICONS.includes(item.icon))fail('icon');text(item.next_action,'next_action');text(item.pause_reason,'pause_reason');}
    else{if(item.completed_at!==null)instant(item.completed_at,'completed_at');if(item.status==='completed'&&!item.completed_at)fail('completed_at');}
    if(table==='steps'){day(item.planned_for,'planned_for');if(item.archived_at!==null)instant(item.archived_at,'archived_at');}
   }
  }
 }
 for(const goal of input.goals)find(input,'projects',goal.project_id,'project_id');
 for(const step of input.steps)find(input,'goals',step.goal_id,'goal_id');
 for(const entry of input.entries){
  const project=entry.project_id===null?null:find(input,'projects',entry.project_id,'project_id');
  if(!project&&(entry.goal_id!==null||entry.step_id!==null||entry.kind!=='event'||entry.action!=='language_changed'))fail('project_id');
  if(entry.goal_id!==null&&find(input,'goals',entry.goal_id,'goal_id').project_id!==project?.id)fail('goal_id');
  if(entry.step_id!==null){const step=find(input,'steps',entry.step_id,'step_id');if(find(input,'goals',step.goal_id).project_id!==project?.id)fail('step_id');}
  if(entry.details.entity_id!==null&&entry.details.entity_id!==undefined){const table={project:'projects',goal:'goals',step:'steps'}[entry.details.entity_type];if(!table)fail('details');const entity=find(input,table,entry.details.entity_id);const projectId=table==='projects'?entity.id:table==='goals'?entity.project_id:find(input,'goals',entity.goal_id).project_id;if(projectId!==project?.id)fail('details');}
 }
 return structuredClone({...input,demo_mode:false});
}
export function makeBackup(state,now=new Date().toISOString()){return {format:'work-tracker',version:1,exported_at:now,data:validateState(state)};}
export function inspectBackup(input){
 let parsed;try{parsed=typeof input==='string'?JSON.parse(input):input;}catch{throw new ApiError('invalid_backup');}
 try{keys(parsed,['format','version','exported_at','data'],'backup');if(parsed.format!=='work-tracker'||parsed.version!==1)fail('version');instant(parsed.exported_at,'exported_at');const data=validateState(parsed.data);return {backup:{format:'work-tracker',version:1,exported_at:parsed.exported_at,data},exported_at:parsed.exported_at,counts:Object.fromEntries(['projects','goals','steps','entries'].map(k=>[k,data[k].length]))};}catch{throw new ApiError('invalid_backup');}
}
export function prepareRestore(current,backup,expectedRevision){
 if(expectedRevision!==current.revision)throw new ApiError('stale_revision',{},409);
 if(current.revision>=Number.MAX_SAFE_INTEGER)throw new ApiError('save_failed');
 const checked=inspectBackup(backup);const restored=checked.backup.data;restored.revision=current.revision+1;
 return {data:restored,safety:makeBackup(current)};
}
