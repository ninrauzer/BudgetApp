# BudgetApp - Docker Commands Makefile

.PHONY: help build up down restart logs clean rebuild

# Default target
help:
	@echo "🚀 BudgetApp - Docker Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  build     - Build Docker images"
	@echo "  up        - Start all services"
	@echo "  down      - Stop all services"
	@echo "  restart   - Restart all services"
	@echo "  logs      - View logs (follow mode)"
	@echo "  clean     - Stop and remove volumes (⚠️  deletes database)"
	@echo "  rebuild   - Rebuild images from scratch"
	@echo "  status    - Show service status"
	@echo "  shell-be  - Open shell in backend container"
	@echo "  shell-fe  - Open shell in frontend container"
	@echo ""

# Build images
build:
	@echo "📦 Building Docker images..."
	docker compose build

# Start services
up:
	@echo "🚀 Starting services..."
	docker compose up -d
	@echo "✅ Services started!"
	@echo "Frontend: http://localhost"
	@echo "Backend:  http://localhost:8000"

# Stop services
down:
	@echo "🛑 Stopping services..."
	docker compose down

# Restart services
restart:
	@echo "🔄 Restarting services..."
	docker compose restart

# View logs
logs:
	@echo "📋 Viewing logs (Ctrl+C to exit)..."
	docker compose logs -f

# Clean everything (including volumes)
clean:
	@echo "🧹 Cleaning up (this will DELETE the database)..."
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v; \
		echo "✅ Cleanup complete"; \
	else \
		echo "❌ Cancelled"; \
	fi

# Rebuild from scratch
rebuild:
	@echo "🔨 Rebuilding from scratch..."
	docker compose build --no-cache
	docker compose up -d

# Show service status
status:
	@echo "📊 Service Status:"
	docker compose ps

# Open shell in backend
shell-be:
	@echo "🐚 Opening shell in backend container..."
	docker compose exec backend bash

# Open shell in frontend
shell-fe:
	@echo "🐚 Opening shell in frontend container..."
	docker compose exec frontend sh

# Initialize database
init-db:
	@echo "💾 Initializing database..."
	docker compose exec backend python scripts/init_db.py

# Backup database
backup:
	@echo "💾 Creating database backup..."
	@mkdir -p backups
	docker compose exec backend cp /app/data/budget.db /app/data/budget_backup_$$(date +%Y%m%d_%H%M%S).db
	docker cp budgetapp-backend:/app/data/budget_backup_$$(date +%Y%m%d_%H%M%S).db ./backups/
	@echo "✅ Backup created in ./backups/"

# View backend logs only
logs-be:
	docker compose logs -f backend

# View frontend logs only
logs-fe:
	docker compose logs -f frontend
