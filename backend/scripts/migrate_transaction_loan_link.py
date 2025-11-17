"""
Migration script to add loan_id column to transactions table
This enables linking transactions to specific loans for automatic tracking

Run: python scripts/migrate_transaction_loan_link.py
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.db.database import engine


def migrate():
    """Add loan_id column to transactions table"""
    
    with engine.connect() as conn:
        # Check if column already exists
        result = conn.execute(text("PRAGMA table_info(transactions)"))
        columns = [row[1] for row in result]
        
        if 'loan_id' in columns:
            print("⚠️  Column 'loan_id' already exists in transactions table")
            return
        
        print("Adding loan_id column to transactions table...")
        
        # Add loan_id column
        conn.execute(text("""
            ALTER TABLE transactions 
            ADD COLUMN loan_id INTEGER REFERENCES loans(id)
        """))
        
        conn.commit()
        print("✅ Migration completed successfully!")
        print("   - Added loan_id column (nullable, references loans table)")


if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)
