from datetime import date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.loan import Loan, LoanStatus
from app.models.credit_card import CreditCard
import os

# Usar la BD de desarrollo
db_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev")
engine = create_engine(db_url)
Session = sessionmaker(bind=engine)
session = Session()

print("=" * 60)
print("📊 ANÁLISIS: Próximos Pagos (próximos 7 días)")
print("=" * 60)

today = date.today()
seven_days = today + timedelta(days=7)
print(f"\n📅 Período: {today} a {seven_days}")
print()

# Préstamos activos
print("💰 PRÉSTAMOS ACTIVOS:")
print("-" * 60)
loans = session.query(Loan).filter(Loan.status == LoanStatus.ACTIVE).all()
if not loans:
    print("  ❌ No hay préstamos activos")
else:
    for loan in loans:
        print(f"  • {loan.name} ({loan.entity})")
        print(f"    - Payment day: {loan.payment_day}")
        print(f"    - Monthly: S/ {loan.monthly_payment}")

print("\n💳 TARJETAS DE CRÉDITO ACTIVAS:")
print("-" * 60)
cards = session.query(CreditCard).filter(CreditCard.is_active == True).all()
if not cards:
    print("  ❌ No hay tarjetas activas")
else:
    for card in cards:
        print(f"  • {card.name} ({card.bank})")
        print(f"    - Payment due day: {card.payment_due_day}")
        print(f"    - Current balance: S/ {card.current_balance}")
        print(f"    - Available: S/ {card.available_credit}")

session.close()
print("\n" + "=" * 60)
