import {ApiError,readState,mutate,exportBackup,inspectBackup,restoreBackup,listRecoveryCopies,exportRecoveryCopy} from './api.js';
import {dayKey,overviewData} from './planning.js';
let language = 'en';
const messages = {
 en: {
  editGoalName:'Edit goal name', editStepName:'Edit step name', renameHint:'Change the name while keeping notes, progress, and earlier history.', changeReason:'Why change it?', moveStep:'Move to another goal', moveHint:'Move within this project. Notes, status, and the original achievement date stay with the step.', currentGoal:'Current goal: {title}', destinationGoal:'Move to goal', chooseGoal:'Choose another goal', noMoveGoals:'Add another goal to this project first, then move this step here.', goalRenamed:'Goal renamed', stepRenamed:'Step renamed', stepMoved:'Step moved', renamedFromTo:'Name: {before} → {after}', movedFromTo:'From {before} → {after}',
  removed:'Removed', removedOn:'Removed {date}', removedHint:'These steps are outside the current plan. Their notes and achievements stay saved.', restoreTitle:'Bring this step back?', restoreHint:'Restore it to the same goal with its original status, notes, and achievement date.', stepRemoved:'Step removed from plan', stepRestored:'Step restored to plan',
  projectIcon:'Project icon', changeIcon:'Change project icon', iconHint:'A project icon can be selected and changed at any time.', iconUpdated:'Project icon changed', icon_folder:'Folder', icon_chart:'Chart', icon_spark:'Spark', icon_award:'Award', icon_document:'Document', icon_book:'Book', icon_code:'Code', icon_heart:'Heart',
  viewAllGoals:'View all goals', allGoals:'Goals', totalGoals:'Total goals', completedGoals:'Completed goals', pausedGoals:'Paused-project goals', goalsOverviewHint:'Each circle shows completed steps in the current plan. Goals are marked complete separately.', stepsRemaining:'{n} steps remaining', noStepsPlanned:'No steps planned yet', stepsReady:'All current steps are done. This goal is still active.',

  workspace:'Workspace', navigation:'Navigation', historyNav:'Progress History', previewShort:'Design preview', previewSidebar:'Fictional examples. Changes are not saved.', localSidebar:'Projects and history stored locally.', demoHint:'Practice workspace with fictional data.',
  stepOptions:'Step options', removeStep:'Remove from plan', removeTitle:'Take this step out of the plan?', removeHint:'Notes, history, and previous achievements remain saved. The step can be restored later.', removeReason:'Why remove it?', removedSteps:'Removed steps', restoreStep:'Restore to plan',
  notesUpdates:'Notes & updates', addNote:'Add a note', noteKind:'Note', issueKind:'Issue', summaryKind:'Summary', noteType:'Type', noteBody:'What happened?', noteHint:'Details of the work, findings, or issues.', noteDate:'When did it happen?', noteGoal:'About this goal', noteStep:'About this step', noteEmpty:'Keep what happened here, alongside the work it belongs to.', newNote:'Keep the context.', newNoteHint:'A dated note for this part of the work. It stays separate from completion.', structureHint:'Each project can contain multiple goals, with steps under each goal.', notePreviewHint:'Layout preview only. Notes cannot be saved here yet.', requiredNote:'Write a note first.',

  brand:'Work Tracker', tagline:'Projects, progress, and next actions.', overview:'Overview', projects:'Projects', local:'Saved on this laptop', preview:'Visual preview · fictional data', previewNote:'Explore the layout. Saving is unavailable in this preview.', skip:'Skip to content',
  eyebrow:'WORKSPACE', heading:'Projects and progress.', intro:'Current status and next steps.', addProject:'New project', addGoal:'Add goal', addStep:'Add step',
  ongoing:'Ongoing projects', activeGoals:'Active goals', stepsDone:'Steps completed', allTime:'Recorded so far', active:'Active', paused:'Paused', completed:'Completed', pending:'To do', deferred:'Deferred',
  yourProjects:'Your Projects', projectsSub:'Projects in one workspace.', projectCount:'{n} projects', openProject:'Open project', goalsCount:'{n} goals', stepsCount:'{n} steps remaining', completedCount:'{n} steps completed', updated:'Updated {date}',
  pickUp:'Next actions', pickUpSub:'Planned next actions for each project.', nextAction:'Next action', nextEmpty:'No next action has been set.', setNext:'Set next action', editNext:'Edit next action', nextPlaceholder:'Next planned action',
  progress:'Recent progress', progressSub:'Steps and their recorded history.', noActivity:'No activity recorded yet.', noActivityBody:'Project activity and completed steps appear here with their dates.',
  emptyTitle:'No projects yet.', emptyBody:'Projects contain goals, steps, notes, and a dated activity history.', firstProject:'Create project',
  back:'Back to overview', goals:'Goals & steps', goalsSub:'Keep the plan flexible. Keep the progress.', noGoals:'No active goals yet.', noGoalsBody:'Goals define the intended outcomes of a project.', noSteps:'Break this goal into a first small step.',
  activity:'Project history', activitySub:'What happened, and when.', context:'Project context', noContext:'A place to keep the purpose of this project.', purpose:'About this project',
  completeStep:'Complete step', completedOn:'Completed {date}', emptyNext:'No next action set', completedOf:'{done} of {total} steps completed', addNewWork:'Discovered more work? Add a step without losing earlier progress.',
  newProject:'New project', newProjectHint:'A project contains goals, steps, notes, and activity history.', newGoal:'New goal', newGoalHint:'Choose a result to work toward within this project.', newStep:'New step', newStepHint:'Make the next piece of work clear and manageable.',
  title:'Title', projectTitle:'Project name', goalTitle:'Goal title', stepTitle:'Step title', description:'Description', optional:'Optional', titlePlaceholder:'Clear, descriptive title', descriptionPlaceholder:'Purpose and relevant details',
  contextOptional:'Add context', reason:'Why add this?', reasonHint:'For example, a new finding during the work.', helper:'Worked with', helperHint:'An assistant or collaborator, if any.',
  cancel:'Cancel', save:'Save', createProject:'Create project', createGoal:'Create goal', createStep:'Create step', saving:'Saving…', saved:'Saved', close:'Close',
  completionTitle:'A step forward.', completionHint:'The achievement retains its date. The goal can remain in progress.', completionDate:'Completion date and time', completionReason:'Completion note', markComplete:'Record completion',
  createdProject:'Project created', createdGoal:'Goal added', createdStep:'Step added', stepCompleted:'Step completed', nextUpdated:'Next action updated', settingUpdated:'Language changed', by:'With {name}', recorded:'Recorded {date}',
  noData:'Nothing to show yet', loadFailed:'The workspace could not be opened.', retry:'Try again', connection:'The local app could not be reached. The draft remains available.',
  invalid_input:'Check the highlighted fields.', not_found:'This item could not be found. Reload the latest work.', stale_revision:'Another tab saved newer work. Load the latest version and review the draft before saving.', request_conflict:'This save request conflicts with an earlier one. Reload the latest work before retrying.', save_failed:'The change could not be saved. The draft remains available.', forbidden:'This page cannot save right now. Reload the app and try again.', invalid_request:'The request could not be processed.',
  required:'Please enter a title.', badDate:'Choose a valid completion time.', badNoteDate:'Choose a valid note date and time.', reloadLatest:'Load latest version', loadedLatest:'Latest version loaded. Review the draft before saving.', discard:'Discard unsaved changes?',
  previewSave:'This is a view-only preview. No data has been saved.', footer:'One step at a time.', footerHint:'Work and progress in context.', demo:'Demo workspace · fictional projects',
  changed:'Changed', allHistory:'All recorded activity', noNextActions:'Project next actions will appear here.', goalStatus:'Goal in progress', pendingGoals:'{n} active goals',
 },
 ar: {
  editGoalName:'تعديل اسم الهدف', editStepName:'تعديل اسم الخطوة', renameHint:'تعديل الاسم مع الاحتفاظ بالملاحظات والتقدم والسجل السابق.', changeReason:'سبب التعديل', moveStep:'نقل إلى هدف آخر', moveHint:'نقل الخطوة داخل المشروع نفسه مع الاحتفاظ بالملاحظات والحالة وتاريخ الإنجاز الأصلي.', currentGoal:'الهدف الحالي: {title}', destinationGoal:'نقل إلى هدف', chooseGoal:'اختيار هدف آخر', noMoveGoals:'يلزم إضافة هدف آخر إلى المشروع قبل نقل الخطوة.', goalRenamed:'تم تعديل اسم الهدف', stepRenamed:'تم تعديل اسم الخطوة', stepMoved:'تم نقل الخطوة', renamedFromTo:'الاسم: {before} ← {after}', movedFromTo:'من {before} ← {after}',
  removed:'مستبعدة من الخطة',removedOn:'تم الاستبعاد {date}',removedHint:'هذه الخطوات خارج الخطة الحالية. تبقى ملاحظاتها وإنجازاتها محفوظة.',restoreTitle:'استعادة الخطوة إلى الخطة؟',restoreHint:'تعود الخطوة إلى الهدف نفسه بحالتها وملاحظاتها وتاريخ إنجازها الأصلي.',stepRemoved:'تم استبعاد خطوة من الخطة',stepRestored:'تمت استعادة خطوة إلى الخطة',
  projectIcon:'أيقونة المشروع',changeIcon:'تغيير أيقونة المشروع',iconHint:'يمكن اختيار أيقونة للمشروع وتغييرها في أي وقت.',iconUpdated:'تم تغيير أيقونة المشروع',icon_folder:'ملف',icon_chart:'رسم بياني',icon_spark:'لمعة',icon_award:'جائزة',icon_document:'مستند',icon_book:'كتاب',icon_code:'برمجة',icon_heart:'قلب',
  viewAllGoals:'عرض كل الأهداف',allGoals:'الأهداف',totalGoals:'إجمالي الأهداف',completedGoals:'أهداف مكتملة',pausedGoals:'أهداف مشاريع متوقفة',goalsOverviewHint:'توضح كل دائرة الخطوات المكتملة في الخطة الحالية. يتم تسجيل اكتمال الهدف بشكل مستقل.',stepsRemaining:'الخطوات المتبقية: {n}',noStepsPlanned:'لم تُحدد خطوات بعد',stepsReady:'اكتملت جميع الخطوات الحالية. ما زال الهدف نشطًا.',

  workspace:'مساحة العمل',navigation:'التنقل',historyNav:'سجل التقدم',previewShort:'معاينة التصميم',previewSidebar:'أمثلة توضيحية. لا تُحفظ التغييرات.',localSidebar:'المشاريع والسجل محفوظان محليًا.',demoHint:'مساحة تدريب ببيانات وهمية.',
  stepOptions:'خيارات الخطوة',removeStep:'إزالة من الخطة',removeTitle:'استبعاد الخطوة من الخطة؟',removeHint:'تبقى الملاحظات والسجل والإنجازات السابقة محفوظة. يمكن استعادة الخطوة لاحقًا.',removeReason:'سبب الاستبعاد',removedSteps:'الخطوات المستبعدة',restoreStep:'إرجاع للخطة',
  notesUpdates:'الملاحظات والتحديثات',addNote:'إضافة ملاحظة',noteKind:'ملاحظة',issueKind:'مشكلة',summaryKind:'ملخص',noteType:'النوع',noteBody:'التفاصيل',noteHint:'تفاصيل العمل والنتائج والمشكلات.',noteDate:'تاريخ الحدث',noteGoal:'حول هذا الهدف',noteStep:'حول هذه الخطوة',noteEmpty:'يمكن تسجيل التفاصيل المتعلقة بهذا الجزء من العمل.',newNote:'تسجيل ملاحظة',newNoteHint:'ملاحظة مؤرخة لهذا الجزء من العمل، مستقلة عن تسجيل الإنجاز.',structureHint:'يمكن إضافة عدة أهداف إلى المشروع، وخطوات تحت كل هدف.',notePreviewHint:'معاينة للتصميم فقط. حفظ الملاحظات غير متاح.',requiredNote:'يلزم إدخال نص الملاحظة.',

  brand:'Work Tracker',tagline:'المشاريع والتقدم والخطوات التالية.',overview:'نظرة عامة',projects:'المشاريع',local:'محفوظ على هذا الجهاز',preview:'معاينة الشكل · بيانات تجريبية',previewNote:'معاينة للتصميم. الحفظ غير متاح.',skip:'الانتقال إلى المحتوى',
  eyebrow:'مساحة العمل',heading:'المشاريع والتقدم',intro:'الحالة الحالية والخطوات التالية.',addProject:'مشروع جديد',addGoal:'إضافة هدف',addStep:'إضافة خطوة',
  ongoing:'مشاريع مستمرة',activeGoals:'أهداف نشطة',stepsDone:'خطوات منجزة',allTime:'كل الإنجازات المسجلة',active:'نشط',paused:'متوقف',completed:'مكتمل',pending:'قيد التنفيذ',deferred:'مؤجل',
  yourProjects:'مشاريعك',projectsSub:'المشاريع في مساحة عمل واحدة.',projectCount:'المشاريع: {n}',openProject:'فتح المشروع',goalsCount:'الأهداف: {n}',stepsCount:'الخطوات المتبقية: {n}',completedCount:'خطوات منجزة: {n}',updated:'آخر تحديث {date}',
  pickUp:'الإجراءات التالية',pickUpSub:'الإجراء التالي لكل مشروع.',nextAction:'الإجراء التالي',nextEmpty:'لم يُحدد الإجراء التالي.',setNext:'تحديد الإجراء التالي',editNext:'تعديل الإجراء التالي',nextPlaceholder:'الإجراء المخطط له لاحقًا',
  progress:'آخر المستجدات',progressSub:'الخطوات وسجل التقدم.',noActivity:'لا توجد أنشطة مسجلة بعد.',noActivityBody:'تظهر أنشطة المشاريع والخطوات المنجزة هنا مع تواريخها.',
  emptyTitle:'لا توجد مشاريع بعد.',emptyBody:'تحتوي المشاريع على أهداف وخطوات وملاحظات وسجل مؤرخ للأنشطة.',firstProject:'إنشاء مشروع',
  back:'الرجوع للنظرة العامة',goals:'الأهداف والخطوات',goalsSub:'خطة مرنة وسجل تقدم محفوظ.',noGoals:'لا توجد أهداف نشطة بعد.',noGoalsBody:'تحدد الأهداف النتائج المطلوبة ضمن المشروع.',noSteps:'يمكن إضافة خطوات لتنفيذ هذا الهدف.',
  activity:'سجل المشروع',activitySub:'الأحداث والتواريخ.',context:'سياق المشروع',noContext:'وصف المشروع والغرض منه.',purpose:'عن المشروع',
  completeStep:'إنجاز الخطوة',completedOn:'تم الإنجاز {date}',emptyNext:'لم يُحدد الإجراء التالي',completedOf:'المنجز: {done} / {total}',addNewWork:'يمكن إضافة خطوات جديدة مع الاحتفاظ بالإنجازات السابقة.',
  newProject:'مشروع جديد',newProjectHint:'يحتوي المشروع على أهداف وخطوات وملاحظات وسجل للأنشطة.',newGoal:'هدف جديد',newGoalHint:'النتيجة المطلوب تحقيقها ضمن هذا المشروع.',newStep:'خطوة جديدة',newStepHint:'جزء محدد وقابل للتنفيذ من العمل.',
  title:'العنوان',projectTitle:'اسم المشروع',goalTitle:'عنوان الهدف',stepTitle:'عنوان الخطوة',description:'الوصف',optional:'اختياري',titlePlaceholder:'عنوان واضح ومحدد',descriptionPlaceholder:'الغرض والتفاصيل ذات الصلة',
  contextOptional:'إضافة سياق',reason:'سبب الإضافة',reasonHint:'مثل نتيجة جديدة ظهرت أثناء العمل.',helper:'المساعد أو المتعاون',helperHint:'اسم المساعد أو المتعاون، إن وجد.',
  cancel:'إلغاء',save:'حفظ',createProject:'إنشاء المشروع',createGoal:'إضافة الهدف',createStep:'إضافة الخطوة',saving:'جاري الحفظ…',saved:'تم الحفظ',close:'إغلاق',
  completionTitle:'تسجيل إنجاز خطوة',completionHint:'يُحفظ الإنجاز بتاريخه حتى إذا بقي الهدف قيد التنفيذ.',completionDate:'تاريخ ووقت الإنجاز',completionReason:'ملاحظة عن الإنجاز',markComplete:'تسجيل الإنجاز',
  createdProject:'تم إنشاء المشروع',createdGoal:'تمت إضافة هدف',createdStep:'تمت إضافة خطوة',stepCompleted:'تم إنجاز خطوة',nextUpdated:'تم تحديث الإجراء التالي',settingUpdated:'تم تغيير اللغة',by:'مع {name}',recorded:'تم التسجيل {date}',
  noData:'لا توجد بيانات بعد',loadFailed:'تعذر فتح مساحة العمل.',retry:'إعادة المحاولة',connection:'تعذر الاتصال بالتطبيق المحلي. المسودة محفوظة في النموذج.',
  invalid_input:'يلزم التحقق من الحقول المحددة.',not_found:'لم يتم العثور على العنصر. يلزم تحميل آخر تحديث.',stale_revision:'تم حفظ نسخة أحدث في تبويب آخر. يلزم تحميلها ومراجعة المسودة قبل الحفظ.',request_conflict:'يتعارض طلب الحفظ مع طلب سابق. يلزم تحميل آخر تحديث قبل إعادة المحاولة.',save_failed:'تعذر حفظ التغيير. المسودة ما زالت متاحة.',forbidden:'الحفظ غير متاح حاليًا. يلزم إعادة تحميل التطبيق والمحاولة مجددًا.',invalid_request:'تعذرت معالجة الطلب.',
  required:'يلزم إدخال عنوان.',badDate:'يلزم تحديد تاريخ ووقت صالحين للإنجاز.',badNoteDate:'يلزم تحديد تاريخ ووقت صالحين للملاحظة.',reloadLatest:'تحميل أحدث نسخة',loadedLatest:'تم تحميل أحدث نسخة. يلزم مراجعة المسودة قبل الحفظ.',discard:'تجاهل التغييرات غير المحفوظة؟',
  previewSave:'معاينة للتصميم فقط. لم تُحفظ أي بيانات.',footer:'التقدم خطوة بخطوة.',footerHint:'العمل وتفاصيله في مكان واحد.',demo:'مساحة تجريبية · مشاريع وهمية',
  changed:'تغيير',allHistory:'كل الأحداث المسجلة',noNextActions:'تظهر الإجراءات التالية للمشاريع هنا.',goalStatus:'الهدف قيد التنفيذ',pendingGoals:'{n} أهداف نشطة',
 }
};
function setLanguage(value) { language = value === 'ar' ? 'ar' : 'en'; document.documentElement.lang=language; document.documentElement.dir=language==='ar'?'rtl':'ltr'; }
function getLanguage(){return language;}
function t(key, values={}) { let result=messages[language][key] || messages.en[key] || key; if(language==='en' && values.n===1){const singular={projectCount:'1 project',goalsCount:'1 goal',stepsCount:'1 step remaining',completedCount:'1 step completed',pendingGoals:'1 active goal',stepsRemaining:'1 step remaining'};result=singular[key] || result;} if(language==='ar' && key==='stepsRemaining'){result=values.n===0?'لا توجد خطوات متبقية':values.n===1?'خطوة واحدة متبقية':values.n===2?'خطوتان متبقيتان':'الخطوات المتبقية: {n}';} if(language==='en' && key==='completedOf' && values.total===1)result='{done} of {total} step completed'; for(const [k,v] of Object.entries(values)) result=result.replaceAll(`{${k}}`,String(v)); return result; }

function formatDate(value, withTime=false){
 if(!value)return '';
 const parsed=new Date(/^\d{4}-\d{2}-\d{2}$/.test(value)?value+'T12:00:00':value);
 if(Number.isNaN(parsed.getTime()))return '';
 return new Intl.DateTimeFormat(getLanguage()==='ar'?'ar-KW':'en-GB',{calendar:'gregory',month:'short',day:'numeric',year:'numeric',...(withTime?{hour:'numeric',minute:'2-digit'}:{})}).format(parsed);
}
function localDateTimeNow(){const date=new Date();return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16);}

// Current-plan progress is separate from dated achievement history.
function stepProgress(steps, goalId){
 const current=steps.filter(step=>step.goal_id===goalId && !step.archived_at);
 const done=current.filter(step=>step.status==='completed').length;
 return {total:current.length,done,remaining:current.length-done,percent:current.length?100*done/current.length:0};
}
function goalCounts(goals,projects){
 const paused=new Set(projects.filter(p=>p.status==='paused').map(p=>p.id));
 return {total:goals.length,active:goals.filter(g=>g.status==='active'&&!paused.has(g.project_id)).length,
 completed:goals.filter(g=>g.status==='completed').length,
 paused:goals.filter(g=>g.status==='active'&&paused.has(g.project_id)).length};
}
const projectIcons=['folder','chart','spark','award','document','book','code','heart'];
function projectIconName(project){return projectIcons.includes(project.icon)?project.icon:'folder';}

function el(tag, className='', text=null){const node=document.createElement(tag);if(className)node.className=className;if(text!==null)node.textContent=String(text);return node;}
function textNode(tag, className, text){const node=el(tag,className,text);node.dir='auto';return node;}
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
function icon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.6');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');svg.classList.add('icon');for(const d of shapes[name]||shapes.folder){const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d',d);svg.append(path);}return svg;}
function button(label, onClick, className='button', symbol=null){const b=el('button',className);b.type='button';if(symbol)b.append(icon(symbol));b.append(el('span','',label));if(onClick)b.addEventListener('click',onClick);return b;}
function badge(label, kind='active'){return el('span',`badge ${kind}`,label);}
function heading(title,sub,action){const wrap=el('div','section-heading');const text=el('div');text.append(el('h2','',title));if(sub)text.append(el('p','section-sub',sub));wrap.append(text);if(action)wrap.append(action);return wrap;}
function empty(title,body,action=null,symbol='leaf'){const box=el('div','empty-state');const mark=el('div','empty-symbol');mark.append(icon(symbol));box.append(mark,el('h3','',title),el('p','',body));if(action)box.append(action);return box;}
function eventDetails(entry){if(entry.details)return entry.details;if(typeof entry.details_json==='object')return entry.details_json || {};try{return JSON.parse(entry.details_json||'{}');}catch{return {};}}
function eventLabel(entry){
 if(['note','issue','summary'].includes(entry.kind))return t(entry.kind==='note'?'noteKind':entry.kind==='issue'?'issueKind':'summaryKind');
 const direct={project_paused:'projectPaused',project_resumed:'projectResumed',step_deferred:'stepDeferred',step_reopened:'stepReopened',step_resumed:'stepResumed',project_reordered:'projectReordered',goal_reordered:'goalReordered',step_reordered:'stepReordered',goal_updated:'goalUpdated',step_updated:'stepUpdated',entry_edited:'entryEdited',goal_completed:'goalCompleted',goal_reopened:'goalReopened',project_dates_updated:'datesUpdated',goal_dates_updated:'datesUpdated',step_dates_updated:'datesUpdated',goal_renamed:'goalRenamed',step_renamed:'stepRenamed',step_moved:'stepMoved',step_archived:'stepRemoved',step_restored:'stepRestored',icon_updated:'iconUpdated',project_updated:'projectUpdated'};if(direct[entry.action])return t(direct[entry.action]);
 const detail=eventDetails(entry);const action=(entry.action||'').toLowerCase();const entity=detail.entity_type || detail.entity || '';
 if(action.includes('complet'))return t('stepCompleted');
 if(action.includes('next') || (detail.after?.next_action!==undefined && action.includes('updat')))return t('nextUpdated');
 if(action.includes('creat'))return t(entity==='project'?'createdProject':entity==='goal'?'createdGoal':'createdStep');
 if(action.includes('language')||entity==='settings')return t('settingUpdated');
 return t('changed');
}
function activityList(entries,state,{limit=null,showProject=false}={}){
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
  if(entry.action==='entry_edited'){body.append(textNode('p','event-note',t('originalText')+': '+(detail.before?.text||'')),textNode('p','event-note',t('updatedText')+': '+(detail.after?.text||'')));} if(entry.action==='step_completed'&&state.steps.find(s=>s.id===entry.step_id)?.status!=='completed')body.append(badge(t('reopened'),'neutral')); if(entry.action==='goal_completed'&&state.goals.find(g=>g.id===entry.goal_id)?.status!=='completed')body.append(badge(t('reopened'),'neutral')); const reason=entry.text || detail.reason;if(reason)body.append(textNode('p','event-note',reason));
  item.append(dot,body);list.append(item);
 }
 return list;
}


const previewData = null;
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
function baseCloseEditor(force=false){if(saving)return;if(!force&&dirty&&!window.confirm(t('discard')))return;editor.close();editor.classList.remove('goals-dialog');dirty=false;lastPayload=null;lastRequestId=null;if(lastFocus?.isConnected)lastFocus.focus();}
editor.addEventListener('cancel',event=>{event.preventDefault();closeEditor();});
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});

function baseRenderHeader(){
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
function baseRenderOverview(){
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
function baseRenderProject(project){
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
function baseGoalCard(goal,index){
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
function baseStepRow(step){
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
function baseContextNotes(level,item){
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
function baseShowContextNote(level,item){
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

function baseRender(){
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
function baseShowCreate(type,parent={}){
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

// Locally drawn, selectable icons. No external icon font or network request.
Object.assign(shapes,{
 briefcase:['M3 7h18v14H3ZM8 7V3h8v4M3 12c5 4 13 4 18 0M10 13h4'],
 building:['M5 21V3h14v18M9 7h1m4 0h1M9 11h1m4 0h1M10 21v-5h4v5M3 21h18'],
 shopping:['M4 7h16l1 14H3ZM8 8V6a4 4 0 0 1 8 0v2'],
 beauty:['M8 12h8v9H8ZM9 12V5l6-3v10M5 21h14'],
 pet:['M6 13c2-4 4-4 6-4s4 0 6 4c5 8-2 8-6 5-4 3-11 3-6-5M5 4v2M10 2v3M15 2v3M20 4v2'],
 bulb:['M8 16c0-3-3-3-3-7a7 7 0 0 1 14 0c0 4-3 4-3 7ZM9 19h6M10 22h4'],
 camera:['M3 7h5l2-3h4l2 3h5v14H3ZM16 14a4 4 0 1 1-8 0 4 4 0 0 1 8 0'],
 video:['M3 6h12v12H3ZM15 10l6-4v12l-6-4'],
 mic:['M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0ZM5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8'],
 plane:['M3 11l8-2V3l2-1 1 7 7 3v2l-7-1v6l3 2H8l3-2v-6l-8 1Z'],
 home:['m3 11 9-8 9 8M5 10v11h14V10M10 21v-7h4v7'],
 calendar:['M4 5h16v16H4ZM4 10h16M8 3v4M16 3v4'],
 target:['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0M13 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0'],
 coffee:['M4 7h12v9a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5ZM16 8h3a3 3 0 0 1 0 6h-3M7 2v2m5-2v2'],
 tools:['m14 6 4 4 4-4c1 8-5 10-8 7L6 21l-3-3 8-8c-3-5 1-9 6-8Z'],
 download:['M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5'],lock:['M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5Z']
});
projectIcons.push('briefcase','building','shopping','beauty','pet','bulb','camera','video','mic','globe','plane','home','calendar','target','coffee','tools');
Object.assign(messages.en,{icon_briefcase:'Business',icon_building:'Company',icon_shopping:'Shop',icon_beauty:'Beauty',icon_pet:'Pets',icon_bulb:'Idea',icon_camera:'Photo',icon_video:'Video',icon_mic:'Audio',icon_globe:'World',icon_plane:'Travel',icon_home:'Home',icon_calendar:'Calendar',icon_target:'Goal',icon_coffee:'Coffee',icon_tools:'Tools',historyNav:'Progress History',local:'Saved in this browser',localSidebar:'Local workspace. Export backups to retain a copy.',connection:'The saved workspace could not be opened. Existing data has not been reset. Please retry.'});
Object.assign(messages.ar,{icon_briefcase:'أعمال',icon_building:'شركة',icon_shopping:'متجر',icon_beauty:'جمال',icon_pet:'حيوانات',icon_bulb:'فكرة',icon_camera:'صور',icon_video:'فيديو',icon_mic:'صوت',icon_globe:'العالم',icon_plane:'سفر',icon_home:'منزل',icon_calendar:'تقويم',icon_target:'هدف',icon_coffee:'قهوة',icon_tools:'أدوات',historyNav:'سجل التقدم',local:'محفوظ في هذا المتصفح',localSidebar:'مساحة عمل محلية. يمكن تصدير نسخ احتياطية للاحتفاظ بالبيانات.',connection:'تعذر فتح البيانات المحفوظة. لم تُحذف البيانات. يمكن إعادة المحاولة.'});

function rtext(en,ar){return getLanguage()==='ar'?ar:en;}
function pageTitle(){const labels={projects:t('projects'),achievements:rtext('Achievements','الإنجازات'),history:t('historyNav'),backup:rtext('Backup & restore','النسخ الاحتياطي والاستعادة')};return labels[location.hash.slice(1)]||t('overview');}
function renderHeader(){
 baseRenderHeader();const nav=document.querySelector('.sidebar-nav');nav.replaceChildren();
 for(const [route,label,symbol] of [['overview',t('overview'),'grid'],['projects',t('projects'),'folder'],['achievements',rtext('Achievements','الإنجازات'),'award'],['history',t('historyNav'),'clock']]){if(route==='history'){nav.append(button(label,showProgressHistory,'sidebar-link','clock'));continue;}const selected=location.hash===`#${route}`||(!location.hash&&route==='overview');const a=el('a',`sidebar-link ${selected?'selected':''}`);a.href=`#${route}`;if(selected)a.setAttribute('aria-current','page');a.append(icon(symbol),el('span','',label));nav.append(a);}
 const local=document.querySelector('.sidebar-storage');const backup=el('a','sidebar-link backup-link');backup.href='#backup';backup.append(icon('download'),el('span','',rtext('Backup & restore','النسخ الاحتياطي والاستعادة')));local.before(backup);
 const mark=el('a','header-mark');mark.href='#overview';mark.setAttribute('aria-label',t('brand'));mark.append(icon('check'));document.querySelector('.header-end').append(mark);document.querySelector('.breadcrumb-current').textContent=currentProject?.title||pageTitle();
 document.getElementById('preview-notice').hidden=true;
}
function showProgressHistory(){
 const section=document.getElementById('progress');
 if(section){section.tabIndex=-1;section.focus({preventScroll:true});section.scrollIntoView({block:'start'});return;}
 if(location.hash==='#history'){main.focus();return;}
 location.hash='history';
}
function pageHero(title,action){const h=el('div','workspace-hero'),text=el('div');text.append(el('p','workspace-date',new Intl.DateTimeFormat(getLanguage()==='ar'?'ar-KW':'en-GB',{calendar:'gregory',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date())),el('h1','',title));h.append(text);if(action)h.append(action);return h;}
function panel(title,sub){const p=el('section','review-panel');p.append(heading(title,sub));return p;}
function projectList(){if(!state.projects.length)return empty(t('emptyTitle'),t('emptyBody'),button(t('firstProject'),()=>showCreate('project'),'button primary','plus'));const list=el('div','projects-grid');state.projects.slice().sort((a,b)=>a.position-b.position).forEach((p,i)=>list.append(projectCard(p,i)));return list;}
function goalList(goals){const list=el('div','review-goals');if(!goals.length){list.append(empty(t('noGoals'),t('noGoalsBody'),button(t('addGoal'),showNewGoal,'button secondary','plus')));return list;}for(const goal of goals){const project=state.projects.find(p=>p.id===goal.project_id);const progress=stepProgress(state.steps,goal.id);const row=el('article','goal-progress-card'),body=el('div','goal-progress-body');body.append(button(goal.title,()=>openGoal(project.id,goal.id),'goal-progress-link'),textNode('p','goal-project-name',project.title),el('span','goal-meta',t('completedOf',{done:progress.done,total:progress.total})),badge(t(goal.status==='completed'?'completed':project.status==='paused'?'paused':'active'),goal.status==='completed'?'completed':'neutral'));if(progress.total&&!progress.remaining&&goal.status!=='completed')body.append(el('p','status-note',t('stepsReady')));row.append(progressRing(progress),body);list.append(row);}return list;}
function renderOverview(){
 const model=overviewData(state);main.append(pageHero(t('overview'),button(rtext('New goal','هدف جديد'),showNewGoal,'button primary','plus')));
 const metrics=el('section','stats-row review-stats');metrics.setAttribute('aria-label',t('overview'));metrics.append(stat(t('activeGoals'),model.activeGoals.length,'target'),stat(rtext('Goals completed this week','الأهداف المكتملة هذا الأسبوع'),model.goalsCompleted,'award'),stat(rtext('Upcoming deadlines','المواعيد القريبة'),model.upcomingCount,'calendar'),stat(rtext('Steps completed this week','الخطوات المنجزة هذا الأسبوع'),model.stepsCompleted,'check'));main.append(metrics);
 const layout=el('div','review-layout'),left=el('div'),right=el('aside','review-aside');const projects=el('section');projects.append(heading(t('yourProjects'),null,button(rtext('Add project','إضافة مشروع'),()=>showCreate('project'),'button text-button','plus')),projectList());left.append(projects);
 const active=panel(t('activeGoals'),rtext('Goals and current progress.','الأهداف ومستوى التقدم.'));active.append(goalList(model.activeGoals));left.append(active);
 const week=panel(rtext('This week','هذا الأسبوع'),`${formatDate(model.start)} — ${formatDate(new Date(model.end.getTime()-1))}`);week.append(el('h3','subsection-title',t('plannedWeek')));if(!model.weekSteps.length)week.append(el('p','section-sub',t('noPlannedWeek')));for(const step of model.weekSteps)week.append(plannedStepLink(step,model.today));week.append(el('h3','subsection-title',t('weekActivity')),activityList(model.weekEvents,state,{showProject:true,limit:6}));left.append(week);
 const history=panel(t('historyNav'),rtext('Changes, notes, and progress — kept in order.','التغييرات والملاحظات والتقدم، محفوظة بالترتيب.'));history.id='progress';history.append(activityList(state.entries,state,{showProject:true,limit:6}),button(rtext('View all history','عرض السجل الكامل'),()=>{location.hash='history';},'button text-button','arrow'));left.append(history);
 const deadlines=panel(rtext('Upcoming & overdue','المواعيد القريبة والمتأخرة'));
 if(!model.deadlines.length)deadlines.append(empty(rtext('No deadlines yet','لا توجد مواعيد بعد'),rtext('Add a deadline to a project, goal, or step.','يمكن تحديد موعد نهائي للمشروع أو الهدف أو الخطوة.'),null,'calendar'));
 for(const d of model.deadlines){const a=el('a','day-item');a.href=`#project/${d.project.id}`;a.append(textNode('strong','',d.item.title),textNode('p','section-sub',d.project.title),badge(d.overdue?rtext('Overdue','متأخر'):formatDate(d.item.due_date),d.overdue?'overdue':'neutral'));if(d.project.status==='paused')a.append(badge(t('paused'),'neutral'));deadlines.append(a);}right.append(deadlines);
 const today=panel(rtext('Today','اليوم'),rtext('A small place to start.','الخطوات المخطط لها.'));
 if(!model.todaySteps.length)today.append(empty(rtext('No steps planned for today','لا توجد خطوات مخططة لليوم'),rtext('Plan a step for today from its date options.','يمكن تحديد يوم لتنفيذ الخطوة من خيارات التاريخ.'),null,'calendar'));
 for(const step of model.todaySteps){const goal=state.goals.find(g=>g.id===step.goal_id),project=state.projects.find(p=>p.id===goal.project_id);const a=el('a','day-item');a.href=`#project/${project.id}`;a.append(textNode('strong','',step.title),textNode('p','section-sub',project.title),badge(step.planned_for<model.today?rtext('Carried over','من الأيام السابقة'):rtext('Planned today','مخطط لليوم'),'neutral'));today.append(a);}right.append(today);
 const next=panel(t('pickUp'));const planned=state.projects.filter(p=>p.status!=='paused'&&p.next_action);if(!planned.length)next.append(el('p','section-sub',t('noNextActions')));for(const p of planned){const a=el('a','review-next');a.href=`#project/${p.id}`;a.append(textNode('strong','',p.next_action),textNode('p','section-sub',p.title));next.append(a);}right.append(next);layout.append(left,right);main.append(layout);
}
let achievementProject='',achievementView='done';
function renderAchievements(){
 main.append(pageHero(rtext('Achievements','الإنجازات')),el('p','review-intro',rtext('Completed work and recorded achievement dates.','الأعمال المنجزة وتواريخ الإنجاز المسجلة.')));
 if(achievementProject&&!state.projects.some(p=>p.id===achievementProject))achievementProject='';
 const filter=el('div','field history-filter'),label=el('label','field-label',rtext('Project','المشروع')),select=el('select','input');
 label.htmlFor='achievement-project';select.id='achievement-project';
 const all=el('option','',rtext('All projects','جميع المشاريع'));all.value='';select.append(all);
 for(const project of state.projects.slice().sort((a,b)=>a.position-b.position)){const option=el('option','',project.title);option.value=project.id;select.append(option);}
 select.value=achievementProject;filter.append(label,select);
 const tabs=el('div','review-tabs'),content=el('div');
 function show(view){
  achievementView=view;tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));content.replaceChildren();
  if(view==='progress')content.append(goalList(state.goals.filter(g=>!achievementProject||g.project_id===achievementProject)));
  else content.append(activityList(state.entries.filter(e=>['goal_completed','step_completed'].includes(e.action)&&(!achievementProject||e.project_id===achievementProject)),state,{showProject:true}));
 }
 select.addEventListener('change',()=>{achievementProject=select.value;show(achievementView);});
 for(const [id,en,ar] of [['done','Completed work','العمل المنجز'],['progress','Goal progress','تقدم الأهداف']]){const b=button(rtext(en,ar),()=>show(id),'button secondary');b.dataset.view=id;tabs.append(b);}
 main.append(filter,tabs,content);show(achievementView);
}
function renderHistory(){main.append(pageHero(t('historyNav')),el('p','review-intro',rtext('The full story: additions, edits, moves, notes, and achievements.','السجل الكامل للإضافات والتعديلات والنقل والملاحظات والإنجازات.')));main.id='main';main.append(activityList(state.entries,state,{showProject:true}));}
function showNewGoal(){if(!state.projects.length){showCreate('project');return;}const m=modal(t('newGoal'),t('newGoalHint'),t('createGoal'),values=>submitMutation('/api/goals','POST',values));const wrap=el('div','field'),label=el('label','field-label',t('projects')),select=el('select','input');label.htmlFor='field-project_id';select.id='field-project_id';select.name='project_id';for(const p of state.projects){const opt=textNode('option','',p.title);opt.value=p.id;select.append(opt);}wrap.append(label,select);m.fields.append(wrap);field(m.fields,'title',t('goalTitle'),{required:true});field(m.fields,'description',t('description'),{multiline:true});field(m.fields,'due_date',rtext('Deadline','آخر موعد'),{type:'date'});contextFields(m.fields);m.open();}
function showCreate(type,parent={}){baseShowCreate(type,parent);const fields=editor.querySelector('.form-fields');field(fields,'due_date',rtext('Deadline','آخر موعد'),{type:'date'});if(type==='step')field(fields,'planned_for',rtext('Plan for','مخطط ليوم'),{type:'date'});modalBaseline=formString();}
function showDates(type,item){const m=modal(rtext('Dates & planning','المواعيد والتخطيط'),item.title,t('save'),values=>submitMutation(`/api/${type}s/${item.id}/dates`,'PATCH',values));field(m.fields,'due_date',rtext('Deadline','آخر موعد'),{type:'date',value:item.due_date||''});if(type==='step')field(m.fields,'planned_for',rtext('Plan for','مخطط ليوم'),{type:'date',value:item.planned_for||''});if(type==='step'&&item.status==='deferred')m.fields.append(el('p','section-sub',rtext('Setting a planned date resumes this deferred step.','تحديد تاريخ للتنفيذ يعيد الخطوة المؤجلة إلى الأعمال المتبقية.')));field(m.fields,'reason',t('changeReason'),{multiline:true});m.open();}
function goalCard(goal,index){const card=baseGoalCard(goal,index),foot=card.querySelector('.goal-footer');foot.append(button(rtext('Dates','المواعيد'),()=>showDates('goal',goal),'button text-button','calendar'),button(goal.status==='completed'?rtext('Reopen goal','إعادة فتح الهدف'):rtext('Complete goal','إكمال الهدف'),()=>showGoalStatus(goal),'button text-button','check'));if(goal.due_date)card.querySelector('.goal-title').append(el('span','goal-meta',`${rtext('Deadline','آخر موعد')}: ${formatDate(goal.due_date)}`));if(goal.status==='completed')card.querySelector('.goal-title').append(badge(t('completed'),'completed'));augmentGoal(card,goal);return card;}
function stepRow(step){const row=baseStepRow(step);row.querySelector('.step-menu-popover').append(button(rtext('Dates & planning','المواعيد والتخطيط'),()=>showDates('step',step),'button text-button','calendar'));if(step.planned_for||step.due_date)row.querySelector('.step-content').append(el('p','section-sub',[step.planned_for?`${rtext('Planned','مخطط')}: ${formatDate(step.planned_for)}`:'',step.due_date?`${rtext('Deadline','آخر موعد')}: ${formatDate(step.due_date)}`:''].filter(Boolean).join(' · ')));augmentStep(row,step);return row;}
function renderProject(project){baseRenderProject(project);document.querySelector('.project-hero').append(button(rtext('Project dates','مواعيد المشروع'),()=>showDates('project',project),'button secondary','calendar'));augmentProject(project);}
function showGoalStatus(goal){const complete=goal.status!=='completed',remaining=goalSteps(goal.id).filter(s=>s.status!=='completed').length;const explanation=complete&&remaining?rtext(`This goal has ${remaining} unfinished steps. Complete the goal anyway? The steps and their history stay unchanged.`,`يحتوي الهدف على ${remaining} خطوات غير مكتملة. تأكيد اكتمال الهدف؟ تبقى الخطوات وسجلها دون تغيير.`):rtext('The project stays open, and earlier achievements stay saved.','يبقى المشروع قائمًا وتُحفظ الإنجازات السابقة.');const m=modal(complete?rtext('Complete goal','إكمال الهدف'):rtext('Reopen goal','إعادة فتح الهدف'),explanation,t('save'),values=>submitMutation(`/api/goals/${goal.id}/status`,'PATCH',{...values,status:complete?'completed':'active',ack_remaining:complete&&remaining>0}));m.fields.append(textNode('p','completion-step-title',goal.title));field(m.fields,'reason',t('changeReason'),{multiline:true});m.open();}
function downloadJSON(value,name){const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
async function saveBackup(){try{downloadJSON(await exportBackup(),`work-tracker-${dayKey()}.json`);}catch(e){announce(t(e.code||'save_failed'));}}
function renderBackup(){main.append(pageHero(rtext('Backup & restore','النسخ الاحتياطي والاستعادة')),el('p','review-intro',rtext('Saved in this browser. Keep an exported copy before clearing browser data or changing devices.','تُحفظ البيانات في هذا المتصفح. يلزم تصدير نسخة احتياطية قبل مسح بيانات المتصفح أو تغيير الجهاز.')));const grid=el('div','projects-grid'),exp=panel(rtext('Export backup','تصدير نسخة احتياطية'),rtext('All projects, goals, steps, notes, and history in one file.','جميع المشاريع والأهداف والخطوات والملاحظات والسجل في ملف واحد.'));exp.classList.add('backup-panel');exp.append(button(rtext('Export backup','تصدير نسخة'),saveBackup,'button primary','download'));
 const imp=panel(rtext('Restore backup','استرجاع نسخة احتياطية'),rtext('Choose a file, review its contents, then confirm replacement. A recovery copy is saved first.','اختيار الملف ومراجعة محتواه قبل تأكيد الاستبدال. تُحفظ نسخة أمان أولًا.'));const label=el('label','field-label',rtext('Choose backup file','اختيار ملف النسخة')),input=el('input','backup-file');input.type='file';input.accept='.json,application/json';input.id='backup-file';label.htmlFor=input.id;const result=el('div');result.setAttribute('aria-live','polite');imp.append(label,input,result);
 input.addEventListener('change',async()=>{result.replaceChildren();if(!input.files?.length)return;const file=input.files[0];try{const contents=await file.text();if(input.files?.[0]!==file||!input.isConnected)return;const inspected=inspectBackup(contents);const {counts}=inspected;result.append(el('p','section-sub',rtext('Exported: ','تاريخ التصدير: ')+formatDate(inspected.exported_at,true)));result.append(el('p','backup-preview',rtext(`${counts.projects} projects · ${counts.goals} goals · ${counts.steps} steps · ${counts.entries} history entries`,`${counts.projects} مشاريع · ${counts.goals} أهداف · ${counts.steps} خطوات · ${counts.entries} أحداث`)));result.append(button(rtext('Review replacement','مراجعة الاستبدال'),()=>{const m=modal(rtext('Replace saved work?','استبدال البيانات المحفوظة؟'),rtext('This replaces the workspace in this browser with the selected backup. The current data remains available as a recovery copy below.','سيتم استبدال بيانات مساحة العمل في هذا المتصفح بالنسخة المختارة. تبقى البيانات الحالية متاحة للتنزيل كنسخة أمان.'),rtext('Restore this backup','استرجاع هذه النسخة'),async()=>{const restored=await restoreBackup(inspected.backup,state.revision);state=restored.data;setLanguage(state.settings.language);});m.open();},'button secondary'));}catch(e){if(input.files?.[0]!==file||!input.isConnected)return;result.append(el('p','field-error',t(e.code||'invalid_backup')));}});
 grid.append(exp,imp);main.append(grid);const recover=panel(rtext('Recovery copies','نسخ الأمان'),rtext('A workspace copy is saved before each restore. Copies can be downloaded for review or restoration.','نسخة من مساحة العمل قبل كل عملية استرجاع، متاحة للتنزيل والمراجعة أو الاستعادة.'));main.append(recover);listRecoveryCopies().then(copies=>{if(!recover.isConnected)return;if(!copies.length)recover.append(el('p','section-sub',rtext('No restores yet.','لم تُنفذ عمليات استرجاع بعد.')));for(const copy of copies)recover.append(button(`${formatDate(copy.created_at,true)} · ${copy.counts.projects} ${t('projects')}`,async()=>{try{downloadJSON(await exportRecoveryCopy(copy.id),`work-tracker-recovery-${copy.id}.json`);}catch(e){announce(t(e.code||'save_failed'));}},'button text-button','download'));}).catch(e=>{if(recover.isConnected)recover.append(el('p','field-error',t(e.code||'save_failed')));});}
function render(){if(!state)return;if(['#projects','#achievements','#history','#backup'].includes(location.hash)){currentProject=null;renderHeader();main.replaceChildren();if(location.hash==='#projects')main.append(pageHero(t('projects'),button(t('addProject'),()=>showCreate('project'),'button primary','plus')),projectList());else if(location.hash==='#achievements')renderAchievements();else if(location.hash==='#history')renderHistory();else renderBackup();document.title=`${pageTitle()} · Work Tracker`;return;}baseRender();}
Object.assign(messages.en,{storage_unavailable:'Browser storage is unavailable. Check storage settings and retry. The draft remains available.',storage_invalid:'Saved data could not be read. It has not been reset. Use a backup or retry in the original browser.',invalid_backup:'This is not a valid Work Tracker backup. Current work has not changed.',unfinished_steps:'This goal still has unfinished steps.',goalCompleted:'Goal completed',goalReopened:'Goal reopened',datesUpdated:'Dates updated'});
Object.assign(messages.ar,{storage_unavailable:'تعذر الحفظ في المتصفح. يلزم التحقق من إعدادات التخزين وإعادة المحاولة. المسودة ما زالت متاحة.',storage_invalid:'تعذرت قراءة البيانات المحفوظة. لم تُحذف البيانات. يمكن إعادة المحاولة في المتصفح الأصلي أو استخدام نسخة احتياطية.',invalid_backup:'ملف النسخة الاحتياطية غير صالح. لم تتغير البيانات الحالية.',unfinished_steps:'يحتوي الهدف على خطوات غير مكتملة.',goalCompleted:'اكتمل الهدف',goalReopened:'تمت إعادة فتح الهدف',datesUpdated:'تم تحديث المواعيد'});
window.addEventListener('focus',async()=>{if(dirty||saving||editor.open)return;try{const latest=await readState();if(dirty||saving||editor.open)return;state=latest;setLanguage(state.settings.language);render();}catch(e){announce(t(e.code||'save_failed'));}});
setInterval(()=>{if(!dirty&&!saving&&!editor.open&&(!location.hash||location.hash==='#overview'))render();},60000);

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

boot();
