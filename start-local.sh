#!/bin/sh
# First-time setup and normal startup; never resets existing work.
set -eu
PROJECT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$PROJECT_DIR"

if [ ! -x runtime-env/bin/python ]; then
  python3 -m venv runtime-env
fi

if ! runtime-env/bin/python -c 'from importlib.metadata import version; import flask; assert version("Flask") == "3.1.3"' >/dev/null 2>&1; then
  echo "Installing the local app's requirements. Internet is needed for this first setup."
  REQUIREMENTS_FILE=requirements.txt
  if [ -f requirements-lock.txt ]; then
    REQUIREMENTS_FILE=requirements-lock.txt
  fi
  if ! runtime-env/bin/python -m pip install --retries 1 --timeout 20 -r "$REQUIREMENTS_FILE"; then
    echo "Setup could not finish. The saving app has NOT started." >&2
    echo "Keep this message and share it for troubleshooting. Existing work has not been reset." >&2
    exit 1
  fi
fi

echo "Starting the saving app. Keep this Terminal window open."
echo "When the server is running, open http://127.0.0.1:8766"
echo "The visual preview on port 8765 does not save."
exec sh "$PROJECT_DIR/run.sh" "$@"
