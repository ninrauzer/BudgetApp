"""
Add icon field to accounts table
"""
import sqlite3
from pathlib import Path

# Database path
db_path = Path(__file__).parent.parent / "budget.db"

def migrate():
    """Add icon column to accounts table"""
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    
    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(accounts)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'icon' not in columns:
            print("Adding icon column to accounts table...")
            cursor.execute("ALTER TABLE accounts ADD COLUMN icon VARCHAR DEFAULT 'wallet'")
            conn.commit()
            print("✓ Icon column added successfully")
            
            # Update existing accounts with appropriate icons
            print("Updating existing accounts with default icons...")
            cursor.execute("""
                UPDATE accounts 
                SET icon = CASE
                    WHEN type = 'cash' THEN 'wallet'
                    WHEN type = 'bank' THEN 'landmark'
                    WHEN type = 'credit_card' THEN 'credit-card'
                    WHEN type = 'debit_card' THEN 'credit-card'
                    WHEN type = 'digital_wallet' THEN 'smartphone'
                    ELSE 'wallet'
                END
            """)
            conn.commit()
            print("✓ Existing accounts updated with icons")
        else:
            print("✓ Icon column already exists")
            
    except Exception as e:
        print(f"✗ Error during migration: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    print("Starting account icon migration...")
    migrate()
    print("Migration completed!")
