"""Merge duplicate categories by name.

For each category name with more than one row:
  1. Pick canonical category (the one with most transactions; tie -> lowest id).
  2. Reassign transactions and budget plans from duplicate IDs to canonical ID.
  3. Delete duplicate category rows.
  4. Produce a JSON backup (categories_removed.json) with metadata.

Usage (PowerShell):
  cd backend
  .\.venv\Scripts\python.exe scripts\merge_duplicate_categories.py

This script performs modifications immediately (no dry-run). Create a DB backup first if needed.
"""
from __future__ import annotations
import json
from datetime import datetime
from collections import defaultdict
from app.db.database import SessionLocal
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.budget_plan import BudgetPlan
from sqlalchemy import func


def choose_canonical(session, categories):
    """Choose canonical category among provided Category objects.
    Prefer the one with most transactions; tie -> lowest id."""
    counts = (
        session.query(Transaction.category_id, func.count(Transaction.id))
        .filter(Transaction.category_id.in_([c.id for c in categories]))
        .group_by(Transaction.category_id)
        .all()
    )
    count_map = {cid: cnt for cid, cnt in counts}
    # Ensure all present
    for c in categories:
        count_map.setdefault(c.id, 0)
    # Sort by (-count, id)
    canonical = sorted(categories, key=lambda c: (-count_map[c.id], c.id))[0]
    return canonical, count_map


def merge_duplicates(session):
    # Load all categories
    cats = session.query(Category).all()
    by_name: dict[str, list[Category]] = defaultdict(list)
    for c in cats:
        by_name[c.name].append(c)

    duplicates = {name: items for name, items in by_name.items() if len(items) > 1}
    if not duplicates:
        print("No duplicate category names detected.")
        return {"removed": [], "canonical": []}

    backup = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "duplicates": []
    }

    total_removed = []
    canonical_summary = []

    for name, items in duplicates.items():
        canonical, count_map = choose_canonical(session, items)
        to_remove = [c for c in items if c.id != canonical.id]
        print(f"Merging '{name}' -> canonical ID {canonical.id}; removing {[c.id for c in to_remove]}")

        # Reassign transactions
        if to_remove:
            session.query(Transaction).filter(
                Transaction.category_id.in_([c.id for c in to_remove])
            ).update({Transaction.category_id: canonical.id}, synchronize_session=False)

            # Reassign budget plans
            session.query(BudgetPlan).filter(
                BudgetPlan.category_id.in_([c.id for c in to_remove])
            ).update({BudgetPlan.category_id: canonical.id}, synchronize_session=False)

            # Collect backup info and delete categories
            backup["duplicates"].append({
                "name": name,
                "canonical_id": canonical.id,
                "canonical_transactions": count_map.get(canonical.id, 0),
                "removed": [
                    {
                        "id": c.id,
                        "transactions": count_map.get(c.id, 0),
                        "icon": c.icon,
                        "type": c.type,
                        "created_at": c.created_at.isoformat() if c.created_at else None,
                    }
                    for c in to_remove
                ],
            })
            canonical_summary.append({
                "name": name,
                "canonical_id": canonical.id,
                "removed_ids": [c.id for c in to_remove]
            })
            total_removed.extend([c.id for c in to_remove])
            for c in to_remove:
                session.delete(c)

    session.commit()

    # Write backup
    with open("categories_removed.json", "w", encoding="utf-8") as f:
        json.dump(backup, f, indent=2, ensure_ascii=False)
    print(f"Backup written to categories_removed.json ({len(total_removed)} categories removed)")

    return {"removed": total_removed, "canonical": canonical_summary}


def main():
    session = SessionLocal()
    try:
        result = merge_duplicates(session)
        print("Summary:")
        print(json.dumps(result, indent=2))
    finally:
        session.close()


if __name__ == "__main__":
    main()
