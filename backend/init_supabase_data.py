"""
Initialize missing data in Supabase for production
Safely checks and creates only missing required data
"""
import os
import sys
from datetime import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Supabase connection (use your actual credentials)
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:2mr38qsDV52NxD8NT@db.ohleydwbqagxwyfdtiny.supabase.co:6543/postgres"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def check_and_create_billing_cycle(db):
    """Ensure at least one billing cycle exists"""
    result = db.execute(text("SELECT COUNT(*) FROM billing_cycles WHERE is_active = true"))
    count = result.scalar()
    
    if count == 0:
        print("⚠️  No active billing_cycle found. Creating default...")
        db.execute(text("""
            INSERT INTO billing_cycles (name, start_day, is_active, created_at, updated_at)
            VALUES ('Default Cycle', 23, true, NOW(), NOW())
        """))
        db.commit()
        print("✅ Created default billing cycle (start_day=23)")
    else:
        print(f"✅ Found {count} active billing cycle(s)")

def check_categories(db):
    """Check if categories exist"""
    result = db.execute(text("SELECT COUNT(*) FROM categories"))
    count = result.scalar()
    print(f"✅ Found {count} categories")
    
    if count == 0:
        print("⚠️  No categories found! Run scripts/init_db.py to populate")

def check_accounts(db):
    """Check if accounts exist"""
    result = db.execute(text("SELECT COUNT(*) FROM accounts"))
    count = result.scalar()
    print(f"✅ Found {count} accounts")
    
    if count == 0:
        print("⚠️  No accounts found! Creating default cash account...")
        db.execute(text("""
            INSERT INTO accounts (name, type, balance, currency, is_active, created_at, updated_at)
            VALUES ('Efectivo', 'cash', 0, 'PEN', true, NOW(), NOW())
        """))
        db.commit()
        print("✅ Created default cash account")

def main():
    print("🔍 Checking Supabase database...")
    print(f"📍 Database: {DATABASE_URL.split('@')[1].split('/')[0]}")
    
    db = SessionLocal()
    
    try:
        # Test connection
        db.execute(text("SELECT 1"))
        print("✅ Database connection OK\n")
        
        # Check critical tables
        check_and_create_billing_cycle(db)
        check_categories(db)
        check_accounts(db)
        
        print("\n✅ Database check complete!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
