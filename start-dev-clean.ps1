#!/usr/bin/env pwsh
# Start BudgetApp Backend and Frontend

Write-Host "=== Starting BudgetApp Backend and Frontend ===" -ForegroundColor Cyan

# Start Backend in new window
Write-Host "Starting Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
$backendCmd = "cd e:\Desarrollo\BudgetApp\backend; e:\Desarrollo\BudgetApp\backend\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Normal

# Wait for backend to start
Start-Sleep -Seconds 5

# Start Frontend in new window
Write-Host "Starting Frontend on http://localhost:5174..." -ForegroundColor Yellow
$frontendCmd = "cd e:\Desarrollo\BudgetApp\frontend; npm run dev"
Start-Process pwsh -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal

# Wait for frontend to start
Start-Sleep -Seconds 5

Write-Host "`n=== Both servers started! ===" -ForegroundColor Green
Write-Host "Backend:  http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5174" -ForegroundColor Cyan
Write-Host "Credit Cards Page: http://localhost:5174/credit-cards" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C in each window to stop the servers" -ForegroundColor Yellow
