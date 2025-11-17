"""
Loan model for tracking debt management
"""
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.db.database import Base


class LoanStatus(str, enum.Enum):
    """Loan status enumeration"""
    ACTIVE = "active"
    PAID = "paid"
    REFINANCED = "refinanced"
    DEFAULTED = "defaulted"


class PaymentFrequency(str, enum.Enum):
    """Payment frequency enumeration"""
    MONTHLY = "monthly"
    BIWEEKLY = "biweekly"
    WEEKLY = "weekly"


class Loan(Base):
    """
    Loan model for tracking personal loans and debts
    
    Attributes:
        id: Primary key
        name: Loan name/description (e.g., "Prestamo BBVA 1")
        entity: Financial entity/bank name
        original_amount: Initial loan amount
        current_debt: Current outstanding debt
        annual_rate: Annual interest rate (TCEA) in percentage
        monthly_payment: Fixed monthly payment amount
        total_installments: Total number of payments
        current_installment: Current installment number (e.g., 43 of 47)
        start_date: Loan start date
        end_date: Expected end date
        status: Current loan status (active, paid, refinanced, defaulted)
        payment_frequency: How often payments are made
        currency: Currency code (PEN, USD, etc.)
        notes: Additional notes
    """
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    entity = Column(String(100), nullable=False)
    
    # Financial details
    original_amount = Column(Float, nullable=False)
    current_debt = Column(Float, nullable=False)
    annual_rate = Column(Float, nullable=False)  # TCEA as percentage (e.g., 14.27)
    monthly_payment = Column(Float, nullable=False)
    
    # Payment tracking
    total_installments = Column(Integer, nullable=False)
    base_installments_paid = Column(Integer, default=0)  # Manual/base count of installments paid
    payment_frequency = Column(Enum(PaymentFrequency), default=PaymentFrequency.MONTHLY)
    payment_day = Column(Integer, nullable=True)  # Day of month for payment (1-31)
    
    # Dates
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)  # Expected end date
    
    # Status and metadata
    status = Column(Enum(LoanStatus), default=LoanStatus.ACTIVE, index=True)
    currency = Column(String(3), default="PEN")
    notes = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    payments = relationship("LoanPayment", back_populates="loan", cascade="all, delete-orphan")
    payment_transactions = relationship("Transaction", back_populates="loan")  # Transactions that pay this loan
    
    def __repr__(self):
        return f"<Loan {self.name} - {self.entity} ({self.current_installment}/{self.total_installments})>"
    
    @property
    def current_installment(self):
        """
        Calculated property: base installments + count of linked payment transactions
        This provides a hybrid tracking system where manual edits (base_installments_paid) 
        are combined with automatic tracking via transaction links.
        """
        # Count transactions linked to this loan (only category "Préstamos Bancarios")
        transaction_count = len([t for t in self.payment_transactions if t.category and 
                                 t.category.name == "Préstamos Bancarios"])
        return self.base_installments_paid + transaction_count
    
    @property
    def paid_installments(self):
        """Number of installments already paid"""
        return self.current_installment
    
    @property
    def remaining_installments(self):
        """Number of remaining installments"""
        return self.total_installments - self.current_installment
    
    @property
    def completion_percentage(self):
        """Percentage of loan completion"""
        if self.total_installments == 0:
            return 0
        return (self.current_installment / self.total_installments) * 100
    
    @property
    def total_paid(self):
        """Total amount already paid (principal + interest)"""
        return self.original_amount - self.current_debt
    
    @property
    def is_active(self):
        """Check if loan is active"""
        return self.status == LoanStatus.ACTIVE


class LoanPayment(Base):
    """
    LoanPayment model for tracking individual loan payments
    
    Attributes:
        id: Primary key
        loan_id: Foreign key to Loan
        payment_date: Date of payment
        amount: Payment amount
        principal: Amount that goes to principal
        interest: Amount that goes to interest
        remaining_balance: Balance after this payment
        installment_number: Which installment this payment corresponds to
        transaction_id: Optional link to Transaction model
    """
    __tablename__ = "loan_payments"

    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loans.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Payment details
    payment_date = Column(Date, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    principal = Column(Float, nullable=False)  # Capital paid
    interest = Column(Float, nullable=False)   # Interest paid
    remaining_balance = Column(Float, nullable=False)
    installment_number = Column(Integer, nullable=False)
    
    # Optional link to transaction
    transaction_id = Column(Integer, ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Metadata
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    loan = relationship("Loan", back_populates="payments")
    transaction = relationship("Transaction", foreign_keys=[transaction_id])
    
    def __repr__(self):
        return f"<LoanPayment {self.loan_id} - Installment {self.installment_number}: {self.amount}>"
