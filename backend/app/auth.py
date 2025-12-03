"""
HTTP Basic Authentication Middleware for BudgetApp

Security Features:
- Passwords hashed with bcrypt
- Users stored in JSON file (not in code)
- Environment variables for production override  
- Secure password comparison

Users file: backend/.users.json (gitignored)
"""
import os
import json
import secrets
from pathlib import Path
from typing import Optional, Dict
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import bcrypt

security = HTTPBasic()

# Users file path (gitignored)
USERS_FILE = Path(__file__).parent.parent / ".users.json"

# In-memory cache of users
_users_cache: Optional[Dict] = None


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def load_users() -> Dict:
    """
    Load users from file or create default users.
    Priority:
    1. .users.json file (production)
    2. Environment variables (Render.com)
    3. Default demo users (development only)
    """
    global _users_cache
    
    # Return cached users if available
    if _users_cache is not None:
        return _users_cache
    
    # Try to load from file first
    if USERS_FILE.exists():
        try:
            with open(USERS_FILE, 'r') as f:
                _users_cache = json.load(f)
                print("[auth] ✓ Loaded credentials from .users.json")
                return _users_cache
        except Exception as e:
            print(f"[auth] Warning: Could not load {USERS_FILE}: {e}")
    
    # Try environment variables (for Render.com)
    env_admin_pass = os.getenv("ADMIN_PASSWORD_HASH")
    env_demo_pass = os.getenv("DEMO_PASSWORD_HASH")
    
    if env_admin_pass and env_demo_pass:
        _users_cache = {
            "admin": {
                "password_hash": env_admin_pass,
                "type": "admin"
            },
            "demo": {
                "password_hash": env_demo_pass,
                "type": "demo"
            }
        }
        print("[auth] ✓ Using environment variable credentials (Render)")
        return _users_cache
    
    # Development fallback: create default users
    _users_cache = {
        "admin": {
            "password_hash": hash_password("admin123"),
            "type": "admin"
        },
        "demo": {
            "password_hash": hash_password("demo123"),
            "type": "demo"
        }
    }
    return _users_cache


def verify_credentials(
    credentials: HTTPBasicCredentials = Depends(security)
) -> str:
    """
    Verify HTTP Basic Auth credentials and return user type.
    
    Returns:
        str: "admin" or "demo"
    
    Raises:
        HTTPException: 401 if credentials are invalid
    """
    users = load_users()
    username = credentials.username
    password = credentials.password
    
    # Check if user exists
    if username not in users:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    
    # Verify password
    user = users[username]
    if not verify_password(password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    
    return user["type"]


def get_current_user(user_type: str = Depends(verify_credentials)) -> str:
    """
    Dependency to get current authenticated user type.
    Use this in your endpoints.
    """
    return user_type
