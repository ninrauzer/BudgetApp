"""
Migrate BudgetApp database from local PostgreSQL to Neon.tech
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import sys

# Source database (local PostgreSQL)
SOURCE_CONFIG = {
    'host': '192.168.126.127',
    'port': 5432,
    'user': 'postgres',
    'password': 'postgres',
    'database': 'budgetapp_prod'
}

# Target database (Neon.tech)
# Format: postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
TARGET_URL = input("Ingresa la URL de conexión de Neon.tech: ").strip()

if not TARGET_URL:
    print("❌ Error: Debes proporcionar la URL de Neon.tech")
    sys.exit(1)

print("\n" + "="*60)
print("🚀 Iniciando migración a Neon.tech")
print("="*60)

# Connect to source
print("\n📊 Conectando a base de datos origen (local)...")
try:
    source_conn = psycopg2.connect(**SOURCE_CONFIG)
    source_cursor = source_conn.cursor()
    print("✅ Conectado a budgetapp_prod (local)")
except Exception as e:
    print(f"❌ Error conectando a origen: {e}")
    sys.exit(1)

# Connect to target
print("\n🌐 Conectando a Neon.tech...")
try:
    target_conn = psycopg2.connect(TARGET_URL)
    target_cursor = target_conn.cursor()
    print("✅ Conectado a Neon.tech")
except Exception as e:
    print(f"❌ Error conectando a Neon.tech: {e}")
    print("\n💡 Asegúrate de que:")
    print("   1. La URL es correcta")
    print("   2. Incluye ?sslmode=require al final")
    print("   3. El usuario tiene permisos")
    sys.exit(1)

# Get list of tables in order (respecting foreign keys)
TABLES_ORDER = [
    'categories',
    'accounts',
    'billing_cycles',
    'billing_cycle_overrides',
    'transactions',
    'budget_plans',
    'credit_cards',
    'credit_card_statements',
    'credit_card_installments',
    'loans',
    'loan_payments',
    'quick_templates'
]

print("\n" + "="*60)
print("📋 Tablas a migrar:")
print("="*60)

# Check tables exist
source_cursor.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
""")
existing_tables = [row[0] for row in source_cursor.fetchall()]
print(f"Tablas encontradas en origen: {len(existing_tables)}")
for table in existing_tables:
    source_cursor.execute(f"SELECT COUNT(*) FROM {table};")
    count = source_cursor.fetchone()[0]
    print(f"  ✓ {table}: {count} registros")

print("\n" + "="*60)
print("🔧 Paso 1: Crear estructura de tablas")
print("="*60)

# Get table schemas
for table in TABLES_ORDER:
    if table not in existing_tables:
        print(f"⚠️  Omitiendo {table} (no existe en origen)")
        continue
    
    print(f"\n📝 Creando tabla: {table}")
    
    # Get CREATE TABLE statement
    source_cursor.execute(f"""
        SELECT 
            'CREATE TABLE IF NOT EXISTS ' || table_name || ' (' ||
            string_agg(
                column_name || ' ' || 
                CASE 
                    WHEN data_type = 'character varying' THEN 'VARCHAR(' || character_maximum_length || ')'
                    WHEN data_type = 'timestamp without time zone' THEN 'TIMESTAMP'
                    WHEN data_type = 'USER-DEFINED' THEN udt_name
                    ELSE data_type 
                END ||
                CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
                CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
                ', '
            ) || ');'
        FROM information_schema.columns
        WHERE table_name = '{table}'
        GROUP BY table_name;
    """)
    
    create_stmt = source_cursor.fetchone()
    if create_stmt:
        try:
            target_cursor.execute(create_stmt[0])
            target_conn.commit()
            print(f"  ✅ Tabla {table} creada")
        except Exception as e:
            print(f"  ⚠️  Error creando {table}: {e}")
            print("  💡 Intentando método alternativo...")
            
            # Fallback: Use pg_dump style
            try:
                # Drop and recreate
                target_cursor.execute(f"DROP TABLE IF EXISTS {table} CASCADE;")
                target_cursor.execute(create_stmt[0])
                target_conn.commit()
                print(f"  ✅ Tabla {table} recreada")
            except Exception as e2:
                print(f"  ❌ Error: {e2}")
                continue

print("\n" + "="*60)
print("📦 Paso 2: Copiar datos")
print("="*60)

total_records = 0
for table in TABLES_ORDER:
    if table not in existing_tables:
        continue
    
    print(f"\n📋 Copiando datos de: {table}")
    
    # Get column names
    source_cursor.execute(f"""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '{table}'
        ORDER BY ordinal_position;
    """)
    columns = [row[0] for row in source_cursor.fetchall()]
    columns_str = ', '.join(columns)
    placeholders = ', '.join(['%s'] * len(columns))
    
    # Get all data
    source_cursor.execute(f"SELECT {columns_str} FROM {table};")
    rows = source_cursor.fetchall()
    
    if not rows:
        print(f"  ⚠️  Sin datos en {table}")
        continue
    
    # Insert data in batches
    batch_size = 100
    inserted = 0
    
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i+batch_size]
        try:
            insert_stmt = f"INSERT INTO {table} ({columns_str}) VALUES ({placeholders})"
            target_cursor.executemany(insert_stmt, batch)
            target_conn.commit()
            inserted += len(batch)
            print(f"  📊 Insertados {inserted}/{len(rows)} registros", end='\r')
        except Exception as e:
            print(f"\n  ❌ Error insertando batch: {e}")
            target_conn.rollback()
            # Try one by one
            for row in batch:
                try:
                    target_cursor.execute(insert_stmt, row)
                    target_conn.commit()
                    inserted += 1
                except Exception as e2:
                    print(f"  ⚠️  Error en registro: {e2}")
                    target_conn.rollback()
    
    print(f"\n  ✅ {table}: {inserted} registros copiados")
    total_records += inserted

print("\n" + "="*60)
print("🔍 Paso 3: Verificación")
print("="*60)

all_ok = True
for table in TABLES_ORDER:
    if table not in existing_tables:
        continue
    
    source_cursor.execute(f"SELECT COUNT(*) FROM {table};")
    source_count = source_cursor.fetchone()[0]
    
    target_cursor.execute(f"SELECT COUNT(*) FROM {table};")
    target_count = target_cursor.fetchone()[0]
    
    status = "✅" if source_count == target_count else "❌"
    print(f"{status} {table}: {source_count} → {target_count}")
    
    if source_count != target_count:
        all_ok = False

print("\n" + "="*60)
if all_ok:
    print("✅ MIGRACIÓN COMPLETADA EXITOSAMENTE")
else:
    print("⚠️  MIGRACIÓN COMPLETADA CON ADVERTENCIAS")
print("="*60)
print(f"\n📊 Total de registros migrados: {total_records}")
print(f"🌐 Nueva URL de conexión: {TARGET_URL.split('@')[1].split('/')[0]}")

# Close connections
source_cursor.close()
source_conn.close()
target_cursor.close()
target_conn.close()

print("\n💡 Próximos pasos:")
print("   1. Actualiza backend/.env con la nueva URL")
print("   2. Actualiza compose.yml con la nueva URL")
print("   3. Reinicia los contenedores Docker")
print("   4. Verifica que la aplicación funcione correctamente")
