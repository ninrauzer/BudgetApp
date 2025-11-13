"""
Budget Plans Router
Endpoints para gestión de planes presupuestarios mensuales
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from pydantic import BaseModel

from app.db.database import get_db
from app.models.budget_plan import BudgetPlan
from app.models.category import Category
from app.schemas.budget_plan import (
    BudgetPlanCreate,
    BudgetPlanUpdate,
    BudgetPlanResponse
)

router = APIRouter(
    prefix="/api/budget-plans",
    tags=["budget-plans"]
)


@router.get("", response_model=List[BudgetPlanResponse])
def list_budget_plans(
    year: int = None,
    month: int = None,
    category_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Obtener lista de planes presupuestarios con filtros opcionales
    """
    query = db.query(BudgetPlan)
    
    if year:
        query = query.filter(BudgetPlan.year == year)
    if month:
        query = query.filter(BudgetPlan.month == month)
    if category_id:
        query = query.filter(BudgetPlan.category_id == category_id)
    
    plans = query.offset(skip).limit(limit).all()
    return plans


# Schemas for annual budget
class CellUpdateRequest(BaseModel):
    category_id: int
    year: int
    month: int
    amount: float


class CopyMonthRequest(BaseModel):
    year: int
    from_month: int


@router.post("/update-cell")
def update_budget_cell(request: CellUpdateRequest, db: Session = Depends(get_db)):
    """
    Actualizar o crear una celda del presupuesto anual
    """
    # Buscar plan existente
    existing_plan = db.query(BudgetPlan).filter(
        and_(
            BudgetPlan.year == request.year,
            BudgetPlan.month == request.month,
            BudgetPlan.category_id == request.category_id
        )
    ).first()
    
    if existing_plan:
        # Actualizar
        existing_plan.amount = request.amount
        db.commit()
        db.refresh(existing_plan)
    else:
        # Crear nuevo
        new_plan = BudgetPlan(
            year=request.year,
            month=request.month,
            category_id=request.category_id,
            amount=request.amount
        )
        db.add(new_plan)
        db.commit()
        db.refresh(new_plan)
    
    return {"success": True}


@router.post("/copy-month")
def copy_month_to_all(request: CopyMonthRequest, db: Session = Depends(get_db)):
    """
    Copiar presupuestos de un mes a todos los meses siguientes del año
    """
    # Obtener planes del mes origen
    source_plans = db.query(BudgetPlan).filter(
        and_(
            BudgetPlan.year == request.year,
            BudgetPlan.month == request.from_month
        )
    ).all()
    
    if not source_plans:
        return {"success": False, "error": "No hay datos en el mes origen"}
    
    # Copiar a los meses siguientes
    copied_count = 0
    for month in range(request.from_month + 1, 13):
        for source_plan in source_plans:
            # Buscar si ya existe
            existing = db.query(BudgetPlan).filter(
                and_(
                    BudgetPlan.year == request.year,
                    BudgetPlan.month == month,
                    BudgetPlan.category_id == source_plan.category_id
                )
            ).first()
            
            if existing:
                existing.amount = source_plan.amount
            else:
                new_plan = BudgetPlan(
                    year=request.year,
                    month=month,
                    category_id=source_plan.category_id,
                    amount=source_plan.amount,
                    notes=source_plan.notes
                )
                db.add(new_plan)
            copied_count += 1
    
    db.commit()
    return {"success": True, "copied": copied_count}


@router.get("/{plan_id}", response_model=BudgetPlanResponse)
def get_budget_plan(plan_id: int, db: Session = Depends(get_db)):
    """
    Obtener un plan presupuestario específico por ID
    """
    plan = db.query(BudgetPlan).filter(BudgetPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Budget plan with id {plan_id} not found"
        )
    return plan


@router.post("", response_model=BudgetPlanResponse, status_code=status.HTTP_201_CREATED)
def create_budget_plan(plan: BudgetPlanCreate, db: Session = Depends(get_db)):
    """
    Crear un nuevo plan presupuestario
    """
    # Validar que la categoría existe
    category = db.query(Category).filter(Category.id == plan.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id {plan.category_id} not found"
        )
    
    # Verificar que no existe ya un plan para ese año/mes/categoría
    existing_plan = db.query(BudgetPlan).filter(
        and_(
            BudgetPlan.year == plan.year,
            BudgetPlan.month == plan.month,
            BudgetPlan.category_id == plan.category_id
        )
    ).first()
    
    if existing_plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Budget plan already exists for {plan.year}-{plan.month:02d} and category {plan.category_id}"
        )
    
    # Crear el plan presupuestario
    db_plan = BudgetPlan(**plan.model_dump())
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan


@router.put("/{plan_id}", response_model=BudgetPlanResponse)
def update_budget_plan(
    plan_id: int,
    plan_update: BudgetPlanUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualizar un plan presupuestario existente
    """
    db_plan = db.query(BudgetPlan).filter(BudgetPlan.id == plan_id).first()
    if not db_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Budget plan with id {plan_id} not found"
        )
    
    # Actualizar solo los campos proporcionados
    update_data = plan_update.model_dump(exclude_unset=True)
    
    # Si se cambia la categoría, validar que existe
    if "category_id" in update_data:
        category = db.query(Category).filter(Category.id == update_data["category_id"]).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category with id {update_data['category_id']} not found"
            )
    
    # Si se cambia año/mes/categoría, verificar unicidad
    if any(field in update_data for field in ["year", "month", "category_id"]):
        new_year = update_data.get("year", db_plan.year)
        new_month = update_data.get("month", db_plan.month)
        new_category = update_data.get("category_id", db_plan.category_id)
        
        existing_plan = db.query(BudgetPlan).filter(
            and_(
                BudgetPlan.id != plan_id,
                BudgetPlan.year == new_year,
                BudgetPlan.month == new_month,
                BudgetPlan.category_id == new_category
            )
        ).first()
        
        if existing_plan:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Budget plan already exists for {new_year}-{new_month:02d} and category {new_category}"
            )
    
    for field, value in update_data.items():
        setattr(db_plan, field, value)
    
    db.commit()
    db.refresh(db_plan)
    return db_plan


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget_plan(plan_id: int, db: Session = Depends(get_db)):
    """
    Eliminar un plan presupuestario
    """
    db_plan = db.query(BudgetPlan).filter(BudgetPlan.id == plan_id).first()
    if not db_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Budget plan with id {plan_id} not found"
        )
    
    db.delete(db_plan)
    db.commit()
    return None


@router.get("/period/{year}/{month}", response_model=List[BudgetPlanResponse])
def get_budget_plans_by_period(
    year: int,
    month: int,
    db: Session = Depends(get_db)
):
    """
    Obtener todos los planes presupuestarios para un período específico (año/mes)
    """
    plans = db.query(BudgetPlan).filter(
        and_(
            BudgetPlan.year == year,
            BudgetPlan.month == month
        )
    ).all()
    
    return plans
