# Guía de Deployment a Render.com

## 📋 Resumen de Decisiones

### 1. Base de Datos: ✅ Supabase (PostgreSQL)
- **Free Tier**: 500MB almacenamiento, suficiente para side project
- **Sin costo**: Gratis permanentemente con límites razonables
- **Backups**: Automáticos en tier free (7 días de retención)
- **Dashboard**: UI intuitiva para gestión manual si necesario

### 2. Backend: ✅ Render.com
- **Free Tier**: 750 horas/mes (suficiente para 1 servicio 24/7)
- **Auto-deploy**: Push a GitHub → Deploy automático
- **Sleep**: Duerme después de 15 min inactividad (despierta en ~30s)
- **Limitaciones**: 512 MB RAM, 0.1 CPU

### 3. Frontend: ✅ Render.com (Static Site)
- **Free Tier**: 100 GB bandwidth/mes
- **CDN Global**: Render distribuye tu frontend globalmente
- **SSL Automático**: HTTPS gratuito
- **Build automático**: Detecta Vite y hace build

**¿Por qué Render en lugar de Vercel/Netlify?**
- ✅ **Todo en un lugar**: Backend + Frontend en un solo dashboard
- ✅ **Menos cuentas**: Una sola plataforma
- ✅ **React funciona perfecto**: Render detecta Vite/React automáticamente
- ✅ **Responsive**: Sirve los archivos estáticos tal cual (tu optimización mobile YA funciona)
- ✅ **Simplicidad**: Un solo `render.yaml` para todo
- ⚠️ **Desventaja vs Vercel**: Vercel tiene edge functions más avanzadas (no las necesitas ahora)
- ⚠️ **Desventaja vs Netlify**: Netlify tiene mejor preview de PRs (no usarás PRs aún)

**Responsividad del Frontend:**
Tu frontend React es completamente estático después del build. Render lo sirve como archivos HTML/CSS/JS igual que Vercel/Netlify. **La responsividad que optimizamos está en el código, no en el servidor**, así que funcionará IDÉNTICO en Render.

---

## 🚀 Plan de Deployment Paso a Paso

### Fase 1: Preparar Supabase (10 minutos)

#### 1.1 Crear Proyecto en Supabase
```
1. Ir a https://app.supabase.com
2. Click "New Project"
3. Configurar:
   - Name: budgetapp
   - Database Password: (guárdala bien)
   - Region: South America (São Paulo) - más cercano a Perú
4. Click "Create Project" (toma ~2 minutos)
```

#### 1.2 Obtener Credenciales
```
1. Dashboard → Settings → Database
2. Copiar "Connection string" (URI format):
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
3. Guardar en archivo seguro
```

#### 1.3 Migrar Datos desde PostgreSQL Local
```powershell
# Opción A: Backup + Restore (RECOMENDADO)
cd E:\Desarrollo\BudgetApp\backend

# 1. Backup desde tu PostgreSQL local (budgetapp_prod tiene tus datos reales)
wsl pg_dump -h 192.168.126.127 -U postgres -d budgetapp_prod -F c -f backup.dump

# 2. Restore a Supabase (reemplaza con tu connection string)
wsl pg_restore --clean --no-owner --no-privileges \
  -h db.XXXXXXXXXX.supabase.co \
  -U postgres \
  -d postgres \
  backup.dump
# Password: [tu password de Supabase]

# Opción B: Script Python (si Opción A falla)
# Crear script copy_to_supabase.py:
```

```python
# backend/copy_to_supabase.py
import os
from sqlalchemy import create_engine, text

# Source: Tu PostgreSQL local
SOURCE_URL = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod"

# Destination: Supabase (reemplazar con tu URL real)
DEST_URL = "postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"

source_engine = create_engine(SOURCE_URL)
dest_engine = create_engine(DEST_URL)

tables = [
    'categories', 'billing_cycle', 'accounts', 
    'transactions', 'transfers', 'quick_templates',
    'credit_cards', 'loans', 'loan_payments'
]

with source_engine.connect() as src, dest_engine.connect() as dst:
    for table in tables:
        print(f"Copying {table}...")
        
        # Get data
        result = src.execute(text(f"SELECT * FROM {table}"))
        rows = result.fetchall()
        columns = result.keys()
        
        if rows:
            # Clear destination table
            dst.execute(text(f"DELETE FROM {table}"))
            
            # Insert data
            placeholders = ','.join([f':{col}' for col in columns])
            insert_sql = f"INSERT INTO {table} ({','.join(columns)}) VALUES ({placeholders})"
            
            for row in rows:
                dst.execute(text(insert_sql), dict(zip(columns, row)))
            
            dst.commit()
            print(f"  ✓ Copied {len(rows)} rows")
        else:
            print(f"  - No data in {table}")

print("\n✅ Migration complete!")
```

```powershell
# Ejecutar script
cd backend
.\.venv\Scripts\python.exe copy_to_supabase.py
```

#### 1.4 Verificar Migración
```sql
-- Conectar a Supabase desde SQL Editor (Dashboard)
SELECT COUNT(*) as total_transactions FROM transactions;
SELECT COUNT(*) as total_categories FROM categories;
SELECT * FROM accounts ORDER BY id;
```

---

### Fase 2: Configurar Render.com (15 minutos)

#### 2.1 Crear Cuenta y Conectar GitHub
```
1. Ir a https://render.com
2. Sign up con GitHub
3. Autorizar acceso al repo: ninrauzer/BudgetApp
```

#### 2.2 Crear Backend Service
```
1. Dashboard → "New +" → "Web Service"
2. Conectar repo: BudgetApp
3. Configurar:
   - Name: budgetapp-backend
   - Region: Oregon (US West) - el más cercano gratis
   - Branch: master
   - Root Directory: (dejar vacío)
   - Runtime: Python 3
   - Build Command: chmod +x build.sh && ./build.sh
   - Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   - Instance Type: Free

4. Environment Variables (Add Environment Variables):
   DATABASE_URL = [tu URL de Supabase]
   PYTHON_VERSION = 3.11.0
   LOG_LEVEL = info
   PYTHONUNBUFFERED = 1

5. Click "Create Web Service"
```

**⏱️ Tiempo de deploy**: ~5-7 minutos

**URL resultante**: `https://budgetapp-backend.onrender.com`

#### 2.3 Crear Frontend Service
```
1. Dashboard → "New +" → "Static Site"
2. Conectar repo: BudgetApp
3. Configurar:
   - Name: budgetapp-frontend
   - Region: Oregon (US West)
   - Branch: master
   - Root Directory: (dejar vacío)
   - Build Command: cd frontend && npm ci && npm run build
   - Publish Directory: frontend/dist

4. Environment Variables:
   VITE_API_URL = /api

5. Redirects & Rewrites (Headers):
   # Redirect API calls to backend
   /api/*  https://budgetapp-backend.onrender.com/api/:splat  200
   
   # SPA routing
   /*  /index.html  200

6. Click "Create Static Site"
```

**⏱️ Tiempo de deploy**: ~3-5 minutos

**URL resultante**: `https://budgetapp-frontend.onrender.com`

---

### Fase 3: Verificación (5 minutos)

#### 3.1 Backend Health Check
```bash
# Verificar que el backend esté vivo
curl https://budgetapp-backend.onrender.com/api/health

# Debe responder:
# {"status":"healthy","database":"connected"}
```

#### 3.2 Frontend Test
```
1. Abrir: https://budgetapp-frontend.onrender.com
2. Verificar:
   ✓ Dashboard carga
   ✓ Transacciones muestran datos
   ✓ Budget funciona
   ✓ En móvil (Chrome DevTools) todo es responsivo
```

#### 3.3 API Connectivity
```javascript
// Abrir Console en el navegador (F12)
fetch('/api/categories')
  .then(r => r.json())
  .then(d => console.log(d))

// Debe mostrar tus categorías
```

---

## 💰 Costos Reales

### Configuración FREE Total (Recomendada para Side Project)

| Servicio | Plan | Costo | Límites |
|----------|------|-------|---------|
| **Supabase** | Free | $0/mes | 500MB DB, 1GB transferencia |
| **Render Backend** | Free | $0/mes | Duerme tras 15 min, 750h/mes |
| **Render Frontend** | Free | $0/mes | 100 GB bandwidth/mes |
| **TOTAL** | | **$0/mes** | Perfecto para side project |

**⚠️ Limitaciones Free:**
- Backend duerme tras 15 min → Primera carga lenta (~30s)
- Sin custom domain (usar .onrender.com)
- 500MB en Supabase (suficiente para ~50k transacciones)

### Upgrade Path (Si Crece el Proyecto)

| Servicio | Plan | Costo | Beneficios |
|----------|------|-------|-----------|
| **Supabase** | Pro | $25/mes | 8GB DB, sin límite transferencia, mejor soporte |
| **Render Backend** | Starter | $7/mes | **Sin sleep**, 512MB RAM persistente |
| **Render Frontend** | Free | $0/mes | Suficiente incluso con tráfico |
| **TOTAL Upgrade** | | **$32/mes** | Backend 24/7 + más storage |

**Recomendación**: Empieza FREE, upgrade solo cuando:
- Tengas usuarios reales
- El sleep del backend moleste
- Necesites más de 500MB en DB

---

## 🔄 Workflow de Desarrollo (Post-Deploy)

### Deploy Automático (Sin PR ni Actions)
```bash
# 1. Hacer cambios
git add .
git commit -m "feat: nueva funcionalidad"

# 2. Push a master
git push origin master

# 3. Render detecta el push y despliega automáticamente
# Backend: ~5-7 min
# Frontend: ~3-5 min

# 4. Verificar en https://budgetapp-frontend.onrender.com
```

### Ver Logs en Tiempo Real
```
1. Render Dashboard → budgetapp-backend → Logs
2. Ver errores, requests, etc.
3. Filtrar por nivel (error, info, debug)
```

### Rollback si Algo Falla
```
1. Dashboard → Service → Deploy History
2. Click en deploy anterior que funcionaba
3. "Rollback to this version"
```

---

## 🎯 Próximos Pasos (Después de Deploy)

### 1. Custom Domain (Opcional, ~$12/año)
```
1. Comprar dominio en Namecheap/Google Domains
2. Render Dashboard → Service → Settings → Custom Domain
3. Agregar: budgetapp.tudominio.com
4. Configurar DNS según instrucciones
5. SSL automático gratis
```

### 2. Monitoring (Opcional, Free)
```
# Integrar con Better Uptime (free tier)
1. https://betteruptime.com
2. Monitor: https://budgetapp-backend.onrender.com/api/health
3. Alertas si el backend está down
```

### 3. CI/CD con GitHub Actions (Cuando Quieras)
```bash
# Activar el workflow que guardamos
mv .github/workflows/ci-cd.yml.example .github/workflows/ci-cd.yml

# Configurar secrets en GitHub
# Settings → Secrets → New repository secret
# RENDER_DEPLOY_HOOK_URL = [copiar de Render Settings]

# Próximo PR activará tests automáticos
```

---

## 🆘 Troubleshooting

### Backend no inicia
```bash
# Ver logs detallados
Render Dashboard → budgetapp-backend → Logs

# Errores comunes:
1. DATABASE_URL mal configurado → Verificar en Environment
2. build.sh no tiene permisos → Añadir chmod en Build Command
3. Puerto incorrecto → Debe usar $PORT (Render lo asigna)
```

### Frontend carga pero API falla
```bash
# Verificar rewrites
Dashboard → budgetapp-frontend → Redirects/Rewrites

# Debe tener:
/api/*  https://budgetapp-backend.onrender.com/api/:splat  200

# Verificar CORS en backend
# backend/app/main.py debe tener:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://budgetapp-frontend.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Base de datos vacía después de deploy
```sql
-- Verificar tablas en Supabase SQL Editor
\dt

-- Si faltan tablas, correr migraciones
-- Desde Render Shell (Dashboard → Shell):
python scripts/init_db.py
```

---

## 📚 Recursos Útiles

- [Render Python Docs](https://render.com/docs/deploy-fastapi)
- [Render Static Sites](https://render.com/docs/static-sites)
- [Supabase Docs](https://supabase.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)

---

## ✅ Checklist Final

Antes de considerar deployment completo:

- [ ] Supabase proyecto creado
- [ ] Datos migrados de PostgreSQL local → Supabase
- [ ] Backend desplegado en Render
- [ ] Frontend desplegado en Render
- [ ] Health check backend: `200 OK`
- [ ] Frontend carga sin errores
- [ ] API calls funcionan (verificar en Console)
- [ ] Mobile responsive (probar en celular real)
- [ ] Environment variables configuradas
- [ ] Logs sin errores críticos
- [ ] GitHub repo actualizado
- [ ] `.env.example` actualizado con URLs de producción

**Tiempo total estimado: 30-40 minutos**

---

¿Listo para empezar? Te guío paso a paso. 🚀
