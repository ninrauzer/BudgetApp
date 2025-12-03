"""
Verify allowed_users table contents
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text

DATABASE_URL_DEV = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev"
DATABASE_URL_PROD = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod"

def verify_allowed_users(database_url: str, db_name: str):
    """Check current allowed users"""
    print(f"\n{'='*60}")
    print(f"ALLOWED USERS IN {db_name}")
    print(f"{'='*60}")
    
    engine = create_engine(database_url)
    
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT id, email, name, is_active, added_at, added_by 
            FROM allowed_users 
            ORDER BY added_at DESC
        """))
        
        rows = list(result)
        
        if not rows:
            print("  ⚠️  No authorized users found")
        else:
            print(f"\n  Total authorized users: {len(rows)}\n")
            for row in rows:
                status = "✅ ACTIVE" if row[3] else "❌ INACTIVE"
                print(f"  ID: {row[0]}")
                print(f"  Email: {row[1]}")
                print(f"  Name: {row[2]}")
                print(f"  Status: {status}")
                print(f"  Added: {row[4]}")
                print(f"  Added by: {row[5]}")
                print()
    
    engine.dispose()


if __name__ == "__main__":
    print("\n" + "="*60)
    print("WHITELIST VERIFICATION")
    print("="*60)
    
    verify_allowed_users(DATABASE_URL_DEV, "budgetapp_dev")
    verify_allowed_users(DATABASE_URL_PROD, "budgetapp_prod")
    
    print("="*60)
    print("✅ VERIFICATION COMPLETE")
    print("="*60 + "\n")
