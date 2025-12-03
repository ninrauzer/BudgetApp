"""
Database configuration and session management.
PostgreSQL only - SQLite support removed.

DEPRECATED: This file is kept for backwards compatibility.
New code should use app.db.session_manager for demo support.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Import from new session manager
from app.db.session_manager import (
    get_db,
    Base,
    init_db,
    production_engine as engine,  # Alias for compatibility
    ProductionSession as SessionLocal  # Alias for compatibility
)

# Keep the rest of the file for reference but all imports come from session_manager
__all__ = ['get_db', 'Base', 'init_db', 'engine', 'SessionLocal']
