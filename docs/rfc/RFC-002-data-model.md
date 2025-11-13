# RFC-002 — Modelo de Datos para la Aplicación de Gestión Presupuestal

**Estado:** Approved  
**Autor:** Ninrauzer  
**Fecha:** 2025-11-12  
**Versión:** 1.0  
**Supersedes:** -  
**Replaced by:** -  

## 1. Contexto
La aplicación de gestión presupuestal manejará tres dimensiones principales:
1. **Planeamiento financiero anual:** Presupuesto planificado por categoría, mes y año.
2. **Registro real de transacciones:** Ingresos y gastos ejecutados.
3. **Dashboards analíticos:** Comparación planificado vs. real, tendencias y métricas.

Este RFC define el modelo de datos para la base del sistema, inicialmente en **SQLite** (desarrollo/MVP) y migrable a **PostgreSQL** (producción).

> 💡 **Nota:**  
> El modelo está diseñado para un usuario único sin autenticación (MVP). La tabla `users` se agregará en versiones posteriores.

## 2. Objetivos del Modelo
- Representar presupuestos por categoría, mes y año.
- Registrar transacciones reales.
- Mantener categorías flexibles.
- Soportar cálculos agregados.
- Ser ampliable.

## 3. Requisitos
### Funcionales
- CRUD de presupuesto anual.
- Registro de transacciones.
- Cálculo planificado vs real.

### No Funcionales
- Simplicidad.
- Portabilidad SQLite → PostgreSQL.

## 4. Modelo ER
Entidades principales:
- **categories:** Categorías de ingresos, gastos y ahorros (jerárquicas)
- **accounts:** Cuentas/medios de pago (Efectivo, Banco, Tarjetas)
- **budget_plan:** Presupuesto planificado por categoría y mes
- **transactions:** Transacciones reales (ingresos/gastos ejecutados)

**Relaciones:**
- `categories.parent_id` → `categories.id` (auto-referencia para jerarquía)
- `budget_plan.category_id` → `categories.id`
- `transactions.category_id` → `categories.id`
- `transactions.account_id` → `accounts.id`

## 5. Tablas

### 5.1 categories

Categorías de ingresos, gastos y ahorros con soporte para jerarquía (categoría padre → subcategorías).

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Identificador único |
| name | TEXT | NOT NULL | Nombre de la categoría |
| type | TEXT | NOT NULL, CHECK IN ('income', 'expense', 'saving') | Tipo de categoría |
| parent_id | INTEGER | FOREIGN KEY → categories(id), NULL | ID de categoría padre (NULL si es raíz) |
| icon | TEXT | NULL | Nombre del icono (opcional, para UI) |
| color | TEXT | NULL | Color en hex (opcional, para UI) |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

**Valores permitidos para `type`:**
- `income` - Ingresos
- `expense` - Gastos
- `saving` - Ahorros

**Categorías iniciales predefinidas:**

```sql
-- INCOME
INSERT INTO categories (name, type, parent_id) VALUES 
  ('Ingresos', 'income', NULL),
  ('Salario', 'income', 1),
  ('Freelance', 'income', 1),
  ('Inversiones', 'income', 1),
  ('Otros Ingresos', 'income', 1);

-- EXPENSES
INSERT INTO categories (name, type, parent_id) VALUES 
  ('Gastos', 'expense', NULL),
  ('Vivienda', 'expense', 6),
  ('Transporte', 'expense', 6),
  ('Alimentación', 'expense', 6),
  ('Salud', 'expense', 6),
  ('Entretenimiento', 'expense', 6),
  ('Subscripciones', 'expense', 6),
  ('Educación', 'expense', 6),
  ('Otros Gastos', 'expense', 6);

-- SAVINGS
INSERT INTO categories (name, type, parent_id) VALUES 
  ('Ahorros', 'saving', NULL),
  ('Fondo de Emergencia', 'saving', 15),
  ('Inversión', 'saving', 15),
  ('Metas Específicas', 'saving', 15);
```

---

### 5.2 accounts

Cuentas o medios de pago utilizados para las transacciones.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Identificador único |
| name | TEXT | NOT NULL | Nombre de la cuenta |
| type | TEXT | NOT NULL, CHECK IN ('cash', 'bank', 'credit_card', 'debit_card', 'digital_wallet') | Tipo de cuenta |
| balance | REAL | DEFAULT 0.0 | Balance actual (opcional, calculado) |
| currency | TEXT | DEFAULT 'PEN' | Moneda (ISO 4217) |
| is_active | BOOLEAN | DEFAULT 1 | Si la cuenta está activa |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

**Valores permitidos para `type`:**
- `cash` - Efectivo
- `bank` - Cuenta bancaria
- `credit_card` - Tarjeta de crédito
- `debit_card` - Tarjeta de débito
- `digital_wallet` - Billetera digital (Yape, Plin, etc.)

**Cuentas iniciales predefinidas:**

```sql
INSERT INTO accounts (name, type, balance, currency) VALUES 
  ('Efectivo', 'cash', 0.0, 'PEN'),
  ('Banco BBVA', 'bank', 0.0, 'PEN'),
  ('Tarjeta BBVA', 'credit_card', 0.0, 'PEN');
```

---

### 5.3 budget_plan

Presupuesto planificado por categoría, mes y año.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Identificador único |
| year | INTEGER | NOT NULL | Año del presupuesto |
| month | INTEGER | NOT NULL, CHECK (month BETWEEN 1 AND 12) | Mes del presupuesto (1-12) |
| category_id | INTEGER | NOT NULL, FOREIGN KEY → categories(id) | Categoría presupuestada |
| amount | REAL | NOT NULL, CHECK (amount >= 0) | Monto planificado |
| notes | TEXT | NULL | Notas adicionales |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Última actualización |

**Restricción única:**
- UNIQUE(year, month, category_id) - No duplicar presupuesto para la misma categoría en el mismo mes

---

### 5.4 transactions

Registro de transacciones reales (ingresos y gastos ejecutados).

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Identificador único |
| date | TEXT | NOT NULL | Fecha de la transacción (ISO 8601) |
| category_id | INTEGER | NOT NULL, FOREIGN KEY → categories(id) | Categoría de la transacción |
| account_id | INTEGER | NOT NULL, FOREIGN KEY → accounts(id) | Cuenta/medio de pago utilizado |
| amount | REAL | NOT NULL | Monto de la transacción |
| type | TEXT | NOT NULL, CHECK IN ('income', 'expense') | Tipo de transacción |
| description | TEXT | NULL | Descripción/concepto |
| notes | TEXT | NULL | Notas adicionales |
| status | TEXT | NOT NULL, DEFAULT 'completed', CHECK IN ('pending', 'completed', 'cancelled') | Estado de la transacción |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Fecha de registro |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Última actualización |

**Valores permitidos para `type`:**
- `income` - Ingreso
- `expense` - Gasto

**Valores permitidos para `status`:**
- `pending` - Pendiente de ejecución
- `completed` - Completada/confirmada
- `cancelled` - Cancelada

## 6. Integridad Referencial

- Todas las relaciones FK están protegidas con `ON DELETE RESTRICT` (SQLite no soporta CASCADE por defecto).
- Modelo normalizado a **Tercera Forma Normal (3FN)**.
- Los índices se crearán en:
  - `categories(parent_id)` para consultas jerárquicas
  - `budget_plan(year, month, category_id)` para consultas de presupuesto
  - `transactions(date, category_id, account_id)` para reportes

## 7. Extensibilidad Futura

El modelo está diseñado para ser extensible sin romper la estructura actual:

### Versiones futuras:
- **users:** Sistema multiusuario con autenticación
- **recurring_transactions:** Transacciones recurrentes automáticas
- **budgets_goals:** Metas de ahorro con progreso
- **attachments:** Adjuntos/recibos vinculados a transacciones
- **tags:** Etiquetas personalizadas para transacciones

### Migración SQLite → PostgreSQL:
- Tipos de datos compatibles
- FKs y constraints directamente migrables
- AUTOINCREMENT → SERIAL
- BOOLEAN nativo en PostgreSQL

## 8. Conclusión

El modelo de datos propuesto es:
- ✅ **Flexible:** Categorías jerárquicas y extensible a nuevas entidades
- ✅ **Consistente:** Integridad referencial y validaciones en DB
- ✅ **Escalable:** Migrable a PostgreSQL sin cambios estructurales
- ✅ **Completo:** Soporta todas las funcionalidades del MVP

## 9. Próximos Pasos
- Crear scripts de inicialización de BD (SQLite)
- Implementar modelos SQLAlchemy
- RFC-003: Diseño de API REST

## 10. Estado del Documento
**Approved** - Modelo aprobado y listo para implementación.

## 11. Relación con otros documentos
- RFC-001: Selección de Backend (FastAPI)
- RFC-003: Diseño de API REST (pendiente)
- ADR-001: Arquitectura API-First

## 12. Comentarios
- El modelo incluye la tabla `accounts` desde el MVP para diferenciar medios de pago.
- Las categorías iniciales están basadas en el análisis del Excel original.
- No se incluye autenticación en el MVP (monousuario local).
