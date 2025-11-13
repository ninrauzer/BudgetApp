"""
Legacy HTMX Frontend Server
Servidor temporal para probar el frontend HTMX que está en /legacy
"""

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Agregar el directorio backend al path para imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Create FastAPI app
app = FastAPI(
    title="BudgetApp Legacy Frontend",
    description="Servidor temporal para el frontend HTMX (legacy)",
    version="1.0.0-legacy",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files desde legacy
app.mount("/static", StaticFiles(directory="../legacy/static"), name="static")

# Setup templates desde legacy
templates = Jinja2Templates(directory="../legacy/templates")


# Frontend Routes
@app.get("/", response_class=HTMLResponse, tags=["Frontend"])
async def root(request: Request):
    """Dashboard principal"""
    return templates.TemplateResponse("dashboard.html", {"request": request})


@app.get("/transactions", response_class=HTMLResponse, tags=["Frontend"])
async def transactions_page(request: Request):
    """Página de transacciones"""
    return templates.TemplateResponse("transactions.html", {"request": request})


@app.get("/budget", response_class=HTMLResponse, tags=["Frontend"])
async def budget_page(request: Request):
    """Página de presupuesto"""
    return templates.TemplateResponse("budget.html", {"request": request})


@app.get("/analysis", response_class=HTMLResponse, tags=["Frontend"])
async def analysis_page(request: Request):
    """Página de análisis"""
    return templates.TemplateResponse("analysis.html", {"request": request})


@app.get("/settings", response_class=HTMLResponse, tags=["Frontend"])
async def settings_page(request: Request):
    """Página de configuración"""
    return templates.TemplateResponse("settings.html", {"request": request})


# Import API routers AFTER defining frontend routes
from app.api import (
    categories, 
    accounts, 
    transactions, 
    budget_plans, 
    dashboard, 
    frontend, 
    exchange_rate, 
    import_data, 
    data_management
)

app.include_router(categories.router)
app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(budget_plans.router)
app.include_router(dashboard.router)
app.include_router(exchange_rate.router)
app.include_router(import_data.router)
app.include_router(data_management.router)
app.include_router(frontend.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "legacy_server:app",
        host="127.0.0.1",
        port=8001,
        reload=True,
    )
