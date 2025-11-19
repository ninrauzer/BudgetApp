"""
Initialize Supabase PostgreSQL schema.
Creates all tables from SQLAlchemy models before migrating data.
"""

import os
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=backend_dir / '.env')

# Import all models to register them with Base
from app.models.category import Category
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.budget_plan import BudgetPlan
from app.db.database import Base

def init_schema():
    """Create all tables in Supabase PostgreSQL."""
    
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL not found in .env")
        return False
    
    if not database_url.startswith('postgresql'):
        print("❌ ERROR: DATABASE_URL must be PostgreSQL connection string")
        print(f"   Found: {database_url[:30]}...")
        return False
    
    print(f"🔗 Connecting to Supabase...")
    print(f"   Host: {database_url.split('@')[1].split('/')[0]}")
    
    try:
        # Create engine
        engine = create_engine(database_url, echo=False)
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"✅ Connected to PostgreSQL")
            print(f"   Version: {version.split(',')[0]}")
        
        # Create all tables
        print(f"\n📊 Creating tables...")
        Base.metadata.create_all(bind=engine)
        
        # Verify tables created
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """))
            tables = [row[0] for row in result]
            
            print(f"\n✅ Schema created successfully!")
            print(f"   Tables created: {len(tables)}")
            for table in tables:
                print(f"   - {table}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("=" * 60)
    print("Supabase Schema Initialization")
    print("=" * 60)
    
    success = init_schema()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ SUCCESS: Schema initialized in Supabase")
        print("\nNext steps:")
        print("1. Run: python scripts/migrate_to_postgres.py")
        print("2. Update backend/.env to use Supabase")
        print("3. Restart backend")
    else:
        print("❌ FAILED: Could not initialize schema")
        print("\nTroubleshooting:")
        print("1. Check Supabase project is active")
        print("2. Verify connection string in .env")
        print("3. Check firewall/network settings")
    print("=" * 60)
