# RFC-003 — Diseño de API REST para la Aplicación de Gestión Presupuestal

**Estado:** Approved  
**Autor:** Ninrauzer  
**Fecha:** 2025-11-12  
**Versión:** 1.0  
**Supersedes:** -  
**Replaced by:** -

## 1. Contexto

La aplicación de gestión presupuestal sigue una **arquitectura API-First** (ADR-001) con backend en **FastAPI** (RFC-001) y un modelo de datos definido (RFC-002).

Este RFC especifica el diseño completo de la API REST para el MVP, incluyendo:
- Endpoints de cada módulo
- Schemas de request/response (Pydantic)
- Códigos de respuesta HTTP
- Validaciones y reglas de negocio

> 💡 **Nota:**  
> Esta API está diseñada para ser consumida inicialmente por HTMX y posteriormente por React, sin cambios en el backend.

---

## 2. Principios de Diseño

### 2.1 Convenciones REST
- **Recursos en plural:** `/api/categories`, `/api/transactions`
- **Verbos HTTP estándar:** GET (leer), POST (crear), PUT (actualizar completo), PATCH (actualizar parcial), DELETE (eliminar)
- **Códigos de estado consistentes:**
  - `200 OK` - Operación exitosa
  - `201 Created` - Recurso creado
  - `204 No Content` - Eliminación exitosa
  - `400 Bad Request` - Error de validación
  - `404 Not Found` - Recurso no encontrado
  - `500 Internal Server Error` - Error del servidor

### 2.2 Estructura de Respuesta
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa",
  "errors": []
}
```

Para errores:
```json
{
  "success": false,
  "data": null,
  "message": "Error en la operación",
  "errors": ["Detalle del error"]
}
```

### 2.3 Paginación
Para listados largos (opcional en MVP, para futuro):
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 150,
    "total_pages": 3
  }
}
```

---

## 3. Módulos y Endpoints

### 3.1 Health Check
```
GET /health
```
**Descripción:** Verifica que la API esté funcionando.

**Response 200:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "database": "connected"
}
```

---

## 4. Módulo: Categories (Categorías)

### 4.1 Listar todas las categorías
```
GET /api/categories
```

**Query Params (opcionales):**
- `type` - Filtrar por tipo: `income`, `expense`, `saving`
- `parent_id` - Filtrar por categoría padre (NULL para raíces)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Ingresos",
      "type": "income",
      "parent_id": null,
      "icon": null,
      "color": null,
      "created_at": "2025-11-12T10:00:00"
    },
    {
      "id": 2,
      "name": "Salario",
      "type": "income",
      "parent_id": 1,
      "icon": "💰",
      "color": "#4CAF50",
      "created_at": "2025-11-12T10:00:01"
    }
  ]
}
```

### 4.2 Obtener una categoría
```
GET /api/categories/{id}
```

**Response 200:** (objeto category)  
**Response 404:** Category not found

### 4.3 Crear categoría
```
POST /api/categories
```

**Request Body:**
```json
{
  "name": "Transporte Público",
  "type": "expense",
  "parent_id": 8,
  "icon": "🚌",
  "color": "#2196F3"
}
```

**Response 201:** (objeto category creado)

### 4.4 Actualizar categoría
```
PUT /api/categories/{id}
```

**Request Body:** (mismo que POST)  
**Response 200:** (objeto category actualizado)

### 4.5 Eliminar categoría
```
DELETE /api/categories/{id}
```

**Response 204:** No Content  
**Response 400:** Cannot delete category with existing transactions

---

## 5. Módulo: Accounts (Cuentas)

### 5.1 Listar cuentas
```
GET /api/accounts
```

**Query Params (opcionales):**
- `is_active` - Filtrar por estado: `true`, `false`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Efectivo",
      "type": "cash",
      "balance": 1500.50,
      "currency": "PEN",
      "is_active": true,
      "created_at": "2025-11-12T10:00:00"
    }
  ]
}
```

### 5.2 Obtener una cuenta
```
GET /api/accounts/{id}
```

### 5.3 Crear cuenta
```
POST /api/accounts
```

**Request Body:**
```json
{
  "name": "Banco Interbank",
  "type": "bank",
  "balance": 5000.00,
  "currency": "PEN",
  "is_active": true
}
```

**Response 201:** (objeto account creado)

### 5.4 Actualizar cuenta
```
PUT /api/accounts/{id}
```

### 5.5 Eliminar cuenta
```
DELETE /api/accounts/{id}
```

---

## 6. Módulo: Budget Plan (Planificación de Presupuesto)

### 6.1 Obtener presupuesto de un mes
```
GET /api/budget-plan/{year}/{month}
```

**Ejemplo:** `GET /api/budget-plan/2025/11`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "year": 2025,
    "month": 11,
    "items": [
      {
        "id": 1,
        "category_id": 2,
        "category_name": "Salario",
        "category_type": "income",
        "amount": 5000.00,
        "notes": null,
        "created_at": "2025-11-01T08:00:00",
        "updated_at": "2025-11-01T08:00:00"
      },
      {
        "id": 2,
        "category_id": 7,
        "category_name": "Vivienda",
        "category_type": "expense",
        "amount": 1200.00,
        "notes": "Alquiler + servicios",
        "created_at": "2025-11-01T08:01:00",
        "updated_at": "2025-11-01T08:01:00"
      }
    ],
    "summary": {
      "total_income": 5000.00,
      "total_expense": 3500.00,
      "total_saving": 500.00,
      "balance": 1000.00
    }
  }
}
```

### 6.2 Crear/Actualizar presupuesto de un mes
```
POST /api/budget-plan/{year}/{month}
```

**Request Body:**
```json
{
  "items": [
    {
      "category_id": 2,
      "amount": 5000.00,
      "notes": null
    },
    {
      "category_id": 7,
      "amount": 1200.00,
      "notes": "Alquiler + servicios"
    }
  ]
}
```

**Comportamiento:**
- Si existe presupuesto para esa categoría/mes, lo actualiza
- Si no existe, lo crea
- Permite crear/actualizar múltiples categorías en una sola llamada

**Response 200:** (presupuesto completo actualizado)

### 6.3 Eliminar presupuesto de una categoría
```
DELETE /api/budget-plan/{id}
```

### 6.4 Obtener presupuesto anual
```
GET /api/budget-plan/{year}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "year": 2025,
    "months": [
      {
        "month": 1,
        "total_income": 5000.00,
        "total_expense": 3500.00,
        "balance": 1500.00
      },
      ...
    ],
    "summary": {
      "total_income": 60000.00,
      "total_expense": 42000.00,
      "total_saving": 6000.00,
      "balance": 12000.00
    }
  }
}
```

---

## 7. Módulo: Transactions (Transacciones)

### 7.1 Listar transacciones
```
GET /api/transactions
```

**Query Params (opcionales):**
- `start_date` - Fecha inicio (ISO 8601)
- `end_date` - Fecha fin (ISO 8601)
- `category_id` - Filtrar por categoría
- `account_id` - Filtrar por cuenta
- `type` - Filtrar por tipo: `income`, `expense`
- `status` - Filtrar por estado: `pending`, `completed`, `cancelled`
- `limit` - Número de resultados (default: 100)
- `offset` - Offset para paginación (default: 0)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "date": "2025-11-12",
      "category_id": 9,
      "category_name": "Alimentación",
      "category_type": "expense",
      "account_id": 1,
      "account_name": "Efectivo",
      "amount": 50.00,
      "type": "expense",
      "description": "Supermercado",
      "notes": null,
      "status": "completed",
      "created_at": "2025-11-12T14:30:00",
      "updated_at": "2025-11-12T14:30:00"
    }
  ]
}
```

### 7.2 Obtener una transacción
```
GET /api/transactions/{id}
```

### 7.3 Crear transacción
```
POST /api/transactions
```

**Request Body:**
```json
{
  "date": "2025-11-12",
  "category_id": 9,
  "account_id": 1,
  "amount": 50.00,
  "type": "expense",
  "description": "Supermercado",
  "notes": "Compras de la semana",
  "status": "completed"
}
```

**Validaciones:**
- `amount` debe ser > 0
- `date` no puede ser futuro (opcional, según reglas de negocio)
- `category_id` y `account_id` deben existir
- `type` debe coincidir con `category.type` (income o expense)

**Response 201:** (transacción creada)

### 7.4 Actualizar transacción
```
PUT /api/transactions/{id}
```

### 7.5 Eliminar transacción
```
DELETE /api/transactions/{id}
```

### 7.6 Resumen de transacciones por período
```
GET /api/transactions/summary
```

**Query Params:**
- `start_date` - Fecha inicio (requerido)
- `end_date` - Fecha fin (requerido)
- `group_by` - Agrupar por: `day`, `week`, `month`, `category`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2025-11-01",
      "end": "2025-11-30"
    },
    "summary": {
      "total_income": 5000.00,
      "total_expense": 2800.00,
      "balance": 2200.00,
      "transaction_count": 45
    },
    "by_category": [
      {
        "category_id": 9,
        "category_name": "Alimentación",
        "type": "expense",
        "total": 800.00,
        "count": 12
      }
    ]
  }
}
```

---

## 8. Módulo: Dashboard (Analítico)

### 8.1 Dashboard principal
```
GET /api/dashboard
```

**Query Params:**
- `year` - Año (default: año actual)
- `month` - Mes (default: mes actual)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "period": {
      "year": 2025,
      "month": 11
    },
    "summary": {
      "total_income_planned": 5000.00,
      "total_income_actual": 5000.00,
      "total_expense_planned": 3500.00,
      "total_expense_actual": 2800.00,
      "total_saving_planned": 500.00,
      "balance_planned": 1000.00,
      "balance_actual": 2200.00,
      "variance": 1200.00,
      "variance_percentage": 120.00
    },
    "by_category": [
      {
        "category_id": 7,
        "category_name": "Vivienda",
        "type": "expense",
        "planned": 1200.00,
        "actual": 1200.00,
        "difference": 0.00,
        "percentage": 100.00,
        "status": "on_track"
      },
      {
        "category_id": 9,
        "category_name": "Alimentación",
        "type": "expense",
        "planned": 600.00,
        "actual": 800.00,
        "difference": 200.00,
        "percentage": 133.33,
        "status": "over_budget"
      }
    ],
    "top_expenses": [
      {
        "category_id": 7,
        "category_name": "Vivienda",
        "total": 1200.00,
        "percentage": 42.86
      }
    ]
  }
}
```

**Status values:**
- `under_budget` - Por debajo del presupuesto (< 90%)
- `on_track` - Dentro del presupuesto (90% - 100%)
- `over_budget` - Sobre presupuesto (> 100%)

### 8.2 Tendencia de los últimos meses
```
GET /api/dashboard/trend
```

**Query Params:**
- `months` - Número de meses hacia atrás (default: 6)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "months": [
      {
        "year": 2025,
        "month": 6,
        "total_income": 5000.00,
        "total_expense": 3200.00,
        "balance": 1800.00
      },
      {
        "year": 2025,
        "month": 7,
        "total_income": 5000.00,
        "total_expense": 3500.00,
        "balance": 1500.00
      }
    ]
  }
}
```

---

## 9. Schemas Pydantic (Resumen)

### 9.1 Category Schemas
```python
class CategoryBase(BaseModel):
    name: str
    type: Literal["income", "expense", "saving"]
    parent_id: Optional[int] = None
    icon: Optional[str] = None
    color: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
```

### 9.2 Account Schemas
```python
class AccountBase(BaseModel):
    name: str
    type: Literal["cash", "bank", "credit_card", "debit_card", "digital_wallet"]
    balance: float = 0.0
    currency: str = "PEN"
    is_active: bool = True

class AccountCreate(AccountBase):
    pass

class AccountResponse(AccountBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
```

### 9.3 Transaction Schemas
```python
class TransactionBase(BaseModel):
    date: date
    category_id: int
    account_id: int
    amount: float
    type: Literal["income", "expense"]
    description: Optional[str] = None
    notes: Optional[str] = None
    status: Literal["pending", "completed", "cancelled"] = "completed"

class TransactionCreate(TransactionBase):
    @validator('amount')
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Amount must be positive')
        return v

class TransactionResponse(TransactionBase):
    id: int
    category_name: str
    category_type: str
    account_name: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

---

## 10. Reglas de Negocio

### 10.1 Validaciones
1. **Categorías:**
   - No se puede eliminar una categoría con transacciones asociadas
   - Las categorías raíz (parent_id = NULL) solo pueden ser: "Ingresos", "Gastos", "Ahorros"

2. **Transacciones:**
   - El `type` de la transacción debe coincidir con el `type` de la categoría
   - Solo categorías de tipo `income` o `expense` pueden tener transacciones
   - El `amount` debe ser siempre positivo

3. **Presupuesto:**
   - Solo se puede presupuestar para categorías específicas (no para categorías raíz)
   - El monto presupuestado debe ser >= 0

### 10.2 Cálculos automáticos
- El balance de cuentas (`accounts.balance`) se calcula automáticamente sumando/restando transacciones
- Los totales del dashboard se calculan en tiempo real desde las transacciones

---

## 11. Seguridad y Autenticación

> 💡 **Nota:**  
> Para el MVP (monousuario local), **no se implementa autenticación**.

En versiones futuras con multiusuario:
- JWT tokens para autenticación
- Middleware de autorización
- Header: `Authorization: Bearer <token>`

---

## 12. Documentación Automática

FastAPI genera automáticamente:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **OpenAPI JSON:** `http://localhost:8000/openapi.json`

---

## 13. Impacto Esperado

### Positivo:
- API completa y consistente para el MVP
- Documentación automática con FastAPI
- Fácil consumo desde HTMX y React
- Schemas Pydantic garantizan validación

### Consideraciones:
- Requiere implementar todos los endpoints para el MVP funcional
- Los schemas deben mantenerse sincronizados con el modelo de datos

---

## 14. Próximos Pasos
1. Implementar modelos SQLAlchemy (RFC-002)
2. Implementar schemas Pydantic
3. Crear routers para cada módulo
4. Escribir tests de integración
5. Generar script de inicialización de BD

---

## 15. Estado del Documento
**Approved** - API diseñada y lista para implementación.

---

## 16. Relación con otros documentos
- RFC-001: Selección de Backend (FastAPI)
- RFC-002: Modelo de Datos
- ADR-001: Arquitectura API-First

---

## 17. Comentarios
- Los endpoints están diseñados para ser RESTful y seguir convenciones estándar.
- La estructura de respuesta unificada facilita el manejo de errores en el frontend.
- Los schemas Pydantic proporcionan validación automática y documentación clara.
