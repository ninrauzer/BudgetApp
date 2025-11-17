#!/bin/bash
# Quick start script for Docker deployment

echo "🚀 Starting BudgetApp with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker compose is available
if ! command -v docker compose &> /dev/null; then
    echo "❌ Error: docker compose not found. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker is running"

# Build and start services
echo "📦 Building images..."
docker compose build

echo "🚀 Starting services..."
docker compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "✅ BudgetApp is running!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📝 Useful commands:"
echo "   View logs:        docker compose logs -f"
echo "   Stop services:    docker compose down"
echo "   Restart services: docker compose restart"
echo ""
