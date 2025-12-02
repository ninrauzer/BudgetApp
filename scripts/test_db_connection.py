"""Test PostgreSQL connection"""
import psycopg2
from psycopg2 import sql

# Database configurations
configs = [
    {
        'name': 'budgetapp_dev',
        'host': '192.168.126.127',
        'port': 5432,
        'user': 'postgres',
        'password': 'postgres',
        'database': 'budgetapp_dev'
    },
    {
        'name': 'budgetapp_prod',
        'host': '192.168.126.127',
        'port': 5432,
        'user': 'postgres',
        'password': 'postgres',
        'database': 'budgetapp_prod'
    }
]

for config in configs:
    try:
        print(f"\n{'='*60}")
        print(f"Conectando a {config['name']}...")
        print(f"Host: {config['host']}:{config['port']}")
        
        conn = psycopg2.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password'],
            database=config['database']
        )
        
        cursor = conn.cursor()
        
        # Get database version
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print(f"✅ Conexión exitosa!")
        print(f"Versión: {version[:50]}...")
        
        # List tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        
        print(f"\n📊 Tablas encontradas ({len(tables)}):")
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table[0]};")
            count = cursor.fetchone()[0]
            print(f"  - {table[0]}: {count} registros")
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"❌ Error conectando a {config['name']}: {e}")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")

print(f"\n{'='*60}")
