from sqlalchemy import Column, Integer, Date, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.database import Base

class BillingCycleOverride(Base):
    """
    Model for monthly billing cycle overrides.
    Allows customizing the start date for specific months when payments don't fall on the usual day
    (e.g., due to weekends, holidays, or company payment schedule changes).
    
    Example: 
    - Normally paid on 23rd
    - December 2025: paid early on Nov 21 (Friday before weekend)
    - Override: year=2025, month=12, override_start_date='2025-11-21'
    """
    __tablename__ = "billing_cycle_overrides"

    id = Column(Integer, primary_key=True, index=True)
    billing_cycle_id = Column(Integer, ForeignKey("billing_cycles.id"), nullable=False)
    year = Column(Integer, nullable=False)  # 2024, 2025, etc.
    month = Column(Integer, nullable=False)  # 1-12
    override_start_date = Column(Date, nullable=False)  # Actual start date for this month
    reason = Column(String, nullable=True)  # Optional: "Pago anticipado - viernes", "Feriado", etc.
    
    # Relationship
    billing_cycle = relationship("BillingCycle", backref="overrides")
    
    # Ensure one override per month per billing cycle
    __table_args__ = (
        UniqueConstraint('billing_cycle_id', 'year', 'month', name='uq_cycle_year_month'),
    )
