"""
Migration script to update budget_plans UNIQUE constraint.
Changes from (cycle_name, category_id) to (cycle_name, category_id, start_date)
to allow the same cycle name across different years.
"""
import sys
import os
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# Set DATABASE_URL to use budget.db (the correct database)
os.environ['DATABASE_URL'] = f"sqlite:///{backend_dir}/budget.db"

from sqlalchemy import create_engine, text

def migrate():
    """Update budget_plans table constraint"""
    db_path = backend_dir / "budget.db"
    engine = create_engine(f"sqlite:///{db_path}")
    
    with engine.connect() as conn:
        print("Starting migration...")
        
        # Start transaction
        trans = conn.begin()
        
        try:
            # Check if budget_plans_new exists from a failed previous migration
            result = conn.execute(text("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='budget_plans_new'
            """))
            if result.fetchone():
                print("Cleaning up previous failed migration...")
                conn.execute(text("DROP TABLE budget_plans_new"))
            
            # Check if budget_plans exists
            result = conn.execute(text("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='budget_plans'
            """))
            if not result.fetchone():
                print("❌ Error: budget_plans table does not exist!")
                print("Please run init_db.py first to create the database schema.")
                return
            
            # 1. Create temporary table with new constraint
            print("Creating temporary table...")
            conn.execute(text("""
                CREATE TABLE budget_plans_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    cycle_name VARCHAR NOT NULL,
                    start_date DATE NOT NULL,
                    end_date DATE NOT NULL,
                    category_id INTEGER NOT NULL,
                    amount FLOAT NOT NULL,
                    notes VARCHAR,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(category_id) REFERENCES categories (id),
                    UNIQUE (cycle_name, category_id, start_date)
                )
            """))
            
            # 2. Copy data from old table
            print("Copying data...")
            conn.execute(text("""
                INSERT INTO budget_plans_new 
                    (id, cycle_name, start_date, end_date, category_id, amount, notes, created_at, updated_at)
                SELECT 
                    id, cycle_name, start_date, end_date, category_id, amount, notes, created_at, updated_at
                FROM budget_plans
            """))
            
            # 3. Drop old table
            print("Dropping old table...")
            conn.execute(text("DROP TABLE budget_plans"))
            
            # 4. Rename new table
            print("Renaming new table...")
            conn.execute(text("ALTER TABLE budget_plans_new RENAME TO budget_plans"))
            
            # Commit transaction
            trans.commit()
            print("✅ Migration completed successfully!")
            print("Budget plans can now have the same cycle name across different years.")
            
        except Exception as e:
            trans.rollback()
            print(f"❌ Migration failed: {str(e)}")
            raise

if __name__ == "__main__":
    migrate()
