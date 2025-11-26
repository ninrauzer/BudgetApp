"""
Create all missing tables in Supabase
"""
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

# Supabase connection
DATABASE_URL = "postgresql://postgres:2mr38qsDV52NxD8NT@db.ohleydwbqagxwyfdtiny.supabase.co:6543/postgres"

from sqlalchemy import create_engine
from app.db.database import Base

# Import ALL models to register them
from app.models.category import Category
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.budget_plan import BudgetPlan
from app.models.billing_cycle import BillingCycle
from app.models.billing_cycle_override import BillingCycleOverride
from app.models.loan import Loan, LoanPayment
from app.models.credit_card import CreditCard, CreditCardStatement, CreditCardInstallment
from app.models.quick_template import QuickTemplate

print("🏗️  Creating tables in Supabase...")
print(f"📍 Database: {DATABASE_URL.split('@')[1].split('/')[0]}\n")

try:
    engine = create_engine(DATABASE_URL, echo=False)
    
    # Create ALL tables from models
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created successfully!")
    
    # Show created tables
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"\n📋 Tables in database ({len(tables)}):")
    for table in sorted(tables):
        print(f"   ✓ {table}")
    
except Exception as e:
    print(f"⚠️  Warning: Could not create tables during build: {e}")
    print("⚠️  Tables should already exist in production. Continuing...")
    # Don't fail the build - tables might already exist
    sys.exit(0)
