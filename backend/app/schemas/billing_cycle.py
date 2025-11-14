from pydantic import BaseModel, Field
from typing import Optional

class BillingCycleBase(BaseModel):
    start_day: int = Field(ge=1, le=31, description="Day of month when billing cycle starts (1-31)")

class BillingCycleCreate(BillingCycleBase):
    pass

class BillingCycleUpdate(BillingCycleBase):
    start_day: Optional[int] = Field(None, ge=1, le=31)

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
