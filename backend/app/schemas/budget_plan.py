"""
BudgetPlan Pydantic schemas for request/response validation.
Updated to use billing cycles instead of year/month.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date


class BudgetPlanBase(BaseModel):
    """Base schema for BudgetPlan (cycle-based)."""
    cycle_name: str = Field(..., min_length=1)  # e.g., "Enero"
    start_date: date                             # e.g., 2024-12-23
    end_date: date                               # e.g., 2025-01-22
    category_id: int
    amount: float = Field(..., ge=0)
    notes: Optional[str] = None


class BudgetPlanCreate(BudgetPlanBase):
    """Schema for creating budget plan item."""
    pass


class BudgetPlanUpdate(BaseModel):
    """Schema for updating budget plan item."""
    amount: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None


class BudgetPlanResponse(BudgetPlanBase):
    """Schema for budget plan response."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BudgetPlanBulkCreate(BaseModel):
    """Schema for bulk creating/updating budget plan for a cycle."""
    items: list[BudgetPlanCreate]


class BudgetPlanSummary(BaseModel):
    """Summary of budget plan for a period."""
    total_income: float = 0.0
    total_expense: float = 0.0
    total_saving: float = 0.0
    balance: float = 0.0


class BudgetPlanCycleResponse(BaseModel):
    """Complete budget plan for a specific billing cycle."""
    cycle_name: str
    start_date: date
    end_date: date
    items: list[BudgetPlanResponse]
    summary: BudgetPlanSummary
