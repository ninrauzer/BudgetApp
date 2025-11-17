#!/usr/bin/env bash
# Build script for Render.com

set -o errexit  # Exit on error

echo "🔨 Building BudgetApp backend..."

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Create data directory if it doesn't exist
echo "📁 Creating data directory..."
mkdir -p data

# Initialize database if it doesn't exist
if [ ! -f "data/budget.db" ]; then
    echo "🗄️  Initializing database..."
    python scripts/init_db.py
else
    echo "✅ Database already exists"
fi

echo "✅ Backend build complete!"
