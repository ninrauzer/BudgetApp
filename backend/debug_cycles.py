#!/usr/bin/env python3
"""Debug script to see cycle calculations"""
import sys
sys.path.insert(0, '/app')

from app.db.database import SessionLocal
from app.models.billing_cycle import BillingCycle
from app.models.billing_cycle_override import BillingCycleOverride
from datetime import date, timedelta

def calculate_cycle_for_month(year: int, month: int, start_day: int, override_date=None, next_month_override=None):
    """Same logic as backend"""
    # Determine start date
    if override_date:
        cycle_start = override_date
    else:
        cycle_start = date(year, month, start_day)
    
    # Determine end date (next cycle start - 1 day)
    if next_month_override:
        next_cycle_start = next_month_override
    else:
        next_month = month + 1 if month < 12 else 1
        next_year = year if month < 12 else year + 1
        next_cycle_start = date(next_year, next_month, start_day)
    
    cycle_end = next_cycle_start - timedelta(days=1)
    
    return cycle_start, cycle_end

db = SessionLocal()
try:
    print("\n" + "="*60)
    print("DEBUG: Billing Cycle Calculations for 2025")
    print("="*60)
    
    cycle = db.query(BillingCycle).first()
    print(f"\nBilling Cycle Config:")
    print(f"  ID: {cycle.id}")
    print(f"  Start Day: {cycle.start_day}")
    
    # Get overrides
    overrides = db.query(BillingCycleOverride).filter_by(
        billing_cycle_id=cycle.id,
        year=2025
    ).all()
    
    override_map = {o.month: o for o in overrides}
    
    print(f"\nOverrides Found: {len(overrides)}")
    for o in overrides:
        print(f"  Month {o.month}: {o.override_start_date} ({o.reason})")
    
    print(f"\n{'Mes':<4} {'Nombre':<12} {'Inicio':<12} {'Fin':<12} {'Días':<5} {'Override?'}")
    print("-" * 60)
    
    today = date.today()
    
    for month in range(1, 13):
        # Display month calculation
        display_month = month
        if cycle.start_day > 1:
            display_month = month + 1 if month < 12 else 1
        
        month_names = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
        
        override = override_map.get(month)
        override_date = override.override_start_date if override else None
        
        next_month = month + 1 if month < 12 else 1
        next_override = override_map.get(next_month)
        next_override_date = next_override.override_start_date if next_override else None
        
        cycle_start, cycle_end = calculate_cycle_for_month(
            2025, month, cycle.start_day, override_date, next_override_date
        )
        
        is_current = cycle_start <= today <= cycle_end
        days = (cycle_end - cycle_start).days + 1
        
        marker = " <- ACTUAL" if is_current else ""
        override_mark = " [OV]" if override else ""
        
        print(f"{month:<4} {month_names[display_month]:<12} {cycle_start} {cycle_end} {days:<5} {override_mark}{marker}")

finally:
    db.close()
