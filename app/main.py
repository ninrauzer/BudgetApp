"""
BudgetApp - Personal Budget Management Application
Main FastAPI application entry point.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Application metadata
APP_NAME = os.getenv("APP_NAME", "BudgetApp")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# Create FastAPI app
app = FastAPI(
    title=APP_NAME,
    description="Personal Budget Management Application - API First Architecture",
    version=APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure CORS
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Setup templates
templates = Jinja2Templates(directory="app/templates")


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint to verify API is running.
    """
    return JSONResponse(
        content={
            "status": "ok",
            "version": APP_VERSION,
            "database": "connected",
            "app": APP_NAME,
        }
    )


# Root endpoint - Frontend
@app.get("/", response_class=HTMLResponse, tags=["Frontend"])
async def root(request: Request):
    """
    Main frontend dashboard page.
    """
    return templates.TemplateResponse("dashboard.html", {"request": request})


# Transactions page
@app.get("/transactions", response_class=HTMLResponse, tags=["Frontend"])
async def transactions_page(request: Request):
    """
    Transactions management page.
    """
    return templates.TemplateResponse("transactions.html", {"request": request})


# Budget page
@app.get("/budget", response_class=HTMLResponse, tags=["Frontend"])
async def budget_page(request: Request):
    """
    Budget planning page.
    """
    return templates.TemplateResponse("budget.html", {"request": request})


# Analysis page
@app.get("/analysis", response_class=HTMLResponse, tags=["Frontend"])
async def analysis_page(request: Request):
    """
    Budget analysis page - Compare planned vs actual spending.
    """
    return templates.TemplateResponse("analysis.html", {"request": request})


# Settings page
@app.get("/settings", response_class=HTMLResponse, tags=["Frontend"])
async def settings_page(request: Request):
    """
    Settings and preferences page.
    """
    return templates.TemplateResponse("settings.html", {"request": request})


# API info endpoint
@app.get("/api", tags=["Root"])
async def api_info():
    """
    API information endpoint.
    """
    return JSONResponse(
        content={
            "message": f"Welcome to {APP_NAME} API",
            "version": APP_VERSION,
            "docs": "/docs",
            "redoc": "/redoc",
            "health": "/health",
        }
    )


# Import and include routers
from app.api import categories, accounts, transactions, budget_plans, dashboard, frontend, exchange_rate, import_data, data_management

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
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=DEBUG,
    )
