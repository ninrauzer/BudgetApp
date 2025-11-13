# ADR-002 — Reestructuración del Proyecto en Backend/Frontend/Legacy

**Estado:** Approved  
**Fecha:** 2025-11-13  
**Autor:** Ninrauzer  
**Supersedes:** -  
**Replaced by:** -  

## 1. Contexto

El proyecto BudgetApp comenzó como un MVP con FastAPI + HTMX, siguiendo una arquitectura API-First (ver ADR-001). La aplicación actual tiene la siguiente estructura:

```
BudgetApp/
├── app/
│   ├── api/          # Routers FastAPI
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # Business logic
│   ├── templates/    # HTMX templates
│   └── static/       # CSS/JS
├── scripts/
├── docs/
└── requirements.txt
```

**Problemas identificados:**
1. **Debugging difícil con HTMX** - Los errores son opacos, HTML que falla silenciosamente
2. **Sin type safety** - JavaScript vanilla sin TypeScript causa errores en runtime
3. **Acoplamiento frontend/backend** - Templates mezclados con código de API
4. **Dificulta el desarrollo paralelo** - Backend y frontend no pueden evolucionar independientemente
5. **Preparación para producción** - El plan original (RFC-001, ADR-001) contemplaba migrar a React

**Contexto de negocio:**
- El MVP está funcional y validado
- El backend API-First está estable
- Se necesita mejor mantenibilidad y escalabilidad
- Se planea evolucionar a producto comercial

---

## 2. Decisión

**Se reestructura el proyecto separando completamente backend, frontend y código legacy:**

### Nueva estructura:

```
BudgetApp/
├── backend/                    # FastAPI independiente
│   ├── app/
│   │   ├── api/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   ├── scripts/
│   ├── tests/
│   ├── requirements.txt
│   ├── server.ps1
│   └── README.md
│
├── frontend/                   # React + TypeScript (nuevo)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── legacy/                     # HTMX (referencia histórica)
│   ├── templates/
│   ├── static/
│   └── README.md
│
├── docs/                       # Documentación sin cambios
├── budget.db                   # Base de datos compartida
└── README.md                   # Documentación principal
```

**Características clave:**
- **Backend:** Servidor independiente en puerto 8000, solo API REST
- **Frontend:** Aplicación React standalone, consume la API
- **Legacy:** Código HTMX preservado para referencia
- **Base de datos:** Compartida entre ambos frontends durante la transición

---

## 3. Alternativas consideradas

### 3.1 Mantener estructura actual y agregar React dentro de /app
❌ **Rechazada por:**
- Sigue acoplando frontend y backend
- Dificulta deployments independientes
- No resuelve el problema de organización
- Complica la configuración de build

### 3.2 Eliminar HTMX directamente y reemplazar con React
❌ **Rechazada por:**
- Pérdida de referencia funcional
- Mayor riesgo durante la migración
- No permite comparación lado a lado
- Dificulta validación de funcionalidades

### 3.3 ✅ Separación completa en carpetas independientes (Seleccionada)
**Ventajas:**
- Separación clara de responsabilidades
- Backend y frontend pueden deployarse independientemente
- Legacy preservado como referencia
- Migración gradual sin presión
- Facilita desarrollo en paralelo
- Alineado con arquitectura API-First de ADR-001

**Desventajas:**
- Requiere mover archivos y actualizar paths
- Necesita actualizar scripts de desarrollo
- Mayor complejidad inicial de setup

---

## 4. Criterios de Decisión

| Criterio | Estructura Actual | Agregar React en /app | Backend/Frontend Separados |
|----------|-------------------|----------------------|---------------------------|
| Separación de concerns | ❌ Baja | ⚠️ Media | ✅ Alta |
| Deploy independiente | ❌ No | ❌ No | ✅ Sí |
| Desarrollo paralelo | ❌ Difícil | ⚠️ Medio | ✅ Fácil |
| Preservar legacy | ⚠️ Mezclado | ⚠️ Mezclado | ✅ Separado |
| Complejidad setup | ✅ Baja | ⚠️ Media | ⚠️ Alta |
| Escalabilidad | ❌ Baja | ⚠️ Media | ✅ Alta |
| CI/CD | ❌ Difícil | ⚠️ Medio | ✅ Fácil |

---

## 5. Consecuencias

### 5.1 Positivas

✅ **Separación clara:** Backend y frontend son proyectos completamente independientes
✅ **Deploy flexible:** Pueden desplegarse en servidores diferentes
✅ **Desarrollo paralelo:** Backend y frontend pueden evolucionar sin bloquearse
✅ **Legacy preservado:** HTMX disponible para consulta y comparación
✅ **Migración gradual:** Puedes desarrollar React mientras HTMX sigue funcionando
✅ **Testing independiente:** Backend y frontend se testean por separado
✅ **CI/CD simplificado:** Pipelines separados para cada componente
✅ **Onboarding más fácil:** Nuevos desarrolladores entienden la estructura rápidamente

### 5.2 Negativas

⚠️ **Setup inicial más complejo:** Requiere configurar dos proyectos
⚠️ **Dos repositorios de dependencias:** backend/requirements.txt y frontend/package.json
⚠️ **CORS necesario:** Configuración adicional para desarrollo local
⚠️ **Migración de archivos:** Trabajo manual de reorganización
⚠️ **Actualización de imports:** Todos los imports del backend deben actualizarse

### 5.3 Impacto en el código

#### Backend (`/backend`)
```python
# Antes: from app.models.transaction import Transaction
# Después: Sin cambios en imports (igual estructura interna)

# Configuración CORS necesaria en main.py:
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Frontend (`/frontend`)
```typescript
// Axios/fetch apuntando a backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Ejemplo de llamada
const response = await axios.get(`${API_URL}/transactions`);
```

#### Legacy (`/legacy`)
```markdown
# README.md
Este código representa la versión MVP con HTMX.
Para la versión actual, ver /frontend

Conservado para:
- Referencia de funcionalidades implementadas
- Comparación durante la migración
- Documentación histórica del proyecto
```

### 5.4 Cambios en infraestructura

#### Desarrollo Local
- **Backend:** `cd backend && uvicorn app.main:app --reload` (puerto 8000)
- **Frontend:** `cd frontend && npm start` (puerto 3000)
- **Legacy:** `cd backend && uvicorn app.main:app --reload` (sirve templates HTMX)

#### Producción
```
Backend:  api.budgetapp.com  → FastAPI
Frontend: budgetapp.com      → React build (Nginx/Vercel)
```

### 5.5 Cambios en scripts

**backend/server.ps1:**
```powershell
# Ya no sirve templates, solo API
uvicorn app.main:app --reload --port 8000
```

**frontend/package.json:**
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "proxy": "http://localhost:8000"
  }
}
```

---

## 6. Plan de migración

### Fase 1: Reorganización (Inmediato)
1. ✅ Crear carpetas `backend/`, `frontend/`, `legacy/`
2. ✅ Mover `/app` (sin templates/static) a `/backend/app`
3. ✅ Mover `/scripts` a `/backend/scripts`
4. ✅ Mover `/templates` y `/static` a `/legacy`
5. ✅ Mover `requirements.txt`, `server.ps1` a `/backend`
6. ✅ Actualizar paths y configuración CORS

### Fase 2: Setup React (1-2 días)
1. Inicializar proyecto React en `/frontend`
2. Configurar TypeScript, ESLint, Prettier
3. Configurar Axios y manejo de estado (React Query / Zustand)
4. Crear estructura de carpetas base

### Fase 3: Migración gradual (2-4 semanas)
1. Dashboard → React
2. Transacciones → React
3. Presupuesto → React
4. Análisis → React
5. Configuración → React

### Fase 4: Cleanup (Después de migración completa)
1. Validar que React tiene 100% de funcionalidades
2. Archivar `/legacy` o eliminarlo
3. Actualizar documentación final

---

## 7. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Romper imports del backend | Alta | Alto | Testing exhaustivo después de mover |
| CORS mal configurado | Media | Medio | Documentar configuración claramente |
| Pérdida de funcionalidades | Baja | Alto | Mantener legacy funcional como referencia |
| Complejidad para nuevos devs | Media | Medio | README claro en cada carpeta |

---

## 8. Estado del documento
**Approved** - Decisión adoptada, implementación en progreso.

---

## 9. Supersedes / Superseded by
- **Supersedes:** Ninguno (nueva decisión)
- **Replaced by:** Ninguno (vigente)

---

## 10. Relación con otros documentos
- **ADR-001:** API-First Architecture - Esta reorganización refuerza la separación
- **RFC-001:** Selección de Backend - Confirma la evolución HTMX → React
- **RFC-004:** Migración a React (por crear) - Detallará la implementación del frontend

---

## 11. Siguientes pasos

1. ✅ Crear RFC-004 para detallar la migración a React
2. ✅ Actualizar ADR-INDEX.md con esta decisión
3. ✅ Ejecutar la reorganización de carpetas
4. ✅ Actualizar README.md principal con nueva estructura
5. ✅ Configurar CORS en FastAPI
6. ✅ Inicializar proyecto React en /frontend

---

## 12. Comentarios

Esta decisión es una evolución natural del plan original documentado en RFC-001 y ADR-001. La arquitectura API-First que adoptamos hace que esta separación sea limpia y sin riesgos significativos.

El mantener `/legacy` como referencia es una decisión conservadora que facilita la validación durante la migración y sirve como documentación viva del MVP.

---

**Aprobado por:** Ninrauzer  
**Fecha de aprobación:** 2025-11-13
