"""
Transaction model - Actual income and expense transactions.
"""

from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Transaction(Base):
    """
    Transaction model for recording actual income and expenses.
    """
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    date = Column(Date, nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, nullable=False, default="PEN")  # 'PEN', 'USD'
    exchange_rate = Column(Float, nullable=True)  # Tipo de cambio del día
    amount_pen = Column(Float, nullable=False)  # Monto convertido a soles
    type = Column(String, nullable=False)  # 'income', 'expense'
    description = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    status = Column(String, nullable=False, default="completed")  # 'pending', 'completed', 'cancelled'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    category = relationship("Category", back_populates="transactions")
    account = relationship("Account", back_populates="transactions")

    def __repr__(self):
        return f"<Transaction(id={self.id}, date={self.date}, type='{self.type}', amount={self.amount}, status='{self.status}')>"
