from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class BillingCycleBase(BaseModel):
    start_day: int = Field(ge=1, le=31, description="Day of month when billing cycle starts (1-31)")
    next_override_date: Optional[date] = Field(None, description="Manual override for next cycle start date (e.g., moved from 23 to 21)")

class BillingCycleCreate(BillingCycleBase):
    pass

class BillingCycleUpdate(BaseModel):
    start_day: Optional[int] = Field(None, ge=1, le=31)
    next_override_date: Optional[date] = Field(None)

class BillingCycleResponse(BillingCycleBase):
    id: int
    name: str
    is_active: bool

    class Config:
        from_attributes = True

class CurrentCycleInfo(BaseModel):
    """Information about the current billing cycle"""
    cycle_name: str  # e.g., "Enero"
    start_date: str  # e.g., "2024-12-23"
    end_date: str    # e.g., "2025-01-22"
    start_day: int   # e.g., 23
    next_override_date: Optional[date] = None  # Manual override if exists
