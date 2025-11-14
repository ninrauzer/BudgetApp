"""
Budget Plans Router
Endpoints para gestión de planes presupuestarios basados en ciclos de facturación
"""
from typing import List, Dict, Any
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, extract
from pydantic import BaseModel

from app.db.database import get_db
from app.models.budget_plan import BudgetPlan
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.budget_plan import (
    BudgetPlanCreate,
    BudgetPlanUpdate,
    BudgetPlanResponse
)
from app.services.billing_cycle import get_cycle_dates

router = APIRouter(
    prefix="/api/budget-plans",
    tags=["budget-plans"]
)


# ============================================================================
# SCHEMAS
# ============================================================================

class BudgetCellUpdate(BaseModel):
    """Schema para actualizar una celda individual del presupuesto"""
    cycle_name: str
    category_id: int
    amount: float
    notes: str | None = None


class BulkBudgetUpdate(BaseModel):
    """Schema para actualizar múltiples presupuestos de un ciclo"""
    cycle_name: str
    budgets: List[Dict[str, Any]]  # [{ category_id, amount, notes }]


class CopyCycleRequest(BaseModel):
    """Schema para copiar presupuesto de un ciclo a otros"""
    source_cycle_name: str
    target_cycle_names: List[str]
    overwrite: bool = False  # Si True, sobrescribe existentes


class CopyCategoryRequest(BaseModel):
    """Schema para copiar una categoría a todos los ciclos"""
    category_id: int
    source_cycle_name: str
    target_cycle_names: List[str]
    overwrite: bool = False


# ============================================================================
# CRUD BÁSICO
# ============================================================================

@router.get("", response_model=List[BudgetPlanResponse])
def list_budget_plans(
    cycle_name: str = None,
    category_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Obtener lista de planes presupuestarios con filtros opcionales
    """
    query = db.query(BudgetPlan)
    
    if cycle_name:
        query = query.filter(BudgetPlan.cycle_name == cycle_name)
    if category_id:
        query = query.filter(BudgetPlan.category_id == category_id)
    
    plans = query.offset(skip).limit(limit).all()
    return plans


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
    
    # Verificar que no existe ya un plan para ese ciclo/categoría
    existing_plan = db.query(BudgetPlan).filter(
        and_(
            BudgetPlan.cycle_name == plan.cycle_name,
            BudgetPlan.category_id == plan.category_id
        )
    ).first()
    
    if existing_plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Budget plan already exists for cycle '{plan.cycle_name}' and category {plan.category_id}"
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
    
    # Si se cambia cycle_name/categoría, verificar unicidad
    if any(field in update_data for field in ["cycle_name", "category_id"]):
        new_cycle = update_data.get("cycle_name", db_plan.cycle_name)
        new_category = update_data.get("category_id", db_plan.category_id)
        
        existing_plan = db.query(BudgetPlan).filter(
            and_(
                BudgetPlan.id != plan_id,
                BudgetPlan.cycle_name == new_cycle,
                BudgetPlan.category_id == new_category
            )
        ).first()
        
        if existing_plan:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Budget plan already exists for cycle '{new_cycle}' and category {new_category}"
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


# ============================================================================
# VISTA POR CICLO (MENSUAL)
# ============================================================================

@router.get("/cycle/{cycle_name}", response_model=List[BudgetPlanResponse])
def get_budget_by_cycle(
    cycle_name: str,
    db: Session = Depends(get_db)
):
    """
    Obtener todos los planes presupuestarios para un ciclo específico
    Útil para la vista mensual
    """
    plans = db.query(BudgetPlan).filter(
        BudgetPlan.cycle_name == cycle_name
    ).all()
    
    return plans


@router.post("/cycle/bulk")
def save_cycle_budget_bulk(
    data: BulkBudgetUpdate,
    db: Session = Depends(get_db)
):
    """
    Guardar presupuesto completo de un ciclo (múltiples categorías a la vez)
    """
    # Calcular fechas del ciclo
    cycle_dates = get_cycle_dates(data.cycle_name, db)
    if not cycle_dates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid cycle name: {data.cycle_name}"
        )
    
    created_count = 0
    updated_count = 0
    
    for budget_data in data.budgets:
        category_id = budget_data.get("category_id")
        amount = budget_data.get("amount", 0)
        notes = budget_data.get("notes")
        
        # Buscar plan existente
        existing_plan = db.query(BudgetPlan).filter(
            and_(
                BudgetPlan.cycle_name == data.cycle_name,
                BudgetPlan.category_id == category_id
            )
        ).first()
        
        if existing_plan:
            # Actualizar
            existing_plan.amount = amount
            if notes is not None:
                existing_plan.notes = notes
            updated_count += 1
        else:
            # Crear nuevo
            new_plan = BudgetPlan(
                cycle_name=data.cycle_name,
                start_date=cycle_dates["start_date"],
                end_date=cycle_dates["end_date"],
                category_id=category_id,
                amount=amount,
                notes=notes
            )
            db.add(new_plan)
            created_count += 1
    
    db.commit()
    
    return {
        "success": True,
        "created": created_count,
        "updated": updated_count
    }


# ============================================================================
# VISTA ANUAL
# ============================================================================

@router.get("/annual/{year}")
def get_annual_budget(
    year: int,
    db: Session = Depends(get_db)
):
    """
    Obtener presupuesto de todo un año (12 ciclos) en formato grid
    Retorna: { cycle_name: { category_id: amount } }
    """
    # Obtener todos los ciclos del año
    cycle_names = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]
    
    # Obtener todos los planes del año
    plans = db.query(BudgetPlan).filter(
        extract('year', BudgetPlan.start_date) == year
    ).all()
    
    # Organizar en estructura de grid
    annual_data = {}
    for cycle_name in cycle_names:
        annual_data[cycle_name] = {}
    
    for plan in plans:
        if plan.cycle_name in annual_data:
            annual_data[plan.cycle_name][plan.category_id] = {
                "id": plan.id,
                "amount": plan.amount,
                "notes": plan.notes
            }
    
    return annual_data


@router.post("/cell/update")
def update_budget_cell(
    data: BudgetCellUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualizar una celda individual del grid anual
    """
    # Calcular fechas del ciclo
    cycle_dates = get_cycle_dates(data.cycle_name, db)
    if not cycle_dates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid cycle name: {data.cycle_name}"
        )
    
    # Buscar plan existente
    existing_plan = db.query(BudgetPlan).filter(
        and_(
            BudgetPlan.cycle_name == data.cycle_name,
            BudgetPlan.category_id == data.category_id
        )
    ).first()
    
    if existing_plan:
        # Actualizar
        existing_plan.amount = data.amount
        if data.notes is not None:
            existing_plan.notes = data.notes
        db.commit()
        db.refresh(existing_plan)
        return existing_plan
    else:
        # Crear nuevo
        new_plan = BudgetPlan(
            cycle_name=data.cycle_name,
            start_date=cycle_dates["start_date"],
            end_date=cycle_dates["end_date"],
            category_id=data.category_id,
            amount=data.amount,
            notes=data.notes
        )
        db.add(new_plan)
        db.commit()
        db.refresh(new_plan)
        return new_plan


# ============================================================================
# FUNCIONES DE PRODUCTIVIDAD
# ============================================================================

@router.post("/copy/cycle")
def copy_cycle_to_cycles(
    data: CopyCycleRequest,
    db: Session = Depends(get_db)
):
    """
    Copiar presupuesto de un ciclo a otros ciclos
    """
    # Obtener planes del ciclo origen
    source_plans = db.query(BudgetPlan).filter(
        BudgetPlan.cycle_name == data.source_cycle_name
    ).all()
    
    if not source_plans:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No budget data found for cycle '{data.source_cycle_name}'"
        )
    
    copied_count = 0
    skipped_count = 0
    
    for target_cycle in data.target_cycle_names:
        # Calcular fechas del ciclo destino
        cycle_dates = get_cycle_dates(target_cycle, db)
        if not cycle_dates:
            continue
        
        for source_plan in source_plans:
            # Buscar si ya existe
            existing = db.query(BudgetPlan).filter(
                and_(
                    BudgetPlan.cycle_name == target_cycle,
                    BudgetPlan.category_id == source_plan.category_id
                )
            ).first()
            
            if existing:
                if data.overwrite:
                    existing.amount = source_plan.amount
                    existing.notes = source_plan.notes
                    copied_count += 1
                else:
                    skipped_count += 1
            else:
                new_plan = BudgetPlan(
                    cycle_name=target_cycle,
                    start_date=cycle_dates["start_date"],
                    end_date=cycle_dates["end_date"],
                    category_id=source_plan.category_id,
                    amount=source_plan.amount,
                    notes=source_plan.notes
                )
                db.add(new_plan)
                copied_count += 1
    
    db.commit()
    
    return {
        "success": True,
        "copied": copied_count,
        "skipped": skipped_count
    }


@router.post("/copy/category")
def copy_category_to_cycles(
    data: CopyCategoryRequest,
    db: Session = Depends(get_db)
):
    """
    Copiar una categoría específica a múltiples ciclos
    """
    # Obtener plan origen
    source_plan = db.query(BudgetPlan).filter(
        and_(
            BudgetPlan.cycle_name == data.source_cycle_name,
            BudgetPlan.category_id == data.category_id
        )
    ).first()
    
    if not source_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No budget found for category {data.category_id} in cycle '{data.source_cycle_name}'"
        )
    
    copied_count = 0
    skipped_count = 0
    
    for target_cycle in data.target_cycle_names:
        # Calcular fechas del ciclo destino
        cycle_dates = get_cycle_dates(target_cycle, db)
        if not cycle_dates:
            continue
        
        # Buscar si ya existe
        existing = db.query(BudgetPlan).filter(
            and_(
                BudgetPlan.cycle_name == target_cycle,
                BudgetPlan.category_id == data.category_id
            )
        ).first()
        
        if existing:
            if data.overwrite:
                existing.amount = source_plan.amount
                existing.notes = source_plan.notes
                copied_count += 1
            else:
                skipped_count += 1
        else:
            new_plan = BudgetPlan(
                cycle_name=target_cycle,
                start_date=cycle_dates["start_date"],
                end_date=cycle_dates["end_date"],
                category_id=data.category_id,
                amount=source_plan.amount,
                notes=source_plan.notes
            )
            db.add(new_plan)
            copied_count += 1
    
    db.commit()
    
    return {
        "success": True,
        "copied": copied_count,
        "skipped": skipped_count
    }


@router.delete("/cycle/{cycle_name}")
def clear_cycle(
    cycle_name: str,
    db: Session = Depends(get_db)
):
    """
    Limpiar todos los presupuestos de un ciclo
    """
    deleted_count = db.query(BudgetPlan).filter(
        BudgetPlan.cycle_name == cycle_name
    ).delete()
    
    db.commit()
    
    return {
        "success": True,
        "deleted": deleted_count
    }


# ============================================================================
# COMPARACIÓN CON REAL (PARA ANALYSIS PAGE)
# ============================================================================

@router.get("/comparison/{cycle_name}")
def get_budget_vs_actual(
    cycle_name: str,
    db: Session = Depends(get_db)
):
    """
    Comparar presupuesto vs gastos/ingresos reales de un ciclo
    Retorna datos para mostrar en Analysis page
    """
    # Obtener planes del ciclo
    plans = db.query(BudgetPlan).filter(
        BudgetPlan.cycle_name == cycle_name
    ).all()
    
    if not plans:
        return []
    
    # Obtener fechas del ciclo
    cycle_dates = get_cycle_dates(cycle_name, db)
    if not cycle_dates:
        return []
    
    # Calcular gastos/ingresos reales por categoría
    actual_transactions = db.query(
        Transaction.category_id,
        func.sum(Transaction.amount).label('total_amount')
    ).filter(
        and_(
            Transaction.date >= cycle_dates["start_date"],
            Transaction.date <= cycle_dates["end_date"]
        )
    ).group_by(Transaction.category_id).all()
    
    # Crear mapa de reales
    actual_map = {t.category_id: t.total_amount for t in actual_transactions}
    
    # Combinar datos
    comparison_data = []
    for plan in plans:
        budgeted = plan.amount
        actual = actual_map.get(plan.category_id, 0)
        difference = budgeted - actual
        percentage = (actual / budgeted * 100) if budgeted > 0 else 0
        
        comparison_data.append({
            "category_id": plan.category_id,
            "category_name": plan.category.name if plan.category else "Unknown",
            "category_icon": plan.category.icon if plan.category else "help-circle",
            "category_type": plan.category.type if plan.category else "expense",
            "budgeted": budgeted,
            "actual": actual,
            "difference": difference,
            "percentage": round(percentage, 1),
            "status": "exceeded" if actual > budgeted else "within" if actual > budgeted * 0.8 else "good"
        })
    
    return comparison_data
