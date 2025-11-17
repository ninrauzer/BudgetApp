# 🚀 Despliegue Rápido a Render.com

## Pasos Rápidos

### 1️⃣ Preparar Código
```bash
# Asegúrate de estar en master
git checkout master

# Commit todos los cambios
git add .
git commit -m "feat: add Render.com deployment"

# Push a GitHub
git push origin master
```

### 2️⃣ Crear Servicios en Render

#### Opción A: Blueprint (Automático - Recomendado)
1. Ve a https://dashboard.render.com/
2. Click **"New +"** → **"Blueprint"**
3. Conecta repositorio `ninrauzer/BudgetApp`
4. Render detecta `render.yaml` automáticamente
5. Click **"Apply"**
6. ✅ Listo! Espera ~10 minutos

#### Opción B: Manual (Más Control)

**Backend**:
1. New → Web Service
2. Connect GitHub `ninrauzer/BudgetApp`
3. Configuración:
   ```
   Name: budgetapp-backend
   Runtime: Python 3
   Build: chmod +x build.sh && ./build.sh
   Start: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
4. Environment:
   ```
   PYTHON_VERSION=3.11.0
   DATABASE_URL=sqlite:///./data/budget.db
   PYTHONUNBUFFERED=1
   ```
5. Add Disk:
   - Name: `budgetapp-data`
   - Mount: `/opt/render/project/src/data`
   - Size: 1 GB

**Frontend**:
1. New → Static Site
2. Connect GitHub `ninrauzer/BudgetApp`
3. Configuración:
   ```
   Name: budgetapp-frontend
   Build: cd frontend && npm ci && npm run build
   Publish: frontend/dist
   ```
4. Environment:
   ```
   VITE_API_URL=/api
   ```
5. Redirects/Rewrites:
   ```
   /api/*  https://budgetapp-backend.onrender.com/api/:splat  200
   /*      /index.html  200
   ```

### 3️⃣ Verificar Deployment

Espera a que ambos servicios estén **"Live"** (verde):

**Test Backend**:
```bash
curl https://budgetapp-backend.onrender.com/api/health
# Debe responder: {"status":"ok", ...}
```

**Test Frontend**:
Abre en navegador: https://budgetapp-frontend.onrender.com

### 4️⃣ Mantener Activo (Opcional)

El plan free duerme después de 15 min de inactividad.

**Solución: Cron Job**
1. New → Cron Job
2. Command: `curl https://budgetapp-backend.onrender.com/api/health`
3. Schedule: `*/14 * * * *` (cada 14 minutos)

---

## ✅ URLs Finales

Una vez desplegado:

- 🌐 **Frontend**: https://budgetapp-frontend.onrender.com
- 🔧 **Backend**: https://budgetapp-backend.onrender.com
- 📚 **API Docs**: https://budgetapp-backend.onrender.com/docs

---

## 🔄 Actualizar App

```bash
# Hacer cambios en código
git add .
git commit -m "feat: nueva funcionalidad"
git push origin master

# Render despliega automáticamente en ~5 minutos
```

---

## 🐛 Troubleshooting

### Backend no inicia
```bash
# Ver logs
Dashboard → budgetapp-backend → Logs

# Común: Falta disco persistente
Dashboard → budgetapp-backend → Settings → Disks → Add Disk
```

### Frontend error 404 en rutas
```bash
# Verificar rewrites
Dashboard → budgetapp-frontend → Redirects/Rewrites

# Debe tener:
/*  /index.html  200
```

### API calls fallan
```bash
# Verificar CORS
Dashboard → budgetapp-backend → Environment

# Agregar:
FRONTEND_URL=https://budgetapp-frontend.onrender.com
```

---

## 📖 Documentación Completa

- [RENDER.md](RENDER.md) - Guía detallada de Render.com
- [DOCKER.md](DOCKER.md) - Guía detallada de Docker
- [DEPLOYMENT.md](DEPLOYMENT.md) - Opciones de deployment

---

## 🆘 Soporte

- [Render Docs](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Render Status](https://status.render.com)
