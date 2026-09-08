# Retinix / IIC26 Development Server Launcher for Windows PowerShell
$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendVenv = Join-Path $rootDir "backend\.venv\Scripts"
$backendDir = Join-Path $rootDir "backend"
$frontendDir = Join-Path $rootDir "frontend"

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   Starting Retinix Development Servers...          " -ForegroundColor Yellow
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Backend API:  http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend App: http://localhost:3000" -ForegroundColor Green
Write-Host "API Docs:     http://localhost:8000/docs" -ForegroundColor Green
Write-Host "Healthcheck:  http://localhost:8000/up" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan

$backendProcess = Start-Process -FilePath (Join-Path $backendVenv "uvicorn.exe") `
    -ArgumentList "app.main:app --reload --host 127.0.0.1 --port 8000" `
    -WorkingDirectory $backendDir `
    -PassThru

Set-Location $frontendDir
Write-Host "Starting Retinix frontend on http://localhost:3000..." -ForegroundColor Cyan
try {
    npm run dev
} finally {
    if ($backendProcess -and -not $backendProcess.HasExited) {
        Write-Host "Stopping backend..." -ForegroundColor Yellow
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
