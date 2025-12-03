"""
OAuth 2.0 Authentication with Google
JWT token management
"""
import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth

from app.db.database import get_db
from app.models.user import User

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")

# Security
security = HTTPBearer(auto_error=False)

# OAuth client
oauth = OAuth()
if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET:
    oauth.register(
        name='google',
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid email profile'
        }
    )


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> dict:
    """Verify and decode a JWT token."""
    try:
        print(f"[OAuth] Verifying token: {token[:20]}...")
        print(f"[OAuth] Using SECRET_KEY: {SECRET_KEY[:10]}...")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"[OAuth] Token valid! Payload: {payload}")
        return payload
    except JWTError as e:
        print(f"[OAuth] Token verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_or_create_user(db: Session, email: str, name: str, picture: str, provider: str, provider_id: str) -> User:
    """Get existing user or create new one."""
    # Try to find by provider_id first (most reliable)
    user = db.query(User).filter(User.provider_id == provider_id).first()
    
    if not user:
        # Try by email (in case user changed provider)
        user = db.query(User).filter(User.email == email).first()
    
    if user:
        # Update last login and info
        user.last_login = datetime.utcnow()
        user.name = name  # Update name in case it changed
        user.picture = picture
        db.commit()
        db.refresh(user)
    else:
        # Create new user
        user = User(
            email=email,
            name=name,
            picture=picture,
            provider=provider,
            provider_id=provider_id,
            is_demo=False,
            created_at=datetime.utcnow(),
            last_login=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return user


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current user from JWT token.
    This replaces the HTTP Basic Auth dependency.
    """
    print(f"[OAuth] get_current_user called, credentials: {credentials}")
    if not credentials:
        print("[OAuth] No credentials provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"[OAuth] Token received: {credentials.credentials[:20]}...")
    # Verify token
    payload = verify_token(credentials.credentials)
    user_id_str = payload.get("sub")
    
    if user_id_str is None:
        print("[OAuth] No user_id in token payload")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Convert string to int
    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        print(f"[OAuth] Invalid user_id format: {user_id_str}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"[OAuth] Looking for user with ID: {user_id}")
    # Get user from database
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        print(f"[OAuth] User {user_id} not found in database")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"[OAuth] User authenticated: {user.email}")
    return user


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Get current user if authenticated, otherwise return None.
    Useful for demo mode endpoints.
    """
    if not credentials:
        return None
    
    try:
        payload = verify_token(credentials.credentials)
        user_id: int = payload.get("sub")
        if user_id:
            return db.query(User).filter(User.id == user_id).first()
    except:
        pass
    
    return None
