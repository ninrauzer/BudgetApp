#!/usr/bin/env python3
"""
Corregir fechas de todos los ciclos en budgetapp_dev
Cambiar de fechas calendario (1-31) a fechas de ciclo (23 del mes anterior - 22 del mes)
"""
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta

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

MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

def get_correct_dates(cycle_name):
    """Calcular fechas correctas para un ciclo (start_day=23)"""
    month_num = MONTH_NAMES.index(cycle_name) + 1
    start_day = 23
    
    # Usar año 2025 como referencia
    year = 2025
    
    # Cycle ends on (start_day - 1) of (month_num)
    if month_num == 1:
        # January: previous year's December
        start = datetime(year - 1, 12, start_day)
        end_temp = datetime(year, 1, start_day)
        end = end_temp - timedelta(days=1)
    else:
        start = datetime(year, month_num - 1, start_day)
        end_temp = datetime(year, month_num, start_day)
        end = end_temp - timedelta(days=1)
    
    return start.date(), end.date()

print("Conectando a base de datos dev...")
conn = get_conn(DEV_DB)
cur = conn.cursor(cursor_factory=RealDictCursor)

print("\nCorrigiendo fechas de todos los ciclos...")

for cycle_name in MONTH_NAMES:
    start_date, end_date = get_correct_dates(cycle_name)
    
    # Update all plans for this cycle
    cur.execute("""
        UPDATE budget_plans 
        SET start_date = %s, end_date = %s 
        WHERE cycle_name = %s
    """, (start_date, end_date, cycle_name))
    
    rows_updated = cur.rowcount
    if rows_updated > 0:
        print(f"  ✓ {cycle_name}: {rows_updated} planes → {start_date} a {end_date}")
    else:
        print(f"  - {cycle_name}: sin planes")

conn.commit()

# Verify
print("\nVerificando resultado:")
cur.execute("""
    SELECT cycle_name, MIN(start_date) as start, MAX(end_date) as end, COUNT(*) as count
    FROM budget_plans
    GROUP BY cycle_name
    ORDER BY cycle_name
""")

for row in cur.fetchall():
    print(f"  {row['cycle_name']:12} ({row['count']:2} planes): {row['start']} a {row['end']}")

conn.close()
print("\n✓ Corrección completada")
