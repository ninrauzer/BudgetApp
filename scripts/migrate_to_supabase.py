"""
Migrate data from local PostgreSQL (budgetapp_prod) to Supabase
"""
import os
from sqlalchemy import create_engine, MetaData, inspect, text
from sqlalchemy.orm import sessionmaker

# Source: Local PostgreSQL (Docker)
SOURCE_URL = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod"

# Destination: Supabase
DEST_URL = "postgresql://postgres:2mr38qsDV52NxD8NT@db.ohleydwbqagxwyfdtiny.supabase.co:6543/postgres"

print("🔄 Migrating budgetapp_prod → Supabase\n")

# Connect to both databases
print("📤 Connecting to source (local PostgreSQL)...")
source_engine = create_engine(SOURCE_URL, echo=False)
print("✅ Connected to source\n")

print("📥 Connecting to destination (Supabase)...")
dest_engine = create_engine(DEST_URL, echo=False)
print("✅ Connected to destination\n")

# Get metadata from source
print("📊 Reading schema from source...")
source_metadata = MetaData()
source_metadata.reflect(bind=source_engine)

# Order tables by dependencies (parent tables first)
dependency_order = [
    'categories',
    'billing_cycles',
    'billing_cycle_overrides',
    'accounts',
    'budget_plans',
    'loans',
    'credit_cards',
    'quick_templates',
    'transactions',
    'credit_card_statements',
    'credit_card_installments',
    'loan_payments'
]

# Filter to only existing tables
table_names = [t for t in dependency_order if t in source_metadata.tables]
print(f"✅ Found {len(table_names)} tables in dependency order\n")

# Drop all existing tables first
print("🗑️  Dropping existing tables in Supabase...")
with dest_engine.connect() as conn:
    conn.execute(text("DROP SCHEMA public CASCADE;"))
    conn.execute(text("CREATE SCHEMA public;"))
    conn.execute(text("GRANT ALL ON SCHEMA public TO postgres;"))
    conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
    conn.commit()
print("✅ Old tables dropped\n")

# Create tables in destination
print("🏗️  Creating fresh tables in Supabase...")
source_metadata.create_all(bind=dest_engine)
print("✅ Tables created\n")

# Migrate data table by table
SourceSession = sessionmaker(bind=source_engine)
DestSession = sessionmaker(bind=dest_engine)

source_session = SourceSession()
dest_session = DestSession()

total_rows = 0

for table_name in table_names:
    print(f"📦 Migrating table: {table_name}")
    table = source_metadata.tables[table_name]
    
    # Read from source
    source_data = source_session.execute(table.select()).fetchall()
    row_count = len(source_data)
    
    if row_count == 0:
        print(f"   ⏭️  No data to migrate\n")
        continue
    
    # Clear destination table
    dest_session.execute(table.delete())
    
    # Insert into destination
    if source_data:
        dest_session.execute(table.insert(), [dict(row._mapping) for row in source_data])
        dest_session.commit()
    
    total_rows += row_count
    print(f"   ✅ Migrated {row_count} rows\n")

source_session.close()
dest_session.close()

print(f"🎉 Migration complete!")
print(f"📊 Total rows migrated: {total_rows}")
print(f"\n✅ Supabase is now ready with your production data!")
