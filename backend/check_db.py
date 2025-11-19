#!/usr/bin/env python3
import sqlite3
import os

print("=" * 60)
print("Verificando bases de datos")
print("=" * 60)

# Verificar budget_app.db
try:
    conn = sqlite3.connect('budget_app.db')
    c = conn.cursor()
    c.execute('SELECT COUNT(*) FROM transactions')
    count = c.fetchone()[0]
    print(f"\n✓ budget_app.db tiene {count} transacciones")
    
    # Ver también cuentas
    c.execute('SELECT COUNT(*) FROM accounts')
    accs = c.fetchone()[0]
    print(f"  - {accs} cuentas")
    conn.close()
except Exception as e:
    print(f"\n✗ budget_app.db error: {type(e).__name__}: {e}")

# Verificar budget.db
try:
    conn = sqlite3.connect('budget.db')
    c = conn.cursor()
    c.execute('SELECT COUNT(*) FROM transactions')
    count = c.fetchone()[0]
    print(f"\n✓ budget.db tiene {count} transacciones")
    
    # Ver también cuentas
    c.execute('SELECT COUNT(*) FROM accounts')
    accs = c.fetchone()[0]
    print(f"  - {accs} cuentas")
    conn.close()
except Exception as e:
    print(f"\n✗ budget.db error: {type(e).__name__}: {e}")

print("\n" + "=" * 60)
print("RECOMENDACIÓN:")
if os.path.exists('budget_app.db'):
    conn_old = sqlite3.connect('budget_app.db')
    c_old = conn_old.cursor()
    c_old.execute('SELECT COUNT(*) FROM transactions')
    old_count = c_old.fetchone()[0]
    conn_old.close()
    
    if old_count > 0:
        print("✓ Encontré datos en budget_app.db")
        print("  → Voy a copiarlos a budget.db")
    else:
        print("✗ budget_app.db está vacía")
else:
    print("✗ budget_app.db no existe")
