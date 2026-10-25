"""Build the unseeded browser-local app for local review before any Sites publication."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parent.parent
out=ROOT/'site';(out/'js').mkdir(parents=True,exist_ok=True)
parts=[]
for name in ('i18n','dates','progress','render','app'):
 code=(ROOT/f'static/js/{name}.js').read_text()
 code=re.sub(r'^import .*?;\n','',code,flags=re.M)
 code=re.sub(r'\bexport (?=(?:async )?(?:function|class|const|let))','',code)
 if name=='app':
  code=code.replace('const previewData = window.WORK_TRACKER_PREVIEW || null;', 'const previewData = null;')
  for fn in ('renderHeader','renderOverview','render','showCreate','goalCard','stepRow','renderProject','contextNotes','showContextNote','closeEditor'):
   code=code.replace('function '+fn+'(', 'function base'+fn[0].upper()+fn[1:]+'(')
  code=code.removesuffix('boot();\n')
 if name=='dates':
  code=code.replace('const parsed=new Date(value);', "const parsed=new Date(/^\\d{4}-\\d{2}-\\d{2}$/.test(value)?value+'T12:00:00':value);")
 if name=='render':
  code=code.replace("project_updated:'changed'","project_updated:'projectUpdated'")
  code=code.replace("const direct={", "const direct={project_paused:'projectPaused',project_resumed:'projectResumed',step_deferred:'stepDeferred',step_reopened:'stepReopened',step_resumed:'stepResumed',project_reordered:'projectReordered',goal_reordered:'goalReordered',step_reordered:'stepReordered',goal_updated:'goalUpdated',step_updated:'stepUpdated',entry_edited:'entryEdited',goal_completed:'goalCompleted',goal_reopened:'goalReopened',project_dates_updated:'datesUpdated',goal_dates_updated:'datesUpdated',step_dates_updated:'datesUpdated',")
  code=code.replace("const reason=entry.text || detail.reason;", "if(entry.action==='entry_edited'){body.append(textNode('p','event-note',t('originalText')+': '+(detail.before?.text||'')),textNode('p','event-note',t('updatedText')+': '+(detail.after?.text||'')));} if(entry.action==='step_completed'&&state.steps.find(s=>s.id===entry.step_id)?.status!=='completed')body.append(badge(t('reopened'),'neutral')); if(entry.action==='goal_completed'&&state.goals.find(g=>g.id===entry.goal_id)?.status!=='completed')body.append(badge(t('reopened'),'neutral')); const reason=entry.text || detail.reason;")
 parts.append(code)
imports="import {ApiError,readState,mutate,exportBackup,inspectBackup,restoreBackup,listRecoveryCopies,exportRecoveryCopy} from './api.js';\nimport {dayKey,overviewData} from './planning.js';\n"
(out/'js/app.js').write_text(imports+'\n'.join(parts)+'\n'+(ROOT/'site-src/icons.js').read_text()+'\n'+(ROOT/'site-src/dashboard.js').read_text()+'\n'+(ROOT/'site-src/workflow.js').read_text()+'\nboot();\n')
(out/'app.css').write_text('\n'.join((ROOT/p).read_text() for p in ['static/styles.css','static/workspace-theme.css','site-src/dashboard.css']))
(out/'mark.svg').write_text((ROOT/'design-review/mark.svg').read_text())
html=(ROOT/'templates/index.html').read_text()
html=re.sub(r'  <meta name="request-token"[^>]*>\n','',html)
html=html.replace('<link rel="stylesheet" href="/static/styles.css">','<link rel="stylesheet" href="./app.css">').replace('  <link rel="stylesheet" href="/static/workspace-theme.css">','  <link rel="icon" href="./mark.svg">')
html=html.replace('/static/js/app.js','./js/app.js')
html=html.replace('Opening your workspace…','Opening workspace…')
html=html.replace('<meta name="color-scheme" content="light">','<meta name="color-scheme" content="light">\n  <meta name="description" content="Projects, goals, steps, and progress — stored locally in this browser.">')
(out/'index.html').write_text(html)
print('Built site/: empty on first visit; browser-local storage; no publication.')
