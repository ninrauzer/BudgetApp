import sqlite3
import os

db_files = [
    'budget.db',
    'backend/budget_app.db',
    'backend/budget.db',
    'frontend/budget.db'
]

for db_file in db_files:
    if os.path.exists(db_file):
        print(f"\n=== {db_file} ===")
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f"Tables ({len(tables)}):")
        for table in tables:
            print(f"  - {table[0]}")
        conn.close()
    else:
        print(f"\n=== {db_file} === NOT FOUND")

