import sys
sys.path.insert(0, '/app')
from app.db.database import SessionLocal
from app.models.budget_plan import BudgetPlan
from app.services.billing_cycle import get_cycle_dates

db = SessionLocal()

# Get all "Enero" plans
enero_plans = db.query(BudgetPlan).filter(BudgetPlan.cycle_name == "Enero").all()

print(f"Found {len(enero_plans)} Enero plans with incorrect dates")

# Delete them
for plan in enero_plans:
    print(f"Deleting: {plan.start_date} to {plan.end_date}")
    db.delete(plan)

db.commit()

# Verify they're gone
remaining = db.query(BudgetPlan).filter(BudgetPlan.cycle_name == "Enero").count()
print(f"Remaining Enero plans: {remaining}")

# Show what the correct dates should be
correct_dates = get_cycle_dates("Enero", db)
print(f"Correct dates for Enero: {correct_dates['start_date']} to {correct_dates['end_date']}")

db.close()
