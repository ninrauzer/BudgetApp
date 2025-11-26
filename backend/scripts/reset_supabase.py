"""
MIGRATION SCRIPT - Run this in Render Shell

1. Drop all tables in Supabase
2. Create fresh schema
3. Copy data from export

NOTE: Run this manually in Render Shell, not locally
"""
import os
from sqlalchemy import create_engine, text, MetaData

# Get Supabase URL from environment
SUPABASE_URL = os.getenv("DATABASE_URL")

if not SUPABASE_URL:
    print("❌ DATABASE_URL not set!")
    exit(1)

print(f"🔗 Connecting to Supabase...")
engine = create_engine(SUPABASE_URL)

print("🗑️  Dropping all tables...")
with engine.connect() as conn:
    conn.execute(text("DROP SCHEMA public CASCADE;"))
    conn.execute(text("CREATE SCHEMA public;"))
    conn.execute(text("GRANT ALL ON SCHEMA public TO postgres;"))
    conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
    conn.commit()

print("✅ Supabase cleaned!")
print("\nNow run Alembic migrations to create fresh schema:")
print("  alembic upgrade head")
