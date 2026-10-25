import {t, setLanguage, getLanguage} from './i18n.js';
import {readState, mutate, ApiError} from './api.js';
import {formatDate, localDateTimeNow} from './dates.js';
import {stepProgress, goalCounts, projectIcons, projectIconName} from './progress.js';
import {el, textNode, icon, button, badge, heading, empty, activityList, eventDetails} from './render.js';

const previewData = window.WORK_TRACKER_PREVIEW || null;
let state = null;
let currentProject = null;
let pendingGoalFocus = null;
let dirty = false;
let saving = false;
let lastPayload = null;
let lastRequestId = null;
let lastFocus = null;
let modalBaseline = '';
const main = document.getElementById('main');
const editor = document.getElementById('editor');
let toastTimer;

// #main is an in-page destination, not a workspace route. Keep the project hash.
document.querySelector('.skip-link').addEventListener('click',event=>{
 event.preventDefault();
 main.focus({preventScroll:true});
 main.scrollIntoView({block:'start'});
});

function announce(message){const area=document.getElementById('toast');area.textContent=message;area.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{area.hidden=true;},5000);}
function openProject(id){location.hash=`project/${id}`;}
function projectGoals(id){return state.goals.filter(g=>g.project_id===id).sort((a,b)=>a.position-b.position);}
function goalSteps(id){return state.steps.filter(s=>s.goal_id===id&&!s.archived_at).sort((a,b)=>a.position-b.position);}
function projectSteps(id){const ids=new Set(projectGoals(id).map(g=>g.id));return state.steps.filter(s=>ids.has(s.goal_id));}
function achievedSteps(projectId=null){const ids=new Set();for(const e of state.entries){if(projectId && e.project_id!==projectId)continue;const d=eventDetails(e);if(e.action==='step_completed')ids.add(d.entity_id || e.step_id);}return ids.size;}
function formString(){const form=editor.querySelector('form');return form?JSON.stringify([...new FormData(form)]):'';}
function trackDraft(){dirty=formString()!==modalBaseline;}
function closeEditor(force=false){if(saving)return;if(!force&&dirty&&!window.confirm(t('discard')))return;editor.close();editor.classList.remove('goals-dialog');dirty=false;lastPayload=null;lastRequestId=null;if(lastFocus?.isConnected)lastFocus.focus();}
editor.addEventListener('cancel',event=>{event.preventDefault();closeEditor();});
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});

function renderHeader(){
 const sidebar=document.getElementById('workspace-sidebar');sidebar.replaceChildren();
 const brand=el('a','brand-link');brand.href='#overview';const mark=el('span','brand-icon');mark.append(icon('check'));brand.append(mark,el('span','brand-word',t('brand')));sidebar.append(brand,el('p','sidebar-label',t('workspace')));
 const nav=el('nav','sidebar-nav');nav.setAttribute('aria-label',t('workspace'));
 const overview=el('a',`sidebar-link ${currentProject?'':'selected'}`);overview.href='#overview';overview.append(icon('grid'),el('span','',t('overview')));if(!currentProject)overview.setAttribute('aria-current','page');nav.append(overview);
 const projects=button(t('projects'),()=>{if(currentProject){location.hash='overview';}else{document.getElementById('projects')?.scrollIntoView();}},'sidebar-link','folder');projects.append(el('span','sidebar-count',state.projects.length));nav.append(projects);
 nav.append(button(t('historyNav'),()=>document.getElementById('progress')?.scrollIntoView(),'sidebar-link','clock'));sidebar.append(nav,el('p','sidebar-label projects-label',t('yourProjects')));
 const links=el('nav','sidebar-projects');links.setAttribute('aria-label',t('yourProjects'));
 for(const [i,project] of state.projects.slice().sort((a,b)=>a.position-b.position).entries()){
  const link=el('a',`sidebar-link project-shortcut tone-${i%3} ${currentProject?.id===project.id?'selected':''}`);link.href=`#project/${project.id}`;link.append(icon(projectIconName(project)),textNode('span','sidebar-project-name',project.title));if(currentProject?.id===project.id)link.setAttribute('aria-current','page');links.append(link);
 }
 sidebar.append(links);const local=el('div','sidebar-storage');local.append(icon(previewData?'note':'folder'));const localText=el('div');localText.append(el('strong','',t(previewData?'previewShort':'local')),el('p','',t(previewData?'previewSidebar':'localSidebar')));local.append(localText);sidebar.append(local);
 const header=document.getElementById('app-header');header.replaceChildren();const bar=el('div','header-inner');const trail=el('nav','breadcrumb');trail.setAttribute('aria-label',t('navigation'));const home=el('a','',t('brand'));home.href='#overview';trail.append(home,el('span','breadcrumb-divider','/'),textNode('span','breadcrumb-current',currentProject?.title||t('overview')));
 const end=el('div','header-end');const lang=button(getLanguage()==='en'?'العربية':'English',()=>changeLanguage(),'language-button','globe');lang.lang=getLanguage()==='en'?'ar':'en';end.append(lang);bar.append(trail,end);header.append(bar);
 document.querySelector('.skip-link').textContent=t('skip');
 const preview=document.getElementById('preview-notice');preview.hidden=!previewData&&!state.demo_mode;
 if(!preview.hidden){preview.className='preview-strip';preview.replaceChildren(el('strong','',t(previewData?'previewShort':'demo')),el('span','',t(previewData?'previewNote':'demoHint')));}
 const footer=document.getElementById('app-footer');footer.replaceChildren(el('span','footer-brand',t('footer')),el('span','',t('footerHint')));
}
function stat(label,count,symbol,extra='',onClick=null){const card=el(onClick?'button':'div',onClick?'stat stat-button':'stat');if(onClick){card.type='button';card.addEventListener('click',onClick);card.setAttribute('aria-haspopup','dialog');}const marker=el('div','stat-symbol');marker.append(icon(symbol));const text=el('div','stat-label');text.append(el('span','',label),el('strong','stat-value',count));if(extra)text.append(el('span','stat-sub',extra));card.append(marker,text);return card;}
function renderOverview(){
 const hero=el('section','workspace-hero');const intro=el('div');intro.append(el('p','workspace-date',new Intl.DateTimeFormat(getLanguage()==='ar'?'ar-KW':'en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric',calendar:'gregory'}).format(new Date())),el('h1','',t('overview')));hero.append(intro,button(t('addProject'),()=>showCreate('project'),'button primary','plus'));
 const stats=el('section','stats-row');stats.setAttribute('aria-label',t('overview'));stats.append(stat(t('ongoing'),state.projects.length,'folder'),stat(t('activeGoals'),goalCounts(state.goals,state.projects).active,'target',t('viewAllGoals'),showGoals),stat(t('stepsDone'),achievedSteps(),'check',t('allTime')));
 const body=el('div','overview-grid');const left=el('div','overview-primary');const projects=el('section','project-section');projects.id='projects';projects.append(heading(t('yourProjects'),t('projectsSub'),badge(t('projectCount',{n:state.projects.length}),'neutral')));
 if(!state.projects.length){projects.append(empty(t('emptyTitle'),t('emptyBody'),button(t('firstProject'),()=>showCreate('project'),'button primary','plus')));}else{
  const grid=el('div','projects-grid');for(const [i,p] of state.projects.slice().sort((a,b)=>a.position-b.position).entries())grid.append(projectCard(p,i));projects.append(grid);
 }
 const recent=el('section','recent-section');recent.id='progress';recent.append(heading(t('progress'),t('progressSub')));const history=el('div','surface recent-surface');history.append(activityList(state.entries,state,{limit:6,showProject:true}));recent.append(history);left.append(projects,recent);
 const aside=el('aside','next-panel');const asideTop=el('div','next-panel-heading');const mark=el('div','next-mark');mark.append(icon('spark'));asideTop.append(mark,el('h2','',t('pickUp')),el('p','',t('pickUpSub')));aside.append(asideTop);
 const nextProjects=state.projects.filter(p=>p.status!=='paused'&&p.next_action);
 if(!nextProjects.length)aside.append(el('p','next-list-empty',t('noNextActions')));
 for(const [i,p] of nextProjects.entries()){const card=el('a','next-card');card.href=`#project/${p.id}`;const top=el('div','next-card-top');top.append(el('span','next-index',String(i+1).padStart(2,'0')),icon('arrow'));card.append(top,textNode('h3','',p.next_action),textNode('span','next-project',p.title));aside.append(card);}
 const asideFoot=el('div','next-panel-footer');asideFoot.append(icon('leaf'),el('span','',t('footer')));aside.append(asideFoot);
 body.append(left,aside);main.append(hero,stats,body);
}
function projectCard(project,index){
 const card=el('article',`project-card tone-${index%3}`);const top=el('div','project-card-top');const mark=projectIconButton(project);top.append(mark,badge(t(project.status),project.status));
 const link=el('a','project-title-link');link.href=`#project/${project.id}`;link.append(textNode('h3','',project.title));const desc=textNode('p','project-description',project.description || t('noContext'));
 const meta=el('div','project-counts');const goals=el('span');goals.append(icon('target'),el('span','',t('goalsCount',{n:projectGoals(project.id).length})));const done=el('span');done.append(icon('check'),el('span','',t('completedCount',{n:achievedSteps(project.id)})));meta.append(goals,done);
 const foot=el('div','project-card-bottom');foot.append(el('time','',t('updated',{date:formatDate(project.updated_at)})),button(t('openProject'),()=>openProject(project.id),'button text-button card-open','arrow'));foot.querySelector('button').setAttribute('aria-label',`${t('openProject')}: ${project.title}`);
 card.append(top,link,desc,meta,foot);return card;
}
function renderProject(project){
 const back=el('a','back-link');back.href='#overview';back.append(icon('back'),el('span','',t('back')));main.append(back);
 const hero=el('section','project-hero');const intro=el('div');const label=el('div','project-eyebrow');label.append(projectIconButton(project),el('p','eyebrow',t('projects')),badge(t(project.status),project.status));intro.append(label,textNode('h1','',project.title));if(project.description)intro.append(textNode('p','hero-subtitle',project.description));hero.append(intro,button(t('addGoal'),()=>showCreate('goal',{project_id:project.id}),'button primary','plus'));main.append(hero);
 const content=el('div','project-layout');const goals=el('section','project-goals');goals.append(heading(t('goals'),t('goalsSub')));
 if(previewData){const hint=el('p','structure-hint');hint.append(icon('target'),el('span','',t('structureHint')));goals.append(hint);}
 const list=projectGoals(project.id);if(!list.length)goals.append(empty(t('noGoals'),t('noGoalsBody'),button(t('addGoal'),()=>showCreate('goal',{project_id:project.id}),'button secondary','plus'),'target'));
 for(const [i,g] of list.entries())goals.append(goalCard(g,i));
 const activity=el('section','project-activity');activity.id='progress';activity.append(heading(t('activity'),t('activitySub')));const panel=el('div','surface');panel.append(activityList(state.entries.filter(e=>e.project_id===project.id),state));activity.append(panel);
 const aside=el('aside','project-aside');const next=el('section','next-action-box');const nextLabel=el('div','aside-label');nextLabel.append(icon('arrow'),el('span','',t('nextAction')));next.append(nextLabel,textNode('p',project.next_action?'next-action-text':'next-action-placeholder',project.next_action||t('nextEmpty')),button(t(project.next_action?'editNext':'setNext'),()=>showNext(project),'button next-edit','edit'));
 const context=el('section','context-card');context.append(el('p','eyebrow',t('context')),el('h3','',t('purpose')),textNode('p','context-description',project.description||t('noContext')));const achievement=el('div','context-achievement');achievement.append(icon('check'),el('span','',t('completedCount',{n:achievedSteps(project.id)})));context.append(achievement);aside.append(next,context);content.append(goals,aside,activity);main.append(content);
}
function goalCard(goal,index){
 const details=el('details','goal-card');details.open=true;details.id=`goal-${goal.id}`;
 const summary=el('summary','goal-summary');const number=el('span','goal-number',String(index+1).padStart(2,'0'));
 const title=el('div','goal-title');title.append(textNode('h3','',goal.title));const steps=goalSteps(goal.id);
 title.append(el('span','goal-meta',t('completedOf',{done:steps.filter(s=>s.status==='completed').length,total:steps.length})));
 summary.append(number,title,el('span','chevron','⌄'));details.append(summary);
 const body=el('div','goal-body');if(goal.description)body.append(textNode('p','goal-description',goal.description));
 if(!steps.length)body.append(el('p','empty-steps',t('noSteps')));
 const list=el('ul','steps-list');for(const step of steps)list.append(stepRow(step));body.append(list);
 const removed=state.steps.filter(s=>s.goal_id===goal.id&&s.archived_at).sort((a,b)=>a.position-b.position);
 if(removed.length){
  const archive=el('details','removed-steps');const trigger=el('summary','',`${t('removedSteps')} (${removed.length})`);
  const removedList=el('ul','steps-list');for(const step of removed)removedList.append(stepRow(step));
  archive.append(trigger,el('p','section-sub',t('removedHint')),removedList);body.append(archive);
 }
 const foot=el('div','goal-footer');foot.append(button(t('addStep'),()=>showCreate('step',{goal_id:goal.id}),'button text-button','plus'));
 const rename=button(t('editGoalName'),()=>showRename('goal',goal),'button text-button','edit');rename.setAttribute('aria-label',`${t('editGoalName')}: ${goal.title}`);foot.append(rename);
 body.append(foot);if(previewData)body.append(contextNotes('goal',goal));details.append(body);return details;
}
function stepRow(step){
 const removed=!!step.archived_at,done=step.status==='completed';
 const row=el('li',`step-row ${done?'is-done':''} ${removed?'is-removed':''}`);
 const check=button('',removed||done?null:()=>showCompletion(step),'step-toggle',removed?'archive':done?'check':null);
 check.setAttribute('aria-label',`${t(removed?'removed':done?'completed':'completeStep')}: ${step.title}`);check.disabled=removed||done;
 const text=el('div','step-content');const stepTitle=button(step.title,()=>showContextNote('step',step),'step-title step-title-button');
 stepTitle.dir='auto';stepTitle.setAttribute('aria-label',`${t('addNote')}: ${step.title}`);text.append(stepTitle);
 if(step.description)text.append(textNode('p','step-description',step.description));
 if(step.completed_at)text.append(el('span','completion-date',t('completedOn',{date:formatDate(step.completed_at,true)})));
 if(removed)text.append(el('span','completion-date',t('removedOn',{date:formatDate(step.archived_at,true)})));
 text.append(contextNotes('step',step));row.append(check,text);
 const side=el('div','step-side');if(done)side.append(badge(t('completed'),'completed'));
 if(removed){const restore=button(t('restoreStep'),()=>showRestoration(step),'button text-button','back');restore.setAttribute('aria-label',`${t('restoreStep')}: ${step.title}`);side.append(restore);}
 {const menu=el('details','step-menu');const trigger=el('summary','','···');trigger.setAttribute('aria-label',`${t('stepOptions')}: ${step.title}`);
  const popover=el('div','step-menu-popover');popover.append(button(t('editStepName'),()=>{menu.open=false;showRename('step',step);},'button text-button','edit'),button(t('moveStep'),()=>{menu.open=false;showMove(step);},'button text-button','arrow'));if(!removed)popover.append(button(t('removeStep'),()=>{menu.open=false;showRemoval(step);},'button text-button','archive'));menu.append(trigger,popover);side.append(menu);}
 row.append(side);return row;
}

// Step notes work in the live app. Other contextual entry types remain preview-only.
function contextNotes(level,item){
 const isStep=level==='step';
 const entries=state.entries.filter(e=>['note','issue','summary'].includes(e.kind) && (isStep?e.step_id===item.id:e.goal_id===item.id&&!e.step_id)).slice().sort((a,b)=>a.occurred_at.localeCompare(b.occurred_at)||a.recorded_at.localeCompare(b.recorded_at));
 const disclosure=el('details',`context-disclosure ${isStep?'step-context':'goal-context'}`);
 disclosure.open=entries.length>0;
 const summary=el('summary');summary.append(icon('note'),el('span','',t('notesUpdates')),el('span','context-count',entries.length));disclosure.append(summary);
 const log=el('div','context-log');log.append(el('p','context-log-label',t(isStep?'noteStep':'noteGoal')));
 if(!entries.length)log.append(el('p','context-empty',t('noteEmpty')));
 for(const entry of entries){const note=el('article','context-note');const top=el('div','context-note-head');top.append(el('span',`context-note-kind ${entry.kind}`,t(entry.kind==='issue'?'issueKind':entry.kind==='summary'?'summaryKind':'noteKind')));const date=el('time','',formatDate(entry.occurred_at,true));date.dateTime=entry.occurred_at;top.append(date);note.append(top,textNode('p','context-note-body',entry.text));if(entry.agent_name)note.append(textNode('span','context-note-helper',t('by',{name:entry.agent_name})));log.append(note);}
 log.append(button(t('addNote'),()=>showContextNote(level,item),'button text-button','plus'));disclosure.append(log);return disclosure;
}
function showContextNote(level,item){
 if(!previewData && level!=='step')return;
 const m=modal(t('newNote'),t('newNoteHint'),t('save'),values=>{
  if(previewData)throw new ApiError('previewSave');
  const payload={text:values.text,agent_name:values.agent_name};
  if(values.occurred_at){const when=new Date(values.occurred_at);if(Number.isNaN(when.getTime()))throw new ApiError('invalid_input',{occurred_at:'invalid'});payload.occurred_at=when.toISOString();}
  return submitMutation(`/api/steps/${item.id}/notes`,'POST',payload);
 });
 const target=el('div','note-target',t(level==='step'?'noteStep':'noteGoal'));target.append(textNode('strong','',item.title));m.fields.append(target);
 if(previewData){const types=el('div','field');const label=el('label','field-label',t('noteType'));label.htmlFor='field-kind';const select=el('select','input note-type-select');select.name='kind';select.id='field-kind';for(const [value,key] of [['note','noteKind'],['issue','issueKind'],['summary','summaryKind']]){const option=el('option','',t(key));option.value=value;select.append(option);}types.append(label,select);m.fields.append(types);}
 field(m.fields,'text',t('noteBody'),{required:true,multiline:true,placeholder:t('noteHint')});field(m.fields,'occurred_at',t('noteDate'),{value:localDateTimeNow(),type:'datetime-local'});field(m.fields,'agent_name',t('helper'),{hint:t('helperHint')});if(previewData)m.fields.append(el('p','note-preview-hint',t('notePreviewHint')));m.open();
}
function showRename(type,item){
 const m=modal(t(type==='goal'?'editGoalName':'editStepName'),t('renameHint'),t('save'),values=>submitMutation(`/api/${type}s/${item.id}/title`,'PATCH',values));
 field(m.fields,'title',t(`${type}Title`),{value:item.title,required:true});field(m.fields,'reason',t('changeReason'),{multiline:true});m.open();
}
function showMove(step){
 const source=state.goals.find(g=>g.id===step.goal_id);const targets=projectGoals(source.project_id).filter(g=>g.id!==source.id);
 if(!targets.length){const m=modal(t('moveStep'),t('noMoveGoals'),t('close'),async()=>{});m.form.querySelector('[type=submit]').hidden=true;m.fields.append(textNode('p','completion-step-title',step.title));m.open();return;}
 const m=modal(t('moveStep'),t('moveHint'),t('moveStep'),values=>submitMutation(`/api/steps/${step.id}/move`,'POST',values));
 m.fields.append(textNode('p','completion-step-title',step.title),textNode('p','section-sub',t('currentGoal',{title:source.title})));
 const wrap=el('div','field'),label=el('label','field-label',t('destinationGoal'));label.htmlFor='field-goal_id';
 const select=el('select','input');select.id='field-goal_id';select.name='goal_id';select.required=true;select.setAttribute('aria-describedby','error-goal_id');
 const placeholder=el('option','',t('chooseGoal'));placeholder.value='';select.append(placeholder);
 for(const goal of targets){const option=textNode('option','',goal.title);option.value=goal.id;select.append(option);}
 const error=el('span','field-error');error.id='error-goal_id';wrap.append(label,select,error);m.fields.append(wrap);
 field(m.fields,'reason',t('changeReason'),{multiline:true});m.open();
}
function showRemoval(step){
 const m=modal(t('removeTitle'),t('removeHint'),t('removeStep'),values=>submitMutation(`/api/steps/${step.id}/archive`,'POST',values));
 m.fields.append(textNode('p','completion-step-title',step.title));field(m.fields,'reason',t('removeReason'),{multiline:true});m.open();
}
function showRestoration(step){
 const m=modal(t('restoreTitle'),t('restoreHint'),t('restoreStep'),values=>submitMutation(`/api/steps/${step.id}/restore`,'POST',values));
 m.fields.append(textNode('p','completion-step-title',step.title));field(m.fields,'reason',t('reason'),{multiline:true});m.open();
}
function projectIconButton(project){
 const b=button('',()=>showProjectIcon(project),'project-icon project-icon-button',projectIconName(project));
 b.setAttribute('aria-label',`${t('changeIcon')}: ${project.title}`);b.title=t('changeIcon');return b;
}
function iconPicker(fields,value='folder'){
 const group=el('fieldset','icon-picker');group.append(el('legend','field-label',t('projectIcon')));
 const choices=el('div','icon-choices');
 for(const name of projectIcons){const label=el('label','icon-choice');const input=el('input');input.type='radio';input.name='icon';input.value=name;input.checked=name===value;
  const visual=el('span','icon-choice-face');visual.append(icon(name),el('span','',t(`icon_${name}`)));label.append(input,visual);choices.append(label);}
 group.append(choices);fields.append(group);
}
function showProjectIcon(project){
 const m=modal(t('changeIcon'),t('iconHint'),t('save'),values=>submitMutation(`/api/projects/${project.id}`,'PATCH',values));
 m.fields.append(textNode('p','completion-step-title',project.title));iconPicker(m.fields,projectIconName(project));m.open();
}
function progressRing(progress){
 const ns='http://www.w3.org/2000/svg';const svg=document.createElementNS(ns,'svg');svg.classList.add('goal-ring');svg.setAttribute('viewBox','0 0 64 64');svg.setAttribute('role','img');
 svg.setAttribute('aria-label',progress.total?t('completedOf',{done:progress.done,total:progress.total}):t('noStepsPlanned'));
 for(const [className,amount] of [['ring-track',100],['ring-fill',progress.percent]]){const circle=document.createElementNS(ns,'circle');
  for(const [name,value] of Object.entries({cx:32,cy:32,r:27,pathLength:100,fill:'none','stroke-width':5,'stroke-dasharray':`${amount} 100`,transform:'rotate(-90 32 32)'}))circle.setAttribute(name,value);
  circle.classList.add(className);svg.append(circle);}
 const number=document.createElementNS(ns,'text');number.setAttribute('x','32');number.setAttribute('y','36');number.setAttribute('text-anchor','middle');number.textContent=progress.total?`${progress.done}/${progress.total}`:'—';svg.append(number);return svg;
}
function showGoals(){
 if(editor.open)closeEditor(true);lastFocus=document.activeElement;dirty=false;editor.replaceChildren();editor.classList.add('goals-dialog');
 const close=button(t('close'),()=>closeEditor(),'button secondary');const head=el('div','goals-dialog-head');const title=el('h2','',t('allGoals'));title.id='editor-title';head.append(title,close);editor.append(head);
 const counts=goalCounts(state.goals,state.projects);editor.append(el('p','modal-intro',t('goalsOverviewHint')));
 const totals=el('div','goal-totals');for(const [key,label] of [['total','totalGoals'],['active','activeGoals'],['completed','completedGoals'],['paused','pausedGoals']])totals.append(el('span','badge neutral',`${t(label)}: ${counts[key]}`));editor.append(totals);
 const list=el('div','goals-overview-list');
 for(const goal of state.goals){const project=state.projects.find(p=>p.id===goal.project_id);if(!project)continue;
  const progress=stepProgress(state.steps,goal.id);const card=el('article','goal-progress-card');const body=el('div','goal-progress-body');
  const go=button(goal.title,()=>{closeEditor(true);openGoal(project.id,goal.id);},'goal-progress-link');go.dir='auto';body.append(go,textNode('p','goal-project-name',project.title));
  const meta=el('div','goal-progress-meta');meta.append(badge(t(goal.status==='completed'?'completed':project.status==='paused'?'paused':'active'),goal.status==='completed'?'completed':'neutral'));
  meta.append(el('span','',progress.total?t('stepsRemaining',{n:progress.remaining}):t('noStepsPlanned')));body.append(meta);
  if(progress.total&&progress.remaining===0&&goal.status!=='completed')body.append(el('p','goal-ready-hint',t('stepsReady')));
  card.append(progressRing(progress),body);list.append(card);
 }
 if(!state.goals.length)list.append(empty(t('noGoals'),t('noGoalsBody')));editor.append(list);editor.showModal();close.focus();
}
function openGoal(projectId,goalId){
 pendingGoalFocus=goalId;if(location.hash===`#project/${projectId}`){render();focusRequestedGoal();}else location.hash=`project/${projectId}`;
}

function render(){
 if(!state)return;const match=location.hash.match(/^#project\/([^/]+)$/);currentProject=match?state.projects.find(p=>p.id===decodeURIComponent(match[1])):null;renderHeader();main.replaceChildren();if(match&&!currentProject){main.append(empty(t('not_found'),'',button(t('back'),()=>{location.hash='overview';},'button primary')));return;}
 if(currentProject)renderProject(currentProject);else renderOverview();document.title=currentProject?`${currentProject.title} · Work Tracker`:'Work Tracker';
}
function focusRequestedGoal(){const target=document.getElementById(`goal-${pendingGoalFocus}`);pendingGoalFocus=null;target?.scrollIntoView({block:'center'});target?.querySelector('summary')?.focus();}
window.addEventListener('hashchange',()=>{render();if(pendingGoalFocus)focusRequestedGoal();else window.scrollTo({top:0,behavior:'instant'});});

function field(form,name,label,{value='',type='text',required=false,hint='',placeholder='',multiline=false}={}){
 const wrap=el('div','field');const labelNode=el('label','field-label',label);labelNode.htmlFor=`field-${name}`;if(!required)labelNode.append(el('span','optional',t('optional')));
 const input=el(multiline?'textarea':'input','input');input.id=`field-${name}`;input.name=name;input.value=value;input.dir='auto';if(!multiline)input.type=type;else input.rows=3;
 if(required)input.required=true;if(placeholder)input.placeholder=placeholder;
 const error=el('span','field-error');error.id=`error-${name}`;input.setAttribute('aria-describedby',error.id);
 wrap.append(labelNode,input);if(hint){const hintNode=el('span','field-hint',hint);hintNode.id=`hint-${name}`;input.setAttribute('aria-describedby',`${hintNode.id} ${error.id}`);wrap.append(hintNode);}wrap.append(error);form.append(wrap);return input;
}
function modal(title,description,submitLabel,onSubmit){
 if(editor.open)closeEditor(true);lastFocus=document.activeElement;editor.replaceChildren();lastPayload=null;lastRequestId=null;
 const head=el('div','modal-head');const mark=el('div','modal-icon');mark.append(icon('plus'));const close=button(t('close'),()=>closeEditor(),'icon-button modal-close','close');close.setAttribute('aria-label',t('close'));head.append(mark,close);
 const h=el('h2','',title);h.id='editor-title';const intro=el('p','modal-intro',description);
 const form=el('form','editor-form');form.noValidate=true;const fields=el('div','form-fields');if(previewData)form.append(el('p','modal-preview-note',t('previewNote')));form.append(fields);
 const error=el('div','form-error');error.setAttribute('role','alert');error.hidden=true;
 const actions=el('div','form-actions');const submit=el('button','button primary',submitLabel);submit.type='submit';actions.append(button(t('cancel'),()=>closeEditor(),'button secondary'),submit);form.append(error,actions);
 editor.append(head,h,intro,form);form.addEventListener('input',trackDraft);form.addEventListener('change',trackDraft);
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(saving)return;
  form.querySelectorAll('.field-error').forEach(n=>n.textContent='');form.querySelectorAll('[aria-invalid]').forEach(n=>n.removeAttribute('aria-invalid'));error.hidden=true;error.replaceChildren();
  for(const input of form.querySelectorAll('[required]')){if(!input.value.trim()){input.setAttribute('aria-invalid','true');document.getElementById(`error-${input.name}`).textContent=t(input.name==='text'?'requiredNote':input.name==='goal_id'?'chooseGoal':'required');input.focus();return;}}
  if(previewData){error.textContent=t('previewSave');error.hidden=false;return;}
  saving=true;submit.disabled=true;submit.textContent=t('saving');form.querySelectorAll('input,textarea,select,button').forEach(n=>n.disabled=true);
  try {await onSubmit(Object.fromEntries(FormDataValues(form)));saving=false;closeEditor(true);render();announce(t('saved'));}
  catch(e){error.hidden=false;error.append(el('p','',t(e.code||'save_failed')));for(const [name] of Object.entries(e.fields||{})){const input=form.elements.namedItem(name);const label=document.getElementById(`error-${name}`);if(input){input.setAttribute('aria-invalid','true');if(label)label.textContent=t(name==='completion_at'?'badDate':name==='occurred_at'?'badNoteDate':'invalid_input');}}
   if(e.code==='stale_revision'||e.code==='request_conflict'){error.append(button(t('reloadLatest'),async()=>{try{state=await readState();lastPayload=null;lastRequestId=null;render();error.replaceChildren(el('p','',t('loadedLatest')));}catch{error.replaceChildren(el('p','',t('connection')));}},'button secondary'));}
  }finally{saving=false;form.querySelectorAll('input,textarea,select,button').forEach(n=>n.disabled=false);submit.textContent=submitLabel;}
 });
 return {form,fields,open:()=>{editor.showModal();modalBaseline=formString();dirty=false;const focus=fields.querySelector('input:not([type=radio]),textarea,select')||fields.querySelector('input[type=radio]:checked');focus?.focus();}};
}
// Read disabled inputs too: the form is locked while its save is in flight.
function FormDataValues(form){return [...form.elements].filter(n=>n.name && !['button','submit'].includes(n.type) && (!['radio','checkbox'].includes(n.type)||n.checked)).map(n=>[n.name,n.value]);}
async function submitMutation(path,method,values){
 const key=JSON.stringify({path,method,values});if(key!==lastPayload){lastRequestId=crypto.randomUUID();lastPayload=key;}
 const result=await mutate(path,method,{...values,expected_revision:state.revision,request_id:lastRequestId});state=result.data;return result;
}
function contextFields(fields){const extra=el('details','form-context');extra.append(el('summary','',t('contextOptional')));const inner=el('div','context-fields');field(inner,'reason',t('reason'),{hint:t('reasonHint'),multiline:true});field(inner,'agent_name',t('helper'),{hint:t('helperHint')});extra.append(inner);fields.append(extra);}
function showCreate(type,parent={}){
 const cap=type[0].toUpperCase()+type.slice(1);const m=modal(t(`new${cap}`),t(`new${cap}Hint`),t(`create${cap}`),async values=>{const result=await submitMutation(`/api/${type}s`,'POST',{...parent,...values});if(type==='project')location.hash=`project/${result.entity_id}`;});
 field(m.fields,'title',t(`${type}Title`),{required:true,placeholder:t('titlePlaceholder')});field(m.fields,'description',t('description'),{multiline:true,placeholder:t('descriptionPlaceholder')});if(type==='project'){field(m.fields,'next_action',t('nextAction'),{placeholder:t('nextPlaceholder')});iconPicker(m.fields);}contextFields(m.fields);m.open();
}
function showNext(project){const m=modal(t('editNext'),t('nextEmpty'),t('save'),values=>submitMutation(`/api/projects/${project.id}`,'PATCH',values));field(m.fields,'next_action',t('nextAction'),{value:project.next_action,multiline:true,placeholder:t('nextPlaceholder')});m.open();}
function showCompletion(step){const m=modal(t('completionTitle'),t('completionHint'),t('markComplete'),values=>{const when=new Date(values.completion_at);if(Number.isNaN(when.getTime()))throw new ApiError('invalid_input',{completion_at:'invalid'});return submitMutation(`/api/steps/${step.id}`,'PATCH',{status:'completed',reason:values.reason,agent_name:values.agent_name,completion_at:when.toISOString()});});
 m.fields.append(textNode('p','completion-step-title',step.title));field(m.fields,'completion_at',t('completionDate'),{value:localDateTimeNow(),type:'datetime-local',required:true});field(m.fields,'reason',t('completionReason'),{multiline:true});field(m.fields,'agent_name',t('helper'),{hint:t('helperHint')});m.open();}
async function changeLanguage(){
 const next=getLanguage()==='en'?'ar':'en';if(editor.open)return;
 if(previewData){setLanguage(next);render();return;}
 try{const result=await mutate('/api/settings','PATCH',{language:next,expected_revision:state.revision,request_id:crypto.randomUUID()});state=result.data;setLanguage(next);render();}catch(e){announce(t(e.code||'save_failed'));}
}
async function boot(){try{state=previewData || await readState();setLanguage(state.settings?.language || 'en');render();}catch{main.replaceChildren(empty(t('loadFailed'),t('connection'),button(t('retry'),boot,'button primary')));}}
boot();
