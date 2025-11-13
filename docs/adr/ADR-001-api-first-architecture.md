# ADR-001 — Elección de Arquitectura API-First

**Estado:** Approved  
**Fecha:** 2025-11-12  
**Autor:** Ninrauzer  
**Supersedes:** -  
**Replaced by:** -  

## 1. Contexto

La aplicación de gestión presupuestal debe cumplir con los siguientes requisitos:
- Ser accesible desde PC (navegador)
- Ser accesible desde móvil vía VPN (en la red local)
- Evolucionar de MVP a producto comercial
- Permitir cambiar el frontend sin afectar la lógica de negocio
- Facilitar el desarrollo iterativo (HTMX primero, React después)

Se necesita decidir la arquitectura base que guíe el desarrollo del proyecto.

---

## 2. Decisión

**Se adopta una arquitectura API-First con FastAPI como backend.**

La aplicación se compondrá de:
- **Backend:** API REST con FastAPI (Python)
- **Frontend:** Desacoplado, consumiendo la API
  - MVP: HTMX para interactividad rápida
  - Futuro: React para una SPA completa
- **Base de datos:** SQLite (desarrollo) → PostgreSQL (producción)

**Características clave:**
- Todo el backend expone endpoints REST JSON
- El frontend es intercambiable sin tocar el backend
- La lógica de negocio vive en el backend
- Documentación automática con OpenAPI/Swagger

---

## 3. Alternativas consideradas

### 3.1 Backend monolítico acoplado (SSR tradicional)
**Descripción:** Renderizar HTML desde el servidor con templates (Jinja2).

❌ **Rechazada por:**
- Dificulta migración a React
- Acopla frontend y backend
- Limita consumo desde otros clientes (móvil nativo, etc.)

### 3.2 Backend acoplado a HTMX
**Descripción:** Diseñar el backend específicamente para HTMX (respuestas HTML parciales).

❌ **Rechazada por:**
- Hace difícil la transición a React
- No permite reutilizar la API para otros clientes
- Limita el crecimiento del producto

### 3.3 ✅ API-First (Seleccionada)
**Descripción:** Backend expone solo API REST JSON, frontend consume la API.

✅ **Ventajas:**
- Desacoplamiento total frontend/backend
- Compatible con HTMX y React sin cambios
- Escalable a apps móviles nativas
- Documentación automática (Swagger)
- Facilita testing independiente
- Arquitectura moderna y estándar

⚠️ **Desventajas:**
- Requiere más estructura inicial
- Necesita definir schemas y contratos claros

---

## 4. Criterios de Decisión

| Criterio | Backend Monolítico | Backend HTMX | API-First |
|----------|-------------------|--------------|-----------|
| Desacoplamiento | ❌ Bajo | ⚠️ Medio | ✅ Alto |
| Escalabilidad | ❌ Baja | ⚠️ Media | ✅ Alta |
| Velocidad MVP | ✅ Rápida | ✅ Rápida | ⚠️ Media |
| Migración frontend | ❌ Difícil | ❌ Difícil | ✅ Fácil |
| Testing | ⚠️ Medio | ⚠️ Medio | ✅ Fácil |
| Documentación | ❌ Manual | ❌ Manual | ✅ Automática |
| Clientes múltiples | ❌ No | ❌ Limitado | ✅ Sí |

---

## 5. Consecuencias

### 5.1 Positivas
- ✅ **Backend estable:** Aunque el frontend cambie (HTMX → React), el backend no se toca
- ✅ **Endpoints reutilizables:** La misma API sirve para web, móvil, o integraciones
- ✅ **Documentación automática:** FastAPI genera Swagger/ReDoc sin esfuerzo adicional
- ✅ **Testeable:** API se puede probar independientemente del frontend
- ✅ **Escalable:** Permite agregar clientes (app móvil nativa) sin cambios
- ✅ **Estándar de la industria:** Arquitectura reconocida y bien documentada

### 5.2 Negativas
- ⚠️ **Requiere más estructura inicial:** Necesita definir schemas Pydantic y contratos claros
- ⚠️ **Dos proyectos separados:** Backend y frontend viven en carpetas/repos diferentes
- ⚠️ **CORS:** Necesita configuración correcta para desarrollo local

### 5.3 Cambios en el código
- **Estructura de proyecto:**
  ```
  /app
    /api          # Routers y endpoints
    /models       # SQLAlchemy models
    /schemas      # Pydantic schemas
    /services     # Lógica de negocio
    /db           # Conexión y configuración
  /frontend       # HTMX/React (separado)
  ```

- **Todos los endpoints seguirán el patrón:**
  - `/api/categories`
  - `/api/transactions`
  - `/api/budget-plan`
  - `/api/dashboard`

### 5.4 Cambios en infraestructura
- Desarrollo: Backend en `localhost:8000`, frontend puede estar en mismo puerto o diferente
- Producción: Nginx/Caddy como reverse proxy

---

## 6. Estado del documento
**Approved** - Decisión adoptada y en implementación.

---

## 7. Supersedes / Superseded by
- **Supersedes:** Ninguno (decisión inicial)
- **Replaced by:** Ninguno (vigente)

---

## 8. Relación con otros documentos
- **RFC-001:** Selección de Backend (FastAPI) - Complementa esta decisión
- **RFC-003:** Diseño de API REST - Implementa esta arquitectura
- **RFC-002:** Modelo de Datos - Base para los endpoints

---

## 9. Siguientes pasos
1. ✅ Crear estructura de carpetas `/app/api`, `/app/schemas`, `/app/models`, `/app/services`
2. ✅ Implementar routers para cada módulo:
   - `/api/categories`
   - `/api/accounts`
   - `/api/budget-plan`
   - `/api/transactions`
   - `/api/dashboard`
3. ✅ Configurar CORS para desarrollo local
4. ✅ Generar documentación automática en `/docs`

---

## 10. Comentarios
- Esta arquitectura permite empezar rápido con HTMX y migrar sin dolor a React.
- La decisión está alineada con el objetivo de convertir el MVP en producto vendible.
- FastAPI fue la opción natural dado RFC-001 (backend en Python).
