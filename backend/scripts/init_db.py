"""
Database initialization script.
Creates all tables and populates with initial data.
"""

import sys
import os

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import engine, init_db
from app.models import Category, Account, BudgetPlan, Transaction
from sqlalchemy.orm import Session


def create_initial_categories(db: Session):
    """Create initial category hierarchy."""
    print("Creating initial categories...")
    
    # Root categories
    income_root = Category(name="Ingresos", type="income", parent_id=None, icon="💰", color="#4CAF50")
    expense_root = Category(name="Gastos", type="expense", parent_id=None, icon="💸", color="#F44336")
    saving_root = Category(name="Ahorros", type="saving", parent_id=None, icon="🏦", color="#2196F3")
    
    db.add_all([income_root, expense_root, saving_root])
    db.commit()
    
    # Income subcategories
    income_subcategories = [
        Category(name="Salario", type="income", parent_id=income_root.id, icon="💼", color="#66BB6A"),
        Category(name="Freelance", type="income", parent_id=income_root.id, icon="💻", color="#81C784"),
        Category(name="Inversiones", type="income", parent_id=income_root.id, icon="📈", color="#4CAF50"),
        Category(name="Otros Ingresos", type="income", parent_id=income_root.id, icon="➕", color="#A5D6A7"),
    ]
    
    # Expense subcategories
    expense_subcategories = [
        Category(name="Vivienda", type="expense", parent_id=expense_root.id, icon="🏠", color="#EF5350"),
        Category(name="Transporte", type="expense", parent_id=expense_root.id, icon="🚗", color="#EC407A"),
        Category(name="Alimentación", type="expense", parent_id=expense_root.id, icon="🍔", color="#AB47BC"),
        Category(name="Salud", type="expense", parent_id=expense_root.id, icon="🏥", color="#7E57C2"),
        Category(name="Entretenimiento", type="expense", parent_id=expense_root.id, icon="🎬", color="#5C6BC0"),
        Category(name="Subscripciones", type="expense", parent_id=expense_root.id, icon="📱", color="#42A5F5"),
        Category(name="Educación", type="expense", parent_id=expense_root.id, icon="📚", color="#26A69A"),
        Category(name="Otros Gastos", type="expense", parent_id=expense_root.id, icon="➖", color="#FF7043"),
    ]
    
    # Saving subcategories
    saving_subcategories = [
        Category(name="Fondo de Emergencia", type="saving", parent_id=saving_root.id, icon="🛡️", color="#29B6F6"),
        Category(name="Inversión", type="saving", parent_id=saving_root.id, icon="💎", color="#0288D1"),
        Category(name="Metas Específicas", type="saving", parent_id=saving_root.id, icon="🎯", color="#0277BD"),
    ]
    
    db.add_all(income_subcategories + expense_subcategories + saving_subcategories)
    db.commit()
    
    print(f"✓ Created {len(income_subcategories) + len(expense_subcategories) + len(saving_subcategories) + 3} categories")


def create_initial_accounts(db: Session):
    """Create initial accounts."""
    print("Creating initial accounts...")
    
    accounts = [
        Account(name="Efectivo", type="cash", balance=0.0, currency="PEN", is_active=True),
        Account(name="Banco BBVA", type="bank", balance=0.0, currency="PEN", is_active=True),
        Account(name="Tarjeta BBVA", type="credit_card", balance=0.0, currency="PEN", is_active=True),
    ]
    
    db.add_all(accounts)
    db.commit()
    
    print(f"✓ Created {len(accounts)} accounts")


def main():
    """Main initialization function."""
    print("=" * 60)
    print("BudgetApp - Database Initialization")
    print("=" * 60)
    
    # Create all tables
    print("\nCreating database tables...")
    init_db()
    print("✓ All tables created successfully")
    
    # Create session
    from app.db.database import SessionLocal
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_categories = db.query(Category).count()
        if existing_categories > 0:
            print(f"\n⚠️  Database already contains {existing_categories} categories.")
            response = input("Do you want to reset the database? (yes/no): ")
            if response.lower() != 'yes':
                print("Initialization cancelled.")
                return
            
            # Clear existing data
            print("\nClearing existing data...")
            db.query(Transaction).delete()
            db.query(BudgetPlan).delete()
            db.query(Category).delete()
            db.query(Account).delete()
            db.commit()
            print("✓ Existing data cleared")
        
        # Create initial data
        print("\nPopulating database with initial data...")
        create_initial_categories(db)
        create_initial_accounts(db)
        
        print("\n" + "=" * 60)
        print("✓ Database initialization completed successfully!")
        print("=" * 60)
        print("\nYou can now start the application with:")
        print("  uvicorn app.main:app --reload")
        print("\nAPI Documentation will be available at:")
        print("  http://localhost:8000/docs")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n✗ Error during initialization: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
