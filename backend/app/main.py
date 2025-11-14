"""
BudgetApp - Personal Budget Management Application
Main FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Application metadata
APP_NAME = os.getenv("APP_NAME", "BudgetApp")
APP_VERSION = os.getenv("APP_VERSION", "2.0.0")  # Backend API v2
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# Create FastAPI app
app = FastAPI(
    title=f"{APP_NAME} API",
    description="Personal Budget Management Application - REST API for React Frontend",
    version=APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure CORS (Allow React dev server and production)
origins = os.getenv(
    "ALLOWED_ORIGINS", 
    "http://localhost:3000,http://localhost:5173,http://localhost:8000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


# API info endpoint (root)
@app.get("/", tags=["Root"])
async def root():
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
            "note": "This is a REST API. Frontend is served separately from /frontend",
        }
    )


# Import and include routers
from app.api import (
    categories, 
    accounts, 
    transactions, 
    budget_plans, 
    dashboard, 
    frontend, 
    exchange_rate, 
    import_data, 
    data_management,
    quick_templates,
    billing_cycle,
    analysis
)

app.include_router(categories.router)
app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(budget_plans.router)
app.include_router(dashboard.router)
app.include_router(exchange_rate.router)
app.include_router(import_data.router)
app.include_router(data_management.router)
app.include_router(quick_templates.router)
app.include_router(billing_cycle.router)
app.include_router(analysis.router)
app.include_router(frontend.router)  # Keep for legacy HTMX if needed


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=DEBUG,
    )
