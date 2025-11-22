"""
Account Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime


class AccountBase(BaseModel):
    """Base schema for Account."""
    name: str = Field(..., min_length=1, max_length=100)
    type: Literal["cash", "bank", "credit_card", "debit_card", "digital_wallet"]
    icon: str = Field(default="wallet", max_length=50)  # Lucide icon name
    balance: float = Field(default=0.0)
    currency: str = Field(default="PEN", max_length=3)  # ISO 4217
    is_active: bool = True
    is_default: bool = False


class AccountCreate(AccountBase):
    """Schema for creating a new account."""
    pass


class AccountUpdate(AccountBase):
    """Schema for updating an existing account."""
    pass


class AccountResponse(AccountBase):
    """Schema for account response returned to frontend.

    Fields initial_balance/current_balance are computed, not stored separately.
    updated_at is currently mirrored from created_at until an explicit column exists.
    """
    id: int
    created_at: datetime
    updated_at: datetime
    # Stored balance is exposed as initial_balance for clarity with frontend model
    initial_balance: float = Field(default=0.0)
    current_balance: float = Field(default=0.0)
    balance: float = Field(default=0.0)  # keep for backward compatibility

    class Config:
        from_attributes = True
