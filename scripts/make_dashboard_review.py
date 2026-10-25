"""Separate view-only design review; never changes the running app or its data."""
from pathlib import Path
import runpy,json,re,base64
ROOT=Path(__file__).resolve().parent.parent
base=runpy.run_path(str(ROOT/'scripts/make_preview.py'))
data=base['data']
data['projects'][0]['icon']='chart';data['projects'][1]['icon']='spark';data['projects'][2]['icon']='book'
data['goals'].append(dict(id='review-done',project_id='demo-learning',title='Choose a learning direction',description='',status='completed',position=1,created_at=base['STAMP'],updated_at=base['STAMP']))
data['steps'].append(dict(id='review-done-step',goal_id='review-done',title='Pick the first experiment',status='completed',completed_at=base['STAMP'],position=0))
for kind,entity,title in [('step','review-done-step','Pick the first experiment'),('goal','review-done','Choose a learning direction')]:
 data['entries'].append(dict(id='review-event-'+kind,project_id='demo-learning',goal_id='review-done',step_id=entity if kind=='step' else None,kind='event',action=kind+'_completed',text='',occurred_at=base['STAMP'],recorded_at=base['STAMP'],details=dict(entity_type=kind,entity_id=entity,title=title)))
parts=[]
for name in ('i18n','api','dates','progress','render','app'):
 code=(ROOT/f'static/js/{name}.js').read_text()
 code=re.sub(r'^import .*?;\n','',code,flags=re.M)
 code=re.sub(r'\bexport (?=(?:async )?(?:function|class|const|let))','',code)
 if name=='render':
  code=code.replace("const shapes={","const shapes={\n calendar:['M4 5h16v16H4ZM4 10h16M8 3v4M16 3v4'],download:['M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5'],lock:['M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5Z'],")
  code=code.replace("target:['M20 12a8 8 0 1 1-8-8','M16 12a4 4 0 1 1-4-4','M12 12 21 3m-6 0h6v6']", "target:['M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0M13 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0']")
  code=code.replace("if(action.includes('complet'))return t('stepCompleted');","if(action.includes('complet'))return entity==='goal'?rtext('Goal completed','اكتمل الهدف'):t('stepCompleted');")
 if name=='app':
  for function in ('renderHeader','renderOverview','render'):
   code=code.replace('function '+function+'(', 'function base'+function[0].upper()+function[1:]+'(')
  code=code.removesuffix('boot();\n')
 parts.append(code)
script='window.WORK_TRACKER_PREVIEW='+json.dumps(data,ensure_ascii=False)+';\n'+'\n'.join(parts)+'\n'+(ROOT/'design-review/dashboard.js').read_text()+'\nboot();'
html=(ROOT/'templates/index.html').read_text().replace('{{ request_token }}','preview-no-persistence')
html=html.replace('  <script type="module" src="/static/js/app.js"></script>','')
for file in ('styles.css','workspace-theme.css'):
 html=html.replace(f'<link rel="stylesheet" href="/static/{file}">','<style>'+(ROOT/'static'/file).read_text()+'</style>')
mark=base64.b64encode((ROOT/'design-review/mark.svg').read_bytes()).decode()
html=html.replace('</head>',f'<link rel="icon" href="data:image/svg+xml;base64,{mark}"></head>')
html=html.replace('</head>','<style>'+(ROOT/'design-review/dashboard.css').read_text()+'</style></head>')
html=html.replace('</body>','<script type="module">'+script.replace('</script','<\\/script')+'</script></body>')
html=html.replace('<title>Work Tracker</title>','<title>Work Tracker · Dashboard design review</title>')
(ROOT/'devpost/dashboard-preview.html').write_text(html)
folder=ROOT/'qa/dashboard-review';folder.mkdir(parents=True,exist_ok=True);(folder/'index.html').write_text(html)
print('Dashboard review generated; no saved user data used.')
