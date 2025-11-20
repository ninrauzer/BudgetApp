from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.billing_cycle import BillingCycle
from app.schemas.billing_cycle import (
    BillingCycleResponse,
    BillingCycleUpdate,
    CurrentCycleInfo
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
    
    cycle_info = get_cycle_for_date(cycle.start_day)
    
    return CurrentCycleInfo(
        cycle_name=cycle_info["cycle_name"],
        start_date=cycle_info["start_date"],
        end_date=cycle_info["end_date"],
        start_day=cycle.start_day
    )
