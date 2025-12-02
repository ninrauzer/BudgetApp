#!/usr/bin/env python3
"""Corregir todos los iconos emoji en la BD"""
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

# Mapa de emoji a iconos lucide
EMOJI_MAP = {
    '➕': 'Plus',
    '📱': 'smartphone',
    '💰': 'wallet',
    '🏠': 'home',
    '🚗': 'car',
    '🎬': 'film',
    '📚': 'book',
    '🍔': 'utensils',
    '💊': 'pill',
    '⚽': 'activity',
    '🎮': 'gamepad2',
    '✈️': 'plane',
    '🎓': 'graduation-cap',
    '💼': 'briefcase',
}

conn = get_conn(PROD_DB)
cur = conn.cursor(cursor_factory=RealDictCursor)

print("Buscando categorías con iconos emoji...")
cur.execute("SELECT id, name, icon FROM categories ORDER BY name")

correcciones = 0
for row in cur.fetchall():
    icon = row['icon']
    # Si contiene emoji
    if any(emoji in icon for emoji in EMOJI_MAP.keys()):
        nuevo_icon = EMOJI_MAP.get(icon, icon)
        if nuevo_icon != icon:
            print(f"  {row['name']:20} '{icon}' → '{nuevo_icon}'")
            cur.execute("UPDATE categories SET icon = %s WHERE id = %s", (nuevo_icon, row['id']))
            correcciones += 1

conn.commit()
print(f"\n✓ {correcciones} categorías corregidas")
conn.close()
