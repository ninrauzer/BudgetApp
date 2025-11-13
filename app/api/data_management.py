"""
Data Management Router
Endpoints para gestión de datos (limpiar, cargar demo, etc.)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta
import random

from app.db.database import get_db
from app.models.transaction import Transaction
from app.models.budget_plan import BudgetPlan
from app.models.category import Category
from app.models.account import Account

router = APIRouter(
    prefix="/api/data",
    tags=["data-management"]
)


@router.delete("/clear-all")
def clear_all_data(db: Session = Depends(get_db)):
    """
    Eliminar todas las transacciones y planes de presupuesto
    (mantiene categorías y cuentas)
    """
    try:
        # Eliminar transacciones
        transactions_deleted = db.query(Transaction).delete()
        
        # Eliminar planes de presupuesto
        budgets_deleted = db.query(BudgetPlan).delete()
        
        db.commit()
        
        return {
            "success": True,
            "message": "Datos eliminados correctamente",
            "transactions_deleted": transactions_deleted,
            "budgets_deleted": budgets_deleted
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/load-demo")
def load_demo_data(db: Session = Depends(get_db)):
    """
    Cargar datos de demostración para probar la aplicación
    """
    try:
        # Obtener categorías y cuentas existentes
        categories = db.query(Category).all()
        accounts = db.query(Account).all()
        
        if not categories or not accounts:
            raise HTTPException(
                status_code=400,
                detail="Debe tener al menos una categoría y una cuenta para cargar datos demo"
            )
        
        # Categorías por tipo
        income_cats = [c for c in categories if c.type == 'income']
        expense_cats = [c for c in categories if c.type == 'expense']
        saving_cats = [c for c in categories if c.type == 'saving']
        
        account = accounts[0]  # Usar primera cuenta
        
        # Generar transacciones de los últimos 3 meses
        today = date.today()
        transactions_created = 0
        
        for month_offset in range(3):
            # Calcular fecha base del mes
            month_date = today - timedelta(days=30 * month_offset)
            year = month_date.year
            month = month_date.month
            
            # Ingresos (1-2 por mes)
            for _ in range(random.randint(1, 2)):
                if income_cats:
                    cat = random.choice(income_cats)
                    amount = random.choice([3000, 3500, 4000, 5000, 10000])
                    day = random.randint(1, 28)
                    
                    transaction = Transaction(
                        date=date(year, month, day),
                        category_id=cat.id,
                        account_id=account.id,
                        amount=amount,
                        type='income',
                        description=f"Ingreso demo - {cat.name}",
                        status='completed',
                        currency='PEN',
                        amount_pen=amount
                    )
                    db.add(transaction)
                    transactions_created += 1
            
            # Gastos (8-15 por mes)
            for _ in range(random.randint(8, 15)):
                if expense_cats:
                    cat = random.choice(expense_cats)
                    amount = round(random.uniform(50, 500), 2)
                    day = random.randint(1, 28)
                    
                    transaction = Transaction(
                        date=date(year, month, day),
                        category_id=cat.id,
                        account_id=account.id,
                        amount=amount,
                        type='expense',
                        description=f"Gasto demo - {cat.name}",
                        status='completed',
                        currency='PEN',
                        amount_pen=amount
                    )
                    db.add(transaction)
                    transactions_created += 1
            
            # Ahorros (0-2 por mes)
            for _ in range(random.randint(0, 2)):
                if saving_cats:
                    cat = random.choice(saving_cats)
                    amount = random.choice([200, 300, 500, 1000])
                    day = random.randint(1, 28)
                    
                    transaction = Transaction(
                        date=date(year, month, day),
                        category_id=cat.id,
                        account_id=account.id,
                        amount=amount,
                        type='saving',
                        description=f"Ahorro demo - {cat.name}",
                        status='completed',
                        currency='PEN',
                        amount_pen=amount
                    )
                    db.add(transaction)
                    transactions_created += 1
        
        # Crear planes de presupuesto para el año actual
        budgets_created = 0
        current_year = today.year
        
        for month in range(1, 13):
            # Presupuesto de ingresos
            for cat in income_cats[:3]:  # Solo las primeras 3
                amount = random.choice([3000, 4000, 5000, 10000])
                budget = BudgetPlan(
                    year=current_year,
                    month=month,
                    category_id=cat.id,
                    amount=amount
                )
                db.add(budget)
                budgets_created += 1
            
            # Presupuesto de gastos
            for cat in expense_cats[:5]:  # Solo las primeras 5
                amount = random.choice([200, 300, 500, 800, 1000])
                budget = BudgetPlan(
                    year=current_year,
                    month=month,
                    category_id=cat.id,
                    amount=amount
                )
                db.add(budget)
                budgets_created += 1
            
            # Presupuesto de ahorros
            for cat in saving_cats[:2]:  # Solo las primeras 2
                amount = random.choice([500, 1000, 1500])
                budget = BudgetPlan(
                    year=current_year,
                    month=month,
                    category_id=cat.id,
                    amount=amount
                )
                db.add(budget)
                budgets_created += 1
        
        db.commit()
        
        return {
            "success": True,
            "message": "Datos demo cargados correctamente",
            "transactions_created": transactions_created,
            "budgets_created": budgets_created
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
