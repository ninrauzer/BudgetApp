# Script para alternar entre entornos
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('dev','prod')]
    [string]$Environment
)

$ErrorActionPreference = "Stop"

$envFile = ".env.$Environment"
$targetFile = ".env"

if (-not (Test-Path $envFile)) {
    Write-Host "❌ Error: $envFile no existe" -ForegroundColor Red
    exit 1
}

Copy-Item $envFile $targetFile -Force
Write-Host "✅ Entorno cambiado a: $Environment" -ForegroundColor Green
Write-Host ""

# Mostrar qué BD se está usando
$content = Get-Content $targetFile
$dbLine = $content | Where-Object { $_ -match "^DATABASE_URL=" }
if ($dbLine -match "sqlite") {
    Write-Host "📂 Base de datos: SQLite local (dev_budget.db)" -ForegroundColor Cyan
} elseif ($dbLine -match "supabase") {
    Write-Host "☁️  Base de datos: Supabase PostgreSQL (producción)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💡 Recuerda reiniciar el backend si está corriendo" -ForegroundColor Gray
