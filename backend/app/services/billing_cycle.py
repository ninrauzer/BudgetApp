"""
Utility functions for calculating billing cycles.
Handles custom billing periods that don't align with calendar months.
"""
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

# Spanish month names
MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

def get_cycle_for_date(start_day: int, reference_date: datetime = None) -> dict:
    """
    Calculate the billing cycle that contains the given date.
    
    Args:
        start_day: Day of month when cycle starts (1-31)
        reference_date: Date to check (defaults to today)
    
    Returns:
        dict with cycle_name, start_date, end_date
        
    Example:
        start_day=23, reference_date=2025-01-15
        Returns: {
            "cycle_name": "Enero",
            "start_date": "2024-12-23",
            "end_date": "2025-01-22"
        }
    """
    if reference_date is None:
        reference_date = datetime.now()
    
    # Determine which cycle we're in
    if reference_date.day >= start_day:
        # We're in a cycle that started this month
        cycle_start = datetime(reference_date.year, reference_date.month, start_day)
        cycle_end_temp = cycle_start + relativedelta(months=1)
        cycle_end = cycle_end_temp - timedelta(days=1)
        # Cycle name is the month when it ends
        cycle_name = MONTH_NAMES[cycle_end.month - 1]
    else:
        # We're in a cycle that started last month
        cycle_start = datetime(reference_date.year, reference_date.month, start_day) - relativedelta(months=1)
        cycle_end = datetime(reference_date.year, reference_date.month, start_day) - timedelta(days=1)
        # Cycle name is the month when it ends
        cycle_name = MONTH_NAMES[cycle_end.month - 1]
    
    return {
        "cycle_name": cycle_name,
        "start_date": cycle_start.strftime("%Y-%m-%d"),
        "end_date": cycle_end.strftime("%Y-%m-%d")
    }

def get_cycle_by_offset(start_day: int, offset: int = 0) -> dict:
    """
    Get billing cycle relative to current cycle.
    
    Args:
        start_day: Day of month when cycle starts
        offset: Months offset (0=current, -1=previous, 1=next)
    
    Returns:
        dict with cycle_name, start_date, end_date
    """
    reference_date = datetime.now() + relativedelta(months=offset)
    return get_cycle_for_date(start_day, reference_date)

def get_cycle_range(start_day: int, num_cycles: int = 3) -> list[dict]:
    """
    Get multiple consecutive billing cycles.
    
    Args:
        start_day: Day of month when cycle starts
        num_cycles: Number of cycles to return
    
    Returns:
        List of cycle dicts, most recent first
    """
    cycles = []
    for i in range(num_cycles):
        cycles.append(get_cycle_by_offset(start_day, -i))
    return cycles

def format_cycle_display(cycle: dict) -> str:
    """
    Format cycle info for display.
    
    Example: "Enero (23 Dic - 22 Ene)"
    """
    start = datetime.strptime(cycle["start_date"], "%Y-%m-%d")
    end = datetime.strptime(cycle["end_date"], "%Y-%m-%d")
    
    start_str = f"{start.day} {MONTH_NAMES[start.month - 1][:3]}"
    end_str = f"{end.day} {MONTH_NAMES[end.month - 1][:3]}"
    
    return f"{cycle['cycle_name']} ({start_str} - {end_str})"
