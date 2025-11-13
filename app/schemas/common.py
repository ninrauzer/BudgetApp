"""
Common response schemas.
"""

from pydantic import BaseModel
from typing import Any, Optional


class SuccessResponse(BaseModel):
    """Standard success response."""
    success: bool = True
    data: Any
    message: str = "Operation successful"
    errors: list[str] = []


class ErrorResponse(BaseModel):
    """Standard error response."""
    success: bool = False
    data: Optional[Any] = None
    message: str
    errors: list[str]


class PaginationMeta(BaseModel):
    """Pagination metadata."""
    page: int
    per_page: int
    total: int
    total_pages: int


class PaginatedResponse(BaseModel):
    """Paginated response wrapper."""
    success: bool = True
    data: list[Any]
    pagination: PaginationMeta
    message: str = "Operation successful"
