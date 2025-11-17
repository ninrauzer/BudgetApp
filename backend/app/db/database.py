"""
Database configuration and session management.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables (idempotent)
load_dotenv()

# Backend directory (place where budget.db truly resides per user clarification)
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DEFAULT_DB_PATH = os.path.join(BACKEND_DIR, 'budget.db')

# Allow tests to inject an alternate DB URL (e.g. in-memory) via BUDGETAPP_DATABASE_URL first, then DATABASE_URL.
_override_test_url = os.getenv("BUDGETAPP_DATABASE_URL")
_generic_url = os.getenv("DATABASE_URL")
if _override_test_url:
    DATABASE_URL = _override_test_url
elif _generic_url:
    DATABASE_URL = _generic_url
else:
    DATABASE_URL = f"sqlite:///{DEFAULT_DB_PATH}"

# Create engine
# For SQLite, we need check_same_thread=False to allow multiple threads
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# Special case: pure in-memory SQLite needs StaticPool to share the same DB across connections (tests)
try:
    if DATABASE_URL in ("sqlite:///:memory:", "sqlite://"):
        from sqlalchemy.pool import StaticPool
        engine = create_engine(
            DATABASE_URL,
            connect_args=_connect_args,
            poolclass=StaticPool,
            echo=False  # keep test output cleaner
        )
    else:
        engine = create_engine(
            DATABASE_URL,
            connect_args=_connect_args,
            echo=False  # Disable SQL logging for better performance
        )
except Exception as e:
    # Fallback (shouldn't happen normally)
    engine = create_engine(
        f"sqlite:///{DEFAULT_DB_PATH}",
        connect_args={"check_same_thread": False},
        echo=False  # Disable SQL logging for better performance
    )

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for declarative models
Base = declarative_base()


def get_db():
    """
    Dependency to get database session.
    Usage in FastAPI routes:
        def route(db: Session = Depends(get_db)):
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database - create all tables.
    """
    Base.metadata.create_all(bind=engine)
