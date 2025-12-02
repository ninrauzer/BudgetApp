#!/usr/bin/env python3
"""
Corregir fechas de todos los ciclos en budgetapp_prod
"""
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta

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

MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

def get_correct_dates(cycle_name):
    """Calcular fechas correctas para un ciclo (start_day=23)"""
    month_num = MONTH_NAMES.index(cycle_name) + 1
    start_day = 23
    year = 2025
    
    if month_num == 1:
        start = datetime(year - 1, 12, start_day)
        end_temp = datetime(year, 1, start_day)
        end = end_temp - timedelta(days=1)
    else:
        start = datetime(year, month_num - 1, start_day)
        end_temp = datetime(year, month_num, start_day)
        end = end_temp - timedelta(days=1)
    
    return start.date(), end.date()

print("⚠️ Corrigiendo budgetapp_prod (PRODUCCIÓN)...")
conn = get_conn(PROD_DB)
cur = conn.cursor(cursor_factory=RealDictCursor)

for cycle_name in MONTH_NAMES:
    start_date, end_date = get_correct_dates(cycle_name)
    
    cur.execute("""
        UPDATE budget_plans 
        SET start_date = %s, end_date = %s 
        WHERE cycle_name = %s
    """, (start_date, end_date, cycle_name))
    
    rows_updated = cur.rowcount
    if rows_updated > 0:
        print(f"  ✓ {cycle_name}: {rows_updated} planes → {start_date} a {end_date}")

conn.commit()

print("\n✓ Producción corregida")
conn.close()
