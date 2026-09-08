@echo off
title Retinix Development Servers
echo =================================================
echo    Starting Retinix Backend and Frontend...
echo =================================================
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo =================================================

start "Retinix Backend" cmd /k "cd /d %~dp0backend && .venv\Scripts\uvicorn.exe app.main:app --reload --port 8000"
cd /d %~dp0frontend
npm run dev
