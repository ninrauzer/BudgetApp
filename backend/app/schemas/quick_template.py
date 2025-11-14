"""
QuickTemplate Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, Field
from typing import Literal


class QuickTemplateBase(BaseModel):
    """Base schema for QuickTemplate."""
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=255)
    amount: float = Field(..., gt=0)
    type: Literal["income", "expense"] = "expense"
    category_id: int


class QuickTemplateCreate(QuickTemplateBase):
    """Schema for creating a new quick template."""
    pass


class QuickTemplateUpdate(QuickTemplateBase):
    """Schema for updating an existing quick template."""
    pass


class QuickTemplateResponse(QuickTemplateBase):
    """Schema for quick template response."""
    id: int
    category_name: str | None = None
    category_icon: str | None = None

    class Config:
        from_attributes = True
