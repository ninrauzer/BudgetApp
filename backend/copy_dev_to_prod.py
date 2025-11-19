#!/usr/bin/env python3
"""
Copy data from budgetapp_dev to budgetapp_prod in WSL PostgreSQL
"""

import sys
from sqlalchemy import create_engine, inspect, MetaData, Table, text
from sqlalchemy.exc import OperationalError

DEV_URL = "postgresql://postgres@127.0.0.1:5432/budgetapp_dev"
PROD_URL = "postgresql://postgres@127.0.0.1:5432/budgetapp_prod"

print("=" * 70)
print("📋 Copying data from budgetapp_dev → budgetapp_prod")
print("=" * 70)

# Step 1: Connect to dev
print("\n📖 Step 1: Connecting to budgetapp_dev...")
try:
    dev_engine = create_engine(DEV_URL, echo=False)
    with dev_engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        version = result.fetchone()[0]
        print(f"✅ Connected to DEV")
        print(f"   Version: {version.split(',')[0]}")
except Exception as e:
    print(f"❌ FAILED to connect to DEV: {e}")
    sys.exit(1)

# Step 2: Get tables from dev
print("\n📊 Step 2: Reading DEV schema...")
try:
    inspector = inspect(dev_engine)
    tables = inspector.get_table_names()
    print(f"✅ Found {len(tables)} tables:")
    for table in sorted(tables):
        if not table.startswith('pg_'):
            print(f"   - {table}")
except Exception as e:
    print(f"❌ FAILED to read schema: {e}")
    sys.exit(1)

# Step 3: Connect to prod
print("\n📝 Step 3: Connecting to budgetapp_prod...")
try:
    prod_engine = create_engine(PROD_URL, echo=False)
    with prod_engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        version = result.fetchone()[0]
        print(f"✅ Connected to PROD")
        print(f"   Version: {version.split(',')[0]}")
except Exception as e:
    print(f"❌ FAILED to connect to PROD: {e}")
    sys.exit(1)

# Step 4: Create tables in prod
print("\n🔧 Step 4: Creating tables in PROD...")
try:
    dev_metadata = MetaData()
    dev_metadata.reflect(bind=dev_engine)
    
    # Create tables in prod
    dev_metadata.create_all(bind=prod_engine)
    print(f"✅ Created {len(tables)} tables in PROD")
except Exception as e:
    print(f"❌ FAILED to create tables: {e}")
    sys.exit(1)

# Step 5: Copy data
print("\n🔄 Step 5: Copying data...")
try:
    for table_name in sorted(tables):
        if table_name.startswith('pg_'):
            continue
            
        try:
            table = Table(table_name, dev_metadata, autoload_with=dev_engine)
            
            # Read from dev
            with dev_engine.connect() as src_conn:
                rows = src_conn.execute(table.select()).fetchall()
                
                if rows:
                    # Convert rows to dicts
                    row_dicts = []
                    for row in rows:
                        if hasattr(row, '_asdict'):
                            row_dicts.append(row._asdict())
                        elif hasattr(row, 'keys'):
                            row_dicts.append(dict(row))
                        else:
                            row_dicts.append(row)
                    
                    # Write to prod
                    with prod_engine.connect() as dst_conn:
                        dst_conn.execute(table.insert(), row_dicts)
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

# Step 6: Verify
print("\n✅ Step 6: Verifying PROD...")
try:
    with prod_engine.connect() as conn:
        result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"))
        prod_tables = [row[0] for row in result]
        print(f"✅ PROD now has {len(prod_tables)} tables:")
        for table in prod_tables:
            # Count rows
            count_result = conn.execute(text(f"SELECT COUNT(*) FROM {table};"))
            count = count_result.fetchone()[0]
            print(f"   - {table}: {count} rows")
except Exception as e:
    print(f"❌ Verification failed: {e}")
    sys.exit(1)

print("\n" + "=" * 70)
print("🎉 Data copy complete!")
print("=" * 70)
print(f"\nPROD database is ready for testing/staging")
print(f"DEV:  postgresql://postgres@127.0.0.1:5432/budgetapp_dev")
print(f"PROD: postgresql://postgres@127.0.0.1:5432/budgetapp_prod")
