"""Service logic to merge duplicate categories using SQLAlchemy session.

Rules:
  - Duplicates are categories sharing the same name (case-sensitive current implementation).
  - Canonical category chosen by: highest number of transactions; tie -> lowest id.
  - All transactions & budget plans of removed categories are reassigned to canonical.
  - Removed categories are deleted (hard delete to mirror original script behavior).

Return structure:
{
  "duplicates": [
      {
        "name": str,
        "canonical_id": int,
        "removed_ids": [int,...],
        "canonical_transactions": int,
        "removed": [
            {"id": int, "transactions": int}
        ]
      }
  ],
  "removed_count": int
}

NOTE: This function commits changes; wrap in transaction if you need atomicity.
"""
from typing import Dict, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.category import Category
from app.models.transaction import Transaction
from app.models.budget_plan import BudgetPlan


def merge_duplicate_categories(session: Session) -> Dict:
    # Fetch counts per category for tie-breaking
    tx_counts = dict(
        session.query(Transaction.category_id, func.count(Transaction.id))
        .group_by(Transaction.category_id)
        .all()
    )

    categories: List[Category] = session.query(Category).all()
    by_name: Dict[str, List[Category]] = {}
    for c in categories:
        by_name.setdefault(c.name, []).append(c)

    duplicates = {n: items for n, items in by_name.items() if len(items) > 1}
    if not duplicates:
        return {"duplicates": [], "removed_count": 0}

    report_duplicates = []
    total_removed = 0

    for name, items in duplicates.items():
        # Determine canonical
        canonical = sorted(items, key=lambda c: (-tx_counts.get(c.id, 0), c.id))[0]
        to_remove = [c for c in items if c.id != canonical.id]
        if not to_remove:
            continue
        removed_ids = [c.id for c in to_remove]

        # Reassign transactions
        session.query(Transaction).filter(Transaction.category_id.in_(removed_ids)).update(
            {Transaction.category_id: canonical.id}, synchronize_session=False
        )

        # Merge budget plans without violating unique constraint (cycle_name + category_id)
        # Build map of existing canonical plans by cycle_name
        canonical_plans = {
            bp.cycle_name: bp for bp in session.query(BudgetPlan).filter(BudgetPlan.category_id == canonical.id).all()
        }
        # Iterate plans of categories to remove
        plans_to_merge = session.query(BudgetPlan).filter(BudgetPlan.category_id.in_(removed_ids)).all()
        for bp in plans_to_merge:
            existing = canonical_plans.get(bp.cycle_name)
            if existing:
                # Merge strategy: sum amounts, concatenate notes if present
                existing.amount += bp.amount
                if bp.notes:
                    if existing.notes:
                        existing.notes = f"{existing.notes} | {bp.notes}"
                    else:
                        existing.notes = bp.notes
                # Delete the duplicate plan row
                session.delete(bp)
            else:
                # Safe to reassign category
                bp.category_id = canonical.id
                canonical_plans[bp.cycle_name] = bp

        # Delete categories
        session.query(Category).filter(Category.id.in_(removed_ids)).delete(synchronize_session=False)

        report_duplicates.append({
            "name": name,
            "canonical_id": canonical.id,
            "canonical_transactions": tx_counts.get(canonical.id, 0),
            "removed_ids": removed_ids,
            "removed": [
                {
                    "id": c.id,
                    "transactions": tx_counts.get(c.id, 0)
                } for c in to_remove
            ]
        })
        total_removed += len(removed_ids)

    session.commit()
    return {"duplicates": report_duplicates, "removed_count": total_removed}

__all__ = ["merge_duplicate_categories"]
