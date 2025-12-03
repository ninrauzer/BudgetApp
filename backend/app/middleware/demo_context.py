"""
Middleware to detect demo users and set database context
"""
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.db.session_manager import set_demo_context
from app.oauth import decode_token
import os


class DemoContextMiddleware(BaseHTTPMiddleware):
    """
    Middleware that checks if the current user is a demo user
    and sets the appropriate database context.
    """
    
    async def dispatch(self, request: Request, call_next):
        # Reset to production by default
        set_demo_context(False)
        
        # Check if user has JWT token
        auth_header = request.headers.get("Authorization")
        
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
            try:
                # Decode JWT token
                payload = decode_token(token)
                email = payload.get("email")
                
                # Check if this is demo user
                if email == "demo@budgetapp.local":
                    set_demo_context(True)
                    print(f"[DB] Demo context activated for {email}")
                else:
                    print(f"[DB] Production context for {email}")
            except Exception as e:
                # Invalid token or error - default to production
                print(f"[DB] Token decode error: {e}")
                pass
        
        response = await call_next(request)
        return response
