"""Add description column to categories table if not exists.
Run: python scripts/migrate_category_description.py
"""
import os
import sqlite3

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
# Try backend/budget.db first (actual DB location), then app/budget.db (legacy)
DB_CANDIDATES = [
    os.path.join(BACKEND_DIR, 'backend', 'budget.db'),
    os.path.join(BACKEND_DIR, 'budget.db'),
    os.path.join(BACKEND_DIR, 'app', 'budget.db'),
]
DB_PATH = None
for candidate in DB_CANDIDATES:
    if os.path.exists(candidate):
        DB_PATH = candidate
        break
if not DB_PATH:
    DB_PATH = DB_CANDIDATES[0]  # fallback to first even if not found yet

print(f"Using DB: {DB_PATH}")
conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# Check existing columns
cur.execute("PRAGMA table_info(categories)")
cols = [row[1] for row in cur.fetchall()]
if 'description' in cols:
    print('Column description already exists. Nothing to do.')
else:
    print('Adding description column to categories...')
    cur.execute("ALTER TABLE categories ADD COLUMN description TEXT NULL")
    conn.commit()
    print('Column added.')

conn.close()
