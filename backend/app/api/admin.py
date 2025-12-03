"""
Admin API Router
Manage allowed users (whitelist) - Only accessible by admin users
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional

from app.db.database import get_db
from app.oauth import get_current_user
from app.models.user import User, AllowedUser

router = APIRouter(prefix="/api/admin", tags=["Admin"])


class AllowedUserCreate(BaseModel):
    """Request to add new allowed user"""
    email: EmailStr
    name: Optional[str] = None


class AllowedUserResponse(BaseModel):
    """Response with allowed user info"""
    id: int
    email: str
    name: Optional[str]
    is_active: bool
    added_at: str
    added_by: Optional[str]
    
    class Config:
        from_attributes = True


def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to verify current user is admin.
    Raises 403 if not admin.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado. Se requieren privilegios de administrador."
        )
    return current_user


@router.get("/allowed-users", response_model=List[AllowedUserResponse])
async def list_allowed_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    List all allowed users in whitelist.
    Only accessible by admin users.
    """
    allowed_users = db.query(AllowedUser).order_by(AllowedUser.added_at.desc()).all()
    
    return [
        AllowedUserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            is_active=user.is_active,
            added_at=user.added_at.isoformat() if user.added_at else "",
            added_by=user.added_by
        )
        for user in allowed_users
    ]


@router.post("/allowed-users", response_model=AllowedUserResponse)
async def add_allowed_user(
    user_data: AllowedUserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Add new user to whitelist.
    Only accessible by admin users.
    """
    # Check if user already exists
    existing = db.query(AllowedUser).filter(AllowedUser.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"El usuario {user_data.email} ya está en la lista de autorizados"
        )
    
    # Create new allowed user
    new_allowed_user = AllowedUser(
        email=user_data.email,
        name=user_data.name or user_data.email.split('@')[0],
        is_active=True,
        added_by=current_user.email
    )
    
    db.add(new_allowed_user)
    db.commit()
    db.refresh(new_allowed_user)
    
    print(f"[admin] ✅ User added to whitelist: {user_data.email} by {current_user.email}")
    
    return AllowedUserResponse(
        id=new_allowed_user.id,
        email=new_allowed_user.email,
        name=new_allowed_user.name,
        is_active=new_allowed_user.is_active,
        added_at=new_allowed_user.added_at.isoformat() if new_allowed_user.added_at else "",
        added_by=new_allowed_user.added_by
    )


@router.put("/allowed-users/{user_id}/toggle")
async def toggle_allowed_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Toggle is_active status of allowed user (activate/deactivate).
    Only accessible by admin users.
    """
    allowed_user = db.query(AllowedUser).filter(AllowedUser.id == user_id).first()
    
    if not allowed_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Prevent disabling yourself
    if allowed_user.email == current_user.email:
        raise HTTPException(
            status_code=400,
            detail="No puedes desactivar tu propia cuenta"
        )
    
    # Toggle status
    allowed_user.is_active = not allowed_user.is_active
    db.commit()
    db.refresh(allowed_user)
    
    status = "activado" if allowed_user.is_active else "desactivado"
    print(f"[admin] User {status}: {allowed_user.email} by {current_user.email}")
    
    return {
        "success": True,
        "email": allowed_user.email,
        "is_active": allowed_user.is_active,
        "message": f"Usuario {status} exitosamente"
    }


@router.delete("/allowed-users/{user_id}")
async def delete_allowed_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Permanently delete allowed user from whitelist.
    Only accessible by admin users.
    WARNING: This is a hard delete, user will be completely removed.
    """
    allowed_user = db.query(AllowedUser).filter(AllowedUser.id == user_id).first()
    
    if not allowed_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Prevent deleting yourself
    if allowed_user.email == current_user.email:
        raise HTTPException(
            status_code=400,
            detail="No puedes eliminar tu propia cuenta"
        )
    
    email = allowed_user.email
    db.delete(allowed_user)
    db.commit()
    
    print(f"[admin] ⚠️  User deleted from whitelist: {email} by {current_user.email}")
    
    return {
        "success": True,
        "email": email,
        "message": "Usuario eliminado de la lista de autorizados"
    }


@router.get("/stats")
async def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get admin statistics about users and whitelist.
    Only accessible by admin users.
    """
    total_allowed = db.query(AllowedUser).count()
    active_allowed = db.query(AllowedUser).filter(AllowedUser.is_active == True).count()
    inactive_allowed = total_allowed - active_allowed
    
    total_users = db.query(User).count()
    admin_users = db.query(User).filter(User.is_admin == True).count()
    
    return {
        "whitelist": {
            "total": total_allowed,
            "active": active_allowed,
            "inactive": inactive_allowed
        },
        "users": {
            "total": total_users,
            "admins": admin_users,
            "regular": total_users - admin_users
        }
    }
