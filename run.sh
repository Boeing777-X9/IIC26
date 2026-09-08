#!/bin/sh

set -u

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
BACKEND_VENV="$ROOT_DIR/backend/.venv"

BACKEND_PID=
FRONTEND_PID=

cleanup() {
    trap - INT TERM EXIT
    kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}

trap cleanup INT TERM EXIT

if [ ! -x "$BACKEND_VENV/bin/uvicorn" ]; then
    printf 'Installing backend dependencies...\n'
    python3 -m venv "$BACKEND_VENV" || exit 1
    "$BACKEND_VENV/bin/python" -m pip install -r "$ROOT_DIR/backend/requirements.txt" || exit 1
fi

if [ ! -x "$ROOT_DIR/frontend/node_modules/.bin/next" ]; then
    printf 'Installing frontend dependencies...\n'
    npm --prefix "$ROOT_DIR/frontend" ci || exit 1
fi

(
    cd "$ROOT_DIR/backend" || exit 1
    exec "$BACKEND_VENV/bin/uvicorn" app.main:app --reload
) &
BACKEND_PID=$!

(
    cd "$ROOT_DIR/frontend" || exit 1
    exec npm run dev
) &
FRONTEND_PID=$!

printf 'Backend: http://localhost:8000\n'
printf 'Frontend: http://localhost:3000\n'
printf 'Healthcheck: http://localhost:8000/up\n'

wait "$BACKEND_PID" "$FRONTEND_PID"
