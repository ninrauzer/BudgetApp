"""
BudgetPlan model - Planned budget by category and month.
"""

from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class BudgetPlan(Base):
    """
    BudgetPlan model for planned budget by category, year, and month.
    """
    __tablename__ = "budget_plan"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)  # 1-12
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    amount = Column(Float, nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    category = relationship("Category", back_populates="budget_plans")

    # Constraints
    __table_args__ = (
        UniqueConstraint('year', 'month', 'category_id', name='uix_year_month_category'),
    )

    def __repr__(self):
        return f"<BudgetPlan(id={self.id}, year={self.year}, month={self.month}, category_id={self.category_id}, amount={self.amount})>"
