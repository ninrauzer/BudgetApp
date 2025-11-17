# Template de Sesión - BudgetApp

## 📋 Checklist Inicial
- [ ] Revisar PROJECT_INFO.md para rutas y comandos
- [ ] Revisar VISUAL_IMPROVEMENTS.md para estilo consistente
- [ ] Verificar servidores:
  - Frontend: http://localhost:5173 o 5174
  - Backend: http://localhost:8000

## 🗂️ Rutas Críticas
```
Frontend: E:\Desarrollo\BudgetApp\frontend
Backend:  E:\Desarrollo\BudgetApp\backend
BD:       E:\Desarrollo\BudgetApp\backend\budget_app.db
```

## 🎨 Estilo a Mantener
- Glass design con backdrop-blur-md
- Colores: emerald (ingresos), rose/pink (gastos)
- Bordes: rounded-2xl
- Hover: -translate-y-1

## 🚀 Comandos Frecuentes
```bash
# Frontend
cd E:\Desarrollo\BudgetApp\frontend && npm run dev

# Backend  
cd E:\Desarrollo\BudgetApp\backend && .\.venv\Scripts\Activate.ps1; python -m uvicorn app.main:app --reload

# Build
cd E:\Desarrollo\BudgetApp\frontend && npm run build
```