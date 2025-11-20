"""
Test del endpoint /api/dashboard/upcoming-payments
Simula la lógica directamente sin TestClient
"""
from datetime import date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.loan import Loan, LoanStatus
from app.models.credit_card import CreditCard
from calendar import monthrange
import os

db_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@192.168.126.127:5432/budgetapp_dev")
engine = create_engine(db_url)
Session = sessionmaker(bind=engine)
session = Session()

print("=" * 70)
print("🧪 Simulando: GET /api/dashboard/upcoming-payments")
print("=" * 70)

today = date.today()
seven_days_later = today + timedelta(days=7)

print(f"\n📅 Período: {today} a {seven_days_later}")
print()

upcoming_payments = []
total_amount = 0.0

# 1. PRÉSTAMOS ACTIVOS
print("💰 Buscando PRÉSTAMOS ACTIVOS...")
active_loans = session.query(Loan).filter(Loan.status == LoanStatus.ACTIVE).all()

for loan in active_loans:
    if loan.payment_day:
        # Determinar la próxima fecha de pago
        if today.day <= loan.payment_day:
            payment_month = today.month
            payment_year = today.year
        else:
            next_month = today + timedelta(days=30)
            payment_month = next_month.month
            payment_year = next_month.year
        
        # Ajustar si el día no existe en ese mes
        last_day_of_month = monthrange(payment_year, payment_month)[1]
        payment_day = min(loan.payment_day, last_day_of_month)
        payment_date = date(payment_year, payment_month, payment_day)
        
        # Si está dentro de los próximos 7 días
        if today <= payment_date <= seven_days_later:
            days_until_due = (payment_date - today).days
            
            payment_info = {
                'type': 'loan',
                'entity': loan.entity,
                'name': loan.name,
                'amount': loan.monthly_payment,
                'payment_date': payment_date.isoformat(),
                'days_until_due': days_until_due
            }
            upcoming_payments.append(payment_info)
            total_amount += loan.monthly_payment
            
            print(f"  ✅ Préstamo: {loan.name} ({loan.entity})")
            print(f"     - Monto: S/ {loan.monthly_payment:.2f}")
            print(f"     - Fecha: {payment_date}")
            print(f"     - Días: {days_until_due}")
            print()

if not [p for p in upcoming_payments if p['type'] == 'loan']:
    print("  ❌ No hay préstamos en los próximos 7 días\n")

# 2. TARJETAS DE CRÉDITO ACTIVAS
print("💳 Buscando TARJETAS DE CRÉDITO ACTIVAS...")
active_cards = session.query(CreditCard).filter(CreditCard.is_active == True).all()

for card in active_cards:
    if card.payment_due_day:
        # Determinar la próxima fecha de pago
        if today.day <= card.payment_due_day:
            payment_month = today.month
            payment_year = today.year
        else:
            next_month = today + timedelta(days=30)
            payment_month = next_month.month
            payment_year = next_month.year
        
        # Ajustar si el día no existe en ese mes
        last_day_of_month = monthrange(payment_year, payment_month)[1]
        payment_day = min(card.payment_due_day, last_day_of_month)
        payment_date = date(payment_year, payment_month, payment_day)
        
        # Si está dentro de los próximos 7 días
        if today <= payment_date <= seven_days_later:
            days_until_due = (payment_date - today).days
            
            payment_info = {
                'type': 'credit_card',
                'entity': card.bank,
                'name': card.name,
                'amount': float(card.current_balance),
                'payment_date': payment_date.isoformat(),
                'days_until_due': days_until_due
            }
            upcoming_payments.append(payment_info)
            total_amount += float(card.current_balance)
            
            print(f"  ✅ Tarjeta: {card.name} ({card.bank})")
            print(f"     - Saldo (monto a pagar): S/ {card.current_balance:.2f}")
            print(f"     - Fecha: {payment_date}")
            print(f"     - Días: {days_until_due}")
            print()

if not [p for p in upcoming_payments if p['type'] == 'credit_card']:
    print("  ❌ No hay tarjetas en los próximos 7 días\n")

# Resumen
print("=" * 70)
print("📊 RESUMEN PRÓXIMOS PAGOS")
print("=" * 70)
print(f"\n✅ Total de próximos pagos: {len(upcoming_payments)}")
print(f"💰 Monto total: S/ {total_amount:.2f}")

if upcoming_payments:
    print("\n📋 Detalle:")
    upcoming_payments_sorted = sorted(upcoming_payments, key=lambda x: x['payment_date'])
    for p in upcoming_payments_sorted:
        print(f"  • {p['payment_date']}: {p['entity']} - {p['name']} - S/ {p['amount']:.2f}")
else:
    print("\n❌ No hay pagos en los próximos 7 días")

print("\n" + "=" * 70)

session.close()
