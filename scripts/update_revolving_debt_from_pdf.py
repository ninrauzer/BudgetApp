#!/usr/bin/env python
"""
Actualizar datos de deuda desde el PDF del estado de cuenta
Según EECC BBVA Noviembre 2025:
- Crédito Utilizado (revolvente): S/ 3,728.66
- Crédito Utilizado Cuotas (installments): S/ 7,391.52
- Total: S/ 11,120.18
- Límite: S/ 10,000.00
- Disponible: S/ 0.00 (exceso de línea: S/ 122.60)
"""

from sqlalchemy import create_engine, text
from datetime import datetime

engine = create_engine("postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod")

print("\n" + "="*100)
print("ACTUALIZANDO DATOS DE DEUDA SEGÚN EECC PDF")
print("="*100 + "\n")

# Data from PDF
revolving_debt_pdf = 3728.66  # "Crédito Utilizado" (sin cuotas)
installments_debt_pdf = 7391.52  # "Créd. Utilizado Cuotas"
total_debt = revolving_debt_pdf + installments_debt_pdf  # 11,120.18
credit_limit = 10000.00
excess_line = total_debt - credit_limit  # 1,120.18
available_credit_pdf = 0.00  # Disponible según PDF

print("DATOS DEL PDF (EECC BBVA Noviembre 2025):")
print(f"  Revolvente: S/ {revolving_debt_pdf:.2f}")
print(f"  En Cuotas: S/ {installments_debt_pdf:.2f}")
print(f"  Total Deuda: S/ {total_debt:.2f}")
print(f"  Límite: S/ {credit_limit:.2f}")
print(f"  Disponible: S/ {available_credit_pdf:.2f}")
print(f"  Exceso de Línea: S/ {excess_line:.2f}")

# Calculate what current_balance should be
# current_balance = revolvente + en_cuotas (debt side of balance)
current_balance_calculated = revolving_debt_pdf + installments_debt_pdf
available_credit_calculated = credit_limit - total_debt

print("\nCÁLCULOS:")
print(f"  current_balance debería ser: S/ {current_balance_calculated:.2f}")
print(f"  available_credit debería ser: S/ {available_credit_calculated:.2f} (negativo = exceso)")

with engine.connect() as conn:
    # Update credit card
    print("\n" + "="*100)
    print("ACTUALIZANDO tarjeta ID 6 en PROD...")
    print("="*100 + "\n")
    
    conn.execute(text("""
        UPDATE credit_cards
        SET 
            current_balance = :current_balance,
            revolving_debt = :revolving_debt,
            available_credit = :available_credit,
            updated_at = :updated_at
        WHERE id = 6
    """), {
        "current_balance": current_balance_calculated,
        "revolving_debt": revolving_debt_pdf,
        "available_credit": available_credit_calculated,
        "updated_at": datetime.now(),
    })
    
    conn.commit()
    
    print(f"✅ Actualizado:")
    print(f"   current_balance: S/ {current_balance_calculated:.2f}")
    print(f"   revolving_debt: S/ {revolving_debt_pdf:.2f}")
    print(f"   available_credit: S/ {available_credit_calculated:.2f}")
    
    # Verify
    print("\n" + "="*100)
    print("VERIFICACIÓN")
    print("="*100 + "\n")
    
    result = conn.execute(text("""
        SELECT id, name, credit_limit, current_balance, available_credit, revolving_debt
        FROM credit_cards
        WHERE id = 6
    """))
    
    row = result.fetchone()
    print(f"Nombre: {row[1]}")
    print(f"Límite: S/ {row[2]:.2f}")
    print(f"Saldo Actual: S/ {row[3]:.2f}")
    print(f"Disponible: S/ {row[4]:.2f}")
    print(f"Revolvente: S/ {row[5]:.2f}")
    
    # Get installments sum
    inst_result = conn.execute(text("""
        SELECT SUM(original_amount) as total_original
        FROM credit_card_installments
        WHERE credit_card_id = 6 AND is_active = true
    """))
    
    inst_row = inst_result.fetchone()
    total_cuotas_orig = float(inst_row[0]) if inst_row[0] else 0
    
    print(f"\nEn Cuotas (suma original): S/ {total_cuotas_orig:.2f}")
    print(f"Revolvente + En Cuotas: S/ {row[5] + total_cuotas_orig:.2f}")
    
    if abs((row[5] + total_cuotas_orig) - row[3]) < 0.01:
        print(f"✅ Consistencia verificada")
    else:
        print(f"⚠️ Inconsistencia detectada")

print("\n" + "="*100)
print("✅ ACTUALIZACIÓN COMPLETADA")
print("="*100 + "\n")
