"""
QuickTemplate model - Predefined transaction templates for quick entry.
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class QuickTemplate(Base):
    """
    QuickTemplate model for recurring expense/income templates.
    Examples: Almuerzo S/25, Transporte S/15, Café S/8, etc.
    """
    __tablename__ = "quick_templates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)  # Display name: "Almuerzo", "Transporte"
    description = Column(String, nullable=False)  # Transaction description
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False, default="expense")  # 'income' or 'expense'
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    
    # Relationships
    category = relationship("Category")

    def __repr__(self):
        return f"<QuickTemplate(id={self.id}, name='{self.name}', amount={self.amount})>"
