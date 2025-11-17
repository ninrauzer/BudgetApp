"""
Transfer schemas for creating and managing transfers between accounts
"""

from pydantic import BaseModel, Field
from datetime import date as DateType
from typing import Optional


class TransferCreate(BaseModel):
    """Schema for creating a new transfer"""
    from_account_id: int = Field(..., description="Source account ID")
    to_account_id: int = Field(..., description="Destination account ID")
    amount: float = Field(..., gt=0, description="Amount to transfer (must be positive)")
    date: DateType = Field(..., description="Transfer date")
    description: Optional[str] = Field(None, description="Optional description for the transfer")


class TransferResponse(BaseModel):
    """Schema for transfer response"""
    transfer_id: str
    from_transaction_id: int
    to_transaction_id: int
    from_account_name: str
    to_account_name: str
    amount: float
    date: DateType
    description: Optional[str] = None
    
    class Config:
        from_attributes = True


class TransferDetail(BaseModel):
    """Schema for detailed transfer information"""
    transfer_id: str
    from_account: dict
    to_account: dict
    amount: float
    date: DateType
    description: Optional[str] = None
    withdrawal_transaction: dict
    deposit_transaction: dict
    
    class Config:
        from_attributes = True
