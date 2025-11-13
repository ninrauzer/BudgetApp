"""
Migration script to add is_active field to categories table
Implements soft delete functionality
"""
import sqlite3
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

def migrate():
    """Add is_active column to categories table"""
    db_path = project_root / "budget.db"
    
    if not db_path.exists():
        print(f"❌ Database not found at {db_path}")
        return False
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if column already exists
        cursor.execute("PRAGMA table_info(categories)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'is_active' in columns:
            print("✅ Column 'is_active' already exists. Skipping migration.")
            return True
        
        # Add is_active column with default value True
        print("📝 Adding 'is_active' column to categories table...")
        cursor.execute("""
            ALTER TABLE categories 
            ADD COLUMN is_active BOOLEAN DEFAULT 1 NOT NULL
        """)
        
        # Set all existing categories to active
        cursor.execute("""
            UPDATE categories 
            SET is_active = 1 
            WHERE is_active IS NULL
        """)
        
        conn.commit()
        print("✅ Migration completed successfully!")
        print(f"   - Added 'is_active' column to categories")
        print(f"   - Set all existing categories to active (is_active = True)")
        
        # Show summary
        cursor.execute("SELECT COUNT(*) FROM categories WHERE is_active = 1")
        active_count = cursor.fetchone()[0]
        print(f"   - Total active categories: {active_count}")
        
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    print("=" * 60)
    print("MIGRATION: Add is_active field to categories")
    print("=" * 60)
    success = migrate()
    sys.exit(0 if success else 1)
