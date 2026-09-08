#!/bin/bash
set -e

# Load credentials from atlas-credentials.env, backend/.env, or root .env if present
if [ -f "/app/atlas-credentials.env" ]; then
  echo "Loading environment from /app/atlas-credentials.env..."
  export $(grep -v '^#' /app/atlas-credentials.env | xargs)
elif [ -f "/app/backend/.env" ]; then
  echo "Loading environment from /app/backend/.env..."
  export $(grep -v '^#' /app/backend/.env | xargs)
elif [ -f "/app/.env" ]; then
  echo "Loading environment from /app/.env..."
  export $(grep -v '^#' /app/.env | xargs)
fi

echo "========================================================"
echo " Starting Retinix Unified Service (Backend + Frontend)"
echo "========================================================"

# 1. Start FastAPI backend on internal port 8000
echo "--> Starting FastAPI backend on port 8000..."
cd /app/backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait briefly for FastAPI to initialize
sleep 2

# 2. Start Next.js frontend on PORT (default 3000)
FRONTEND_PORT=${PORT:-3000}
echo "--> Starting Next.js frontend on port ${FRONTEND_PORT}..."
cd /app/frontend
PORT=${FRONTEND_PORT} HOSTNAME="0.0.0.0" node server.js &
FRONTEND_PID=$!

echo "✓ Retinix running successfully!"
echo "  - Web App: http://0.0.0.0:${FRONTEND_PORT}"
echo "  - FastAPI: http://0.0.0.0:8000"

# Graceful termination handler
trap 'echo "Shutting down services..."; kill -TERM $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' SIGTERM SIGINT

# Wait for either process to exit
wait -n $BACKEND_PID $FRONTEND_PID
EXIT_CODE=$?
echo "A service stopped (exit code $EXIT_CODE). Terminating remaining processes..."
kill -TERM $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
exit $EXIT_CODE
