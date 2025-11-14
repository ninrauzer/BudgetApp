"""
BudgetPlan model - Planned budget by category and billing cycle.
"""

from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class BudgetPlan(Base):
    """
    BudgetPlan model for planned budget by category and billing cycle.
    Instead of year/month, uses cycle_name, start_date, end_date.
    """
    __tablename__ = "budget_plans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    cycle_name = Column(String, nullable=False)  # e.g., "Enero", "Febrero"
    start_date = Column(Date, nullable=False)    # Cycle start (e.g., 2024-12-23)
    end_date = Column(Date, nullable=False)      # Cycle end (e.g., 2025-01-22)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    amount = Column(Float, nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    category = relationship("Category", back_populates="budget_plans")

    # Constraints - cycle_name + category must be unique
    __table_args__ = (
        UniqueConstraint('cycle_name', 'category_id', name='uix_cycle_category'),
    )

    def __repr__(self):
        return f"<BudgetPlan(id={self.id}, cycle_name={self.cycle_name}, category_id={self.category_id}, amount={self.amount})>"
