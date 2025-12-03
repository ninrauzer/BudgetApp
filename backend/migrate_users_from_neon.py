#!/usr/bin/env python3
"""Check users in Neon.tech and copy to local databases"""

from sqlalchemy import create_engine, text, MetaData, Table
from sqlalchemy.exc import OperationalError

NEON_URL = "postgresql://neondb_owner:npg_JiBThGbK03Rj@ep-delicate-math-afp2qxtf-pooler.c-2.us-west-2.aws.neon.tech/budgetapp_prod?sslmode=require"
LOCAL_PROD_URL = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod"
LOCAL_DEV_URL = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev"

print("=" * 70)
print("Copying users from Neon.tech to local databases")
print("=" * 70)

# Step 1: Connect to Neon and get users
print("\n📖 Step 1: Reading users from Neon.tech...")
try:
    neon_engine = create_engine(NEON_URL, echo=False)
    with neon_engine.connect() as conn:
        result = conn.execute(text("SELECT id, email, name, picture, is_demo, created_at FROM users ORDER BY id;"))
        users = result.fetchall()
        print(f"✅ Found {len(users)} users:")
        for user in users:
            print(f"   User ID {user[0]}: {user[1]} ({user[2]}) - Demo: {user[4]}")
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)

if not users:
    print("⚠️  No users to copy")
    exit(0)

# Step 2: Get table schema from Neon
print("\n📊 Step 2: Reading users table schema from Neon...")
try:
    metadata = MetaData()
    users_table = Table('users', metadata, autoload_with=neon_engine)
    print(f"✅ Schema loaded")
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)

# Step 3: Create table in local PROD
print("\n🔧 Step 3: Creating users table in local PROD...")
try:
    prod_engine = create_engine(LOCAL_PROD_URL, echo=False)
    metadata.create_all(bind=prod_engine)
    print(f"✅ Table created in budgetapp_prod")
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)

# Step 4: Create table in local DEV
print("\n🔧 Step 4: Creating users table in local DEV...")
try:
    dev_engine = create_engine(LOCAL_DEV_URL, echo=False)
    metadata.create_all(bind=dev_engine)
    print(f"✅ Table created in budgetapp_dev")
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)

# Step 5: Copy users to PROD
print("\n🔄 Step 5: Copying users to local PROD...")
try:
    with prod_engine.connect() as conn:
        for user in users:
            # Set default provider to 'google' for non-demo users, 'local' for demo
            provider = 'local' if user[4] else 'google'  # is_demo flag
            provider_id = str(user[0])  # Use user id as provider_id
            
            conn.execute(
                text("INSERT INTO users (id, email, name, picture, provider, provider_id, is_demo, created_at) VALUES (:id, :email, :name, :picture, :provider, :provider_id, :is_demo, :created_at) ON CONFLICT (id) DO NOTHING"),
                {"id": user[0], "email": user[1], "name": user[2], "picture": user[3], "provider": provider, "provider_id": provider_id, "is_demo": user[4], "created_at": user[5]}
            )
        conn.commit()
    print(f"✅ Copied {len(users)} users to budgetapp_prod")
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)

# Step 6: Copy users to DEV
print("\n🔄 Step 6: Copying users to local DEV...")
try:
    with dev_engine.connect() as conn:
        for user in users:
            # Set default provider to 'google' for non-demo users, 'local' for demo
            provider = 'local' if user[4] else 'google'  # is_demo flag
            provider_id = str(user[0])  # Use user id as provider_id
            
            conn.execute(
                text("INSERT INTO users (id, email, name, picture, provider, provider_id, is_demo, created_at) VALUES (:id, :email, :name, :picture, :provider, :provider_id, :is_demo, :created_at) ON CONFLICT (id) DO NOTHING"),
                {"id": user[0], "email": user[1], "name": user[2], "picture": user[3], "provider": provider, "provider_id": provider_id, "is_demo": user[4], "created_at": user[5]}
            )
        conn.commit()
    print(f"✅ Copied {len(users)} users to budgetapp_dev")
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)

print("\n" + "=" * 70)
print("✅ Users migration complete!")
print("=" * 70)
