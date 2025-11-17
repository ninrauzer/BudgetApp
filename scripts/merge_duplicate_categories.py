"""Merge duplicate categories by name using direct SQLite access.

Process per duplicated name:
  1. Determine canonical category (most transactions; tie -> lowest id).
  2. UPDATE transactions + budget_plans to canonical id.
  3. DELETE obsolete category rows.
  4. Save JSON backup (categories_removed.json) detailing removals.

Destructive: create a backup of backend/budget.db before running.

Usage:
  python .\scripts\merge_duplicate_categories.py
"""
import os, json, sqlite3
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(__file__))
DB_PATH = os.path.join(ROOT, 'backend', 'budget.db')

def fetch_transaction_counts(cur):
    cur.execute('SELECT category_id, COUNT(*) FROM transactions GROUP BY category_id')
    return {cid: cnt for cid, cnt in cur.fetchall()}

def load_categories(cur):
    cur.execute('SELECT id, name, type, icon, is_active, created_at FROM categories')
    rows = cur.fetchall()
    cats = []
    for r in rows:
        cats.append({
            'id': r[0], 'name': r[1], 'type': r[2], 'icon': r[3],
            'is_active': r[4], 'created_at': r[5]
        })
    return cats

def choose_canonical(items, counts):
    # items: list of category dicts
    # Return canonical category dict
    return sorted(items, key=lambda c: (-counts.get(c['id'], 0), c['id']))[0]

def merge_duplicates():
    if not os.path.exists(DB_PATH):
        raise FileNotFoundError(f"Database file not found: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    print(f"Connected to {DB_PATH}")

    counts = fetch_transaction_counts(cur)
    categories = load_categories(cur)
    by_name = {}
    for c in categories:
        by_name.setdefault(c['name'], []).append(c)

    duplicates = {n: items for n, items in by_name.items() if len(items) > 1}
    if not duplicates:
        print('No duplicate category names detected.')
        conn.close()
        return {"removed": [], "canonical": []}

    backup = {"timestamp": datetime.utcnow().isoformat() + 'Z', "duplicates": []}
    removed_ids = []
    canonical_summary = []

    for name, items in duplicates.items():
        canonical = choose_canonical(items, counts)
        to_remove = [c for c in items if c['id'] != canonical['id']]
        print(f"Merging '{name}' -> canonical {canonical['id']} remove {[c['id'] for c in to_remove]}")
        if not to_remove:
            continue

        # Reassign transactions
        cur.execute(f"UPDATE transactions SET category_id=? WHERE category_id IN ({','.join(['?']*len(to_remove))})", [canonical['id']] + [c['id'] for c in to_remove])
        # Reassign budget plans
        cur.execute(f"UPDATE budget_plans SET category_id=? WHERE category_id IN ({','.join(['?']*len(to_remove))})", [canonical['id']] + [c['id'] for c in to_remove])

        backup['duplicates'].append({
            'name': name,
            'canonical_id': canonical['id'],
            'canonical_transactions': counts.get(canonical['id'], 0),
            'removed': [
                {
                    'id': c['id'],
                    'transactions': counts.get(c['id'], 0),
                    'icon': c['icon'],
                    'type': c['type'],
                    'created_at': c['created_at']
                } for c in to_remove
            ]
        })
        canonical_summary.append({
            'name': name,
            'canonical_id': canonical['id'],
            'removed_ids': [c['id'] for c in to_remove]
        })
        removed_ids.extend([c['id'] for c in to_remove])
        cur.execute(f"DELETE FROM categories WHERE id IN ({','.join(['?']*len(to_remove))})", [c['id'] for c in to_remove])

    conn.commit()
    conn.close()

    with open('categories_removed.json', 'w', encoding='utf-8') as f:
        json.dump(backup, f, indent=2, ensure_ascii=False)
    print(f"Backup written to categories_removed.json ({len(removed_ids)} categories removed)")
    return {"removed": removed_ids, "canonical": canonical_summary}

def main():
    result = merge_duplicates()
    print('Summary:')
    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == '__main__':
    main()
