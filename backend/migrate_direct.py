#!/usr/bin/env python3
"""
Migrate data from Supabase to WSL PostgreSQL using Python directly
No pg_dump needed - uses SQLAlchemy to copy all tables and data
"""

import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, '/mnt/e/Desarrollo/BudgetApp/backend')

from sqlalchemy import create_engine, inspect, MetaData, Table, text
from sqlalchemy.exc import OperationalError

SUPABASE_URL = "postgresql://postgres:2mr38qsDV52NxD8NT@db.ohleydwbqagxwyfdtiny.supabase.co:6543/postgres"
# Force IPv4 for WSL (add ?host=127.0.0.1)
WSL_URL = "postgresql://postgres@127.0.0.1:5432/budgetapp_dev"

print("=" * 70)
print("🔄 Migrating Supabase → WSL PostgreSQL (Python SQLAlchemy)")
print("=" * 70)

# Step 1: Connect to Supabase
print("\n📤 Step 1: Connecting to Supabase...")
try:
    supabase_engine = create_engine(SUPABASE_URL, echo=False)
    with supabase_engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        version = result.fetchone()[0]
        print(f"✅ Connected to Supabase")
        print(f"   Version: {version.split(',')[0]}")
except Exception as e:
    print(f"❌ FAILED to connect to Supabase: {e}")
    sys.exit(1)

# Step 2: Get metadata from Supabase
print("\n📊 Step 2: Reading Supabase schema...")
try:
    inspector = inspect(supabase_engine)
    tables = inspector.get_table_names()
    print(f"✅ Found {len(tables)} tables:")
    for table in sorted(tables):
        if table not in ['pg_catalog', 'information_schema']:
            print(f"   - {table}")
except Exception as e:
    print(f"❌ FAILED to read schema: {e}")
    sys.exit(1)

# Step 3: Connect to WSL
print("\n📥 Step 3: Connecting to WSL PostgreSQL...")
try:
    wsl_engine = create_engine(WSL_URL, echo=False)
    with wsl_engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        version = result.fetchone()[0]
        print(f"✅ Connected to WSL PostgreSQL")
        print(f"   Version: {version.split(',')[0]}")
except Exception as e:
    print(f"❌ FAILED to connect to WSL: {e}")
    sys.exit(1)

# Step 4: Copy tables
print("\n🔄 Step 4: Copying data...")
try:
    supabase_metadata = MetaData()
    supabase_metadata.reflect(bind=supabase_engine)
    
    # Create tables in WSL
    supabase_metadata.create_all(bind=wsl_engine)
    print(f"✅ Created {len(tables)} tables in WSL")
    
    # Copy data for each table
    for table_name in sorted(tables):
        if table_name.startswith('pg_'):
            continue
            
        try:
            table = Table(table_name, supabase_metadata, autoload_with=supabase_engine)
            
            # Read from Supabase
            with supabase_engine.connect() as src_conn:
                rows = src_conn.execute(table.select()).fetchall()
                
                if rows:
                    # Write to WSL
                    with wsl_engine.connect() as dst_conn:
                        dst_conn.execute(table.insert(), [row._asdict() if hasattr(row, '_asdict') else dict(row) for row in rows])
                        dst_conn.commit()
                    print(f"   ✅ {table_name}: {len(rows)} rows")
                else:
                    print(f"   ✅ {table_name}: 0 rows")
        except Exception as e:
            print(f"   ⚠️  {table_name}: {e}")
            
except Exception as e:
    print(f"❌ FAILED to copy data: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Step 5: Verify
print("\n✅ Step 5: Verifying...")
try:
    with wsl_engine.connect() as conn:
        from sqlalchemy import text
        result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"))
        wsl_tables = [row[0] for row in result]
        print(f"✅ WSL now has {len(wsl_tables)} tables:")
        for table in wsl_tables:
            print(f"   - {table}")
except Exception as e:
    print(f"❌ Verification failed: {e}")
    sys.exit(1)

print("\n" + "=" * 70)
print("🎉 Migration complete!")
print("=" * 70)
print(f"\nData is now available in: {WSL_URL}")
