#!/usr/bin/env python
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev"

engine = create_engine(DATABASE_URL)

print("\n" + "="*100)
print("CUOTAS ACTUALES EN budgetapp_dev")
print("="*100 + "\n")

with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT 
            id, credit_card_id, concept, original_amount, current_installment, 
            total_installments, monthly_payment, interest_rate, is_active
        FROM credit_card_installments
        WHERE credit_card_id = 6
        ORDER BY id
    """))
    
    rows = result.fetchall()
    for row in rows:
        print(f"ID: {row[0]}, Concepto: {row[2]}, {row[4]}/{row[5]} @ S/ {row[6]}/mes, TEA: {row[7]}%, Activa: {row[8]}")
    
    print(f"\nTotal en DB: {len(rows)}")
    
    # Also check what credit cards exist
    print("\n" + "="*100)
    print("TARJETAS DE CRÉDITO EN budgetapp_dev")
    print("="*100 + "\n")
    
    cc_result = conn.execute(text("""
        SELECT id, name, bank, credit_limit, current_balance, available_credit, is_active
        FROM credit_cards
        ORDER BY id
    """))
    
    cc_rows = cc_result.fetchall()
    for row in cc_rows:
        print(f"ID: {row[0]}, {row[1]} ({row[2]}), Límite: S/ {row[3]}, Saldo: S/ {row[4]}, Disponible: S/ {row[5]}, Activa: {row[6]}")
    
    print(f"\nTotal tarjetas: {len(cc_rows)}")
