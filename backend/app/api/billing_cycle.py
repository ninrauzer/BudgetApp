from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date, datetime, timedelta
from app.db.database import get_db
from app.models.billing_cycle import BillingCycle
from app.models.billing_cycle_override import BillingCycleOverride
from app.schemas.billing_cycle import (
    BillingCycleResponse,
    BillingCycleUpdate,
    CurrentCycleInfo,
    YearCyclesResponse,
    MonthCycleInfo,
    BillingCycleOverrideCreate,
    BillingCycleOverrideUpdate,
    BillingCycleOverrideResponse
)
from app.services.billing_cycle import get_cycle_for_date

router = APIRouter(prefix="/settings", tags=["Billing Cycle"])

@router.get("/billing-cycle", response_model=BillingCycleResponse)
def get_billing_cycle(db: Session = Depends(get_db)):
    """Get the current billing cycle configuration"""
    cycle = db.query(BillingCycle).filter(BillingCycle.is_active == True).first()
    
    if not cycle:
        # Create default cycle starting on day 1
        cycle = BillingCycle(name="default", start_day=1, is_active=True)
        db.add(cycle)
        db.commit()
        db.refresh(cycle)
    
    return cycle

@router.put("/billing-cycle", response_model=BillingCycleResponse)
def update_billing_cycle(
    cycle_update: BillingCycleUpdate,
    db: Session = Depends(get_db)
):
    """Update the billing cycle start day"""
    cycle = db.query(BillingCycle).filter(BillingCycle.is_active == True).first()
    
    if not cycle:
        cycle = BillingCycle(name="default", is_active=True)
        db.add(cycle)
    
    if cycle_update.start_day is not None:
        cycle.start_day = cycle_update.start_day
    
    db.commit()
    db.refresh(cycle)
    return cycle

@router.get("/billing-cycle/current", response_model=CurrentCycleInfo)
def get_current_cycle(db: Session = Depends(get_db)):
    """Get information about the current billing cycle period"""
    cycle = db.query(BillingCycle).filter(BillingCycle.is_active == True).first()
    
    if not cycle:
        cycle = BillingCycle(name="default", start_day=1, is_active=True)
        db.add(cycle)
        db.commit()
        db.refresh(cycle)
    
    # Pass override_date if it exists
    cycle_info = get_cycle_for_date(cycle.start_day, override_date=cycle.next_override_date)
    
    return CurrentCycleInfo(
        cycle_name=cycle_info["cycle_name"],
        start_date=cycle_info["start_date"],
        end_date=cycle_info["end_date"],
        start_day=cycle.start_day,
        next_override_date=cycle.next_override_date
    )

# New endpoints for annual grid

def _get_month_name(month: int) -> str:
    """Get Spanish month name"""
    month_names = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]
    return month_names[month - 1]

def _calculate_cycle_for_month(year: int, month: int, start_day: int, override_date: Optional[date] = None) -> tuple[date, date]:
    """
    Calculate start and end dates for a specific month's cycle.
    If override_date is provided, use it as the start date.
    """
    if override_date:
        cycle_start = override_date
    else:
        # Default calculation based on start_day
        cycle_start = date(year, month, min(start_day, 28))  # Safe default
        try:
            cycle_start = date(year, month, start_day)
        except ValueError:
            # Handle cases like Feb 30, use last day of month
            if month == 12:
                cycle_start = date(year + 1, 1, 1) - timedelta(days=1)
            else:
                cycle_start = date(year, month + 1, 1) - timedelta(days=1)
    
    # Calculate end date (day before next cycle)
    if month == 12:
        # December cycle ends when January cycle would start
        try:
            next_cycle_start = date(year + 1, 1, start_day)
        except ValueError:
            next_cycle_start = date(year + 1, 2, 1) - timedelta(days=1)
    else:
        try:
            next_cycle_start = date(year, month + 1, start_day)
        except ValueError:
            if month + 1 == 12:
                next_cycle_start = date(year + 1, 1, 1) - timedelta(days=1)
            else:
                next_cycle_start = date(year, month + 2, 1) - timedelta(days=1)
    
    cycle_end = next_cycle_start - timedelta(days=1)
    
    return cycle_start, cycle_end

@router.get("/billing-cycle/year/{year}", response_model=YearCyclesResponse)
def get_year_cycles(year: int, db: Session = Depends(get_db)):
    """
    Get all 12 billing cycles for a specific year with any overrides applied.
    Returns complete information for annual grid display.
    """
    # Get billing cycle config
    cycle = db.query(BillingCycle).filter(BillingCycle.is_active == True).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="No active billing cycle found")
    
    # Get all overrides for this year
    overrides = db.query(BillingCycleOverride).filter(
        BillingCycleOverride.billing_cycle_id == cycle.id,
        BillingCycleOverride.year == year
    ).all()
    
    # Create override map for quick lookup
    override_map = {o.month: o for o in overrides}
    
    # Calculate cycles for all 12 months
    months_info = []
    today = date.today()
    
    for month in range(1, 13):
        override = override_map.get(month)
        override_date = override.override_start_date if override else None
        
        cycle_start, cycle_end = _calculate_cycle_for_month(year, month, cycle.start_day, override_date)
        
        # Determine if this is current or past
        is_current = cycle_start <= today <= cycle_end
        is_past = cycle_end < today
        
        months_info.append(MonthCycleInfo(
            month=month,
            month_name=_get_month_name(month),
            start_date=cycle_start.isoformat(),
            end_date=cycle_end.isoformat(),
            days=(cycle_end - cycle_start).days + 1,
            has_override=override is not None,
            override_reason=override.reason if override else None,
            is_current=is_current,
            is_past=is_past
        ))
    
    return YearCyclesResponse(
        year=year,
        start_day=cycle.start_day,
        months=months_info
    )

@router.put("/billing-cycle/year/{year}/month/{month}", response_model=BillingCycleOverrideResponse)
def create_or_update_month_override(
    year: int,
    month: int,
    override_data: BillingCycleOverrideCreate,
    db: Session = Depends(get_db)
):
    """
    Create or update a billing cycle override for a specific month.
    This allows customizing the start date when payments don't fall on the usual day.
    """
    # Validate month
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
    
    # Get billing cycle config
    cycle = db.query(BillingCycle).filter(BillingCycle.is_active == True).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="No active billing cycle found")
    
    # Check if override already exists
    existing = db.query(BillingCycleOverride).filter(
        BillingCycleOverride.billing_cycle_id == cycle.id,
        BillingCycleOverride.year == year,
        BillingCycleOverride.month == month
    ).first()
    
    if existing:
        # Update existing override
        existing.override_start_date = override_data.override_start_date
        existing.reason = override_data.reason
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Create new override
        new_override = BillingCycleOverride(
            billing_cycle_id=cycle.id,
            year=year,
            month=month,
            override_start_date=override_data.override_start_date,
            reason=override_data.reason
        )
        db.add(new_override)
        db.commit()
        db.refresh(new_override)
        return new_override

@router.delete("/billing-cycle/year/{year}/month/{month}")
def delete_month_override(year: int, month: int, db: Session = Depends(get_db)):
    """
    Delete a billing cycle override for a specific month.
    The cycle will revert to the default calculation based on start_day.
    """
    # Validate month
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
    
    # Get billing cycle config
    cycle = db.query(BillingCycle).filter(BillingCycle.is_active == True).first()
    if not cycle:
        raise HTTPException(status_code=404, detail="No active billing cycle found")
    
    # Find and delete override
    override = db.query(BillingCycleOverride).filter(
        BillingCycleOverride.billing_cycle_id == cycle.id,
        BillingCycleOverride.year == year,
        BillingCycleOverride.month == month
    ).first()
    
    if not override:
        raise HTTPException(status_code=404, detail="Override not found")
    
    db.delete(override)
    db.commit()
    
    return {"message": "Override deleted successfully"}
