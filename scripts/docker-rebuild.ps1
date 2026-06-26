# Rebuild completo Docker Mr. Luigi
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "=== Mr. Luigi — Docker Rebuild ===" -ForegroundColor Cyan

& (Join-Path $PSScriptRoot "sync-assets.ps1")

Set-Location (Join-Path $root "docker")
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d --build

Write-Host ""
Write-Host "Frontend: http://localhost:5507" -ForegroundColor Green
Write-Host "API:      http://localhost:3007/api/health" -ForegroundColor Green
