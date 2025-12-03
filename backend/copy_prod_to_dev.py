#!/usr/bin/env python3
"""
Copy data from budgetapp_prod to budgetapp_dev in WSL PostgreSQL
"""

import sys
from sqlalchemy import create_engine, inspect, MetaData, Table, text
from sqlalchemy.exc import OperationalError

PROD_URL = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod"
DEV_URL = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev"

print("=" * 70)
print("📋 Copying data from budgetapp_prod → budgetapp_dev")
print("=" * 70)

# Step 1: Connect to prod
print("\n📖 Step 1: Connecting to budgetapp_prod...")
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

# Step 2: Get tables from prod
print("\n📊 Step 2: Reading PROD schema...")
try:
    inspector = inspect(prod_engine)
    tables = inspector.get_table_names()
    print(f"✅ Found {len(tables)} tables:")
    for table in sorted(tables):
        if not table.startswith('pg_'):
            print(f"   - {table}")
except Exception as e:
    print(f"❌ FAILED to read schema: {e}")
    sys.exit(1)

# Step 3: Connect to dev
print("\n📝 Step 3: Connecting to budgetapp_dev...")
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

# Step 4: Clear existing data in dev
print("\n🗑️  Step 4: Clearing existing data in DEV...")
try:
    with dev_engine.connect() as conn:
        # Get all tables
        prod_metadata = MetaData()
        prod_metadata.reflect(bind=prod_engine)
        
        # Delete in reverse order to avoid foreign key issues
        for table_name in reversed(sorted(tables)):
            if not table_name.startswith('pg_'):
                try:
                    table = Table(table_name, prod_metadata, autoload_with=prod_engine)
                    conn.execute(table.delete())
                    print(f"   ✅ Cleared {table_name}")
                except Exception as e:
                    print(f"   ⚠️  {table_name}: {e}")
        conn.commit()
        print(f"✅ Cleared all tables in DEV")
except Exception as e:
    print(f"❌ FAILED to clear tables: {e}")
    sys.exit(1)

# Step 5: Create tables in dev (if not exist)
print("\n🔧 Step 5: Ensuring tables exist in DEV...")
try:
    prod_metadata = MetaData()
    prod_metadata.reflect(bind=prod_engine)
    
    # Create tables in dev
    prod_metadata.create_all(bind=dev_engine)
    print(f"✅ Tables ready in DEV")
except Exception as e:
    print(f"❌ FAILED to create tables: {e}")
    sys.exit(1)

# Step 6: Copy data (respecting foreign key dependencies)
print("\n🔄 Step 6: Copying data...")

# Define table order to respect foreign key dependencies
table_order = [
    'users',  # Start with users (OAuth)
    'billing_cycles',
    'billing_cycle_overrides',
    'accounts',
    'categories',
    'budget_plans',
    'quick_templates',
    'credit_cards',
    'credit_card_statements',
    'credit_card_installments',
    'loans',
    'loan_payments',
    'transactions',
]

try:
    for table_name in table_order:
        if table_name not in tables:
            continue
            
        try:
            table = Table(table_name, prod_metadata, autoload_with=prod_engine)
            
            # Read from prod
            with prod_engine.connect() as src_conn:
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
                    
                    # Write to dev
                    with dev_engine.connect() as dst_conn:
                        dst_conn.execute(table.insert(), row_dicts)
                        dst_conn.commit()
                    print(f"   ✅ {table_name}: {len(rows)} rows")
                else:
                    print(f"   ✅ {table_name}: 0 rows")
                    
        except Exception as e:
            print(f"   ❌ {table_name}: {str(e)[:200]}")
            
except Exception as e:
    print(f"❌ FAILED to copy data: {e}")
    sys.exit(1)

print("\n" + "=" * 70)
print("✅ Data copy complete: budgetapp_prod → budgetapp_dev")
print("=" * 70)
