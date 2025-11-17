#!/bin/bash
# Verify Docker deployment is working correctly

echo "🔍 Verifying BudgetApp Docker deployment..."
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found"
    exit 1
fi
echo "✅ Docker installed"

# Check docker compose
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose not found"
    exit 1
fi
echo "✅ Docker Compose installed"

# Check services
echo ""
echo "📊 Checking services..."
if docker compose ps | grep -q "budgetapp-backend.*running"; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running"
    exit 1
fi

if docker compose ps | grep -q "budgetapp-frontend.*running"; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is not running"
    exit 1
fi

# Check backend health
echo ""
echo "🏥 Checking backend health..."
if curl -s http://localhost:8000/api/health | grep -q "ok"; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Check frontend
echo ""
echo "🏥 Checking frontend..."
if curl -s http://localhost | grep -q "BudgetApp"; then
    echo "✅ Frontend is responding"
else
    echo "❌ Frontend is not responding"
    exit 1
fi

# Check database
echo ""
echo "💾 Checking database..."
if [ -f "./data/budget.db" ]; then
    echo "✅ Database file exists"
    SIZE=$(du -h ./data/budget.db | cut -f1)
    echo "   Size: $SIZE"
else
    echo "⚠️  Database file not found (will be created on first use)"
fi

echo ""
echo "✅ All checks passed! BudgetApp is running correctly."
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
