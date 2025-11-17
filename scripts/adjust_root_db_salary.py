"""Ensure transaction 2 uses category_id=4 (Salario) in root budget.db."""
import os, sqlite3
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DB_PATH = os.path.join(PROJECT_ROOT, 'budget.db')
print('Using DB:', DB_PATH)
conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
cur.execute('SELECT id, category_id, amount_pen FROM transactions WHERE id=2')
row = cur.fetchone()
print('Before:', row)
if row and row[1] != 4:
    cur.execute('UPDATE transactions SET category_id=4 WHERE id=2')
    conn.commit()
    cur.execute('SELECT id, category_id, amount_pen FROM transactions WHERE id=2')
    print('After:', cur.fetchone())
else:
    print('No update needed.')
conn.close()
