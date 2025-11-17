# ✅ Render.com Deployment Checklist

## Pre-Deployment

- [x] `render.yaml` creado (Blueprint configuration)
- [x] `build.sh` creado (Backend build script)
- [x] `.renderignore` creado (Exclude unnecessary files)
- [x] `frontend/.env.render` creado (Production API URL)
- [x] `backend/app/main.py` actualizado (CORS para Render)
- [x] `/api/health` endpoint disponible (Health checks)
- [x] RENDER.md documentación completa
- [x] QUICKSTART_RENDER.md guía rápida

## Archivos Clave

```
BudgetApp/
├── render.yaml                 # Blueprint (Render auto-detect)
├── build.sh                    # Backend build script
├── .renderignore               # Files to ignore
├── RENDER.md                   # Documentation
├── QUICKSTART_RENDER.md        # Quick guide
│
├── backend/
│   ├── requirements.txt        # Python dependencies
│   ├── app/main.py            # FastAPI app (CORS configured)
│   └── scripts/init_db.py     # Database initialization
│
└── frontend/
    ├── .env.render            # Production config
    ├── package.json           # Node dependencies
    └── vite.config.ts         # Build config
```

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "feat: add Render.com deployment"
git push origin master
```

### 2. Create Blueprint in Render
1. Go to https://dashboard.render.com/
2. Click "New +" → "Blueprint"
3. Connect `ninrauzer/BudgetApp` repository
4. Render auto-detects `render.yaml`
5. Click "Apply"

### 3. Wait for Deploy (~10 minutes)
- Backend: ~5-7 minutes
- Frontend: ~3-5 minutes

### 4. Verify Deployment
```bash
# Test backend
curl https://budgetapp-backend.onrender.com/api/health

# Test frontend (open in browser)
https://budgetapp-frontend.onrender.com
```

## Expected Services

### Backend (Web Service)
```yaml
Name: budgetapp-backend
Runtime: Python 3.11
Port: $PORT (assigned by Render)
Build: pip install -r requirements.txt
Start: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Disk: 1GB at /opt/render/project/src/data
Health: /api/health every 30s
```

### Frontend (Static Site)
```yaml
Name: budgetapp-frontend
Runtime: Static (Node 20)
Build: cd frontend && npm ci && npm run build
Publish: frontend/dist
Routes:
  - /api/* → backend
  - /* → index.html (SPA)
```

## Post-Deployment

### Optional: Keep-Alive Cron Job
Evita que el backend duerma (plan free):

1. New → Cron Job
2. Command: `curl https://budgetapp-backend.onrender.com/api/health`
3. Schedule: `*/14 * * * *` (every 14 minutes)

### Optional: Custom Domain
1. Frontend → Settings → Custom Domain
2. Add: `www.yourdomain.com`
3. Configure DNS as instructed
4. SSL automatic (Let's Encrypt)

### Optional: Environment Variables
Backend additional configs:
```
FRONTEND_URL=https://budgetapp-frontend.onrender.com
LOG_LEVEL=warning
DEBUG=False
```

## URLs

After deployment:

- 🌐 Frontend: https://budgetapp-frontend.onrender.com
- 🔧 Backend: https://budgetapp-backend.onrender.com
- 📚 API Docs: https://budgetapp-backend.onrender.com/docs
- ❤️ Health: https://budgetapp-backend.onrender.com/api/health

## Monitoring

### Logs
```
Dashboard → Service → Logs (live streaming)
```

### Metrics
- CPU Usage
- Memory Usage
- Request Count
- Response Times

### Alerts
Configure in: Dashboard → Service → Settings → Notifications

## Common Issues

### ❌ Backend fails to start
**Check**: Disk is mounted at `/opt/render/project/src/data`
**Fix**: Dashboard → Service → Settings → Disks → Add Disk

### ❌ Frontend 404 on routes
**Check**: Rewrites configured
**Fix**: Add `/* → /index.html 200` in Redirects/Rewrites

### ❌ API calls fail (CORS)
**Check**: CORS origins in backend
**Fix**: Add `FRONTEND_URL` environment variable

### ❌ Database not persisting
**Check**: Disk mounted correctly
**Fix**: Verify mount path is `/opt/render/project/src/data`

## Free Plan Limits

### Backend (Web Service)
- ✅ 750 hours/month (enough for 24/7)
- ⚠️ Sleeps after 15 min inactivity
- ⏱️ Wakes in ~30 seconds
- 💾 512 MB RAM
- 🖥️ 0.1 CPU
- 💿 1 GB disk

### Frontend (Static Site)
- ✅ 100 GB bandwidth/month
- ✅ Global CDN
- ✅ SSL automatic
- ✅ No sleep

## Next Steps

1. [ ] Test all functionality
2. [ ] Configure Cron Job (keep-alive)
3. [ ] Setup custom domain (optional)
4. [ ] Configure notifications
5. [ ] Document production URLs
6. [ ] Update README.md with live links
7. [ ] Share with users!

## Documentation

- 📖 [RENDER.md](RENDER.md) - Complete Render guide
- 📖 [QUICKSTART_RENDER.md](QUICKSTART_RENDER.md) - Quick start
- 📖 [DOCKER.md](DOCKER.md) - Docker alternative
- 📖 [DEPLOYMENT.md](DEPLOYMENT.md) - All deployment options

---

**Status**: ✅ Ready to deploy!

**Command**:
```bash
git push origin master
# Then: Create Blueprint in Render Dashboard
```
