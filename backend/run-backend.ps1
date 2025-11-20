# Backend startup script
param(
    [switch]$NoReload
)

Write-Host "🚀 Starting BudgetApp Backend..." -ForegroundColor Green
Write-Host "📍 Working directory: $(Get-Location)" -ForegroundColor Cyan

# Activate venv
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
& .\.venv\Scripts\Activate.ps1

# Start uvicorn
$reloadFlag = if ($NoReload) { "" } else { "--reload" }
Write-Host "⚡ Starting Uvicorn on http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "📝 API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host ""

python -m uvicorn app.main:app $reloadFlag --host 127.0.0.1 --port 8000
