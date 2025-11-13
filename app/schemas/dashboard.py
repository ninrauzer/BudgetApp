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
