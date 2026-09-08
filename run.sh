#!/bin/sh

set -u

BACKEND_PID=
FRONTEND_PID=

cleanup() {
    trap - INT TERM EXIT
    kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}

trap cleanup INT TERM EXIT

(
    cd backend || exit 1
    exec uvicorn app.main:app --reload
) &
BACKEND_PID=$!

(
    cd frontend || exit 1
    exec npm run dev
) &
FRONTEND_PID=$!

printf 'Backend: http://localhost:8000\n'
printf 'Frontend: http://localhost:3000\n'
printf 'Healthcheck: http://localhost:8000/up\n'

wait "$BACKEND_PID" "$FRONTEND_PID"
