# BudgetApp - Aplicación de Gestión Presupuestal Personal

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6.svg)](https://www.typescriptlang.org)
[![SQLite](https://img.shields.io/badge/SQLite-3-lightgrey.svg)](https://www.sqlite.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com)

Aplicación web moderna para gestión presupuestal personal, desarrollada con arquitectura API-First, permitiendo planificar presupuestos, registrar transacciones y visualizar análisis financieros.

## 🚀 Quick Start con Docker

```bash
# Iniciar aplicación completa
docker compose up -d

# Ver en navegador
# Frontend: http://localhost
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/docs
```

📖 **Documentación completa**: Ver [DOCKER.md](DOCKER.md)

---

- ✅ **Budget Planning** - Planificación de presupuesto mensual por categorías

- ✅ **Transacciones** - Registro de ingresos, gastos y ahorros---

- ✅ **Dashboard Analítico** - Visualización de presupuestado vs. real

- ✅ **Gestión de Categorías** - Categorías jerárquicas personalizables---

- ✅ **Gestión de Cuentas** - Múltiples medios de pago

- ✅ **API REST Completa** - Backend FastAPI con documentación Swagger## 📋 Tabla de Contenidos

- ✅ **Filtros Avanzados** - Búsqueda por fecha, categoría, cuenta, tipo

## 📋 Tabla de Contenidos

### v2.0 (React Migration) 🔄 En Progreso

- ✅ **Proyecto React + TypeScript** - Setup completo con Vite 7- [Características](#-características)

- ✅ **Tailwind CSS** - Configurado con dark mode

- ✅ **shadcn/ui** - Sistema de diseño moderno y accesible- [Características](#-características)- [Arquitectura](#-arquitectura)

- 🔄 **React Router** - Navegación client-side (pendiente)

- 🔄 **TanStack Query** - Server state management (pendiente)- [Arquitectura](#-arquitectura)- [Requisitos](#-requisitos)

- 🔄 **Zustand** - Client state management (pendiente)

- 🔄 **Migración de Páginas** - Dashboard, Transactions, Budget, Analysis, Settings- [Estructura del Proyecto](#-estructura-del-proyecto)- [Instalación](#-instalación)



### Futuro (v3.0+) 📋 Planeado- [Instalación](#-instalación)- [Uso](#-uso)

- 📋 Control de Tarjetas de Crédito (cuotas)

- 📋 Gestión de Préstamos (amortización)- [Uso](#-uso)- [Documentación](#-documentación)

- 📋 Subscripciones Recurrentes

- 📋 Autenticación (multiusuario)- [Documentación](#-documentación)- [Estructura del Proyecto](#-estructura-del-proyecto)

- 📋 App móvil (PWA)

- 📋 Integración con bancos (Open Banking)- [Roadmap](#-roadmap)- [Roadmap](#-roadmap)



---- [Contribuir](#-contribuir)- [Licencia](#-licencia)



## 🏗️ Arquitectura



La aplicación sigue una **arquitectura API-First** (ver [ADR-001](docs/adr/ADR-001-api-first-architecture.md)):------



```

┌─────────────────┐

│   Frontend      │## ✨ Características## ✨ Características

│  React + TS     │  ← Puerto 5173 (desarrollo)

│  shadcn/ui      │

└────────┬────────┘

         │ HTTP/REST### Implementadas### MVP (v1.0)

         ↓

┌─────────────────┐- ✅ **API REST Completa** - Backend FastAPI con documentación automática- ✅ **Budget Planning** - Planificación de presupuesto anual por categorías

│   Backend       │

│   FastAPI       │  ← Puerto 8000 (API)- ✅ **Budget Planning** - Planificación de presupuesto anual por categorías- ✅ **Budget Tracking** - Registro diario de transacciones (ingresos/gastos)

│   Python 3.12   │

└────────┬────────┘- ✅ **Transacciones** - Registro de ingresos, gastos y ahorros- ✅ **Dashboard Analítico** - Visualización de presupuestado vs. real, tendencias

         │

         ↓- ✅ **Dashboard Analítico** - Visualización de presupuestado vs. real- ✅ **Gestión de Categorías** - Categorías jerárquicas (Ingresos, Gastos, Ahorros)

┌─────────────────┐

│   Database      │- ✅ **Gestión de Categorías** - Categorías jerárquicas personalizables- ✅ **Gestión de Cuentas** - Diferentes medios de pago (Efectivo, Banco, Tarjetas)

│   SQLite        │

│  (budget.db)    │- ✅ **Gestión de Cuentas** - Múltiples medios de pago- ✅ **API REST Completa** - Documentación automática con Swagger/ReDoc

└─────────────────┘

```- ✅ **Filtros Avanzados** - Búsqueda por fecha, categoría, cuenta, tipo



**Separación de responsabilidades:**### Futuro (v2.0+)

- `/backend` - API REST, lógica de negocio, acceso a datos

- `/frontend` - UI moderna, interacciones, visualizaciones### En Desarrollo- 🔄 Control de Tarjetas de Crédito (cuotas)

- `/legacy` - Frontend HTMX original (referencia histórica)

- `/docs` - Documentación técnica (ADRs, RFCs, Runbooks)- 🔄 **Frontend React** - Migración de HTMX a React + TypeScript- 🔄 Gestión de Préstamos (amortización)



---- 🔄 **TypeScript** - Type safety completo- 🔄 Subscripciones Recurrentes



## 📁 Estructura del Proyecto- 🔄 **State Management** - React Query + Zustand- 🔄 Autenticación (multiusuario)



```- 🔄 **UI Moderna** - Tailwind CSS + HeadlessUI- 🔄 App móvil (React Native / PWA)

BudgetApp/

├── backend/                 # API FastAPI- 🔄 Integración con bancos (Open Banking)

│   ├── app/

│   │   ├── api/            # Endpoints REST### Futuro

│   │   ├── db/             # Database config

│   │   ├── models/         # SQLAlchemy models- 📋 Control de Tarjetas de Crédito (cuotas)---

│   │   ├── schemas/        # Pydantic schemas

│   │   └── services/       # Business logic- 📋 Gestión de Préstamos (amortización)

│   ├── scripts/            # Utilidades (init_db, migrations)

│   ├── tests/              # Tests unitarios- 📋 Subscripciones Recurrentes## 🏗️ Arquitectura

│   ├── budget.db           # Base de datos SQLite

│   └── requirements.txt    # Dependencias Python- 📋 Autenticación (multiusuario)

│

├── frontend/                # React + TypeScript- 📋 App móvil (PWA)La aplicación sigue una **arquitectura API-First** (ver [ADR-001](docs/adr/ADR-001.md)):

│   ├── src/

│   │   ├── components/     # Componentes UI- 📋 Integración con bancos (Open Banking)

│   │   ├── pages/          # Páginas principales

│   │   ├── hooks/          # Custom hooks```

│   │   ├── services/       # API clients

│   │   ├── stores/         # Zustand stores---┌─────────────────┐

│   │   └── types/          # TypeScript types

│   └── package.json        # Dependencias Node│   Frontend      │  HTMX (MVP) → React (futuro)

│

├── legacy/                  # Frontend HTMX (referencia)## 🏗️ Arquitectura│  (Desacoplado)  │

│   ├── templates/          # Plantillas Jinja2

│   └── static/             # CSS/JS estáticos└────────┬────────┘

│

└── docs/                    # Documentación técnicaLa aplicación sigue una **arquitectura API-First** con separación completa de frontend y backend:         │ HTTP/JSON

    ├── adr/                # Architecture Decision Records

    ├── rfc/                # Request for Comments         │

    └── runbooks/           # Guías operacionales

``````┌────────▼────────┐



---┌─────────────────────────────────────────────┐│   API REST      │  FastAPI



## 🚀 Instalación│  Frontend - React + TypeScript              ││   (Backend)     │



### Requisitos Previos│  Puerto: 3000 (dev) / 5173 (Vite)          │└────────┬────────┘

- Python 3.12+

- Node.js 18+│  - React 18                                 │         │

- pip

- npm│  - TypeScript 5                             │┌────────▼────────┐



### 1. Clonar Repositorio│  - React Query (server state)               ││   Base de Datos │  SQLite (dev) → PostgreSQL (prod)

```bash

git clone https://github.com/ninrauzer/BudgetApp.git│  - Zustand (client state)                   │└─────────────────┘

cd BudgetApp

```│  - Tailwind CSS                             │```



### 2. Backend Setup└──────────────────┬──────────────────────────┘

```bash

cd backend                   │ HTTP/JSON (REST API)**Stack Tecnológico:**



# Crear entorno virtual                   │ CORS habilitado- **Backend:** FastAPI (Python 3.12+)

python -m venv .venv

┌──────────────────▼──────────────────────────┐- **Base de Datos:** SQLite (desarrollo/MVP) → PostgreSQL (producción)

# Activar entorno (Windows)

.\.venv\Scripts\Activate.ps1│  Backend - FastAPI                          │- **ORM:** SQLAlchemy



# Instalar dependencias│  Puerto: 8000                               │- **Validación:** Pydantic v2

pip install -r requirements.txt

│  - FastAPI (Python 3.12+)                   │- **Frontend:** HTMX (MVP) → React (producto final)

# Inicializar base de datos

python scripts/init_db.py│  - SQLAlchemy (ORM)                         │

```

│  - Pydantic v2 (validación)                 │**Decisiones Arquitectónicas:**

### 3. Frontend Setup

```bash│  - Swagger/ReDoc (docs)                     │- [RFC-001](docs/rfc/RFC-001-backend-selection.md) - Selección de Backend (FastAPI)

cd ../frontend

└──────────────────┬──────────────────────────┘- [RFC-002](docs/rfc/RFC-002-data-model.md) - Modelo de Datos

# Instalar dependencias

npm install                   │- [RFC-003](docs/rfc/RFC-003-api-design.md) - Diseño de API REST

```

┌──────────────────▼──────────────────────────┐- [ADR-001](docs/adr/ADR-001-api-first-architecture.md) - Arquitectura API-First

---

│  Base de Datos                              │

## 🎯 Uso

│  - SQLite (desarrollo)                      │---

### Modo Desarrollo

│  - PostgreSQL (producción)                  │

**Terminal 1 - Backend API:**

```bash└─────────────────────────────────────────────┘## 📦 Requisitos

cd backend

.\.venv\Scripts\Activate.ps1```

uvicorn app.main:app --reload --port 8000

```- Python 3.12 o superior

→ API disponible en http://localhost:8000  

→ Documentación en http://localhost:8000/docs**Documentación Arquitectónica:**- pip (gestor de paquetes de Python)



**Terminal 2 - Frontend React:**- [RFC-001](docs/rfc/RFC-001-backend-selection.md) - Selección de Backend (FastAPI)- Git

```bash

cd frontend- [RFC-002](docs/rfc/RFC-002-data-model.md) - Modelo de Datos

npm run dev

```- [RFC-003](docs/rfc/RFC-003-api-design.md) - Diseño de API REST---

→ Aplicación en http://localhost:5173

- [RFC-004](docs/rfc/RFC-004-react-migration.md) - Migración a React + TypeScript

**Terminal 3 - Frontend Legacy (opcional):**

```bash- [ADR-001](docs/adr/ADR-001-api-first-architecture.md) - Arquitectura API-First## 🚀 Instalación

cd backend

.\.venv\Scripts\Activate.ps1- [ADR-002](docs/adr/ADR-002-project-restructuring.md) - Reestructuración del Proyecto

python legacy_server.py

```### 1. Clonar el repositorio

→ HTMX en http://localhost:8001

---```bash

### Modo Producción

```bashgit clone https://github.com/ninrauzer/BudgetApp.git

# Build frontend

cd frontend## 📁 Estructura del Proyectocd BudgetApp

npm run build

```

# Servir con backend

cd ../backend```

uvicorn app.main:app --host 0.0.0.0 --port 8000

```BudgetApp/### 2. Crear entorno virtual



---├── backend/                    # Backend FastAPI```bash



## 📚 Documentación│   ├── app/# Windows (PowerShell)



### Architecture Decision Records (ADRs)│   │   ├── api/               # Routers RESTpython -m venv .venv

- [ADR-001: API-First Architecture](docs/adr/ADR-001-api-first-architecture.md)

- [ADR-002: Project Restructuring](docs/adr/ADR-002-project-restructuring.md)│   │   │   ├── accounts.py.\.venv\Scripts\Activate.ps1

- [Índice completo de ADRs](docs/adr/ADR-INDEX.md)

│   │   │   ├── budget_plans.py

### Request for Comments (RFCs)

- [RFC-001: Backend Selection](docs/rfc/RFC-001-backend-selection.md)│   │   │   ├── categories.py# Linux/Mac

- [RFC-002: Data Model](docs/rfc/RFC-002-data-model.md)

- [RFC-003: API Design](docs/rfc/RFC-003-api-design.md)│   │   │   ├── dashboard.pypython3 -m venv .venv

- [RFC-004: React Migration](docs/rfc/RFC-004-react-migration.md) ← **Actual**

│   │   │   ├── transactions.pysource .venv/bin/activate

### Documentación de Componentes

- [Backend README](backend/README.md) - API endpoints, configuración│   │   │   └── ...```

- [Frontend README](frontend/README.md) - Stack, estructura, componentes

- [Legacy README](legacy/README.md) - Frontend HTMX histórico│   │   ├── db/                # Database setup



---│   │   ├── models/            # SQLAlchemy models### 3. Instalar dependencias



## 🗓️ Roadmap│   │   ├── schemas/           # Pydantic schemas```bash



### Fase 1: Foundation ✅ Completado│   │   ├── services/          # Business logicpip install -r requirements.txt

- [x] Diseño de arquitectura

- [x] Backend FastAPI│   │   └── main.py            # FastAPI app```

- [x] Modelo de datos

- [x] API REST completa│   ├── scripts/               # DB scripts

- [x] Frontend HTMX (MVP)

│   ├── tests/                 # Tests backend### 4. Inicializar base de datos

### Fase 2: React Migration 🔄 En Progreso

- [x] Reestructuración del proyecto (backend/frontend/legacy)│   ├── requirements.txt```bash

- [x] Setup React + TypeScript + Vite

- [x] Configuración Tailwind CSS + shadcn/ui│   ├── server.ps1python scripts/init_db.py

- [ ] React Router + TanStack Query + Zustand

- [ ] Migración Dashboard│   └── README.md```

- [ ] Migración Transactions

- [ ] Migración Budget│

- [ ] Migración Analysis

- [ ] Migración Settings├── frontend/                   # Frontend React (en desarrollo)### 5. Ejecutar el servidor



### Fase 3: Enhancements 📋 Planeado│   ├── src/```bash

- [ ] Testing (Vitest + React Testing Library)

- [ ] Optimización de performance│   │   ├── api/               # API clientsuvicorn app.main:app --reload

- [ ] PWA (Service Workers)

- [ ] Internacionalización (i18n)│   │   ├── components/        # React components```



### Fase 4: Advanced Features 📋 Futuro│   │   ├── features/          # Feature modules

- [ ] Tarjetas de crédito (cuotas)

- [ ] Préstamos (amortización)│   │   ├── hooks/             # Custom hooksLa API estará disponible en: `http://localhost:8000`

- [ ] Autenticación multiusuario

- [ ] Integración bancaria│   │   ├── store/             # Zustand stores



---│   │   ├── types/             # TypeScript types---



## 🤝 Contribuir│   │   └── utils/             # Utilities



Este es un proyecto personal en desarrollo activo. Si encuentras bugs o tienes sugerencias:│   ├── public/## 💻 Uso



1. Abre un [Issue](https://github.com/ninrauzer/BudgetApp/issues)│   ├── package.json

2. Describe el problema o sugerencia

3. (Opcional) Envía un Pull Request│   ├── tsconfig.json### Acceder a la documentación interactiva



---│   └── README.md



## 📄 Licencia│**Swagger UI (recomendado):**



MIT License - ver [LICENSE](LICENSE) para detalles.├── legacy/                     # Frontend HTMX (MVP - referencia)```



---│   ├── templates/             # HTML templateshttp://localhost:8000/docs



## 🏷️ Versiones│   ├── static/                # CSS/JS```



- **v1.0.0** (Nov 2025) - MVP con HTMX│   └── README.md

- **v2.0.0** (En desarrollo) - Migración a React + TypeScript

- **v3.0.0** (Planeado) - Features avanzadas│**ReDoc (alternativa):**



---├── docs/                       # Documentación```



**Desarrollado por:** [@ninrauzer](https://github.com/ninrauzer)  │   ├── adr/                   # Architecture Decision Recordshttp://localhost:8000/redoc

**Stack:** FastAPI • React • TypeScript • Tailwind • shadcn/ui • SQLite

│   ├── rfc/                   # Request for Comments```

│   ├── design/                # Diagramas

│   └── runbooks/              # Procedimientos### Ejemplos de uso de la API

│

├── budget.db                   # Base de datos SQLite#### Crear una transacción

├── .gitignore```bash

└── README.md                   # Este archivocurl -X POST "http://localhost:8000/api/transactions" \

```  -H "Content-Type: application/json" \

  -d '{

---    "date": "2025-11-12",

    "category_id": 9,

## 🚀 Instalación    "account_id": 1,

    "amount": 50.00,

### Requisitos Previos    "type": "expense",

- Python 3.12+    "description": "Supermercado",

- Node.js 18+ (para frontend React)    "status": "completed"

- Git  }'

```

### 1. Clonar el repositorio

#### Obtener dashboard del mes actual

```bash```bash

git clone https://github.com/ninrauzer/BudgetApp.gitcurl "http://localhost:8000/api/dashboard"

cd BudgetApp```

```

#### Listar transacciones del mes

### 2. Backend Setup```bash

curl "http://localhost:8000/api/transactions?start_date=2025-11-01&end_date=2025-11-30"

```powershell```

# Ir a la carpeta backend

cd backend---



# Crear entorno virtual## 📚 Documentación

python -m venv .venv

La documentación completa del proyecto está en la carpeta [`/docs`](docs/):

# Activar entorno virtual (Windows PowerShell)

.\.venv\Scripts\Activate.ps1### RFCs (Request for Comments)

- [RFC-001](docs/rfc/RFC-001.md) - Selección de Backend

# Instalar dependencias- [RFC-002](docs/rfc/RFC-002.md) - Modelo de Datos

pip install -r requirements.txt- [RFC-003](docs/rfc/RFC-003.md) - Diseño de API REST



# Inicializar base de datos### ADRs (Architecture Decision Records)

python scripts/init_db.py- [ADR-001](docs/adr/ADR-001.md) - Arquitectura API-First

- [ADR_INDEX](docs/adr/ADR_INDEX.md) - Índice de decisiones

# Volver a la raíz

cd ..### Otros

```- [CONVENTIONS.md](docs/CONVENTIONS.md) - Convenciones del proyecto

- [ANALISIS_FACTIBILIDAD.md](ANALISIS_FACTIBILIDAD.md) - Análisis inicial del Excel

### 3. Frontend Setup (cuando esté disponible)

---

```bash

# Ir a la carpeta frontend## 📂 Estructura del Proyecto

cd frontend

```

# Instalar dependenciasBudgetApp/

npm install├── app/                      # Código de la aplicación

│   ├── api/                  # Routers y endpoints

# Volver a la raíz│   │   ├── categories.py

cd ..│   │   ├── accounts.py

```│   │   ├── budget_plan.py

│   │   ├── transactions.py

---│   │   └── dashboard.py

│   ├── models/               # Modelos SQLAlchemy

## 🏃 Uso│   │   ├── category.py

│   │   ├── account.py

### Iniciar Backend│   │   ├── budget_plan.py

│   │   └── transaction.py

```powershell│   ├── schemas/              # Schemas Pydantic

cd backend│   │   ├── category.py

.\server.ps1 start│   │   ├── account.py

```│   │   ├── budget_plan.py

│   │   └── transaction.py

O manualmente:│   ├── services/             # Lógica de negocio

│   │   ├── category_service.py

```powershell│   │   ├── account_service.py

cd backend│   │   ├── budget_service.py

.\.venv\Scripts\Activate.ps1│   │   ├── transaction_service.py

uvicorn app.main:app --reload│   │   └── dashboard_service.py

```│   ├── db/                   # Configuración de BD

│   │   ├── database.py

El backend estará disponible en: **http://localhost:8000**│   │   └── session.py

│   └── main.py               # Punto de entrada FastAPI

### Iniciar Frontend (cuando esté disponible)├── docs/                     # Documentación

│   ├── rfc/                  # Request for Comments

```bash│   ├── adr/                  # Architecture Decision Records

cd frontend│   ├── design/               # Diagramas

npm start│   ├── runbooks/             # Procedimientos operativos

```│   └── CONVENTIONS.md

├── scripts/                  # Scripts utilitarios

El frontend estará disponible en: **http://localhost:3000** (o **http://localhost:5173** con Vite)│   ├── init_db.py            # Inicializar BD con datos

│   └── migrate_to_postgres.py

### Ver Frontend Legacy (HTMX)├── tests/                    # Tests

│   ├── test_api/

El frontend MVP con HTMX está en `/legacy` como referencia. Para usarlo, necesitas restaurar las rutas en `backend/app/main.py`.│   └── test_services/

├── .env.example              # Variables de entorno

---├── requirements.txt          # Dependencias Python

├── README.md                 # Este archivo

## 📚 Documentación└── budget.db                 # Base de datos SQLite (generado)

```

### API REST

---

Una vez iniciado el backend:

- **Swagger UI:** http://localhost:8000/docs## 🗺️ Roadmap

- **ReDoc:** http://localhost:8000/redoc

- **OpenAPI JSON:** http://localhost:8000/openapi.json### Fase 1: MVP (✅ Actual)

- **Health Check:** http://localhost:8000/health- [x] Diseño de arquitectura

- [x] Modelo de datos

### Endpoints Principales- [x] API REST completa

- [ ] Inicialización de BD

#### Categorías- [ ] Tests de integración

```- [ ] Frontend con HTMX

GET    /api/categories- [ ] Deployment local

POST   /api/categories

PUT    /api/categories/{id}### Fase 2: Producción (🔄 Próximo)

DELETE /api/categories/{id}- [ ] Migración a PostgreSQL

```- [ ] Frontend con React

- [ ] Gráficos y visualizaciones

#### Transacciones- [ ] Exportación a Excel/PDF

```- [ ] CI/CD

GET    /api/transactions?start_date=&end_date=&type=&category_id=- [ ] Deploy en VPS

POST   /api/transactions

PUT    /api/transactions/{id}### Fase 3: Producto (🔮 Futuro)

DELETE /api/transactions/{id}- [ ] Sistema de autenticación

```- [ ] Multiusuario

- [ ] Control de Tarjetas de Crédito

#### Dashboard- [ ] Gestión de Préstamos

```- [ ] App móvil (PWA)

GET    /api/dashboard/summary?year=2025&month=11- [ ] Integración con bancos

GET    /api/dashboard/trends?months=6

```---



Ver documentación completa en [RFC-003](docs/rfc/RFC-003-api-design.md)## 🤝 Contribución



### Documentación TécnicaEste es un proyecto personal, pero sugerencias y feedback son bienvenidos.



Toda la documentación arquitectónica sigue el estándar [Software Architecture Kit (SAK)](https://github.com/ninrauzer/Software_Architecture_Kit_SAK):### Workflow recomendado:

1. Fork el proyecto

- **RFCs:** Propuestas arquitectónicas → [`/docs/rfc`](docs/rfc/)2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)

- **ADRs:** Decisiones técnicas → [`/docs/adr`](docs/adr/)3. Commit tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)

- **Runbooks:** Procedimientos operativos → [`/docs/runbooks`](docs/runbooks/)4. Push a la rama (`git push origin feature/nueva-funcionalidad`)

- **Design:** Diagramas y esquemas → [`/docs/design`](docs/design/)5. Abre un Pull Request



------



## 🗺️ Roadmap## 📄 Licencia



### Fase 1: MVP con HTMX ✅ (Completada)Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

- [x] Backend FastAPI completo

- [x] CRUD de todas las entidades---

- [x] Frontend HTMX funcional

- [x] Dashboard básico## 👤 Autor

- [x] Documentación arquitectónica

**Ninrauzer** (Renan Ruiz)

### Fase 2: Migración a React 🔄 (En Progreso)

- [x] Reestructuración del proyecto (backend/frontend/legacy)- GitHub: [@ninrauzer](https://github.com/ninrauzer)

- [x] Configuración CORS- SAK: [Software Architecture Kit](https://github.com/ninrauzer/Software_Architecture_Kit_SAK)

- [x] Documentación de migración (RFC-004)

- [ ] Setup inicial React + TypeScript---

- [ ] Implementar infraestructura base

- [ ] Migrar Dashboard## 📝 Notas

- [ ] Migrar Transacciones

- [ ] Migrar Presupuesto- Este proyecto nació del análisis de un Excel de presupuesto personal (ver [ANALISIS_FACTIBILIDAD.md](ANALISIS_FACTIBILIDAD.md))

- [ ] Migrar Análisis- Sigue las prácticas de **Architecture Knowledge Management (AKM)**

- [ ] Migrar Configuración- Documentación basada en el [Software Architecture Kit (SAK)](https://github.com/ninrauzer/Software_Architecture_Kit_SAK)



### Fase 3: Mejoras y Optimización---

- [ ] Autenticación JWT

- [ ] Rate limiting**¿Tienes preguntas?** Abre un [Issue](https://github.com/ninrauzer/BudgetApp/issues) o revisa la [documentación](docs/).

- [ ] Caching (Redis)

- [ ] Tests E2E**Última actualización:** 2025-11-12

- [ ] CI/CD pipeline

### Fase 4: Producción
- [ ] Migración a PostgreSQL
- [ ] Docker containerization
- [ ] Deploy cloud (AWS/GCP/Azure)
- [ ] Monitoring y logging
- [ ] Backup automatizado

### Fase 5: Features Avanzadas
- [ ] Control de tarjetas de crédito
- [ ] Gestión de préstamos
- [ ] Subscripciones recurrentes
- [ ] Multiusuario
- [ ] PWA / App móvil

---

## 🤝 Contribuir

Este es un proyecto personal en desarrollo activo. Si deseas contribuir:

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

---

## 👤 Autor

**Ninrauzer**

- GitHub: [@ninrauzer](https://github.com/ninrauzer)
- Proyecto: [BudgetApp](https://github.com/ninrauzer/BudgetApp)

---

## 📝 Notas de Versión

### v2.0.0 (2025-11-13) - Reestructuración
- Separación completa backend/frontend/legacy
- Preparación para migración a React
- Configuración CORS
- Documentación actualizada

### v1.0.0 (2025-11-12) - MVP
- Backend FastAPI completo
- Frontend HTMX funcional
- API REST documentada
- Base de datos SQLite

---

**Última actualización:** 2025-11-13  
**Versión actual:** 2.0.0 (Backend) | 0.1.0 (Frontend React en desarrollo)
