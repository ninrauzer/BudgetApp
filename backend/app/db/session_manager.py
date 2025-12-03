"""
Database Session Manager with Demo Support
Automatically switches between production and demo databases based on user context
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from contextvars import ContextVar
import os
from dotenv import load_dotenv

load_dotenv()

# Get database URLs
DATABASE_URL = os.getenv("DATABASE_URL")
DEMO_DATABASE_URL = os.getenv("DEMO_DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not configured")

# Create engines
production_engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)

demo_engine = None
if DEMO_DATABASE_URL:
    demo_engine = create_engine(
        DEMO_DATABASE_URL,
        echo=False,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10
    )

# Session factories
ProductionSession = sessionmaker(autocommit=False, autoflush=False, bind=production_engine)
DemoSession = sessionmaker(autocommit=False, autoflush=False, bind=demo_engine) if demo_engine else None

# Base for models
Base = declarative_base()

# Context variable to track if current request is demo
is_demo_context: ContextVar[bool] = ContextVar('is_demo_context', default=False)


def set_demo_context(is_demo: bool):
    """Set whether current request is for demo user"""
    is_demo_context.set(is_demo)


def get_db():
    """
    Get database session based on context.
    Demo users get demo database, others get production.
    """
    is_demo = is_demo_context.get()
    
    if is_demo and DemoSession:
        # Demo user - use demo database
        db = DemoSession()
    else:
        # Regular user - use production database
        db = ProductionSession()
    
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize all databases"""
    Base.metadata.create_all(bind=production_engine)
    if demo_engine:
        Base.metadata.create_all(bind=demo_engine)
