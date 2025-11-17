"""
Pydantic schemas for Loan API
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


class LoanStatus(str, Enum):
    """Loan status enumeration"""
    ACTIVE = "active"
    PAID = "paid"
    REFINANCED = "refinanced"
    DEFAULTED = "defaulted"


class PaymentFrequency(str, Enum):
    """Payment frequency enumeration"""
    MONTHLY = "monthly"
    BIWEEKLY = "biweekly"
    WEEKLY = "weekly"


# ===== Loan Schemas =====

class LoanBase(BaseModel):
    """Base schema for Loan"""
    name: str = Field(..., min_length=1, max_length=100, description="Loan name (e.g., 'Prestamo BBVA 1')")
    entity: str = Field(..., min_length=1, max_length=100, description="Financial entity/bank name")
    original_amount: float = Field(..., gt=0, description="Initial loan amount")
    annual_rate: float = Field(..., ge=0, le=100, description="Annual interest rate (TCEA) in percentage")
    monthly_payment: float = Field(..., gt=0, description="Fixed monthly payment amount")
    total_installments: int = Field(..., gt=0, description="Total number of payments")
    start_date: date = Field(..., description="Loan start date")
    payment_frequency: PaymentFrequency = Field(default=PaymentFrequency.MONTHLY)
    payment_day: Optional[int] = Field(None, ge=1, le=31, description="Day of month for payment (1-31)")
    currency: str = Field(default="PEN", min_length=3, max_length=3)
    notes: Optional[str] = Field(None, max_length=500)


class LoanCreate(LoanBase):
    """Schema for creating a new loan"""
    current_debt: Optional[float] = Field(None, description="Current outstanding debt (defaults to original_amount)")
    base_installments_paid: int = Field(default=0, ge=0, description="Manual count of installments already paid")
    
    @field_validator('current_debt')
    @classmethod
    def set_current_debt(cls, v, info):
        """Set current_debt to original_amount if not provided"""
        if v is None and 'original_amount' in info.data:
            return info.data['original_amount']
        return v


class LoanUpdate(BaseModel):
    """Schema for updating a loan"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    entity: Optional[str] = Field(None, min_length=1, max_length=100)
    original_amount: Optional[float] = Field(None, gt=0)
    current_debt: Optional[float] = Field(None, gt=0)
    annual_rate: Optional[float] = Field(None, ge=0, le=100)
    monthly_payment: Optional[float] = Field(None, gt=0)
    total_installments: Optional[int] = Field(None, gt=0)
    base_installments_paid: Optional[int] = Field(None, ge=0, description="Manual count of installments paid (editable)")
    start_date: Optional[date] = Field(None, description="Loan start date")
    payment_day: Optional[int] = Field(None, ge=1, le=31, description="Day of month for payment (1-31)")
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    status: Optional[LoanStatus] = None
    end_date: Optional[date] = None
    notes: Optional[str] = Field(None, max_length=500)


class LoanResponse(LoanBase):
    """Schema for loan response"""
    id: int
    current_debt: float
    current_installment: int  # Calculated: base_installments_paid + transaction count
    base_installments_paid: int  # Manual/editable base count
    end_date: Optional[date]
    status: LoanStatus
    created_at: datetime
    updated_at: datetime
    
    # Computed fields
    paid_installments: int
    remaining_installments: int
    completion_percentage: float
    total_paid: float
    is_active: bool
    
    class Config:
        from_attributes = True


class LoanSummary(BaseModel):
    """Summary schema for loan overview"""
    id: int
    name: str
    entity: str
    current_debt: float
    monthly_payment: float
    annual_rate: float
    current_installment: int
    total_installments: int
    remaining_installments: int
    payment_day: Optional[int]
    completion_percentage: float
    status: LoanStatus
    currency: str
    
    class Config:
        from_attributes = True


# ===== Loan Payment Schemas =====

class LoanPaymentBase(BaseModel):
    """Base schema for loan payment"""
    payment_date: date = Field(..., description="Date of payment")
    amount: float = Field(..., gt=0, description="Payment amount")
    principal: float = Field(..., ge=0, description="Amount that goes to principal")
    interest: float = Field(..., ge=0, description="Amount that goes to interest")
    notes: Optional[str] = Field(None, max_length=500)


class LoanPaymentCreate(LoanPaymentBase):
    """Schema for creating a loan payment"""
    loan_id: int = Field(..., description="ID of the loan")
    transaction_id: Optional[int] = Field(None, description="Optional link to transaction")
    
    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v, info):
        """Validate that amount equals principal + interest"""
        if 'principal' in info.data and 'interest' in info.data:
            expected = info.data['principal'] + info.data['interest']
            if abs(v - expected) > 0.01:  # Allow for rounding
                raise ValueError(f"Amount must equal principal + interest ({expected})")
        return v


class LoanPaymentResponse(LoanPaymentBase):
    """Schema for loan payment response"""
    id: int
    loan_id: int
    remaining_balance: float
    installment_number: int
    transaction_id: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True


# ===== Simulation Schemas =====

class PaymentStrategy(str, Enum):
    """Payment strategy enumeration"""
    AVALANCHE = "avalanche"  # Pay highest interest rate first
    SNOWBALL = "snowball"    # Pay smallest debt first
    CURRENT = "current"       # Continue with current payments


class ExtraPayment(BaseModel):
    """Extra payment configuration"""
    amount: float = Field(..., gt=0, description="Extra payment amount")
    frequency: PaymentFrequency = Field(default=PaymentFrequency.MONTHLY)
    start_month: int = Field(default=1, ge=1, description="Month to start extra payments")
    loan_id: Optional[int] = Field(None, description="Specific loan to apply extra payment (None for strategy-based)")


class SimulationRequest(BaseModel):
    """Request schema for loan simulation"""
    strategy: PaymentStrategy = Field(..., description="Payment strategy to simulate")
    extra_payment: Optional[ExtraPayment] = Field(None, description="Optional extra payment configuration")
    include_all_loans: bool = Field(default=True, description="Include all active loans in simulation")
    loan_ids: Optional[List[int]] = Field(None, description="Specific loan IDs to simulate (if not all)")


class LoanSimulationResult(BaseModel):
    """Result for individual loan in simulation"""
    loan_id: int
    loan_name: str
    current_months_remaining: int
    simulated_months_remaining: int
    months_saved: int
    current_total_interest: float
    simulated_total_interest: float
    interest_saved: float
    final_payment_date: date


class SimulationResponse(BaseModel):
    """Response schema for loan simulation"""
    strategy: PaymentStrategy
    total_months_saved: int
    total_interest_saved: float
    total_debt_payoff_date: date
    current_total_interest: float
    simulated_total_interest: float
    loans: List[LoanSimulationResult]
    monthly_breakdown: Optional[List[dict]] = Field(None, description="Month-by-month payment breakdown")


# ===== Dashboard Schemas =====

class DebtDashboard(BaseModel):
    """Dashboard summary for all debts"""
    total_current_debt: float
    total_monthly_payment: float
    total_loans: int
    active_loans: int
    total_interest_paid: float
    total_principal_paid: float
    weighted_avg_rate: float
    projected_payoff_date: Optional[date]
    loans_summary: List[LoanSummary]


# ===== Amortization Schedule =====

class AmortizationRow(BaseModel):
    """Single row in amortization schedule"""
    installment_number: int
    payment_date: date
    payment_amount: float
    principal: float
    interest: float
    remaining_balance: float
    is_paid: bool = False


class AmortizationSchedule(BaseModel):
    """Complete amortization schedule for a loan"""
    loan_id: int
    loan_name: str
    schedule: List[AmortizationRow]
    total_interest: float
    total_amount: float
