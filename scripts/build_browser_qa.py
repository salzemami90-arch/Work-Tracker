"""Prepare isolated browser transaction tests; never serve the repository root."""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parent.parent
out=root/'qa/browser-integration-harness'
(out/'js').mkdir(parents=True,exist_ok=True)
for name in ('index.html','harness.js'):
    shutil.copyfile(root/'tests/browser-harness'/name,out/name)
for name in ('api.js','store-core.js'):
    shutil.copyfile(root/'site/js'/name,out/'js'/name)
print('Prepared qa/browser-integration-harness. Serve only that folder on a separate origin, e.g. port 8773.')
