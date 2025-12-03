"""
Migration Script: Add Users Table for OAuth
Adds the users table to support Google OAuth authentication
"""
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.db.database import engine, SessionLocal
from app.models.user import User
from app.db.database import Base

def migrate():
    """Create users table."""
    print("Creating users table...")
    
    try:
        # Create only the users table
        User.__table__.create(engine, checkfirst=True)
        print("✅ Users table created successfully")
        
        # Create demo user
        db = SessionLocal()
        try:
            from datetime import datetime
            demo_user = db.query(User).filter(User.email == "demo@budgetapp.local").first()
            
            if not demo_user:
                demo_user = User(
                    email="demo@budgetapp.local",
                    name="Demo User",
                    picture="",
                    provider="demo",
                    provider_id="demo",
                    is_demo=True,
                    created_at=datetime.utcnow()
                )
                db.add(demo_user)
                db.commit()
                print("✅ Demo user created")
            else:
                print("ℹ️  Demo user already exists")
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Error: {e}")
        raise

if __name__ == "__main__":
    migrate()
