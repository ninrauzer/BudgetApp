# ADR-002: Planificación de Compras Extraordinarias

**Estado**: Propuesto  
**Fecha**: 2025-11-17  
**Decisor**: Usuario  
**Contexto**: Dashboard rediseñado con métricas de ciclo actual

---

## Contexto y Problema

El sistema actual de presupuesto está diseñado para **gastos recurrentes mensuales** basados en ciclos de facturación (día 23 de cada mes). Sin embargo, no existe funcionalidad para **planificar compras extraordinarias** (laptop, viaje, muebles, etc.) sin comprometer la estabilidad financiera.

### Problema Específico

**Escenario real**: Usuario necesita comprar laptop por 3,000 PEN.

**Estado actual del sistema**:
- Disponible hasta fin de ciclo: 4,018 PEN (6 días restantes)
- Límite diario: 670 PEN/día
- Proyección de cierre: -3,584 PEN (si gasta promedio actual)

**¿Qué pasa si compra la laptop hoy?**
1. ✅ Dashboard muestra que "tiene dinero disponible"
2. ❌ Después de compra: Disponible = 1,018 PEN (6 días)
3. 🔴 Nuevo límite: 170 PEN/día (insostenible)
4. 🔴 Proyección de cierre: -6,000+ PEN
5. 🔴 **No hay visibilidad del impacto en ciclos futuros**

### Pregunta Clave del Usuario
> "¿Cómo saber que al comprar algo caro no me sabotearé?"

---

## Opciones Consideradas

### Opción A: Simulador de Impacto Rápido

**Descripción**: Card adicional en Dashboard que simula impacto de una compra.

**UI Propuesta**:
```
┌─────────────────────────────────────┐
│ SIMULADOR DE COMPRA                 │
├─────────────────────────────────────┤
│ Monto a simular:                    │
│ [________] PEN    [Simular]         │
│                                     │
│ Impacto de 3,000 PEN:               │
│ ✅ Ciclo actual: -2,000 déficit     │
│ ⚠️  Siguiente: Recuperas +1,500     │
│ ✅ 3er ciclo: Normal (+1,000)       │
│                                     │
│ 💡 Mejor fecha: 23-Nov (nuevo ciclo)│
└─────────────────────────────────────┘
```

**Backend necesario**:
```python
GET /api/dashboard/purchase-impact?amount=3000&date=2025-11-17
Response: {
    "can_afford": true,
    "current_cycle_impact": -2000,
    "next_3_cycles": [
        {"cycle": "2025-11-23 to 2025-12-22", "balance": 1500},
        {"cycle": "2025-12-23 to 2026-01-22", "balance": 1000},
        {"cycle": "2026-01-23 to 2026-02-22", "balance": 800}
    ],
    "recommended_date": "2025-11-23",
    "recommendation": "Espera 6 días para minimizar impacto"
}
```

**Pros**:
- ✅ Implementación rápida (1-2 horas)
- ✅ Responde pregunta inmediata
- ✅ No requiere cambios en DB
- ✅ UX simple

**Contras**:
- ❌ Solo simulación, no guarda historial
- ❌ No ayuda a planificar a largo plazo
- ❌ Cálculo manual cada vez

**Estimación**: 1-2 horas

---

### Opción B: Módulo de Metas de Ahorro

**Descripción**: Sistema completo de metas con ajuste automático de presupuesto.

**UI Propuesta**:
```
┌─────────────────────────────────────┐
│ METAS DE AHORRO                     │
├─────────────────────────────────────┤
│ Meta: Laptop Dell XPS               │
│ Objetivo: 3,000 PEN                 │
│ Ahorro mensual: 1,000 PEN           │
│ Progreso: [████░░░] 40% (1,200 PEN)│
│ Faltante: 1,800 PEN (2 meses)       │
│                                     │
│ Impacto en presupuesto:             │
│ • Gastos Variables: 5,900 → 4,900   │
│ • Ahorro Laptop: +1,000 PEN/mes     │
└─────────────────────────────────────┘
```

**Modelo de datos**:
```python
class SavingGoal(Base):
    id: int
    name: str  # "Laptop Dell XPS"
    target_amount: Decimal  # 3000.00
    monthly_contribution: Decimal  # 1000.00
    current_saved: Decimal  # 1200.00
    start_date: date
    target_date: date
    category_id: int  # Categoría de origen del ahorro
    is_active: bool
```

**Features**:
1. Crear meta con objetivo y plazo
2. Auto-ajustar presupuesto de categoría fuente
3. Trackeo de progreso con gráfico
4. Notificación al alcanzar meta
5. Historial de metas completadas

**Pros**:
- ✅ Planificación estructurada
- ✅ Disciplina financiera
- ✅ Trackeo de progreso motivacional
- ✅ Historial de logros

**Contras**:
- ❌ Complejidad mayor (4-6 horas)
- ❌ Requiere nuevas tablas en DB
- ❌ UX más compleja
- ❌ Puede sentirse restrictivo

**Estimación**: 4-6 horas

---

### Opción C: Indicador de "Excedente Acumulado"

**Descripción**: Card que muestra cuánto dinero "extra" se ha ahorrado en últimos 3 meses.

**UI Propuesta**:
```
┌─────────────────────────────────────┐
│ CAPACIDAD DE COMPRA LIBRE           │
├─────────────────────────────────────┤
│ Excedente acumulado (3 meses):      │
│ 8,500 PEN                           │
│                                     │
│ Podrías gastar hasta este monto     │
│ sin comprometer estabilidad.        │
│                                     │
│ Desglose:                           │
│ • Ago-Sep: +2,500 PEN               │
│ • Sep-Oct: +3,000 PEN               │
│ • Oct-Nov: +3,000 PEN (proyectado)  │
└─────────────────────────────────────┘
```

**Cálculo**:
```python
# Suma de saldos positivos de últimos 3 ciclos
excedente = sum([
    max(0, ciclo_1.balance),
    max(0, ciclo_2.balance),
    max(0, ciclo_3.balance)
])
```

**Pros**:
- ✅ Implementación muy rápida (30 min)
- ✅ Métrica simple y clara
- ✅ No requiere input del usuario
- ✅ Responde "¿cuánto puedo gastar?"

**Contras**:
- ❌ No simula impacto futuro
- ❌ No ayuda a planificar
- ❌ Puede sobre-simplificar

**Estimación**: 30 minutos

---

## Comparación de Opciones

| Criterio | Opción A: Simulador | Opción B: Metas | Opción C: Excedente |
|----------|---------------------|-----------------|---------------------|
| **Tiempo implementación** | 1-2 horas | 4-6 horas | 30 minutos |
| **Responde pregunta inmediata** | ✅ Sí | ⚠️ Parcial | ✅ Sí |
| **Planificación largo plazo** | ❌ No | ✅ Sí | ❌ No |
| **Complejidad UX** | Media | Alta | Baja |
| **Cambios en DB** | No | Sí (nueva tabla) | No |
| **Disciplina financiera** | Baja | Alta | Baja |
| **Flexibilidad** | Alta | Media | Alta |

---

## Decisión

**[PENDIENTE]** - Usuario evaluará opciones.

---

## Consecuencias Esperadas

### Si se elige Opción A (Simulador)
- ✅ Usuario puede validar compras antes de hacerlas
- ✅ Reduce ansiedad financiera
- ✅ Implementación rápida
- ⚠️ Requiere disciplina manual para consultar

### Si se elige Opción B (Metas)
- ✅ Sistema completo de ahorro estructurado
- ✅ Motivación por progreso visible
- ✅ Disciplina financiera forzada
- ⚠️ Puede sentirse restrictivo
- ⚠️ Mayor inversión de tiempo

### Si se elige Opción C (Excedente)
- ✅ Indicador simple de "dinero libre"
- ✅ Implementación inmediata
- ⚠️ No educa sobre impacto
- ⚠️ Puede llevar a malas decisiones

---

## Notas Adicionales

### Posible Combinación
Se podrían implementar **Opción C + Opción A**:
1. Card "Excedente" da respuesta rápida (30 min)
2. Simulador permite validar compras específicas (1-2 horas)
3. Total: 2-3 horas para solución completa

Opción B (Metas) podría agregarse después si se necesita más estructura.

---

## Referencias

- Dashboard actual: `/frontend/src/pages/Dashboard.tsx`
- Endpoints ciclos: `/backend/app/api/dashboard.py`
- Modelo BudgetPlan: `/backend/app/models/budget_plan.py`
- ADR-001: API-First Architecture

---

**Próximos pasos**:
1. Usuario decide qué opción prefiere
2. Crear plan de implementación
3. Actualizar este ADR con decisión final
