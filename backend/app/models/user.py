"""
User Model for OAuth Authentication
Stores user information from Google/Apple OAuth providers
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from app.db.database import Base


class User(Base):
    """User model for OAuth authentication."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    picture = Column(String, nullable=True)  # Avatar URL from OAuth provider
    provider = Column(String, nullable=False)  # "google", "apple", "demo"
    provider_id = Column(String, unique=True, nullable=False)  # OAuth sub/id
    is_demo = Column(Boolean, default=False)  # Demo mode for this user?
    is_admin = Column(Boolean, default=False)  # Admin privileges for user management
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<User {self.email} via {self.provider}>"


class AllowedUser(Base):
    """
    Whitelist de usuarios autorizados para acceder al sistema.
    Solo los emails en esta tabla pueden autenticarse exitosamente.
    """
    __tablename__ = "allowed_users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)  # Nombre descriptivo opcional
    is_active = Column(Boolean, default=True)
    added_at = Column(DateTime, default=datetime.utcnow)
    added_by = Column(String, nullable=True)  # Email del admin que lo agregó
    
    def __repr__(self):
        return f"<AllowedUser {self.email} active={self.is_active}>"
