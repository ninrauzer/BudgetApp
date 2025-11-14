# BudgetApp - Gestión de Servidores de Desarrollo

## 🚀 Scripts Disponibles

### Inicio Rápido
```powershell
.\start.ps1
```
Inicia ambos servidores (Backend + Frontend) en ventanas separadas.

### Detener Todo
```powershell
.\stop.ps1
```
Detiene todos los servidores de desarrollo.

### Gestor Completo
```powershell
# Ver estado
.\dev.ps1 status

# Iniciar servidores
.\dev.ps1 start

# Detener servidores
.\dev.ps1 stop

# Reiniciar servidores
.\dev.ps1 restart
```

## 📍 URLs de Desarrollo

- **Frontend (React)**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API ReDoc**: http://localhost:8000/redoc

## 🔧 Comandos Manuales

### Backend (FastAPI)
```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

### Frontend (Vite + React)
```powershell
cd frontend
npm run dev
```

## 🛠️ Troubleshooting

### Puerto ocupado
Si ves un error de puerto ocupado:
```powershell
.\stop.ps1  # Detiene todos los servidores
.\start.ps1 # Reinicia
```

### Backend no inicia
Verifica que el virtual environment esté activado:
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend no compila
Reinstala dependencias:
```powershell
cd frontend
npm install
npm run dev
```

## 📦 Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Estado**: TanStack Query (React Query)
- **HTTP Client**: Axios

## 🎨 Sistema de Diseño

Crypto Light UI Kit implementado con:
- Colores: #F8FAFE (background), #2D60FF (primary), #00C48C (income), #FF4D67 (expense)
- Tipografía: Inter font family
- Componentes: shadcn/ui con Radix UI
