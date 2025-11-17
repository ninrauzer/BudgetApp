import os
import sys
from pathlib import Path
from datetime import datetime, date, timedelta
from dateutil.relativedelta import relativedelta

import pytest
import httpx
from httpx import ASGITransport

# Ensure backend/app is on PYTHONPATH so "app.*" imports work like in runtime
BACKEND_DIR = Path(__file__).resolve().parents[1] / 'backend'
APP_DIR = BACKEND_DIR / 'app'
sys.path.insert(0, str(BACKEND_DIR))  # so 'app' becomes available

# Configure test database BEFORE importing app modules that create the engine.
os.environ.setdefault("BUDGETAPP_DATABASE_URL", "sqlite://")  # uses StaticPool in database.py

from app.db.database import Base, engine, SessionLocal  # noqa: E402
from app.models.category import Category  # noqa: E402
from app.models.budget_plan import BudgetPlan  # noqa: E402
from app.models.billing_cycle import BillingCycle  # noqa: E402
from app.models.transaction import Transaction  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def create_db_schema():
    """Create all tables once for the in-memory StaticPool database."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Provide a fresh DB session with seeded test data per test function."""
    session = SessionLocal()

    # Clean existing rows (order matters due to FK constraints)
    for model in [Transaction, BudgetPlan, Category, BillingCycle]:
        session.query(model).delete()
    session.commit()

    # Seed billing cycle (active)
    billing = BillingCycle(start_day=23, is_active=True, name="Default")
    session.add(billing)
    session.commit()

    # Determine cycle dates for 'Noviembre'
    year = datetime.now().year
    start_day = billing.start_day
    month_num = 11  # Noviembre
    cycle_end_temp = date(year, month_num, start_day)
    cycle_end = cycle_end_temp - timedelta(days=1)
    cycle_start = cycle_end_temp - relativedelta(months=1)

    # Categories
    salario = Category(name="Salario", type="income", icon="briefcase", is_active=True)
    comida = Category(name="Comida", type="expense", icon="utensils", is_active=True)
    session.add_all([salario, comida])
    session.commit()

    # Budget plans for cycle 'Noviembre'
    bp_salario = BudgetPlan(
        cycle_name="Noviembre",
        start_date=cycle_start,
        end_date=cycle_end,
        category_id=salario.id,
        amount=10000.0,
        notes="Budget salario"
    )
    bp_comida = BudgetPlan(
        cycle_name="Noviembre",
        start_date=cycle_start,
        end_date=cycle_end,
        category_id=comida.id,
        amount=500.0,
        notes="Budget comida"
    )
    session.add_all([bp_salario, bp_comida])
    session.commit()

    # Transactions inside cycle range (between cycle_start and cycle_end inclusive)
    income_tx = Transaction(
        date=cycle_start + timedelta(days=5),
        category_id=salario.id,
        account_id=1,
        amount=8000.0,
        currency="PEN",
        exchange_rate=None,
        amount_pen=8000.0,
        type="income",
        description="Pago de salario",
        notes=None,
        status="completed"
    )
    expense_tx = Transaction(
        date=cycle_start + timedelta(days=10),
        category_id=comida.id,
        account_id=1,
        amount=450.0,
        currency="PEN",
        exchange_rate=None,
        amount_pen=450.0,
        type="expense",
        description="Compras comida",
        notes=None,
        status="completed"
    )
    session.add_all([income_tx, expense_tx])
    session.commit()

    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(db_session):
    """Provide a synchronous httpx.Client using ASGITransport (manual cleanup)."""
    transport = ASGITransport(app=app)
    c = httpx.Client(transport=transport, base_url="http://testserver")
    try:
        yield c
    finally:
        c.close()