#!/usr/bin/env python3
"""
Direct database connection check using SQLAlchemy
"""

from sqlalchemy import create_engine, text
import os

# Use the exact DATABASE_URL from .env
DATABASE_URL = "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev"

print("=" * 80)
print("VERIFICANDO CONEXIÓN A budgetapp_dev VIA SQLALCHEMY")
print("=" * 80)
print(f"\nURL: {DATABASE_URL}")

try:
    # Create engine
    engine = create_engine(DATABASE_URL)
    
    # Test connection
    with engine.connect() as connection:
        print("\n✅ Conectado a la base de datos\n")
        
        # Query credit cards
        print("=" * 80)
        print("TARJETAS DE CRÉDITO EN budgetapp_dev:")
        print("=" * 80)
        
        result = connection.execute(text("""
            SELECT id, name, bank, credit_limit, current_balance, is_active
            FROM credit_cards
            ORDER BY id DESC
        """))
        
        rows = result.fetchall()
        if rows:
            for row in rows:
                print(f"ID: {row[0]} | {row[1]} ({row[2]}) | Límite: S/ {row[3]} | Saldo: S/ {row[4]} | Activa: {row[5]}")
        else:
            print("❌ No hay tarjetas de crédito")
        
        # Query installments
        print("\n" + "=" * 80)
        print("CUOTAS EN budgetapp_dev:")
        print("=" * 80)
        
        result = connection.execute(text("""
            SELECT id, credit_card_id, concept, monthly_payment, current_installment, total_installments, is_active
            FROM credit_card_installments
            ORDER BY id
        """))
        
        rows = result.fetchall()
        if rows:
            print(f"Total cuotas encontradas: {len(rows)}\n")
            for row in rows:
                print(f"ID: {row[0]} | Tarjeta: {row[1]} | {row[2]} | Cuota {row[4]}/{row[5]} | S/ {row[3]}/mes | Activa: {row[6]}")
        else:
            print("❌ No hay cuotas")
        
        print("\n" + "=" * 80)
        print("✅ VERIFICACIÓN EXITOSA: budgetapp_dev está siendo usada")
        print("=" * 80)

except Exception as e:
    print(f"\n❌ ERROR: {type(e).__name__}: {e}")
    print("\nVerifica que PostgreSQL esté corriendo en WSL2")
