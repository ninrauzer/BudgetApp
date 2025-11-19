# ADR-002: Sistema de Wishlist con Sprint Planning

**Estado**: Propuesto  
**Fecha**: 2025-11-18  
**Autores**: Equipo BudgetApp  
**Contexto**: Necesidad de gestionar múltiples compras planificadas con análisis de viabilidad financiera

---

## Contexto y Problema

Los usuarios necesitan una forma estructurada de:
1. Mantener una lista de deseos (wishlist) de items que quieren comprar
2. Planificar múltiples compras de manera conjunta (no solo una a la vez)
3. Analizar la viabilidad financiera de comprar varios items juntos
4. Considerar diferentes métodos de pago (efectivo, crédito, mixto)
5. Evitar endeudamiento excesivo mientras logran sus objetivos de compra

**Problema actual**: La app solo permite registrar gastos pasados, sin capacidad de planificar compras futuras de forma inteligente.

---

## Decisión

Implementar un **Sistema de Wishlist con Sprint Planning** inspirado en metodologías ágiles:

### Arquitectura Conceptual

```
┌─────────────────────────────────────────────────────────┐
│                    WISHLIST (Backlog)                   │
│  - Items priorizados (critical/high/medium/low)         │
│  - Sin fecha definida                                   │
│  - Opciones de pago configurables                       │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Selección de items
                 ↓
┌─────────────────────────────────────────────────────────┐
│              PURCHASE SPRINT (Planificación)            │
│  - Grupo de compras para un periodo específico          │
│  - Análisis de viabilidad agregado                      │
│  - Métodos de pago optimizados                          │
│  - Budget adjustments sugeridos                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Ejecución
                 ↓
┌─────────────────────────────────────────────────────────┐
│              TRANSACTIONS (Realización)                 │
│  - Compras ejecutadas                                   │
│  - Tracking de cuotas                                   │
│  - Actualización de balances                            │
└─────────────────────────────────────────────────────────┘
```

### Componentes Principales

#### 1. Wishlist (Backlog)
- Lista global de items deseados
- Priorización multinivel
- Estado: `backlog` | `in_sprint` | `purchased` | `discarded`
- Metadata: precio, URL, tienda, opciones de pago

#### 2. Purchase Sprint
- Grupo temporal de compras planificadas
- Target: ciclo específico o fecha
- Análisis de viabilidad multi-item
- Estados: `planning` | `active` | `completed` | `cancelled`

#### 3. Payment Strategy
- **Cash**: Pago inmediato con balance disponible
- **Credit**: Pago en cuotas con tarjeta de crédito
- **Mixed**: Combinación de efectivo + cuotas
- Análisis de impacto en deuda y liquidez

#### 4. Sprint Analyzer
- Verifica capacidad de efectivo total
- Verifica capacidad de crédito disponible
- Calcula ratio de compromisos mensuales
- Genera warnings y recommendations
- Optimiza distribución de métodos de pago

---

## Modelo de Datos

### Wishlist Items
```typescript
interface WishlistItem {
  id: number;
  name: string;
  price: number;
  currency: 'PEN' | 'USD';
  url?: string;
  store: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category_id?: number;
  added_date: Date;
  status: 'backlog' | 'in_sprint' | 'purchased' | 'discarded';
  
  payment_options: {
    cash_available: boolean;
    credit_available: boolean;
    installments_available: boolean;
    max_installments?: number;
  };
  
  notes?: string;
  tags?: string[];
}
```

### Purchase Sprints
```typescript
interface PurchaseSprint {
  id: number;
  name: string;
  target_cycle_offset: number;  // 0 = actual, 1 = siguiente
  target_date?: Date;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  
  items: SprintItem[];
  
  // Agregados financieros
  total_amount: number;
  total_cash_needed: number;
  total_credit_used: number;
  monthly_commitment: number;
  
  // Análisis de viabilidad
  feasibility: {
    is_viable: boolean;
    debt_impact: 'safe' | 'warning' | 'critical';
    balance_after: number;
    credit_utilization_after: number;
    commitment_ratio: number;
    warnings: Warning[];
    recommendations: Recommendation[];
  };
  
  created_at: Date;
  updated_at: Date;
}
```

### Sprint Items
```typescript
interface SprintItem {
  id: number;
  sprint_id: number;
  wishlist_item_id: number;
  
  payment_strategy: {
    method: 'cash' | 'credit' | 'mixed';
    cash_amount?: number;
    credit_amount?: number;
    installments?: number;
    monthly_payment?: number;
  };
  
  order: number;  // Orden de compra
  purchase_date?: Date;
  transaction_id?: number;
  status: 'pending' | 'purchased' | 'cancelled';
}
```

### Credit Cards
```typescript
interface CreditCard {
  id: number;
  name: string;
  bank: string;
  credit_limit: number;
  current_balance: number;
  available_credit: number;
  payment_day: number;
  billing_cycle_start: number;
  interest_rate?: number;
  annual_fee: number;
  active: boolean;
}
```

### Schema SQL
```sql
-- Wishlist Items
CREATE TABLE wishlist_items (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    currency TEXT DEFAULT 'PEN',
    url TEXT,
    store TEXT,
    priority TEXT CHECK(priority IN ('critical', 'high', 'medium', 'low')),
    category_id INTEGER,
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK(status IN ('backlog', 'in_sprint', 'purchased', 'discarded')),
    payment_options JSON,
    notes TEXT,
    tags JSON,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Purchase Sprints
CREATE TABLE purchase_sprints (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    target_cycle_offset INTEGER DEFAULT 0,
    target_date TIMESTAMP,
    status TEXT CHECK(status IN ('planning', 'active', 'completed', 'cancelled')),
    total_amount REAL,
    total_cash_needed REAL,
    total_credit_used REAL,
    monthly_commitment REAL,
    feasibility_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sprint Items (Many-to-Many)
CREATE TABLE sprint_items (
    id INTEGER PRIMARY KEY,
    sprint_id INTEGER NOT NULL,
    wishlist_item_id INTEGER NOT NULL,
    payment_method TEXT CHECK(payment_method IN ('cash', 'credit', 'mixed')),
    payment_details JSON,
    order_in_sprint INTEGER,
    purchase_date TIMESTAMP,
    transaction_id INTEGER,
    status TEXT CHECK(status IN ('pending', 'purchased', 'cancelled')),
    FOREIGN KEY (sprint_id) REFERENCES purchase_sprints(id),
    FOREIGN KEY (wishlist_item_id) REFERENCES wishlist_items(id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Credit Cards
CREATE TABLE credit_cards (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    bank TEXT,
    credit_limit REAL NOT NULL,
    current_balance REAL DEFAULT 0,
    available_credit REAL,
    payment_day INTEGER,
    billing_cycle_start INTEGER,
    interest_rate REAL,
    annual_fee REAL DEFAULT 0,
    active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Credit Card Installments
CREATE TABLE credit_card_installments (
    id INTEGER PRIMARY KEY,
    credit_card_id INTEGER NOT NULL,
    purchase_plan_id INTEGER,
    sprint_item_id INTEGER,
    description TEXT,
    total_amount REAL NOT NULL,
    installments INTEGER NOT NULL,
    monthly_payment REAL NOT NULL,
    remaining_installments INTEGER,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    FOREIGN KEY (credit_card_id) REFERENCES credit_cards(id),
    FOREIGN KEY (sprint_item_id) REFERENCES sprint_items(id)
);

-- Budget Adjustments para Sprint
CREATE TABLE sprint_budget_adjustments (
    id INTEGER PRIMARY KEY,
    sprint_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    original_budget REAL NOT NULL,
    adjusted_budget REAL NOT NULL,
    reduction_amount REAL NOT NULL,
    applied BOOLEAN DEFAULT 0,
    FOREIGN KEY (sprint_id) REFERENCES purchase_sprints(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

---

## Lógica de Negocio

### Reglas de Viabilidad

```python
# Capacidad de efectivo
SAFE_CASH_USAGE = 0.70  # Usar máximo 70% del balance disponible

# Capacidad de crédito
SAFE_CREDIT_UTILIZATION = 0.30  # 30% del límite total
MAX_CREDIT_UTILIZATION = 0.50   # 50% máximo absoluto

# Compromisos mensuales
MAX_COMMITMENT_RATIO = 0.35  # 35% del ingreso en cuotas
CRITICAL_COMMITMENT_RATIO = 0.45  # 45% es crítico

# Deuda total
MAX_DEBT_TO_INCOME = 0.40  # 40% del ingreso en deuda total

# Balance mínimo de emergencia
MIN_BALANCE_AFTER = 0.10  # 10% del ingreso mensual
```

### Algoritmo de Análisis de Sprint

```python
def analyze_purchase_sprint(sprint_data, financial_state):
    """
    Analiza la viabilidad de ejecutar un sprint de compras
    
    Args:
        sprint_data: Información del sprint (items, métodos de pago)
        financial_state: Estado financiero actual (balance, crédito, deuda)
    
    Returns:
        SprintAnalysis: Resultado del análisis con viabilidad y recomendaciones
    """
    
    # 1. Calcular totales
    total_amount = sum(item.price for item in sprint_data.items)
    total_cash = sum(get_cash_amount(item) for item in sprint_data.items)
    total_credit = sum(get_credit_amount(item) for item in sprint_data.items)
    total_monthly = sum(get_monthly_payment(item) for item in sprint_data.items)
    
    # 2. Verificar capacidad de efectivo
    available_cash = financial_state.balance
    safe_cash_limit = available_cash * SAFE_CASH_USAGE
    
    if total_cash > safe_cash_limit:
        add_warning(
            level='critical',
            message=f'Necesitas S/{total_cash:.2f} pero el uso seguro es S/{safe_cash_limit:.2f}',
            suggestion='Reduce compras en efectivo o usa más crédito'
        )
        is_viable = False
    
    # 3. Verificar capacidad de crédito
    available_credit = financial_state.total_credit_available
    safe_credit_limit = financial_state.total_credit_limit * SAFE_CREDIT_UTILIZATION
    
    if total_credit > available_credit:
        add_warning(
            level='critical',
            message=f'Crédito requerido S/{total_credit:.2f} excede disponible S/{available_credit:.2f}',
            suggestion='Reduce compras a crédito o divide el sprint'
        )
        is_viable = False
    
    credit_utilization = (financial_state.current_credit_used + total_credit) / financial_state.total_credit_limit
    
    if credit_utilization > MAX_CREDIT_UTILIZATION:
        add_warning(
            level='warning',
            message=f'Uso de crédito será {credit_utilization*100:.1f}% (límite 50%)',
            suggestion='Aumenta aportes en efectivo'
        )
    
    # 4. Verificar compromisos mensuales
    current_commitments = financial_state.monthly_commitments
    new_total_commitments = current_commitments + total_monthly
    commitment_ratio = new_total_commitments / financial_state.income
    
    if commitment_ratio > CRITICAL_COMMITMENT_RATIO:
        add_warning(
            level='critical',
            message=f'Cuotas mensuales: S/{new_total_commitments:.2f} ({commitment_ratio*100:.1f}% ingreso)',
            suggestion='Aumenta el número de cuotas o pospón items'
        )
        is_viable = False
    elif commitment_ratio > MAX_COMMITMENT_RATIO:
        add_warning(
            level='warning',
            message=f'Compromisos altos: {commitment_ratio*100:.1f}% del ingreso',
            suggestion='Considera extender plazos'
        )
    
    # 5. Verificar balance después de compras
    balance_after = available_cash - total_cash
    min_balance = financial_state.income * MIN_BALANCE_AFTER
    
    if balance_after < min_balance:
        add_warning(
            level='warning',
            message=f'Balance restante S/{balance_after:.2f} es bajo',
            suggestion='Mantén un colchón de emergencia'
        )
    
    # 6. Generar recomendaciones
    recommendations = generate_recommendations(
        warnings=warnings,
        sprint_data=sprint_data,
        financial_state=financial_state
    )
    
    return SprintAnalysis(
        is_viable=is_viable,
        total_amount=total_amount,
        total_cash=total_cash,
        total_credit=total_credit,
        monthly_commitment=total_monthly,
        balance_after=balance_after,
        credit_utilization=credit_utilization,
        commitment_ratio=commitment_ratio,
        debt_impact=classify_debt_impact(commitment_ratio),
        warnings=warnings,
        recommendations=recommendations
    )
```

### Optimizador de Métodos de Pago

```python
def optimize_payment_methods(items, financial_state, strategy='balance'):
    """
    Optimiza la distribución de métodos de pago
    
    Strategies:
    - 'balance': Equilibra efectivo y crédito 50/50
    - 'minimize_debt': Maximiza uso de efectivo
    - 'preserve_liquidity': Maximiza uso de crédito
    """
    
    if strategy == 'balance':
        return optimize_for_balance(items, financial_state)
    elif strategy == 'minimize_debt':
        return optimize_for_cash(items, financial_state)
    elif strategy == 'preserve_liquidity':
        return optimize_for_credit(items, financial_state)

def optimize_for_balance(items, state):
    """
    Distribuir 50/50 entre efectivo y crédito
    """
    total = sum(item.price for item in items)
    target_cash = min(total * 0.5, state.balance * 0.7)
    target_credit = total - target_cash
    
    # Ordenar items por precio (menor a mayor)
    sorted_items = sorted(items, key=lambda x: x.price)
    
    plans = []
    remaining_cash = target_cash
    
    for item in sorted_items:
        if remaining_cash >= item.price:
            # Pagar completamente en efectivo
            plans.append({
                'item': item,
                'method': 'cash',
                'cash': item.price,
                'credit': 0,
                'installments': 0
            })
            remaining_cash -= item.price
        else:
            # Pagar mixto o solo crédito
            cash_portion = min(remaining_cash, item.price * 0.3)
            credit_portion = item.price - cash_portion
            
            # Calcular cuotas óptimas
            optimal_installments = calculate_optimal_installments(
                credit_portion, 
                state
            )
            
            plans.append({
                'item': item,
                'method': 'mixed' if cash_portion > 0 else 'credit',
                'cash': cash_portion,
                'credit': credit_portion,
                'installments': optimal_installments,
                'monthly_payment': credit_portion / optimal_installments
            })
            remaining_cash = 0
    
    return plans
```

---

## API Endpoints

### Wishlist Management

```
GET    /api/wishlist                    # Listar todos los items
POST   /api/wishlist                    # Agregar item
GET    /api/wishlist/{id}               # Ver detalle de item
PUT    /api/wishlist/{id}               # Actualizar item
DELETE /api/wishlist/{id}               # Eliminar item
PATCH  /api/wishlist/{id}/priority      # Cambiar prioridad
```

### Sprint Planning

```
GET    /api/sprints                     # Listar sprints
POST   /api/sprints                     # Crear sprint
GET    /api/sprints/{id}                # Ver sprint
PUT    /api/sprints/{id}                # Actualizar sprint
DELETE /api/sprints/{id}                # Cancelar sprint

POST   /api/sprints/analyze             # Analizar viabilidad de sprint
POST   /api/sprints/{id}/optimize       # Optimizar métodos de pago
POST   /api/sprints/{id}/activate       # Activar sprint
POST   /api/sprints/{id}/complete       # Completar sprint

POST   /api/sprints/{id}/items          # Agregar item al sprint
DELETE /api/sprints/{id}/items/{item_id} # Remover item del sprint
PATCH  /api/sprints/{id}/items/{item_id} # Actualizar método de pago
```

### Sprint Items

```
GET    /api/sprint-items/{id}           # Ver detalle de item en sprint
PATCH  /api/sprint-items/{id}/purchase  # Marcar como comprado
POST   /api/sprint-items/{id}/transaction # Crear transacción para item
```

### Credit Cards

```
GET    /api/credit-cards                # Listar tarjetas
POST   /api/credit-cards                # Agregar tarjeta
GET    /api/credit-cards/{id}           # Ver detalle
PUT    /api/credit-cards/{id}           # Actualizar
DELETE /api/credit-cards/{id}           # Eliminar

GET    /api/credit-cards/{id}/installments # Ver cuotas pendientes
GET    /api/credit-cards/summary        # Resumen de todas las tarjetas
```

---

## Flujos de Usuario

### Flujo 1: Agregar Item al Backlog

```
Usuario → Click [+ Agregar Item]
       → Formulario:
          - Nombre producto
          - Precio
          - URL (opcional)
          - Tienda
          - Prioridad
          - Opciones de pago (cash/credit/installments)
       → [Guardar]
       → Item agregado al backlog
```

### Flujo 2: Planificar Sprint

```
Usuario → Click [🎯 Planificar Sprint]
       → Paso 1: Configuración
          - Nombre sprint
          - Periodo target (ciclo actual/siguiente/fecha)
       → Paso 2: Seleccionar Items (Drag & Drop)
          - Arrastrar items desde backlog → sprint
       → Paso 3: Configurar Métodos de Pago
          - Seleccionar método por item (cash/credit/mixed)
          - Configurar cuotas si aplica
          - Opción de auto-optimizar
       → Paso 4: Análisis
          - Sistema analiza viabilidad
          - Muestra totales, warnings, recommendations
       → Decisión:
          A) [✅ Ejecutar] → Sprint activo
          B) [💾 Guardar] → Borrador
          C) [← Ajustar] → Volver a configurar
```

### Flujo 3: Ejecutar Compras del Sprint

```
Usuario compra item físicamente
       → En app: Sprint → Item → [✅ Marcar como Comprado]
       → Modal confirmación:
          - Fecha de compra
          - ¿Crear transacciones automáticas?
       → [Confirmar]
       → Sistema:
          - Crea transaction(s) según método de pago
          - Registra cuotas si es crédito/mixto
          - Actualiza progreso del sprint
          - Actualiza balances
       → Notificación: "Item comprado, X/Y items restantes"
```

### Flujo 4: Tracking de Cuotas

```
Usuario → Dashboard → "💳 Compromisos de Crédito"
       → Ver lista de cuotas pendientes
       → Por cada item:
          - Progreso visual (X/Y cuotas)
          - Próxima cuota (fecha, monto)
          - Total restante
       → [Pagar] → Crear transacción de pago
       → Actualiza remaining_installments
```

---

## UI/UX Guidelines

### Página Wishlist
- **Layout**: Lista con cards
- **Agrupación**: Por prioridad (Critical/High/Medium/Low)
- **Acciones**: Ver, Editar, Eliminar, Mover a Sprint
- **Filtros**: Por prioridad, tienda, rango de precio
- **Ordenamiento**: Por precio, fecha agregada, prioridad

### Planificador de Sprint
- **Wizard de 4 pasos**: Config → Items → Pagos → Análisis
- **Drag & Drop**: Para agregar items al sprint
- **Auto-optimización**: Botones para estrategias (Balance/Cash/Credit)
- **Análisis visual**: Semáforo (✅ Safe / ⚠️ Warning / ❌ Critical)
- **Recomendaciones**: Lista clara de sugerencias

### Dashboard Sprint
- **Estado del sprint**: Progreso visual (X/Y items)
- **Próxima compra**: Destacar siguiente item pendiente
- **Compromisos**: Widget con cuotas pendientes
- **Alertas**: Notificaciones de pagos próximos

### Responsive Design
- **Mobile**: Priorizar acciones rápidas (marcar comprado, ver cuotas)
- **Desktop**: Vista completa del análisis y planificación
- **Tablet**: Balance entre ambas

---

## Plan de Implementación

### Fase 1: Fundamentos (3-4 semanas)

#### Semana 1: Base de Datos y Backend Core
**Objetivo**: Establecer modelos y API básica

**Tareas**:
- [ ] Crear migraciones SQL (wishlist_items, purchase_sprints, sprint_items)
- [ ] Implementar modelos SQLAlchemy
  - `WishlistItem`
  - `PurchaseSprint`
  - `SprintItem`
- [ ] Crear schemas Pydantic para validación
- [ ] Endpoints básicos de wishlist:
  - `GET /api/wishlist` (listar)
  - `POST /api/wishlist` (crear)
  - `GET /api/wishlist/{id}` (detalle)
  - `PUT /api/wishlist/{id}` (actualizar)
  - `DELETE /api/wishlist/{id}` (eliminar)

**Entregables**:
- ✅ Base de datos con 3 tablas principales
- ✅ CRUD completo de wishlist items
- ✅ Tests unitarios de endpoints

#### Semana 2: Frontend Wishlist (Backlog)
**Objetivo**: UI para gestionar lista de deseos

**Tareas**:
- [ ] Crear página `/wishlist`
- [ ] Componente `WishlistCard` para mostrar items
- [ ] Formulario de agregar/editar item
  - Campos: nombre, precio, URL, tienda, prioridad
  - Opciones de pago (checkboxes)
- [ ] Hooks de React Query:
  - `useWishlist()` (listar)
  - `useAddWishlistItem()`
  - `useUpdateWishlistItem()`
  - `useDeleteWishlistItem()`
- [ ] Filtros por prioridad
- [ ] Ordenamiento (precio, fecha, prioridad)

**Entregables**:
- ✅ Backlog funcional con CRUD visual
- ✅ Priorización de items (drag handles)
- ✅ Badges de prioridad con colores

#### Semana 3: Sprint Planning - Backend
**Objetivo**: Lógica de análisis de sprints

**Tareas**:
- [ ] Implementar `SprintAnalyzer` service
  - Calcular totales (cash, credit, monthly)
  - Verificar capacidad de efectivo
  - Verificar capacidad de crédito (mock inicial)
  - Calcular commitment ratio
- [ ] Endpoint `POST /api/sprints/analyze`
  - Input: lista de items + métodos de pago
  - Output: análisis de viabilidad
- [ ] Implementar reglas de negocio:
  - `SAFE_CASH_USAGE = 0.70`
  - `MAX_COMMITMENT_RATIO = 0.35`
- [ ] Tests de análisis con diferentes escenarios

**Entregables**:
- ✅ Análisis de viabilidad funcional
- ✅ Warnings y recommendations generados
- ✅ Tests de edge cases

#### Semana 4: Sprint Planning - Frontend
**Objetivo**: UI para crear y analizar sprints

**Tareas**:
- [ ] Wizard de 4 pasos:
  - Paso 1: Nombre y periodo del sprint
  - Paso 2: Seleccionar items (drag & drop con @dnd-kit)
  - Paso 3: Configurar métodos de pago por item
  - Paso 4: Ver análisis de viabilidad
- [ ] Componente `SprintAnalysisCard`:
  - Totales (efectivo, crédito, cuotas)
  - Semáforo de viabilidad
  - Lista de warnings
  - Lista de recommendations
- [ ] Hook `useSprintAnalysis(items)`
- [ ] Botón "💾 Guardar Sprint" (guarda en planning)

**Entregables**:
- ✅ Planificador de sprint funcional
- ✅ Análisis visual con colores semánticos
- ✅ Guardado de sprints en estado planning

---

### Fase 2: Tarjetas de Crédito (2 semanas)

#### Semana 5: Backend Credit Cards
**Objetivo**: Gestión de tarjetas y capacidad de crédito

**Tareas**:
- [ ] Migración tabla `credit_cards`
- [ ] Modelo `CreditCard` con campos:
  - name, bank, credit_limit
  - current_balance, available_credit
  - payment_day, billing_cycle_start
- [ ] CRUD endpoints:
  - `GET /api/credit-cards`
  - `POST /api/credit-cards`
  - `PUT /api/credit-cards/{id}`
  - `DELETE /api/credit-cards/{id}`
- [ ] Service `CreditCapacityAnalyzer`:
  - Calcular crédito disponible total
  - Calcular utilización de crédito
  - Verificar capacidad segura (30% del límite)
- [ ] Integrar en `SprintAnalyzer`

**Entregables**:
- ✅ Gestión de tarjetas de crédito
- ✅ Análisis de capacidad real (no mock)
- ✅ Warnings cuando uso de crédito > 50%

#### Semana 6: Frontend Credit Cards
**Objetivo**: UI para gestionar tarjetas

**Tareas**:
- [ ] Página `/settings/credit-cards`
- [ ] Lista de tarjetas con datos:
  - Nombre, banco, límite
  - Balance actual, disponible
  - Barra de utilización visual
- [ ] Formulario agregar/editar tarjeta
- [ ] Widget en Dashboard:
  - "💳 Tarjetas de Crédito"
  - Total disponible
  - Utilización agregada
- [ ] Actualizar `SprintAnalysisCard` con datos reales

**Entregables**:
- ✅ Gestión visual de tarjetas
- ✅ Análisis de sprint usa capacidad real
- ✅ Widget en dashboard

---

### Fase 3: Métodos de Pago Avanzados (2 semanas)

#### Semana 7: Pago Mixto - Backend
**Objetivo**: Implementar análisis de pago mixto (efectivo + crédito)

**Tareas**:
- [ ] Service `PaymentStrategyAnalyzer`:
  - `analyze_cash_payment()` (pago completo efectivo)
  - `analyze_credit_payment()` (pago en cuotas)
  - `analyze_mixed_payment()` (efectivo + cuotas)
- [ ] Lógica de split para pago mixto:
  - Calcular porción efectivo óptima (30-50% del item)
  - Calcular porción crédito y cuotas
- [ ] Actualizar `SprintAnalyzer` para soportar mixto
- [ ] Endpoint `POST /api/sprints/{id}/optimize`:
  - Estrategias: balance / minimize_debt / preserve_liquidity
  - Output: métodos de pago optimizados por item

**Entregables**:
- ✅ Análisis de 3 métodos de pago
- ✅ Optimización automática de sprint
- ✅ Tests de distribución mixta

#### Semana 8: Métodos de Pago - Frontend
**Objetivo**: UI para seleccionar y optimizar métodos

**Tareas**:
- [ ] En Wizard Paso 3:
  - Radio buttons por item: 💰 Efectivo / 💳 Crédito / 🔀 Mixto
  - Si Crédito: select de cuotas (3, 6, 9, 12)
  - Si Mixto: sliders para % efectivo/crédito
- [ ] Botones de optimización automática:
  - [⚖️ Equilibrado]
  - [💰 Máximo Efectivo]
  - [💳 Máximo Crédito]
- [ ] Preview en tiempo real:
  - Total efectivo necesario
  - Total crédito usado
  - Cuotas mensuales totales
- [ ] Componente `PaymentMethodBadge` con iconos

**Entregables**:
- ✅ Configuración manual de métodos
- ✅ Auto-optimización con 3 estrategias
- ✅ Preview en tiempo real

---

### Fase 4: Ejecución y Tracking (2 semanas)

#### Semana 9: Activación de Sprint - Backend
**Objetivo**: Activar sprint y ejecutar compras

**Tareas**:
- [ ] Endpoint `POST /api/sprints/{id}/activate`:
  - Cambia estado a `active`
  - Actualiza status de items a `in_sprint`
- [ ] Endpoint `PATCH /api/sprint-items/{id}/purchase`:
  - Marca item como `purchased`
  - Crea transaction(s) según método de pago:
    - Cash: 1 transacción de expense
    - Credit: 1 transacción + registro de cuotas
    - Mixed: 2 transacciones (cash + credit)
- [ ] Tabla `credit_card_installments`:
  - Registrar cuotas pendientes
  - total_amount, installments, monthly_payment
  - remaining_installments (decrece con pagos)
- [ ] Service `InstallmentTracker`:
  - `get_pending_installments()` por usuario
  - `register_payment()` para marcar cuota pagada

**Entregables**:
- ✅ Sprint activo con items pendientes
- ✅ Marcar compras individuales
- ✅ Tracking de cuotas

#### Semana 10: Ejecución - Frontend
**Objetivo**: UI para ejecutar y trackear sprint

**Tareas**:
- [ ] Vista de Sprint Activo:
  - Header con progreso (X/Y items comprados)
  - Lista de items con estados:
    - ✅ Comprado (fecha, método)
    - ⏳ Pendiente (botón marcar comprado)
    - ❌ Cancelado
- [ ] Modal "Marcar como Comprado":
  - Fecha de compra
  - ¿Crear transacciones? (checkbox por defecto)
  - Confirmación
- [ ] Dashboard Widget "💳 Compromisos de Crédito":
  - Lista de cuotas pendientes
  - Por cada item: progreso, próxima cuota, restante
  - Botón [Pagar] → crea transacción
- [ ] Notificaciones de sprint:
  - "Item pendiente de compra"
  - "Cuota próxima a vencer"
  - "Sprint completado"

**Entregables**:
- ✅ Ejecución visual de sprint
- ✅ Tracking de cuotas con progreso
- ✅ Notificaciones contextuales

---

### Fase 5: Optimización y UX (1-2 semanas)

#### Semana 11: Mejoras de UX
**Objetivo**: Pulir experiencia de usuario

**Tareas**:
- [ ] Animaciones de transición:
  - Item agregado al sprint (slide in)
  - Sprint completado (confetti)
  - Cuota pagada (check animation)
- [ ] Mejoras visuales:
  - Badges con colores semánticos
  - Progress bars con gradientes
  - Glass morphism en cards de sprint
- [ ] Estados vacíos:
  - Empty state en backlog
  - Empty state en sprints
  - Sugerencias de primeros pasos
- [ ] Responsive mobile:
  - Wizard adaptado a mobile (stepper vertical)
  - Cards más compactas
  - Touch gestures para drag & drop

**Entregables**:
- ✅ Animaciones fluidas
- ✅ Estados vacíos informativos
- ✅ Mobile-friendly

#### Semana 12: Testing y Documentación
**Objetivo**: Garantizar calidad y documentar

**Tareas**:
- [ ] Tests E2E con Playwright:
  - Flujo completo: agregar item → crear sprint → analizar → ejecutar
  - Marcar compra y verificar transacciones
  - Pagar cuota y verificar actualización
- [ ] Tests de integración:
  - Análisis de sprint con múltiples items
  - Optimización automática
  - Capacidad de crédito real
- [ ] Documentación:
  - README.md con screenshots
  - Guía de usuario (Notion/Wiki)
  - ADR actualizado con learnings
- [ ] Performance:
  - Lazy loading de items en backlog
  - Optimistic updates en cuotas

**Entregables**:
- ✅ Cobertura de tests > 80%
- ✅ Documentación completa
- ✅ Performance optimizado

---

### Fase 6: Features Avanzados (Opcional, 2+ semanas)

#### Features Nice-to-Have

**1. Price Tracking**
- Integración con APIs de tiendas (Amazon, Mercado Libre)
- Scraping de precios históricos
- Notificación cuando precio baja
- Gráfico de evolución de precio

**2. Shared Wishlist**
- Compartir sprint con familia/amigos
- Modo "Regalo" (contribuciones)
- Tracking de aportaciones colectivas

**3. Budget Impact Simulation**
- Simular ajustes de presupuesto para el sprint
- Sugerir categorías a reducir
- Preview de presupuesto del siguiente ciclo

**4. Gamificación**
- Badges por completar sprints
- Racha de meses sin compras impulsivas
- Nivel de "disciplina financiera"
- Comparar con promedio de usuarios

**5. Análisis Predictivo (ML)**
- Predecir probabilidad de completar sprint
- Sugerir mejor momento para comprar
- Detectar patrones de gasto para optimizar

**6. Integración con Banca**
- Importar automáticamente cuotas de tarjetas
- Sincronizar balances en tiempo real
- Auto-pago de cuotas desde app

---

## Consecuencias

### Positivas
✅ **Planificación inteligente**: Usuarios pueden planificar compras sin arriesgar finanzas  
✅ **Flexibilidad de pago**: Opciones de efectivo, crédito y mixto  
✅ **Prevención de deuda**: Análisis proactivo antes de comprar  
✅ **Tracking completo**: Seguimiento de cuotas y compromisos  
✅ **Múltiples compras**: Sprint permite planear varias compras juntas  
✅ **Optimización automática**: Sistema sugiere mejores métodos de pago  

### Negativas
⚠️ **Complejidad**: Sistema más complejo que simple wishlist  
⚠️ **Curva de aprendizaje**: Usuarios deben entender conceptos de sprint  
⚠️ **Mantenimiento**: Más tablas y lógica de negocio  
⚠️ **Dependencia de datos**: Requiere que usuario configure tarjetas correctamente  

### Riesgos
🔴 **Análisis erróneo**: Si lógica falla, podría sugerir compras no viables  
🔴 **Over-engineering**: Puede ser demasiado complejo para casos simples  
🔴 **Adoption**: Usuarios podrían no usar feature si no es intuitivo  

### Mitigación de Riesgos
- Tests exhaustivos de análisis con casos límite
- Wizard guiado para reducir fricción
- Tooltips y ayudas contextuales
- Opción de "modo simple" sin sprints

---

## Alternativas Consideradas

### Alternativa 1: Simple Wishlist (Sin Sprints)
**Descripción**: Solo lista de deseos con análisis individual por item

**Pros**:
- Más simple de implementar
- Menor curva de aprendizaje
- Menos tablas en DB

**Cons**:
- No permite planear múltiples compras
- Análisis menos realista (no considera contexto agregado)
- No optimiza métodos de pago entre items

**Decisión**: ❌ Rechazado - No resuelve el problema de compras múltiples

### Alternativa 2: Auto-Purchase (IA Automática)
**Descripción**: Sistema decide automáticamente cuándo y cómo comprar

**Pros**:
- Cero fricción para usuario
- Optimización perfecta

**Cons**:
- Usuario pierde control
- Riesgo de compras no deseadas
- Complejidad técnica muy alta

**Decisión**: ❌ Rechazado - Demasiado riesgoso, usuarios quieren control

### Alternativa 3: Savings Goals (Sin Crédito)
**Descripción**: Solo ahorro, sin análisis de crédito

**Pros**:
- Más simple
- Promueve disciplina financiera

**Cons**:
- No es realista (usuarios usan tarjetas)
- No ayuda con compras urgentes
- Limita opciones

**Decisión**: ❌ Rechazado - Debe soportar crédito para ser útil

---

## Referencias

- [RFC-002: Data Model](./RFC-002-data-model.md)
- [ADR-001: API First Architecture](./ADR-001-api-first-architecture.md)
- Documentación de @dnd-kit: https://dndkit.com
- React Query patterns: https://tkdodo.eu/blog/practical-react-query

---

## Historial de Cambios

| Fecha      | Versión | Cambios                                      |
|------------|---------|----------------------------------------------|
| 2025-11-18 | 1.0     | Propuesta inicial - Sistema Wishlist Sprint |

---

## Aprobaciones

- [ ] Product Owner: _______________
- [ ] Tech Lead: _______________
- [ ] UX Designer: _______________

---

**Próximos Pasos**:
1. Revisar y aprobar ADR
2. Crear issues en GitHub para Fase 1
3. Estimar effort por tarea
4. Iniciar Semana 1: Migraciones SQL
