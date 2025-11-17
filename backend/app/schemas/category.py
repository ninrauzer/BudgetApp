"""
Category Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class CategoryBase(BaseModel):
    """Base schema for Category."""
    name: str = Field(..., min_length=1, max_length=100)
    type: Literal["income", "expense", "saving"]
    parent_id: Optional[int] = None
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = None
    description: Optional[str] = Field(None, max_length=255)
    expense_type: Optional[Literal["fixed", "variable"]] = None  # Only for expense categories


class CategoryCreate(CategoryBase):
    """Schema for creating a new category."""
    pass


class CategoryUpdate(CategoryBase):
    """Schema for updating an existing category."""
    pass


class CategoryResponse(CategoryBase):
    """Schema for category response."""
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2 (before: orm_mode = True)


class CategoryWithSubcategories(CategoryResponse):
    """Schema for category with its subcategories."""
    subcategories: list["CategoryResponse"] = []

    class Config:
        from_attributes = True
