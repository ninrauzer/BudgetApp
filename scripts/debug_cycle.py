import sys
sys.path.insert(0, '/app')
from app.db.database import SessionLocal
from app.models.budget_plan import BudgetPlan
from app.services.billing_cycle import get_cycle_dates

db = SessionLocal()

# Check what's in DB for Enero
plans = db.query(BudgetPlan).filter(BudgetPlan.cycle_name == "Enero").all()
print(f"Stored Enero plans in DB:")
for p in plans[:2]:
    print(f"  {p.start_date} to {p.end_date}")

print()

# Check what get_cycle_dates returns
dates = get_cycle_dates("Enero", db)
print(f"get_cycle_dates('Enero') returns:")
print(f"  {dates['start_date']} to {dates['end_date']}")

db.close()
