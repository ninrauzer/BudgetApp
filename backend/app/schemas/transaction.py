"""
Transaction Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import date, datetime


class TransactionBase(BaseModel):
    """Base schema for Transaction."""
    date: date
    category_id: int
    account_id: int
    amount: float = Field(..., gt=0)  # Must be positive
    currency: Literal["PEN", "USD"] = "PEN"  # Default to soles
    type: Literal["income", "expense", "saving"]
    description: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = None
    status: Literal["pending", "completed", "cancelled"] = "completed"
    loan_id: Optional[int] = None  # Link to loan for payment tracking


class TransactionCreate(TransactionBase):
    """Schema for creating a new transaction."""
    
    @field_validator('amount')
    @classmethod
    def amount_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError('Amount must be positive')
        return v


class TransactionUpdate(TransactionBase):
    """Schema for updating an existing transaction."""
    pass


class TransactionResponse(BaseModel):
    """Schema for transaction response."""
    id: int
    date: date
    category_id: int
    category_name: str
    category_type: str
    category_icon: Optional[str] = None
    category_expense_type: Optional[Literal['fixed','variable']] = None  # Derived from category.expense_type for expense categories
    account_id: int
    account_name: str
    amount: float
    currency: Literal["PEN", "USD"]
    exchange_rate: Optional[float] = None
    amount_pen: float
    type: Literal["income", "expense", "saving"]
    description: Optional[str] = None
    notes: Optional[str] = None
    status: Literal["pending", "completed", "cancelled"]
    loan_id: Optional[int] = None  # Link to loan for payment tracking
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TransactionSummary(BaseModel):
    """Summary of transactions for a period."""
    total_income: float = 0.0
    total_expense: float = 0.0
    balance: float = 0.0
    transaction_count: int = 0


class TransactionCategorySummary(BaseModel):
    """Transaction summary by category."""
    category_id: int
    category_name: str
    type: str
    total: float
    count: int


class TransactionPeriodSummary(BaseModel):
    """Complete transaction summary for a period."""
    period: dict  # {"start": "2025-11-01", "end": "2025-11-30"}
    summary: TransactionSummary
    by_category: list[TransactionCategorySummary] = []
