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


def _compute_account_response(account: Account) -> dict:
    """Build the response payload with computed current_balance.

    current_balance logic:
        initial_balance (stored) + sum(income amounts) - sum(expense amounts)
    Transfer transactions still affect per-account balances (withdrawal reduces, deposit increases).
    Adjustments or other transaction_type values are treated according to their income/expense type.
    NOTE: Currency conversion is simplified: uses raw amount assuming homogeneous currency.
    """
    initial = account.balance or 0.0
    net = 0.0
    for t in account.transactions or []:
        # Skip cancelled transactions
        if getattr(t, "status", "completed") == "cancelled":
            continue
        amount = getattr(t, "amount", 0.0) or 0.0
        if t.type == "income":
            net += amount
        elif t.type == "expense":
            net -= amount
    current = initial + net
    # Mirror created_at as updated_at until model adds column
    return {
        "id": account.id,
        "name": account.name,
        "type": account.type,
        "icon": account.icon,
        "currency": account.currency,
        "is_active": account.is_active,
        "created_at": account.created_at,
        "updated_at": account.created_at,
        "initial_balance": initial,
        "current_balance": current,
        "balance": account.balance,
    }


@router.get("", response_model=List[AccountResponse])
def list_accounts(
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """List all accounts with optional filters and computed balances."""
    query = db.query(Account)
    if is_active is not None:
        query = query.filter(Account.is_active == is_active)
    accounts = query.all()
    return [_compute_account_response(a) for a in accounts]


@router.get("/{account_id}", response_model=AccountResponse)
def get_account(account_id: int, db: Session = Depends(get_db)):
    """Get a specific account by ID with computed balances."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Account with id {account_id} not found"
        )
    return _compute_account_response(account)


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
    return _compute_account_response(db_account)


@router.put("/{account_id}", response_model=AccountResponse)
def update_account(
    account_id: int,
    account: AccountUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing account and return computed balances."""
    db_account = db.query(Account).filter(Account.id == account_id).first()
    if not db_account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Account with id {account_id} not found"
        )
    for field, value in account.model_dump().items():
        setattr(db_account, field, value)
    db.commit()
    db.refresh(db_account)
    return _compute_account_response(db_account)


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
