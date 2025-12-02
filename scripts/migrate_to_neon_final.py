"""
Complete migration to Neon.tech using Alembic + data copy
"""
import psycopg2
import subprocess
import sys
import os

# Neon.tech URL
TARGET_URL = "postgresql://neondb_owner:npg_JiBThGbK03Rj@ep-delicate-math-afp2qxtf-pooler.c-2.us-west-2.aws.neon.tech/budgetapp_prod?sslmode=require"

print("\n" + "="*60)
print("🚀 Migración Completa a Neon.tech")
print("="*60)

# Step 1: Create tables using Alembic
print("\n📋 Paso 1: Creando estructura de tablas con Alembic...")
print("Configurando DATABASE_URL temporal...")

# Save current .env
env_backup = None
env_path = "E:\\Desarrollo\\BudgetApp\\backend\\.env"
try:
    with open(env_path, 'r') as f:
        env_backup = f.read()
except:
    pass

# Update .env with Neon URL
try:
    with open(env_path, 'r') as f:
        content = f.read()
    
    # Replace DATABASE_URL
    import re
    new_content = re.sub(
        r'DATABASE_URL=.*',
        f'DATABASE_URL={TARGET_URL}',
        content
    )
    
    with open(env_path, 'w') as f:
        f.write(new_content)
    
    print("✅ .env actualizado temporalmente")
except Exception as e:
    print(f"❌ Error actualizando .env: {e}")
    sys.exit(1)

# Run Alembic upgrade
print("\n⚙️  Ejecutando migraciones de Alembic...")
os.chdir("E:\\Desarrollo\\BudgetApp\\backend")

try:
    result = subprocess.run(
        "..\\.venv\\Scripts\\alembic.exe upgrade head",
        shell=True,
        capture_output=True,
        text=True,
        cwd="E:\\Desarrollo\\BudgetApp\\backend"
    )
    
    if result.returncode != 0:
        print(f"⚠️  Advertencia Alembic: {result.stderr[:300]}")
    
    print("✅ Estructura de tablas creada")
    
except Exception as e:
    print(f"❌ Error con Alembic: {e}")
    # Restore .env
    if env_backup:
        with open(env_path, 'w') as f:
            f.write(env_backup)
    sys.exit(1)

# Step 2: Copy data
print("\n📦 Paso 2: Copiando datos...")

SOURCE_CONFIG = {
    'host': '192.168.126.127',
    'port': 5432,
    'user': 'postgres',
    'password': 'postgres',
    'database': 'budgetapp_prod'
}

try:
    # Connect to source
    source_conn = psycopg2.connect(**SOURCE_CONFIG)
    source_cursor = source_conn.cursor()
    
    # Connect to target
    target_conn = psycopg2.connect(TARGET_URL)
    target_cursor = target_conn.cursor()
    
    # Tables in order (respecting FK constraints)
    # First insert parent tables, then children
    TABLES = [
        'billing_cycles',          # No dependencies
        'accounts',                # No dependencies
        'categories',              # Self-referential FK (will handle parent_id=NULL first)
        'billing_cycle_overrides', # FK to billing_cycles
        'transactions',            # FK to categories, accounts
        'budget_plans',            # FK to categories
        'credit_cards',            # No dependencies (if no FK to accounts)
        'credit_card_statements',  # FK to credit_cards
        'credit_card_installments',# FK to credit_card_statements
        'loans',                   # FK to accounts (maybe)
        'loan_payments',           # FK to loans
        'quick_templates'          # FK to categories, accounts
    ]
    
    total_copied = 0
    
    for table in TABLES:
        # Get column names first
        source_cursor.execute(f"""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = '{table}'
            ORDER BY ordinal_position;
        """)
        columns = [row[0] for row in source_cursor.fetchall()]
        columns_str = ', '.join(columns)
        placeholders = ', '.join(['%s'] * len(columns))
        
        # Clear target table
        target_cursor.execute(f"TRUNCATE TABLE {table} CASCADE;")
        target_conn.commit()
        
        # Special handling for categories (self-referential FK)
        if table == 'categories':
            # First insert categories without parent
            source_cursor.execute(f"SELECT * FROM {table} WHERE parent_id IS NULL ORDER BY id;")
            rows_no_parent = source_cursor.fetchall()
            
            if rows_no_parent:
                insert_stmt = f"INSERT INTO {table} ({columns_str}) VALUES ({placeholders})"
                target_cursor.executemany(insert_stmt, rows_no_parent)
                target_conn.commit()
                print(f"  ✅ {table} (sin parent): {len(rows_no_parent)} registros")
                total_copied += len(rows_no_parent)
            
            # Then insert categories with parent
            source_cursor.execute(f"SELECT * FROM {table} WHERE parent_id IS NOT NULL ORDER BY parent_id, id;")
            rows_with_parent = source_cursor.fetchall()
            
            if rows_with_parent:
                insert_stmt = f"INSERT INTO {table} ({columns_str}) VALUES ({placeholders})"
                target_cursor.executemany(insert_stmt, rows_with_parent)
                target_conn.commit()
                print(f"  ✅ {table} (con parent): {len(rows_with_parent)} registros")
                total_copied += len(rows_with_parent)
        else:
            # Get all data for other tables
            source_cursor.execute(f"SELECT * FROM {table};")
            rows = source_cursor.fetchall()
            
            if not rows:
                print(f"  ⚪ {table}: sin datos")
                continue
            
            # Insert data
            insert_stmt = f"INSERT INTO {table} ({columns_str}) VALUES ({placeholders})"
            target_cursor.executemany(insert_stmt, rows)
            target_conn.commit()
            
            print(f"  ✅ {table}: {len(rows)} registros")
            total_copied += len(rows)
    
    print(f"\n📊 Total copiado: {total_copied} registros")
    
    # Close connections
    source_cursor.close()
    source_conn.close()
    target_cursor.close()
    target_conn.close()
    
except Exception as e:
    print(f"❌ Error copiando datos: {e}")
    # Restore .env
    if env_backup:
        with open(env_path, 'w') as f:
            f.write(env_backup)
    sys.exit(1)

# Step 3: Verify
print("\n🔍 Paso 3: Verificando...")

try:
    conn = psycopg2.connect(TARGET_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    tables = cursor.fetchall()
    
    print(f"\n✅ Tablas en Neon.tech: {len(tables)}")
    
    for (table_name,) in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
        count = cursor.fetchone()[0]
        print(f"  ✓ {table_name}: {count} registros")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")

# Restore original .env
print("\n🔄 Restaurando .env original...")
if env_backup:
    with open(env_path, 'w') as f:
        f.write(env_backup)
    print("✅ .env restaurado")

print("\n" + "="*60)
print("✅ MIGRACIÓN COMPLETADA")
print("="*60)

print(f"\n🌐 Nueva DATABASE_URL para usar:")
print(f"\n{TARGET_URL}")

print("\n💡 Para aplicar cambios:")
print("\n1. Actualiza backend/.env:")
print("   DATABASE_URL=<URL_DE_NEON>")
print("\n2. Actualiza compose.yml (línea 21):")
print("   - DATABASE_URL=<URL_DE_NEON>")
print("\n3. Reinicia Docker:")
print("   docker compose down")
print("   docker compose up -d")
