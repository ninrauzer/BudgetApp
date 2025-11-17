# Deployment Options

## 🚀 Render.com (Production - Recommended)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**Quick Deploy**:
1. Push to GitHub: `git push origin master`
2. Connect repository in [Render Dashboard](https://dashboard.render.com/)
3. Render auto-detects `render.yaml`
4. Deploy completes in ~10 minutes

**Live URLs**:
- Frontend: https://budgetapp-frontend.onrender.com
- Backend: https://budgetapp-backend.onrender.com
- API Docs: https://budgetapp-backend.onrender.com/docs

📖 **Complete guide**: See [RENDER.md](RENDER.md)

---

## 🐳 Docker (Local/Self-Hosted)

```bash
# Quick start
docker compose up -d

# Access application
# Frontend: http://localhost
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

📖 **Complete guide**: See [DOCKER.md](DOCKER.md)

---

## 💻 Local Development

### Backend (Python 3.12+)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend (Node 20+)
```bash
cd frontend
npm install
npm run dev
```
