"""
Financial calculations service for loan management

This service provides functions for:
- Monthly payment calculation
- Amortization schedule generation
- Interest calculations
- Payment simulations (avalanche, snowball strategies)
"""
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from typing import List, Dict, Tuple
import math


def calculate_monthly_payment(
    principal: float,
    annual_rate: float,
    total_months: int
) -> float:
    """
    Calculate monthly payment using French amortization system
    
    Formula: M = P * [r(1 + r)^n] / [(1 + r)^n - 1]
    Where:
        M = monthly payment
        P = principal (loan amount)
        r = monthly interest rate (annual_rate / 12 / 100)
        n = number of months
    
    Args:
        principal: Loan amount
        annual_rate: Annual interest rate in percentage (e.g., 14.27 for 14.27%)
        total_months: Total number of monthly payments
    
    Returns:
        Monthly payment amount
    """
    if annual_rate == 0:
        return principal / total_months
    
    monthly_rate = annual_rate / 12 / 100
    numerator = principal * monthly_rate * math.pow(1 + monthly_rate, total_months)
    denominator = math.pow(1 + monthly_rate, total_months) - 1
    
    return numerator / denominator


def calculate_payment_breakdown(
    remaining_balance: float,
    monthly_payment: float,
    annual_rate: float
) -> Tuple[float, float]:
    """
    Calculate how much of a payment goes to principal vs interest
    
    Args:
        remaining_balance: Current outstanding balance
        monthly_payment: Fixed monthly payment amount
        annual_rate: Annual interest rate in percentage
    
    Returns:
        Tuple of (principal_payment, interest_payment)
    """
    monthly_rate = annual_rate / 12 / 100
    interest_payment = remaining_balance * monthly_rate
    principal_payment = monthly_payment - interest_payment
    
    # Handle last payment (may be less than full monthly payment)
    if principal_payment > remaining_balance:
        principal_payment = remaining_balance
        interest_payment = monthly_payment - principal_payment
    
    return (principal_payment, interest_payment)


def generate_amortization_schedule(
    principal: float,
    annual_rate: float,
    monthly_payment: float,
    total_months: int,
    start_date: date,
    current_installment: int = 0
) -> List[Dict]:
    """
    Generate complete amortization schedule for a loan
    
    Args:
        principal: Initial loan amount
        annual_rate: Annual interest rate in percentage
        monthly_payment: Fixed monthly payment
        total_months: Total number of payments
        start_date: Loan start date
        current_installment: Number of payments already made
    
    Returns:
        List of dictionaries with payment schedule details
    """
    schedule = []
    remaining_balance = principal
    payment_date = start_date
    
    for installment in range(1, total_months + 1):
        # Calculate payment breakdown
        principal_payment, interest_payment = calculate_payment_breakdown(
            remaining_balance, monthly_payment, annual_rate
        )
        
        # Update balance
        remaining_balance -= principal_payment
        
        # Handle floating point precision
        if remaining_balance < 0.01:
            remaining_balance = 0
        
        schedule.append({
            'installment_number': installment,
            'payment_date': payment_date,
            'payment_amount': principal_payment + interest_payment,
            'principal': principal_payment,
            'interest': interest_payment,
            'remaining_balance': remaining_balance,
            'is_paid': installment <= current_installment
        })
        
        # Move to next month
        payment_date = payment_date + relativedelta(months=1)
    
    return schedule


def calculate_total_interest(
    principal: float,
    monthly_payment: float,
    total_months: int
) -> float:
    """
    Calculate total interest to be paid over the life of the loan
    
    Args:
        principal: Loan amount
        monthly_payment: Monthly payment amount
        total_months: Number of months
    
    Returns:
        Total interest amount
    """
    total_paid = monthly_payment * total_months
    return total_paid - principal


def simulate_extra_payment(
    remaining_balance: float,
    monthly_payment: float,
    annual_rate: float,
    extra_payment: float,
    remaining_months: int
) -> Dict:
    """
    Simulate the effect of extra payments on loan
    
    Args:
        remaining_balance: Current debt
        monthly_payment: Regular monthly payment
        annual_rate: Annual interest rate
        extra_payment: Additional payment amount
        remaining_months: Months left on current schedule
    
    Returns:
        Dictionary with simulation results
    """
    # Current scenario
    current_schedule = generate_amortization_schedule(
        remaining_balance, annual_rate, monthly_payment, 
        remaining_months, date.today(), 0
    )
    current_total_interest = sum(row['interest'] for row in current_schedule)
    
    # Scenario with extra payment
    new_payment = monthly_payment + extra_payment
    balance = remaining_balance
    months_needed = 0
    total_interest = 0
    monthly_rate = annual_rate / 12 / 100
    
    while balance > 0.01 and months_needed < remaining_months * 2:  # Safety limit
        interest = balance * monthly_rate
        principal = min(new_payment - interest, balance)
        balance -= principal
        total_interest += interest
        months_needed += 1
    
    months_saved = remaining_months - months_needed
    interest_saved = current_total_interest - total_interest
    
    return {
        'current_months': remaining_months,
        'new_months': months_needed,
        'months_saved': months_saved,
        'current_total_interest': current_total_interest,
        'new_total_interest': total_interest,
        'interest_saved': interest_saved,
        'extra_payment_amount': extra_payment,
        'new_monthly_payment': new_payment
    }


def simulate_avalanche_strategy(loans: List[Dict], extra_payment: float = 0) -> Dict:
    """
    Simulate paying off loans using avalanche method (highest interest first)
    
    Args:
        loans: List of loan dicts with keys: id, name, balance, monthly_payment, annual_rate
        extra_payment: Additional monthly amount to apply
    
    Returns:
        Simulation results with payoff order and savings
    """
    # Sort by interest rate (descending)
    sorted_loans = sorted(loans, key=lambda x: x['annual_rate'], reverse=True)
    
    total_monthly = sum(loan['monthly_payment'] for loan in loans) + extra_payment
    results = []
    month = 0
    
    for loan in sorted_loans:
        balance = loan['balance']
        rate = loan['annual_rate']
        monthly_rate = rate / 12 / 100
        months_to_payoff = 0
        interest_paid = 0
        
        # All extra payment goes to this loan
        payment = min(total_monthly, balance * 2)  # Reasonable max
        
        while balance > 0.01:
            interest = balance * monthly_rate
            principal = min(payment - interest, balance)
            balance -= principal
            interest_paid += interest
            months_to_payoff += 1
        
        results.append({
            'loan_id': loan['id'],
            'loan_name': loan['name'],
            'months_to_payoff': months_to_payoff,
            'interest_paid': interest_paid,
            'payoff_order': len(results) + 1
        })
        
        # Update total monthly for next loan (freed up payment)
        total_monthly += loan['monthly_payment']
        month += months_to_payoff
    
    return {
        'strategy': 'avalanche',
        'total_months': month,
        'total_interest': sum(r['interest_paid'] for r in results),
        'loans': results
    }


def simulate_snowball_strategy(loans: List[Dict], extra_payment: float = 0) -> Dict:
    """
    Simulate paying off loans using snowball method (smallest balance first)
    
    Args:
        loans: List of loan dicts with keys: id, name, balance, monthly_payment, annual_rate
        extra_payment: Additional monthly amount to apply
    
    Returns:
        Simulation results with payoff order and savings
    """
    # Sort by balance (ascending)
    sorted_loans = sorted(loans, key=lambda x: x['balance'])
    
    total_monthly = sum(loan['monthly_payment'] for loan in loans) + extra_payment
    results = []
    month = 0
    
    for loan in sorted_loans:
        balance = loan['balance']
        rate = loan['annual_rate']
        monthly_rate = rate / 12 / 100
        months_to_payoff = 0
        interest_paid = 0
        
        # All extra payment goes to this loan
        payment = min(total_monthly, balance * 2)  # Reasonable max
        
        while balance > 0.01:
            interest = balance * monthly_rate
            principal = min(payment - interest, balance)
            balance -= principal
            interest_paid += interest
            months_to_payoff += 1
        
        results.append({
            'loan_id': loan['id'],
            'loan_name': loan['name'],
            'months_to_payoff': months_to_payoff,
            'interest_paid': interest_paid,
            'payoff_order': len(results) + 1
        })
        
        # Update total monthly for next loan
        total_monthly += loan['monthly_payment']
        month += months_to_payoff
    
    return {
        'strategy': 'snowball',
        'total_months': month,
        'total_interest': sum(r['interest_paid'] for r in results),
        'loans': results
    }


def calculate_weighted_average_rate(loans: List[Dict]) -> float:
    """
    Calculate weighted average interest rate across multiple loans
    
    Args:
        loans: List of loan dicts with 'balance' and 'annual_rate' keys
    
    Returns:
        Weighted average rate
    """
    if not loans:
        return 0.0
    
    total_balance = sum(loan['balance'] for loan in loans)
    if total_balance == 0:
        return 0.0
    
    weighted_sum = sum(loan['balance'] * loan['annual_rate'] for loan in loans)
    return weighted_sum / total_balance


def calculate_payoff_date(
    remaining_balance: float,
    monthly_payment: float,
    annual_rate: float,
    start_date: date = None
) -> date:
    """
    Calculate when a loan will be paid off
    
    Args:
        remaining_balance: Current debt
        monthly_payment: Monthly payment amount
        annual_rate: Annual interest rate
        start_date: Date to start calculation from (default: today)
    
    Returns:
        Projected payoff date
    """
    if start_date is None:
        start_date = date.today()
    
    balance = remaining_balance
    monthly_rate = annual_rate / 12 / 100
    months = 0
    
    while balance > 0.01 and months < 1200:  # 100 year safety limit
        interest = balance * monthly_rate
        principal = monthly_payment - interest
        balance -= principal
        months += 1
    
    return start_date + relativedelta(months=months)
