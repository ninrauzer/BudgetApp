"""
Migrar datos de presupuesto de estructura year/month a cycle_name/dates
Fuente: budget.db (raíz) - tabla budget_plan
Destino: backend/budget.db - tabla budget_plans
"""
import sqlite3
import sys
import os
from datetime import datetime, timedelta

# Paths
root_db = 'E:\\Desarrollo\\BudgetApp\\budget.db'
backend_db = 'E:\\Desarrollo\\BudgetApp\\backend\\budget.db'

# Mapa de meses
MONTH_NAMES = {
    1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril",
    5: "Mayo", 6: "Junio", 7: "Julio", 8: "Agosto",
    9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre"
}

def get_billing_cycle_day():
    """Obtener el día de inicio del ciclo de facturación desde settings"""
    conn = sqlite3.connect(backend_db)
    cursor = conn.cursor()
    
    # Verificar si existe tabla billing_cycles
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='billing_cycles'")
    if not cursor.fetchone():
        conn.close()
        return 23  # Default
    
    cursor.execute("SELECT start_day FROM billing_cycles WHERE is_active=1 LIMIT 1")
    result = cursor.fetchone()
    conn.close()
    
    return int(result[0]) if result else 23

def calculate_cycle_dates(year, month, cycle_day):
    """
    Calcular start_date y end_date para un ciclo
    Ejemplo: Ciclo "Enero" con day=23
      - start_date: 2024-12-23
      - end_date: 2025-01-22
    """
    cycle_name = MONTH_NAMES[month]
    
    # El ciclo empieza el día cycle_day del mes ANTERIOR
    if month == 1:
        start_year = year - 1
        start_month = 12
    else:
        start_year = year
        start_month = month - 1
    
    start_date = datetime(start_year, start_month, cycle_day).date()
    
    # El ciclo termina el día (cycle_day - 1) del mes actual
    end_day = cycle_day - 1
    if end_day == 0:
        # Si cycle_day es 1, termina el último día del mes anterior
        if month == 1:
            end_date = datetime(year - 1, 12, 31).date()
        else:
            # Último día del mes anterior
            end_date = (datetime(year, month, 1) - timedelta(days=1)).date()
    else:
        end_date = datetime(year, month, end_day).date()
    
    return cycle_name, start_date, end_date

def migrate_budget_data():
    """Migrar datos de presupuesto"""
    
    print("="*60)
    print("MIGRACIÓN DE DATOS DE PRESUPUESTO")
    print("="*60)
    
    # Obtener día de ciclo
    cycle_day = get_billing_cycle_day()
    print(f"\n1. Día de ciclo de facturación: {cycle_day}")
    
    # Conectar a BD origen
    print(f"\n2. Conectando a origen: {root_db}")
    conn_src = sqlite3.connect(root_db)
    cursor_src = conn_src.cursor()
    
    # Leer datos antiguos
    cursor_src.execute("""
        SELECT id, year, month, category_id, amount, notes, created_at, updated_at
        FROM budget_plan
        ORDER BY year, month, category_id
    """)
    old_records = cursor_src.fetchall()
    print(f"   Encontrados: {len(old_records)} registros")
    
    # Conectar a BD destino
    print(f"\n3. Conectando a destino: {backend_db}")
    conn_dst = sqlite3.connect(backend_db)
    cursor_dst = conn_dst.cursor()
    
    # Limpiar tabla destino
    print("   Limpiando tabla budget_plans...")
    cursor_dst.execute("DELETE FROM budget_plans")
    conn_dst.commit()
    
    # Migrar registros
    print(f"\n4. Migrando {len(old_records)} registros...")
    migrated = 0
    errors = 0
    
    for old_rec in old_records:
        old_id, year, month, category_id, amount, notes, created_at, updated_at = old_rec
        
        try:
            # Calcular cycle_name y fechas
            cycle_name, start_date, end_date = calculate_cycle_dates(year, month, cycle_day)
            
            # Insertar en nueva tabla
            cursor_dst.execute("""
                INSERT INTO budget_plans 
                (cycle_name, start_date, end_date, category_id, amount, notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (cycle_name, start_date, end_date, category_id, amount, notes, created_at, updated_at))
            
            migrated += 1
            
            if migrated % 50 == 0:
                print(f"   Migrados: {migrated}/{len(old_records)}")
                
        except Exception as e:
            errors += 1
            print(f"   ERROR en registro {old_id} (año={year}, mes={month}, cat={category_id}): {e}")
    
    # Commit final
    conn_dst.commit()
    
    # Cerrar conexiones
    conn_src.close()
    conn_dst.close()
    
    # Resumen
    print("\n" + "="*60)
    print("RESUMEN DE MIGRACIÓN")
    print("="*60)
    print(f"Total registros origen: {len(old_records)}")
    print(f"Migrados exitosamente: {migrated}")
    print(f"Errores: {errors}")
    
    # Verificar
    conn_dst = sqlite3.connect(backend_db)
    cursor_dst = conn_dst.cursor()
    cursor_dst.execute("SELECT COUNT(*) FROM budget_plans")
    final_count = cursor_dst.fetchone()[0]
    conn_dst.close()
    
    print(f"\nRegistros en destino: {final_count}")
    
    if final_count == migrated:
        print("\n✅ MIGRACIÓN EXITOSA")
        return True
    else:
        print("\n⚠️ ADVERTENCIA: El conteo no coincide")
        return False

if __name__ == "__main__":
    try:
        success = migrate_budget_data()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ ERROR FATAL: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
