# Calculadora de Conversión PEN ⇄ USD para BudgetApp

## Objetivo
Agregar una calculadora simple y accesible para convertir montos entre Soles (PEN) y Dólares (USD) usando la tasa de cambio actual de la app.

---

## Casos de Uso
- Convertir rápidamente montos entre PEN y USD para planificar gastos, ingresos o presupuestos.
- Usar la calculadora antes de registrar una transacción o presupuesto.
- Consultar la tasa de cambio actual sin salir de la app.

---

## Ubicación Sugerida
- **Botón flotante** en el dashboard y/o página de transacciones.
- **Acceso rápido** desde el modal de agregar/editar transacción.
- **Widget** en la barra lateral o menú superior.

---

## Flujo de Usuario
1. **Abrir calculadora** (botón o menú).
2. **Ingresar monto** en Soles o Dólares.
3. **Ver conversión automática** al otro valor usando la tasa de cambio actual.
4. **Opción de copiar** el resultado o usarlo directamente para crear una transacción.

---

## UI Sugerida

```
┌───────────────────────────────┐
│   Calculadora de Moneda       │
├───────────────────────────────┤
│ PEN (S/):   [   100.00   ]    │
│ USD ($):    [   25.00    ]    │
│                               │
│ Tasa actual: 4.00             │
│ [↔ Cambiar sentido]           │
│ [Copiar resultado] [Usar]     │
└───────────────────────────────┘
```

- El usuario puede escribir en cualquiera de los dos campos.
- El otro campo se actualiza automáticamente.
- La tasa se obtiene de `/api/exchange-rate`.
- Botón para invertir el sentido (PEN→USD o USD→PEN).
- Botón para copiar el resultado o usarlo en una transacción.

---

## Detalles Técnicos
- Usar el endpoint `/api/exchange-rate` para obtener la tasa actual.
- Permitir ingresar decimales y validar solo números positivos.
- Actualizar la tasa automáticamente si cambia (opcional: refresco cada 1h).
- Accesible y responsive (mobile-friendly).

---

## Beneficios
- Ahorra tiempo y reduce errores de cálculo manual.
- Mejora la experiencia para usuarios que manejan ambas monedas.
- Hace la app más completa y profesional.

---

## Futuro
- Permitir elegir otras monedas (EUR, CLP, etc.)
- Historial de tasas de cambio.
- Conversión automática al registrar transacciones en moneda distinta a la cuenta.

---

**Propuesta lista para implementar.**
