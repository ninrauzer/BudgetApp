# Quick Start Script - Inicia ambos servidores
Set-Location E:\Desarrollo\BudgetApp

Write-Host "`n🚀 Iniciando BudgetApp..." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════`n" -ForegroundColor Cyan

# Backend
Write-Host "📦 Iniciando Backend (FastAPI)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location 'E:\Desarrollo\BudgetApp\backend'; .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"
)

Start-Sleep -Seconds 3

# Frontend
Write-Host "⚛️  Iniciando Frontend (React + Vite)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location 'E:\Desarrollo\BudgetApp\frontend'; npm run dev"
)

Start-Sleep -Seconds 3

Write-Host "`n✅ Servidores iniciados!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════`n" -ForegroundColor Green

Write-Host "📍 URLs disponibles:" -ForegroundColor White
Write-Host "   Frontend:  " -NoNewline -ForegroundColor Gray
Write-Host "http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Backend:   " -NoNewline -ForegroundColor Gray
Write-Host "http://localhost:8000" -ForegroundColor Cyan
Write-Host "   API Docs:  " -NoNewline -ForegroundColor Gray
Write-Host "http://localhost:8000/docs" -ForegroundColor Cyan

Write-Host "`nPresiona Ctrl+C para salir (los servidores seguirán corriendo en sus ventanas)" -ForegroundColor DarkGray
