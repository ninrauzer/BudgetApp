# Configuración de Bases de Datos - BudgetApp

## 📊 Estado Actual (19 Nov 2025)

**Migración completada**: Supabase PostgreSQL → PostgreSQL local en WSL2

### Resumen Rápido

```
🐳 Docker (Producción-like)      👨‍💻 VSCode (Desarrollo Local)
├─ budgetapp_prod                ├─ budgetapp_dev
├─ 192.168.126.127:5432          ├─ 192.168.126.127:5432
├─ ⚠️ NO TOCAR                    ├─ ✅ OK USAR
└─ 43 transacciones              └─ 43 transacciones (sync)
```

---

## 🐳 Docker (Production-like)

### Configuración
- **Database**: `budgetapp_prod`
- **Host**: 192.168.126.127:5432
- **User**: postgres
- **Password**: postgres
- **Connection**: `postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod`

### En `compose.yml`
```yaml
environment:
  - DATABASE_URL=postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod
```

### Acceso a la Aplicación
- **Frontend**: http://192.168.126.127:8080
- **Backend API**: http://192.168.126.127:8000
- **API Docs**: http://192.168.126.127:8000/docs

### ⚠️ POLÍTICA: NUNCA MODIFICAR

```
🚫 NO hacer:
- psql -h 192.168.126.127 -U postgres -d budgetapp_prod
- DELETE FROM transactions ...
- UPDATE accounts SET ...
- DROP TABLE ...

✅ HACER:
- Usar la interfaz web (http://192.168.126.127:8080)
- Cambios SOLO a través de la aplicación
```

**Razón**: `budgetapp_prod` simula el ambiente de producción en Render.com. Los datos deben ser modificados SOLO por la aplicación web para mantener integridad.

---

## 👨‍💻 Desarrollo Local (VSCode)

### Configuración
- **Database**: `budgetapp_dev`
- **Host**: 192.168.126.127:5432
- **User**: postgres
- **Password**: postgres
- **Connection**: `postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev`

### En `backend/.env`
```
DATABASE_URL=postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev
```

### Iniciar Backend
```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Iniciar Frontend
```powershell
cd frontend
npm run dev
```

### Acceso
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### ✅ POLÍTICA: LIBRE DE USAR

```
✅ OK hacer:
- psql -h 192.168.126.127 -U postgres -d budgetapp_dev
- DELETE FROM transactions WHERE id = 1;
- INSERT INTO transactions ...
- Experimentar sin restricciones
- Resetear la BD cuando sea necesario
```

**Razón**: `budgetapp_dev` es SOLO para testing y desarrollo. Cambios aquí NO afectan a Docker.

---

## 🔄 Sincronizar Datos

### Dev → Prod (Copiar desarrollo a producción)

```powershell
cd backend
.\.venv\Scripts\python.exe copy_dev_to_prod.py
```

**Cuidado**: Esto sobrescribe todos los datos de `budgetapp_prod` con los de `budgetapp_dev`.

### Prod → Dev (Inverso - si es necesario)

Crear `backend/copy_prod_to_dev.py` basado en `copy_dev_to_prod.py`.

---

## 📈 Datos Actualmente en Ambas BDs

- ✅ 43 transacciones
- ✅ 35 categorías
- ✅ 3 cuentas (Efectivo, BCP, BBVA)
- ✅ 2 ciclos de facturación
- ✅ 11 tablas completas

### Origen
Supabase PostgreSQL (db.ohleydwbqagxwyfdtiny.supabase.co) - 19 Nov 2024

### Migración
```
Supabase ──[migrate_direct.py]──> WSL PostgreSQL (budgetapp_dev)
                                        │
                                        ├──> budgetapp_dev (local testing)
                                        │
                         [copy_dev_to_prod.py]
                                        │
                                        └──> budgetapp_prod (Docker)
```

---

## 🚀 Flujo de Desarrollo

### 1. Desarrollo Local
```
Editar código → Test en budgetapp_dev → Verificar en http://localhost:5173
```

### 2. Testing en Docker
```
Push cambios → Docker reconstruye → Test en budgetapp_prod → http://192.168.126.127:8080
```

### 3. Production (Futuro)
```
git push → Render.com reconstruye → Deploy a Render.com (con Supabase)
```

---

## 📝 Scripts Disponibles

### `backend/copy_dev_to_prod.py`
```bash
.\.venv\Scripts\python.exe copy_dev_to_prod.py
```
Copia schema + datos de `budgetapp_dev` → `budgetapp_prod`

### `backend/migrate_direct.py`
```bash
.\.venv\Scripts\python.exe migrate_direct.py
```
Migra datos desde Supabase → WSL PostgreSQL (ya ejecutado)

---

## 🆘 Troubleshooting

### "Connection refused" en Docker
```bash
# Verificar PostgreSQL está corriendo en WSL
wsl -d Ubuntu-24.04 bash -c "sudo systemctl status postgresql"

# Iniciar si está stopped
wsl -d Ubuntu-24.04 bash -c "sudo systemctl start postgresql"
```

### "FATAL: password authentication failed"
```bash
# Verificar user y password en compose.yml
# Debe ser: postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod
```

### "Database budgetapp_prod doesn't exist"
```bash
# Recrear desde dev
cd backend
.\.venv\Scripts\python.exe copy_dev_to_prod.py
```

---

## 📞 Resumen Rápido

| Contexto | Base | Host | Password | Permisos |
|----------|------|------|----------|----------|
| 🐳 Docker | `budgetapp_prod` | 192.168.126.127 | postgres | 🚫 Lectura solo web |
| 👨‍💻 VSCode | `budgetapp_dev` | 192.168.126.127 | postgres | ✅ Total libertad |
| 🚀 Render | Supabase | cloud | var env | 🚀 Production |

---

**Última actualización**: 19 Nov 2025
