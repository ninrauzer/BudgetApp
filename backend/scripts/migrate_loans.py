"""
Migration script to add Loan tables to the database.
Run this script to create loans and loan_payments tables.
"""

import sys
import os

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import engine
from app.models import Loan, LoanPayment
from sqlalchemy import inspect


def check_table_exists(table_name: str) -> bool:
    """Check if a table already exists in the database."""
    inspector = inspect(engine)
    return table_name in inspector.get_table_names()


def migrate_loan_tables():
    """Create loan and loan_payments tables."""
    print("🔄 Starting loan tables migration...")
    
    # Check if tables already exist
    loans_exists = check_table_exists("loans")
    payments_exists = check_table_exists("loan_payments")
    
    if loans_exists and payments_exists:
        print("✅ Loan tables already exist. No migration needed.")
        return
    
    try:
        # Create tables
        print("📋 Creating loans table...")
        Loan.__table__.create(engine, checkfirst=True)
        print("✅ Loans table created successfully")
        
        print("📋 Creating loan_payments table...")
        LoanPayment.__table__.create(engine, checkfirst=True)
        print("✅ Loan payments table created successfully")
        
        print("\n✨ Migration completed successfully!")
        print("\nCreated tables:")
        print("  - loans")
        print("  - loan_payments")
        
        print("\nYou can now:")
        print("  1. Create loans via API: POST /api/loans")
        print("  2. Register payments: POST /api/loans/{id}/payments")
        print("  3. View dashboard: GET /api/loans/dashboard/summary")
        print("  4. Run simulations: POST /api/loans/simulate")
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        raise


def create_sample_loans():
    """
    Optional: Create sample loans based on your Excel data.
    Uncomment and modify this function to insert your current loans.
    """
    from app.db.database import SessionLocal
    from app.models.loan import Loan, LoanStatus
    from datetime import date
    
    db = SessionLocal()
    
    try:
        print("\n📝 Creating sample loans...")
        
        sample_loans = [
            Loan(
                name="Prestamo BBVA 1",
                entity="BBVA",
                original_amount=15000.00,
                current_debt=1998.99,
                annual_rate=14.27,
                monthly_payment=418.17,
                total_installments=47,
                current_installment=43,
                start_date=date(2021, 9, 1),
                status=LoanStatus.ACTIVE,
                currency="PEN"
            ),
            Loan(
                name="Prestamo BBVA 2",
                entity="BBVA",
                original_amount=19900.00,
                current_debt=2651.89,
                annual_rate=14.27,
                monthly_payment=554.78,
                total_installments=47,
                current_installment=44,
                start_date=date(2021, 8, 1),
                status=LoanStatus.ACTIVE,
                currency="PEN"
            ),
            Loan(
                name="Prestamo IBK 1",
                entity="Interbank",
                original_amount=35582.00,
                current_debt=34754.71,
                annual_rate=29.99,
                monthly_payment=1281.54,
                total_installments=48,
                current_installment=47,
                start_date=date(2021, 1, 1),
                status=LoanStatus.ACTIVE,
                currency="PEN"
            ),
            Loan(
                name="Prestamo IBK 2",
                entity="Interbank",
                original_amount=49600.00,
                current_debt=32969.64,
                annual_rate=24.47,
                monthly_payment=1050.18,
                total_installments=77,
                current_installment=40,
                start_date=date(2022, 1, 1),
                status=LoanStatus.ACTIVE,
                currency="PEN"
            ),
            Loan(
                name="Derrama",
                entity="Derrama Magisterial",
                original_amount=20000.00,
                current_debt=18720.00,
                annual_rate=20.16,
                monthly_payment=520.00,
                total_installments=60,
                current_installment=24,
                start_date=date(2023, 1, 1),
                status=LoanStatus.ACTIVE,
                currency="PEN"
            ),
            Loan(
                name="Scotia",
                entity="Scotiabank",
                original_amount=7000.00,
                current_debt=3248.80,
                annual_rate=41.50,
                monthly_payment=350.00,
                total_installments=36,
                current_installment=24,
                start_date=date(2023, 3, 1),
                status=LoanStatus.ACTIVE,
                currency="PEN"
            ),
        ]
        
        for loan in sample_loans:
            db.add(loan)
        
        db.commit()
        print(f"✅ Created {len(sample_loans)} sample loans")
        print("\nTotal debt: PEN 94,344.03")
        print("Total monthly payment: PEN 4,174.67")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating sample loans: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("  LOAN TABLES MIGRATION")
    print("=" * 60)
    
    migrate_loan_tables()
    
    # Uncomment to create sample loans
    # print("\n" + "=" * 60)
    # create_sample_loans()
    
    print("\n" + "=" * 60)
    print("Migration script completed!")
    print("=" * 60)
