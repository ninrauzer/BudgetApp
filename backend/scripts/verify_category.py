import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), '..', 'budget.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT * FROM categories WHERE name = ?", ('Transferencias',))
result = cursor.fetchone()

if result:
    print(f"✅ Categoría encontrada: {result}")
else:
    print("❌ Categoría no encontrada")

conn.close()
