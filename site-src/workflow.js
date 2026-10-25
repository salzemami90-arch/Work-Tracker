// Flexible plans and contextual records use the existing cards and modal form.
Object.assign(messages.en,{
 editProject:'Edit project',editDetails:'Edit details',pauseProject:'Pause project',resumeProject:'Resume project',pauseReason:'Pause reason',pauseHint:'Planned work is hidden while paused. Deadlines, notes, and achievements remain available.',resumeHint:'Planned work returns using its original dates.',projectPaused:'Project paused',projectResumed:'Project resumed',projectUpdated:'Project updated',goalUpdated:'Goal updated',stepUpdated:'Step updated',
 deferStep:'Defer step',reopenStep:'Reopen step',resumeStep:'Resume step',deferHint:'Remove the planned date while keeping the deadline, notes, and history.',reopenHint:'Return this step to pending work. Earlier achievements and notes remain saved.',stepDeferred:'Step deferred',stepReopened:'Step reopened',stepResumed:'Step resumed',reopened:'Reopened',
 projectOptions:'Project options',goalOptions:'Goal options',goalEarlier:'Earlier in goal list',goalLater:'Later in goal list',moveUp:'Move up',moveDown:'Move down',reorderHint:'Change the display order within the current project or goal.',projectReordered:'Projects reordered',goalReordered:'Goals reordered',stepReordered:'Steps reordered',
 myNotes:'My Notes',projectUpdates:'Project updates',latestSummary:'Latest summary',noSummary:'No summary recorded yet.',addSummary:'Add summary',addUpdate:'Add update',editEntry:'Edit entry',entryEdited:'Entry edited',editEntryHint:'Update this record. Its previous and new contents remain in history.',originalText:'Previous text',updatedText:'Updated text',plannedWeek:'Planned work',weekActivity:'Recorded activity',noPlannedWeek:'No steps planned through the end of this week.',recordedLater:'Recorded {date}',
});
Object.assign(messages.ar,{
 editProject:'تعديل المشروع',editDetails:'تعديل التفاصيل',pauseProject:'إيقاف المشروع مؤقتًا',resumeProject:'استئناف المشروع',pauseReason:'سبب الإيقاف',pauseHint:'تُخفى الأعمال المخططة أثناء الإيقاف. تبقى المواعيد والملاحظات والإنجازات متاحة.',resumeHint:'تعود الأعمال المخططة وفق تواريخها الأصلية.',projectPaused:'تم إيقاف المشروع مؤقتًا',projectResumed:'تم استئناف المشروع',projectUpdated:'تم تحديث المشروع',goalUpdated:'تم تحديث الهدف',stepUpdated:'تم تحديث الخطوة',
 deferStep:'تأجيل الخطوة',reopenStep:'إعادة فتح الخطوة',resumeStep:'استئناف الخطوة',deferHint:'إلغاء تاريخ التنفيذ المخطط مع الاحتفاظ بالموعد النهائي والملاحظات والسجل.',reopenHint:'إعادة الخطوة إلى الأعمال المتبقية مع الاحتفاظ بالإنجازات السابقة والملاحظات.',stepDeferred:'تم تأجيل الخطوة',stepReopened:'تمت إعادة فتح الخطوة',stepResumed:'تم استئناف الخطوة',reopened:'أُعيد فتحها',
 projectOptions:'خيارات المشروع',goalOptions:'خيارات الهدف',goalEarlier:'تقديم الهدف في القائمة',goalLater:'تأخير الهدف في القائمة',moveUp:'نقل إلى أعلى',moveDown:'نقل إلى أسفل',reorderHint:'تغيير ترتيب العرض داخل المشروع أو الهدف الحالي.',projectReordered:'تم تغيير ترتيب المشاريع',goalReordered:'تم تغيير ترتيب الأهداف',stepReordered:'تم تغيير ترتيب الخطوات',
 myNotes:'ملاحظاتي',projectUpdates:'تحديثات المشروع',latestSummary:'آخر ملخص',noSummary:'لم يُسجل ملخص بعد.',addSummary:'إضافة ملخص',addUpdate:'إضافة تحديث',editEntry:'تعديل السجل',entryEdited:'تم تعديل السجل',editEntryHint:'تحديث هذا السجل مع الاحتفاظ بالمحتوى السابق والجديد في سجل التقدم.',originalText:'النص السابق',updatedText:'النص المحدّث',plannedWeek:'الأعمال المخططة',weekActivity:'الأنشطة المسجلة',noPlannedWeek:'لا توجد خطوات مخططة حتى نهاية هذا الأسبوع.',recordedLater:'تم التسجيل {date}',
});
function showEntityEdit(type,item){
 const m=modal(t(type==='project'?'editProject':'editDetails'),t('renameHint'),t('save'),values=>submitMutation(`/api/${type}s/${item.id}`,'PATCH',values));
 field(m.fields,'title',t(`${type}Title`),{value:item.title,required:true});
 field(m.fields,'description',t('description'),{value:item.description,multiline:true});
 field(m.fields,'reason',t('changeReason'),{multiline:true});m.open();
}
function showProjectStatus(project){
 const pause=project.status!=='paused';const m=modal(t(pause?'pauseProject':'resumeProject'),t(pause?'pauseHint':'resumeHint'),t('save'),values=>submitMutation(`/api/projects/${project.id}/status`,'PATCH',{...values,status:pause?'paused':'active'}));
 m.fields.append(textNode('p','completion-step-title',project.title));field(m.fields,'reason',t(pause?'pauseReason':'changeReason'),{multiline:true});m.open();
}
function showStepStatus(step,status){
 const label=status==='deferred'?'deferStep':step.status==='completed'?'reopenStep':'resumeStep';
 const m=modal(t(label),t(status==='deferred'?'deferHint':'reopenHint'),t('save'),values=>submitMutation(`/api/steps/${step.id}/status`,'PATCH',{...values,status}));
 m.fields.append(textNode('p','completion-step-title',step.title));field(m.fields,'reason',t('changeReason'),{multiline:true});m.open();
}
function orderControls(type,item){
 const siblings=state[`${type}s`].filter(x=>type==='project'||type==='goal'?type==='project'||x.project_id===item.project_id:x.goal_id===item.goal_id&&!x.archived_at).slice().sort((a,b)=>a.position-b.position);
 const position=siblings.findIndex(x=>x.id===item.id),controls=el('div','order-controls');
 for(const [direction,key,disabled] of [['up','moveUp',position<=0],['down','moveDown',position<0||position===siblings.length-1]]){
  const label=type==='goal'?t(direction==='up'?'goalEarlier':'goalLater'):t(key);
  const b=button(label,()=>{const m=modal(label,t('reorderHint'),t('save'),values=>submitMutation(`/api/${type}s/${item.id}/reorder`,'PATCH',{...values,direction}));m.fields.append(textNode('p','completion-step-title',item.title));field(m.fields,'reason',t('changeReason'),{multiline:true});m.open();},'button text-button');
  b.disabled=disabled;b.setAttribute('aria-label',`${label}: ${item.title}`);controls.append(b);
 }return controls;
}
function entryContext(level,item){
 if(level==='project')return {project_id:item.id};
 const goal=level==='goal'?item:state.goals.find(g=>g.id===item.goal_id);
 return {project_id:goal.project_id,goal_id:goal.id,...(level==='step'?{step_id:item.id}:{})};
}
function contextEntries(level,item){return state.entries.filter(e=>['note','issue','summary'].includes(e.kind)&&(level==='project'?e.project_id===item.id&&!e.goal_id&&!e.step_id:level==='goal'?e.goal_id===item.id&&!e.step_id:e.step_id===item.id)).slice().sort((a,b)=>b.occurred_at.localeCompare(a.occurred_at)||b.recorded_at.localeCompare(a.recorded_at));}
function localDateInput(value){const d=new Date(value);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);}
function showContextNote(level,item,kind='note',entry=null){
 const m=modal(t(entry?'editEntry':'newNote'),t(entry?'editEntryHint':'newNoteHint'),t('save'),values=>{
  const payload={text:values.text,agent_name:values.agent_name};
  if(values.occurred_at){const d=new Date(values.occurred_at);if(Number.isNaN(d.getTime()))throw new ApiError('invalid_input',{occurred_at:'invalid'});payload.occurred_at=entry&&values.occurred_at===localDateInput(entry.occurred_at)?entry.occurred_at:d.toISOString();}
  if(entry)return submitMutation(`/api/entries/${entry.id}`,'PATCH',{...payload,reason:values.reason||''});
  return submitMutation('/api/entries','POST',{...entryContext(level,item),...payload,kind:values.kind});
 });
 m.fields.append(textNode('p','completion-step-title',item.title));
 if(!entry){const wrap=el('div','field'),label=el('label','field-label',t('noteType')),select=el('select','input');select.name='kind';select.id='field-kind';label.htmlFor=select.id;for(const value of ['note','summary','issue']){const option=el('option','',t(`${value}Kind`));option.value=value;option.selected=value===kind;select.append(option);}wrap.append(label,select);m.fields.append(wrap);}
 field(m.fields,'text',t('noteBody'),{value:entry?.text||'',required:true,multiline:true,placeholder:t('noteHint')});
 field(m.fields,'occurred_at',t('noteDate'),{type:'datetime-local',value:entry?localDateInput(entry.occurred_at):localDateTimeNow()});
 field(m.fields,'agent_name',t('helper'),{value:entry?.agent_name||'',hint:t('helperHint')});
 if(entry)field(m.fields,'reason',t('changeReason'),{multiline:true});m.open();
}
function manualEntryCard(entry,level,item){
 const card=el('article','context-note'),head=el('div','context-note-head');head.append(el('span',`context-note-kind ${entry.kind}`,t(`${entry.kind}Kind`)));
 const date=el('time','',formatDate(entry.occurred_at,true));date.dateTime=entry.occurred_at;head.append(date);card.append(head,textNode('p','context-note-body',entry.text));
 if(entry.agent_name)card.append(textNode('p','context-note-helper',t('by',{name:entry.agent_name})));
 if(Math.abs(new Date(entry.recorded_at)-new Date(entry.occurred_at))>60000)card.append(el('p','section-sub',t('recordedLater',{date:formatDate(entry.recorded_at,true)})));
 const edit=button(t('editEntry'),()=>showContextNote(level,item,entry.kind,entry),'button text-button','edit');edit.setAttribute('aria-label',`${t('editEntry')}: ${entry.text.slice(0,60)}`);card.append(edit);return card;
}
function contextNotes(level,item){
 const entries=contextEntries(level,item),details=el('details',`context-disclosure ${level==='step'?'step-context':'goal-context'}`);details.open=entries.length>0;
 const summary=el('summary');summary.append(icon('note'),el('span','',t('notesUpdates')),el('span','context-count',entries.length));details.append(summary);
 const body=el('div','context-log');if(!entries.length)body.append(el('p','context-empty',t('noteEmpty')));
 entries.forEach(e=>body.append(manualEntryCard(e,level,item)));body.append(button(t('addUpdate'),()=>showContextNote(level,item),'button text-button','plus'));details.append(body);return details;
}
function augmentGoal(card,goal){
 const foot=card.querySelector('.goal-footer');foot.append(button(t('editDetails'),()=>showEntityEdit('goal',goal),'button text-button','edit'),orderControls('goal',goal));
 const menu=el('details','step-menu goal-options'),trigger=el('summary','','···'),popover=el('div','step-menu-popover');
 trigger.setAttribute('aria-label',`${t('goalOptions')}: ${goal.title}`);trigger.title=t('goalOptions');
 // Keep Add step visible; move existing actions without changing their handlers.
 for(const control of [...foot.children].slice(1))popover.append(control);
 menu.append(trigger,popover);foot.append(menu);
 popover.addEventListener('click',event=>{const action=event.target.closest('button');if(action&&!action.disabled){trigger.focus();menu.open=false;}},true);
 menu.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){event.preventDefault();event.stopPropagation();menu.open=false;trigger.focus();}});
 menu.addEventListener('focusout',event=>{if(!menu.contains(event.relatedTarget))menu.open=false;});
 card.querySelector('.goal-body').append(contextNotes('goal',goal));
}
function augmentStep(row,step){
 const menu=row.querySelector('.step-menu'),popover=row.querySelector('.step-menu-popover');
 const action=(label,fn)=>button(t(label),()=>{menu.open=false;fn();},'button text-button');
 popover.append(action('editDetails',()=>showEntityEdit('step',step)));
 if(!step.archived_at){
  popover.append(action(step.status==='completed'?'reopenStep':step.status==='deferred'?'resumeStep':'deferStep',()=>showStepStatus(step,step.status==='pending'?'deferred':'pending')),orderControls('step',step));
 }
 if(step.status==='deferred')row.querySelector('.step-side').prepend(badge(t('deferred'),'neutral'));
 if(step.status!=='completed'&&state.entries.some(e=>e.step_id===step.id&&e.action==='step_completed'))row.querySelector('.step-content').append(badge(t('reopened'),'neutral'));
}
function augmentProject(project){
 const hero=document.querySelector('.project-hero'),actions=el('div','project-actions'),addGoal=hero.querySelector(':scope > .button.primary'),dates=hero.querySelector(':scope > .button.secondary');
 const menu=el('details','step-menu goal-options project-options'),trigger=el('summary','','···'),popover=el('div','step-menu-popover');
 trigger.setAttribute('aria-label',`${t('projectOptions')}: ${project.title}`);trigger.title=t('projectOptions');
 popover.append(button(t('editProject'),()=>showEntityEdit('project',project),'button text-button','edit'),dates,button(t(project.status==='paused'?'resumeProject':'pauseProject'),()=>showProjectStatus(project),'button text-button'),orderControls('project',project));
 dates.className='button text-button';menu.append(trigger,popover);actions.append(addGoal,menu);hero.append(actions);
 popover.addEventListener('click',event=>{const action=event.target.closest('button');if(action&&!action.disabled){trigger.focus();menu.open=false;}},true);
 menu.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){event.preventDefault();event.stopPropagation();menu.open=false;trigger.focus();}});
 menu.addEventListener('focusout',event=>{if(!menu.contains(event.relatedTarget))menu.open=false;});
 const aside=document.querySelector('.project-aside');
 if(project.status==='paused'){const pause=panel(t('paused'));pause.append(textNode('p','context-description',project.pause_reason||t('pauseHint')));aside.prepend(pause);}
 const latest=state.entries.filter(e=>e.project_id===project.id&&e.kind==='summary').slice().sort((a,b)=>b.occurred_at.localeCompare(a.occurred_at)||b.recorded_at.localeCompare(a.recorded_at))[0];
 const summary=panel(t('latestSummary'));
 if(latest){const level=latest.step_id?'step':latest.goal_id?'goal':'project',item=level==='step'?state.steps.find(s=>s.id===latest.step_id):level==='goal'?state.goals.find(g=>g.id===latest.goal_id):project;summary.append(manualEntryCard(latest,level,item));}else summary.append(el('p','section-sub',t('noSummary')));
 summary.append(button(t('addSummary'),()=>showContextNote('project',project,'summary'),'button text-button','plus'));aside.append(summary);
 const records=el('section','project-records');
 for(const [key,kinds] of [['myNotes',['note']],['projectUpdates',['summary','issue']]]){
  const box=panel(t(key));const entries=contextEntries('project',project).filter(e=>kinds.includes(e.kind));
  entries.forEach(e=>box.append(manualEntryCard(e,'project',project)));if(!entries.length)box.append(el('p','section-sub',t('noteEmpty')));
  box.append(button(t(key==='myNotes'?'addNote':'addUpdate'),()=>showContextNote('project',project,key==='myNotes'?'note':'summary'),'button text-button','plus'));records.append(box);
 }
 document.querySelector('.project-layout').insertBefore(records,document.getElementById('progress'));
}
function plannedStepLink(step,today){const goal=state.goals.find(g=>g.id===step.goal_id),project=state.projects.find(p=>p.id===goal.project_id);const link=el('a','day-item');link.href=`#project/${project.id}`;link.append(textNode('strong','',step.title),textNode('p','section-sub',`${project.title} · ${goal.title}`),el('span','section-sub',formatDate(step.planned_for)));if(step.planned_for<today)link.append(badge(rtext('Carried over','من الأيام السابقة'),'neutral'));return link;}

function closeEditor(force=false){
 if(saving)return;
 if(!force&&dirty){
  const existing=editor.querySelector('.discard-confirmation');if(existing){existing.querySelector('button')?.focus();return;}
  const form=editor.querySelector('form'),previous=document.activeElement,confirm=el('section','discard-confirmation');
  confirm.setAttribute('role','alertdialog');confirm.setAttribute('aria-labelledby','discard-title');confirm.append(el('h3','',t('discard')));confirm.firstChild.id='discard-title';
  const actions=el('div','form-actions');const stay=button(rtext('Continue editing','متابعة التعديل'),()=>{confirm.remove();if(form)form.hidden=false;previous?.focus();},'button secondary');
  actions.append(stay,button(rtext('Discard changes','تجاهل التغييرات'),()=>closeEditor(true),'button primary'));confirm.append(actions);if(form)form.hidden=true;editor.append(confirm);stay.focus();return;
 }
 editor.querySelector('.discard-confirmation')?.remove();editor.close();editor.classList.remove('goals-dialog');dirty=false;lastPayload=null;lastRequestId=null;if(lastFocus?.isConnected)lastFocus.focus();
}
