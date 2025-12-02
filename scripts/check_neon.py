"""Check Neon.tech database"""
import psycopg2

TARGET_URL = "postgresql://neondb_owner:npg_JiBThGbK03Rj@ep-delicate-math-afp2qxtf-pooler.c-2.us-west-2.aws.neon.tech/budgetapp_prod?sslmode=require"

conn = psycopg2.connect(TARGET_URL)
cursor = conn.cursor()
cursor.execute("SELECT COUNT(*) FROM transactions;")
print(f"Transactions: {cursor.fetchone()[0]}")

cursor.execute("SELECT * FROM transactions LIMIT 3;")
print("\nFirst 3 transactions:")
for row in cursor.fetchall():
    print(row)

cursor.close()
conn.close()
