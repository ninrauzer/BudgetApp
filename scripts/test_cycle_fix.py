import sys
sys.path.insert(0, '/mnt/e/Desarrollo/BudgetApp/backend')
from app.services.billing_cycle import get_cycle_dates

# Test cycle dates
for cycle in ['Diciembre', 'Enero', 'Febrero']:
    dates = get_cycle_dates(cycle)
    if dates:
        print(f"{cycle}: {dates['start_date']} to {dates['end_date']}")
