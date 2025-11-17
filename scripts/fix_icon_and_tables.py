"""
Fix swap-horizontal icon and check quick_templates table
"""
import sqlite3
import os

# Find database
DB_CANDIDATES = [
    os.path.join("backend", "budget.db"),
    os.path.join("frontend", "budget.db"),
    "budget.db",
]

db_path = None
for candidate in DB_CANDIDATES:
    if os.path.exists(candidate):
        db_path = candidate
        print(f"✓ Found database: {db_path}")
        break

if not db_path:
    print("ERROR: No database found")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # 1. Fix swap-horizontal icon -> arrow-left-right
    print("\n1. Fixing icon name swap-horizontal -> arrow-left-right...")
    cursor.execute("SELECT id, name, icon FROM categories WHERE icon = 'swap-horizontal'")
    categories = cursor.fetchall()
    
    if categories:
        print(f"   Found {len(categories)} categories with swap-horizontal:")
        for cat_id, name, icon in categories:
            print(f"   - {name} (id: {cat_id})")
        
        cursor.execute("UPDATE categories SET icon = 'arrow-left-right' WHERE icon = 'swap-horizontal'")
        conn.commit()
        print(f"   ✓ Updated to 'arrow-left-right'")
    else:
        print("   No categories with swap-horizontal found")
    
    # 2. Check if quick_templates table exists
    print("\n2. Checking quick_templates table...")
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='quick_templates'")
    table_exists = cursor.fetchone()
    
    if table_exists:
        print("   ✓ quick_templates table exists")
        cursor.execute("SELECT COUNT(*) FROM quick_templates")
        count = cursor.fetchone()[0]
        print(f"   Contains {count} templates")
    else:
        print("   ! quick_templates table does NOT exist")
        print("   Creating table...")
        
        cursor.execute("""
            CREATE TABLE quick_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR NOT NULL,
                description VARCHAR NOT NULL,
                amount FLOAT NOT NULL,
                type VARCHAR NOT NULL DEFAULT 'expense',
                category_id INTEGER NOT NULL,
                FOREIGN KEY (category_id) REFERENCES categories (id)
            )
        """)
        conn.commit()
        print("   ✓ Created quick_templates table")
    
    print("\n✓ All fixes applied successfully!")
    
except Exception as e:
    print(f"\nERROR: {e}")
    conn.rollback()
finally:
    conn.close()
