#!/usr/bin/env python3
"""
Clean up budgetapp_prod - delete all incorrect cards, keep only BBVA (ID: 6)
"""

from sqlalchemy import create_engine, text

DATABASE_PROD = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_prod"

print("=" * 80)
print("LIMPIANDO budgetapp_prod - Eliminando tarjetas duplicadas")
print("=" * 80)

engine_prod = create_engine(DATABASE_PROD)

try:
    with engine_prod.connect() as conn:
        
        # First, get all cards
        print("\n1. Tarjetas actuales en budgetapp_prod:")
        result = conn.execute(text("SELECT id, name, bank FROM credit_cards ORDER BY id"))
        cards = result.fetchall()
        for card in cards:
            status = "✅ MANTENER" if card[0] == 6 else "❌ ELIMINAR"
            print(f"   ID {card[0]}: {card[1]} ({card[2]}) - {status}")
        
        # Delete all cards except ID 6
        print("\n2. Eliminando tarjetas incorrectas...")
        
        # First delete installments for cards that will be deleted
        result = conn.execute(text("DELETE FROM credit_card_installments WHERE credit_card_id != 6"))
        conn.commit()
        deleted_insts = result.rowcount
        print(f"   ✅ {deleted_insts} cuota(s) de tarjetas incorrectas eliminada(s)")
        
        # Now delete the incorrect cards
        result = conn.execute(text("DELETE FROM credit_cards WHERE id != 6"))
        conn.commit()
        deleted = result.rowcount
        print(f"   ✅ {deleted} tarjeta(s) incorrecta(s) eliminada(s)")
        
        # Verify
        print("\n3. Verificando resultado:")
        result = conn.execute(text("SELECT COUNT(*) FROM credit_cards"))
        count = result.scalar()
        print(f"   ✅ Tarjetas restantes en budgetapp_prod: {count}")
        
        result = conn.execute(text("SELECT COUNT(*) FROM credit_card_installments"))
        inst_count = result.scalar()
        print(f"   ✅ Cuotas en budgetapp_prod: {inst_count}")
        
        print("\n" + "=" * 80)
        print("✅ LIMPIEZA COMPLETADA")
        print("=" * 80)

except Exception as e:
    print(f"\n❌ ERROR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
