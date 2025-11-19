"""
Migrar datos de old_budget.db a budget.db (nueva con schema actualizado)
"""
import sqlite3

# Conectar a ambas BDs
old_db = sqlite3.connect('../old_budget.db')
new_db = sqlite3.connect('budget.db')

old_cursor = old_db.cursor()
new_cursor = new_db.cursor()

print("=" * 60)
print("Migración de Datos: old_budget.db → budget.db")
print("=" * 60)

# 1. Migrar Categorías (categories)
print("\n1. Migrando categorías...")
# Primero verificar qué columnas existen
old_cursor.execute("PRAGMA table_info(categories)")
old_cols = [col[1] for col in old_cursor.fetchall()]
print(f"   Columnas en old_budget: {old_cols}")

# Construir query dinámicamente
if 'display_order' in old_cols:
    old_cursor.execute("SELECT id, name, icon, color, type, display_order, is_active, parent_id FROM categories")
    categories = old_cursor.fetchall()
    for cat in categories:
        try:
            new_cursor.execute("""
                INSERT OR REPLACE INTO category (id, name, icon, color, type, display_order, is_active, parent_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, cat)
        except Exception as e:
            print(f"   ⚠️  Error en categoría {cat[1]}: {e}")
else:
    # Sin display_order, usar NULL
    old_cursor.execute("SELECT id, name, icon, color, type, is_active, parent_id FROM categories")
    categories = old_cursor.fetchall()
    for cat in categories:
        try:
            new_cursor.execute("""
                INSERT OR REPLACE INTO categories (id, name, icon, color, type, is_active, parent_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, cat)
        except Exception as e:
            print(f"   ⚠️  Error en categoría {cat[1]}: {e}")
new_db.commit()
print(f"   ✓ {len(categories)} categorías migradas")

# 2. Migrar Cuentas (accounts)
print("\n2. Migrando cuentas...")
old_cursor.execute("SELECT id, name, type, balance, currency, is_active FROM accounts")
accounts = old_cursor.fetchall()
for acc in accounts:
    try:
        new_cursor.execute("""
            INSERT OR REPLACE INTO accounts (id, name, type, balance, currency, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        """, acc)
    except Exception as e:
        print(f"   ⚠️  Error en cuenta {acc[1]}: {e}")
new_db.commit()
print(f"   ✓ {len(accounts)} cuentas migradas")

# 3. Migrar Transacciones (transactions → transaction)
print("\n3. Migrando transacciones...")
old_cursor.execute("""
    SELECT id, date, category_id, account_id, amount, currency, 
           exchange_rate, amount_pen, type, description, notes, status
    FROM transactions
""")
transactions = old_cursor.fetchall()
for txn in transactions:
    try:
        # Agregar transaction_type como 'regular' (valor por defecto)
        new_cursor.execute("""
            INSERT OR REPLACE INTO transactions 
            (id, date, category_id, account_id, amount, currency, exchange_rate, 
             amount_pen, type, description, notes, status, transaction_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'regular')
        """, txn)
    except Exception as e:
        print(f"   ⚠️  Error en transacción {txn[0]}: {e}")
new_db.commit()
print(f"   ✓ {len(transactions)} transacciones migradas")

# 4. Migrar Planes de Presupuesto (budget_plan)
print("\n4. Migrando planes de presupuesto...")
print("   ⚠️  El schema nuevo usa ciclos en lugar de year/month")
print("   ℹ️  Saltando migración de budget_plans (incompatible)")
print("   💡 Los planes deberán recrearse manualmente en el frontend")

# 5. Migrar Quick Templates (si existen)
print("\n5. Migrando quick templates...")
try:
    old_cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='quick_templates'")
    if old_cursor.fetchone():
        old_cursor.execute("SELECT id, name, category_id, amount, description FROM quick_templates")
        templates = old_cursor.fetchall()
        for tmpl in templates:
            try:
                new_cursor.execute("""
                    INSERT OR REPLACE INTO quick_templates 
                    (id, name, category_id, amount, description)
                    VALUES (?, ?, ?, ?, ?)
                """, tmpl)
            except Exception as e:
                print(f"   ⚠️  Error en template {tmpl[1]}: {e}")
        new_db.commit()
        print(f"   ✓ {len(templates)} templates migrados")
    else:
        print("   ℹ️  No hay quick_templates en la BD vieja")
except Exception as e:
    print(f"   ⚠️  Error migrando templates: {e}")

# Resumen final
print("\n" + "=" * 60)
print("✓ MIGRACIÓN COMPLETADA")
print("=" * 60)
print("\nVerificando datos en budget.db...")
new_cursor.execute("SELECT COUNT(*) FROM categories")
print(f"  Categorías: {new_cursor.fetchone()[0]}")
new_cursor.execute("SELECT COUNT(*) FROM accounts")
print(f"  Cuentas: {new_cursor.fetchone()[0]}")
new_cursor.execute("SELECT COUNT(*) FROM transactions")
print(f"  Transacciones: {new_cursor.fetchone()[0]}")
print("\nℹ️  Nota: Los planes de presupuesto (budget_plans) no fueron migrados")
print("          debido a cambios en el schema (ahora usa ciclos en lugar de year/month)")

old_db.close()
new_db.close()
print("\n✓ Listo! Ahora puedes iniciar el backend.")
