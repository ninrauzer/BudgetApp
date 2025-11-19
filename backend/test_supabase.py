"""Test Supabase connection"""
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"DATABASE_URL: {DATABASE_URL}")

if DATABASE_URL and DATABASE_URL.startswith("postgresql"):
    print("✓ PostgreSQL URL detected")
    
    from sqlalchemy import create_engine, text
    
    try:
        engine = create_engine(DATABASE_URL)
        print("✓ Engine created")
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM transactions"))
            count = result.scalar()
            print(f"✓ Connected to Supabase! Transactions count: {count}")
            
            result = conn.execute(text("SELECT * FROM transactions LIMIT 3"))
            rows = result.fetchall()
            print(f"✓ Sample transactions: {len(rows)} rows")
            for row in rows:
                print(f"  - {row}")
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
else:
    print("✗ No PostgreSQL URL found or using SQLite")
