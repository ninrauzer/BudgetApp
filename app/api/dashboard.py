"""
Dashboard Router
Endpoints para métricas y resúmenes del dashboard financiero
"""
from datetime import date, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract

from app.db.database import get_db
from app.models.transaction import Transaction
from app.models.budget_plan import BudgetPlan
from app.models.category import Category
from app.models.account import Account
from app.schemas.dashboard import DashboardSummary

router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"]
)


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    year: int,
    month: int,
    db: Session = Depends(get_db)
):
    """
    Obtener resumen completo del dashboard para un mes específico
    """
    # Calcular rango de fechas
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)
    
    # Ingresos planificados
    income_planned_query = db.query(func.sum(BudgetPlan.amount)).join(Category).filter(
        and_(
            BudgetPlan.year == year,
            BudgetPlan.month == month,
            Category.type == "income"
        )
    )
    total_income_planned = income_planned_query.scalar() or 0.0
    
    # Ingresos reales
    income_actual_query = db.query(func.sum(Transaction.amount)).filter(
        and_(
            Transaction.date >= start_date,
            Transaction.date < end_date,
            Transaction.type == "income",
            Transaction.status == "completed"
        )
    )
    total_income_actual = income_actual_query.scalar() or 0.0
    
    # Gastos planificados
    expense_planned_query = db.query(func.sum(BudgetPlan.amount)).join(Category).filter(
        and_(
            BudgetPlan.year == year,
            BudgetPlan.month == month,
            Category.type == "expense"
        )
    )
    total_expense_planned = expense_planned_query.scalar() or 0.0
    
    # Gastos reales
    expense_actual_query = db.query(func.sum(Transaction.amount)).filter(
        and_(
            Transaction.date >= start_date,
            Transaction.date < end_date,
            Transaction.type == "expense",
            Transaction.status == "completed"
        )
    )
    total_expense_actual = expense_actual_query.scalar() or 0.0
    
    # Ahorros planificados
    saving_planned_query = db.query(func.sum(BudgetPlan.amount)).join(Category).filter(
        and_(
            BudgetPlan.year == year,
            BudgetPlan.month == month,
            Category.type == "saving"
        )
    )
    total_saving_planned = saving_planned_query.scalar() or 0.0
    
    # Balances
    balance_planned = total_income_planned - total_expense_planned - total_saving_planned
    balance_actual = total_income_actual - total_expense_actual
    
    # Varianza
    variance = balance_actual - balance_planned
    variance_percentage = (variance / balance_planned * 100) if balance_planned != 0 else 0.0
    
    return DashboardSummary(
        total_income_planned=total_income_planned,
        total_income_actual=total_income_actual,
        total_expense_planned=total_expense_planned,
        total_expense_actual=total_expense_actual,
        total_saving_planned=total_saving_planned,
        balance_planned=balance_planned,
        balance_actual=balance_actual,
        variance=variance,
        variance_percentage=round(variance_percentage, 2)
    )

