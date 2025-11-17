"""
Category model - Categories for income, expenses, and savings.
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Category(Base):
    """
    Category model for organizing transactions.
    Supports hierarchical structure (parent-child relationships).
    Uses soft delete (is_active flag) to preserve historical data integrity.
    """
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'income', 'expense', 'saving'
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    icon = Column(String, nullable=True)
    color = Column(String, nullable=True)
    description = Column(String, nullable=True)  # Added: textual description
    expense_type = Column(String, nullable=True)  # 'fixed', 'variable' (only for expense categories)
    is_active = Column(Boolean, default=True, nullable=False)  # Soft delete flag
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    parent = relationship("Category", remote_side=[id], backref="subcategories")
    budget_plans = relationship("BudgetPlan", back_populates="category")
    transactions = relationship("Transaction", back_populates="category")

    def __repr__(self):
        return f"<Category(id={self.id}, name='{self.name}', type='{self.type}', active={self.is_active})>"
