# Quick start script for Docker deployment (Windows)

Write-Host "🚀 Starting BudgetApp with Docker..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Build and start services
Write-Host "📦 Building images..." -ForegroundColor Yellow
docker compose build

Write-Host "🚀 Starting services..." -ForegroundColor Yellow
docker compose up -d

# Wait for services to be healthy
Write-Host "⏳ Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service status
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker compose ps

Write-Host ""
Write-Host "✅ BudgetApp is running!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access the application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost"
Write-Host "   Backend:  http://localhost:8000"
Write-Host "   API Docs: http://localhost:8000/docs"
Write-Host ""
Write-Host "📝 Useful commands:" -ForegroundColor Cyan
Write-Host "   View logs:        docker compose logs -f"
Write-Host "   Stop services:    docker compose down"
Write-Host "   Restart services: docker compose restart"
Write-Host ""
