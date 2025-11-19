#!/usr/bin/env python3
"""
Script para cargar datos de prueba en budget.db
"""
import sys
import os
from datetime import datetime, timedelta
from decimal import Decimal

# Agregar backend al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal, engine, init_db
from app.models import Account, Transaction, Category
from sqlalchemy.orm import Session

def seed_data():
    """Carga datos iniciales de prueba"""
    
    # Inicializar BD si no existe
    init_db()
    
    db = SessionLocal()
    
    try:
        # Verificar si ya hay transacciones
        existing_transactions = db.query(Transaction).count()
        if existing_transactions > 0:
            print(f"✓ Ya hay {existing_transactions} transacciones en la BD")
            return
        
        print("[*] Cargando datos de prueba...")
        
        # Obtener o crear cuentas
        accounts = db.query(Account).all()
        if not accounts:
            print("  [+] Creando cuentas...")
            cuenta1 = Account(
                name="Mi Billetera",
                currency="PEN",
                balance=Decimal("5000.00"),
                is_primary=True
            )
            cuenta2 = Account(
                name="Ahorros",
                currency="PEN",
                balance=Decimal("10000.00"),
                is_primary=False
            )
            db.add_all([cuenta1, cuenta2])
            db.commit()
            accounts = [cuenta1, cuenta2]
        else:
            print(f"  [+] {len(accounts)} cuentas existentes")
        
        # Obtener categorías
        categories = db.query(Category).all()
        if not categories:
            print("  [-] No hay categorias. Ejecuta init_db.py primero")
            return
        
        print(f"  [+] {len(categories)} categorias disponibles")
        
        # Crear transacciones de prueba
        today = datetime.now().date()
        transactions_data = [
            # Ingresos
            ("Salario Mensual", Decimal("5000.00"), "income", "Salario", today - timedelta(days=0)),
            ("Freelance Proyecto", Decimal("1500.00"), "income", "Freelance", today - timedelta(days=5)),
            
            # Gastos
            ("Supermercado", Decimal("-350.50"), "expense", "Alimentación", today - timedelta(days=1)),
            ("Netflix", Decimal("-44.90"), "expense", "Entretenimiento", today - timedelta(days=2)),
            ("Gasolina", Decimal("-120.00"), "expense", "Transporte", today - timedelta(days=3)),
            ("Farmacia", Decimal("-85.00"), "expense", "Salud", today - timedelta(days=4)),
            ("Amazon Prime", Decimal("-99.00"), "expense", "Entretenimiento", today - timedelta(days=6)),
            ("Mercado", Decimal("-280.75"), "expense", "Alimentación", today - timedelta(days=7)),
            ("BCP - Pago Tarjeta", Decimal("-500.00"), "expense", "Finanzas", today - timedelta(days=8)),
        ]
        
        created = 0
        for desc, amount, trans_type, cat_name, trans_date in transactions_data:
            # Buscar categoría
            category = next((c for c in categories if cat_name.lower() in c.name.lower()), None)
            if not category:
                # Usar primera categoría del tipo
                category = next((c for c in categories if c.type == trans_type), None)
            
            if category:
                tx = Transaction(
                    account_id=accounts[0].id,
                    category_id=category.id,
                    amount=amount,
                    description=desc,
                    date=trans_date,
                    notes="Dato de prueba"
                )
                db.add(tx)
                created += 1
        
        db.commit()
        print(f"\n[SUCCESS] {created} transacciones de prueba cargadas exitosamente")
        
        # Mostrar resumen
        income_sum = db.query(Transaction).filter(Transaction.amount > 0).with_entities(
            db.func.sum(Transaction.amount)
        ).scalar() or 0
        expense_sum = db.query(Transaction).filter(Transaction.amount < 0).with_entities(
            db.func.sum(Transaction.amount)
        ).scalar() or 0
        
        print(f"\n[REPORT] Resumen:")
        print(f"   Ingresos: S/ {float(income_sum):,.2f}")
        print(f"   Gastos: S/ {float(expense_sum):,.2f}")
        print(f"   Balance: S/ {float(income_sum + expense_sum):,.2f}")
        
    except Exception as e:
        print(f"[ERROR] {type(e).__name__}: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
