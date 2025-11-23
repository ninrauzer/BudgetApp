#!/bin/bash

# BudgetApp - Mac Setup Script
# Automatiza la instalación en Mac

set -e  # Exit on error

echo "🍎 BudgetApp Setup para Mac"
echo "================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar/Instalar Homebrew
echo "📦 Verificando Homebrew..."
if ! command -v brew &> /dev/null; then
    echo "Instalando Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi
echo -e "${GREEN}✓ Homebrew OK${NC}"

# 2. Instalar dependencias
echo ""
echo "📦 Instalando dependencias..."

echo "  • Node.js..."
brew install node@18 2>/dev/null || brew upgrade node@18
echo -e "  ${GREEN}✓${NC} Node.js $(node --version)"

echo "  • Python..."
brew install python@3.11 2>/dev/null || brew upgrade python@3.11
echo -e "  ${GREEN}✓${NC} Python $(python3 --version)"

echo "  • PostgreSQL client..."
brew install postgresql 2>/dev/null || brew upgrade postgresql
echo -e "  ${GREEN}✓${NC} psql $(psql --version | cut -d' ' -f3)"

echo "  • Git..."
brew install git 2>/dev/null || brew upgrade git
echo -e "  ${GREEN}✓${NC} Git $(git --version | cut -d' ' -f3)"

# 3. Clonar repositorio (si no existe)
echo ""
echo "📂 Configurando repositorio..."

PROJECT_DIR="$HOME/Projects/BudgetApp"
if [ -d "$PROJECT_DIR" ]; then
    echo "  BudgetApp ya existe en $PROJECT_DIR"
    cd "$PROJECT_DIR"
    git pull origin master
else
    mkdir -p "$HOME/Projects"
    cd "$HOME/Projects"
    git clone https://github.com/ninrauzer/BudgetApp.git
    cd BudgetApp
fi

echo -e "  ${GREEN}✓${NC} Repositorio en $PROJECT_DIR"

# 4. Setup Backend
echo ""
echo "🔧 Setup Backend..."
cd backend

echo "  • Creando virtual environment..."
python3 -m venv .venv
source .venv/bin/activate

echo "  • Instalando dependencias..."
pip install --upgrade pip -q
pip install -r requirements.txt -q

echo -e "  ${GREEN}✓${NC} Backend OK"

# 5. Setup Frontend
echo ""
echo "🎨 Setup Frontend..."
cd ../frontend

echo "  • Instalando npm packages..."
npm install --silent

echo -e "  ${GREEN}✓${NC} Frontend OK"

# 6. Crear .env files
echo ""
echo "⚙️  Configurando variables de entorno..."

# Backend .env
if [ ! -f backend/.env ]; then
    echo "  • Creando backend/.env..."
    
    read -p "  Ingresa IP de tu Windows PC (ej: 192.168.1.50): " WINDOWS_IP
    read -sp "  Ingresa contraseña PostgreSQL de Windows: " PG_PASSWORD
    echo ""
    
    cat > backend/.env << EOF
DATABASE_URL=postgresql://postgres:${PG_PASSWORD}@${WINDOWS_IP}:5432/budgetapp_dev
PYTHONUNBUFFERED=1
EOF
    chmod 600 backend/.env
    echo -e "  ${GREEN}✓${NC} backend/.env creado"
else
    echo "  ℹ️  backend/.env ya existe"
fi

# Frontend .env.local
if [ ! -f frontend/.env.local ]; then
    echo "  • Creando frontend/.env.local..."
    cat > frontend/.env.local << EOF
VITE_API_URL=http://localhost:8000
EOF
    echo -e "  ${GREEN}✓${NC} frontend/.env.local creado"
else
    echo "  ℹ️  frontend/.env.local ya existe"
fi

# 7. Resumen final
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ Setup completado exitosamente${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

echo "📖 Para empezar desarrollo:"
echo ""
echo "  Terminal 1 - Backend:"
echo -e "    ${YELLOW}cd ~/Projects/BudgetApp/backend${NC}"
echo -e "    ${YELLOW}source .venv/bin/activate${NC}"
echo -e "    ${YELLOW}python -m uvicorn app.main:app --reload${NC}"
echo ""
echo "  Terminal 2 - Frontend:"
echo -e "    ${YELLOW}cd ~/Projects/BudgetApp/frontend${NC}"
echo -e "    ${YELLOW}npm run dev${NC}"
echo ""
echo "  Navegador:"
echo -e "    ${YELLOW}http://localhost:5173${NC}"
echo ""

echo "📚 Documentación completa:"
echo -e "  ${YELLOW}MAC_SETUP.md${NC}"
echo ""

echo "⚠️  Requisitos previos en Windows:"
echo "  • PostgreSQL 15 instalado y corriendo"
echo "  • Firewall abre puerto 5432"
echo "  • pg_hba.conf permite conexiones remotas"
echo "  • Bases de datos budgetapp_dev y budgetapp_prod creadas"
echo ""
