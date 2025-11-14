# ADR-003: Separación de Responsabilidades - Budget y Analysis

**Status**: Accepted  
**Date**: 2025-11-14  
**Deciders**: Development Team  
**Related**: ADR-001 (API-First Architecture)

## Context

Durante el diseño de la funcionalidad de presupuestos, surgió la necesidad de definir claramente las responsabilidades entre dos páginas clave:
- **Budget**: Gestión de planes presupuestarios
- **Analysis**: Visualización y análisis de datos financieros

El sistema ya cuenta con:
- Modelo `BudgetPlan` migrado a sistema de ciclos de facturación
- API parcialmente implementada (`budget_plans.py`)
- Página Analysis funcional con gráficos de tendencias

La pregunta clave era: **¿Dónde colocar la comparación Real vs Presupuestado?**

## Decision

Adoptamos una **separación clara de responsabilidades**:

### 📊 **Analysis Page** - Dashboard de Visualización
**Responsabilidad**: Mostrar datos, comparaciones y análisis visuales

**Funcionalidades**:
- ✅ Gráficos de tendencias (ya implementado)
- ✅ Top 10 categorías (ya implementado)
- ✅ Estadísticas del ciclo (ya implementado)
- 🆕 **Comparación Real vs Presupuestado**
  - Barras de progreso por categoría
  - Alertas cuando se excede 80% del límite
  - KPIs de cumplimiento presupuestario
- 🆕 Variación porcentual vs ciclo anterior
- 🆕 Proyecciones de gasto

**Naturaleza**: Solo lectura (read-only), enfocado en insights

---

### 💰 **Budget Page** - Editor de Presupuesto
**Responsabilidad**: Crear y editar planes presupuestarios

**Funcionalidades**:
- 🆕 **Vista Anual**: Grid editable de 12 meses × categorías
- 🆕 **Vista Mensual**: Lista editable por categoría de un mes específico
- 🆕 **Funciones de productividad**:
  - Copiar columna (mes) → otros meses
  - Copiar fila (categoría) → todos los meses
  - Aplicar mismo valor a múltiples celdas
  - Limpiar/Restablecer mes completo
  - Importar presupuesto de año anterior

**Naturaleza**: Editor puro (CRUD), sin visualizaciones ni análisis

---

## Rationale

### ✅ Ventajas de esta separación:

1. **Claridad conceptual**
   - Budget = "Planear el futuro"
   - Analysis = "Entender el presente"

2. **UX optimizada**
   - Usuarios que planifican: van a Budget (modo edición)
   - Usuarios que monitorean: van a Analysis (modo lectura)

3. **Performance**
   - Budget: carga solo datos de presupuesto (ligero)
   - Analysis: carga datos + cálculos + gráficos (más pesado)

4. **Escalabilidad**
   - Budget puede agregar features de planificación (templates, IA sugerencias)
   - Analysis puede agregar más gráficos sin afectar el editor

5. **Código mantenible**
   - Separación de concerns (SoC)
   - Componentes independientes
   - Testing más fácil

### ❌ Alternativa rechazada: Página única Budget+Analysis

**Razones del rechazo**:
- Sobrecarga cognitiva (demasiadas funciones en una página)
- Performance (cargar editor + gráficos = lento)
- UX confusa (¿estoy planeando o analizando?)
- Código acoplado (cambios en uno afectan al otro)

---

## Technical Design

### 1. Data Model (ya implementado)

```python
class BudgetPlan(Base):
    __tablename__ = "budget_plans"
    
    id = Column(Integer, primary_key=True)
    cycle_name = Column(String, nullable=False)      # "Enero", "Febrero"
    start_date = Column(Date, nullable=False)        # Inicio del ciclo
    end_date = Column(Date, nullable=False)          # Fin del ciclo
    category_id = Column(Integer, ForeignKey("categories.id"))
    amount = Column(Float, nullable=False)
    notes = Column(String, nullable=True)
    
    __table_args__ = (
        UniqueConstraint('cycle_name', 'category_id', name='uix_cycle_category'),
    )
```

**Decisión clave**: Usar `cycle_name` con nombres de meses ("Enero", "Febrero") para:
- UX intuitiva (usuarios entienden "Presupuesto de Enero")
- Flexibilidad técnica (internamente usa start_date/end_date precisos)
- Compatibilidad con cambios de billing cycle

### 2. Backend API Structure

```python
# /api/budget-plans/*

# === CRUD básico ===
GET    /api/budget-plans                    # Listar con filtros
GET    /api/budget-plans/{id}               # Obtener uno
POST   /api/budget-plans                    # Crear
PUT    /api/budget-plans/{id}               # Actualizar
DELETE /api/budget-plans/{id}               # Eliminar

# === Vista Anual ===
GET    /api/budget-plans/annual/{year}      # Grid completo año
POST   /api/budget-plans/annual/bulk        # Guardar múltiples

# === Vista Mensual ===
GET    /api/budget-plans/cycle/{cycle_name} # Un ciclo completo
POST   /api/budget-plans/cycle              # Guardar ciclo

# === Funciones de Productividad ===
POST   /api/budget-plans/copy-cycle         # Copiar ciclo → otros ciclos
POST   /api/budget-plans/copy-category      # Copiar categoría → todos ciclos
DELETE /api/budget-plans/clear-cycle        # Limpiar ciclo completo
POST   /api/budget-plans/import-year        # Importar año anterior
```

### 3. Frontend Components

#### Budget Page
```
pages/Budget.tsx
├─ ViewSelector (Annual | Monthly)
├─ BudgetAnnualView.tsx
│  ├─ AnnualGrid (12 × categories)
│  ├─ CopyColumnButton
│  └─ CopyRowButton
└─ BudgetMonthlyView.tsx
   ├─ CycleSelector
   ├─ CategoryBudgetList
   └─ ActionButtons
```

#### Analysis Page (actualizar existente)
```
pages/Analysis.tsx (ya existe)
├─ Existing charts (mantener)
├─ Existing stats (mantener)
└─ 🆕 BudgetComparisonSection.tsx
   ├─ CategoryProgressBar
   ├─ BudgetAlerts
   └─ ComplianceKPIs
```

### 4. Design Patterns

#### Vista Anual - Grid Editable
```
+------------------+-------+-------+-------+-----+-------+
| Categoría        | Ene   | Feb   | Mar   | ... | Dic   |
+------------------+-------+-------+-------+-----+-------+
| 🍔 Alimentación  | 1500  | 1500  | 1600  | ... | 1500  |
| 🚗 Transporte    | 500   | 500   | 500   | ... | 500   |
| 🏠 Vivienda      | 2000  | 2000  | 2000  | ... | 2000  |
+------------------+-------+-------+-------+-----+-------+
| TOTAL            | 4000  | 4000  | 4100  | ... | 4000  |
+------------------+-------+-------+-------+-----+-------+

Acciones:
- [Copiar Enero →] Todos los meses | Meses seleccionados | Solo vacíos
- [Copiar Alimentación →] Todos los meses
- [Importar 2024]
```

#### Vista Mensual - Lista Simple
```
Presupuesto: [Enero 2025 ▼]  [Vista Anual]

+------------------+------------------+----------+
| Categoría        | Tipo             | Monto    |
+------------------+------------------+----------+
| 🍔 Alimentación  | Gasto            | [1500]   |
| 🚗 Transporte    | Gasto            | [500]    |
| 💰 Sueldo        | Ingreso          | [5000]   |
+------------------+------------------+----------+

Resumen:
✅ Ingresos: 5,000  ❌ Gastos: 2,000  💾 Ahorro: 3,000
```

#### Analysis - Comparación con Presupuesto
```
Analysis Page (existing + nuevo)

[Existing: Gráficos de tendencias, Top 10 categorías]

🆕 Cumplimiento Presupuestario - Enero 2025

Alimentación     █████████░░  90%  (1,350 / 1,500)  ✅
Transporte       ███████████  110% (550 / 500)     ⚠️ Excedido
Vivienda         ████████░░░  80%  (1,600 / 2,000) ✅

KPIs:
- Tasa cumplimiento: 93%
- Categorías dentro del límite: 8/10
- Ahorro vs planeado: +150 (+15%)
```

---

## Implementation Plan

### Phase 1: Backend API (30 min)
- [x] Modelo BudgetPlan ya migrado a ciclos
- [ ] Actualizar `budget_plans.py` con nuevos endpoints
- [ ] Agregar funciones de copia y bulk operations
- [ ] Testing con Postman

### Phase 2: Frontend Types & Hooks (20 min)
- [ ] Schemas TypeScript para BudgetPlan
- [ ] Hooks: `useBudgetPlans()`, `useSaveBudgetPlan()`
- [ ] API client methods

### Phase 3: Budget Page - Monthly View (45 min)
- [ ] Crear `Budget.tsx` base
- [ ] Implementar `BudgetMonthlyView.tsx`
- [ ] Selector de ciclo
- [ ] Tabla editable

### Phase 4: Budget Page - Annual View (1 hora)
- [ ] Implementar `BudgetAnnualView.tsx`
- [ ] Grid 12×N editable
- [ ] Responsive design (scroll horizontal)
- [ ] Totales por columna

### Phase 5: Productivity Features (45 min)
- [ ] Copiar columna (mes)
- [ ] Copiar fila (categoría)
- [ ] Limpiar ciclo
- [ ] Importar año anterior

### Phase 6: Analysis Integration (30 min)
- [ ] Crear `BudgetComparisonSection.tsx`
- [ ] Barras de progreso por categoría
- [ ] Alertas de exceso
- [ ] KPIs de cumplimiento

---

## UI/UX Guidelines

### Design System Compliance
- ✅ Usar colores vibrantes actuales (primary, success, danger)
- ✅ Mantener rounded-3xl, shadow-card
- ✅ Gradientes en tarjetas importantes
- ✅ Inputs con bg-white, border-2, rounded-2xl
- ✅ Botones con hover effects (scale, shadow)

### Responsive Behavior
- **Desktop**: Grid completo visible
- **Tablet**: Scroll horizontal para vista anual
- **Mobile**: Solo vista mensual (más práctica)

### Accessibility
- Labels descriptivos en inputs
- Keyboard navigation (Tab, Enter, Esc)
- ARIA labels en botones de acción
- Focus visible en celdas editables

---

## Consequences

### Positive
- ✅ Código más mantenible y testeable
- ✅ UX clara y enfocada por página
- ✅ Performance optimizado (cargas selectivas)
- ✅ Escalabilidad (agregar features sin conflictos)
- ✅ Reutilización de componentes (BudgetComparisonSection puede usarse en Dashboard)

### Negative
- ⚠️ Usuarios deben navegar entre 2 páginas (mitigado con links rápidos)
- ⚠️ Código duplicado potencial (mitigado con componentes compartidos)

### Neutral
- 🔄 Requiere documentación clara de flujos de usuario
- 🔄 Necesita testing end-to-end de ambas páginas

---

## References

- [ADR-001: API-First Architecture](./ADR-001-api-first-architecture.md)
- [Billing Cycle Migration](../../scripts/migrate_budget_plans_to_cycles.py)
- [Current Analysis Implementation](../../frontend/src/pages/Analysis.tsx)
- [Budget Plans Model](../../backend/app/models/budget_plan.py)

---

## Notes

**Fecha de ciclos vs nombres de meses**:
Decidimos usar `cycle_name` con nombres de meses ("Enero", "Febrero") porque:
1. UX más intuitiva para usuarios
2. Flexibilidad técnica (fechas calculadas dinámicamente)
3. Compatibilidad con cambios de billing cycle day
4. Escalable a otros tipos de ciclos en futuro ("Q1 2025", "Semana 1")

**Vista preferida**:
Aunque implementamos ambas vistas (Anual y Mensual), la vista Anual será la **predeterminada** porque permite:
- Planificación más rápida (copiar meses)
- Visión completa del año
- Detección de patrones (gastos estacionales)
