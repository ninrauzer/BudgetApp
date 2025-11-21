"""
Migration script to add billing_cycle_overrides table
Run this script to create the table in your database

Usage:
    python migrate_add_cycle_overrides.py
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import engine, Base
from app.models.billing_cycle_override import BillingCycleOverride
from sqlalchemy import inspect

def check_table_exists(table_name: str) -> bool:
    """Check if a table exists in the database"""
    inspector = inspect(engine)
    return table_name in inspector.get_table_names()

def main():
    print("🔧 Billing Cycle Overrides Migration")
    print("=" * 50)
    
    # Check if table already exists
    if check_table_exists('billing_cycle_overrides'):
        print("⚠️  Table 'billing_cycle_overrides' already exists!")
        print("   Skipping migration...")
        return
    
    print("📦 Creating table 'billing_cycle_overrides'...")
    
    try:
        # Create only the billing_cycle_overrides table
        BillingCycleOverride.__table__.create(engine, checkfirst=True)
        print("✅ Table created successfully!")
        
        # Verify table structure
        inspector = inspect(engine)
        columns = inspector.get_columns('billing_cycle_overrides')
        print(f"\n📋 Table structure ({len(columns)} columns):")
        for col in columns:
            nullable = "NULL" if col['nullable'] else "NOT NULL"
            print(f"   - {col['name']}: {col['type']} {nullable}")
        
        # Check constraints
        constraints = inspector.get_unique_constraints('billing_cycle_overrides')
        if constraints:
            print(f"\n🔒 Unique constraints:")
            for constraint in constraints:
                print(f"   - {constraint['name']}: {constraint['column_names']}")
        
        print("\n✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error during migration: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
