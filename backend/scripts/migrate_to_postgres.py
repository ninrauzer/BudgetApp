"""
Migrate data from SQLite to Supabase PostgreSQL.
Run AFTER init_supabase_schema.py has created the tables.
"""

import os
import sys
from pathlib import Path
from datetime import datetime

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Import models
from app.models.category import Category
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.budget_plan import BudgetPlan

def migrate_data():
    """Migrate data from SQLite to PostgreSQL."""
    
    # Load environment
    load_dotenv(dotenv_path=backend_dir / '.env')
    
    # Source: SQLite
    sqlite_path = backend_dir / 'budget.db'
    if not sqlite_path.exists():
        print(f"❌ ERROR: SQLite database not found at {sqlite_path}")
        return False
    
    sqlite_url = f"sqlite:///{sqlite_path}"
    
    # Target: PostgreSQL from .env
    postgres_url = os.getenv('DATABASE_URL')
    if not postgres_url or not postgres_url.startswith('postgresql'):
        print("❌ ERROR: DATABASE_URL must be PostgreSQL")
        return False
    
    print("=" * 60)
    print("Data Migration: SQLite → Supabase PostgreSQL")
    print("=" * 60)
    print(f"\nSource: {sqlite_path}")
    print(f"Target: {postgres_url.split('@')[1].split('/')[0]}")
    
    try:
        # Create engines
        sqlite_engine = create_engine(sqlite_url)
        postgres_engine = create_engine(postgres_url)
        
        # Create sessions
        SqliteSession = sessionmaker(bind=sqlite_engine)
        PostgresSession = sessionmaker(bind=postgres_engine)
        
        sqlite_session = SqliteSession()
        postgres_session = PostgresSession()
        
        # Migrate Categories
        print("\n📦 Migrating categories...")
        categories = sqlite_session.query(Category).all()
        for cat in categories:
            # Check if exists
            existing = postgres_session.query(Category).filter_by(id=cat.id).first()
            if not existing:
                postgres_session.merge(cat)
        postgres_session.commit()
        print(f"   ✅ {len(categories)} categories migrated")
        
        # Migrate Accounts
        print("\n💳 Migrating accounts...")
        accounts = sqlite_session.query(Account).all()
        for acc in accounts:
            existing = postgres_session.query(Account).filter_by(id=acc.id).first()
            if not existing:
                postgres_session.merge(acc)
        postgres_session.commit()
        print(f"   ✅ {len(accounts)} accounts migrated")
        
        # Migrate Transactions
        print("\n💰 Migrating transactions...")
        transactions = sqlite_session.query(Transaction).all()
        for txn in transactions:
            existing = postgres_session.query(Transaction).filter_by(id=txn.id).first()
            if not existing:
                postgres_session.merge(txn)
        postgres_session.commit()
        print(f"   ✅ {len(transactions)} transactions migrated")
        
        # Migrate Budget Plans
        print("\n📊 Migrating budget plans...")
        budget_plans = sqlite_session.query(BudgetPlan).all()
        for plan in budget_plans:
            existing = postgres_session.query(BudgetPlan).filter_by(id=plan.id).first()
            if not existing:
                postgres_session.merge(plan)
        postgres_session.commit()
        print(f"   ✅ {len(budget_plans)} budget plans migrated")
        
        # Close sessions
        sqlite_session.close()
        postgres_session.close()
        
        print("\n" + "=" * 60)
        print("✅ SUCCESS: All data migrated to Supabase!")
        print("=" * 60)
        print("\nSummary:")
        print(f"  • Categories:    {len(categories)}")
        print(f"  • Accounts:      {len(accounts)}")
        print(f"  • Transactions:  {len(transactions)}")
        print(f"  • Budget Plans:  {len(budget_plans)}")
        print("\nNext steps:")
        print("  1. Restart backend server")
        print("  2. Verify data in Supabase dashboard")
        print("  3. Test frontend application")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = migrate_data()
    sys.exit(0 if success else 1)
