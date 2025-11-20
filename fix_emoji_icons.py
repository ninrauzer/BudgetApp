#!/usr/bin/env python3
"""Corregir iconos emoji que aún existan en la BD"""
import psycopg2
from psycopg2.extras import RealDictCursor

PROD_DB = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod"
DEV_DB = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev"

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

print("Buscando y corrigiendo iconos emoji en ambas bases de datos...")

for db_name, db_url in [("PROD", PROD_DB), ("DEV", DEV_DB)]:
    print(f"\n{db_name}:")
    conn = get_conn(db_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Buscar categorías con emoji
    cur.execute("SELECT id, name, icon FROM categories WHERE icon LIKE '%➕%' OR icon LIKE '%+%' OR icon ~ '[^a-zA-Z]'")
    rows = cur.fetchall()
    
    if rows:
        for row in rows:
            if '➕' in row['icon'] or row['icon'] == '+':
                print(f"  Encontrado: {row['name']} con icon '{row['icon']}'")
                # Reemplazar con "Plus"
                cur.execute("UPDATE categories SET icon = %s WHERE id = %s", ('Plus', row['id']))
                print(f"    ✓ Actualizado a 'Plus'")
    else:
        print(f"  ✓ Sin iconos emoji")
    
    conn.commit()
    conn.close()

print("\n✓ Corrección completa")
