"""
BudgetPlan Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class BudgetPlanBase(BaseModel):
    """Base schema for BudgetPlan."""
    year: int = Field(..., ge=2000, le=2100)
    month: int = Field(..., ge=1, le=12)
    category_id: int
    amount: float = Field(..., ge=0)
    notes: Optional[str] = None


class BudgetPlanCreate(BudgetPlanBase):
    """Schema for creating budget plan item."""
    pass


class BudgetPlanUpdate(BudgetPlanBase):
    """Schema for updating budget plan item."""
    pass


class BudgetPlanResponse(BudgetPlanBase):
    """Schema for budget plan response."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BudgetPlanBulkCreate(BaseModel):
    """Schema for bulk creating/updating budget plan for a month."""
    items: list[BudgetPlanCreate]


class BudgetPlanSummary(BaseModel):
    """Summary of budget plan for a period."""
    total_income: float = 0.0
    total_expense: float = 0.0
    total_saving: float = 0.0
    balance: float = 0.0


class BudgetPlanMonthResponse(BaseModel):
    """Complete budget plan for a specific month."""
    year: int
    month: int
    items: list[BudgetPlanResponse]
    summary: BudgetPlanSummary
