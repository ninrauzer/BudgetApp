#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Stop all BudgetApp services
.DESCRIPTION
    Stops all running uvicorn (backend) and node (frontend) processes
#>

Write-Host "🛑 Stopping BudgetApp Services..." -ForegroundColor Yellow
Write-Host ""

# Stop backend (uvicorn/python)
$backendProcesses = Get-Process | Where-Object {
    $_.ProcessName -match "python" -and 
    $_.CommandLine -match "uvicorn.*app.main:app"
}

if ($backendProcesses) {
    Write-Host "🔧 Stopping Backend processes..." -ForegroundColor Cyan
    $backendProcesses | ForEach-Object {
        Write-Host "  Stopping PID $($_.Id)..." -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force
    }
} else {
    Write-Host "ℹ️  No backend processes found" -ForegroundColor Gray
}

# Stop frontend (vite)
$frontendProcesses = Get-Process | Where-Object {
    $_.ProcessName -eq "node" -and 
    $_.CommandLine -match "vite"
}

if ($frontendProcesses) {
    Write-Host "⚛️  Stopping Frontend processes..." -ForegroundColor Cyan
    $frontendProcesses | ForEach-Object {
        Write-Host "  Stopping PID $($_.Id)..." -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force
    }
} else {
    Write-Host "ℹ️  No frontend processes found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ All services stopped!" -ForegroundColor Green
