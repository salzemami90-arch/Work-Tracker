#!/bin/sh
set -eu
PROJECT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
if [ ! -x "$PROJECT_DIR/runtime-env/bin/python" ]; then
  echo "The local Python environment is missing. Follow setup in README.md." >&2
  exit 1
fi
if ! "$PROJECT_DIR/runtime-env/bin/python" -c "import flask" >/dev/null 2>&1; then
  echo "Flask is not installed. Run runtime-env/bin/python -m pip install -r requirements.txt from the project folder." >&2
  exit 1
fi
exec "$PROJECT_DIR/runtime-env/bin/python" "$PROJECT_DIR/app.py" "$@"
