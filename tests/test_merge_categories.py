from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy.orm import Session

from app.services.merge_duplicates import merge_duplicate_categories
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.budget_plan import BudgetPlan
from app.models.billing_cycle import BillingCycle


def _compute_cycle_dates(year: int, month_num: int, start_day: int):
    cycle_end_temp = date(year, month_num, start_day)
    cycle_end = cycle_end_temp - timedelta(days=1)
    cycle_start = cycle_end_temp - relativedelta(months=1)
    return cycle_start, cycle_end


def test_merge_duplicate_categories(db_session: Session):
    # Precondition: billing cycle exists from fixture
    billing = db_session.query(BillingCycle).filter(BillingCycle.is_active == True).first()
    assert billing is not None

    year = date.today().year
    cycle_start, cycle_end = _compute_cycle_dates(year, 11, billing.start_day)  # Noviembre

    # Create duplicate categories with same name 'Extra'
    cat_a = Category(name="Extra", type="expense", icon="x", is_active=True)
    cat_b = Category(name="Extra", type="expense", icon="y", is_active=True)
    db_session.add_all([cat_a, cat_b])
    db_session.commit()
    cat_a_id = cat_a.id
    cat_b_id = cat_b.id

    # Assign transactions: cat_a gets 3, cat_b gets 1 (so cat_a should become canonical)
    txs = [
        Transaction(date=cycle_start + timedelta(days=i), category_id=cat_a.id, account_id=1, amount=10, currency="PEN", exchange_rate=None, amount_pen=10, type="expense", description=f"A{i}", status="completed") for i in range(3)
    ] + [
        Transaction(date=cycle_start + timedelta(days=5), category_id=cat_b.id, account_id=1, amount=99, currency="PEN", exchange_rate=None, amount_pen=99, type="expense", description="B1", status="completed")
    ]
    db_session.add_all(txs)

    # Budget plans referencing both categories
    bp_a = BudgetPlan(cycle_name="Noviembre", start_date=cycle_start, end_date=cycle_end, category_id=cat_a.id, amount=300, notes=None)
    bp_b = BudgetPlan(cycle_name="Noviembre", start_date=cycle_start, end_date=cycle_end, category_id=cat_b.id, amount=150, notes=None)
    db_session.add_all([bp_a, bp_b])
    db_session.commit()

    # Execute merge
    result = merge_duplicate_categories(db_session)

    # Assertions on result structure
    assert result["removed_count"] == 1
    assert len(result["duplicates"]) == 1
    dup_info = result["duplicates"][0]
    assert dup_info["name"] == "Extra"
    assert dup_info["canonical_id"] == cat_a.id  # cat_a had more transactions
    assert dup_info["removed_ids"] == [cat_b_id]

    # Database state: cat_b deleted, all transactions & plans now point to cat_a
    remaining = db_session.query(Category).filter(Category.name == "Extra").all()
    assert len(remaining) == 1
    assert remaining[0].id == cat_a.id

    reassigned_txs = db_session.query(Transaction).filter(Transaction.category_id == cat_a.id).all()
    # 3 original + 1 reassigned = 4
    assert len(reassigned_txs) == 4

    # Budget plans merged: single plan with summed amount (300 + 150 = 450)
    plans_cat_a = db_session.query(BudgetPlan).filter(BudgetPlan.category_id == cat_a.id).all()
    assert len(plans_cat_a) == 1
    assert plans_cat_a[0].amount == 450

    # Ensure no lingering entry with old cat_b id
    orphan_txs = db_session.query(Transaction).filter(Transaction.category_id == cat_b_id).count()
    assert orphan_txs == 0
    orphan_plans = db_session.query(BudgetPlan).filter(BudgetPlan.category_id == cat_b_id).count()
    assert orphan_plans == 0
