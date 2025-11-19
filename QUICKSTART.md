# 🚀 BudgetApp - Guía Rápida

## ⚡ 30 Segundos

```bash
# 1. Clonar
git clone https://github.com/ninrauzer/BudgetApp.git
cd BudgetApp

# 2. Setup local
cd frontend && npm install
cd ../backend && python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt

# 3. Desarrollo
# Terminal 1
cd frontend && npm run dev
# Terminal 2
cd backend && .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload

# URLs
# Frontend: http://localhost:5173
# Backend API Docs: http://localhost:8000/docs
```

---

## 📚 Documentación

| Necesito | Archivo |
|----------|---------|
| Empezar | `README.md` |
| Entender todo | `.github/instructions/Project Info.instructions.md` |
| Desplegar | `RENDER.md` |
| Scripts | `backend/README_SCRIPTS.md` |
| Arquitectura | `docs/adr/` |
| Estado del proyecto | `FINAL_STATUS.md` |

---

## 🗂️ Estructura

```
frontend/      React + TypeScript + Vite
backend/       FastAPI + SQLAlchemy + PostgreSQL
docs/          Architecture Decision Records (ADR)
render.yaml    Blueprint para Render.com
compose.yml    Stack Docker local
```

---

## 🔧 Configuración

```
backend/.env         Desarrollo local (PostgreSQL WSL)
root/.env           Docker (PostgreSQL WSL)
```

---

## 💾 Base de Datos

```
Host:     192.168.126.127:5432
User:     postgres
Password: postgres

budgetapp_dev    Desarrollo (libre de modificar)
budgetapp_prod   Testing Docker (producción-like)
```

---

## 📊 Sincronizar BD

```bash
# Copiar dev → prod
cd backend
.\.venv\Scripts\python.exe copy_dev_to_prod.py
```

---

## 🐳 Docker Local

```bash
# Iniciar servicios
docker compose up -d

# Ver logs en tiempo real
docker compose logs -f

# Detener servicios
docker compose down

# Reiniciar servicios
docker compose restart

# Limpiar todo (⚠️ elimina datos)
docker compose down -v

# URLs
# Frontend: http://192.168.126.127:8080
# Backend: http://192.168.126.127:8000/docs
# Base de datos: budgetapp_prod
```

---

## 🚀 Render.com (Cloud)

```bash
# Solo push a GitHub
git push origin master

# Render.com despliega automáticamente
# URLs
# Frontend: https://budgetapp-frontend.onrender.com
# Backend: https://budgetapp-backend.onrender.com/docs
```

---

## 🎯 Flujo de Trabajo

```
1. Desarrollar en local
   └─ frontend: http://localhost:5173
   └─ backend: http://localhost:8000/docs
   └─ bd: budgetapp_dev

2. Testing local (opcional)
   └─ Sincronizar: copy_dev_to_prod.py
   └─ docker compose up
   └─ Verificar: http://192.168.126.127:8080

3. Producción
   └─ git push origin master
   └─ Render.com despliega automáticamente
```

---

## ✨ Stack

**Frontend**
- React 18
- TypeScript
- Vite 7
- Tailwind CSS 3
- TanStack Query
- Recharts

**Backend**
- FastAPI
- SQLAlchemy
- PostgreSQL
- Uvicorn

**DevOps**
- Docker Compose
- Render.com Blueprint
- GitHub Actions (futuro)

---

## 📞 Comandos Útiles

```bash
# Ver logs
docker compose logs -f

# Detener todo
docker compose down

# Reset de BD dev
# (Conectar directo a PostgreSQL y recrear)

# Ver status
docker ps
```

---

## 🎓 Aprender Más

```
¿Cómo funciona X?
→ .github/instructions/Project Info.instructions.md

¿Por qué Y?
→ docs/adr/

¿Cómo se ve Z?
→ .github/instructions/Project Info.instructions.md (GUIA VISUAL)
```

---

**Última actualización**: 19 Nov 2025
**Estado**: ✅ Listo para producción
**Bugs**: Reportar en GitHub Issues
