# BudgetApp - Información del Proyecto

## 📁 Estructura de Directorios
```
E:\Desarrollo\BudgetApp\
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/          # Páginas principales
│   │   ├── lib/            # Utilidades y APIs
│   │   └── contexts/       # Contextos React
│   ├── package.json
│   └── vite.config.ts
├── backend/                 # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── api/            # Endpoints REST
│   │   ├── db/             # Base de datos
│   │   ├── models/         # Modelos SQLAlchemy
│   │   └── services/       # Lógica de negocio
│   ├── .venv/              # Entorno virtual Python
│   └── requirements.txt
└── docs/                   # Documentación
```

## 🚀 Comandos de Desarrollo

### Frontend (Puerto 5173/5174)
```bash
cd E:\Desarrollo\BudgetApp\frontend
npm run dev          # Servidor desarrollo
npm run build        # Build producción
```

### Backend (Puerto 8000)
```bash
cd E:\Desarrollo\BudgetApp\backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload
```

## 🗄️ Base de Datos
- **Ubicación**: `E:\Desarrollo\BudgetApp\backend\budget_app.db`
- **Tipo**: SQLite
- **Modelos principales**: Account, Category, Transaction, BudgetPlan

## 🎨 Stack Tecnológico
- **Frontend**: React 18, TypeScript, Vite 7, Tailwind CSS 3
- **Backend**: FastAPI, SQLAlchemy, Uvicorn
- **Base de datos**: SQLite
- **Estado**: TanStack Query (React Query)
- **Gráficos**: Recharts
- **Iconos**: Lucide React

## 🔧 Configuración
- **Moneda por defecto**: PEN (Soles peruanos)
- **Conversión**: USD via exchange rate API
- **Tema**: Glass design con backdrop-blur
- **Drag & Drop**: @dnd-kit