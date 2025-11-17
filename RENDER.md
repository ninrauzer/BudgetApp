# BudgetApp - Deployment en Render.com

## 🚀 Despliegue Automático con Blueprint

Render.com puede desplegar automáticamente la aplicación usando el archivo `render.yaml`.

### 📋 Prerrequisitos

1. Cuenta en [Render.com](https://render.com) (gratis)
2. Repositorio en GitHub con el código
3. Git instalado localmente

### 🎯 Opción 1: Despliegue desde Dashboard (Recomendado)

#### Paso 1: Preparar Repositorio
```bash
# Asegúrate de estar en la rama master
git checkout master

# Commit todos los cambios
git add .
git commit -m "feat: add Render.com deployment config"

# Push a GitHub
git push origin master
```

#### Paso 2: Crear Nuevo Blueprint en Render

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en **"New +"** → **"Blueprint"**
3. Conecta tu repositorio GitHub `ninrauzer/BudgetApp`
4. Render detectará automáticamente el archivo `render.yaml`
5. Asigna un nombre al Blueprint: **"BudgetApp"**
6. Click en **"Apply"**

#### Paso 3: Configurar Servicios

Render creará automáticamente 2 servicios:

**Backend (Web Service)**:
- Name: `budgetapp-backend`
- Runtime: Python 3.11
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Disk: 1GB persistente en `/opt/render/project/src/data`
- Health Check: `/api/health`

**Frontend (Static Site)**:
- Name: `budgetapp-frontend`
- Runtime: Static
- Build: `cd frontend && npm ci && npm run build`
- Publish: `frontend/dist`
- Routing: SPA con proxy a backend

#### Paso 4: Esperar Despliegue

- Backend: ~5-7 minutos
- Frontend: ~3-5 minutos
- Total: ~10 minutos

#### Paso 5: Obtener URLs

Render asignará URLs automáticas:
- **Frontend**: `https://budgetapp-frontend.onrender.com`
- **Backend**: `https://budgetapp-backend.onrender.com`
- **API Docs**: `https://budgetapp-backend.onrender.com/docs`

### 🎯 Opción 2: Despliegue Manual (Paso a Paso)

Si prefieres configurar manualmente:

#### 1. Crear Backend Service

1. Dashboard → **"New +"** → **"Web Service"**
2. Conecta repositorio `ninrauzer/BudgetApp`
3. Configuración:
   ```
   Name: budgetapp-backend
   Region: Oregon (US West)
   Branch: master
   Root Directory: (vacío)
   Runtime: Python 3
   Build Command: chmod +x build.sh && ./build.sh
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   Plan: Free
   ```

4. Variables de entorno:
   ```
   PYTHON_VERSION=3.11.0
   DATABASE_URL=sqlite:///./data/budget.db
   LOG_LEVEL=info
   PYTHONUNBUFFERED=1
   ```

5. Agregar Disco Persistente:
   - Dashboard → Service Settings → **"Disks"**
   - Name: `budgetapp-data`
   - Mount Path: `/opt/render/project/src/data`
   - Size: 1 GB

6. Health Check:
   - Path: `/api/health`
   - Interval: 30s

#### 2. Crear Frontend Service

1. Dashboard → **"New +"** → **"Static Site"**
2. Conecta repositorio `ninrauzer/BudgetApp`
3. Configuración:
   ```
   Name: budgetapp-frontend
   Region: Oregon (US West)
   Branch: master
   Root Directory: (vacío)
   Build Command: cd frontend && npm ci && npm run build
   Publish Directory: frontend/dist
   ```

4. Variables de entorno:
   ```
   VITE_API_URL=/api
   ```

5. Configurar Rewrites (Headers & Redirects):
   ```
   # Redirect API calls to backend
   /api/*  https://budgetapp-backend.onrender.com/api/:splat  200

   # SPA routing
   /*  /index.html  200
   ```

### 🔧 Configuración Avanzada

#### Custom Domain (Opcional)

1. Frontend Service → Settings → **"Custom Domain"**
2. Agrega tu dominio: `www.tudominio.com`
3. Configura DNS según instrucciones de Render
4. Render proveerá SSL automático (Let's Encrypt)

#### Actualizar Backend URL en Frontend

Si usas custom domain, actualiza la rewrite rule:
```
/api/*  https://budgetapp-backend.onrender.com/api/:splat  200
```

O usa variable de entorno en el backend para CORS.

### 🔄 Actualizaciones Automáticas

Render detecta automáticamente cambios en GitHub:

```bash
# Hacer cambios
git add .
git commit -m "feat: nueva funcionalidad"
git push origin master

# Render despliega automáticamente en ~5 minutos
```

### 📊 Monitoreo

#### Ver Logs en Tiempo Real
```
Dashboard → Service → Logs (live streaming)
```

#### Métricas
- CPU Usage
- Memory Usage
- Request Count
- Response Time

#### Health Checks
Render reinicia automáticamente si:
- `/api/health` falla 3 veces consecutivas
- Servicio no responde en 30s

### ⚠️ Limitaciones del Plan Free

**Backend (Web Service Free)**:
- 750 horas/mes (suficiente para 1 servicio 24/7)
- Duerme después de 15 min de inactividad
- Despierta en ~30 segundos al recibir request
- 512 MB RAM
- 0.1 CPU
- 1 GB disco persistente

**Frontend (Static Site Free)**:
- 100 GB bandwidth/mes
- CDN global
- SSL automático
- Sin límite de tiempo activo

**Recomendaciones**:
- Usar **Cron Job** (free) para mantener backend activo:
  - Dashboard → **"New +"** → **"Cron Job"**
  - Command: `curl https://budgetapp-backend.onrender.com/api/health`
  - Schedule: `*/14 * * * *` (cada 14 minutos)

### 🐛 Troubleshooting

#### Backend no inicia
```bash
# Ver logs
Dashboard → budgetapp-backend → Logs

# Verificar health check
curl https://budgetapp-backend.onrender.com/api/health

# Revisar variables de entorno
Dashboard → budgetapp-backend → Environment
```

#### Frontend muestra error 404 en rutas
```bash
# Verificar rewrites
Dashboard → budgetapp-frontend → Redirects/Rewrites

# Debe tener:
/*  /index.html  200
```

#### API calls fallan (CORS)
Agregar variable de entorno en backend:
```
FRONTEND_URL=https://budgetapp-frontend.onrender.com
```

Y actualizar `backend/app/main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware
import os

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Base de datos se pierde
- Verificar que el disco esté montado en `/opt/render/project/src/data`
- El plan free mantiene datos mientras el servicio exista
- Hacer backups periódicos (ver sección Backups)

### 💾 Backups de Base de Datos

#### Manual via Dashboard
1. Dashboard → budgetapp-backend → **"Shell"**
2. Ejecutar:
   ```bash
   cd data
   ls -lh budget.db
   cat budget.db | base64
   ```
3. Copiar output y decodificar localmente

#### Automático con Script
Crear Cron Job separado:
```bash
# Comando
curl -X GET https://budgetapp-backend.onrender.com/api/backup > backup.db

# Schedule: 0 2 * * * (diario a las 2 AM)
```

Agregar endpoint en `backend/app/main.py`:
```python
@app.get("/api/backup")
async def backup_database():
    """Download database backup"""
    db_path = "data/budget.db"
    return FileResponse(db_path, filename="budget_backup.db")
```

### 🚀 Upgrade a Plan Paid (Opcional)

**Starter Plan ($7/mes por servicio)**:
- Sin sleep (24/7 activo)
- 512 MB RAM
- 0.5 CPU
- Mejor para producción

**Standard Plan ($25/mes por servicio)**:
- 2 GB RAM
- 1 CPU
- Autoescalado
- Métricas avanzadas

### 📱 Notificaciones

Configurar alertas en Discord/Slack:
1. Dashboard → Service → Settings → **"Notifications"**
2. Conectar webhook
3. Recibir alertas de:
   - Deploy exitoso
   - Deploy fallido
   - Health check fail
   - Servicio reiniciado

### 🔐 Seguridad

#### Variables de Entorno Sensibles
Usar Render Secrets:
```
Dashboard → Service → Environment → Add Secret File
```

#### SSL/TLS
- Automático para dominios `.onrender.com`
- Automático para custom domains (Let's Encrypt)
- Renovación automática

#### Headers de Seguridad
Ya configurados en `render.yaml`:
```yaml
headers:
  - path: /*
    name: X-Frame-Options
    value: DENY
  - path: /*
    name: X-Content-Type-Options
    value: nosniff
```

### 📊 Arquitectura en Render

```
┌─────────────────────────────────────────┐
│         Internet (HTTPS)                │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  Render CDN (Global)                    │
│  - SSL Termination                      │
│  - DDoS Protection                      │
└───────────────┬─────────────────────────┘
                │
       ┌────────┴─────────┐
       │                  │
       ▼                  ▼
┌─────────────┐  ┌──────────────────┐
│  Frontend   │  │  Backend         │
│  (Static)   │  │  (Web Service)   │
│  - React    │  │  - FastAPI       │
│  - Vite     │  │  - Uvicorn       │
│  - CDN      │  │  - Health checks │
└─────────────┘  └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │  Persistent Disk │
                 │  - budget.db     │
                 │  - 1 GB          │
                 └──────────────────┘
```

### ✅ Checklist de Deployment

Antes de desplegar:

- [ ] Código subido a GitHub
- [ ] `render.yaml` en root del repositorio
- [ ] `build.sh` tiene permisos de ejecución
- [ ] Variables de entorno configuradas
- [ ] Frontend `.env.render` apunta a `/api`
- [ ] Backend tiene endpoint `/api/health`
- [ ] Disco persistente configurado (1 GB)
- [ ] Rewrites configurados en frontend
- [ ] CORS habilitado en backend

Después de desplegar:

- [ ] Backend responde en `/api/health`
- [ ] Frontend carga correctamente
- [ ] API calls funcionan (check Network tab)
- [ ] Database persiste entre deploys
- [ ] Configurar Cron Job para keep-alive
- [ ] Agregar custom domain (opcional)
- [ ] Configurar notificaciones
- [ ] Documentar URLs en README

### 🆘 Soporte

**Render Documentation**:
- [Deploy FastAPI](https://render.com/docs/deploy-fastapi)
- [Deploy Vite](https://render.com/docs/deploy-vite)
- [Persistent Disks](https://render.com/docs/disks)
- [Blueprints](https://render.com/docs/blueprint-spec)

**Troubleshooting**:
1. Revisar logs en Dashboard
2. Verificar variables de entorno
3. Testear endpoints manualmente
4. Revisar [Render Status](https://status.render.com)
5. Contactar soporte en [Community Forum](https://community.render.com)

---

**¡Listo!** Tu aplicación estará corriendo en:
- 🌐 `https://budgetapp-frontend.onrender.com`
- 🔧 `https://budgetapp-backend.onrender.com/docs`
