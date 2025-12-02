#!/usr/bin/env python3
import sys
sys.path.insert(0, '/mnt/e/Desarrollo/BudgetApp/backend')
from app.services.billing_cycle import get_cycle_dates
from datetime import datetime

today = datetime(2024, 11, 19)
print(f'Today: {today.date()}')
print()

for month_name in ['Diciembre', 'Enero', 'Febrero']:
    dates = get_cycle_dates(month_name)
    if dates:
        print(f'{month_name}:')
        print(f'  Start: {dates["start_date"]}')
        print(f'  End:   {dates["end_date"]}')
    print()
