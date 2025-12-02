"""Re-copy transactions to Neon.tech"""
import psycopg2

SOURCE_CONFIG = {
    'host': '192.168.126.127',
    'port': 5432,
    'user': 'postgres',
    'password': 'postgres',
    'database': 'budgetapp_prod'
}

TARGET_URL = "postgresql://neondb_owner:npg_JiBThGbK03Rj@ep-delicate-math-afp2qxtf-pooler.c-2.us-west-2.aws.neon.tech/budgetapp_prod?sslmode=require"

print("🔄 Recopiando transacciones...")

# Connect
source_conn = psycopg2.connect(**SOURCE_CONFIG)
source_cursor = source_conn.cursor()

target_conn = psycopg2.connect(TARGET_URL)
target_cursor = target_conn.cursor()

# Get transactions
source_cursor.execute("SELECT * FROM transactions ORDER BY id;")
rows = source_cursor.fetchall()

print(f"📊 Transacciones en origen: {len(rows)}")

# Get column names
source_cursor.execute("""
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'transactions'
    ORDER BY ordinal_position;
""")
columns = [row[0] for row in source_cursor.fetchall()]
columns_str = ', '.join(columns)
placeholders = ', '.join(['%s'] * len(columns))

# Delete existing (without CASCADE)
target_cursor.execute("DELETE FROM transactions;")
target_conn.commit()

# Insert transactions
insert_stmt = f"INSERT INTO transactions ({columns_str}) VALUES ({placeholders})"
target_cursor.executemany(insert_stmt, rows)
target_conn.commit()

print(f"✅ {len(rows)} transacciones copiadas")

# Verify
target_cursor.execute("SELECT COUNT(*) FROM transactions;")
count = target_cursor.fetchone()[0]
print(f"✅ Verificación: {count} transacciones en Neon")

# Show sample
target_cursor.execute("SELECT id, date, description, amount FROM transactions LIMIT 5;")
print("\nPrimeras 5 transacciones:")
for row in target_cursor.fetchall():
    print(f"  ID {row[0]}: {row[1]} - {row[2]} - S/ {row[3]}")

source_cursor.close()
source_conn.close()
target_cursor.close()
target_conn.close()

print("\n✅ Completado")
