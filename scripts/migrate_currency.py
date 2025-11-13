"""
Migration script to add currency support to transactions table
"""
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.db.database import engine, SessionLocal


def migrate_database():
    """Add currency fields to transactions table"""
    
    print("🔄 Starting database migration for currency support...")
    
    with engine.connect() as connection:
        # Start transaction
        trans = connection.begin()
        
        try:
            # Check if columns already exist
            result = connection.execute(text("PRAGMA table_info(transactions)"))
            columns = [row[1] for row in result]
            
            if 'currency' in columns:
                print("✅ Migration already applied, skipping...")
                trans.rollback()
                return
            
            # Add new columns
            print("📝 Adding currency column...")
            connection.execute(text(
                "ALTER TABLE transactions ADD COLUMN currency VARCHAR DEFAULT 'PEN'"
            ))
            
            print("📝 Adding exchange_rate column...")
            connection.execute(text(
                "ALTER TABLE transactions ADD COLUMN exchange_rate FLOAT"
            ))
            
            print("📝 Adding amount_pen column...")
            connection.execute(text(
                "ALTER TABLE transactions ADD COLUMN amount_pen FLOAT"
            ))
            
            # Update existing records - set amount_pen = amount for existing PEN transactions
            print("🔄 Updating existing records...")
            connection.execute(text(
                "UPDATE transactions SET amount_pen = amount WHERE amount_pen IS NULL"
            ))
            
            # Commit transaction
            trans.commit()
            print("✅ Migration completed successfully!")
            
        except Exception as e:
            trans.rollback()
            print(f"❌ Migration failed: {e}")
            raise


if __name__ == "__main__":
    migrate_database()
