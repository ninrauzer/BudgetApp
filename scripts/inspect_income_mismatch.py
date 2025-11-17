"""Inspect possible income mismatch causes for Salario category.
Print transaction ID=2, categories 4,35,36 summaries inside cycle, and raw aggregation identical to API logic.
"""
import os, sys
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy import func, and_

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
BACKEND_DIR = os.path.join(ROOT, 'backend')
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.db.database import SessionLocal
from app.models.transaction import Transaction
from app.models.category import Category

CYCLE_NAME = 'Noviembre'
START_DAY = 23  # billing cycle start
MONTH_NUM = 11
YEAR = datetime.now().year
cycle_end_temp = datetime(YEAR, MONTH_NUM, START_DAY)
cycle_end = cycle_end_temp - timedelta(days=1)
cycle_start = cycle_end_temp - relativedelta(months=1)
if cycle_start.date() > datetime.now().date():
    cycle_start = cycle_start - relativedelta(years=1)
    cycle_end = cycle_end - relativedelta(years=1)

session = SessionLocal()
print(f"Cycle {CYCLE_NAME}: {cycle_start.date()} to {cycle_end.date()}")

# Transaction ID=2 details
trx = session.query(Transaction).filter(Transaction.id==2).first()
print("\nTransaction ID=2:")
if trx:
    print(f"  id={trx.id} date={trx.date} cat={trx.category_id} amount_pen={trx.amount_pen} type={trx.type} desc={trx.description!r}")
else:
    print("  Not found")

cat_ids = [4,35,36]
print("\nCategory basic info:")
for cid in cat_ids:
    c = session.query(Category).filter(Category.id==cid).first()
    if c:
        print(f"  {cid}: name={c.name!r} type={c.type} active={c.is_active}")
    else:
        print(f"  {cid}: <missing>")

print("\nAggregate sums inside cycle (API logic):")
agg = session.query(Transaction.category_id, func.sum(Transaction.amount_pen).label('total')).filter(
    and_(Transaction.date>=cycle_start.date(), Transaction.date<=cycle_end.date(), Transaction.category_id.in_(cat_ids))
).group_by(Transaction.category_id).all()
agg_map = {a.category_id: a.total for a in agg}
for cid in cat_ids:
    print(f"  {cid}: cycle_total={agg_map.get(cid,0)}")

print("\nRaw transactions for these categories inside cycle (up to 10 each):")
for cid in cat_ids:
    txs = session.query(Transaction).filter(
        Transaction.category_id==cid,
        Transaction.date>=cycle_start.date(),
        Transaction.date<=cycle_end.date()
    ).order_by(Transaction.date).limit(10).all()
    if txs:
        print(f"  Cat {cid} -> {len(txs)} txs")
        for t in txs:
            print(f"    {t.id} {t.date} amount_pen={t.amount_pen} desc={t.description!r}")
    else:
        print(f"  Cat {cid} -> no txs")

# Check if transaction ID=2 appears in general aggregation
api_like = session.query(Transaction.category_id, func.sum(Transaction.amount_pen).label('total')).filter(
    and_(Transaction.date>=cycle_start.date(), Transaction.date<=cycle_end.date())
).group_by(Transaction.category_id).all()
ids = sorted([r.category_id for r in api_like])
print("\nAll category IDs with actuals this cycle:")
print(ids)
print("Contains category 4?", 4 in ids)

session.close()
print("\nInspection complete.")
