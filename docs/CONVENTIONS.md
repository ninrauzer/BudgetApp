# 📘 Convenciones de Estados y Numeración – BudgetApp

Este documento define los **estados oficiales** y las **reglas de numeración** utilizadas en los RFC y ADR del proyecto BudgetApp, basado en el Software Architecture Kit (SAK).

---

## 🧭 Estados de los RFC (Request for Comments)

Los RFC describen propuestas de arquitectura o diseño técnico que pueden evolucionar con el tiempo.

| Estado | Descripción |
|--------|--------------|
| Draft | Borrador inicial abierto a comentarios. |
| Proposed | Propuesta formal lista para revisión o aprobación. |
| Approved | Aprobado oficialmente o validado por el equipo técnico. |
| Implemented | La propuesta fue desarrollada e integrada al sistema. |
| Deprecated | Obsoleta o reemplazada por un nuevo enfoque. |
| Rejected | No aprobada tras revisión. |
| Withdrawn | Retirada por el autor antes de ser revisada. |

📘 **Flujo típico:**  
`Draft → Proposed → Approved → Implemented → Deprecated`

---

## 🧱 Estados de los ADR (Architecture Decision Records)

Los ADR registran decisiones técnicas puntuales. Su ciclo de vida es más corto y concreto.

| Estado | Descripción |
|--------|--------------|
| Proposed | Decisión planteada, pendiente de consenso. |
| Approved | Decisión adoptada y vigente. |
| Superseded | Reemplazada por otra decisión posterior. |
| Deprecated | Ya no válida, pero se conserva por historial. |

📘 **Flujo típico:**  
`Proposed → Approved → Superseded`

---

## 🔢 Convención de numeración

Cada RFC y ADR recibe un número incremental y un título descriptivo en minúsculas:

```
RFC-001-backend-selection.md
RFC-002-data-model.md
RFC-003-api-design.md

ADR-001-api-first-architecture.md
ADR-002-database-choice.md
```

- Los números se asignan en orden cronológico.
- Los nombres deben ser cortos, descriptivos y en minúsculas con guiones.
- Los archivos se agrupan en las carpetas correspondientes:
  - `/docs/rfc/` → Propuestas de arquitectura.
  - `/docs/adr/` → Decisiones técnicas.

## 🧩 Buenas prácticas

- Cada cambio importante en la arquitectura debe generar un nuevo RFC o ADR, no modificar uno existente.
- Los documentos previos se conservan por trazabilidad.
- Los RFC o ADR que reemplazan a otro deben incluir una línea de referencia:
    ```
    Supersedes: ADR-001
    Replaced by: ADR-004
    ```

---

## 🧾 Convenciones de Formato y Notas

Para mantener coherencia en la documentación, se usarán bloques de cita en Markdown para resaltar información relevante.

### 💡 Notas informativas
Se utilizan para resaltar aclaraciones, supuestos o recordatorios.

> 💡 **Nota:**  
> Esta propuesta asume que el servicio de autenticación se agregará en una versión posterior.

---

## 📚 Referencias

- Software Architecture Kit (SAK) - https://github.com/ninrauzer/Software_Architecture_Kit_SAK
- *Documenting Architecture Decisions* – Michael Nygard
- *RFC Process* – IETF

📅 Última actualización: **2025-11-12**
