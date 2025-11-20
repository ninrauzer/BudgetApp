#!/usr/bin/env python3
"""
Test manual de get_cycle_dates para enero
"""
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

def _safe_date(year: int, month: int, day: int) -> datetime:
    """Return a date ensuring the day exists in the month."""
    from calendar import monthrange
    last_day = monthrange(year, month)[1]
    return datetime(year, month, min(day, last_day))

def get_cycle_dates_test(cycle_name: str) -> dict:
    """Test version of get_cycle_dates"""
    start_day = 23
    current_date = datetime.now()
    month_num = MONTH_NAMES.index(cycle_name) + 1
    
    print(f"Input: cycle_name={cycle_name}, month_num={month_num}, start_day={start_day}")
    print(f"Current date: {current_date.date()}")
    print()
    
    year = current_date.year
    print(f"Trying year {year}...")
    
    if month_num == 1:
        cycle_end = _safe_date(year, 1, start_day) - timedelta(days=1)
        cycle_start = _safe_date(year - 1, 12, start_day)
        print(f"  month_num == 1 (January)")
        print(f"  cycle_end = _safe_date({year}, 1, {start_day}) - 1 = {_safe_date(year, 1, start_day)} - 1 = {cycle_end.date()}")
        print(f"  cycle_start = _safe_date({year-1}, 12, {start_day}) = {cycle_start.date()}")
    else:
        cycle_end = _safe_date(year, month_num, start_day) - timedelta(days=1)
        cycle_start = _safe_date(year, month_num - 1, start_day)
    
    print(f"  Calculated: {cycle_start.date()} to {cycle_end.date()}")
    print(f"  cycle_end > current_date? {cycle_end.date()} > {current_date.date()}? {cycle_end.date() > current_date.date()}")
    print()
    
    if cycle_end.date() > current_date.date():
        print(f"Cycle is in future, using year {year-1}...")
        year = year - 1
        if month_num == 1:
            cycle_end = _safe_date(year, 1, start_day) - timedelta(days=1)
            cycle_start = _safe_date(year - 1, 12, start_day)
        else:
            cycle_end = _safe_date(year, month_num, start_day) - timedelta(days=1)
            cycle_start = _safe_date(year, month_num - 1, start_day)
        print(f"  Adjusted: {cycle_start.date()} to {cycle_end.date()}")
    
    print()
    print(f"FINAL RESULT: {cycle_start.date()} to {cycle_end.date()}")
    
    return {
        "start_date": cycle_start.date(),
        "end_date": cycle_end.date()
    }

# Test
result = get_cycle_dates_test("Enero")
print(f"\nReturned: {result}")
