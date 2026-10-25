"""Build an offline, view-only preview using the actual app renderer and fictional data."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STAMP = '2026-10-25T09:00:00Z'
projects = [
 {'id':'demo-studio','title':'Studio journal','description':'A small monthly journal for ideas, experiments, and things worth sharing.','next_action':'Outline the opening story','status':'active','position':0,'created_at':STAMP,'updated_at':STAMP},
 {'id':'demo-home','title':'Home refresh','description':'Make the everyday spaces a little more useful, one corner at a time.','next_action':'Compare the two desk layouts','status':'active','position':1,'created_at':STAMP,'updated_at':STAMP},
 {'id':'demo-learning','title':'Learning notes','description':'Turn things I learn into small experiments I can actually try.','next_action':'Choose one idea to put into practice','status':'active','position':2,'created_at':STAMP,'updated_at':STAMP},
]
goals = [
 {'id':'goal-journal','project_id':'demo-studio','title':'Put together the first issue','description':'A useful first edition, with room to evolve.','status':'active','position':0,'created_at':STAMP,'updated_at':STAMP},
 {'id':'goal-routine','project_id':'demo-studio','title':'Find a simple publishing rhythm','description':'','status':'active','position':1,'created_at':STAMP,'updated_at':STAMP},
 {'id':'goal-home','project_id':'demo-home','title':'Create a comfortable work corner','description':'','status':'active','position':0,'created_at':STAMP,'updated_at':STAMP},
 {'id':'goal-learn','project_id':'demo-learning','title':'Try something new this month','description':'','status':'active','position':0,'created_at':STAMP,'updated_at':STAMP},
]
steps = [
 {'id':'step-topics','goal_id':'goal-journal','title':'Choose three topics for the first issue','description':'Start with ideas already in my notebook.','status':'completed','completed_at':'2026-10-25T08:30:00Z','position':0,'created_at':STAMP,'updated_at':STAMP},
 {'id':'step-outline','goal_id':'goal-journal','title':'Outline the opening story','description':'','status':'pending','completed_at':None,'position':1,'created_at':STAMP,'updated_at':STAMP},
 {'id':'step-photos','goal_id':'goal-journal','title':'Gather a few supporting images','description':'Added after working through the first outline.','status':'pending','completed_at':None,'position':2,'created_at':STAMP,'updated_at':STAMP},
 {'id':'step-rhythm','goal_id':'goal-routine','title':'Set aside time for a monthly review','description':'','status':'pending','completed_at':None,'position':0,'created_at':STAMP,'updated_at':STAMP},
 {'id':'step-measure','goal_id':'goal-home','title':'Measure the available space','description':'','status':'completed','completed_at':'2026-10-24T12:10:00Z','position':0,'created_at':STAMP,'updated_at':STAMP},
 {'id':'step-compare','goal_id':'goal-home','title':'Compare the two desk layouts','description':'','status':'pending','completed_at':None,'position':1,'created_at':STAMP,'updated_at':STAMP},
 {'id':'step-collect','goal_id':'goal-learn','title':'Collect a shortlist of ideas','description':'','status':'completed','completed_at':'2026-10-23T14:40:00Z','position':0,'created_at':STAMP,'updated_at':STAMP},
]
entries=[]
for step in steps:
 goal=next(g for g in goals if g['id']==step['goal_id'])
 if step['status']=='completed' or step['id']=='step-photos':
  entries.append({'id':'event-'+step['id'],'project_id':goal['project_id'],'goal_id':goal['id'],'step_id':step['id'],'kind':'event','action':'step_completed' if step['status']=='completed' else 'step_created','text':'The outline needs a little more visual context.' if step['id']=='step-photos' else '', 'agent_name':'','occurred_at':step['completed_at'] or STAMP,'recorded_at':step['completed_at'] or STAMP,'details':{'entity_type':'step','entity_id':step['id'],'title':step['title']}})
entries.extend([
 {'id':'note-goal-1','project_id':'demo-studio','goal_id':'goal-journal','step_id':None,'kind':'summary','action':None,'text':'The first issue can be smaller than originally planned. Keep three useful topics and move the extra ideas to a later issue.','agent_name':None,'occurred_at':'2026-10-25T08:00:00Z','recorded_at':'2026-10-25T08:00:00Z','details':{}},
 {'id':'note-step-1','project_id':'demo-studio','goal_id':'goal-journal','step_id':'step-outline','kind':'issue','action':None,'text':'The opening felt too long. It was trying to cover two different ideas at once.','agent_name':'Claude','occurred_at':'2026-10-25T08:15:00Z','recorded_at':'2026-10-25T08:15:00Z','details':{}},
 {'id':'note-step-2','project_id':'demo-studio','goal_id':'goal-journal','step_id':'step-outline','kind':'note','action':None,'text':'Focus the opening on one idea. Keep the second idea for the next issue.','agent_name':None,'occurred_at':'2026-10-25T08:40:00Z','recorded_at':'2026-10-25T08:40:00Z','details':{}},
])
data={'revision':12,'settings':{'language':'en'},'demo_mode':True,'projects':projects,'goals':goals,'steps':steps,'entries':entries}
html=(ROOT/'templates/index.html').read_text()
css=(ROOT/'static/styles.css').read_text()
parts=[]
for name in ('i18n','api','dates','progress','render','app'):
 code=(ROOT/f'static/js/{name}.js').read_text()
 code=re.sub(r'^import .*?;\n','',code,flags=re.M)
 code=re.sub(r'\bexport (?=(?:async )?(?:function|class|const|let))','',code)
 parts.append(code)
script='window.WORK_TRACKER_PREVIEW='+json.dumps(data,ensure_ascii=False)+';\n'+ '\n'.join(parts)
html=html.replace('<link rel="stylesheet" href="/static/styles.css">','<style>'+css+'</style>')
html=html.replace('<link rel="stylesheet" href="/static/workspace-theme.css">','<style>'+(ROOT/'static/workspace-theme.css').read_text()+'</style>')
html=html.replace('  <script type="module" src="/static/js/app.js"></script>','')
html=html.replace('{{ request_token }}','preview-no-persistence')
html=html.replace('</body>','<script type="module">'+script.replace('</script','<\\/script')+'</script></body>')
html=html.replace('<title>Work Tracker</title>','<title>Work Tracker · View-only preview</title>')
output=ROOT/'devpost/interface-preview.html'
output.write_text(html)
print('View-only preview generated:',output)
