"""
Transfers API endpoints
Handles transfers between accounts
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.transfer import TransferCreate, TransferResponse, TransferDetail
from app.models.transaction import Transaction
from app.models.account import Account
from app.models.category import Category
import uuid
from typing import List


router = APIRouter(prefix="/transfers", tags=["transfers"])


@router.post("/", response_model=TransferResponse)
async def create_transfer(
    transfer: TransferCreate,
    db: Session = Depends(get_db)
):
    """
    Create a transfer between two accounts
    
    This creates two linked transactions:
    - Withdrawal (expense) from source account
    - Deposit (income) to destination account
    
    Both transactions are marked as 'transfer' type and excluded from budget calculations
    """
    # Validate accounts exist
    from_account = db.query(Account).filter(Account.id == transfer.from_account_id).first()
    to_account = db.query(Account).filter(Account.id == transfer.to_account_id).first()
    
    if not from_account:
        raise HTTPException(status_code=404, detail=f"Source account (ID: {transfer.from_account_id}) not found")
    
    if not to_account:
        raise HTTPException(status_code=404, detail=f"Destination account (ID: {transfer.to_account_id}) not found")
    
    if from_account.id == to_account.id:
        raise HTTPException(status_code=400, detail="Cannot transfer to the same account")
    
    # Get or create "Transferencias" category
    transfer_category = db.query(Category).filter(
        Category.name == "Transferencias"
    ).first()
    
    if not transfer_category:
        # Create system category for transfers
        transfer_category = Category(
            name="Transferencias",
            type="both",
            icon="arrow-right-left",
            color="#6B7280",
            is_system=True
        )
        db.add(transfer_category)
        db.flush()
    
    # Generate unique transfer ID
    transfer_id = str(uuid.uuid4())
    
    # Create withdrawal transaction (expense from source)
    withdrawal = Transaction(
        type='expense',
        transaction_type='transfer',
        amount=transfer.amount,
        description=f"→ {to_account.name}" + (f": {transfer.description}" if transfer.description else ""),
        account_id=from_account.id,
        category_id=transfer_category.id,
        transfer_id=transfer_id,
        date=transfer.date,
        currency=from_account.currency or 'PEN',
        exchange_rate=1.0,
        amount_pen=transfer.amount if (from_account.currency or 'PEN') == 'PEN' else transfer.amount * 3.7,  # TODO: Use real exchange rate
        status='completed'
    )
    db.add(withdrawal)
    db.flush()  # Get ID
    
    # Create deposit transaction (income to destination)
    deposit = Transaction(
        type='income',
        transaction_type='transfer',
        amount=transfer.amount,
        description=f"← {from_account.name}" + (f": {transfer.description}" if transfer.description else ""),
        account_id=to_account.id,
        category_id=transfer_category.id,
        transfer_id=transfer_id,
        related_transaction_id=withdrawal.id,
        date=transfer.date,
        currency=to_account.currency or 'PEN',
        exchange_rate=1.0,
        amount_pen=transfer.amount if (to_account.currency or 'PEN') == 'PEN' else transfer.amount * 3.7,  # TODO: Use real exchange rate
        status='completed'
    )
    db.add(deposit)
    db.flush()
    
    # Link withdrawal to deposit
    withdrawal.related_transaction_id = deposit.id
    
    db.commit()
    db.refresh(withdrawal)
    db.refresh(deposit)
    
    return TransferResponse(
        transfer_id=transfer_id,
        from_transaction_id=withdrawal.id,
        to_transaction_id=deposit.id,
        from_account_name=from_account.name,
        to_account_name=to_account.name,
        amount=transfer.amount,
        date=transfer.date,
        description=transfer.description
    )


@router.get("/{transfer_id}", response_model=TransferDetail)
async def get_transfer(
    transfer_id: str,
    db: Session = Depends(get_db)
):
    """Get details of a specific transfer"""
    transactions = db.query(Transaction).filter(
        Transaction.transfer_id == transfer_id
    ).all()
    
    if not transactions or len(transactions) != 2:
        raise HTTPException(status_code=404, detail="Transfer not found or incomplete")
    
    withdrawal = next((t for t in transactions if t.type == 'expense'), None)
    deposit = next((t for t in transactions if t.type == 'income'), None)
    
    if not withdrawal or not deposit:
        raise HTTPException(status_code=500, detail="Transfer data is corrupted")
    
    return TransferDetail(
        transfer_id=transfer_id,
        from_account={
            "id": withdrawal.account.id,
            "name": withdrawal.account.name,
            "currency": withdrawal.account.currency
        },
        to_account={
            "id": deposit.account.id,
            "name": deposit.account.name,
            "currency": deposit.account.currency
        },
        amount=withdrawal.amount,
        date=withdrawal.date,
        description=withdrawal.description.replace(f"→ {deposit.account.name}: ", "").replace(f"→ {deposit.account.name}", ""),
        withdrawal_transaction={
            "id": withdrawal.id,
            "amount": withdrawal.amount,
            "date": str(withdrawal.date)
        },
        deposit_transaction={
            "id": deposit.id,
            "amount": deposit.amount,
            "date": str(deposit.date)
        }
    )


@router.get("/", response_model=List[TransferResponse])
async def list_transfers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all transfers"""
    # Get unique transfer_ids
    transfers = db.query(Transaction.transfer_id).filter(
        Transaction.transaction_type == 'transfer',
        Transaction.transfer_id.isnot(None)
    ).distinct().offset(skip).limit(limit).all()
    
    result = []
    for (transfer_id,) in transfers:
        transactions = db.query(Transaction).filter(
            Transaction.transfer_id == transfer_id
        ).all()
        
        if len(transactions) == 2:
            withdrawal = next((t for t in transactions if t.type == 'expense'), None)
            deposit = next((t for t in transactions if t.type == 'income'), None)
            
            if withdrawal and deposit:
                result.append(TransferResponse(
                    transfer_id=transfer_id,
                    from_transaction_id=withdrawal.id,
                    to_transaction_id=deposit.id,
                    from_account_name=withdrawal.account.name,
                    to_account_name=deposit.account.name,
                    amount=withdrawal.amount,
                    date=withdrawal.date,
                    description=withdrawal.description
                ))
    
    return result


@router.delete("/{transfer_id}")
async def delete_transfer(
    transfer_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete a transfer (removes both linked transactions)
    """
    transactions = db.query(Transaction).filter(
        Transaction.transfer_id == transfer_id
    ).all()
    
    if not transactions:
        raise HTTPException(status_code=404, detail="Transfer not found")
    
    # Delete both transactions
    for t in transactions:
        db.delete(t)
    
    db.commit()
    
    return {
        "message": "Transfer deleted successfully",
        "transfer_id": transfer_id,
        "deleted_transactions": len(transactions)
    }
