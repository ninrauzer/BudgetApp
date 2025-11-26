#!/usr/bin/env bash
# Build script for Render.com deployment
# This builds both frontend and backend

set -e  # Exit on error

echo "🔨 Building BudgetApp for Render..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm ci --production=false
npm run build
cd ..

# Install backend dependencies
echo "🐍 Installing backend dependencies..."
cd backend
pip install -r requirements.txt

# Create database tables if they don't exist
echo "🗄️  Ensuring database tables exist..."
python create_tables_supabase.py
cd ..

echo "✅ Build complete!"
