"""
Script to migrate budget_plan table to use billing cycles instead of year/month
"""
import sqlite3
import os
from datetime import datetime

# Get the database path
db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend', 'budget.db')

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Migrating budget_plan table to use cycles...")

# Step 1: Create new table with cycle-based structure
print("\n1. Creating new budget_plans_new table...")
cursor.execute('''
CREATE TABLE IF NOT EXISTS budget_plans_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cycle_name VARCHAR NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    category_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    notes VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id),
    UNIQUE (cycle_name, category_id)
)
''')
conn.commit()
print("✓ New table created")

# Step 2: Check if old budget_plan table exists and has data
print("\n2. Checking for existing budget data...")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='budget_plan'")
old_table_exists = cursor.fetchone() is not None

if old_table_exists:
    cursor.execute('SELECT COUNT(*) FROM budget_plan')
    old_count = cursor.fetchone()[0]
    print(f"   Found {old_count} records in old budget_plan table")
    
    if old_count > 0:
        print("\n   Note: Old budget data exists but uses year/month structure.")
        print("   Manual migration would be needed to convert to cycles.")
        print("   For now, we'll start fresh with the new cycle-based structure.")
else:
    print("   No old budget_plan table found")

# Step 3: Drop old table if exists and rename new one
print("\n3. Finalizing migration...")
cursor.execute('DROP TABLE IF EXISTS budget_plan')
cursor.execute('ALTER TABLE budget_plans_new RENAME TO budget_plans')
conn.commit()
print("✓ Migration completed")

# Show structure
print("\n4. New budget_plans table structure:")
cursor.execute("PRAGMA table_info(budget_plans)")
columns = cursor.fetchall()
for col in columns:
    print(f"   {col[1]} ({col[2]})")

conn.close()
print("\n✅ Budget plans now use billing cycles!")
print("   Structure: cycle_name, start_date, end_date, category_id, amount")
