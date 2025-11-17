#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Launch BudgetApp backend and frontend services in separate windows
.DESCRIPTION
    Starts the FastAPI backend and Vite frontend in separate PowerShell windows
#>

Write-Host "Starting BudgetApp Services..." -ForegroundColor Cyan
Write-Host ""

# Get the script directory (project root)
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# Backend path
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = Join-Path $projectRoot "frontend"

# Check if paths exist
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Backend directory not found: $backendPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Frontend directory not found: $frontendPath" -ForegroundColor Red
    exit 1
}

# Start Backend in new window
Write-Host "Starting Backend FastAPI..." -ForegroundColor Yellow
$backendCmd = "Set-Location '$backendPath'; & '.\server.ps1'"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", $backendCmd

Start-Sleep -Seconds 2

# Start Frontend in new window
Write-Host "Starting Frontend Vite + React..." -ForegroundColor Yellow
$frontendCmd = "Set-Location '$frontendPath'; npm run dev; Write-Host ''; Read-Host 'Press Enter to close'"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host ""
Write-Host "Services launched successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Close the service windows to stop the servers" -ForegroundColor Gray
