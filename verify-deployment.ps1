# Verify Docker deployment is working correctly

Write-Host "🔍 Verifying BudgetApp Docker deployment..." -ForegroundColor Cyan
Write-Host ""

# Check Docker
try {
    docker --version | Out-Null
    Write-Host "✅ Docker installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found" -ForegroundColor Red
    exit 1
}

# Check docker compose
try {
    docker compose version | Out-Null
    Write-Host "✅ Docker Compose installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose not found" -ForegroundColor Red
    exit 1
}

# Check services
Write-Host ""
Write-Host "📊 Checking services..." -ForegroundColor Cyan

$services = docker compose ps --format json | ConvertFrom-Json
$backendRunning = $services | Where-Object { $_.Service -eq "backend" -and $_.State -eq "running" }
$frontendRunning = $services | Where-Object { $_.Service -eq "frontend" -and $_.State -eq "running" }

if ($backendRunning) {
    Write-Host "✅ Backend is running" -ForegroundColor Green
} else {
    Write-Host "❌ Backend is not running" -ForegroundColor Red
    exit 1
}

if ($frontendRunning) {
    Write-Host "✅ Frontend is running" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend is not running" -ForegroundColor Red
    exit 1
}

# Check backend health
Write-Host ""
Write-Host "🏥 Checking backend health..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -UseBasicParsing
    if ($response.Content -match "ok") {
        Write-Host "✅ Backend health check passed" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend health check failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Backend health check failed: $_" -ForegroundColor Red
    exit 1
}

# Check frontend
Write-Host ""
Write-Host "🏥 Checking frontend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing
    if ($response.Content -match "BudgetApp") {
        Write-Host "✅ Frontend is responding" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend is not responding" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Frontend is not responding: $_" -ForegroundColor Red
    exit 1
}

# Check database
Write-Host ""
Write-Host "💾 Checking database..." -ForegroundColor Cyan
if (Test-Path "./data/budget.db") {
    Write-Host "✅ Database file exists" -ForegroundColor Green
    $size = (Get-Item "./data/budget.db").Length
    $sizeKB = [math]::Round($size / 1KB, 2)
    Write-Host "   Size: $sizeKB KB" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Database file not found (will be created on first use)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ All checks passed! BudgetApp is running correctly." -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access the application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost" -ForegroundColor White
Write-Host "   Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White
