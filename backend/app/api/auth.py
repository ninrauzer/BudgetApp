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
async def create_demo_session():
    """
    Create a demo session without authentication.
    Uses frozen demo database - changes are reverted on logout.
    """
    from app.db.session_manager import DemoSession
    
    if not DemoSession:
        raise HTTPException(status_code=503, detail="Demo mode not available")
    
    # Use demo database session
    db = DemoSession()
    try:
        # Get demo user from demo database
        demo_user = db.query(User).filter(User.email == "demo@budgetapp.local").first()
        
        if not demo_user:
            raise HTTPException(status_code=500, detail="Demo user not found. Run /reset-demo-db first")
        
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
    finally:
        db.close()


@router.post("/logout")
async def logout():
    """
    Logout endpoint.
    For demo users, resets the demo database to revert all changes.
    Client should delete the JWT token.
    """
    # Check if this is a demo logout (we can't easily get current user here without token parsing)
    # So we'll create a separate endpoint for demo logout
    return {"message": "Logged out successfully"}


@router.post("/demo/logout")
async def demo_logout():
    """
    Demo logout - resets demo database to original state.
    Reverts all changes made during the demo session.
    """
    try:
        print("[DEMO-LOGOUT] Resetting demo database to revert changes...")
        reset_result = await reset_demo_database()
        
        if reset_result.get("success"):
            print(f"[DEMO-LOGOUT] Reset successful: {reset_result.get('message')}")
            return {
                "message": "Demo session ended, changes reverted",
                "data_restored": {
                    "categories": reset_result.get("categories"),
                    "accounts": reset_result.get("accounts"),
                    "transactions": reset_result.get("transactions"),
                    "budget_plans": reset_result.get("budget_plans")
                }
            }
        else:
            print(f"[DEMO-LOGOUT] Reset failed: {reset_result.get('error')}")
            return {"message": "Logged out (database reset failed)", "error": reset_result.get("error")}
    
    except Exception as e:
        print(f"[DEMO-LOGOUT] Error: {e}")
        return {"message": "Logged out (database reset error)", "error": str(e)}


@router.post("/reset-demo-db")
async def reset_demo_database():
    """RESET and populate demo database with obfuscated data from production using SQLAlchemy models"""
    import os
    import traceback
    from sqlalchemy import create_engine, text
    from sqlalchemy.orm import sessionmaker
    from datetime import datetime, timedelta, date
    import random
    import hashlib
    
    def obfuscate_description(text: str, category_name: str) -> str:
        """Obfuscate transaction descriptions while keeping them realistic"""
        if not text or len(text) < 3:
            return f"Pago de {category_name}"
        
        # Hash the original text to generate consistent but anonymous descriptions
        hash_obj = hashlib.md5(text.encode())
        hash_num = int(hash_obj.hexdigest()[:8], 16) % 1000
        
        # Generate generic descriptions based on category
        templates = {
            "Salario": ["Ingreso mensual", "Pago de nómina", "Salario"],
            "Freelance": ["Proyecto freelance", "Trabajo independiente", "Consultoría"],
            "Supermercado": ["Compras del mes", "Supermercado", "Despensa"],
            "Restaurantes": ["Comida fuera", "Restaurante", "Delivery"],
            "Transporte": ["Transporte", "Movilidad", "Combustible"],
            "Alquiler": ["Pago de alquiler", "Renta mensual", "Arriendo"],
            "Servicios": ["Servicios del hogar", "Pago de servicios", "Facturas"],
            "Entretenimiento": ["Ocio y diversión", "Entretenimiento", "Salida"],
            "Salud": ["Gastos médicos", "Salud", "Consulta médica"],
            "Educación": ["Gastos educativos", "Educación", "Curso"],
        }
        
        category_templates = templates.get(category_name, [f"Pago de {category_name}"])
        base_desc = category_templates[hash_num % len(category_templates)]
        
        # Add reference number for uniqueness
        return f"{base_desc} #{hash_num}"
    
    # Import Base and models
    from app.db.database import Base
    from app.models.user import User
    from app.models.category import Category
    from app.models.account import Account
    from app.models.billing_cycle import BillingCycle
    from app.models.transaction import Transaction
    from app.models.budget_plan import BudgetPlan
    
    DEMO_DATABASE_URL = os.getenv("DEMO_DATABASE_URL")
    if not DEMO_DATABASE_URL:
        return {"error": "DEMO_DATABASE_URL not configured"}
    
    try:
        engine = create_engine(DEMO_DATABASE_URL)
        print(f"[RESET-DEMO] Connected to database")
        
        # First, try to add last_login column if users table exists
        try:
            with engine.connect() as conn:
                print(f"[RESET-DEMO] Attempting to add last_login column...")
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP"))
                conn.commit()
                print(f"[RESET-DEMO] last_login column added (or already exists)")
        except Exception as e:
            print(f"[RESET-DEMO] Could not add column (table may not exist yet): {e}")
        
        # Drop ALL tables using metadata
        print(f"[RESET-DEMO] Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        print(f"[RESET-DEMO] Tables dropped")
        
        # Create ALL tables using SQLAlchemy models
        print(f"[RESET-DEMO] Creating all tables...")
        Base.metadata.create_all(bind=engine)
        print(f"[RESET-DEMO] Tables created")
        
        # Create ORM session
        SessionLocal = sessionmaker(bind=engine)
        session = SessionLocal()
        print(f"[RESET-DEMO] Session created")
        
        try:
            print(f"[RESET-DEMO] Creating demo user...")
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
            session.flush()
            print(f"[RESET-DEMO] Demo user created with ID: {demo_user.id}")
            
            print(f"[RESET-DEMO] Creating categories...")
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
            print(f"[RESET-DEMO] {len(categories)} categories created")
            
            print(f"[RESET-DEMO] Creating accounts...")
            # Create accounts using ORM
            accounts = [
                Account(name="Efectivo", type="cash", balance=1500.00, currency="PEN"),
                Account(name="Banco Nacional", type="bank", balance=8500.00, currency="PEN"),
                Account(name="Ahorros USD", type="savings", balance=2000.00, currency="USD"),
            ]
            session.add_all(accounts)
            session.flush()
            print(f"[RESET-DEMO] {len(accounts)} accounts created")
            
            print(f"[RESET-DEMO] Creating billing cycle...")
            # Create single billing cycle with start_day=23
            billing_cycle = BillingCycle(
                name="Demo Cycle",
                start_day=23,
                is_active=True
            )
            session.add(billing_cycle)
            session.flush()
            print(f"[RESET-DEMO] Billing cycle created with start_day=23")
            
            print(f"[RESET-DEMO] Creating transactions...")
            # Read transactions from Neon PRODUCTION database (obfuscated)
            PROD_DATABASE_URL = "postgresql://neondb_owner:npg_JiBThGbK03Rj@ep-delicate-math-afp2qxtf-pooler.c-2.us-west-2.aws.neon.tech/budgetapp_prod?sslmode=require"
            prod_engine = create_engine(PROD_DATABASE_URL)
            ProdSession = sessionmaker(bind=prod_engine)
            prod_session = ProdSession()
            
            transactions = []
            try:
                print(f"[RESET-DEMO] Connected to production database for transactions")
                
                # Read recent transactions from production (last 60 days, limit 20 for speed)
                today = datetime.now()
                sixty_days_ago = today - timedelta(days=60)
                
                prod_transactions = (
                    prod_session.query(Transaction)
                    .filter(Transaction.date >= sixty_days_ago.date())
                    .order_by(Transaction.date.desc())
                    .limit(20)
                    .all()
                )
                
                print(f"[RESET-DEMO] Found {len(prod_transactions)} transactions in production")
                
                if not prod_transactions:
                    print(f"[RESET-DEMO] No transactions in production, creating random samples")
                    # Fallback to random transactions (reduced to 20 for speed)
                    expense_cats = [cat.id for cat in categories if cat.type == "expense"]
                    income_cats = [cat.id for cat in categories if cat.type == "income"]
                    account_ids = [acc.id for acc in accounts]
                    
                    for i in range(20):
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
                else:
                    # Create mapping of production categories to demo categories
                    prod_categories = prod_session.query(Category).all()
                    prod_cat_map = {cat.id: cat for cat in prod_categories}
                    demo_cat_map = {cat.name: cat for cat in categories}
                    
                    # Map production accounts to demo accounts (by type)
                    prod_accounts = prod_session.query(Account).all()
                    prod_acc_map = {acc.id: acc for acc in prod_accounts}
                    demo_acc_by_type = {acc.type: acc for acc in accounts}
                    
                    # Copy transactions with obfuscation
                    for prod_trans in prod_transactions:
                        prod_cat = prod_cat_map.get(prod_trans.category_id)
                        if not prod_cat or prod_cat.name not in demo_cat_map:
                            continue  # Skip if category doesn't exist in demo
                        
                        demo_cat = demo_cat_map[prod_cat.name]
                        
                        # Map account by type (fallback to first account)
                        prod_acc = prod_acc_map.get(prod_trans.account_id)
                        if prod_acc and prod_acc.type in demo_acc_by_type:
                            demo_acc = demo_acc_by_type[prod_acc.type]
                        else:
                            demo_acc = accounts[0]  # Fallback to first account
                        
                        # Obfuscate description
                        obfuscated_desc = obfuscate_description(
                            prod_trans.description or "",
                            prod_cat.name
                        )
                        
                        # Scale amount by 0.7 (demo mode convention)
                        scaled_amount = round(prod_trans.amount * 0.7, 2)
                        scaled_amount_pen = round(prod_trans.amount_pen * 0.7, 2)
                        
                        transactions.append(
                            Transaction(
                                description=obfuscated_desc,
                                amount=scaled_amount,
                                currency=prod_trans.currency,
                                exchange_rate=prod_trans.exchange_rate,
                                amount_pen=scaled_amount_pen,
                                date=prod_trans.date,
                                type=prod_trans.type,
                                category_id=demo_cat.id,
                                account_id=demo_acc.id,
                                status="completed",
                                transaction_type=prod_trans.transaction_type or "normal"
                            )
                        )
                
                print(f"[RESET-DEMO] {len(transactions)} transactions prepared")
            
            finally:
                # Don't close prod_session yet, needed for budgets
                pass
            
            session.add_all(transactions)
            print(f"[RESET-DEMO] {len(transactions)} transactions added")
            
            print(f"[RESET-DEMO] Creating budget plans...")
            # Read budget plans from production (already connected above)
            budget_plans = []
            
            # First, create manual budget for current cycle (Noviembre-Diciembre 2025)
            # Cycle: Nov 23, 2025 - Dec 22, 2025
            print(f"[RESET-DEMO] Creating manual budget for current cycle (Noviembre-Diciembre 2025)")
            current_cycle_budgets = {
                "Salario": 7056.7,      # Already scaled
                "Freelance": 1400.0,
                "Supermercado": 560.0,
                "Restaurantes": 280.0,
                "Transporte": 70.0,
                "Alquiler": 1120.0,
                "Servicios": 245.0,
                "Entretenimiento": 70.0,
                "Salud": 140.0,
                "Educación": 105.0,
            }
            
            current_cycle_start = date(2025, 11, 23)
            current_cycle_end = date(2025, 12, 22)
            current_cycle_name = "Diciembre"  # Named by end month
            
            for cat in categories:
                if cat.name in current_cycle_budgets:
                    budget_plans.append(
                        BudgetPlan(
                            cycle_name=current_cycle_name,
                            start_date=current_cycle_start,
                            end_date=current_cycle_end,
                            category_id=cat.id,
                            amount=current_cycle_budgets[cat.name],
                            notes=f"Presupuesto demo para {cat.name}"
                        )
                    )
            
            print(f"[RESET-DEMO] Created {len([b for b in budget_plans if b.cycle_name == 'Diciembre'])} budget plans for Diciembre cycle")
            
            # Now read future cycles from production
            try:
                print(f"[RESET-DEMO] Reading future cycles from production database")
                
                # Read budget plans from production for next cycles (Enero, Febrero, Marzo)
                jan_2026_start = date(2025, 12, 23)  # Enero cycle starts Dec 23
                feb_2026_end = date(2026, 2, 28)
                
                prod_budgets = (
                    prod_session.query(BudgetPlan)
                    .filter(BudgetPlan.start_date >= jan_2026_start)
                    .filter(BudgetPlan.start_date <= feb_2026_end)
                    .order_by(BudgetPlan.start_date.asc())
                    .all()
                )
                
                print(f"[RESET-DEMO] Found {len(prod_budgets)} budget plans in production (Enero-Marzo 2026)")
                print(f"[RESET-DEMO] Found {len(prod_budgets)} budget plans in production")
                
                if not prod_budgets:
                    print(f"[RESET-DEMO] No budgets in production, using default templates")
                    # Fallback to templates if no prod data
                    budget_templates = {
                        "Salario": 5000.00,
                        "Freelance": 2000.00,
                        "Supermercado": 800.00,
                        "Restaurantes": 400.00,
                        "Transporte": 300.00,
                        "Alquiler": 1500.00,
                        "Servicios": 350.00,
                        "Entretenimiento": 250.00,
                        "Salud": 200.00,
                        "Educación": 150.00,
                    }
                    
                    for month_offset in range(3):
                        cycle_start = today.replace(day=23) + timedelta(days=30 * month_offset)
                        next_cycle_start = cycle_start + timedelta(days=30)
                        cycle_end = next_cycle_start - timedelta(days=1)
                        cycle_name = cycle_start.strftime("%B %Y")
                        
                        for category in categories:
                            budget_amount = budget_templates.get(category.name, 100.00)
                            budget_plans.append(
                                BudgetPlan(
                                    cycle_name=cycle_name,
                                    start_date=cycle_start.date(),
                                    end_date=cycle_end.date(),
                                    category_id=category.id,
                                    amount=budget_amount,
                                    notes=f"Presupuesto demo para {category.name}"
                                )
                            )
                else:
                    # Create mapping of production category names to demo category IDs
                    prod_categories = prod_session.query(Category).all()
                    prod_cat_map = {cat.name: cat.id for cat in prod_categories}
                    demo_cat_map = {cat.name: cat.id for cat in categories}
                    
                    print(f"[RESET-DEMO] Production categories: {list(prod_cat_map.keys())}")
                    print(f"[RESET-DEMO] Demo categories: {list(demo_cat_map.keys())}")
                    
                    # Copy budget plans from production with obfuscation
                    for prod_budget in prod_budgets:
                        # Find corresponding category in demo database
                        prod_cat = prod_session.query(Category).get(prod_budget.category_id)
                        if prod_cat and prod_cat.name in demo_cat_map:
                            demo_cat_id = demo_cat_map[prod_cat.name]
                            
                            # Scale amount by 0.7 (demo mode convention)
                            scaled_amount = round(prod_budget.amount * 0.7, 2)
                            
                            # Obfuscate notes
                            obfuscated_notes = f"Presupuesto demo para {prod_cat.name}"
                            
                            budget_plans.append(
                                BudgetPlan(
                                    cycle_name=prod_budget.cycle_name,
                                    start_date=prod_budget.start_date,
                                    end_date=prod_budget.end_date,
                                    category_id=demo_cat_id,
                                    amount=scaled_amount,
                                    notes=obfuscated_notes
                                )
                            )
                            print(f"[RESET-DEMO]   Copied budget: {prod_budget.cycle_name} - {prod_cat.name}: {prod_budget.amount} → {scaled_amount} (scaled)")
                        else:
                            print(f"[RESET-DEMO]   Skipped budget for unknown category ID {prod_budget.category_id}")
                    
                    print(f"[RESET-DEMO] Copied {len(budget_plans)} budget plans from production (obfuscated & scaled)")
            
            finally:
                prod_session.close()
            
            session.add_all(budget_plans)
            print(f"[RESET-DEMO] {len(budget_plans)} budget plans added to demo database")
            
            print(f"[RESET-DEMO] Committing all changes...")
            session.commit()
            print(f"[RESET-DEMO] SUCCESS! Database populated")
            
            return {
                "success": True,
                "message": "Demo database reset and populated using ORM",
                "user": demo_user.email,
                "categories": len(categories),
                "accounts": len(accounts),
                "billing_cycle": "start_day=23",
                "transactions": len(transactions),
                "budget_plans": len(budget_plans)
            }
        
        except Exception as e:
            print(f"[RESET-DEMO] ERROR: {str(e)}")
            print(f"[RESET-DEMO] Traceback: {traceback.format_exc()}")
            session.rollback()
            return {"error": str(e), "traceback": traceback.format_exc()}
        finally:
            session.close()
        
    except Exception as e:
        print(f"[RESET-DEMO] FATAL ERROR: {str(e)}")
        print(f"[RESET-DEMO] Traceback: {traceback.format_exc()}")
        return {"error": str(e), "traceback": traceback.format_exc()}

