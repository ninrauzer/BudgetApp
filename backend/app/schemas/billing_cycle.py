from pydantic import BaseModel, Field
from typing import Optional, List
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

# New schemas for annual grid
class BillingCycleOverrideBase(BaseModel):
    override_start_date: date = Field(description="Override start date for this month's cycle")
    reason: Optional[str] = Field(None, description="Optional reason for override (e.g., 'Pago anticipado - viernes')")

class BillingCycleOverrideCreate(BillingCycleOverrideBase):
    year: int = Field(ge=2020, le=2100)
    month: int = Field(ge=1, le=12)

class BillingCycleOverrideUpdate(BaseModel):
    override_start_date: Optional[date] = None
    reason: Optional[str] = None

class BillingCycleOverrideResponse(BillingCycleOverrideBase):
    id: int
    billing_cycle_id: int
    year: int
    month: int
    
    class Config:
        from_attributes = True

class MonthCycleInfo(BaseModel):
    """Information for a single month in the annual grid"""
    month: int  # 1-12
    month_name: str  # e.g., "Enero", "Febrero"
    start_date: str  # YYYY-MM-DD format
    end_date: str  # YYYY-MM-DD format
    days: int  # Number of days in cycle
    has_override: bool  # True if this month has a custom override
    override_reason: Optional[str] = None  # Reason if override exists
    is_current: bool  # True if this is the current month's cycle
    is_past: bool  # True if this cycle is in the past

class YearCyclesResponse(BaseModel):
    """Response containing all 12 months for a year"""
    year: int
    start_day: int  # Default start day from billing_cycle config
    months: List[MonthCycleInfo]
