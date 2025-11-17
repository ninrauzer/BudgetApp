"""
Loan API endpoints for debt management
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date, timedelta

from app.db.database import get_db
from app.models.loan import Loan, LoanPayment, LoanStatus
from app.schemas.loan import (
    LoanCreate,
    LoanUpdate,
    LoanResponse,
    LoanSummary,
    LoanPaymentCreate,
    LoanPaymentResponse,
    SimulationRequest,
    SimulationResponse,
    DebtDashboard,
    AmortizationSchedule,
    AmortizationRow,
    LoanSimulationResult,
    PaymentStrategy
)
from app.services import loan_calculator
from app.schemas.common import SuccessResponse

router = APIRouter(prefix="/api/loans", tags=["loans"])


# ===== Helper Functions =====

def get_loan_or_404(db: Session, loan_id: int) -> Loan:
    """Get loan by ID or raise 404"""
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Loan with id {loan_id} not found"
        )
    return loan


def enrich_loan_response(loan: Loan) -> dict:
    """Add computed fields to loan response"""
    loan_dict = {
        "id": loan.id,
        "name": loan.name,
        "entity": loan.entity,
        "original_amount": loan.original_amount,
        "current_debt": loan.current_debt,
        "annual_rate": loan.annual_rate,
        "monthly_payment": loan.monthly_payment,
        "total_installments": loan.total_installments,
        "current_installment": loan.current_installment,  # Calculated property
        "base_installments_paid": loan.base_installments_paid,  # Manual/editable base count
        "start_date": loan.start_date,
        "end_date": loan.end_date,
        "status": loan.status,
        "payment_frequency": loan.payment_frequency,
        "payment_day": loan.payment_day,
        "currency": loan.currency,
        "notes": loan.notes,
        "created_at": loan.created_at,
        "updated_at": loan.updated_at,
        # Computed fields
        "paid_installments": loan.paid_installments,
        "remaining_installments": loan.remaining_installments,
        "completion_percentage": loan.completion_percentage,
        "total_paid": loan.total_paid,
        "is_active": loan.is_active,
    }
    return loan_dict


# ===== Loan CRUD Endpoints =====

@router.post("", response_model=LoanResponse, status_code=status.HTTP_201_CREATED)
def create_loan(loan_data: LoanCreate, db: Session = Depends(get_db)):
    """
    Create a new loan
    
    - **name**: Loan name (e.g., "Prestamo BBVA 1")
    - **entity**: Bank/financial entity name
    - **original_amount**: Initial loan amount
    - **annual_rate**: TCEA in percentage
    - **monthly_payment**: Fixed monthly payment
    - **total_installments**: Total number of payments
    - **start_date**: Loan start date
    """
    loan = Loan(**loan_data.model_dump())
    db.add(loan)
    db.commit()
    db.refresh(loan)
    
    return enrich_loan_response(loan)


@router.get("", response_model=List[LoanSummary])
def get_loans(
    status: Optional[LoanStatus] = Query(None, description="Filter by loan status"),
    db: Session = Depends(get_db)
):
    """
    Get all loans with optional status filter
    
    Returns summary information for each loan
    """
    query = db.query(Loan)
    
    if status:
        query = query.filter(Loan.status == status)
    
    loans = query.order_by(Loan.created_at.desc()).all()
    
    return [
        {
            "id": loan.id,
            "name": loan.name,
            "entity": loan.entity,
            "current_debt": loan.current_debt,
            "monthly_payment": loan.monthly_payment,
            "annual_rate": loan.annual_rate,
            "current_installment": loan.current_installment,
            "total_installments": loan.total_installments,
            "remaining_installments": loan.remaining_installments,
            "completion_percentage": loan.completion_percentage,
            "status": loan.status,
            "currency": loan.currency,
            "payment_day": loan.payment_day,
        }
        for loan in loans
    ]


@router.get("/{loan_id}", response_model=LoanResponse)
def get_loan(loan_id: int, db: Session = Depends(get_db)):
    """Get detailed information for a specific loan"""
    loan = get_loan_or_404(db, loan_id)
    return enrich_loan_response(loan)


@router.put("/{loan_id}", response_model=LoanResponse)
def update_loan(
    loan_id: int,
    loan_data: LoanUpdate,
    db: Session = Depends(get_db)
):
    """
    Update loan information
    
    Only provided fields will be updated
    """
    loan = get_loan_or_404(db, loan_id)
    
    update_data = loan_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(loan, field, value)
    
    db.commit()
    db.refresh(loan)
    
    return enrich_loan_response(loan)


@router.delete("/{loan_id}", response_model=SuccessResponse)
def delete_loan(loan_id: int, db: Session = Depends(get_db)):
    """
    Delete a loan
    
    This will also delete all associated payments
    """
    loan = get_loan_or_404(db, loan_id)
    
    db.delete(loan)
    db.commit()
    
    return SuccessResponse(message=f"Loan '{loan.name}' deleted successfully")


# ===== Loan Payment Endpoints =====

@router.post("/{loan_id}/payments", response_model=LoanPaymentResponse, status_code=status.HTTP_201_CREATED)
def create_loan_payment(
    loan_id: int,
    payment_data: LoanPaymentCreate,
    db: Session = Depends(get_db)
):
    """
    Register a payment for a loan
    
    This will automatically update the loan's current_debt and current_installment
    """
    loan = get_loan_or_404(db, loan_id)
    
    # Validate payment
    if payment_data.loan_id != loan_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment loan_id does not match URL loan_id"
        )
    
    # Calculate new balance
    new_balance = loan.current_debt - payment_data.principal
    if new_balance < -0.01:  # Allow small floating point errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment principal exceeds current debt"
        )
    
    # Create payment record
    payment = LoanPayment(
        **payment_data.model_dump(),
        remaining_balance=max(0, new_balance),
        installment_number=loan.current_installment + 1
    )
    
    # Update loan
    loan.current_debt = max(0, new_balance)
    loan.current_installment += 1
    
    # If fully paid, update status
    if loan.current_debt < 0.01:
        loan.status = LoanStatus.PAID
        loan.end_date = payment_data.payment_date
    
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    return payment


@router.get("/{loan_id}/payments", response_model=List[LoanPaymentResponse])
def get_loan_payments(loan_id: int, db: Session = Depends(get_db)):
    """Get all payments for a specific loan"""
    loan = get_loan_or_404(db, loan_id)
    
    payments = db.query(LoanPayment).filter(
        LoanPayment.loan_id == loan_id
    ).order_by(LoanPayment.payment_date.desc()).all()
    
    return payments


# ===== Amortization Schedule =====

@router.get("/{loan_id}/amortization", response_model=AmortizationSchedule)
def get_amortization_schedule(loan_id: int, db: Session = Depends(get_db)):
    """
    Get complete amortization schedule for a loan
    
    Shows month-by-month breakdown of payments with principal, interest, and balance
    """
    loan = get_loan_or_404(db, loan_id)
    
    schedule_data = loan_calculator.generate_amortization_schedule(
        principal=loan.original_amount,
        annual_rate=loan.annual_rate,
        monthly_payment=loan.monthly_payment,
        total_months=loan.total_installments,
        start_date=loan.start_date,
        current_installment=loan.current_installment
    )
    
    total_interest = sum(row['interest'] for row in schedule_data)
    total_amount = sum(row['payment_amount'] for row in schedule_data)
    
    return AmortizationSchedule(
        loan_id=loan.id,
        loan_name=loan.name,
        schedule=[AmortizationRow(**row) for row in schedule_data],
        total_interest=total_interest,
        total_amount=total_amount
    )


# ===== Dashboard =====

@router.get("/dashboard/summary", response_model=DebtDashboard)
def get_debt_dashboard(db: Session = Depends(get_db)):
    """
    Get comprehensive debt dashboard
    
    Returns summary metrics for all loans including:
    - Total debt
    - Monthly payment obligations
    - Interest paid
    - Projected payoff date
    """
    active_loans = db.query(Loan).filter(Loan.status == LoanStatus.ACTIVE).all()
    
    if not active_loans:
        return DebtDashboard(
            total_current_debt=0,
            total_monthly_payment=0,
            total_loans=0,
            active_loans=0,
            total_interest_paid=0,
            total_principal_paid=0,
            weighted_avg_rate=0,
            projected_payoff_date=None,
            loans_summary=[]
        )
    
    # Calculate totals
    total_debt = sum(loan.current_debt for loan in active_loans)
    total_monthly = sum(loan.monthly_payment for loan in active_loans)
    total_principal_paid = sum(loan.total_paid for loan in active_loans)
    
    # Calculate total interest paid so far
    total_interest_paid = db.query(func.sum(LoanPayment.interest)).filter(
        LoanPayment.loan_id.in_([loan.id for loan in active_loans])
    ).scalar() or 0
    
    # Weighted average rate
    weighted_avg_rate = loan_calculator.calculate_weighted_average_rate([
        {"balance": loan.current_debt, "annual_rate": loan.annual_rate}
        for loan in active_loans
    ])
    
    # Find latest payoff date
    payoff_dates = []
    for loan in active_loans:
        if loan.current_debt > 0:
            payoff_date = loan_calculator.calculate_payoff_date(
                loan.current_debt,
                loan.monthly_payment,
                loan.annual_rate
            )
            payoff_dates.append(payoff_date)
    
    projected_payoff = max(payoff_dates) if payoff_dates else None
    
    # All loans count
    total_loans_count = db.query(Loan).count()
    
    loans_summary = [
        LoanSummary(
            id=loan.id,
            name=loan.name,
            entity=loan.entity,
            current_debt=loan.current_debt,
            monthly_payment=loan.monthly_payment,
            annual_rate=loan.annual_rate,
            current_installment=loan.current_installment,
            total_installments=loan.total_installments,
            remaining_installments=loan.remaining_installments,
            completion_percentage=loan.completion_percentage,
            status=loan.status,
            currency=loan.currency,
            payment_day=loan.payment_day
        )
        for loan in active_loans
    ]
    
    return DebtDashboard(
        total_current_debt=total_debt,
        total_monthly_payment=total_monthly,
        total_loans=total_loans_count,
        active_loans=len(active_loans),
        total_interest_paid=total_interest_paid,
        total_principal_paid=total_principal_paid,
        weighted_avg_rate=weighted_avg_rate,
        projected_payoff_date=projected_payoff,
        loans_summary=loans_summary
    )


# ===== Simulation Endpoints =====

@router.post("/simulate", response_model=SimulationResponse)
def simulate_payment_strategy(
    simulation: SimulationRequest,
    db: Session = Depends(get_db)
):
    """
    Simulate different debt payment strategies
    
    Strategies:
    - **avalanche**: Pay off highest interest rate first (saves most money)
    - **snowball**: Pay off smallest balance first (psychological wins)
    - **current**: Continue with current payment plan
    
    Can include extra monthly payments to see accelerated payoff
    """
    # Get loans to simulate
    if simulation.include_all_loans:
        loans = db.query(Loan).filter(Loan.status == LoanStatus.ACTIVE).all()
    elif simulation.loan_ids:
        loans = db.query(Loan).filter(
            Loan.id.in_(simulation.loan_ids),
            Loan.status == LoanStatus.ACTIVE
        ).all()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must specify loan_ids or set include_all_loans=true"
        )
    
    if not loans:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active loans found for simulation"
        )
    
    # Prepare loan data
    loan_data = [
        {
            "id": loan.id,
            "name": loan.name,
            "balance": loan.current_debt,
            "monthly_payment": loan.monthly_payment,
            "annual_rate": loan.annual_rate
        }
        for loan in loans
    ]
    
    extra_amount = simulation.extra_payment.amount if simulation.extra_payment else 0
    
    # Run simulation based on strategy
    if simulation.strategy == PaymentStrategy.AVALANCHE:
        result = loan_calculator.simulate_avalanche_strategy(loan_data, extra_amount)
    elif simulation.strategy == PaymentStrategy.SNOWBALL:
        result = loan_calculator.simulate_snowball_strategy(loan_data, extra_amount)
    else:  # Current strategy
        # Calculate current payoff
        result = {
            'strategy': 'current',
            'total_months': 0,
            'total_interest': 0,
            'loans': []
        }
        for loan_info in loan_data:
            schedule = loan_calculator.generate_amortization_schedule(
                principal=loan_info['balance'],
                annual_rate=loan_info['annual_rate'],
                monthly_payment=loan_info['monthly_payment'],
                total_months=int(loan_info['balance'] / loan_info['monthly_payment']) + 10,
                start_date=date.today(),
                current_installment=0
            )
            months = len([r for r in schedule if r['remaining_balance'] > 0])
            interest = sum(r['interest'] for r in schedule)
            
            result['loans'].append({
                'loan_id': loan_info['id'],
                'loan_name': loan_info['name'],
                'months_to_payoff': months,
                'interest_paid': interest,
                'payoff_order': 0
            })
            result['total_months'] = max(result['total_months'], months)
            result['total_interest'] += interest
    
    # Build response
    loan_results = []
    for loan_result in result['loans']:
        loan_id = loan_result['loan_id']
        loan = next(l for l in loans if l.id == loan_id)
        
        current_months = loan.remaining_installments
        simulated_months = loan_result['months_to_payoff']
        
        loan_results.append(LoanSimulationResult(
            loan_id=loan_id,
            loan_name=loan_result['loan_name'],
            current_months_remaining=current_months,
            simulated_months_remaining=simulated_months,
            months_saved=current_months - simulated_months,
            current_total_interest=loan.remaining_installments * loan.monthly_payment - loan.current_debt,
            simulated_total_interest=loan_result['interest_paid'],
            interest_saved=max(0, (loan.remaining_installments * loan.monthly_payment - loan.current_debt) - loan_result['interest_paid']),
            final_payment_date=date.today() + timedelta(days=simulated_months * 30)
        ))
    
    total_current_interest = sum(r.current_total_interest for r in loan_results)
    
    return SimulationResponse(
        strategy=simulation.strategy,
        total_months_saved=sum(r.months_saved for r in loan_results),
        total_interest_saved=total_current_interest - result['total_interest'],
        total_debt_payoff_date=date.today() + timedelta(days=result['total_months'] * 30),
        current_total_interest=total_current_interest,
        simulated_total_interest=result['total_interest'],
        loans=loan_results
    )
