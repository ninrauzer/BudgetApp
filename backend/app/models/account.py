"""
Account model - Bank accounts, cash, cards, and payment methods.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Account(Base):
    """
    Account model for different payment methods.
    Examples: Cash, Bank Account, Credit Card, Debit Card, Digital Wallet.
    """
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'cash', 'bank', 'credit_card', 'debit_card', 'digital_wallet'
    icon = Column(String, default="wallet")  # Lucide icon name
    balance = Column(Float, default=0.0)
    currency = Column(String, default="PEN")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    transactions = relationship("Transaction", back_populates="account")

    def __repr__(self):
        return f"<Account(id={self.id}, name='{self.name}', type='{self.type}', balance={self.balance})>"
