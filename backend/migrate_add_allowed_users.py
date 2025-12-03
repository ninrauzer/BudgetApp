"""
Migration: Add allowed_users table for user authorization whitelist
Run this ONCE to create the table and seed initial authorized users
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from app.models.user import AllowedUser
from app.db.database import Base
import os

# Database URLs
DATABASE_URL_DEV = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev"
DATABASE_URL_PROD = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod"

def create_allowed_users_table(database_url: str, db_name: str):
    """Create allowed_users table and seed initial authorized users"""
    print(f"\n{'='*60}")
    print(f"Creating allowed_users table in {db_name}")
    print(f"{'='*60}")
    
    engine = create_engine(database_url)
    
    # Create table
    print("\n[1/2] Creating allowed_users table...")
    Base.metadata.create_all(bind=engine, tables=[AllowedUser.__table__])
    print("✅ Table created successfully")
    
    # Seed initial authorized users
    print("\n[2/2] Seeding initial authorized users...")
    with engine.connect() as conn:
        # Check if already seeded
        result = conn.execute(text("SELECT COUNT(*) FROM allowed_users"))
        count = result.scalar()
        
        if count > 0:
            print(f"⚠️  Table already has {count} record(s), skipping seed")
        else:
            # Add ninrauzer@gmail.com as first authorized user
            conn.execute(text("""
                INSERT INTO allowed_users (email, name, is_active, added_by)
                VALUES ('ninrauzer@gmail.com', 'Renan', true, 'system')
            """))
            conn.commit()
            print("✅ Authorized user added: ninrauzer@gmail.com")
    
    # Verify
    print("\n[Verification] Current allowed users:")
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT id, email, name, is_active, added_at, added_by 
            FROM allowed_users 
            ORDER BY added_at DESC
        """))
        for row in result:
            status = "✅ ACTIVE" if row[3] else "❌ INACTIVE"
            print(f"  {status} | {row[1]} | {row[2]} | Added: {row[4]} by {row[5]}")
    
    engine.dispose()
    print(f"\n{'='*60}")
    print(f"✅ Migration complete for {db_name}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("MIGRATION: Add allowed_users table")
    print("="*60)
    print("\nThis will create the allowed_users table for user authorization")
    print("Only users in this whitelist will be able to authenticate")
    print("\nTarget databases:")
    print("  1. budgetapp_dev (development)")
    print("  2. budgetapp_prod (production)")
    
    # Run migration for both databases
    try:
        create_allowed_users_table(DATABASE_URL_DEV, "budgetapp_dev")
        create_allowed_users_table(DATABASE_URL_PROD, "budgetapp_prod")
        
        print("\n" + "="*60)
        print("🎉 MIGRATION COMPLETED SUCCESSFULLY")
        print("="*60)
        print("\nNext steps:")
        print("  1. Rebuild backend: docker compose up --build -d backend")
        print("  2. Test authentication with authorized email (ninrauzer@gmail.com)")
        print("  3. Test authentication with unauthorized email (should get 403)")
        print("  4. Add more authorized users via admin API (coming soon)")
        print()
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
