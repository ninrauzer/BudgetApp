"""
Migration: Add is_admin field to users table
Run this to add admin privileges to users
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text

DATABASE_URL_DEV = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev"
DATABASE_URL_PROD = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod"

def add_is_admin_field(database_url: str, db_name: str):
    """Add is_admin column to users table and set ninrauzer as admin"""
    print(f"\n{'='*60}")
    print(f"Adding is_admin field to {db_name}")
    print(f"{'='*60}")
    
    engine = create_engine(database_url)
    
    with engine.connect() as conn:
        # Check if column already exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='is_admin'
        """))
        
        if result.fetchone():
            print("⚠️  Column is_admin already exists, skipping...")
        else:
            # Add column
            print("\n[1/2] Adding is_admin column...")
            conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false"))
            conn.commit()
            print("✅ Column added successfully")
        
        # Set ninrauzer as admin
        print("\n[2/2] Setting ninrauzer@gmail.com as admin...")
        result = conn.execute(text("""
            UPDATE users 
            SET is_admin = true 
            WHERE email = 'ninrauzer@gmail.com'
            RETURNING id, email, is_admin
        """))
        conn.commit()
        
        updated = result.fetchone()
        if updated:
            print(f"✅ Admin privileges granted: {updated[1]}")
        else:
            print("⚠️  User ninrauzer@gmail.com not found in users table")
    
    # Verify
    print("\n[Verification] Current admin users:")
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT id, email, name, is_admin 
            FROM users 
            ORDER BY id
        """))
        for row in result:
            admin_badge = "👑 ADMIN" if row[3] else "👤 User"
            print(f"  {admin_badge} | {row[1]} | {row[2]}")
    
    engine.dispose()
    print(f"\n{'='*60}")
    print(f"✅ Migration complete for {db_name}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("MIGRATION: Add is_admin field to users")
    print("="*60)
    
    try:
        add_is_admin_field(DATABASE_URL_DEV, "budgetapp_dev")
        add_is_admin_field(DATABASE_URL_PROD, "budgetapp_prod")
        
        print("\n" + "="*60)
        print("🎉 MIGRATION COMPLETED SUCCESSFULLY")
        print("="*60)
        print("\nNext: Rebuild backend with admin API")
        print()
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
