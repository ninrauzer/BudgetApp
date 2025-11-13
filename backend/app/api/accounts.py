"""
Accounts API router.
Handles CRUD operations for payment accounts.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.models.account import Account
from app.schemas.account import AccountCreate, AccountUpdate, AccountResponse

router = APIRouter(prefix="/api/accounts", tags=["accounts"])


@router.get("", response_model=List[AccountResponse])
def list_accounts(
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    List all accounts with optional filters.
    
    - **is_active**: Filter by active status (true/false)
    """
    query = db.query(Account)
    
    if is_active is not None:
        query = query.filter(Account.is_active == is_active)
    
    accounts = query.all()
    return accounts


@router.get("/{account_id}", response_model=AccountResponse)
def get_account(account_id: int, db: Session = Depends(get_db)):
    """Get a specific account by ID."""
    account = db.query(Account).filter(Account.id == account_id).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Account with id {account_id} not found"
        )
    
    return account


@router.post("", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
def create_account(account: AccountCreate, db: Session = Depends(get_db)):
    """
    Create a new account.
    
    - **name**: Account name (required)
    - **type**: Account type - cash, bank, credit_card, debit_card, digital_wallet
    - **balance**: Initial balance (default: 0.0)
    - **currency**: Currency code (default: PEN)
    - **is_active**: Active status (default: true)
    """
    db_account = Account(**account.model_dump())
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    
    return db_account


@router.put("/{account_id}", response_model=AccountResponse)
def update_account(
    account_id: int,
    account: AccountUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing account."""
    db_account = db.query(Account).filter(Account.id == account_id).first()
    
    if not db_account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Account with id {account_id} not found"
        )
    
    # Update fields
    for field, value in account.model_dump().items():
        setattr(db_account, field, value)
    
    db.commit()
    db.refresh(db_account)
    
    return db_account


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(account_id: int, db: Session = Depends(get_db)):
    """
    Delete an account.
    Cannot delete accounts with existing transactions.
    """
    db_account = db.query(Account).filter(Account.id == account_id).first()
    
    if not db_account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Account with id {account_id} not found"
        )
    
    # Check if account has transactions
    if db_account.transactions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete account with existing transactions"
        )
    
    db.delete(db_account)
    db.commit()
    
    return None
