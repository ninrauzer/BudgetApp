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
from app.models.billing_cycle import BillingCycle
from app.schemas.dashboard import DashboardSummary
from app.services.billing_cycle import get_cycle_for_date, get_cycle_by_offset

router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"]
)


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Obtener resumen completo del dashboard para un período específico.
    Si no se proporcionan fechas, usa el ciclo actual basado en billing_cycle configurado.
    """
    # Get billing cycle configuration
    billing_cycle = db.query(BillingCycle).filter(BillingCycle.is_active == True).first()
    
    if not billing_cycle:
        # Create default if doesn't exist
        billing_cycle = BillingCycle(name="default", start_day=1, is_active=True)
        db.add(billing_cycle)
        db.commit()
    
    # Calculate date range
    if start_date and end_date:
        # Use provided dates
        period_start = datetime.strptime(start_date, "%Y-%m-%d").date()
        period_end = datetime.strptime(end_date, "%Y-%m-%d").date()
    else:
        # Use current billing cycle
        cycle_info = get_cycle_for_date(billing_cycle.start_day)
        period_start = datetime.strptime(cycle_info["start_date"], "%Y-%m-%d").date()
        period_end = datetime.strptime(cycle_info["end_date"], "%Y-%m-%d").date()
    
    # Ingresos planificados (for now, we'll keep this 0 until budget plans are updated)
    total_income_planned = 0.0
    
    # Ingresos reales
    income_actual_query = db.query(func.sum(Transaction.amount)).filter(
        and_(
            Transaction.date >= period_start,
            Transaction.date <= period_end,
            Transaction.type == "income"
        )
    )
    total_income_actual = income_actual_query.scalar() or 0.0
    
    # Gastos planificados (for now, we'll keep this 0 until budget plans are updated)
    total_expense_planned = 0.0
    
    # Gastos reales
    expense_actual_query = db.query(func.sum(Transaction.amount)).filter(
        and_(
            Transaction.date >= period_start,
            Transaction.date <= period_end,
            Transaction.type == "expense"
        )
    )
    total_expense_actual = expense_actual_query.scalar() or 0.0
    
    # Ahorros planificados (for now, we'll keep this 0 until budget plans are updated)
    total_saving_planned = 0.0
    
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

