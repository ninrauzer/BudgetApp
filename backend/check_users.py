#!/usr/bin/env python3
"""Check users table in both databases"""

from sqlalchemy import create_engine, text

PROD_URL = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod"
DEV_URL = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev"

print("=" * 70)
print("Checking users table")
print("=" * 70)

# Check PROD
print("\n📊 PROD (budgetapp_prod):")
try:
    prod_engine = create_engine(PROD_URL, echo=False)
    with prod_engine.connect() as conn:
        result = conn.execute(text("SELECT id, email, name, is_demo FROM users ORDER BY id;"))
        users = result.fetchall()
        if users:
            for user in users:
                print(f"   User ID {user[0]}: {user[1]} ({user[2]}) - Demo: {user[3]}")
        else:
            print("   No users found")
except Exception as e:
    print(f"   Error: {e}")

# Check DEV
print("\n📊 DEV (budgetapp_dev):")
try:
    dev_engine = create_engine(DEV_URL, echo=False)
    with dev_engine.connect() as conn:
        result = conn.execute(text("SELECT id, email, name, is_demo FROM users ORDER BY id;"))
        users = result.fetchall()
        if users:
            for user in users:
                print(f"   User ID {user[0]}: {user[1]} ({user[2]}) - Demo: {user[3]}")
        else:
            print("   No users found")
except Exception as e:
    print(f"   Error: {e}")

print("\n" + "=" * 70)
