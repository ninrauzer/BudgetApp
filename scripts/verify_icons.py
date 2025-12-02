#!/usr/bin/env python3
"""Verificar que los iconos emoji fueron reemplazados"""
import psycopg2
from psycopg2.extras import RealDictCursor

PROD_DB = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod"

def get_conn(db_url):
    from urllib.parse import urlparse
    parsed = urlparse(db_url)
    return psycopg2.connect(
        host=parsed.hostname,
        port=parsed.port or 5432,
        user=parsed.username,
        password=parsed.password,
        database=parsed.path.lstrip('/')
    )

conn = get_conn(PROD_DB)
cur = conn.cursor(cursor_factory=RealDictCursor)

print("Verificando categorías en budgetapp_prod:")
cur.execute("SELECT id, name, icon FROM categories ORDER BY name")

for row in cur.fetchall():
    print(f"  {row['name']:20} → {row['icon']}")

conn.close()
