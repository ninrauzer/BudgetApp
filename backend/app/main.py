"""
BudgetApp - Personal Budget Management Application
Main FastAPI application entry point.
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path
from dotenv import load_dotenv

# Import OAuth authentication (NEW - replaces HTTP Basic gradually)
from app.oauth import get_current_user

# Import Demo Context Middleware
from app.middleware.demo_context import DemoContextMiddleware

# Load environment variables from .env file in the backend directory
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

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
    redirect_slashes=False,  # Allow both /credit-cards and /credit-cards/
)

# Configure CORS (Allow React dev server and production)
# Default local origins
default_origins = "http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:8000,http://localhost"

# Add Render.com frontend if deployed
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    default_origins += f",{frontend_url},https://budgetapp-frontend.onrender.com"

origins = os.getenv("ALLOWED_ORIGINS", default_origins).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Demo Context Middleware (detects demo users and switches database)
app.add_middleware(DemoContextMiddleware)


# Environment debug endpoint (always shows environment info)
@app.get("/api/env-debug", tags=["Debug"])
async def env_debug():
    """
    Debug endpoint to see what environment variables are loaded.
    """
    db_url = os.getenv("DATABASE_URL", "")
    debug_mode = os.getenv("DEBUG", "false")
    app_name = os.getenv("APP_NAME", "")
    
    return JSONResponse(
        content={
            "DATABASE_URL": db_url,
            "DEBUG": debug_mode,
            "APP_NAME": app_name,
            "DEBUG_FLAG": DEBUG,
            "env_path_checked": str(Path(__file__).parent.parent / ".env"),
        }
    )


# Health check endpoint (NO AUTH REQUIRED - used by Docker healthcheck)
@app.get("/api/health", tags=["Health"])
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint to verify API is running.
    Available at both /health and /api/health for Docker compatibility.
    NO AUTHENTICATION REQUIRED.
    """
    # For local development, always return development
    # Production will be detected by DATABASE_URL in Docker container
    
    db_url = os.getenv("DATABASE_URL", "").lower()
    
    # If DATABASE_URL contains prod, it's production
    if "budgetapp_prod" in db_url:
        environment = "production"
    else:
        # Everything else is development (local, dev db, sqlite, etc)
        environment = "development"
    
    return JSONResponse(
        content={
            "status": "ok",
            "version": APP_VERSION,
            "database": "connected",
            "app": APP_NAME,
            "environment": environment,
        }
    )

# Import and include routers
from app.api import (
    auth,  # OAuth authentication (NEW)
    admin,  # Admin API for user management (NEW)
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
    analysis,
    transfers,
    loans,
    credit_cards
)

# Auth routes (no authentication required)
app.include_router(auth.router, prefix="/api")

# Admin routes (requires admin privileges)
app.include_router(admin.router)

# Include all routers with authentication dependency
# NOTE: Authentication now supports both OAuth JWT and HTTP Basic (fallback)
auth_dependency = [Depends(get_current_user)]

app.include_router(categories.router, prefix="/api", dependencies=auth_dependency)
app.include_router(accounts.router, prefix="/api", dependencies=auth_dependency)
app.include_router(transactions.router, prefix="/api", dependencies=auth_dependency)
app.include_router(transfers.router, prefix="/api", dependencies=auth_dependency)
app.include_router(budget_plans.router, prefix="/api", dependencies=auth_dependency)
app.include_router(dashboard.router, prefix="/api", dependencies=auth_dependency)
app.include_router(exchange_rate.router, prefix="/api", dependencies=auth_dependency)
app.include_router(import_data.router, prefix="/api", dependencies=auth_dependency)
app.include_router(data_management.router, prefix="/api", dependencies=auth_dependency)
app.include_router(quick_templates.router, prefix="/api", dependencies=auth_dependency)
app.include_router(billing_cycle.router, prefix="/api", dependencies=auth_dependency)
app.include_router(analysis.router, prefix="/api", dependencies=auth_dependency)
app.include_router(loans.router, prefix="/api", dependencies=auth_dependency)  # Debt management
app.include_router(credit_cards.router, prefix="/api", dependencies=auth_dependency)  # Credit card management (ADR-004)
app.include_router(frontend.router)  # Keep for legacy HTMX if needed


from fastapi.staticfiles import StaticFiles

# Safe static mounting: only mount first existing candidate to prevent runtime crash
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
STATIC_CANDIDATES = [
    os.path.join(os.path.dirname(__file__), 'static'),                 # backend/app/static
    os.path.join(PROJECT_ROOT, 'frontend', 'dist'),                    # vite build output
    os.path.join(PROJECT_ROOT, 'frontend', 'public'),                  # public assets
    os.path.join(PROJECT_ROOT, 'app', 'static'),                       # legacy root/app/static
]

for static_dir in STATIC_CANDIDATES:
    if os.path.isdir(static_dir):
        try:
            app.mount('/static', StaticFiles(directory=static_dir), name='static')
            if DEBUG:
                print(f"[static] Mounted from {static_dir}")
        except Exception as e:
            if DEBUG:
                print(f"[static] Failed to mount {static_dir}: {e}")
        break
else:
    if DEBUG:
        print(f"[static] No static directory found. Candidates: {STATIC_CANDIDATES}")


# Startup event: Fix database sequences
@app.on_event("startup")
async def startup_event():
    """
    Fix database sequences on application startup.
    This prevents duplicate key errors when inserting records.
    """
    try:
        from app.db.database import SessionLocal
        from app.db.fix_sequences import fix_all_sequences
        
        db = SessionLocal()
        try:
            results = fix_all_sequences(db)
            if DEBUG:
                print("[startup] Database sequences fixed")
                for result in results:
                    if result['status'] == 'fixed':
                        print(f"  - {result['table']}: max_id={result['max_id']}, next_id={result['next_id']}")
        finally:
            db.close()
    except Exception as e:
        print(f"[startup] Warning: Could not fix sequences: {e}")


# Mount static files (frontend) - must be AFTER all API routes
static_path = Path(__file__).parent.parent.parent / "frontend" / "dist"
if static_path.exists():
    app.mount("/", StaticFiles(directory=str(static_path), html=True), name="static")
    print(f"[static] Mounted from {static_path}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=DEBUG,
    )
