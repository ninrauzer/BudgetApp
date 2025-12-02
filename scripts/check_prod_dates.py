#!/usr/bin/env python3
"""Verificar fechas en budgetapp_prod"""
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

print("Verificando fechas en budgetapp_prod:")
cur.execute("""
    SELECT cycle_name, MIN(start_date) as start, MAX(end_date) as end, COUNT(*) as count
    FROM budget_plans
    GROUP BY cycle_name
    ORDER BY CASE 
        WHEN cycle_name = 'Enero' THEN 1
        WHEN cycle_name = 'Febrero' THEN 2
        WHEN cycle_name = 'Marzo' THEN 3
        WHEN cycle_name = 'Abril' THEN 4
        WHEN cycle_name = 'Mayo' THEN 5
        WHEN cycle_name = 'Junio' THEN 6
        WHEN cycle_name = 'Julio' THEN 7
        WHEN cycle_name = 'Agosto' THEN 8
        WHEN cycle_name = 'Septiembre' THEN 9
        WHEN cycle_name = 'Octubre' THEN 10
        WHEN cycle_name = 'Noviembre' THEN 11
        WHEN cycle_name = 'Diciembre' THEN 12
    END
""")

all_correct = True
for row in cur.fetchall():
    cycle = row['cycle_name']
    start = row['start']
    end = row['end']
    count = row['count']
    
    # Check if dates follow day 23 pattern
    is_correct = (start.day == 23 and end.day == 22)
    status = "✅" if is_correct else "❌"
    
    print(f"  {status} {cycle:12} ({count:2} planes): {start} a {end}")
    if not is_correct:
        all_correct = False

conn.close()

if all_correct:
    print("\n✓ Todas las fechas en prod son correctas")
else:
    print("\n⚠️ Algunas fechas en prod necesitan corrección")
