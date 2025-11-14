"""Utility functions for calculating billing cycles."""
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from calendar import monthrange

# Spanish month names
MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

def _safe_date(year: int, month: int, day: int) -> datetime:
    """Return a date ensuring the day exists in the month."""
    last_day = monthrange(year, month)[1]
    return datetime(year, month, min(day, last_day))


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
        cycle_start = _safe_date(reference_date.year, reference_date.month, start_day)
    else:
        prev_month = reference_date - relativedelta(months=1)
        cycle_start = _safe_date(prev_month.year, prev_month.month, start_day)

    cycle_end_temp = cycle_start + relativedelta(months=1)
    cycle_end = cycle_end_temp - timedelta(days=1)
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


def get_cycle_dates(cycle_name: str, db=None) -> dict | None:
    """
    Get start and end dates for a given cycle name.
    
    Args:
        cycle_name: Month name in Spanish ("Enero", "Febrero", etc.)
        db: Database session (to get billing_cycle_day from settings)
    
    Returns:
        dict with start_date and end_date, or None if invalid cycle_name
        
    Example:
        cycle_name="Enero" returns dates for the Enero cycle based on billing day
    """
    if cycle_name not in MONTH_NAMES:
        return None
    
    # Get billing cycle start day from settings (default to 1 if not found)
    start_day = 1
    if db:
        try:
            from app.models.category import Setting
            setting = db.query(Setting).filter(Setting.key == "billing_cycle_day").first()
            if setting and setting.value:
                start_day = int(setting.value)
        except Exception:
            start_day = 1
    
    # Find the month number for the cycle_name
    month_num = MONTH_NAMES.index(cycle_name) + 1
    
    # Calculate dates for this cycle in current year
    # If the cycle is in the future, use current year; otherwise, check if we need previous year
    current_date = datetime.now()
    year = current_date.year
    
    # The cycle ends in the month matching cycle_name
    cycle_end_temp = _safe_date(year, month_num, start_day)
    cycle_end = cycle_end_temp - timedelta(days=1)
    
    # Start is one month before end
    cycle_start = cycle_end_temp - relativedelta(months=1)
    
    # If calculated dates are in the future and we want current/past data, adjust year
    if cycle_start > current_date:
        cycle_start = cycle_start - relativedelta(years=1)
        cycle_end = cycle_end - relativedelta(years=1)
    
    return {
        "start_date": cycle_start.date(),
        "end_date": cycle_end.date()
    }
