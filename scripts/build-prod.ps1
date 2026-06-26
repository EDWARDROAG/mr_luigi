# Build de producción Mr. Luigi
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "=== Mr. Luigi — Build Producción ===" -ForegroundColor Cyan

& (Join-Path $PSScriptRoot "sync-assets.ps1")

Set-Location (Join-Path $root "frontend")
npm run build:prod

Set-Location (Join-Path $root "backend")
npm ci --omit=dev

Write-Host "Build completado." -ForegroundColor Green
Write-Host "Frontend: frontend/dist/frontend/browser"
Write-Host "Backend:  backend/ (node src/server.js)"
