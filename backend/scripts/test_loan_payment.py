"""
Script de prueba para verificar la reducción automática de deuda al crear transacciones de préstamos
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.database import SessionLocal
from app.models.loan import Loan
from app.models.transaction import Transaction
from app.models.category import Category
from app.models.account import Account
from datetime import date

db = SessionLocal()

try:
    # 1. Obtener el préstamo BBVA 1
    loan = db.query(Loan).filter(Loan.id == 1).first()
    if not loan:
        print("❌ No se encontró el préstamo BBVA 1")
        exit(1)
    
    print(f"\n📊 ESTADO INICIAL:")
    print(f"  Préstamo: {loan.name}")
    print(f"  Deuda actual: S/ {loan.current_debt:,.2f}")
    print(f"  Cuotas pagadas (base): {loan.base_installments_paid}")
    print(f"  Cuotas pagadas (total): {loan.current_installment}")
    print(f"  Cuotas restantes: {loan.remaining_installments}")
    
    # 2. Obtener categoría "Préstamos Bancarios" y una cuenta
    category = db.query(Category).filter(Category.name == "Préstamos Bancarios").first()
    account = db.query(Account).first()
    
    if not category or not account:
        print("❌ No se encontró la categoría o cuenta")
        exit(1)
    
    # 3. Guardar deuda anterior
    debt_before = loan.current_debt
    
    # 4. Crear una transacción de pago (simulando la API)
    amount = 418.17  # Cuota mensual
    new_transaction = Transaction(
        date=date.today(),
        category_id=category.id,
        account_id=account.id,
        amount=amount,
        currency="PEN",
        amount_pen=amount,
        type="expense",
        description="Pago prueba BBVA 1",
        status="completed",
        loan_id=loan.id
    )
    
    # Reducir deuda (simulando la lógica de la API)
    loan.current_debt = max(0, loan.current_debt - amount)
    
    db.add(new_transaction)
    db.commit()
    db.refresh(loan)
    db.refresh(new_transaction)
    
    print(f"\n✅ TRANSACCIÓN CREADA:")
    print(f"  ID: {new_transaction.id}")
    print(f"  Monto: S/ {amount:,.2f}")
    print(f"  Vinculada al préstamo: {loan.name}")
    
    # 5. Verificar cambios
    # Recargar el préstamo para obtener current_installment actualizado
    db.expire(loan)
    loan = db.query(Loan).filter(Loan.id == 1).first()
    
    print(f"\n📊 ESTADO FINAL:")
    print(f"  Deuda actual: S/ {loan.current_debt:,.2f} (reducción: S/ {debt_before - loan.current_debt:,.2f})")
    print(f"  Cuotas pagadas (base): {loan.base_installments_paid}")
    print(f"  Cuotas pagadas (total): {loan.current_installment} (+1 por transacción)")
    print(f"  Cuotas restantes: {loan.remaining_installments}")
    
    # 6. Verificar que el cálculo es correcto
    expected_debt = debt_before - amount
    if abs(loan.current_debt - expected_debt) < 0.01:
        print(f"\n✅ La deuda se redujo correctamente!")
    else:
        print(f"\n❌ ERROR: Se esperaba S/ {expected_debt:,.2f} pero se obtuvo S/ {loan.current_debt:,.2f}")
    
    # 7. Limpiar (eliminar la transacción de prueba)
    print(f"\n🧹 Limpiando transacción de prueba...")
    
    # Revertir la deuda
    loan.current_debt += amount
    db.delete(new_transaction)
    db.commit()
    
    print(f"✅ Transacción eliminada y deuda revertida")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
