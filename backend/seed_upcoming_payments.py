"""
Script para crear datos de prueba en Próximos Pagos
Crea un préstamo y una tarjeta de crédito con fechas de pago en los próximos 7 días
"""
from datetime import date, timedelta
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.loan import Loan, LoanStatus
from app.models.credit_card import CreditCard
import os

db_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev")
engine = create_engine(db_url)
Session = sessionmaker(bind=engine)
session = Session()

try:
    # 1. Crear un préstamo con pago en los próximos 7 días
    today = date.today()
    next_payment_day = (today + timedelta(days=3)).day  # Dentro de 3 días
    
    existing_loan = session.query(Loan).filter(Loan.name == "Test Préstamo").first()
    if existing_loan:
        session.delete(existing_loan)
        print("🗑️  Eliminado préstamo anterior")
    
    loan = Loan(
        name="Test Préstamo",
        entity="Banco de Prueba",
        original_amount=10000.0,
        current_debt=5000.0,
        annual_rate=8.5,
        monthly_payment=500.0,
        total_installments=20,
        base_installments_paid=10,
        payment_day=next_payment_day,
        start_date=today - timedelta(days=30),
        status=LoanStatus.ACTIVE
    )
    session.add(loan)
    print(f"✅ Préstamo creado: {loan.name} (pago día {next_payment_day})")
    
    # 2. Crear una tarjeta de crédito con pago en los próximos 7 días
    next_due_day = (today + timedelta(days=5)).day  # Dentro de 5 días
    
    existing_card = session.query(CreditCard).filter(CreditCard.name == "Test Tarjeta").first()
    if existing_card:
        session.delete(existing_card)
        print("🗑️  Eliminada tarjeta anterior")
    
    card = CreditCard(
        name="Test Tarjeta",
        bank="BCP",
        card_type="Visa",
        last_four_digits="1111",
        credit_limit=5000.0,
        current_balance=1250.0,
        available_credit=3750.0,
        payment_due_day=next_due_day,
        statement_close_day=25,
        revolving_interest_rate=3.5,
        is_active=True
    )
    session.add(card)
    print(f"✅ Tarjeta creada: {card.name} (pago día {next_due_day})")
    
    session.commit()
    print("\n✅ Datos de prueba creados exitosamente")
    
except Exception as e:
    session.rollback()
    print(f"❌ Error: {e}")
finally:
    session.close()
