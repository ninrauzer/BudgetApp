# BudgetApp - Aplicación de Gestión Presupuestal Personal

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6.svg)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791.svg)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com)
[![Render](https://img.shields.io/badge/Render-Ready-46E3B7.svg)](https://render.com)

Aplicación web moderna para gestión presupuestal personal. Planifica presupuestos, registra transacciones y visualiza análisis financieros con una interfaz moderna y responsive.

## 🚀 Quick Start

> **⚡ Para empezar en 30 segundos → [QUICKSTART.md](QUICKSTART.md)**

### 3 opciones de desarrollo:

**1. Local (recomendado para desarrollo)**
```bash
cd frontend && npm run dev  # Terminal 1
cd backend && uvicorn app.main:app --reload  # Terminal 2
# Frontend: http://localhost:5173
# Backend: http://localhost:8000/docs
```

**2. Docker (simula producción local)**
```bash
docker compose up -d
# Frontend: http://192.168.126.127:8080
# Backend: http://192.168.126.127:8000/docs
```

**3. Render.com (cloud production)**
```bash
git push origin master  # Render despliega automáticamente
# Ver: [RENDER.md](RENDER.md) para más detalles
```

---

## 📚 Documentación

| Necesito | Ver |
|----------|-----|
| **Empezar rápido** | [QUICKSTART.md](QUICKSTART.md) |
| **Desplegar a producción** | [RENDER.md](RENDER.md) |
| **Entender la arquitectura** | [docs/adr/](docs/adr/) |
| **Decisiones técnicas** | [docs/rfc/](docs/rfc/) |

---

## ✨ Características

### MVP (v1.0) - ✅ Implementado
- ✅ **API REST Completa** - Backend FastAPI con documentación automática
- ✅ **Budget Planning** - Planificación de presupuesto anual por categorías
- ✅ **Budget Tracking** - Registro diario de transacciones (ingresos/gastos)
- ✅ **Dashboard Analítico** - Visualización de presupuestado vs. real
- ✅ **Gestión de Categorías** - Categorías jerárquicas personalizables
- ✅ **Gestión de Cuentas** - Múltiples medios de pago
- ✅ **Filtros Avanzados** - Búsqueda por fecha, categoría, cuenta, tipo

### v2.0 (React Migration) - 🔄 En Progreso
- ✅ **Proyecto React + TypeScript** - Setup completo con Vite 7
- ✅ **Tailwind CSS** - Configurado con dark mode
- ✅ **shadcn/ui** - Sistema de diseño moderno y accesible
- 🔄 **React Router** - Navegación client-side
- 🔄 **TanStack Query** - Server state management
- 🔄 **Migración de Páginas** - Dashboard, Transactions, Budget, Analysis

### v3.0+ - 📋 Planeado
- 📋 Control de Tarjetas de Crédito (cuotas)
- 📋 Gestión de Préstamos (amortización)
- 📋 Autenticación (multiusuario)
- 📋 App móvil (PWA)
- 📋 Integración con bancos (Open Banking)

---

## 🏗️ Arquitectura

Arquitectura **API-First** con separación clara entre frontend y backend:

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (React)                       │
│            localhost:5173 | :8080 (Docker)             │
│  - React 18 + TypeScript                               │
│  - Vite 7 (build tool)                                 │
│  - Tailwind CSS + shadcn/ui                            │
│  - TanStack Query (server state)                       │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST
                     ↓
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI)                      │
│            localhost:8000 | :8000 (Docker)             │
│  - Python 3.12 + FastAPI                               │
│  - SQLAlchemy ORM                                      │
│  - PostgreSQL (WSL2 | Supabase)                        │
│  - Uvicorn ASGI server                                 │
└─────────────────────────────────────────────────────────┘
                     │
                     ↓
         ┌───────────────────────┐
         │    PostgreSQL DB      │
         │  budgetapp_dev (dev)  │
         │  budgetapp_prod (prod)│
         └───────────────────────┘
```

**Separación de responsabilidades:**
- `/frontend` - UI, routing, client state
- `/backend` - API REST, lógica de negocio, acceso a datos
- `/docs` - Decisiones arquitectónicas (ADR) y RFCs

---

## 📁 Estructura del Proyecto

```
BudgetApp/
├── frontend/                 React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      Componentes reutilizables
│   │   ├── pages/           Páginas principales
│   │   ├── lib/             Utilidades y APIs
│   │   └── contexts/        Contextos React
│   └── vite.config.ts
│
├── backend/                 FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── api/            Endpoints REST
│   │   ├── db/             Base de datos
│   │   ├── models/         Modelos SQLAlchemy
│   │   └── services/       Lógica de negocio
│   └── requirements.txt
│
├── docs/                   Documentación
│   ├── adr/               Architecture Decision Records
│   └── rfc/               Request for Comments
│
├── compose.yml            Docker Compose (desarrollo)
├── Dockerfile.backend     Backend image
├── Dockerfile.frontend    Frontend image
├── nginx.conf            Nginx config (Docker)
├── render.yaml           Render Blueprint
│
└── QUICKSTART.md         Empezar en 30 segundos
   RENDER.md             Deployment
   README.md             Este archivo
```

---

## 🛠️ Tech Stack

**Frontend**
- React 18 - UI framework
- TypeScript 5 - Type safety
- Vite 7 - Build tool
- Tailwind CSS 3 - Styling
- shadcn/ui - Component library
- TanStack Query - Server state
- Recharts - Visualizations

**Backend**
- FastAPI - Web framework
- SQLAlchemy - ORM
- PostgreSQL 17 - Database
- Uvicorn - ASGI server
- Alembic - Migrations

**DevOps**
- Docker Compose - Local development
- Render.com - Cloud deployment
- GitHub - Version control

---

## ⚙️ Configuración

### Desarrollo Local
```bash
# Backend
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (otra terminal)
cd frontend
npm install
npm run dev
```

### Variables de Entorno
```
# backend/.env (desarrollo local)
DATABASE_URL=postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev

# root/.env (Docker)
DATABASE_URL=postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod
```

### Base de Datos
- **Host**: 192.168.126.127:5432 (PostgreSQL en WSL2)
- **User**: postgres
- **Password**: postgres
- **Dev DB**: budgetapp_dev (modificable)
- **Prod DB**: budgetapp_prod (producción-like, cuidado!)

---

## 📦 Dependencias Principales

### Backend
```
FastAPI 0.104+
SQLAlchemy 2+
psycopg2-binary (PostgreSQL driver)
pydantic (validation)
uvicorn (ASGI server)
```

### Frontend
```
React 18+
TypeScript 5+
Vite 7+
Tailwind CSS 3+
shadcn/ui (latest)
TanStack Query 5+
Recharts (charts)
```

---

## 🚀 Despliegue

### Local Development
```bash
npm run dev        # Frontend (5173)
uvicorn app.main:app --reload  # Backend (8000)
```

### Docker Local
```bash
docker compose up -d
# Frontend: http://192.168.126.127:8080
# Backend: http://192.168.126.127:8000/docs
```

### Render.com (Cloud)
```bash
git push origin master
# Render despliega automáticamente vía GitHub
# Frontend: https://budgetapp-frontend.onrender.com
# Backend: https://budgetapp-backend.onrender.com/docs
```

Ver [RENDER.md](RENDER.md) para instrucciones detalladas.

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm run test
```

---

## 📖 Documentación Adicional

### Arquitectura
- [ADR-001: API-First Architecture](docs/adr/ADR-001-api-first-architecture.md)
- [ADR Index](docs/adr/ADR-INDEX.md)

### RFCs
- [RFC-001: Backend Selection](docs/rfc/RFC-001-backend-selection.md)
- [RFC-002: Data Model](docs/rfc/RFC-002-data-model.md)

### Deployment
- [RENDER.md](RENDER.md) - Deploy en Render.com
- [QUICKSTART.md](QUICKSTART.md) - Empezar rápido

---

## 🐛 Issues y Bugs

Para reportar bugs o sugerir features, abre un [GitHub Issue](https://github.com/ninrauzer/BudgetApp/issues).

---

## 📝 License

Este proyecto es de código abierto. Ver `LICENSE` para más detalles.

---

## 👨‍💻 Desarrollador

Desarrollado por [ninrauzer](https://github.com/ninrauzer)

**Última actualización**: 19 Nov 2025
**Estado**: ✅ Production Ready
