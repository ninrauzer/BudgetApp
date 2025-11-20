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
from app.models.loan import Loan, LoanStatus
from app.models.credit_card import CreditCard
from app.schemas.dashboard import (
    DashboardSummary, MonthlyAvailable, SpendingStatus, 
    MonthlyCashflow, DailyDataPoint, DebtSummary,
    UpcomingPayments, UpcomingPayment, MonthProjection, ProblemCategory
)
from app.services.billing_cycle import get_cycle_for_date, get_cycle_by_offset
from calendar import monthrange
from datetime import timedelta

router = APIRouter(
    prefix="/dashboard",
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
    income_actual_query = db.query(func.sum(Transaction.amount_pen)).filter(
        and_(
            Transaction.date >= period_start,
            Transaction.date <= period_end,
                Transaction.type == "income",
                Transaction.transaction_type != 'transfer'
        )
    )
    total_income_actual = income_actual_query.scalar() or 0.0
    
    # Gastos planificados (for now, we'll keep this 0 until budget plans are updated)
    total_expense_planned = 0.0
    
    # Gastos reales
    expense_actual_query = db.query(func.sum(Transaction.amount_pen)).filter(
        and_(
            Transaction.date >= period_start,
            Transaction.date <= period_end,
                Transaction.type == "expense",
                Transaction.transaction_type != 'transfer'
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


@router.get("/monthly-available", response_model=MonthlyAvailable)
def get_monthly_available(
    cycle_offset: Optional[int] = Query(0, description="Offset de ciclo (0=actual, -1=anterior, 1=siguiente)"),
    db: Session = Depends(get_db)
):
    """
    Calcula el saldo disponible hasta fin del ciclo presupuestal.
    
    Fórmula: Ingresos del ciclo - Gastos Fijos presupuestados - Gastos Variables realizados
    
    Retorna:
    - available_amount: Saldo libre hasta fin del ciclo
    - days_remaining: Días restantes del período
    - daily_limit: Límite diario sugerido (disponible / días restantes)
    - health_status: healthy (>20% del ingreso), warning (5-20%), critical (<5%)
    """
    # Obtener billing cycle activo
    billing_cycle = db.query(BillingCycle).filter(BillingCycle.is_active == True).first()
    if not billing_cycle:
        billing_cycle = BillingCycle(name="default", start_day=1, is_active=True)
        db.add(billing_cycle)
        db.commit()
    
    # Obtener ciclo (actual o con offset)
    cycle_info = get_cycle_by_offset(billing_cycle.start_day, cycle_offset)
    period_start = datetime.strptime(cycle_info["start_date"], "%Y-%m-%d").date()
    period_end = datetime.strptime(cycle_info["end_date"], "%Y-%m-%d").date()
    
    # Días restantes (si es ciclo actual, sino días totales del ciclo)
    today = date.today()
    if period_start <= today <= period_end:
        days_remaining = (period_end - today).days + 1  # +1 para incluir hoy
    else:
        days_remaining = (period_end - period_start).days + 1
    
    # 1. INGRESOS DEL CICLO (transacciones reales)
    monthly_income = db.query(func.sum(Transaction.amount_pen)).filter(
        and_(
            Transaction.date >= period_start,
            Transaction.date <= period_end,
            Transaction.type == "income",
            Transaction.transaction_type != 'transfer'
        )
    ).scalar() or 0.0
    
    # 2. GASTOS FIJOS PRESUPUESTADOS (budget_plans con expense_type='fixed')
    # Buscar budget_plans cuyo end_date coincida con el end_date del ciclo
    fixed_expenses_budgeted = db.query(func.sum(BudgetPlan.amount)).join(
        Category, BudgetPlan.category_id == Category.id
    ).filter(
        and_(
            Category.expense_type == 'fixed',
            Category.type == 'expense',
            BudgetPlan.end_date == period_end
        )
    ).scalar() or 0.0
    
    # 3. GASTOS VARIABLES REALIZADOS (transacciones con expense_type='variable')
    variable_expenses_spent = db.query(func.sum(Transaction.amount_pen)).join(
        Category, Transaction.category_id == Category.id
    ).filter(
        and_(
            Transaction.date >= period_start,
            Transaction.date <= period_end,
            Transaction.type == "expense",
            Category.expense_type == 'variable',
            Transaction.transaction_type != 'transfer'
        )
    ).scalar() or 0.0
    
    # CÁLCULO FINAL
    available_amount = monthly_income - fixed_expenses_budgeted - variable_expenses_spent
    
    # Límite diario sugerido
    daily_limit = available_amount / days_remaining if days_remaining > 0 else 0.0
    
    # Estado de salud (basado en % del ingreso disponible)
    if monthly_income > 0:
        available_percentage = (available_amount / monthly_income) * 100
        if available_percentage > 20:
            health_status = "healthy"
        elif available_percentage >= 5:
            health_status = "warning"
        else:
            health_status = "critical"
    else:
        health_status = "critical"
    
    return MonthlyAvailable(
        available_amount=round(available_amount, 2),
        days_remaining=days_remaining,
        daily_limit=round(daily_limit, 2),
        monthly_income=round(monthly_income, 2),
        fixed_expenses_budgeted=round(fixed_expenses_budgeted, 2),
        variable_expenses_spent=round(variable_expenses_spent, 2),
        health_status=health_status,
        period_start=period_start.isoformat(),
        period_end=period_end.isoformat()
    )


@router.get("/spending-status", response_model=SpendingStatus)
def get_spending_status(
    cycle_offset: Optional[int] = Query(0, description="Offset de ciclo (0=actual, -1=anterior, 1=siguiente)"),
    db: Session = Depends(get_db)
):
    """
    Semáforo financiero: compara gasto real vs presupuestado del ciclo.
    
    Estados:
    - under_budget (🟢): Gastando menos del 90% del presupuesto
    - on_track (🟡): Entre 90% y 100% del presupuesto
    - over_budget (🔴): Gastando más del 100% del presupuesto
    """
    # Obtener billing cycle activo
    billing_cycle = db.query(BillingCycle).filter(BillingCycle.is_active == True).first()
    if not billing_cycle:
        billing_cycle = BillingCycle(name="default", start_day=1, is_active=True)
        db.add(billing_cycle)
        db.commit()
    
    # Obtener ciclo
    cycle_info = get_cycle_by_offset(billing_cycle.start_day, cycle_offset)
    period_start = datetime.strptime(cycle_info["start_date"], "%Y-%m-%d").date()
    period_end = datetime.strptime(cycle_info["end_date"], "%Y-%m-%d").date()
    
    # Total presupuestado (todos los budget_plans del ciclo, tanto fijos como variables)
    total_budgeted = db.query(func.sum(BudgetPlan.amount)).filter(
        BudgetPlan.end_date == period_end
    ).scalar() or 0.0
    
    # Total gastado (todas las transacciones de tipo expense)
    total_spent = db.query(func.sum(Transaction.amount_pen)).filter(
        and_(
            Transaction.date >= period_start,
            Transaction.date <= period_end,
            Transaction.type == "expense",
            Transaction.transaction_type != 'transfer'
        )
    ).scalar() or 0.0
    
    # Cálculos
    difference = total_budgeted - total_spent
    
    if total_budgeted > 0:
        deviation_percentage = ((total_spent - total_budgeted) / total_budgeted) * 100
        spent_percentage = (total_spent / total_budgeted) * 100
        
        # Determinar estado y mensaje
        if spent_percentage < 90:
            status = "under_budget"
            message = f"Estás gastando menos que lo planificado (-{abs(difference):.2f} PEN)"
        elif spent_percentage <= 100:
            status = "on_track"
            message = "Vas dentro del rango esperado"
        else:
            status = "over_budget"
            message = f"Estás gastando demás (+{abs(difference):.2f} PEN sobre el presupuesto)"
    else:
        deviation_percentage = 0
        status = "on_track"
        message = "No hay presupuesto definido para este ciclo"
    
    return SpendingStatus(
        status=status,
        total_budgeted=round(total_budgeted, 2),
        total_spent=round(total_spent, 2),
        difference=round(difference, 2),
        deviation_percentage=round(deviation_percentage, 2),
        message=message,
        period_start=period_start.isoformat(),
        period_end=period_end.isoformat()
    )


@router.get("/monthly-cashflow", response_model=MonthlyCashflow)
def get_monthly_cashflow(
    cycle_offset: Optional[int] = Query(0, description="Offset de ciclo (0=actual, -1=anterior, 1=siguiente)"),
    db: Session = Depends(get_db)
):
    """
    Cashflow del ciclo: Ingresos - Gastos = Balance
    Incluye datos diarios acumulados para sparkline.
    """
    # Obtener billing cycle activo
    billing_cycle = db.query(BillingCycle).filter(BillingCycle.is_active == True).first()
    if not billing_cycle:
        billing_cycle = BillingCycle(name="default", start_day=1, is_active=True)
        db.add(billing_cycle)
        db.commit()
    
    # Obtener ciclo
    cycle_info = get_cycle_by_offset(billing_cycle.start_day, cycle_offset)
    period_start = datetime.strptime(cycle_info["start_date"], "%Y-%m-%d").date()
    period_end = datetime.strptime(cycle_info["end_date"], "%Y-%m-%d").date()
    
    # Ingresos totales del ciclo
    total_income = db.query(func.sum(Transaction.amount_pen)).filter(
        and_(
            Transaction.date >= period_start,
            Transaction.date <= period_end,
            Transaction.type == "income",
            Transaction.transaction_type != 'transfer'
        )
    ).scalar() or 0.0
    
    # Gastos totales del ciclo
    total_expense = db.query(func.sum(Transaction.amount_pen)).filter(
        and_(
            Transaction.date >= period_start,
            Transaction.date <= period_end,
            Transaction.type == "expense",
            Transaction.transaction_type != 'transfer'
        )
    ).scalar() or 0.0
    
    # Balance
    balance = total_income - total_expense
    is_positive = balance >= 0
    
    # Generar datos diarios para sparkline
    daily_data = []
    current_date = period_start
    cumulative_income = 0.0
    cumulative_expense = 0.0
    
    while current_date <= period_end:
        # Sumar transacciones del día
        day_income = db.query(func.sum(Transaction.amount_pen)).filter(
            and_(
                Transaction.date == current_date,
                Transaction.type == "income",
                Transaction.transaction_type != 'transfer'
            )
        ).scalar() or 0.0
        
        day_expense = db.query(func.sum(Transaction.amount_pen)).filter(
            and_(
                Transaction.date == current_date,
                Transaction.type == "expense",
                Transaction.transaction_type != 'transfer'
            )
        ).scalar() or 0.0
        
        cumulative_income += day_income
        cumulative_expense += day_expense
        day_balance = cumulative_income - cumulative_expense
        
        daily_data.append(DailyDataPoint(
            date=current_date.isoformat(),
            cumulative_income=round(cumulative_income, 2),
            cumulative_expense=round(cumulative_expense, 2),
            balance=round(day_balance, 2)
        ))
        
        current_date += timedelta(days=1)
    
    return MonthlyCashflow(
        total_income=round(total_income, 2),
        total_expense=round(total_expense, 2),
        balance=round(balance, 2),
        is_positive=is_positive,
        daily_data=daily_data,
        period_start=period_start.isoformat(),
        period_end=period_end.isoformat()
    )


@router.get("/debt-summary", response_model=DebtSummary)
def get_debt_summary(
    cycle_offset: Optional[int] = Query(0, description="Offset de ciclo para calcular ingresos"),
    db: Session = Depends(get_db)
):
    """
    Resumen de deuda bancaria activa.
    
    Calcula:
    - Deuda total de préstamos activos
    - Cuota mensual total
    - % que representa la cuota del ingreso mensual del ciclo
    - Nivel de riesgo: healthy (<30%), warning (30-40%), critical (>40%)
    """
    # Préstamos activos
    active_loans = db.query(Loan).filter(Loan.status == LoanStatus.ACTIVE).all()
    
    if not active_loans:
        return DebtSummary(
            total_debt=0.0,
            total_monthly_payment=0.0,
            monthly_income_percentage=0.0,
            risk_level="healthy",
            active_loans_count=0,
            total_remaining_payments=0.0
        )
    
    # Calcular totales
    total_debt = sum(loan.current_debt for loan in active_loans)
    total_monthly_payment = sum(loan.monthly_payment for loan in active_loans)
    active_loans_count = len(active_loans)
    total_remaining_payments = total_debt  # Simplificación: deuda = total a pagar
    
    # Obtener ingresos del ciclo actual
    billing_cycle = db.query(BillingCycle).filter(BillingCycle.is_active == True).first()
    if not billing_cycle:
        billing_cycle = BillingCycle(name="default", start_day=1, is_active=True)
        db.add(billing_cycle)
        db.commit()
    
    cycle_info = get_cycle_by_offset(billing_cycle.start_day, cycle_offset)
    period_start = datetime.strptime(cycle_info["start_date"], "%Y-%m-%d").date()
    period_end = datetime.strptime(cycle_info["end_date"], "%Y-%m-%d").date()
    
    monthly_income = db.query(func.sum(Transaction.amount_pen)).filter(
        and_(
            Transaction.date >= period_start,
            Transaction.date <= period_end,
            Transaction.type == "income",
            Transaction.transaction_type != 'transfer'
        )
    ).scalar() or 0.0
    
    # Calcular porcentaje y nivel de riesgo
    if monthly_income > 0:
        monthly_income_percentage = (total_monthly_payment / monthly_income) * 100
        
        if monthly_income_percentage < 30:
            risk_level = "healthy"
        elif monthly_income_percentage <= 40:
            risk_level = "warning"
        else:
            risk_level = "critical"
    else:
        monthly_income_percentage = 0.0
        risk_level = "critical" if total_monthly_payment > 0 else "healthy"
    
    return DebtSummary(
        total_debt=round(total_debt, 2),
        total_monthly_payment=round(total_monthly_payment, 2),
        monthly_income_percentage=round(monthly_income_percentage, 2),
        risk_level=risk_level,
        active_loans_count=active_loans_count,
        total_remaining_payments=round(total_remaining_payments, 2)
    )


@router.get("/upcoming-payments", response_model=UpcomingPayments)
def get_upcoming_payments(db: Session = Depends(get_db)):
    """
    Próximos pagos en los siguientes 7 días:
    - Pagos de préstamos (loan.payment_day)
    - Pagos de tarjetas de crédito (credit_card.payment_due_day)
    Compara con saldo disponible del ciclo actual.
    """
    today = date.today()
    seven_days_later = today + timedelta(days=7)
    
    upcoming_payments = []
    total_amount = 0.0
    
    # 1. PRÉSTAMOS ACTIVOS
    active_loans = db.query(Loan).filter(Loan.status == LoanStatus.ACTIVE).all()
    
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
                
                upcoming_payments.append(UpcomingPayment(
                    loan_id=loan.id,
                    loan_name=loan.name,
                    entity=loan.entity,
                    amount=loan.monthly_payment,
                    payment_date=payment_date.isoformat(),
                    days_until_due=days_until_due
                ))
                
                total_amount += loan.monthly_payment
    
    # 2. TARJETAS DE CRÉDITO ACTIVAS
    active_cards = db.query(CreditCard).filter(CreditCard.is_active == True).all()
    
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
                
                upcoming_payments.append(UpcomingPayment(
                    loan_id=card.id,
                    loan_name=card.name,
                    entity=card.bank,
                    amount=float(card.current_balance),  # Saldo actual como pago requerido
                    payment_date=payment_date.isoformat(),
                    days_until_due=days_until_due
                ))
                
                total_amount += float(card.current_balance)
    
    # Obtener saldo disponible del ciclo actual
    billing_cycle = db.query(BillingCycle).filter(BillingCycle.is_active == True).first()
    if not billing_cycle:
        billing_cycle = BillingCycle(name="default", start_day=1, is_active=True)
        db.add(billing_cycle)
        db.commit()
    
    cycle_info = get_cycle_for_date(billing_cycle.start_day)
    period_start = datetime.strptime(cycle_info["start_date"], "%Y-%m-%d").date()
    period_end = datetime.strptime(cycle_info["end_date"], "%Y-%m-%d").date()
    
    # Ingresos del ciclo
    cycle_income = db.query(func.sum(Transaction.amount_pen)).filter(
        and_(
            Transaction.date >= period_start,
            Transaction.date <= period_end,
            Transaction.type == "income",
            Transaction.transaction_type != 'transfer'
        )
    ).scalar() or 0.0
    
    # Gastos fijos presupuestados
    fixed_expenses = db.query(func.sum(BudgetPlan.amount)).join(
        Category, BudgetPlan.category_id == Category.id
    ).filter(
        and_(
            Category.expense_type == 'fixed',
            Category.type == 'expense',
            BudgetPlan.end_date == period_end
        )
    ).scalar() or 0.0
    
    # Gastos variables realizados
    variable_expenses = db.query(func.sum(Transaction.amount_pen)).join(
        Category, Transaction.category_id == Category.id
    ).filter(
        and_(
            Transaction.date >= period_start,
            Transaction.date <= period_end,
            Transaction.type == "expense",
            Category.expense_type == 'variable',
            Transaction.transaction_type != 'transfer'
        )
    ).scalar() or 0.0
    
    available_balance = cycle_income - fixed_expenses - variable_expenses
    deficit = available_balance - total_amount
    has_deficit = deficit < 0
    
    # Ordenar por fecha de vencimiento
    upcoming_payments.sort(key=lambda x: x.payment_date)
    
    return UpcomingPayments(
        payments=upcoming_payments,
        total_amount=round(total_amount, 2),
        available_balance=round(available_balance, 2),
        deficit=round(deficit, 2),
        has_deficit=has_deficit
    )


@router.get("/month-projection", response_model=MonthProjection)
def get_month_projection(
    cycle_offset: Optional[int] = Query(0, description="Offset de ciclo"),
    db: Session = Depends(get_db)
):
    """
    Proyección de cierre del ciclo basado en gasto promedio diario.
    "Si sigues gastando así, terminarás con..."
    """
    # Obtener billing cycle activo
    billing_cycle = db.query(BillingCycle).filter(BillingCycle.is_active == True).first()
    if not billing_cycle:
        billing_cycle = BillingCycle(name="default", start_day=1, is_active=True)
        db.add(billing_cycle)
        db.commit()
    
    cycle_info = get_cycle_by_offset(billing_cycle.start_day, cycle_offset)
    period_start = datetime.strptime(cycle_info["start_date"], "%Y-%m-%d").date()
    period_end = datetime.strptime(cycle_info["end_date"], "%Y-%m-%d").date()
    
    today = date.today()
    
    # Días transcurridos y restantes
    if period_start <= today <= period_end:
        days_elapsed = (today - period_start).days + 1
        days_remaining = (period_end - today).days
    else:
        # Si no es el ciclo actual
        days_elapsed = (period_end - period_start).days + 1
        days_remaining = 0
    
    # Ingresos del ciclo
    total_income = db.query(func.sum(Transaction.amount_pen)).filter(
        and_(
            Transaction.date >= period_start,
            Transaction.date <= min(today, period_end),
            Transaction.type == "income",
            Transaction.transaction_type != 'transfer'
        )
    ).scalar() or 0.0
    
    # Gastos del ciclo hasta hoy
    total_expense = db.query(func.sum(Transaction.amount_pen)).filter(
        and_(
            Transaction.date >= period_start,
            Transaction.date <= min(today, period_end),
            Transaction.type == "expense",
            Transaction.transaction_type != 'transfer'
        )
    ).scalar() or 0.0
    
    # Promedio de gasto diario
    if days_elapsed > 0:
        daily_average_spending = total_expense / days_elapsed
    else:
        daily_average_spending = 0.0
    
    # Proyección de gastos restantes
    projected_remaining_expenses = daily_average_spending * days_remaining
    
    # Balance proyectado
    projected_balance = total_income - total_expense - projected_remaining_expenses
    is_positive = projected_balance >= 0
    
    # Mensaje
    if is_positive:
        message = f"Si sigues gastando así, cerrarás el ciclo con +S/ {abs(projected_balance):.2f}"
    else:
        message = f"Si sigues gastando así, cerrarás el ciclo con -S/ {abs(projected_balance):.2f}"
    
    return MonthProjection(
        projected_balance=round(projected_balance, 2),
        is_positive=is_positive,
        daily_average_spending=round(daily_average_spending, 2),
        days_elapsed=days_elapsed,
        days_remaining=days_remaining,
        message=message
    )


@router.get("/problem-category", response_model=ProblemCategory)
def get_problem_category(
    cycle_offset: Optional[int] = Query(0, description="Offset de ciclo"),
    db: Session = Depends(get_db)
):
    """
    Detecta la categoría con mayor desviación del presupuesto.
    Útil para alertar de categorías problemáticas.
    """
    # Obtener billing cycle activo
    billing_cycle = db.query(BillingCycle).filter(BillingCycle.is_active == True).first()
    if not billing_cycle:
        billing_cycle = BillingCycle(name="default", start_day=1, is_active=True)
        db.add(billing_cycle)
        db.commit()
    
    cycle_info = get_cycle_by_offset(billing_cycle.start_day, cycle_offset)
    period_start = datetime.strptime(cycle_info["start_date"], "%Y-%m-%d").date()
    period_end = datetime.strptime(cycle_info["end_date"], "%Y-%m-%d").date()
    
    # Obtener todos los budget_plans del ciclo
    budget_plans = db.query(BudgetPlan).filter(
        BudgetPlan.end_date == period_end
    ).all()
    
    if not budget_plans:
        return ProblemCategory(
            category_id=0,
            category_name="Sin datos",
            budgeted=0.0,
            spent=0.0,
            deviation=0.0,
            deviation_percentage=0.0,
            message="No hay presupuesto definido para este ciclo"
        )
    
    # Calcular desviación por categoría
    max_deviation = 0.0
    problem_category = None
    
    for plan in budget_plans:
        # Gastos reales de esta categoría
        spent = db.query(func.sum(Transaction.amount_pen)).filter(
            and_(
                Transaction.date >= period_start,
                Transaction.date <= period_end,
                Transaction.category_id == plan.category_id,
                Transaction.type == "expense",
                Transaction.transaction_type != 'transfer'
            )
        ).scalar() or 0.0
        
        deviation = spent - plan.amount
        
        # Solo considerar desviaciones positivas (exceso de gasto)
        if deviation > max_deviation:
            max_deviation = deviation
            problem_category = {
                'category_id': plan.category_id,
                'category_name': plan.category.name,
                'budgeted': plan.amount,
                'spent': spent,
                'deviation': deviation
            }
    
    if not problem_category:
        return ProblemCategory(
            category_id=0,
            category_name="Todo bajo control",
            budgeted=0.0,
            spent=0.0,
            deviation=0.0,
            deviation_percentage=0.0,
            message="No hay categorías con exceso de gasto"
        )
    
    # Calcular porcentaje
    if problem_category['budgeted'] > 0:
        deviation_percentage = (problem_category['deviation'] / problem_category['budgeted']) * 100
    else:
        deviation_percentage = 0.0
    
    message = f"Estás gastando {deviation_percentage:.0f}% más en {problem_category['category_name']}"
    
    return ProblemCategory(
        category_id=problem_category['category_id'],
        category_name=problem_category['category_name'],
        budgeted=round(problem_category['budgeted'], 2),
        spent=round(problem_category['spent'], 2),
        deviation=round(problem_category['deviation'], 2),
        deviation_percentage=round(deviation_percentage, 2),
        message=message
    )

