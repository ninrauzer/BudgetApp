"""Test loan simulation"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.loan import Loan, LoanStatus
from app.services import loan_calculator

def test_simulation():
    db = SessionLocal()
    try:
        # Get first active loan
        loan = db.query(Loan).filter(Loan.status == LoanStatus.ACTIVE).first()
        
        if not loan:
            print("❌ No active loans found")
            return
        
        print(f"📊 Testing simulation with loan: {loan.name}")
        print(f"  Current debt: S/ {loan.current_debt}")
        print(f"  Monthly payment: S/ {loan.monthly_payment}")
        print(f"  Annual rate: {loan.annual_rate}%")
        
        # Prepare loan data
        loan_data = [{
            "id": loan.id,
            "name": loan.name,
            "balance": loan.current_debt,
            "monthly_payment": loan.monthly_payment,
            "annual_rate": loan.annual_rate
        }]
        
        print("\n🔄 Running avalanche simulation...")
        try:
            result = loan_calculator.simulate_avalanche_strategy(loan_data, 0)
            print("✅ Simulation successful!")
            print(f"  Total months: {result.get('total_months', 'N/A')}")
            print(f"  Total interest: S/ {result.get('total_interest', 0):.2f}")
            print(f"  Loans in result: {len(result.get('loans', []))}")
        except Exception as e:
            print(f"❌ Simulation failed: {str(e)}")
            import traceback
            traceback.print_exc()
        
    finally:
        db.close()

if __name__ == "__main__":
    test_simulation()
