"""
Analysis API endpoints
Provides aggregated data for charts and analytics
"""
from datetime import date, datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.db.database import get_db
from app.models.transaction import Transaction
from app.models.category import Category
from app.models.billing_cycle import BillingCycle
from app.services.billing_cycle import get_cycle_for_date, get_cycle_by_offset

router = APIRouter(
    prefix="/api/analysis",
    tags=["analysis"]
)


@router.get("/by-category")
def get_analysis_by_category(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    transaction_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get transaction totals grouped by category.
    If no dates provided, uses current billing cycle.
    """
    # Get date range
    if start_date and end_date:
        period_start = datetime.strptime(start_date, "%Y-%m-%d").date()
        period_end = datetime.strptime(end_date, "%Y-%m-%d").date()
    else:
        # Use current cycle
        billing_cycle = db.query(BillingCycle).filter(BillingCycle.is_active == True).first()
        if not billing_cycle:
            billing_cycle = BillingCycle(name="default", start_day=1, is_active=True)
            db.add(billing_cycle)
            db.commit()
        
        cycle_info = get_cycle_for_date(billing_cycle.start_day)
        period_start = datetime.strptime(cycle_info["start_date"], "%Y-%m-%d").date()
        period_end = datetime.strptime(cycle_info["end_date"], "%Y-%m-%d").date()
    
    # Build query
    query = db.query(
        Category.id,
        Category.name,
        Category.icon,
        Category.type,
        func.sum(Transaction.amount_pen).label('total'),
        func.count(Transaction.id).label('count')
    ).join(
        Transaction, Transaction.category_id == Category.id
    ).filter(
        and_(
            Transaction.date >= period_start,
            Transaction.date <= period_end
        )
    )
    
    # Filter by type if specified
    if transaction_type:
        query = query.filter(Transaction.type == transaction_type)
    
    # Group and order
    results = query.group_by(Category.id).order_by(func.sum(Transaction.amount_pen).desc()).all()
    
    return [
        {
            "category_id": r.id,
            "category_name": r.name,
            "category_icon": r.icon,
            "category_type": r.type,
            "total": float(r.total),
            "count": r.count
        }
        for r in results
    ]


@router.get("/trends")
def get_trends(
    cycles: int = Query(default=6, ge=1, le=12),
    db: Session = Depends(get_db)
):
    """
    Get income/expense trends over multiple billing cycles.
    """
    billing_cycle = db.query(BillingCycle).filter(BillingCycle.is_active == True).first()
    if not billing_cycle:
        billing_cycle = BillingCycle(name="default", start_day=1, is_active=True)
        db.add(billing_cycle)
        db.commit()
    
    trends = []
    
    # Get data for each cycle going backwards
    for offset in range(-cycles + 1, 1):
        cycle_info = get_cycle_by_offset(billing_cycle.start_day, offset)
        period_start = datetime.strptime(cycle_info["start_date"], "%Y-%m-%d").date()
        period_end = datetime.strptime(cycle_info["end_date"], "%Y-%m-%d").date()
        
        # Get income total
        income_total = db.query(func.sum(Transaction.amount_pen)).filter(
            and_(
                Transaction.date >= period_start,
                Transaction.date <= period_end,
                Transaction.type == "income"
            )
        ).scalar() or 0.0
        
        # Get expense total
        expense_total = db.query(func.sum(Transaction.amount_pen)).filter(
            and_(
                Transaction.date >= period_start,
                Transaction.date <= period_end,
                Transaction.type == "expense"
            )
        ).scalar() or 0.0
        
        trends.append({
            "cycle_name": cycle_info["cycle_name"],
            "start_date": cycle_info["start_date"],
            "end_date": cycle_info["end_date"],
            "income": float(income_total),
            "expense": float(expense_total),
            "balance": float(income_total - expense_total)
        })
    
    return trends


@router.get("/summary")
def get_analysis_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get summary statistics for the period.
    """
    # Get date range
    if start_date and end_date:
        period_start = datetime.strptime(start_date, "%Y-%m-%d").date()
        period_end = datetime.strptime(end_date, "%Y-%m-%d").date()
    else:
        billing_cycle = db.query(BillingCycle).filter(BillingCycle.is_active == True).first()
        if not billing_cycle:
            billing_cycle = BillingCycle(name="default", start_day=1, is_active=True)
            db.add(billing_cycle)
            db.commit()
        
        cycle_info = get_cycle_for_date(billing_cycle.start_day)
        period_start = datetime.strptime(cycle_info["start_date"], "%Y-%m-%d").date()
        period_end = datetime.strptime(cycle_info["end_date"], "%Y-%m-%d").date()
    
    # Total income
    total_income = db.query(func.sum(Transaction.amount_pen)).filter(
        and_(
            Transaction.date >= period_start,
            Transaction.date <= period_end,
            Transaction.type == "income"
        )
    ).scalar() or 0.0
    
    # Total expense
    total_expense = db.query(func.sum(Transaction.amount_pen)).filter(
        and_(
            Transaction.date >= period_start,
            Transaction.date <= period_end,
            Transaction.type == "expense"
        )
    ).scalar() or 0.0
    
    # Transaction count
    transaction_count = db.query(func.count(Transaction.id)).filter(
        and_(
            Transaction.date >= period_start,
            Transaction.date <= period_end
        )
    ).scalar() or 0
    
    # Average transaction
    avg_transaction = total_expense / transaction_count if transaction_count > 0 else 0.0
    
    # Days in period
    days_in_period = (period_end - period_start).days + 1
    avg_daily_expense = total_expense / days_in_period if days_in_period > 0 else 0.0
    
    # Largest expense
    largest_expense = db.query(
        Transaction.description,
        Transaction.amount,
        Category.name.label('category_name')
    ).join(
        Category
    ).filter(
        and_(
            Transaction.date >= period_start,
            Transaction.date <= period_end,
            Transaction.type == "expense"
        )
    ).order_by(Transaction.amount.desc()).first()
    
    return {
        "total_income": float(total_income),
        "total_expense": float(total_expense),
        "balance": float(total_income - total_expense),
        "transaction_count": transaction_count,
        "avg_transaction": float(avg_transaction),
        "avg_daily_expense": float(avg_daily_expense),
        "largest_expense": {
            "description": largest_expense.description if largest_expense else "",
            "amount": float(largest_expense.amount) if largest_expense else 0.0,
            "category": largest_expense.category_name if largest_expense else ""
        } if largest_expense else None
    }
