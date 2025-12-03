# Configuración de Base de Datos Demo Aislada

## 🎯 Objetivo
Crear un sandbox completamente aislado para modo demo, sin riesgo de afectar datos de producción.

---

## 📋 Paso 1: Crear Base de Datos Demo en Neon

### Opción A: Crear en el mismo proyecto (más simple)

1. Ve a [Neon Console](https://console.neon.tech/)
2. Selecciona tu proyecto actual
3. Click en "Databases" en el sidebar
4. Click "New Database"
5. Nombre: `budgetapp_demo`
6. Click "Create"

**Connection string será:**
```
postgresql://neondb_owner:npg_JiBThGbK03Rj@ep-delicate-math-afp2qxtf-pooler.c-2.us-west-2.aws.neon.tech/budgetapp_demo?sslmode=require
```

### Opción B: Crear nuevo proyecto (más aislamiento)

1. Neon Console → "New Project"
2. Nombre: "BudgetApp Demo"
3. Region: US West (Oregon) - mismo que prod
4. Copiar connection string generado

---

## 📋 Paso 2: Popular Base de Datos Demo

Ejecutar script de setup:

```powershell
cd E:\Desarrollo\BudgetApp\backend
.\.venv\Scripts\python.exe setup_demo_database.py
```

**Esto creará:**
- ✅ 10 categorías (ingresos y gastos)
- ✅ 3 cuentas (Efectivo, Banco, Ahorros)
- ✅ 50 transacciones ficticias (últimos 3 meses)
- ✅ 3 ciclos de facturación
- ✅ Usuario demo: `demo@budgetapp.local`

---

## 📋 Paso 3: Configurar Variables de Entorno

### Desarrollo Local (`backend/.env`):
```bash
# Producción
DATABASE_URL=postgresql://neondb_owner:npg_JiBThGbK03Rj@ep-delicate-math-afp2qxtf-pooler.c-2.us-west-2.aws.neon.tech/budgetapp_prod?sslmode=require

# Demo (sandbox)
DEMO_DATABASE_URL=postgresql://neondb_owner:npg_JiBThGbK03Rj@ep-delicate-math-afp2qxtf-pooler.c-2.us-west-2.aws.neon.tech/budgetapp_demo?sslmode=require
```

### Render.com:
Agregar en **Environment Variables**:
```
DEMO_DATABASE_URL=postgresql://neondb_owner:npg_JiBThGbK03Rj@ep-delicate-math-afp2qxtf-pooler.c-2.us-west-2.aws.neon.tech/budgetapp_demo?sslmode=require
```

---

## 📋 Paso 4: Implementar Database Switching

El middleware detectará usuarios con `is_demo=true` y cambiará automáticamente a `budgetapp_demo`.

**Backend ya implementa:**
- `get_db()` con detección de usuario demo
- Sesiones separadas por tipo de usuario
- Zero configuración adicional requerida

---

## 🔄 Mantenimiento

### Resetear datos demo (cada semana/mes):
```powershell
cd backend
.\.venv\Scripts\python.exe setup_demo_database.py
```

### Verificar datos demo:
```sql
-- En Neon SQL Editor, seleccionar budgetapp_demo
SELECT COUNT(*) FROM transactions;  -- Debe mostrar ~50
SELECT COUNT(*) FROM categories;    -- Debe mostrar 10
SELECT COUNT(*) FROM accounts;      -- Debe mostrar 3
```

---

## 🔒 Seguridad

**Beneficios:**
- ✅ Usuarios demo NO pueden ver datos reales
- ✅ Usuarios demo NO pueden modificar datos reales
- ✅ Aislamiento total entre prod y demo
- ✅ Datos demo pueden resetearse sin afectar nada

**Limitaciones del plan Free:**
- Neon free: 10 proyectos o 10 databases por proyecto
- Actualmente usas: `budgetapp_prod` (1) + `budgetapp_demo` (2) = 2/10 ✅

---

## ✅ Checklist de Implementación

- [ ] Crear `budgetapp_demo` en Neon Console
- [ ] Ejecutar `setup_demo_database.py`
- [ ] Agregar `DEMO_DATABASE_URL` a `.env` local
- [ ] Agregar `DEMO_DATABASE_URL` a Render Environment
- [ ] Actualizar `database.py` con switching logic
- [ ] Probar modo demo localmente
- [ ] Desplegar a Render
- [ ] Habilitar botón demo en LoginPage
- [ ] Documentar proceso de reset en README

---

## 🎉 Resultado Final

**Usuario regular (OAuth):**
```
Login con Google → budgetapp_prod → Tus datos reales
```

**Usuario demo:**
```
Click "Acceder como Demo" → budgetapp_demo → Datos ficticios aislados
```

**Sin riesgo, sin mezcla, sin problemas.** 🚀
