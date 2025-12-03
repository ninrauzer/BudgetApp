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
    """RESET and populate demo database with complete sample data using SQLAlchemy models"""
    import os
    from sqlalchemy import create_engine, text
    from sqlalchemy.orm import sessionmaker
    from datetime import datetime, timedelta
    import random
    
    # Import Base and models
    from app.db.base import Base
    from app.models.user import User
    from app.models.category import Category
    from app.models.account import Account
    from app.models.billing_cycle import BillingCycle
    from app.models.transaction import Transaction
    
    DEMO_DATABASE_URL = os.getenv("DEMO_DATABASE_URL")
    if not DEMO_DATABASE_URL:
        return {"error": "DEMO_DATABASE_URL not configured"}
    
    try:
        engine = create_engine(DEMO_DATABASE_URL)
        
        # Drop ALL tables using metadata
        Base.metadata.drop_all(bind=engine)
        
        # Create ALL tables using SQLAlchemy models
        Base.metadata.create_all(bind=engine)
        
        # Create ORM session
        SessionLocal = sessionmaker(bind=engine)
        session = SessionLocal()
        
        try:
            # Create demo user with ALL fields
            demo_user = User(
                email="demo@budgetapp.local",
                name="Usuario Demo",
                provider="demo",
                provider_id="demo-001",
                is_demo=True,
                is_admin=False,
                created_at=datetime.utcnow(),
                last_login=None
            )
            session.add(demo_user)
            session.flush()  # Get user ID
            session.add(demo_user)
            session.flush()  # Get user ID
            
            # Create categories using ORM
            categories = [
                Category(name="Salario", icon="Briefcase", type="income", color="#10B981", expense_type=None),
                Category(name="Freelance", icon="Laptop", type="income", color="#34D399", expense_type=None),
                Category(name="Supermercado", icon="ShoppingCart", type="expense", color="#EF4444", expense_type="variable"),
                Category(name="Restaurantes", icon="UtensilsCrossed", type="expense", color="#F97316", expense_type="variable"),
                Category(name="Transporte", icon="Car", type="expense", color="#F59E0B", expense_type="variable"),
                Category(name="Alquiler", icon="Home", type="expense", color="#DC2626", expense_type="fixed"),
                Category(name="Servicios", icon="Zap", type="expense", color="#7C3AED", expense_type="fixed"),
                Category(name="Entretenimiento", icon="Tv", type="expense", color="#EC4899", expense_type="variable"),
                Category(name="Salud", icon="Heart", type="expense", color="#EF4444", expense_type="variable"),
                Category(name="Educación", icon="GraduationCap", type="expense", color="#3B82F6", expense_type="variable"),
            ]
            session.add_all(categories)
            session.flush()
            
            # Create accounts using ORM
            accounts = [
                Account(name="Efectivo", type="cash", balance=1500.00, currency="PEN"),
                Account(name="Banco Nacional", type="bank", balance=8500.00, currency="PEN"),
                Account(name="Ahorros USD", type="savings", balance=2000.00, currency="USD"),
            ]
            session.add_all(accounts)
            session.flush()
            
            # Create billing cycles using ORM
            today = datetime.now()
            start_date = datetime(today.year, today.month, 23)
            if today.day < 23:
                start_date = start_date.replace(month=today.month - 1 if today.month > 1 else 12)
                if today.month == 1:
                    start_date = start_date.replace(year=today.year - 1)
            
            billing_cycles = []
            for i in range(-2, 3):
                cycle_start = start_date + timedelta(days=30*i)
                cycle_end = cycle_start + timedelta(days=29)
                billing_cycles.append(
                    BillingCycle(
                        start_date=cycle_start.date(),
                        end_date=cycle_end.date(),
                        start_day=23
                    )
                )
            session.add_all(billing_cycles)
            session.flush()
            
            # Create 50 sample transactions using ORM
            expense_cats = [cat.id for cat in categories if cat.type == "expense"]
            income_cats = [cat.id for cat in categories if cat.type == "income"]
            account_ids = [acc.id for acc in accounts]
            
            transactions = []
            for i in range(50):
                days_ago = random.randint(0, 90)
                trans_date = today - timedelta(days=days_ago)
                is_income = random.random() < 0.2
            transactions = []
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
                
                account_id = random.choice(account_ids)
                
                transactions.append(
                    Transaction(
                        description=f"Demo {trans_type} #{i+1}",
                        amount=round(amount, 2),
                        currency="PEN",
                        exchange_rate=1.0,
                        amount_pen=round(amount, 2),
                        date=trans_date.date(),
                        type=trans_type,
                        category_id=cat_id,
                        account_id=account_id,
                        status="completed",
                        transaction_type="normal"
                    )
                )
            
            session.add_all(transactions)
            session.commit()
            
            return {
                "success": True,
                "message": "Demo database reset and populated using ORM",
                "user": demo_user.email,
                "categories": len(categories),
                "accounts": len(accounts),
                "billing_cycles": len(billing_cycles),
                "transactions": len(transactions)
            }
        
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
        
    except Exception as e:
        return {"error": str(e)}
