# Legacy - HTMX Frontend (MVP)

Este directorio contiene el código del frontend original desarrollado con HTMX durante la fase MVP del proyecto BudgetApp.

## 📦 Contenido

- **templates/** - Plantillas HTML con HTMX
- **static/** - CSS y JavaScript vanilla

## ⚠️ Estado

**Este código está en modo legacy (solo referencia histórica).**

El frontend activo del proyecto ahora es **React + TypeScript** ubicado en `/frontend`.

## 🎯 Propósito

Este código se conserva para:

1. **Referencia funcional** - Consultar cómo se implementaron las funcionalidades
2. **Comparación durante migración** - Validar que React tenga todas las features
3. **Documentación histórica** - Registro del MVP

## 🔍 Funcionalidades Implementadas

### Páginas principales:
- `dashboard.html` - Dashboard con métricas financieras
- `transactions.html` - Gestión de transacciones (CRUD + filtros)
- `budget.html` - Planes de presupuesto mensual
- `analysis.html` - Análisis y reportes
- `settings.html` - Configuración de cuentas y categorías

### Características destacadas:
- ✅ Quick Add Panel (agregar transacciones rápido)
- ✅ Filtros dinámicos con HTMX
- ✅ Modo oscuro/claro
- ✅ Iconos con Lucide
- ✅ Interactividad sin JavaScript complejo

## 📚 Tecnologías Usadas

- **HTMX 1.9** - Interactividad HTML
- **Vanilla JavaScript** - Lógica client-side
- **CSS Custom Properties** - Theming
- **Lucide Icons** - Iconografía

## ⚡ Cómo usar (solo para referencia)

Para ejecutar el frontend HTMX (requiere backend en `/backend`):

```powershell
cd backend
.\server.ps1 start
```

Luego navegar a: `http://localhost:8000`

## 🚀 Migración a React

Ver documentación completa de la migración:
- **RFC-004:** Plan de migración a React
- **ADR-002:** Decisión de reestructuración del proyecto

## 🗓️ Historial

- **Inicio:** 2025-11-12 - MVP con HTMX
- **Fin:** 2025-11-13 - Movido a legacy, inicio migración React

---

**Para la versión actual del frontend, ver:** `/frontend`  
**Para el backend (sin cambios), ver:** `/backend`
