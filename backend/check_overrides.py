from app.db.database import SessionLocal
from app.models.billing_cycle_override import BillingCycleOverride

db = SessionLocal()
overrides = db.query(BillingCycleOverride).all()

print(f"\n=== OVERRIDES GUARDADOS ({len(overrides)}) ===")
for o in overrides:
    print(f"Year: {o.year}, Month: {o.month}, Start: {o.override_start_date}, Reason: {o.reason}")

db.close()
