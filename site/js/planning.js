export function dayKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function overviewData(state,now=new Date()){
 const today=dayKey(now),start=new Date(now.getFullYear(),now.getMonth(),now.getDate()-now.getDay());
 const end=new Date(start.getFullYear(),start.getMonth(),start.getDate()+7),upcomingEnd=dayKey(new Date(now.getFullYear(),now.getMonth(),now.getDate()+6));
 const projects=new Map(state.projects.map(p=>[p.id,p])),goals=new Map(state.goals.map(g=>[g.id,g]));
 const activeGoals=state.goals.filter(g=>g.status==='active'&&projects.get(g.project_id)?.status!=='paused');
 const weekEvents=state.entries.filter(e=>{const d=new Date(e.occurred_at);return d>=start&&d<end&&d<=now;});
 const completedCount=action=>new Set(weekEvents.filter(e=>e.action===action).map(e=>e.details?.entity_id||e.step_id||e.goal_id)).size;
 const plannedSteps=state.steps.filter(s=>s.status==='pending'&&!s.archived_at&&s.planned_for&&projects.get(goals.get(s.goal_id)?.project_id)?.status!=='paused').sort((a,b)=>a.planned_for.localeCompare(b.planned_for));
 const todaySteps=plannedSteps.filter(s=>s.planned_for<=today),weekSteps=plannedSteps.filter(s=>s.planned_for<dayKey(end));
 const deadlines=[];
 for(const [type,items] of [['project',state.projects],['goal',state.goals],['step',state.steps]])for(const item of items){
  if(!item.due_date||item.archived_at||item.status==='completed')continue;
  const project=type==='project'?item:projects.get(type==='goal'?item.project_id:goals.get(item.goal_id)?.project_id);
  if(!project)continue;deadlines.push({type,item,project,overdue:item.due_date<today});
 }
 deadlines.sort((a,b)=>a.item.due_date.localeCompare(b.item.due_date));
 return {today,start,end,activeGoals,weekEvents,todaySteps,weekSteps,deadlines:deadlines.filter(d=>d.item.due_date<=upcomingEnd),upcomingCount:deadlines.filter(d=>!d.overdue&&d.item.due_date<=upcomingEnd).length,goalsCompleted:completedCount('goal_completed'),stepsCompleted:completedCount('step_completed')};
}
