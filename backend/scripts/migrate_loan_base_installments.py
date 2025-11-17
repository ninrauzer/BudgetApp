"""
Migration script to add base_installments_paid to loans table
This separates manually paid installments from those tracked via transactions

Run: python scripts/migrate_loan_base_installments.py
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.db.database import engine


def migrate():
    """Add base_installments_paid column and migrate existing data"""
    
    with engine.connect() as conn:
        # Check if column already exists
        result = conn.execute(text("PRAGMA table_info(loans)"))
        columns = [row[1] for row in result]
        
        if 'base_installments_paid' in columns:
            print("⚠️  Column 'base_installments_paid' already exists in loans table")
            return
        
        print("Adding base_installments_paid column to loans table...")
        
        # Add base_installments_paid column
        conn.execute(text("""
            ALTER TABLE loans 
            ADD COLUMN base_installments_paid INTEGER DEFAULT 0
        """))
        
        # Migrate existing data: base_installments_paid = current_installment
        # (all current payments are considered "base" since no transactions are linked yet)
        print("Migrating existing data...")
        conn.execute(text("""
            UPDATE loans 
            SET base_installments_paid = current_installment
        """))
        
        conn.commit()
        print("✅ Migration completed successfully!")
        print("   - Added base_installments_paid column")
        print("   - Migrated current_installment values to base_installments_paid")
        print("   - Note: current_installment will now be calculated as base + transaction count")


if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)
