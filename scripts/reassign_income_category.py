"""Reassign misclassified income transactions from one category to another.

Configuration constants at top. Set COMMIT=True after reviewing candidates.

Usage:
  E:/Desarrollo/BudgetApp/backend/.venv/Scripts/python.exe scripts/reassign_income_category.py
"""
from datetime import date
import os, sys
from sqlalchemy import and_

# Path bootstrap (add backend directory so 'app' package resolves)
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
BACKEND_DIR = os.path.join(ROOT, 'backend')
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.db.database import SessionLocal
from app.models.transaction import Transaction
from app.models.category import Category

# --- CONFIG ---
SOURCE_CATEGORY_ID = 1          # Currently holding salary-like transactions
TARGET_CATEGORY_ID = 4          # 'Salario' budget plan category
DATE_FROM = date(2025, 10, 23)   # Cycle start
DATE_TO = date(2025, 11, 22)     # Cycle end
MIN_AMOUNT_PEN = 9000            # Threshold to consider a transaction as salary (avoid small extras)
COMMIT = True                    # Set True to perform reassignment
# ---------------

def main():
    session = SessionLocal()
    try:
        src_cat = session.query(Category).filter(Category.id == SOURCE_CATEGORY_ID).first()
        tgt_cat = session.query(Category).filter(Category.id == TARGET_CATEGORY_ID).first()
        if not src_cat or not tgt_cat:
            print("Source or target category not found.")
            return
        print(f"Source: {src_cat.id} '{src_cat.name}'  Target: {tgt_cat.id} '{tgt_cat.name}'")
        q = session.query(Transaction).filter(
            and_(
                Transaction.category_id == SOURCE_CATEGORY_ID,
                Transaction.date >= DATE_FROM,
                Transaction.date <= DATE_TO,
                Transaction.amount_pen >= MIN_AMOUNT_PEN
            )
        ).order_by(Transaction.date)
        candidates = q.all()
        if not candidates:
            print("No candidate transactions found matching criteria.")
            return
        total = sum(t.amount_pen for t in candidates)
        print(f"Found {len(candidates)} candidate transactions (total amount_pen={total}):")
        for t in candidates:
            print(f"  ID={t.id} date={t.date} amount_pen={t.amount_pen} desc={t.description!r}")
        if COMMIT:
            for t in candidates:
                t.category_id = TARGET_CATEGORY_ID
            session.commit()
            print(f"Reassigned {len(candidates)} transactions to category {TARGET_CATEGORY_ID}.")
        else:
            print("Dry-run. Set COMMIT=True to apply changes.")
    finally:
        session.close()

if __name__ == "__main__":
    main()
