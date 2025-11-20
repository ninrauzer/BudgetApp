#!/usr/bin/env python3
"""
Sincronizar cambios de prod a dev:
1. Actualizar ícono "Otros Ingresos" en dev
2. Copiar planes de presupuesto de Enero corregidos
3. Actualizar fechas de otros ciclos si es necesario
"""
import psycopg2
from psycopg2.extras import RealDictCursor

PROD_DB = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod"
DEV_DB = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev"

def get_conn(db_url):
    """Connect to PostgreSQL"""
    from urllib.parse import urlparse
    parsed = urlparse(db_url)
    return psycopg2.connect(
        host=parsed.hostname,
        port=parsed.port or 5432,
        user=parsed.username,
        password=parsed.password,
        database=parsed.path.lstrip('/')
    )

print("Conectando a bases de datos...")
prod_conn = get_conn(PROD_DB)
dev_conn = get_conn(DEV_DB)

prod_cur = prod_conn.cursor(cursor_factory=RealDictCursor)
dev_cur = dev_conn.cursor(cursor_factory=RealDictCursor)

# 1. Actualizar categoría "Otros Ingresos" con ícono "Plus"
print("\n1. Actualizando ícono de categoría 'Otros Ingresos'...")
dev_cur.execute("""
    UPDATE categories 
    SET icon = 'Plus' 
    WHERE name = 'Otros Ingresos'
""")
rows_updated = dev_cur.rowcount
dev_conn.commit()
print(f"   ✓ {rows_updated} categoría actualizada")

# 2. Sincronizar planes de presupuesto de Enero
print("\n2. Sincronizando planes de presupuesto para 'Enero'...")

# Primero, obtener plans de prod para Enero
prod_cur.execute("""
    SELECT * FROM budget_plans 
    WHERE cycle_name = 'Enero'
    ORDER BY id
""")
prod_enero_plans = prod_cur.fetchall()
print(f"   Planes en prod para Enero: {len(prod_enero_plans)}")

if prod_enero_plans:
    # Eliminar planes viejos de dev para Enero
    dev_cur.execute("DELETE FROM budget_plans WHERE cycle_name = 'Enero'")
    deleted = dev_cur.rowcount
    dev_conn.commit()
    print(f"   ✓ Eliminados {deleted} planes antiguos en dev")
    
    # Insertar planes de prod
    for plan in prod_enero_plans:
        dev_cur.execute("""
            INSERT INTO budget_plans 
            (cycle_name, start_date, end_date, category_id, amount, notes, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            plan['cycle_name'],
            plan['start_date'],
            plan['end_date'],
            plan['category_id'],
            plan['amount'],
            plan['notes'],
            plan['created_at'],
            plan['updated_at']
        ))
    dev_conn.commit()
    print(f"   ✓ Insertados {len(prod_enero_plans)} planes corregidos en dev")

# 3. Verificar y corregir fechas de otros ciclos
print("\n3. Verificando fechas de otros ciclos...")
dev_cur.execute("""
    SELECT DISTINCT cycle_name, MIN(start_date) as min_start, MAX(end_date) as max_end
    FROM budget_plans
    GROUP BY cycle_name
    ORDER BY cycle_name
""")
cycles = dev_cur.fetchall()
for cycle in cycles:
    print(f"   {cycle['cycle_name']}: {cycle['min_start']} a {cycle['max_end']}")

print("\n✓ Sincronización completada")

prod_conn.close()
dev_conn.close()
