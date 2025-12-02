#!/usr/bin/env python
"""
Script para reemplazar las cuotas con los datos del PDF
Elimina las 4 antiguas e inserta las 22 correctas del EECC
"""

from sqlalchemy import create_engine, text
from datetime import datetime

DATABASE_URL = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev"

# Data from PDF - todas las 22 cuotas activas
# Format: (purchase_date, concept, original_amount, current_cuota, total_cuotas, interest_rate, monthly_interest)
pdf_cuotas_data = [
    ("2025-02-15", "IZI*HOTEL EL MIRADOR F", 886.00, 9, 10, 54.99, 102.80),
    ("2025-03-10", "MFA195 LOS ROSALES SURCOF", 336.30, 8, 10, 54.99, 37.97),
    ("2025-03-14", "INSTITUTO SUPERIOR SAN IG", 890.00, 8, 10, 54.99, 99.99),
    ("2025-05-26", "MPSOLUCIONESINFOR", 214.00, 6, 6, 0.00, 35.70),
    ("2025-06-10", "MPRISINGDRAGON", 109.00, 5, 12, 0.00, 9.08),
    ("2025-06-27", "MPMANUFACTURASSAN", 177.42, 5, 6, 59.99, 31.73),
    ("2025-08-04", "MP *8PRODUCTOS", 98.00, 4, 6, 0.00, 16.33),
    ("2025-08-04", "MDOPAGO*MERCADO PAGO", 259.12, 4, 12, 0.00, 21.59),
    ("2025-08-24", "WONG LAS GARDENIAS DV F", 358.62, 3, 6, 59.99, 59.53),
    ("2025-09-01", "MFA628 HIGUERETA F", 172.60, 3, 3, 59.99, 60.19),
    ("2025-09-09", "MDOPAGO*MDOPAGO MERCADO P", 56.16, 3, 12, 0.00, 4.68),
    ("2025-09-12", "OPENPAY*TELETICKET", 258.00, 2, 6, 59.99, 41.80),
    ("2025-09-15", "INSTITUTO SUPERIOR SAN IG", 540.00, 2, 6, 59.99, 87.14),
    ("2025-09-15", "OPENPAY*ISIL", 540.00, 2, 6, 59.99, 87.14),
    ("2025-09-28", "DP *Falabellacom", 1295.60, 2, 18, 59.99, 53.53),
    ("2025-09-30", "DLC*HOTMART F", 1837.00, 2, 18, 59.99, 75.69),
    ("2025-10-23", "MDOPAGO*MERCADO PAGO", 285.84, 1, 6, 59.99, 39.02),
    ("2025-10-23", "LIFE CAFE", 579.60, 1, 18, 59.99, 13.28),
    ("2025-10-23", "WONG LAS GARDENIAS DV F", 334.60, 1, 6, 59.99, 45.67),
    ("2025-10-26", "SKECHERS PERU F", 317.30, 1, 6, 59.99, 44.38),
    ("2025-10-27", "MPEUROAMERICANMUS", 70.00, 1, 6, 0.00, 11.66),
    ("2025-10-28", "108 PVEA AYACUCHO F", 185.34, 1, 3, 59.99, 58.14),
]

engine = create_engine(DATABASE_URL)

print("\n" + "="*100)
print("REEMPLAZANDO CUOTAS CON DATOS DEL PDF")
print("="*100 + "\n")

try:
    with engine.begin() as conn:
        # 1. Delete old installments
        print("1. Eliminando cuotas antiguas...")
        result = conn.execute(text("""
            DELETE FROM credit_card_installments
            WHERE credit_card_id = 6
        """))
        deleted = result.rowcount
        print(f"   ✅ {deleted} cuotas eliminadas\n")
        
        # 2. Insert new installments from PDF
        print("2. Insertando cuotas del PDF...")
        
        insert_count = 0
        for purchase_date, concept, original_amount, current_cuota, total_cuotas, interest_rate, monthly_interest in pdf_cuotas_data:
            # Calculate monthly_principal (approximately)
            # Assuming: monthly_principal = original_amount / total_cuotas
            monthly_principal = original_amount / total_cuotas
            
            # remaining_capital = original_amount - (monthly_principal * (current_cuota - 1))
            remaining_capital = original_amount - (monthly_principal * (current_cuota - 1))
            
            conn.execute(text("""
                INSERT INTO credit_card_installments (
                    credit_card_id, concept, original_amount, purchase_date,
                    current_installment, total_installments, monthly_payment,
                    monthly_principal, monthly_interest, interest_rate,
                    remaining_capital, is_active, created_at, updated_at
                ) VALUES (
                    :credit_card_id, :concept, :original_amount, :purchase_date,
                    :current_installment, :total_installments, :monthly_payment,
                    :monthly_principal, :monthly_interest, :interest_rate,
                    :remaining_capital, :is_active, :created_at, :updated_at
                )
            """), {
                "credit_card_id": 6,
                "concept": concept,
                "original_amount": original_amount,
                "purchase_date": purchase_date,
                "current_installment": current_cuota,
                "total_installments": total_cuotas,
                "monthly_payment": monthly_principal + monthly_interest,
                "monthly_principal": monthly_principal,
                "monthly_interest": monthly_interest,
                "interest_rate": interest_rate,
                "remaining_capital": remaining_capital,
                "is_active": True,
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
            })
            insert_count += 1
            
            # Print progress every 5 inserts
            if insert_count % 5 == 0:
                print(f"   Insertadas {insert_count}/{len(pdf_cuotas_data)} cuotas...")
        
        print(f"   ✅ {insert_count} cuotas insertadas\n")
        
        # 3. Verify the insertion
        print("3. Verificando resultado...")
        result = conn.execute(text("""
            SELECT COUNT(*), SUM(monthly_payment)
            FROM credit_card_installments
            WHERE credit_card_id = 6
        """))
        count, total_monthly = result.fetchone()
        print(f"   ✅ Total cuotas ahora: {count}")
        print(f"   ✅ Pago mensual total: S/ {total_monthly:.2f}\n")

    print("="*100)
    print("✅ ACTUALIZACIÓN COMPLETADA EXITOSAMENTE")
    print("="*100 + "\n")
    
    # Show the new data
    print("NUEVAS CUOTAS EN EL SISTEMA:\n")
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT id, concept, original_amount, current_installment, total_installments,
                   monthly_payment, interest_rate, is_active
            FROM credit_card_installments
            WHERE credit_card_id = 6
            ORDER BY id
        """))
        
        for row in result.fetchall():
            print(f"{row[0]:2}. {row[1][:30]:30} | S/ {row[2]:8.2f} | {row[3]}/{row[4]} "
                  f"| S/ {row[5]:7.2f}/mes | TEA: {row[6]:6.2f}% | Activa: {row[7]}")

except Exception as e:
    print(f"❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
