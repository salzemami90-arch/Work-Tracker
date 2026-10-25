import {t} from './i18n.js';
import {formatDate} from './dates.js';
export function el(tag, className='', text=null){const node=document.createElement(tag);if(className)node.className=className;if(text!==null)node.textContent=String(text);return node;}
export function textNode(tag, className, text){const node=el(tag,className,text);node.dir='auto';return node;}
const shapes={
 chart:['M5 20V10M10 20V4M15 20v-7M20 20V7'],
 award:['M12 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10M8 12l-1 9 5-3 5 3-1-9'],
 document:['M5 3h9l5 5v13H5ZM14 3v6h5M8 13h8M8 17h5'],
 code:['m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16'],
 heart:['M12 21 3.5 12.5C-2 6 7 0 12 7c5-7 14-1 8.5 5.5Z'],
 globe:['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18'],
 archive:['M3 4h18v4H3ZM5 8v12h14V8M10 12h4'],
 note:['M5 3h10l4 4v14H5ZM14 3v5h5M8 12h8M8 16h5'],
 plus:['M12 5v14M5 12h14'],arrow:['M5 12h14m-6-6 6 6-6 6'],back:['M19 12H5m6-6-6 6 6 6'],check:['m5 12 4 4L19 6'],
 grid:['M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z'],leaf:['M20 4c-10-2-17 5-13 12 7 4 14-3 13-12ZM4 20 15 9'],
 target:['M20 12a8 8 0 1 1-8-8','M16 12a4 4 0 1 1-4-4','M12 12 21 3m-6 0h6v6'],
 folder:['M3 7V5h6l2 3h10v11H3Z'],clock:['M12 8v5l3 2','M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0'],
 close:['m6 6 12 12M18 6 6 18'],edit:['m15 4 5 5-11 11H4v-5ZM13 6l5 5'],spark:['m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z'],
 book:['M12 5c-4-3-8-1-9 0v14c3-2 6-2 9 0 3-2 6-2 9 0V5c-3-2-6-2-9 0Zm0 0v14'],
};
export function icon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.6');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');svg.classList.add('icon');for(const d of shapes[name]||shapes.folder){const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',d);svg.append(path);}return svg;}
export function button(label, onClick, className='button', symbol=null){const b=el('button',className);b.type='button';if(symbol)b.append(icon(symbol));b.append(el('span','',label));if(onClick)b.addEventListener('click',onClick);return b;}
export function badge(label, kind='active'){return el('span',`badge ${kind}`,label);}
export function heading(title,sub,action){const wrap=el('div','section-heading');const text=el('div');text.append(el('h2','',title));if(sub)text.append(el('p','section-sub',sub));wrap.append(text);if(action)wrap.append(action);return wrap;}
export function empty(title,body,action=null,symbol='leaf'){const box=el('div','empty-state');const mark=el('div','empty-symbol');mark.append(icon(symbol));box.append(mark,el('h3','',title),el('p','',body));if(action)box.append(action);return box;}
export function eventDetails(entry){if(entry.details)return entry.details;if(typeof entry.details_json==='object')return entry.details_json || {};try{return JSON.parse(entry.details_json||'{}');}catch{return {};}}
export function eventLabel(entry){
 if(['note','issue','summary'].includes(entry.kind))return t(entry.kind==='note'?'noteKind':entry.kind==='issue'?'issueKind':'summaryKind');
 const direct={goal_renamed:'goalRenamed',step_renamed:'stepRenamed',step_moved:'stepMoved',step_archived:'stepRemoved',step_restored:'stepRestored',icon_updated:'iconUpdated',project_updated:'changed'};if(direct[entry.action])return t(direct[entry.action]);
 const detail=eventDetails(entry);const action=(entry.action||'').toLowerCase();const entity=detail.entity_type || detail.entity || '';
 if(action.includes('complet'))return t('stepCompleted');
 if(action.includes('next') || (detail.after?.next_action!==undefined && action.includes('updat')))return t('nextUpdated');
 if(action.includes('creat'))return t(entity==='project'?'createdProject':entity==='goal'?'createdGoal':'createdStep');
 if(action.includes('language')||entity==='settings')return t('settingUpdated');
 return t('changed');
}
export function activityList(entries,state,{limit=null,showProject=false}={}){
 const items=entries.filter(e=>e.project_id).slice().sort((a,b)=>(b.occurred_at||'').localeCompare(a.occurred_at||'') || (b.recorded_at||'').localeCompare(a.recorded_at||''));
 if(!items.length)return empty(t('noActivity'),t('noActivityBody'),null,'clock');
 const list=el('ol','activity-list');
 for(const entry of (limit?items.slice(0,limit):items)){
  const detail=eventDetails(entry);const isDone=(entry.action||'').includes('complet');const item=el('li','activity-item');
  const dot=el('div',`activity-dot ${isDone?'is-complete':''}`);dot.append(icon(isDone?'check':'plus'));
  const body=el('div','activity-body');const line=el('div','activity-line');line.append(el('span','event-action',eventLabel(entry)));
  const title=detail.title || detail.after?.title || detail.entity_title || state.steps.find(s=>s.id===entry.step_id)?.title || state.goals.find(g=>g.id===entry.goal_id)?.title || '';
  if(title)line.append(textNode('span','event-title',title));body.append(line);
  const meta=el('div','activity-meta');if(showProject){const project=state.projects.find(p=>p.id===entry.project_id);if(project)meta.append(textNode('span','project-reference',project.title));}
  const time=el('time','',formatDate(entry.occurred_at,true));time.dateTime=entry.occurred_at;meta.append(time);if(entry.agent_name)meta.append(textNode('span','',t('by',{name:entry.agent_name})));body.append(meta);
  if(['goal_renamed','step_renamed'].includes(entry.action))body.append(textNode('p','event-note',t('renamedFromTo',{before:detail.before?.title||'',after:detail.after?.title||''})));
  if(entry.action==='step_moved')body.append(textNode('p','event-note',t('movedFromTo',{before:detail.source_goal?.title||'',after:detail.destination_goal?.title||''})));
  const reason=entry.text || detail.reason;if(reason)body.append(textNode('p','event-note',reason));
  item.append(dot,body);list.append(item);
 }
 return list;
}
