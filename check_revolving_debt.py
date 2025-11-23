#!/usr/bin/env python
from sqlalchemy import create_engine, text

engine = create_engine("postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod")

with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT id, name, credit_limit, current_balance, available_credit, revolving_debt
        FROM credit_cards
        WHERE id = 6
    """))
    
    row = result.fetchone()
    print("\nTARJETA DE CRÉDITO ID 6:")
    print(f"  Nombre: {row[1]}")
    print(f"  Límite: S/ {row[2]:.2f}")
    print(f"  Saldo Actual: S/ {row[3]:.2f}")
    print(f"  Disponible: S/ {row[4]:.2f}")
    print(f"  Deuda Revolvente: S/ {row[5]:.2f}")
    
    # Now check the 22 installments
    inst_result = conn.execute(text("""
        SELECT 
            SUM(CASE WHEN interest_rate = 0 THEN 0 ELSE monthly_payment END) as cuotas_con_interes,
            SUM(monthly_payment) as total_cuotas,
            COUNT(*) as cantidad
        FROM credit_card_installments
        WHERE credit_card_id = 6 AND is_active = true
    """))
    
    inst_row = inst_result.fetchone()
    print(f"\nCUOTAS (22 total):")
    print(f"  Total Pago Mensual: S/ {inst_row[1]:.2f}")
    print(f"  Con Intereses: S/ {inst_row[0]:.2f}")
    print(f"  Cantidad: {inst_row[2]}")
    
    # Calculate what revolving_debt should be
    total_used = float(row[3])  # current_balance
    total_cuotas = float(inst_row[1]) if inst_row[1] else 0
    
    # Get total original amounts of installments
    orig_result = conn.execute(text("""
        SELECT SUM(original_amount) as total_original
        FROM credit_card_installments
        WHERE credit_card_id = 6 AND is_active = true
    """))
    
    orig_row = orig_result.fetchone()
    total_orig = float(orig_row[0]) if orig_row[0] else 0
    
    revolvente_calculated = total_used - total_orig
    
    print(f"\nCÁLCULO DE DEUDA REVOLVENTE:")
    print(f"  Saldo Total (current_balance): S/ {total_used:.2f}")
    print(f"  Monto Original de Cuotas: S/ {total_orig:.2f}")
    print(f"  Revolvente Calculado: S/ {revolvente_calculated:.2f}")
    print(f"  Revolvente en BD: S/ {row[5]:.2f}")
    
    if abs(revolvente_calculated - row[5]) < 0.01:
        print(f"  ✅ Está correcto")
    else:
        print(f"  ⚠️ DIFERENCIA: {abs(revolvente_calculated - row[5]):.2f}")
