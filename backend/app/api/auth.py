"""
Authentication Router
Handles Google OAuth flow and JWT token generation
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, Body
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.database import get_db
from app.oauth import oauth, create_access_token, get_or_create_user, get_current_user
from app.models.user import User, AllowedUser

router = APIRouter(prefix="/auth", tags=["Authentication"])


class GoogleTokenRequest(BaseModel):
    """Request body for Google token verification"""
    credential: str


@router.get("/google/login")
async def google_login(request: Request):
    """
    Initiate Google OAuth flow.
    Redirects user to Google login page.
    """
    if not oauth._clients.get('google'):
        raise HTTPException(
            status_code=500,
            detail="Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
        )
    
    redirect_uri = request.url_for('google_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """
    Google OAuth callback (for redirect flow).
    Exchanges code for token, creates/updates user, returns JWT.
    """
    if not oauth._clients.get('google'):
        raise HTTPException(
            status_code=500,
            detail="Google OAuth not configured"
        )
    
    try:
        # Get access token from Google
        token = await oauth.google.authorize_access_token(request)
        
        # Get user info from Google
        user_info = token.get('userinfo')
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")
        
        # Extract user data
        email = user_info.get('email')
        name = user_info.get('name')
        picture = user_info.get('picture')
        google_id = user_info.get('sub')
        
        if not email or not google_id:
            raise HTTPException(status_code=400, detail="Invalid user data from Google")
        
        # Get or create user in database
        user = get_or_create_user(
            db=db,
            email=email,
            name=name or email.split('@')[0],
            picture=picture or '',
            provider='google',
            provider_id=google_id
        )
        
        # Create JWT token
        access_token = create_access_token(data={"sub": user.id, "email": user.email})
        
        # Redirect to frontend with token
        frontend_url = request.url_for('root')  # Will be configured per environment
        return RedirectResponse(
            url=f"{frontend_url}?token={access_token}"
        )
        
    except Exception as e:
        print(f"[auth] Google callback error: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Authentication failed: {str(e)}"
        )


@router.post("/google/callback")
async def google_token_login(
    token_data: GoogleTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Google Sign-In with credential (for frontend button).
    Verifies Google ID token and returns JWT.
    """
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        import os
        
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            token_data.credential,
            google_requests.Request(),
            os.getenv('GOOGLE_CLIENT_ID')
        )
        
        # Extract user info
        email = idinfo.get('email')
        name = idinfo.get('name')
        picture = idinfo.get('picture')
        google_id = idinfo.get('sub')
        
        if not email or not google_id:
            raise HTTPException(status_code=400, detail="Invalid token data")
        
        # 🔐 SECURITY CHECK: Verify user is in whitelist
        allowed_user = db.query(AllowedUser).filter(
            AllowedUser.email == email,
            AllowedUser.is_active == True
        ).first()
        
        if not allowed_user:
            print(f"[auth] ❌ Unauthorized access attempt: {email}")
            raise HTTPException(
                status_code=403,
                detail="Acceso denegado. Tu cuenta no está autorizada. Contacta al administrador."
            )
        
        print(f"[auth] ✅ Authorized user: {email}")
        
        # Get or create user
        user = get_or_create_user(
            db=db,
            email=email,
            name=name or email.split('@')[0],
            picture=picture or '',
            provider='google',
            provider_id=google_id
        )
        
        # Create JWT token - sub must be string
        access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "picture": user.picture,
                "is_demo": user.is_demo,
                "is_admin": user.is_admin
            }
        }
        
    except ValueError as e:
        # Invalid token
        print(f"[auth] Token verification error: {e}")
        raise HTTPException(status_code=401, detail="Invalid Google token")
    except Exception as e:
        print(f"[auth] Google token login error: {e}")
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")


@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user info.
    Requires valid JWT token.
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "picture": current_user.picture,
        "provider": current_user.provider,
        "is_demo": current_user.is_demo,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "last_login": current_user.last_login.isoformat() if current_user.last_login else None,
    }


@router.post("/demo")
async def create_demo_session(db: Session = Depends(get_db)):
    """
    Create a demo session without authentication.
    Generates a temporary JWT for demo mode.
    """
    # Create or get demo user
    demo_user = db.query(User).filter(User.email == "demo@budgetapp.local").first()
    
    if not demo_user:
        demo_user = User(
            email="demo@budgetapp.local",
            name="Demo User",
            picture="",
            provider="demo",
            provider_id="demo",
            is_demo=True,
            created_at=datetime.utcnow()
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
    
    # Create JWT token - sub must be string
    access_token = create_access_token(data={"sub": str(demo_user.id), "email": demo_user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": demo_user.email,
            "name": demo_user.name,
            "is_demo": True,
            "is_admin": False
        }
    }


@router.post("/logout")
async def logout():
    """
    Logout endpoint.
    Client should delete the JWT token.
    """
    return {"message": "Logged out successfully"}


@router.post("/init-demo-db")
async def init_demo_database():
    """
    Initialize demo database with all required tables.
    TEMPORARY ENDPOINT - Should be removed after initial setup.
    """
    try:
        from sqlalchemy import create_engine
        from app.db.session_manager import Base
        import os
        
        demo_url = os.getenv("DEMO_DATABASE_URL")
        if not demo_url:
            return {"error": "DEMO_DATABASE_URL not configured"}
        
        # Create engine for demo DB
        demo_engine = create_engine(demo_url)
        
        # Create all tables
        Base.metadata.create_all(bind=demo_engine)
        
        return {
            "success": True,
            "message": "Demo database tables created successfully",
            "tables": [table.name for table in Base.metadata.sorted_tables]
        }
    except Exception as e:
        return {"error": str(e)}


@router.post("/init-demo-db")
async def init_demo_database():
    """
    Initialize demo database with tables and sample data.
    This should be called once after deploying to create demo database structure.
    """
    import os
    from sqlalchemy import create_engine, text
    from datetime import datetime, timedelta
    import random
    
    DEMO_DATABASE_URL = os.getenv("DEMO_DATABASE_URL")
    if not DEMO_DATABASE_URL:
        return {"error": "DEMO_DATABASE_URL not configured"}
    
    try:
        engine = create_engine(DEMO_DATABASE_URL)
        
        with engine.connect() as conn:
            # Create tables (simplified version)
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    name VARCHAR(255),
                    picture VARCHAR(500),
                    provider VARCHAR(50) NOT NULL,
                    provider_id VARCHAR(255) UNIQUE NOT NULL,
                    is_demo BOOLEAN DEFAULT FALSE,
                    is_admin BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS categories (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    icon VARCHAR(50),
                    type VARCHAR(20) NOT NULL,
                    color VARCHAR(20),
                    expense_type VARCHAR(20),
                    user_id INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS accounts (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    type VARCHAR(50) NOT NULL,
                    balance DECIMAL(15,2) DEFAULT 0,
                    currency VARCHAR(10) DEFAULT 'PEN',
                    user_id INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS billing_cycle (
                    id SERIAL PRIMARY KEY,
                    start_date DATE NOT NULL,
                    end_date DATE NOT NULL,
                    start_day INTEGER NOT NULL,
                    user_id INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS transactions (
                    id SERIAL PRIMARY KEY,
                    description VARCHAR(500) NOT NULL,
                    amount DECIMAL(15,2) NOT NULL,
                    date DATE NOT NULL,
                    type VARCHAR(20) NOT NULL,
                    category_id INTEGER,
                    account_id INTEGER,
                    user_id INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))
            conn.commit()
            
            # Check if demo data already exists
            result = conn.execute(text("SELECT COUNT(*) FROM users WHERE email = 'demo@budgetapp.local'"))
            if result.scalar() > 0:
                return {"message": "Demo database already initialized"}
            
            # Insert demo user
            conn.execute(text("""
                INSERT INTO users (email, name, picture, provider, provider_id, is_demo, is_admin)
                VALUES ('demo@budgetapp.local', 'Demo User', '', 'demo', 'demo', TRUE, FALSE)
            """))
            conn.commit()
            
            # Insert categories
            categories = [
                ("Salario", "Briefcase", "income", "#10B981", None),
                ("Freelance", "Laptop", "income", "#34D399", None),
                ("Supermercado", "ShoppingCart", "expense", "#EF4444", "variable"),
                ("Restaurantes", "UtensilsCrossed", "expense", "#F97316", "variable"),
                ("Transporte", "Car", "expense", "#F59E0B", "variable"),
                ("Alquiler", "Home", "expense", "#DC2626", "fixed"),
                ("Servicios", "Zap", "expense", "#7C3AED", "fixed"),
                ("Entretenimiento", "Tv", "expense", "#EC4899", "variable"),
                ("Salud", "Heart", "expense", "#EF4444", "variable"),
                ("Educación", "GraduationCap", "expense", "#3B82F6", "variable"),
            ]
            
            for cat in categories:
                conn.execute(text("""
                    INSERT INTO categories (name, icon, type, color, expense_type, user_id)
                    VALUES (:name, :icon, :type, :color, :expense_type, 1)
                """), {"name": cat[0], "icon": cat[1], "type": cat[2], "color": cat[3], "expense_type": cat[4]})
            conn.commit()
            
            # Insert accounts
            accounts = [
                ("Efectivo", "cash", 1500.00, "PEN"),
                ("Banco Nacional", "bank", 8500.00, "PEN"),
                ("Ahorros USD", "savings", 2000.00, "USD"),
            ]
            
            for acc in accounts:
                conn.execute(text("""
                    INSERT INTO accounts (name, type, balance, currency, user_id)
                    VALUES (:name, :type, :balance, :currency, 1)
                """), {"name": acc[0], "type": acc[1], "balance": acc[2], "currency": acc[3]})
            conn.commit()
            
            # Insert billing cycles
            today = datetime.now()
            start_date = datetime(today.year, today.month, 23)
            if today.day < 23:
                start_date = datetime(today.year, today.month - 1, 23)
            
            for i in range(-1, 2):
                cycle_start = start_date + timedelta(days=30*i)
                cycle_end = cycle_start + timedelta(days=29)
                conn.execute(text("""
                    INSERT INTO billing_cycle (start_date, end_date, start_day, user_id)
                    VALUES (:start_date, :end_date, 23, 1)
                """), {"start_date": cycle_start.date(), "end_date": cycle_end.date()})
            conn.commit()
            
            # Insert 50 sample transactions
            expense_categories = [3, 4, 5, 6, 7, 8, 9, 10]  # IDs of expense categories
            income_categories = [1, 2]  # IDs of income categories
            
            for i in range(50):
                days_ago = random.randint(0, 90)
                trans_date = today - timedelta(days=days_ago)
                
                is_income = random.random() < 0.2  # 20% income, 80% expense
                
                if is_income:
                    cat_id = random.choice(income_categories)
                    amount = random.uniform(1000, 5000)
                    trans_type = "income"
                else:
                    cat_id = random.choice(expense_categories)
                    amount = random.uniform(10, 500)
                    trans_type = "expense"
                
                account_id = random.choice([1, 2, 3])
                
                conn.execute(text("""
                    INSERT INTO transactions (description, amount, date, type, category_id, account_id, user_id)
                    VALUES (:desc, :amount, :date, :type, :cat_id, :acc_id, 1)
                """), {
                    "desc": f"Demo {trans_type} {i+1}",
                    "amount": round(amount, 2),
                    "date": trans_date.date(),
                    "type": trans_type,
                    "cat_id": cat_id,
                    "acc_id": account_id
                })
            conn.commit()
            
        return {
            "message": "Demo database initialized successfully",
            "tables_created": 5,
            "demo_transactions": 50
        }
        
    except Exception as e:
        return {"error": str(e)}
