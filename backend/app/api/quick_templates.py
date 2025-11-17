"""
Quick Templates API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.quick_template import QuickTemplate
from app.schemas.quick_template import QuickTemplateCreate, QuickTemplateUpdate, QuickTemplateResponse

# Align with other routers that use /api/... prefix
router = APIRouter(prefix="/api/quick-templates", tags=["quick-templates"])


@router.get("/", response_model=List[QuickTemplateResponse])
def get_all_templates(db: Session = Depends(get_db)):
    """Get all quick templates."""
    templates = db.query(QuickTemplate).all()
    
    # Add category info
    result = []
    for template in templates:
        template_dict = {
            "id": template.id,
            "name": template.name,
            "description": template.description,
            "amount": template.amount,
            "type": template.type,
            "category_id": template.category_id,
            "category_name": template.category.name if template.category else None,
            "category_icon": template.category.icon if template.category else None,
        }
        result.append(QuickTemplateResponse(**template_dict))
    
    return result


@router.get("/{template_id}", response_model=QuickTemplateResponse)
def get_template(template_id: int, db: Session = Depends(get_db)):
    """Get a specific quick template by ID."""
    template = db.query(QuickTemplate).filter(QuickTemplate.id == template_id).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template_dict = {
        "id": template.id,
        "name": template.name,
        "description": template.description,
        "amount": template.amount,
        "type": template.type,
        "category_id": template.category_id,
        "category_name": template.category.name if template.category else None,
        "category_icon": template.category.icon if template.category else None,
    }
    
    return QuickTemplateResponse(**template_dict)


@router.post("/", response_model=QuickTemplateResponse, status_code=201)
def create_template(template: QuickTemplateCreate, db: Session = Depends(get_db)):
    """Create a new quick template."""
    db_template = QuickTemplate(**template.model_dump())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    
    template_dict = {
        "id": db_template.id,
        "name": db_template.name,
        "description": db_template.description,
        "amount": db_template.amount,
        "type": db_template.type,
        "category_id": db_template.category_id,
        "category_name": db_template.category.name if db_template.category else None,
        "category_icon": db_template.category.icon if db_template.category else None,
    }
    
    return QuickTemplateResponse(**template_dict)


@router.put("/{template_id}", response_model=QuickTemplateResponse)
def update_template(
    template_id: int,
    template: QuickTemplateUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing quick template."""
    db_template = db.query(QuickTemplate).filter(QuickTemplate.id == template_id).first()
    
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    for key, value in template.model_dump().items():
        setattr(db_template, key, value)
    
    db.commit()
    db.refresh(db_template)
    
    template_dict = {
        "id": db_template.id,
        "name": db_template.name,
        "description": db_template.description,
        "amount": db_template.amount,
        "type": db_template.type,
        "category_id": db_template.category_id,
        "category_name": db_template.category.name if db_template.category else None,
        "category_icon": db_template.category.icon if db_template.category else None,
    }
    
    return QuickTemplateResponse(**template_dict)


@router.delete("/{template_id}", status_code=204)
def delete_template(template_id: int, db: Session = Depends(get_db)):
    """Delete a quick template."""
    db_template = db.query(QuickTemplate).filter(QuickTemplate.id == template_id).first()
    
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    db.delete(db_template)
    db.commit()
    
    return None
