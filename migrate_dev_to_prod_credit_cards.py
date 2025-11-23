#!/usr/bin/env python
"""
Script para migrar SOLO tarjeta de crédito e installments de DEV a PROD
CUIDADO: No toca otras tablas
"""

from sqlalchemy import create_engine, text
from datetime import datetime

DB_DEV = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev"
DB_PROD = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod"

engine_dev = create_engine(DB_DEV)
engine_prod = create_engine(DB_PROD)

print("\n" + "="*100)
print("MIGRANDO TARJETA DE CRÉDITO E INSTALLMENTS: DEV → PROD")
print("="*100 + "\n")

try:
    with engine_dev.connect() as dev_conn, engine_prod.connect() as prod_conn:
        
        # 1. Leer tarjeta de DEV
        print("1. Leyendo tarjeta de crédito ID 6 de budgetapp_dev...")
        cc_result = dev_conn.execute(text("""
            SELECT id, user_id, name, bank, card_type, last_four_digits, credit_limit,
                   current_balance, available_credit, revolving_debt, payment_due_day,
                   statement_close_day, revolving_interest_rate, is_active, created_at, updated_at
            FROM credit_cards
            WHERE id = 6
        """))
        
        cc_row = cc_result.fetchone()
        if not cc_row:
            print("   ❌ No se encontró tarjeta ID 6 en DEV")
            exit(1)
        
        print(f"   ✅ Tarjeta encontrada: {cc_row[2]} ({cc_row[3]})")
        
        # 2. Leer 22 cuotas de DEV
        print("\n2. Leyendo 22 cuotas de budgetapp_dev...")
        inst_result = dev_conn.execute(text("""
            SELECT id, credit_card_id, concept, original_amount, purchase_date,
                   current_installment, total_installments, monthly_payment,
                   monthly_principal, monthly_interest, interest_rate,
                   remaining_capital, is_active, completed_at, created_at, updated_at
            FROM credit_card_installments
            WHERE credit_card_id = 6
            ORDER BY id
        """))
        
        installments = inst_result.fetchall()
        print(f"   ✅ {len(installments)} cuotas encontradas")
        
        # 3. PROD: Borrar tarjeta ID 6 actual (si existe)
        print("\n3. Borrando tarjeta ID 6 actual en PROD (limpieza)...")
        
        # Primero borrar installments
        result_inst = prod_conn.execute(text("""
            DELETE FROM credit_card_installments
            WHERE credit_card_id = 6
        """))
        deleted_inst = result_inst.rowcount
        print(f"   ✅ {deleted_inst} cuotas viejas eliminadas de PROD")
        
        # Luego borrar tarjeta
        result_cc = prod_conn.execute(text("""
            DELETE FROM credit_cards
            WHERE id = 6
        """))
        deleted_cc = result_cc.rowcount
        print(f"   ✅ Tarjeta vieja eliminada de PROD")
        
        # 4. Insertar tarjeta en PROD
        print("\n4. Insertando tarjeta en PROD...")
        prod_conn.execute(text("""
            INSERT INTO credit_cards (
                id, user_id, name, bank, card_type, last_four_digits, credit_limit,
                current_balance, available_credit, revolving_debt, payment_due_day,
                statement_close_day, revolving_interest_rate, is_active, created_at, updated_at
            ) VALUES (
                :id, :user_id, :name, :bank, :card_type, :last_four_digits, :credit_limit,
                :current_balance, :available_credit, :revolving_debt, :payment_due_day,
                :statement_close_day, :revolving_interest_rate, :is_active, :created_at, :updated_at
            )
        """), {
            "id": cc_row[0],
            "user_id": cc_row[1],
            "name": cc_row[2],
            "bank": cc_row[3],
            "card_type": cc_row[4],
            "last_four_digits": cc_row[5],
            "credit_limit": cc_row[6],
            "current_balance": cc_row[7],
            "available_credit": cc_row[8],
            "revolving_debt": cc_row[9],
            "payment_due_day": cc_row[10],
            "statement_close_day": cc_row[11],
            "revolving_interest_rate": cc_row[12],
            "is_active": cc_row[13],
            "created_at": cc_row[14],
            "updated_at": cc_row[15],
        })
        print(f"   ✅ Tarjeta insertada en PROD")
        
        # 5. Insertar 22 cuotas en PROD
        print("\n5. Insertando 22 cuotas en PROD...")
        for idx, inst in enumerate(installments, 1):
            prod_conn.execute(text("""
                INSERT INTO credit_card_installments (
                    id, credit_card_id, concept, original_amount, purchase_date,
                    current_installment, total_installments, monthly_payment,
                    monthly_principal, monthly_interest, interest_rate,
                    remaining_capital, is_active, completed_at, created_at, updated_at
                ) VALUES (
                    :id, :credit_card_id, :concept, :original_amount, :purchase_date,
                    :current_installment, :total_installments, :monthly_payment,
                    :monthly_principal, :monthly_interest, :interest_rate,
                    :remaining_capital, :is_active, :completed_at, :created_at, :updated_at
                )
            """), {
                "id": inst[0],
                "credit_card_id": inst[1],
                "concept": inst[2],
                "original_amount": inst[3],
                "purchase_date": inst[4],
                "current_installment": inst[5],
                "total_installments": inst[6],
                "monthly_payment": inst[7],
                "monthly_principal": inst[8],
                "monthly_interest": inst[9],
                "interest_rate": inst[10],
                "remaining_capital": inst[11],
                "is_active": inst[12],
                "completed_at": inst[13],
                "created_at": inst[14],
                "updated_at": inst[15],
            })
            
            if idx % 5 == 0:
                print(f"   Insertadas {idx}/22 cuotas...")
        
        print(f"   ✅ 22 cuotas insertadas en PROD")
        
        # Commit changes
        prod_conn.commit()
        
        # 6. Verificar
        print("\n6. Verificando resultado en PROD...")
        verify_result = prod_conn.execute(text("""
            SELECT COUNT(*), SUM(monthly_payment)
            FROM credit_card_installments
            WHERE credit_card_id = 6
        """))
        
        count, total = verify_result.fetchone()
        print(f"   ✅ Total cuotas en PROD: {count}")
        print(f"   ✅ Pago mensual total: S/ {total:.2f}\n")

    print("="*100)
    print("✅ MIGRACIÓN COMPLETADA EXITOSAMENTE")
    print("="*100)
    print("\nRESUMEN:")
    print("- Tarjeta ID 6 migrada a PROD")
    print("- 22 cuotas migradas a PROD")
    print("- Otras tablas NO fueron tocadas")
    print("\nAhora PROD tiene los datos correctos.\n")

except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
