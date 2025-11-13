# Documentación del Proyecto BudgetApp

Esta carpeta contiene toda la documentación arquitectónica y técnica del proyecto, siguiendo las prácticas de **Architecture Knowledge Management (AKM)** del [Software Architecture Kit (SAK)](https://github.com/ninrauzer/Software_Architecture_Kit_SAK).

## 📂 Estructura

```
/docs
 ├── /rfc              # Request for Comments - Propuestas de arquitectura
 ├── /adr              # Architecture Decision Records - Decisiones técnicas
 ├── /runbooks         # Procedimientos operativos y mantenimiento
 ├── /design           # Diagramas y esquemas visuales
 ├── CONVENTIONS.md    # Convenciones de estados y numeración
 └── README.md         # Este archivo
```

## 📋 Documentos Clave

### RFCs (Request for Comments)
- [RFC-001](rfc/RFC-001-backend-selection.md) - Selección de Backend (FastAPI)
- [RFC-002](rfc/RFC-002-data-model.md) - Modelo de Datos
- [RFC-003](rfc/RFC-003-api-design.md) - Diseño de API REST

### ADRs (Architecture Decision Records)
- [ADR-001](adr/ADR-001-api-first-architecture.md) - Arquitectura API-First
- [ADR-INDEX](adr/ADR-INDEX.md) - Índice completo de decisiones

## 📖 Cómo usar esta documentación

1. **Para proponer cambios:** Crea un nuevo RFC en `/rfc/`
2. **Para registrar decisiones:** Crea un nuevo ADR en `/adr/` y actualiza `ADR_INDEX.md`
3. **Para documentar operaciones:** Agrega runbooks en `/runbooks/`
4. **Para esquemas visuales:** Guarda diagramas en `/design/`

Consulta [CONVENTIONS.md](CONVENTIONS.md) para conocer los estados y formatos oficiales.

---

**Última actualización:** 2025-11-12  
**Autor:** Ninrauzer