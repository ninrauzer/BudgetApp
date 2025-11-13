# BudgetApp - Backend API

Backend FastAPI para la aplicación de gestión presupuestal personal BudgetApp.

## 🚀 Tecnologías

- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy** - ORM para manejo de base de datos
- **Pydantic** - Validación de datos y schemas
- **SQLite** - Base de datos (desarrollo)
- **PostgreSQL** - Base de datos (producción)
- **Python 3.12+**

## 📁 Estructura

```
backend/
├── app/
│   ├── api/              # Endpoints REST
│   │   ├── accounts.py
│   │   ├── budget_plans.py
│   │   ├── categories.py
│   │   ├── dashboard.py
│   │   ├── data_management.py
│   │   ├── exchange_rate.py
│   │   ├── frontend.py   # Legacy HTMX endpoints
│   │   ├── import_data.py
│   │   └── transactions.py
│   ├── db/               # Base de datos
│   │   └── database.py
│   ├── models/           # SQLAlchemy models
│   │   ├── account.py
│   │   ├── budget_plan.py
│   │   ├── category.py
│   │   └── transaction.py
│   ├── schemas/          # Pydantic schemas
│   │   ├── account.py
│   │   ├── budget_plan.py
│   │   ├── category.py
│   │   ├── common.py
│   │   ├── dashboard.py
│   │   └── transaction.py
│   ├── services/         # Business logic
│   │   ├── excel_import.py
│   │   └── exchange_rate.py
│   └── main.py           # Aplicación principal
├── scripts/              # Scripts de utilidad
│   ├── init_db.py
│   ├── migrate_*.py
│   └── ...
├── tests/                # Tests unitarios
├── .venv/                # Entorno virtual Python
├── requirements.txt      # Dependencias Python
└── server.ps1            # Script de inicio
```

## ⚙️ Instalación

### 1. Crear entorno virtual

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

### 2. Instalar dependencias

```powershell
pip install -r requirements.txt
```

### 3. Inicializar base de datos

```powershell
python scripts/init_db.py
```

## 🏃 Ejecución

### Desarrollo (con auto-reload)

```powershell
.\server.ps1 start
```

O manualmente:

```powershell
.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

### Producción

```powershell
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 📚 Documentación API

Una vez iniciado el servidor:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI JSON:** http://localhost:8000/openapi.json

## 🔌 Endpoints Principales

### Categorías
- `GET /api/categories` - Listar categorías
- `POST /api/categories` - Crear categoría
- `PUT /api/categories/{id}` - Actualizar categoría
- `DELETE /api/categories/{id}` - Eliminar categoría (soft delete)

### Cuentas
- `GET /api/accounts` - Listar cuentas
- `POST /api/accounts` - Crear cuenta
- `PUT /api/accounts/{id}` - Actualizar cuenta
- `DELETE /api/accounts/{id}` - Eliminar cuenta

### Transacciones
- `GET /api/transactions` - Listar transacciones (con filtros)
- `POST /api/transactions` - Crear transacción
- `PUT /api/transactions/{id}` - Actualizar transacción
- `DELETE /api/transactions/{id}` - Eliminar transacción

### Presupuesto
- `GET /api/budget-plan` - Obtener plan de presupuesto
- `POST /api/budget-plan` - Crear/actualizar plan
- `GET /api/budget-plan/monthly/{year}/{month}` - Plan mensual
- `GET /api/budget-plan/summary/{year}/{month}` - Resumen vs real

### Dashboard
- `GET /api/dashboard/summary?year={year}&month={month}` - Resumen financiero
- `GET /api/dashboard/trends?months={months}` - Tendencias históricas

## 🔧 Configuración

### Variables de entorno (.env)

```env
APP_NAME=BudgetApp
APP_VERSION=2.0.0
DEBUG=True
DATABASE_URL=sqlite:///./budget.db
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### CORS

El backend está configurado para aceptar requests desde:
- `http://localhost:3000` (React dev server - CRA)
- `http://localhost:5173` (Vite dev server)
- `http://localhost:8000` (mismo origen)

Configurar en `app/main.py` si necesitas otros orígenes.

## 🧪 Testing

```powershell
pytest tests/
```

## 🗄️ Base de Datos

### SQLite (Desarrollo)
- Archivo: `budget.db` en raíz del proyecto
- Inicializar: `python scripts/init_db.py`

### Migrations

Los scripts de migración están en `/scripts`:
- `migrate_category_soft_delete.py`
- `migrate_currency.py`

## 📦 Scripts Útiles

```powershell
# Inicializar DB
python scripts/init_db.py

# Listar categorías
python scripts/list_categories.py

# Actualizar iconos
python scripts/update_category_icons.py

# Crear categorías simplificadas
python scripts/create_simplified_categories.py
```

## 🔗 Relación con Frontend

Este backend es **agnóstico del frontend**. Expone una API REST pura que puede ser consumida por:
- React (frontend principal en `/frontend`)
- HTMX (legacy en `/legacy`)
- Apps móviles
- Cualquier cliente HTTP

## 📝 Notas

- El router `frontend.py` contiene endpoints para servir HTML (legacy HTMX)
- Estos endpoints se mantendrán temporalmente durante la migración a React
- Una vez completada la migración, se pueden eliminar

## 🚧 Próximos pasos

- [ ] Implementar autenticación JWT
- [ ] Agregar rate limiting
- [ ] Implementar caching con Redis
- [ ] Migracion a PostgreSQL
- [ ] CI/CD pipeline
- [ ] Docker containerization

---

**Versión:** 2.0.0  
**Python:** 3.12+  
**Última actualización:** 2025-11-13
