# RFC-001 — Selección de Backend para la Aplicación de Gestión Presupuestal Personal

**Estado:** Approved  
**Autor:** Ninrauzer  
**Fecha:** 2025-11-12  
**Versión:** 1.0  
**Supersedes:** -  
**Replaced by:** -  

## 1. Contexto
Se desarrollará una aplicación web para gestión presupuestal personal con los siguientes módulos:
1. Planeamiento financiero anual  
2. Registro diario de transacciones  
3. Dashboard analítico  

Se requiere seleccionar el backend adecuado para:
- un MVP rápido  
- ejecución local  
- acceso móvil vía VPN  
- futura escalabilidad a producto vendible  

Se evalúan dos alternativas:
- FastAPI (Python)  
- .NET 8 (C#)

## 2. Alcance
El backend deberá ofrecer:
- API REST  
- Lógica financiera encapsulada  
- Persistencia en SQLite (MVP) y PostgreSQL (producción)  
- Independencia del frontend (HTMX → React)  
- Facilidad de mantenimiento personal

## 3. Requisitos
### Funcionales
- CRUD de transacciones  
- Gestión de plan anual  
- Generación de métricas  
- Exposición de endpoints JSON  

### No Funcionales
- Velocidad de desarrollo  
- Mantenibilidad  
- Bajo consumo de recursos  
- Baja complejidad  
- Portabilidad  

## 4. Análisis de Alternativas

### 4.1 FastAPI
**Ventajas**
- Desarrollo extremadamente rápido  
- Ecosistema ideal para manipulación de datos  
- Pydantic para validación automática  
- Menos código y más flexibilidad  
- Ideal para ejecución local  
- Fácilmente escalable a React  
- Excelente para prototipos y productos iniciales  

**Desventajas**
- Menor performance bruto (irrelevante para este caso)  

---

### 4.2 .NET 8
**Ventajas**
- Alta performance  
- Robusto para entornos enterprise  
- Buen tooling  

**Desventajas**
- Más lento para el MVP  
- Más ceremonia y mantenimiento  
- Menos flexible para manipulación de datos  

---

## 5. Comparación

| Criterio | FastAPI | .NET 8 |
|---------|---------|--------|
| Velocidad MVP | **Muy alta** | Media |
| Mantenibilidad | **Alta** | Media |
| Manipulación de datos | **Excelente** | Media |
| Performance | Buena | **Muy alta** |
| Complejidad | **Baja** | Media |
| Flexibilidad | **Alta** | Media |

---

## 6. Decisión
Se selecciona **FastAPI** como backend para el MVP y la primera versión del producto.

Razones:
1. Alta velocidad de desarrollo.  
2. Mejor adaptación para manipulación de datos financieros.  
3. Menor carga de mantenimiento.  
4. Backend fácilmente consumible desde HTMX y React.  
5. Si en el futuro se decide migrar a .NET 8, la transición es sencilla gracias a la arquitectura API-first.

---

## 7. Impacto en la Arquitectura
- Backend: FastAPI  
- Base de datos: SQLite → PostgreSQL  
- Frontend: HTMX (MVP) → React (producto)  
- Exposición completa vía API REST  

---

## 8. Próximos Pasos
- RFC-002: Modelo de Datos  
- RFC-003: Diseño de API REST
- ADR-001: Arquitectura API-First  

## 9. Estado del Documento
**Approved** - La decisión ha sido adoptada y se encuentra en implementación.

## 10. Comentarios
- Decisión alineada con la necesidad de desarrollo rápido del MVP.
- La arquitectura API-First permite migrar el frontend sin afectar el backend.  
