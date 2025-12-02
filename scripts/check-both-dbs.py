#!/usr/bin/env python3
"""
Check what data exists in both databases
"""

from sqlalchemy import create_engine, text

DATABASE_DEV = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev"
DATABASE_PROD = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod"

for db_name, db_url in [("DEV", DATABASE_DEV), ("PROD", DATABASE_PROD)]:
    print("\n" + "=" * 80)
    print(f"DATABASE: {db_name}")
    print("=" * 80)
    
    try:
        engine = create_engine(db_url)
        
        with engine.connect() as conn:
            # Credit cards
            result = conn.execute(text("SELECT COUNT(*) FROM credit_cards"))
            cc_count = result.scalar()
            print(f"Tarjetas de crédito: {cc_count}")
            
            # Installments
            result = conn.execute(text("SELECT COUNT(*) FROM credit_card_installments"))
            inst_count = result.scalar()
            print(f"Cuotas: {inst_count}")
            
            if inst_count > 0:
                result = conn.execute(text("""
                    SELECT concept, monthly_payment, current_installment, total_installments
                    FROM credit_card_installments
                    LIMIT 5
                """))
                print("\nMuestras de cuotas:")
                for row in result:
                    print(f"  - {row[0]}: Cuota {row[2]}/{row[3]} @ S/ {row[1]}/mes")
    
    except Exception as e:
        print(f"Error: {e}")
