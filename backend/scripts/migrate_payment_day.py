"""
Migration script to add payment_day column to loans table
"""
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import text
from app.db.database import engine

def migrate_add_payment_day():
    """Add payment_day column to loans table"""
    print("🔄 Adding payment_day column to loans table...")
    
    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text("PRAGMA table_info(loans)"))
        columns = [row[1] for row in result]
        
        if 'payment_day' in columns:
            print("✅ Column payment_day already exists. No migration needed.")
            return
        
        # Add column
        try:
            conn.execute(text("ALTER TABLE loans ADD COLUMN payment_day INTEGER"))
            conn.commit()
            print("✅ Column payment_day added successfully")
            
            # Update existing loans with payment day from start_date
            print("🔄 Setting payment_day from start_date for existing loans...")
            conn.execute(text("""
                UPDATE loans 
                SET payment_day = CAST(strftime('%d', start_date) AS INTEGER)
                WHERE payment_day IS NULL
            """))
            conn.commit()
            print("✅ Existing loans updated with payment_day")
            
        except Exception as e:
            print(f"❌ Error during migration: {e}")
            conn.rollback()
            raise
    
    print("✅ Migration completed successfully!")

if __name__ == "__main__":
    migrate_add_payment_day()
