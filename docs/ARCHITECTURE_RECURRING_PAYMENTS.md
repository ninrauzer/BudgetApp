# Análisis: Agregar Pagos de Servicios a "Próximos Pagos"

## 📊 Situación Actual

**Tipos de pagos en "Próximos Pagos":**
```
Loan              → Pagos de préstamos
CreditCard        → Pagos de tarjetas de crédito
(falta)           → Pagos de servicios (Netflix, luz, agua, etc.)
```

**Dónde están ahora los servicios:**
- Solo se registran en Budget como presupuestos
- No hay forma de marcar que una categoría "tiene pagos en determinados días"
- No hay tracking de cuándo realmente se pagan

---

## 🎯 Propuesta: Modelo `RecurringPayment`

### ¿Por qué NO usar Categorías directamente?
❌ Las categorías se pueden subdividir (Netflix → Entertainment → Streaming)
❌ No captura el concepto de "obligación de pago" (es solo clasificación)
❌ No almacena fecha de vencimiento, monto, proveedor

### ✅ Propuesta: Nueva tabla `RecurringPayment`

```python
class RecurringPayment(Base):
    """
    Pagos recurrentes (servicios, suscripciones, etc.)
    Diferente de Loan y CreditCard porque:
    - No es deuda (Loan)
    - No es línea de crédito (CreditCard)
    - Es un pago periódico obligatorio de monto fijo/variable
    """
    __tablename__ = "recurring_payments"
    
    id = Column(Integer, primary_key=True)
    name = Column(String)           # "Netflix"
    provider = Column(String)       # "Netflix Inc."
    category_id = Column(Integer, ForeignKey("categories.id"))  # Para búsquedas
    
    # Configuración de pago
    amount = Column(Float)          # S/ 44.90
    currency = Column(String)       # "PEN", "USD"
    payment_day = Column(Integer)   # Día del mes (1-31)
    frequency = Column(String)      # "monthly", "biweekly", "annual"
    
    # Tracking
    account_id = Column(Integer, ForeignKey("accounts.id"))
    is_active = Column(Boolean, default=True)
    
    # Campos opcionales
    due_date = Column(Date)         # Próximo vencimiento exacto
    notes = Column(String)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    
    # Relaciones
    category = relationship("Category")
    account = relationship("Account")
```

---

## 📋 Comparativa de Modelos

```
┌─────────────────┬────────┬────────────┬─────────────┐
│ Característica  │ Loan   │ CreditCard │ Recurring   │
├─────────────────┼────────┼────────────┼─────────────┤
│ Monto variable  │ Fijo   │ Variable   │ Fijo*       │
│ Fecha vencim.   │ Mes    │ Mes        │ Mes         │
│ Deuda acumulada │ Sí     │ Sí         │ No          │
│ Propósito       │ Deuda  │ Línea cred │ Servicio    │
│ Intereses       │ Sí     │ Sí         │ No          │
│ Pago cíclico    │ Sí     │ Sí         │ Sí          │
└─────────────────┴────────┴────────────┴─────────────┘
* Puede ser variable (ej: luz/agua depende del consumo)
```

---

## 🔄 Cómo se vería en "Próximos Pagos"

```
Próximos Pagos (Próximos 7 días)

💳 Test Préstamo                    S/ 500.00    3 días
   Banco de Prueba

💳 Prestamo BBVA1                   S/ 412.03    3 días
   BBVA

📺 Netflix                          S/ 44.90     2 días
   Entertainment

⚡ Enel Luz                         S/ 125.50    5 días
   Utilities

💳 Test Tarjeta                     S/ 1,250.00  5 días
   BCP
   
─────────────────────────────────────────────────
Total a pagar: S/ 2,332.43
✅ Saldo suficiente: +S/ 16,432.65
```

---

## 🛠️ Plan de Implementación

### Fase 1: Backend
1. Crear modelo `RecurringPayment`
2. Crear migration/alembic
3. Crear CRUD endpoints (`/api/recurring-payments`)
4. Actualizar `/api/dashboard/upcoming-payments` para incluir RecurringPayment

### Fase 2: Frontend
1. Crear componente `RecurringPaymentForm` 
2. Agregar en sección de "Gestión de Deuda" o nueva sección
3. Mostrar en UpcomingPaymentsCard con icono diferente
4. Agregar filtro para ver solo préstamos/servicios

### Fase 3: Integración
1. Migrar datos de servicios de Budget → RecurringPayment
2. Agregar tracking de pagos realizados
3. Calcular alertas de pagos vencidos

---

## 💡 Ventajas de esta Arquitectura

✅ **Separación de responsabilidades:**
- Loan: Deuda con interés
- CreditCard: Línea de crédito con interés
- RecurringPayment: Obligación periódica sin interés

✅ **Flexible:**
- Soporta frecuencias (mensual, quincenal, anual)
- Montos variables (servicios, seguros)

✅ **Integrado:**
- Aparece en "Próximos Pagos"
- Se puede vincular a Categorías y Cuentas
- Tracking de pagos realizado

✅ **No rompe existing:**
- Budget sigue funcionando como "presupuesto planificado"
- RecurringPayment sería "pago obligatorio conocido"

---

## 🤔 Alternativa: Usar Budget + Extensión

Si quieres una solución más ligera sin crear tabla nueva:

❌ **Problema:** BudgetPlan no tiene fecha de vencimiento

✅ **Solución:** Agregar campos a BudgetPlan:
```python
payment_day = Column(Integer)          # Día del mes
payment_frequency = Column(String)     # "monthly", etc.
is_recurring_obligation = Column(Boolean)  # Diferencia presupuesto de obligación
```

**Ventajas:** Sin migrations nuevas
**Desventajas:** Mezcla conceptos (presupuesto ≠ obligación de pago)

---

## ⭐ Recomendación

**Usar RecurringPayment** porque:
1. Es más limpio arquitectónicamente
2. Evita contaminar BudgetPlan
3. Permite tracking futuro (pagos realizados)
4. Es extensible (servicios, seguros, membresías, etc.)
5. Vinculable a múltiples entidades (categoría, cuenta)

