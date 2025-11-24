"""
Dashboard Pydantic schemas for analytics endpoints.
"""

from pydantic import BaseModel
from typing import Literal


class DashboardCategorySummary(BaseModel):
    """Summary of budget vs actual for a category."""
    category_id: int
    category_name: str
    type: str
    planned: float
    actual: float
    difference: float
    percentage: float
    status: Literal["under_budget", "on_track", "over_budget"]


class DashboardTopExpense(BaseModel):
    """Top expense category."""
    category_id: int
    category_name: str
    total: float
    percentage: float


class DashboardSummary(BaseModel):
    """Overall dashboard summary."""
    total_income_planned: float = 0.0
    total_income_actual: float = 0.0
    total_expense_planned: float = 0.0
    total_expense_actual: float = 0.0
    total_saving_planned: float = 0.0
    balance_planned: float = 0.0
    balance_actual: float = 0.0
    variance: float = 0.0
    variance_percentage: float = 0.0


class DashboardResponse(BaseModel):
    """Complete dashboard response for a period."""
    period: dict  # {"year": 2025, "month": 11}
    summary: DashboardSummary
    by_category: list[DashboardCategorySummary] = []
    top_expenses: list[DashboardTopExpense] = []


class DashboardTrendMonth(BaseModel):
    """Monthly data point for trend chart."""
    year: int
    month: int
    total_income: float
    total_expense: float
    balance: float


class DashboardTrendResponse(BaseModel):
    """Trend data for multiple months."""
    months: list[DashboardTrendMonth] = []


class MonthlyAvailable(BaseModel):
    """Disponible del mes - Saldo libre después de gastos fijos."""
    available_amount: float  # Saldo disponible hasta fin de mes
    days_remaining: int  # Días restantes del mes
    daily_limit: float  # Límite diario sugerido
    monthly_income: float  # Ingresos del mes
    fixed_expenses_budgeted: float  # Gastos fijos presupuestados
    variable_expenses_spent: float  # Gastos variables realizados
    health_status: Literal["healthy", "warning", "critical"]  # Verde/Amarillo/Rojo
    period_start: str  # Fecha inicio del período
    period_end: str  # Fecha fin del período


class SpendingStatus(BaseModel):
    """Semáforo financiero - Estado de gasto vs presupuesto."""
    status: Literal["under_budget", "on_track", "over_budget"]  # Verde/Amarillo/Rojo
    total_budgeted: float  # Total presupuestado para gastos
    total_spent: float  # Total gastado hasta ahora
    difference: float  # Diferencia (negativo = exceso, positivo = ahorro)
    deviation_percentage: float  # % de desviación
    message: str  # Mensaje descriptivo
    period_start: str
    period_end: str


class DailyDataPoint(BaseModel):
    """Punto de datos para sparkline diaria."""
    date: str  # Fecha en formato YYYY-MM-DD
    cumulative_income: float  # Ingreso acumulado hasta ese día
    cumulative_expense: float  # Gasto acumulado hasta ese día
    balance: float  # Balance del día (income - expense)
    is_projected: bool = False  # True si es proyección futura, False si es dato real


class MonthlyCashflow(BaseModel):
    """Cashflow del mes - Balance de ingresos vs gastos."""
    total_income: float  # Ingresos totales del mes
    total_expense: float  # Gastos totales del mes
    balance: float  # Balance final (+ o -)
    is_positive: bool  # True si balance es positivo
    daily_data: list[DailyDataPoint]  # Datos diarios para sparkline
    period_start: str
    period_end: str


class DebtSummary(BaseModel):
    """Resumen de deuda bancaria activa."""
    total_debt: float  # Deuda total de todos los préstamos activos
    total_monthly_payment: float  # Suma de cuotas mensuales
    monthly_income_percentage: float  # % que representa la cuota del ingreso mensual
    risk_level: Literal["healthy", "warning", "critical"]  # Verde (<30%), Amarillo (30-40%), Rojo (>40%)
    active_loans_count: int  # Número de préstamos activos
    total_remaining_payments: float  # Suma total de lo que falta pagar


class UpcomingPayment(BaseModel):
    """Pago próximo de préstamo."""
    loan_id: int
    loan_name: str
    entity: str  # Banco/entidad
    amount: float  # Monto de la cuota
    payment_date: str  # Fecha de vencimiento
    days_until_due: int  # Días hasta vencimiento


class UpcomingPayments(BaseModel):
    """Próximos pagos de préstamos (7 días)."""
    payments: list[UpcomingPayment]
    total_amount: float  # Total a pagar en próximos 7 días
    available_balance: float  # Saldo disponible del ciclo actual
    deficit: float  # Déficit o superávit (negativo=falta, positivo=sobra)
    has_deficit: bool  # True si hay déficit


class MonthProjection(BaseModel):
    """Proyección de cierre del ciclo."""
    projected_balance: float  # Balance proyectado al final del ciclo
    is_positive: bool  # True si balance proyectado es positivo
    daily_average_spending: float  # Promedio de gasto diario hasta hoy
    days_elapsed: int  # Días transcurridos del ciclo
    days_remaining: int  # Días restantes del ciclo
    message: str  # Mensaje descriptivo "Si sigues gastando así..."


class ProblemCategory(BaseModel):
    """Categoría con mayor desviación del presupuesto."""
    category_id: int
    category_name: str
    budgeted: float  # Monto presupuestado
    spent: float  # Monto gastado
    deviation: float  # Desviación (spent - budgeted)
    deviation_percentage: float  # % de desviación
    message: str  # Mensaje descriptivo

