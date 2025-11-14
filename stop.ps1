# Stop All Servers Script
Write-Host "`n🛑 Deteniendo servidores de BudgetApp..." -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════`n" -ForegroundColor Yellow

# Stop Backend (port 8000)
$backend = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($backend) {
    Stop-Process -Id $backend.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Backend detenido" -ForegroundColor Green
} else {
    Write-Host "○ Backend no estaba corriendo" -ForegroundColor Gray
}

# Stop Frontend (port 5173)
$frontend = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($frontend) {
    Stop-Process -Id $frontend.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Frontend detenido" -ForegroundColor Green
} else {
    Write-Host "○ Frontend no estaba corriendo" -ForegroundColor Gray
}

Write-Host "`n✅ Todos los servidores detenidos`n" -ForegroundColor Green
