# Backend Scripts - Documentación

## 📋 Scripts Esenciales

### 1. `copy_dev_to_prod.py` ⭐ IMPORTANTE

**Propósito**: Copiar datos de `budgetapp_dev` → `budgetapp_prod`

**Cuándo usarlo**:
- Después de testing en desarrollo
- Antes de hacer pruebas en Docker
- Sincronización manual entre ambas BDs

**Uso**:
```powershell
cd backend
.\.venv\Scripts\python.exe copy_dev_to_prod.py
```

**Output esperado**:
```
✅ Connected to budgetapp_dev
✅ Connected to budgetapp_prod
✅ Created 11 tables in PROD
✅ Copied all data from DEV to PROD
✅ Verification passed: [table counts]
```

**⚠️ CUIDADO**: Esto sobrescribe TODOS los datos de `budgetapp_prod`

---

### 2. `migrate_direct.py` 📦 DOCUMENTACIÓN

**Propósito**: Migrar datos desde Supabase → PostgreSQL WSL

**Cuándo usarlo**:
- Solo en caso de necesidad futura
- Para refrescar datos de Supabase a local
- Documentación de cómo se migró originalmente

**Uso**:
```powershell
cd backend
.\.venv\Scripts\python.exe migrate_direct.py
```

**Lo que hace**:
1. Lee schema de Supabase
2. Crea tablas en WSL PostgreSQL
3. Copia todos los datos
4. Verifica integridad

**Output esperado**:
```
Step 1: Connecting to Supabase
✅ Connected to Supabase (PostgreSQL 17.6)

Step 2: Reading Supabase schema
✅ Found 11 tables

Step 3: Connecting to WSL PostgreSQL
✅ Connected to WSL (PostgreSQL 16.10)

Step 4: Creating tables in WSL
✅ Created 11 tables

Step 5: Copying data
✅ accounts: 3 rows
✅ transactions: 43 rows
...

Step 6: Verifying
✅ All tables present with correct data
```

---

## 🗑️ Scripts Eliminados

Los siguientes scripts fueron eliminados porque ya no son necesarios:

- `check_db.py` - Debug viejo
- `check_tables.py` - Debug viejo
- `migrate_data.py` - Reemplazado por `migrate_direct.py`
- `migrate_schema.py` - Reemplazado por `migrate_direct.py`
- `migrate_supabase_to_wsl.py` - Reemplazado por `migrate_direct.py`
- `migrate_supabase_to_wsl.sh` - Shell viejo (no sirve en WSL2)
- `init_schema.sh` - Ya no se necesita
- `test_supabase.py` - Test viejo de Supabase
- `switch-env.ps1` - Ya no es necesario
- `server.ps1` - Usamos `uvicorn` directo

---

## 💾 Archivos .env Consolidados

Se consolidó a un solo `.env` por entorno:

- ✅ `backend/.env` - Desarrollo local (budgetapp_dev)
- ✅ `root/.env` - Docker (budgetapp_prod)

Se eliminaron:
- `.env.dev`
- `.env.prod`
- `.env.wsl`

---

## 🧹 Limpieza Realizada

Se removieron archivos innecesarios:

- SQLite databases: `budget.db`, `budget.db.old`, `budget_app.db`
- Cache: `.pytest_cache/`, `__pycache__/`
- Setup scripts: `setup-postgres-wsl.ps1` (ya configurado)

---

## 📊 Flujo Actual

```
┌─ Desarrollo Local
│  ├─ Editar código
│  ├─ Test en budgetapp_dev
│  └─ [copy_dev_to_prod.py] ← sincronizar si necesario
│
├─ Docker (Production-like)
│  ├─ Lee budgetapp_prod
│  └─ Pruebas finales
│
└─ Render.com (Future)
   ├─ Push a GitHub
   └─ Render despliega (con Supabase)
```

---

## 🚀 Recomendación

**Solo necesitas usar**:
1. `copy_dev_to_prod.py` - para sincronizar entre ambas BDs
2. `migrate_direct.py` - solo como referencia / documentación

**No necesitas ejecutar regularmente**:
- Ambos scripts se usan ocasionalmente
- La mayoría del desarrollo no requiere estos scripts

---

**Última actualización**: 19 Nov 2025
