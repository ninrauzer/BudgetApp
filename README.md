# BudgetApp - Aplicación de Gestión Presupuestal Personal

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org)
[![SQLite](https://img.shields.io/badge/SQLite-3-lightgrey.svg)](https://www.sqlite.org)

Aplicación web para gestión presupuestal personal, desarrollada con arquitectura API-First, permitiendo planificar presupuestos, registrar transacciones y visualizar análisis financieros.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Documentación](#-documentación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Roadmap](#-roadmap)
- [Licencia](#-licencia)

---

## ✨ Características

### MVP (v1.0)
- ✅ **Budget Planning** - Planificación de presupuesto anual por categorías
- ✅ **Budget Tracking** - Registro diario de transacciones (ingresos/gastos)
- ✅ **Dashboard Analítico** - Visualización de presupuestado vs. real, tendencias
- ✅ **Gestión de Categorías** - Categorías jerárquicas (Ingresos, Gastos, Ahorros)
- ✅ **Gestión de Cuentas** - Diferentes medios de pago (Efectivo, Banco, Tarjetas)
- ✅ **API REST Completa** - Documentación automática con Swagger/ReDoc

### Futuro (v2.0+)
- 🔄 Control de Tarjetas de Crédito (cuotas)
- 🔄 Gestión de Préstamos (amortización)
- 🔄 Subscripciones Recurrentes
- 🔄 Autenticación (multiusuario)
- 🔄 App móvil (React Native / PWA)
- 🔄 Integración con bancos (Open Banking)

---

## 🏗️ Arquitectura

La aplicación sigue una **arquitectura API-First** (ver [ADR-001](docs/adr/ADR-001.md)):

```
┌─────────────────┐
│   Frontend      │  HTMX (MVP) → React (futuro)
│  (Desacoplado)  │
└────────┬────────┘
         │ HTTP/JSON
         │
┌────────▼────────┐
│   API REST      │  FastAPI
│   (Backend)     │
└────────┬────────┘
         │
┌────────▼────────┐
│   Base de Datos │  SQLite (dev) → PostgreSQL (prod)
└─────────────────┘
```

**Stack Tecnológico:**
- **Backend:** FastAPI (Python 3.12+)
- **Base de Datos:** SQLite (desarrollo/MVP) → PostgreSQL (producción)
- **ORM:** SQLAlchemy
- **Validación:** Pydantic v2
- **Frontend:** HTMX (MVP) → React (producto final)

**Decisiones Arquitectónicas:**
- [RFC-001](docs/rfc/RFC-001-backend-selection.md) - Selección de Backend (FastAPI)
- [RFC-002](docs/rfc/RFC-002-data-model.md) - Modelo de Datos
- [RFC-003](docs/rfc/RFC-003-api-design.md) - Diseño de API REST
- [ADR-001](docs/adr/ADR-001-api-first-architecture.md) - Arquitectura API-First

---

## 📦 Requisitos

- Python 3.12 o superior
- pip (gestor de paquetes de Python)
- Git

---

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/ninrauzer/BudgetApp.git
cd BudgetApp
```

### 2. Crear entorno virtual
```bash
# Windows (PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Linux/Mac
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Inicializar base de datos
```bash
python scripts/init_db.py
```

### 5. Ejecutar el servidor
```bash
uvicorn app.main:app --reload
```

La API estará disponible en: `http://localhost:8000`

---

## 💻 Uso

### Acceder a la documentación interactiva

**Swagger UI (recomendado):**
```
http://localhost:8000/docs
```

**ReDoc (alternativa):**
```
http://localhost:8000/redoc
```

### Ejemplos de uso de la API

#### Crear una transacción
```bash
curl -X POST "http://localhost:8000/api/transactions" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-11-12",
    "category_id": 9,
    "account_id": 1,
    "amount": 50.00,
    "type": "expense",
    "description": "Supermercado",
    "status": "completed"
  }'
```

#### Obtener dashboard del mes actual
```bash
curl "http://localhost:8000/api/dashboard"
```

#### Listar transacciones del mes
```bash
curl "http://localhost:8000/api/transactions?start_date=2025-11-01&end_date=2025-11-30"
```

---

## 📚 Documentación

La documentación completa del proyecto está en la carpeta [`/docs`](docs/):

### RFCs (Request for Comments)
- [RFC-001](docs/rfc/RFC-001.md) - Selección de Backend
- [RFC-002](docs/rfc/RFC-002.md) - Modelo de Datos
- [RFC-003](docs/rfc/RFC-003.md) - Diseño de API REST

### ADRs (Architecture Decision Records)
- [ADR-001](docs/adr/ADR-001.md) - Arquitectura API-First
- [ADR_INDEX](docs/adr/ADR_INDEX.md) - Índice de decisiones

### Otros
- [CONVENTIONS.md](docs/CONVENTIONS.md) - Convenciones del proyecto
- [ANALISIS_FACTIBILIDAD.md](ANALISIS_FACTIBILIDAD.md) - Análisis inicial del Excel

---

## 📂 Estructura del Proyecto

```
BudgetApp/
├── app/                      # Código de la aplicación
│   ├── api/                  # Routers y endpoints
│   │   ├── categories.py
│   │   ├── accounts.py
│   │   ├── budget_plan.py
│   │   ├── transactions.py
│   │   └── dashboard.py
│   ├── models/               # Modelos SQLAlchemy
│   │   ├── category.py
│   │   ├── account.py
│   │   ├── budget_plan.py
│   │   └── transaction.py
│   ├── schemas/              # Schemas Pydantic
│   │   ├── category.py
│   │   ├── account.py
│   │   ├── budget_plan.py
│   │   └── transaction.py
│   ├── services/             # Lógica de negocio
│   │   ├── category_service.py
│   │   ├── account_service.py
│   │   ├── budget_service.py
│   │   ├── transaction_service.py
│   │   └── dashboard_service.py
│   ├── db/                   # Configuración de BD
│   │   ├── database.py
│   │   └── session.py
│   └── main.py               # Punto de entrada FastAPI
├── docs/                     # Documentación
│   ├── rfc/                  # Request for Comments
│   ├── adr/                  # Architecture Decision Records
│   ├── design/               # Diagramas
│   ├── runbooks/             # Procedimientos operativos
│   └── CONVENTIONS.md
├── scripts/                  # Scripts utilitarios
│   ├── init_db.py            # Inicializar BD con datos
│   └── migrate_to_postgres.py
├── tests/                    # Tests
│   ├── test_api/
│   └── test_services/
├── .env.example              # Variables de entorno
├── requirements.txt          # Dependencias Python
├── README.md                 # Este archivo
└── budget.db                 # Base de datos SQLite (generado)
```

---

## 🗺️ Roadmap

### Fase 1: MVP (✅ Actual)
- [x] Diseño de arquitectura
- [x] Modelo de datos
- [x] API REST completa
- [ ] Inicialización de BD
- [ ] Tests de integración
- [ ] Frontend con HTMX
- [ ] Deployment local

### Fase 2: Producción (🔄 Próximo)
- [ ] Migración a PostgreSQL
- [ ] Frontend con React
- [ ] Gráficos y visualizaciones
- [ ] Exportación a Excel/PDF
- [ ] CI/CD
- [ ] Deploy en VPS

### Fase 3: Producto (🔮 Futuro)
- [ ] Sistema de autenticación
- [ ] Multiusuario
- [ ] Control de Tarjetas de Crédito
- [ ] Gestión de Préstamos
- [ ] App móvil (PWA)
- [ ] Integración con bancos

---

## 🤝 Contribución

Este es un proyecto personal, pero sugerencias y feedback son bienvenidos.

### Workflow recomendado:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 👤 Autor

**Ninrauzer** (Renan Ruiz)

- GitHub: [@ninrauzer](https://github.com/ninrauzer)
- SAK: [Software Architecture Kit](https://github.com/ninrauzer/Software_Architecture_Kit_SAK)

---

## 📝 Notas

- Este proyecto nació del análisis de un Excel de presupuesto personal (ver [ANALISIS_FACTIBILIDAD.md](ANALISIS_FACTIBILIDAD.md))
- Sigue las prácticas de **Architecture Knowledge Management (AKM)**
- Documentación basada en el [Software Architecture Kit (SAK)](https://github.com/ninrauzer/Software_Architecture_Kit_SAK)

---

**¿Tienes preguntas?** Abre un [Issue](https://github.com/ninrauzer/BudgetApp/issues) o revisa la [documentación](docs/).

**Última actualización:** 2025-11-12
