"""
HTTP Basic Authentication Middleware for BudgetApp

Users:
- admin: Real data from Supabase
- demo: Obfuscated demo data

Environment Variables Required:
- ADMIN_USERNAME (default: admin)
- ADMIN_PASSWORD (default: changeme)
- DEMO_USERNAME (default: demo)  
- DEMO_PASSWORD (default: demo123)
"""
import os
import secrets
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

security = HTTPBasic()

# Load credentials from environment
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "changeme")
DEMO_USERNAME = os.getenv("DEMO_USERNAME", "demo")
DEMO_PASSWORD = os.getenv("DEMO_PASSWORD", "demo123")


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
    # Check admin credentials
    is_admin_correct = (
        secrets.compare_digest(credentials.username, ADMIN_USERNAME) and
        secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    )
    
    # Check demo credentials
    is_demo_correct = (
        secrets.compare_digest(credentials.username, DEMO_USERNAME) and
        secrets.compare_digest(credentials.password, DEMO_PASSWORD)
    )
    
    if is_admin_correct:
        return "admin"
    elif is_demo_correct:
        return "demo"
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Basic"},
        )


def get_current_user(user_type: str = Depends(verify_credentials)) -> str:
    """
    Dependency to get current authenticated user type.
    Use this in your endpoints.
    """
    return user_type
