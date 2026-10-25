#!/bin/sh
# Uses the existing runtime, never installs or resets data.
set -eu
APP_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$APP_ROOT"
exec "$APP_ROOT/runtime-env/bin/python" -m http.server "${1:-8771}" --bind 127.0.0.1 --directory "$APP_ROOT/site"
