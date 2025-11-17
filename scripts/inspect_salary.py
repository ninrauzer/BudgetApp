"""Utility script to inspect salary-related (income) categories and their transactions in the current 'Noviembre' cycle.

Adds path bootstrap so it can be run from repo root:
    E:/Desarrollo/BudgetApp/backend/.venv/Scripts/python.exe scripts/inspect_salary.py

Output:
    - Categories whose name starts with 'Sal' or contains 'Beneficio', plus all income categories
    - Transaction counts and sums overall and inside cycle window
    - IDs missing actuals in the cycle
"""
import os, sys
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy import func

# Ensure backend/app is on path so "app." imports resolve
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))  # project root
BACKEND_DIR = os.path.join(ROOT, 'backend')  # directory that contains package 'app'
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.db.database import SessionLocal
from app.models.category import Category
from app.models.transaction import Transaction


def main():
    session = SessionLocal()
    try:
        # Gather income categories
        income_cats = session.query(Category).filter(Category.type == 'income').order_by(Category.id).all()
        # Salary-like heuristic
        salary_like = session.query(Category).filter(Category.name.like('Sal%')).order_by(Category.id).all()
        beneficios = session.query(Category).filter(Category.name.like('%Beneficio%')).order_by(Category.id).all()
        combined = {c.id: c for c in income_cats}
        for c in salary_like + beneficios:
            combined[c.id] = c

        print("Income / salary-related categories:")
        for cid in sorted(combined.keys()):
            c = combined[cid]
            print(f"  ID={c.id:>2} name={c.name!r} type={c.type} active={c.is_active}")

        # Overall transaction counts
        print("\nOverall transaction counts & sums (amount_pen):")
        for cid in sorted(combined.keys()):
            cnt = session.query(func.count(Transaction.id)).filter(Transaction.category_id == cid).scalar()
            amt = session.query(func.sum(Transaction.amount_pen)).filter(Transaction.category_id == cid).scalar() or 0
            print(f"  Category {cid:>2}: count={cnt:<3} sum={amt}")

        # Compute current 'Noviembre' cycle same as API
        billing_cycle_start_day = 23
        month_num = 11  # Noviembre
        year = datetime.now().year
        cycle_end_temp = datetime(year, month_num, billing_cycle_start_day)
        cycle_end = cycle_end_temp - timedelta(days=1)
        cycle_start = cycle_end_temp - relativedelta(months=1)
        if cycle_start.date() > datetime.now().date():
            cycle_start = cycle_start - relativedelta(years=1)
            cycle_end = cycle_end - relativedelta(years=1)
        print(f"\nCycle Noviembre: {cycle_start.date()} to {cycle_end.date()}")

        missing = []
        for cid in sorted(combined.keys()):
            cycle_sum = session.query(func.sum(Transaction.amount_pen)).filter(
                Transaction.category_id == cid,
                Transaction.date >= cycle_start.date(),
                Transaction.date <= cycle_end.date()
            ).scalar()
            if not cycle_sum:
                missing.append(cid)
            print(f"  Category {cid:>2} cycle_sum={cycle_sum or 0}")

        if missing:
            print("\nCategories with NO actuals in cycle (candidate mismatch with budget plans):", missing)

        # Show sample transactions for those with actuals
        print("\nSample transactions in cycle:")
        for cid in sorted(combined.keys()):
            txs = session.query(Transaction).filter(
                Transaction.category_id == cid,
                Transaction.date >= cycle_start.date(),
                Transaction.date <= cycle_end.date()
            ).order_by(Transaction.date).limit(5).all()
            if txs:
                print(f"  Cat {cid}: {len(txs)} shown")
                for t in txs:
                    print(f"    {t.date} amount_pen={t.amount_pen} desc={t.description}")
        print("\nDone.")
    finally:
        session.close()

if __name__ == "__main__":
    main()
