"""
Migration script to add transfer support to transactions table
Run this to update the database schema
"""

import sqlite3
import os

# Get database path
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'budget.db')

def migrate():
    """Apply migration to add transfer support"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print("🔄 Starting migration: add_transfer_support_to_transactions")
        
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(transactions)")
        columns = [col[1] for col in cursor.fetchall()]
        
        # Add transaction_type if not exists
        if 'transaction_type' not in columns:
            print("  ➕ Adding column: transaction_type")
            cursor.execute("""
                ALTER TABLE transactions 
                ADD COLUMN transaction_type TEXT NOT NULL DEFAULT 'normal'
            """)
        else:
            print("  ✓ Column transaction_type already exists")
        
        # Add transfer_id if not exists
        if 'transfer_id' not in columns:
            print("  ➕ Adding column: transfer_id")
            cursor.execute("""
                ALTER TABLE transactions 
                ADD COLUMN transfer_id TEXT
            """)
            # Create index
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS ix_transactions_transfer_id 
                ON transactions(transfer_id)
            """)
        else:
            print("  ✓ Column transfer_id already exists")
        
        # Add related_transaction_id if not exists
        if 'related_transaction_id' not in columns:
            print("  ➕ Adding column: related_transaction_id")
            cursor.execute("""
                ALTER TABLE transactions 
                ADD COLUMN related_transaction_id INTEGER
                REFERENCES transactions(id)
            """)
        else:
            print("  ✓ Column related_transaction_id already exists")
        
        # Create Transferencias category if not exists
        cursor.execute("""
            SELECT id FROM categories WHERE name = 'Transferencias'
        """)
        if not cursor.fetchone():
            print("  ➕ Creating system category: Transferencias")
            cursor.execute("""
                INSERT INTO categories (name, type, icon, color, is_active)
                VALUES ('Transferencias', 'expense', 'swap-horizontal', '#6B7280', 1)
            """)
        else:
            print("  ✓ Category 'Transferencias' already exists")
        
        conn.commit()
        print("✅ Migration completed successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
        raise
    
    finally:
        conn.close()


if __name__ == "__main__":
    migrate()
