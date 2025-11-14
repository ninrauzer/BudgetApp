"""
Script to create billing_cycles table in the database
"""
import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend', 'budget.db')

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Creating billing_cycles table...")

# Create billing_cycles table
cursor.execute('''
CREATE TABLE IF NOT EXISTS billing_cycles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR DEFAULT 'default',
    start_day INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT 1
)
''')

conn.commit()
print("✓ billing_cycles table created successfully")

# Check if default cycle exists
cursor.execute('SELECT COUNT(*) FROM billing_cycles WHERE is_active = 1')
count = cursor.fetchone()[0]

if count == 0:
    print("\nInserting default billing cycle (starts on day 1)...")
    cursor.execute(
        'INSERT INTO billing_cycles (name, start_day, is_active) VALUES (?, ?, ?)',
        ('default', 1, True)
    )
    conn.commit()
    print("✓ Default billing cycle inserted")
else:
    print(f"\n✓ Active billing cycle already exists")

# Show current billing cycle
cursor.execute('SELECT id, name, start_day, is_active FROM billing_cycles WHERE is_active = 1')
cycle = cursor.fetchone()
if cycle:
    print(f"\nCurrent billing cycle:")
    print(f"  ID: {cycle[0]}")
    print(f"  Name: {cycle[1]}")
    print(f"  Start Day: {cycle[2]}")
    print(f"  Active: {cycle[3]}")
    print(f"\n  Cycles start on day {cycle[2]} of each month")

conn.close()
print("\nMigration completed!")
