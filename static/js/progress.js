// Current-plan progress is separate from dated achievement history.
export function stepProgress(steps, goalId){
 const current=steps.filter(step=>step.goal_id===goalId && !step.archived_at);
 const done=current.filter(step=>step.status==='completed').length;
 return {total:current.length,done,remaining:current.length-done,percent:current.length?100*done/current.length:0};
}
export function goalCounts(goals,projects){
 const paused=new Set(projects.filter(p=>p.status==='paused').map(p=>p.id));
 return {total:goals.length,active:goals.filter(g=>g.status==='active'&&!paused.has(g.project_id)).length,
 completed:goals.filter(g=>g.status==='completed').length,
 paused:goals.filter(g=>g.status==='active'&&paused.has(g.project_id)).length};
}
export const projectIcons=['folder','chart','spark','award','document','book','code','heart'];
export function projectIconName(project){return projectIcons.includes(project.icon)?project.icon:'folder';}
