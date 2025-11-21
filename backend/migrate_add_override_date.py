#!/usr/bin/env python3
"""
Migration script: Add next_override_date column to billing_cycles table.
This is a simple manual migration for both SQLite and PostgreSQL.
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text, inspect
from app.db.database import DATABASE_URL

load_dotenv()

def migrate():
    """Add next_override_date column to billing_cycles table."""
    engine = create_engine(DATABASE_URL)
    
    # Check if column already exists
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('billing_cycles')]
    
    if 'next_override_date' in columns:
        print("✓ Column 'next_override_date' already exists. No migration needed.")
        return
    
    print("Adding column 'next_override_date' to billing_cycles table...")
    
    try:
        with engine.connect() as connection:
            if DATABASE_URL.startswith("postgresql"):
                # PostgreSQL
                sql = text("""
                    ALTER TABLE billing_cycles 
                    ADD COLUMN next_override_date DATE NULL;
                """)
            else:
                # SQLite
                sql = text("""
                    ALTER TABLE billing_cycles 
                    ADD COLUMN next_override_date DATE;
                """)
            
            connection.execute(sql)
            connection.commit()
            print("✓ Column added successfully!")
    
    except Exception as e:
        print(f"✗ Error: {e}")
        raise

if __name__ == "__main__":
    migrate()
