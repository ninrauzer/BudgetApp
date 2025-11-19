import sqlite3

conn = sqlite3.connect('budget.db')
cursor = conn.cursor()

# Ver tablas
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [row[0] for row in cursor.fetchall()]
print("Tablas disponibles:")
for table in tables:
    print(f"  - {table}")
    cursor.execute(f"SELECT COUNT(*) FROM {table}")
    count = cursor.fetchone()[0]
    print(f"    Registros: {count}")

conn.close()
