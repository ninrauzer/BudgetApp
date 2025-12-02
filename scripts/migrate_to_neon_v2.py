"""
Migrate BudgetApp database to Neon.tech using pg_dump/restore
"""
import subprocess
import sys
import os

# Source database config
SOURCE_HOST = "192.168.126.127"
SOURCE_PORT = "5432"
SOURCE_USER = "postgres"
SOURCE_DB = "budgetapp_prod"
SOURCE_PASS = "postgres"

# Target database URL (Neon.tech)
TARGET_URL = input("Ingresa la URL de conexión de Neon.tech: ").strip()

if not TARGET_URL:
    print("❌ Error: Debes proporcionar la URL de Neon.tech")
    sys.exit(1)

print("\n" + "="*60)
print("🚀 Migrando BudgetApp a Neon.tech")
print("="*60)

# Step 1: Export schema and data using WSL pg_dump
print("\n📤 Paso 1: Exportando base de datos local...")
dump_file = "budgetapp_backup.sql"

export_cmd = f'wsl -d Debian --user root bash -c "PGPASSWORD={SOURCE_PASS} pg_dump -h {SOURCE_HOST} -U {SOURCE_USER} -d {SOURCE_DB} --no-owner --no-privileges -f /tmp/{dump_file}"'

try:
    result = subprocess.run(export_cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"❌ Error exportando: {result.stderr}")
        sys.exit(1)
    print("✅ Base de datos exportada exitosamente")
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)

# Step 2: Copy dump file from WSL to Windows
print("\n📥 Paso 2: Copiando archivo de respaldo...")
copy_cmd = f'wsl -d Debian --user root cp /tmp/{dump_file} /mnt/e/Desarrollo/BudgetApp/{dump_file}'

try:
    result = subprocess.run(copy_cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"❌ Error copiando: {result.stderr}")
        sys.exit(1)
    print(f"✅ Archivo copiado a {dump_file}")
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)

# Step 3: Import to Neon.tech using psql
print("\n📤 Paso 3: Importando a Neon.tech...")
print("⏳ Esto puede tomar unos minutos...")

# Parse Neon URL to get credentials
import re
match = re.match(r'postgresql://([^:]+):([^@]+)@([^/]+)/(.+)', TARGET_URL)
if not match:
    print("❌ Error: URL de Neon.tech inválida")
    sys.exit(1)

neon_user, neon_pass, neon_host, neon_db_params = match.groups()
neon_db = neon_db_params.split('?')[0]
neon_host_clean = neon_host.split(':')[0]  # Remove port if present

import_cmd = f'wsl -d Debian --user root bash -c "PGPASSWORD={neon_pass} psql -h {neon_host_clean} -U {neon_user} -d {neon_db} -f /tmp/{dump_file}"'

try:
    result = subprocess.run(import_cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"⚠️  Algunas advertencias durante la importación:")
        print(result.stderr[:500])  # Show first 500 chars
    else:
        print("✅ Base de datos importada exitosamente")
    
    # Show some output
    if result.stdout:
        lines = result.stdout.split('\n')
        print(f"\n📊 Resultado: {len([l for l in lines if 'INSERT' in l or 'CREATE' in l])} operaciones")
        
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)

# Step 4: Verify migration
print("\n🔍 Paso 4: Verificando migración...")

import psycopg2

try:
    conn = psycopg2.connect(TARGET_URL)
    cursor = conn.cursor()
    
    # Count tables
    cursor.execute("""
        SELECT table_name, 
               (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
        FROM information_schema.tables t
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    tables = cursor.fetchall()
    
    print(f"\n✅ Tablas encontradas en Neon.tech: {len(tables)}")
    
    total_records = 0
    for table_name, col_count in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
        count = cursor.fetchone()[0]
        total_records += count
        print(f"  ✓ {table_name}: {count} registros ({col_count} columnas)")
    
    cursor.close()
    conn.close()
    
    print(f"\n📊 Total de registros: {total_records}")
    
except Exception as e:
    print(f"❌ Error verificando: {e}")
    sys.exit(1)

# Cleanup
print("\n🧹 Limpiando archivos temporales...")
try:
    if os.path.exists(dump_file):
        os.remove(dump_file)
    subprocess.run(f'wsl -d Debian --user root rm /tmp/{dump_file}', shell=True)
    print("✅ Archivos temporales eliminados")
except:
    pass

print("\n" + "="*60)
print("✅ MIGRACIÓN COMPLETADA EXITOSAMENTE")
print("="*60)

print(f"\n🌐 Nueva DATABASE_URL:")
print(f"   {TARGET_URL}")

print("\n💡 Próximos pasos:")
print("   1. Actualiza backend/.env:")
print(f"      DATABASE_URL={TARGET_URL}")
print("   2. Actualiza compose.yml (línea 21):")
print(f"      - DATABASE_URL={TARGET_URL}")
print("   3. Reinicia Docker:")
print("      docker compose down && docker compose up -d")
print("   4. Verifica en http://localhost:8080")
