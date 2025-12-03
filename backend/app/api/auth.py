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


@router.post("/reset-demo-db")
async def reset_demo_database():
    """RESET and populate demo database with complete sample data"""
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
            # Drop all tables and recreate
            conn.execute(text("DROP TABLE IF EXISTS transactions CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS billing_cycle CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS accounts CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS categories CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
            conn.commit()
            
            # Create users table
            conn.execute(text("""
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    name VARCHAR(255),
                    picture VARCHAR(500),
                    provider VARCHAR(50) NOT NULL,
                    provider_id VARCHAR(255) UNIQUE NOT NULL,
                    is_demo BOOLEAN DEFAULT FALSE,
                    is_admin BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            
            # Create categories table
            conn.execute(text("""
                CREATE TABLE categories (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    icon VARCHAR(50),
                    type VARCHAR(20) NOT NULL,
                    color VARCHAR(20),
                    expense_type VARCHAR(20)
                )
            """))
            
            # Create accounts table
            conn.execute(text("""
                CREATE TABLE accounts (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    type VARCHAR(50) NOT NULL,
                    balance DECIMAL(15,2) DEFAULT 0,
                    currency VARCHAR(10) DEFAULT 'PEN'
                )
            """))
            
            # Create billing_cycle table
            conn.execute(text("""
                CREATE TABLE billing_cycle (
                    id SERIAL PRIMARY KEY,
                    start_date DATE NOT NULL,
                    end_date DATE NOT NULL,
                    start_day INTEGER NOT NULL
                )
            """))
            
            # Create transactions table
            conn.execute(text("""
                CREATE TABLE transactions (
                    id SERIAL PRIMARY KEY,
                    date DATE NOT NULL,
                    category_id INTEGER REFERENCES categories(id),
                    account_id INTEGER REFERENCES accounts(id),
                    amount DECIMAL(15,2) NOT NULL,
                    currency VARCHAR(10) NOT NULL DEFAULT 'PEN',
                    exchange_rate DECIMAL(10,4),
                    amount_pen DECIMAL(15,2) NOT NULL,
                    type VARCHAR(20) NOT NULL,
                    description VARCHAR(500),
                    notes TEXT,
                    status VARCHAR(20) NOT NULL DEFAULT 'completed',
                    transaction_type VARCHAR(20) NOT NULL DEFAULT 'normal',
                    transfer_id VARCHAR(50),
                    related_transaction_id INTEGER REFERENCES transactions(id),
                    loan_id INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.commit()
            
            # Insert demo user
            conn.execute(text("""
                INSERT INTO users (email, name, provider, provider_id, is_demo)
                VALUES ('demo@budgetapp.local', 'Usuario Demo', 'demo', 'demo-001', TRUE)
            """))
            
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
                    INSERT INTO categories (name, icon, type, color, expense_type)
                    VALUES (:n, :i, :t, :c, :e)
                """), {"n": cat[0], "i": cat[1], "t": cat[2], "c": cat[3], "e": cat[4]})
            
            # Insert accounts
            accounts = [
                ("Efectivo", "cash", 1500.00, "PEN"),
                ("Banco Nacional", "bank", 8500.00, "PEN"),
                ("Ahorros USD", "savings", 2000.00, "USD"),
            ]
            for acc in accounts:
                conn.execute(text("""
                    INSERT INTO accounts (name, type, balance, currency)
                    VALUES (:n, :t, :b, :c)
                """), {"n": acc[0], "t": acc[1], "b": acc[2], "c": acc[3]})
            
            # Insert billing cycles
            today = datetime.now()
            start_date = datetime(today.year, today.month, 23)
            if today.day < 23:
                start_date = start_date.replace(month=today.month - 1 if today.month > 1 else 12)
                if today.month == 1:
                    start_date = start_date.replace(year=today.year - 1)
            
            for i in range(-2, 3):
                cycle_start = start_date + timedelta(days=30*i)
                cycle_end = cycle_start + timedelta(days=29)
                conn.execute(text("""
                    INSERT INTO billing_cycle (start_date, end_date, start_day)
                    VALUES (:s, :e, 23)
                """), {"s": cycle_start.date(), "e": cycle_end.date()})
            
            # Insert 50 sample transactions
            expense_cats = [3, 4, 5, 6, 7, 8, 9, 10]
            income_cats = [1, 2]
            
            for i in range(50):
                days_ago = random.randint(0, 90)
                trans_date = today - timedelta(days=days_ago)
                is_income = random.random() < 0.2
                
                if is_income:
                    cat_id = random.choice(income_cats)
                    amount = random.uniform(1000, 5000)
                    trans_type = "income"
                else:
                    cat_id = random.choice(expense_cats)
                    amount = random.uniform(10, 500)
                    trans_type = "expense"
                
                account_id = random.choice([1, 2, 3])
                
                conn.execute(text("""
                    INSERT INTO transactions (
                        description, amount, currency, exchange_rate, amount_pen, 
                        date, type, category_id, account_id, 
                        status, transaction_type
                    )
                    VALUES (:d, :a, 'PEN', 1.0, :a, :dt, :t, :c, :ac, 'completed', 'normal')
                """), {
                    "d": f"Demo {trans_type} #{i+1}",
                    "a": round(amount, 2),
                    "dt": trans_date.date(),
                    "t": trans_type,
                    "c": cat_id,
                    "ac": account_id
                })
            
            conn.commit()
            
        return {
            "success": True,
            "message": "Demo database reset and populated",
            "categories": 10,
            "accounts": 3,
            "billing_cycles": 5,
            "transactions": 50
        }
        
    except Exception as e:
        return {"error": str(e)}
