import sys
sys.path.insert(0, '/app')
from app.db.database import SessionLocal
from app.models.budget_plan import BudgetPlan

db = SessionLocal()
plans = db.query(BudgetPlan).filter(BudgetPlan.cycle_name == "Enero").all()

print(f"Budget plans for 'Enero': {len(plans)}")
for p in plans[:3]:
    print(f"  ID {p.id}: {p.start_date} to {p.end_date} - amount: {p.amount}")

db.close()
