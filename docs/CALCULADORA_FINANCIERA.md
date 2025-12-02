# Calculadora Financiera para BudgetApp

## Objetivo
Agregar una calculadora completa para operaciones comunes en finanzas personales, además de la conversión de monedas.

---

## Funcionalidades Clave

### 1. Conversión de Moneda
- PEN ⇄ USD (usando tasa de cambio actual)
- Futuro: otras monedas

### 2. Operaciones Básicas
- Suma, resta, multiplicación, división
- Porcentajes (ej: ¿cuánto es el 15% de 120?)
- Cálculo de descuentos (ej: 120 - 15%)
- Cálculo de incremento (ej: 120 + 10%)
- División de cuentas (ej: dividir un gasto entre varias personas)

### 3. Operaciones Financieras Útiles
- Cálculo de cuota mensual (préstamos simples)
- Cálculo de interés simple y compuesto
- Cálculo de porcentaje de ahorro sobre ingreso
- Cálculo de cuánto necesitas ahorrar para una meta

---

## UI Sugerida

```
┌───────────────────────────────┐
│   Calculadora Financiera      │
├───────────────────────────────┤
│ [ 120 + 15% ] = 138           │
│ [ 200 / 3 ] = 66.67           │
│ [ 500 * 0.07 ] = 35           │
│ [ 1000 PEN → USD ] = 250      │
│                               │
│ [Historial de operaciones]    │
│ [Copiar resultado] [Usar]     │
└───────────────────────────────┘
```
- Campo de entrada tipo calculadora (permite expresiones: `120+15%`, `200/3`, `1000*0.07`, etc.)
- Botones rápidos para: %, dividir, convertir moneda
- Historial de operaciones recientes
- Botón para copiar resultado o usarlo en una transacción

---

## Detalles Técnicos
- Parser de expresiones matemáticas (puede usar librerías como mathjs)
- Soporte para `%` como porcentaje relativo al número anterior
- Integración con `/api/exchange-rate` para conversión
- Validación de entradas y manejo de errores
- Responsive y accesible

---

## Casos de Uso
- Calcular descuentos o incrementos rápidamente
- Dividir gastos entre varias personas
- Calcular intereses o cuotas de préstamos
- Convertir montos entre monedas
- Usar el resultado directamente para crear una transacción

---

## Beneficios
- Centraliza todas las operaciones financieras cotidianas en la app
- Ahorra tiempo y reduce errores manuales
- Mejora la experiencia y profesionalismo de la app

---

## Futuro
- Calculadora de préstamos avanzada (sistema francés, alemán, etc.)
- Simulador de metas de ahorro
- Cálculo de impuestos
- Exportar historial de cálculos

---

**Propuesta lista para implementar.**
