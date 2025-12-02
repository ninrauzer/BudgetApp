#!/usr/bin/env python3
"""
Sync credit card data from budgetapp_prod to budgetapp_dev
"""

from sqlalchemy import create_engine, text

DATABASE_DEV = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev"
DATABASE_PROD = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod"

print("=" * 80)
print("SINCRONIZANDO DATOS: budgetapp_prod → budgetapp_dev")
print("=" * 80)

engine_dev = create_engine(DATABASE_DEV)
engine_prod = create_engine(DATABASE_PROD)

try:
    with engine_prod.connect() as conn_prod:
        with engine_dev.connect() as conn_dev:
            
            # Get data from PROD
            print("\n1. Leyendo tarjetas de prod...")
            result_cards = conn_prod.execute(text("""
                SELECT id, name, bank, card_type, last_four_digits, credit_limit, 
                       payment_due_day, statement_close_day, revolving_interest_rate,
                       current_balance, available_credit, revolving_debt, is_active,
                       created_at, updated_at
                FROM credit_cards
                WHERE id = 6
            """))
            
            cards = result_cards.fetchall()
            print(f"   ✅ {len(cards)} tarjeta(s) leída(s)")
            
            print("\n2. Leyendo cuotas de prod...")
            result_insts = conn_prod.execute(text("""
                SELECT id, credit_card_id, concept, original_amount, purchase_date,
                       current_installment, total_installments, monthly_payment,
                       monthly_principal, monthly_interest, interest_rate,
                       remaining_capital, is_active, created_at
                FROM credit_card_installments
                WHERE credit_card_id = 6
            """))
            
            insts = result_insts.fetchall()
            print(f"   ✅ {len(insts)} cuota(s) leída(s)")
            
            # Clear DEV database first (keep Test Tarjeta)
            print("\n3. Limpiando cuotas en dev...")
            conn_dev.execute(text("DELETE FROM credit_card_installments WHERE credit_card_id > 1"))
            conn_dev.commit()
            print("   ✅ Limpiado")
            
            # Insert tarjeta into DEV (replace ID 1)
            print("\n4. Insertando tarjeta en dev...")
            for card in cards:
                conn_dev.execute(text("""
                    INSERT INTO credit_cards 
                    (id, name, bank, card_type, last_four_digits, credit_limit, 
                     payment_due_day, statement_close_day, revolving_interest_rate,
                     current_balance, available_credit, revolving_debt, is_active,
                     created_at, updated_at)
                    VALUES (:id, :name, :bank, :card_type, :last_four_digits, :credit_limit,
                            :payment_due_day, :statement_close_day, :revolving_interest_rate,
                            :current_balance, :available_credit, :revolving_debt, :is_active,
                            :created_at, :updated_at)
                    ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    bank = EXCLUDED.bank,
                    credit_limit = EXCLUDED.credit_limit,
                    current_balance = EXCLUDED.current_balance,
                    available_credit = EXCLUDED.available_credit,
                    updated_at = EXCLUDED.updated_at
                """), {
                    'id': card[0],
                    'name': card[1],
                    'bank': card[2],
                    'card_type': card[3],
                    'last_four_digits': card[4],
                    'credit_limit': card[5],
                    'payment_due_day': card[6],
                    'statement_close_day': card[7],
                    'revolving_interest_rate': card[8],
                    'current_balance': card[9],
                    'available_credit': card[10],
                    'revolving_debt': card[11],
                    'is_active': card[12],
                    'created_at': card[13],
                    'updated_at': card[14],
                })
            conn_dev.commit()
            print("   ✅ Tarjeta insertada/actualizada")
            
            # Insert cuotas into DEV
            print("\n5. Insertando cuotas en dev...")
            for inst in insts:
                conn_dev.execute(text("""
                    INSERT INTO credit_card_installments
                    (id, credit_card_id, concept, original_amount, purchase_date,
                     current_installment, total_installments, monthly_payment,
                     monthly_principal, monthly_interest, interest_rate,
                     remaining_capital, is_active, created_at, updated_at)
                    VALUES (:id, :credit_card_id, :concept, :original_amount, :purchase_date,
                            :current_installment, :total_installments, :monthly_payment,
                            :monthly_principal, :monthly_interest, :interest_rate,
                            :remaining_capital, :is_active, :created_at, :updated_at)
                    ON CONFLICT (id) DO NOTHING
                """), {
                    'id': inst[0],
                    'credit_card_id': inst[1],
                    'concept': inst[2],
                    'original_amount': inst[3],
                    'purchase_date': inst[4],
                    'current_installment': inst[5],
                    'total_installments': inst[6],
                    'monthly_payment': inst[7],
                    'monthly_principal': inst[8],
                    'monthly_interest': inst[9],
                    'interest_rate': inst[10],
                    'remaining_capital': inst[11],
                    'is_active': inst[12],
                    'created_at': inst[13],
                    'updated_at': inst[13],  # Use same as created_at
                })
            conn_dev.commit()
            print(f"   ✅ {len(insts)} cuota(s) insertada(s)")
            
            print("\n" + "=" * 80)
            print("✅ SINCRONIZACIÓN COMPLETADA")
            print("=" * 80)
            
except Exception as e:
    print(f"\n❌ ERROR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
