# Sincroniza assets visuales desde Luigi's Gaming hacia Mr. Luigi
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$sources = @(
    Join-Path $root "..\luigis_gaming\referencias_cliente\assets"
    Join-Path $root "..\luigis_gaming\apps\web\public\assets"
)
$dest = Join-Path $root "frontend\public\assets"

New-Item -ItemType Directory -Force -Path $dest | Out-Null

$copied = $false
foreach ($src in $sources) {
    if (Test-Path $src) {
        Write-Host "Copiando desde: $src"
        robocopy $src $dest /E /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
        $copied = $true
    }
}

if (-not $copied) {
    Write-Warning "No se encontraron assets en luigis_gaming. Coloca imágenes en referencias_cliente/assets/ y vuelve a ejecutar."
    New-Item -ItemType Directory -Force -Path (Join-Path $dest "img") | Out-Null
    Write-Host "Carpeta destino creada: $dest\img"
} else {
    Write-Host "Assets sincronizados en: $dest"
}
