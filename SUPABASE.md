# BudgetApp - Supabase PostgreSQL

## 📊 Configuración Actual

### Producción (Supabase)
- **Host**: db.ohleydwbqagxwyfdtiny.supabase.co
- **Puerto**: 6543 (Session Pooler - IPv6 compatible)
- **Base de datos**: PostgreSQL 17.6
- **Región**: AWS (aarch64-unknown-linux-gnu)

### Desarrollo (SQLite local)
- **Archivo**: `backend/dev_budget.db`
- **Tipo**: SQLite 3.x
- **Ubicación**: Local

---

## 🔄 Alternar entre Entornos

### Opción 1: Script PowerShell (Recomendado)
```powershell
# Cambiar a desarrollo
.\switch-env.ps1 dev

# Cambiar a producción
.\switch-env.ps1 prod
```

### Opción 2: Manual
```powershell
# Desarrollo
Copy-Item backend\.env.dev backend\.env

# Producción
Copy-Item backend\.env.prod backend\.env
```

**⚠️ Importante:** Reinicia el backend después de cambiar entornos:
```powershell
# Detener backend (Ctrl+C en terminal)
# Iniciar nuevamente
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

---

## 🗄️ Esquema de Base de Datos

### Tablas (11 en total):
1. **accounts** - Cuentas bancarias y efectivo
2. **billing_cycles** - Ciclos de facturación
3. **budget_plans** - Presupuestos por categoría
4. **categories** - Categorías de ingresos/gastos
5. **credit_card_installments** - Cuotas de tarjetas
6. **credit_card_statements** - Estados de cuenta
7. **credit_cards** - Tarjetas de crédito
8. **loan_payments** - Pagos de préstamos
9. **loans** - Préstamos
10. **quick_templates** - Plantillas rápidas
11. **transactions** - Transacciones

---

## 📦 Datos Migrados (19 Nov 2024)

### Producción (Supabase):
- ✅ **43 transacciones** (desde 14 Nov 2024)
- ✅ **35 categorías**
- ✅ **3 cuentas** (Efectivo, BCP, Credito BBVA)
- ❌ 0 budget_plans (schema incompatible - recrear manualmente)

### Desarrollo (SQLite):
- Base de datos vacía (crear según necesidad)

---

## 🛠️ Scripts Útiles

### Crear Schema en Supabase
```powershell
cd backend
.\.venv\Scripts\python.exe scripts\init_supabase_schema.py
```

### Migrar datos SQLite → Supabase
```powershell
cd backend
.\.venv\Scripts\python.exe scripts\migrate_to_postgres.py
```

### Inicializar DB local (desarrollo)
```powershell
# Cambiar a dev
.\switch-env.ps1 dev

# Crear schema
.\.venv\Scripts\python.exe scripts\init_db.py
```

---

## 🔐 Backups

### Supabase (Automático):
- **Backups diarios**: 7 días de retención (plan free)
- **Point-in-time recovery**: Disponible
- **Dashboard**: https://app.supabase.com

### Manual (Recomendado):
```powershell
# Backup con pg_dump (requiere PostgreSQL client)
pg_dump "postgresql://postgres:2mr38qsDV52NxD8NT@db.ohleydwbqagxwyfdtiny.supabase.co:6543/postgres" > backup_$(Get-Date -Format "yyyyMMdd").sql

# Backup vía API (alternativa)
curl https://budgetapp-backend.onrender.com/api/backup -o backup.db
```

### SQLite Local (Manual):
```powershell
# Backup simple
Copy-Item backend\dev_budget.db "backup\dev_budget_$(Get-Date -Format 'yyyyMMdd').db"
```

---

## 🌐 Requisitos de Red

### IPv6 (CRÍTICO):
Supabase **solo soporta IPv6**. Asegúrate de tener IPv6 habilitado:

```powershell
# Verificar IPv6
Test-NetConnection db.ohleydwbqagxwyfdtiny.supabase.co -Port 6543

# Resolver DNS (debe mostrar AAAA record)
Resolve-DnsName db.ohleydwbqagxwyfdtiny.supabase.co
```

**IPv6 Address**: `2600:1f13:838:6e00:27a4:8543:eae:c629`

Si IPv6 está deshabilitado:
1. Panel de Control → Redes
2. Propiedades de adaptador
3. Habilitar "Protocolo de Internet versión 6 (TCP/IPv6)"

---

## 🚀 Deployment

### Render.com (Producción):
Ver documentación completa en [RENDER.md](./RENDER.md)

**URLs**:
- Frontend: https://budgetapp-frontend.onrender.com
- Backend: https://budgetapp-backend.onrender.com
- API Docs: https://budgetapp-backend.onrender.com/docs

### Docker (Local/Self-Hosted):
Ver documentación completa en [DOCKER.md](./DOCKER.md)

```bash
docker compose up -d
```

---

## 📊 Monitoreo

### Supabase Dashboard:
1. Login: https://app.supabase.com
2. Proyecto: `budgetapp`
3. Secciones:
   - **Table Editor**: Ver/editar datos
   - **SQL Editor**: Ejecutar queries
   - **Database**: Configuración y logs
   - **Settings**: Backups y API keys

### Logs del Backend:
```powershell
# Ver logs en tiempo real
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --log-level debug
```

---

## 🐛 Troubleshooting

### Error: "relation does not exist"
```powershell
# Recrear schema
cd backend
.\.venv\Scripts\python.exe scripts\init_supabase_schema.py
```

### Error: "could not translate host name"
- Verifica que IPv6 esté habilitado
- Test: `Test-NetConnection db.ohleydwbqagxwyfdtiny.supabase.co -Port 6543`

### Error: "No module named 'psycopg2'"
```powershell
cd backend
.\.venv\Scripts\pip install --force-reinstall psycopg2-binary
```

### Backend no conecta a Supabase
1. Verifica `.env` en `backend/` (no en root)
2. Confirma `DATABASE_URL` correcto
3. Test de conexión:
```powershell
.\.venv\Scripts\python.exe -c "from app.db.database import engine; print(engine.connect())"
```

---

## 📝 Archivos de Configuración

```
backend/
├── .env            # Activo (copiado de .env.dev o .env.prod)
├── .env.dev        # SQLite local
├── .env.prod       # Supabase PostgreSQL
├── switch-env.ps1  # Script para alternar
└── dev_budget.db   # SQLite local (solo en dev)
```

**⚠️ Importante**: Archivos `.env*` están en `.gitignore` - no se suben a GitHub

---

## 🔒 Seguridad

### Variables Sensibles:
- `DATABASE_URL` contiene password
- Nunca commitear archivos `.env*`
- Rotar passwords periódicamente en Supabase

### Supabase:
- SSL/TLS automático
- Row Level Security (RLS) disponible
- API Keys en Settings → API

---

## 📚 Referencias

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL 17 Docs](https://www.postgresql.org/docs/17/)
- [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/)
- [FastAPI Database](https://fastapi.tiangolo.com/tutorial/sql-databases/)

---

**Última actualización**: 19 Nov 2025
**Versión**: 2.0.0
**Migración**: SQLite → Supabase PostgreSQL 17.6
