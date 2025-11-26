"""
Database configuration and session management.
PostgreSQL only - SQLite support removed.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables (idempotent)
load_dotenv()

# Get DATABASE_URL from environment
# Priority: BUDGETAPP_DATABASE_URL (tests) > DATABASE_URL > raise error
_override_test_url = os.getenv("BUDGETAPP_DATABASE_URL")
_generic_url = os.getenv("DATABASE_URL")

if _override_test_url:
    DATABASE_URL = _override_test_url
elif _generic_url:
    DATABASE_URL = _generic_url
else:
    raise ValueError(
        "DATABASE_URL not configured. "
        "Set it in .env file: DATABASE_URL=postgresql://user:password@host:port/database"
    )

# Validate PostgreSQL URL
if not DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgres://"):
    raise ValueError(
        f"Only PostgreSQL databases are supported. "
        f"DATABASE_URL must start with 'postgresql://' or 'postgres://'. "
        f"Got: {DATABASE_URL[:20]}..."
    )

# Create engine (PostgreSQL only)
try:
    engine = create_engine(
        DATABASE_URL,
        echo=False,  # Disable SQL logging for better performance
        pool_pre_ping=True,  # Verify connections before using
        pool_size=5,  # Connection pool size
        max_overflow=10  # Max overflow connections
    )
except Exception as e:
    raise ValueError(f"Failed to create database engine: {e}")

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
