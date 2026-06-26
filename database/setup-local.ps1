# Mr. Luigi — Levantar base de datos PostgreSQL LOCAL (sin Docker)
# Uso: powershell -ExecutionPolicy Bypass -File database/setup-local.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $ProjectRoot "backend\.env"

function Find-Psql {
    $cmd = Get-Command psql -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    foreach ($v in 18, 17, 16, 15, 14) {
        $path = "C:\Program Files\PostgreSQL\$v\bin\psql.exe"
        if (Test-Path $path) { return $path }
    }
    return $null
}

function Read-DotEnvValue($filePath, $key) {
    if (-not (Test-Path $filePath)) { return $null }
    foreach ($line in Get-Content $filePath) {
        if ($line -match "^\s*$key\s*=\s*(.+)\s*$") {
            return $matches[1].Trim()
        }
    }
    return $null
}

$psql = Find-Psql
if (-not $psql) {
    Write-Host "PostgreSQL no encontrado." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $EnvFile)) {
    Copy-Item (Join-Path $ProjectRoot "backend\.env.example") $EnvFile
    Write-Host "Creado backend/.env desde .env.example" -ForegroundColor Yellow
}

$dbPassword = Read-DotEnvValue $EnvFile "DB_PASSWORD"
if (-not $dbPassword) { $dbPassword = "tu_password_seguro" }

$postgresPassword = $env:POSTGRES_PASSWORD
if (-not $postgresPassword) {
    $postgresEnvFile = Join-Path $ProjectRoot ".env.postgres.local"
    $postgresPassword = Read-DotEnvValue $postgresEnvFile "POSTGRES_PASSWORD"
}
if (-not $postgresPassword) {
    $secure = Read-Host "Contraseña del superusuario POSTGRES" -AsSecureString
    $postgresPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    )
}

$env:PGPASSWORD = $postgresPassword

$sqlCreateUser = @"
DO `$`$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'mr_luigi_user') THEN
    CREATE USER mr_luigi_user WITH PASSWORD '$dbPassword';
  ELSE
    ALTER USER mr_luigi_user WITH PASSWORD '$dbPassword';
  END IF;
END
`$`$;
"@

& $psql -U postgres -h localhost -d postgres -c $sqlCreateUser
$dbExists = & $psql -U postgres -h localhost -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'mr_luigi_db'"
if (-not $dbExists -or $dbExists.Trim() -ne "1") {
    & $psql -U postgres -h localhost -d postgres -c "CREATE DATABASE mr_luigi_db OWNER mr_luigi_user"
} else {
    Write-Host "Base mr_luigi_db ya existe." -ForegroundColor Yellow
}

$initSql = Join-Path $PSScriptRoot "init-mr-luigi-postgres.sql"
$env:PGPASSWORD = $dbPassword
& $psql -U mr_luigi_user -h localhost -d mr_luigi_db -f $initSql

Write-Host "Base de datos Mr. Luigi lista." -ForegroundColor Green
Write-Host "Siguiente: cd backend && npm run seed && npm run dev"
