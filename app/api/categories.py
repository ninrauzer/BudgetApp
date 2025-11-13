"""
Categories API router.
Handles CRUD operations for categories.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.models.category import Category
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryWithSubcategories,
)

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=List[CategoryResponse])
def list_categories(
    type: Optional[str] = None,
    parent_id: Optional[int] = None,
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """
    List all categories with optional filters.
    
    - **type**: Filter by category type (income, expense, saving)
    - **parent_id**: Filter by parent category ID (null for root categories)
    - **include_inactive**: Include inactive/archived categories (default: False)
    """
    query = db.query(Category)
    
    # By default, only show active categories
    if not include_inactive:
        query = query.filter(Category.is_active == True)
    
    if type:
        query = query.filter(Category.type == type)
    
    if parent_id is not None:
        query = query.filter(Category.parent_id == parent_id)
    elif parent_id == "null":  # For root categories
        query = query.filter(Category.parent_id.is_(None))
    
    categories = query.all()
    return categories


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    """Get a specific category by ID."""
    category = db.query(Category).filter(Category.id == category_id).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )
    
    return category


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """
    Create a new category.
    
    - **name**: Category name (required)
    - **type**: Category type - income, expense, or saving (required)
    - **parent_id**: Parent category ID (optional, null for root)
    - **icon**: Emoji icon (optional)
    - **color**: Hex color code (optional)
    """
    # Validate parent exists if provided
    if category.parent_id:
        parent = db.query(Category).filter(Category.id == category.parent_id).first()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Parent category with id {category.parent_id} not found"
            )
        
        # Validate type matches parent
        if parent.type != category.type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category type must match parent category type ({parent.type})"
            )
    
    db_category = Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    
    return db_category


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category: CategoryUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing category."""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )
    
    # Validate parent if changed
    if category.parent_id and category.parent_id != db_category.parent_id:
        parent = db.query(Category).filter(Category.id == category.parent_id).first()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Parent category with id {category.parent_id} not found"
            )
    
    # Update fields
    for field, value in category.model_dump().items():
        setattr(db_category, field, value)
    
    db.commit()
    db.refresh(db_category)
    
    return db_category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    """
    Delete a category.
    Cannot delete categories with existing transactions.
    """
    db_category = db.query(Category).filter(Category.id == category_id).first()
    
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )
    
    # Check if category has transactions
    if db_category.transactions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete category with existing transactions"
        )
    
    # Check if category has subcategories
    if db_category.subcategories:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete category with subcategories"
        )
    
    db.delete(db_category)
    db.commit()
    
    return None


@router.patch("/{category_id}/toggle-active", response_model=CategoryResponse)
def toggle_category_active(category_id: int, db: Session = Depends(get_db)):
    """
    Toggle category active status (soft delete/restore).
    This preserves data integrity for historical transactions.
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )
    
    # Toggle active status
    category.is_active = not category.is_active
    
    db.commit()
    db.refresh(category)
    
    return category


@router.patch("/{category_id}/deactivate", response_model=CategoryResponse)
def deactivate_category(category_id: int, db: Session = Depends(get_db)):
    """
    Deactivate a category (soft delete).
    Category won't appear in dropdowns but historical data is preserved.
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )
    
    category.is_active = False
    
    db.commit()
    db.refresh(category)
    
    return category


@router.patch("/{category_id}/activate", response_model=CategoryResponse)
def activate_category(category_id: int, db: Session = Depends(get_db)):
    """
    Reactivate a previously deactivated category.
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {category_id} not found"
        )
    
    category.is_active = True
    
    db.commit()
    db.refresh(category)
    
    return category
