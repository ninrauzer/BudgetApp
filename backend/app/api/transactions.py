"""
Transactions API router.
Handles CRUD operations for income/expense transactions.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import date

from app.db.database import get_db
from app.models.transaction import Transaction
from app.models.category import Category
from app.models.account import Account
from app.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionPeriodSummary,
    TransactionSummary,
    TransactionCategorySummary,
)
from app.services.exchange_rate import get_exchange_rate, convert_to_pen

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.get("", response_model=List[TransactionResponse])
def list_transactions(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[int] = None,
    account_id: Optional[int] = None,
    type: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
):
    """
    List transactions with optional filters.
    
    - **start_date**: Filter from this date (ISO 8601)
    - **end_date**: Filter until this date (ISO 8601)
    - **category_id**: Filter by category
    - **account_id**: Filter by account
    - **type**: Filter by type (income/expense)
    - **status**: Filter by status (pending/completed/cancelled)
    - **limit**: Max results (default: 100, max: 1000)
    - **offset**: Offset for pagination (default: 0)
    """
    query = db.query(Transaction)
    
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    
    if account_id:
        query = query.filter(Transaction.account_id == account_id)
    
    if type:
        query = query.filter(Transaction.type == type)
    
    if status:
        query = query.filter(Transaction.status == status)
    
    # Order by date descending
    query = query.order_by(Transaction.date.desc(), Transaction.created_at.desc())
    
    # Apply pagination
    transactions = query.offset(offset).limit(limit).all()
    
    # Enrich with category and account names
    result = []
    for tx in transactions:
        tx_dict = {
            "id": tx.id,
            "date": tx.date,
            "category_id": tx.category_id,
            "category_name": tx.category.name,
            "category_type": tx.category.type,
            "category_icon": tx.category.icon,
            "account_id": tx.account_id,
            "account_name": tx.account.name,
            "amount": tx.amount,
            "currency": tx.currency,
            "exchange_rate": tx.exchange_rate,
            "amount_pen": tx.amount_pen,
            "type": tx.type,
            "description": tx.description,
            "notes": tx.notes,
            "status": tx.status,
            "created_at": tx.created_at,
            "updated_at": tx.updated_at,
        }
        result.append(TransactionResponse(**tx_dict))
    
    return result


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Get a specific transaction by ID."""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with id {transaction_id} not found"
        )
    
    return TransactionResponse(
        id=transaction.id,
        date=transaction.date,
        category_id=transaction.category_id,
        category_name=transaction.category.name,
        category_type=transaction.category.type,
        category_icon=transaction.category.icon,
        account_id=transaction.account_id,
        account_name=transaction.account.name,
        amount=transaction.amount,
        currency=transaction.currency,
        exchange_rate=transaction.exchange_rate,
        amount_pen=transaction.amount_pen,
        type=transaction.type,
        description=transaction.description,
        notes=transaction.notes,
        status=transaction.status,
        created_at=transaction.created_at,
        updated_at=transaction.updated_at,
    )


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    """
    Create a new transaction.
    
    Validates:
    - Category and account exist
    - Transaction type matches category type
    - Amount is positive
    - If currency is USD, fetches exchange rate from BCRP automatically
    """
    # Validate category exists
    category = db.query(Category).filter(Category.id == transaction.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category with id {transaction.category_id} not found"
        )
    
    # Validate account exists
    account = db.query(Account).filter(Account.id == transaction.account_id).first()
    if not account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Account with id {transaction.account_id} not found"
        )
    
    # Validate transaction type matches category type (income/expense only)
    if category.type not in ["income", "expense"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot create transaction for category type '{category.type}'. Only 'income' or 'expense' allowed."
        )
    
    if transaction.type != category.type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transaction type '{transaction.type}' must match category type '{category.type}'"
        )
    
    # Calculate exchange rate and amount_pen
    exchange_rate = None
    amount_pen = transaction.amount
    
    if transaction.currency == "USD":
        # Fetch exchange rate from BCRP
        exchange_rate = await get_exchange_rate(transaction.date)
        amount_pen = convert_to_pen(transaction.amount, exchange_rate)
    
    # Create transaction with all fields
    db_transaction = Transaction(
        date=transaction.date,
        category_id=transaction.category_id,
        account_id=transaction.account_id,
        amount=transaction.amount,
        currency=transaction.currency,
        exchange_rate=exchange_rate,
        amount_pen=amount_pen,
        type=transaction.type,
        description=transaction.description,
        notes=transaction.notes,
        status=transaction.status,
    )
    
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    return TransactionResponse(
        id=db_transaction.id,
        date=db_transaction.date,
        category_id=db_transaction.category_id,
        category_name=category.name,
        category_type=category.type,
        category_icon=category.icon,
        account_id=db_transaction.account_id,
        account_name=account.name,
        amount=db_transaction.amount,
        currency=db_transaction.currency,
        exchange_rate=db_transaction.exchange_rate,
        amount_pen=db_transaction.amount_pen,
        type=db_transaction.type,
        description=db_transaction.description,
        notes=db_transaction.notes,
        status=db_transaction.status,
        created_at=db_transaction.created_at,
        updated_at=db_transaction.updated_at,
    )


@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction: TransactionUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing transaction."""
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    
    if not db_transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with id {transaction_id} not found"
        )
    
    # Load category and account for validation and response
    category = db.query(Category).filter(Category.id == transaction.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category with id {transaction.category_id} not found"
        )
    
    account = db.query(Account).filter(Account.id == transaction.account_id).first()
    if not account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Account with id {transaction.account_id} not found"
        )
    
    # Validate transaction type matches category type
    if transaction.type != category.type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transaction type must match category type"
        )
    
    # Recalculate amount_pen
    amount_pen = transaction.amount
    exchange_rate = None
    
    if transaction.currency == "USD":
        exchange_rate = db_transaction.exchange_rate or 1.0
        amount_pen = transaction.amount * exchange_rate
    
    # Update fields
    db_transaction.date = transaction.date
    db_transaction.category_id = transaction.category_id
    db_transaction.account_id = transaction.account_id
    db_transaction.amount = transaction.amount
    db_transaction.currency = transaction.currency
    db_transaction.exchange_rate = exchange_rate
    db_transaction.amount_pen = amount_pen
    db_transaction.type = transaction.type
    db_transaction.description = transaction.description
    db_transaction.notes = transaction.notes
    db_transaction.status = transaction.status
    
    db.commit()
    db.refresh(db_transaction)
    
    return TransactionResponse(
        id=db_transaction.id,
        date=db_transaction.date,
        category_id=db_transaction.category_id,
        category_name=category.name,
        category_type=category.type,
        category_icon=category.icon,
        account_id=db_transaction.account_id,
        account_name=account.name,
        amount=db_transaction.amount,
        currency=db_transaction.currency,
        exchange_rate=db_transaction.exchange_rate,
        amount_pen=db_transaction.amount_pen,
        type=db_transaction.type,
        description=db_transaction.description,
        notes=db_transaction.notes,
        status=db_transaction.status,
        created_at=db_transaction.created_at,
        updated_at=db_transaction.updated_at,
    )


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Delete a transaction."""
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    
    if not db_transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with id {transaction_id} not found"
        )
    
    db.delete(db_transaction)
    db.commit()
    
    return None


@router.get("/summary", response_model=TransactionPeriodSummary, name="transaction_summary")
def get_transaction_summary(
    start_date: date = Query(..., description="Start date (ISO 8601)"),
    end_date: date = Query(..., description="End date (ISO 8601)"),
    db: Session = Depends(get_db)
):
    """
    Get transaction summary for a period.
    
    Returns totals by category and overall summary.
    """
    # Overall summary
    transactions = db.query(Transaction).filter(
        and_(
            Transaction.date >= start_date,
            Transaction.date <= end_date,
            Transaction.status == "completed"
        )
    ).all()
    
    total_income = sum(tx.amount for tx in transactions if tx.type == "income")
    total_expense = sum(tx.amount for tx in transactions if tx.type == "expense")
    
    summary = TransactionSummary(
        total_income=total_income,
        total_expense=total_expense,
        balance=total_income - total_expense,
        transaction_count=len(transactions)
    )
    
    # By category
    by_category_query = db.query(
        Category.id,
        Category.name,
        Category.type,
        func.sum(Transaction.amount).label("total"),
        func.count(Transaction.id).label("count")
    ).join(Transaction).filter(
        and_(
            Transaction.date >= start_date,
            Transaction.date <= end_date,
            Transaction.status == "completed"
        )
    ).group_by(Category.id, Category.name, Category.type).all()
    
    by_category = [
        TransactionCategorySummary(
            category_id=row[0],
            category_name=row[1],
            type=row[2],
            total=row[3],
            count=row[4]
        )
        for row in by_category_query
    ]
    
    return TransactionPeriodSummary(
        period={"start": start_date.isoformat(), "end": end_date.isoformat()},
        summary=summary,
        by_category=by_category
    )

