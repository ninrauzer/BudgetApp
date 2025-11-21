from sqlalchemy import Column, Integer, String, Boolean, Date
from app.db.database import Base

class BillingCycle(Base):
    """
    Model for billing cycle configuration.
    Defines the start day of the billing cycle (e.g., 23 for 23rd of each month).
    This affects how months are displayed throughout the app.
    """
    __tablename__ = "billing_cycles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="default")  # For future multi-user support
    start_day = Column(Integer, nullable=False, default=1)  # Day of month (1-31)
    next_override_date = Column(Date, nullable=True)  # Manual override for next cycle start (e.g., moved from 23 to 21)
    is_active = Column(Boolean, default=True)
