"""
Budget Plans Router
Endpoints para gestión de planes presupuestarios basados en ciclos de facturación
"""
from typing import List, Dict, Any, Optional
from datetime import date, datetime, timedelta
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
from app.services.billing_cycle import get_cycle_dates, get_cycle_for_date, MONTH_NAMES, _safe_date
from dateutil.relativedelta import relativedelta

router = APIRouter(
    prefix="/budget-plans",
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


class CloneYearRequest(BaseModel):
    """Schema para clonar todos los presupuestos de un año a otro"""
    source_year: int
    target_year: int
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
    Retorna: { 
        amounts: { cycle_name: { category_id: amount } },
        notes: { cycle_name: { category_id: note } }
    }
    """
    # Obtener todos los ciclos del año
    cycle_names = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]
    
    # Obtener todos los planes del año
    # Filtramos por end_date porque el ciclo "Enero 2026" termina en 2026
    # aunque comience en diciembre 2025
    plans = db.query(BudgetPlan).filter(
        extract('year', BudgetPlan.end_date) == year
    ).all()
    
    # Organizar en estructura de grid
    amounts_data = {}
    notes_data = {}
    for cycle_name in cycle_names:
        amounts_data[cycle_name] = {}
        notes_data[cycle_name] = {}
    
    for plan in plans:
        if plan.cycle_name in amounts_data:
            amounts_data[plan.cycle_name][str(plan.category_id)] = plan.amount
            if plan.notes:
                notes_data[plan.cycle_name][str(plan.category_id)] = plan.notes
    
    return {
        "amounts": amounts_data,
        "notes": notes_data
    }


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


@router.post("/clone/year")
def clone_year_budget(
    data: CloneYearRequest,
    db: Session = Depends(get_db)
):
    """
    Clonar todos los presupuestos de un año a otro año
    """
    # Obtener todos los planes del año origen
    # Filtramos por end_date porque el ciclo "Enero" termina en ese año
    source_plans = db.query(BudgetPlan).filter(
        extract('year', BudgetPlan.end_date) == data.source_year
    ).all()
    
    if not source_plans:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No budget data found for year {data.source_year}"
        )
    
    created_count = 0
    updated_count = 0
    skipped_count = 0
    
    # Procesar cada plan del año origen
    for source_plan in source_plans:
        # Calcular las fechas del ciclo en el año destino
        cycle_dates = get_cycle_dates(source_plan.cycle_name, db)
        if not cycle_dates:
            continue
        
        # Ajustar las fechas al año destino
        year_diff = data.target_year - data.source_year
        target_start_date = source_plan.start_date + relativedelta(years=year_diff)
        target_end_date = source_plan.end_date + relativedelta(years=year_diff)
        
        # Buscar si ya existe un presupuesto para ese ciclo/categoría en el año destino
        # Usamos end_date para la comparación de año
        existing_plan = db.query(BudgetPlan).filter(
            and_(
                BudgetPlan.cycle_name == source_plan.cycle_name,
                BudgetPlan.category_id == source_plan.category_id,
                extract('year', BudgetPlan.end_date) == data.target_year
            )
        ).first()
        
        if existing_plan:
            if data.overwrite:
                existing_plan.amount = source_plan.amount
                existing_plan.notes = source_plan.notes
                existing_plan.start_date = target_start_date
                existing_plan.end_date = target_end_date
                updated_count += 1
            else:
                skipped_count += 1
        else:
            # Crear nuevo plan en el año destino
            new_plan = BudgetPlan(
                cycle_name=source_plan.cycle_name,
                start_date=target_start_date,
                end_date=target_end_date,
                category_id=source_plan.category_id,
                amount=source_plan.amount,
                notes=source_plan.notes
            )
            db.add(new_plan)
            created_count += 1
    
    db.commit()
    
    return {
        "success": True,
        "source_year": data.source_year,
        "target_year": data.target_year,
        "created": created_count,
        "updated": updated_count,
        "skipped": skipped_count
    }


# ============================================================================
# COMPARACIÓN CON REAL (PARA ANALYSIS PAGE)
# ============================================================================

@router.get("/comparison/{cycle_name}")
def get_budget_vs_actual(
    cycle_name: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Comparar presupuesto vs gastos/ingresos reales de un ciclo
    Retorna datos para mostrar en Analysis page
    
    Si se proveen start_date y end_date, se usan directamente.
    Si no, se calculan basándose en el cycle_name y billing_cycle_start_day.
    """
    # Obtener planes del ciclo
    plans = db.query(BudgetPlan).filter(
        BudgetPlan.cycle_name == cycle_name
    ).all()

    # (debug logs removidos)
    
    if not plans:
        return {
            "cycle_name": cycle_name,
            "start_date": None,
            "end_date": None,
            "categories": [],
            "summary": {
                "total_budgeted_income": 0,
                "total_actual_income": 0,
                "total_budgeted_expense": 0,
                "total_actual_expense": 0,
                "total_budgeted_saving": 0,
                "total_actual_saving": 0,
                "overall_compliance": 0
            }
        }
    
    # Obtener fechas del ciclo
    if start_date and end_date:
        # Usar fechas provistas directamente (ya consideran overrides)
        cycle_start = datetime.strptime(start_date, "%Y-%m-%d")
        cycle_end = datetime.strptime(end_date, "%Y-%m-%d")
    else:
        # Calcular fechas usando el método antiguo (legacy)
        # Obtener el billing cycle de la BD
        from app.models.billing_cycle import BillingCycle
        billing_cycle = db.query(BillingCycle).filter(BillingCycle.is_active == True).first()
        
        if not billing_cycle:
            # Default to day 1 if no billing cycle found
            billing_cycle_start_day = 1
        else:
            billing_cycle_start_day = billing_cycle.start_day
        
        # Validar nombre del ciclo
        if cycle_name not in MONTH_NAMES:
            return {
                "cycle_name": cycle_name,
                "start_date": None,
                "end_date": None,
                "categories": [],
                "summary": {
                    "total_budgeted_income": 0,
                    "total_actual_income": 0,
                    "total_budgeted_expense": 0,
                    "total_actual_expense": 0,
                    "total_budgeted_saving": 0,
                    "total_actual_saving": 0,
                    "overall_compliance": 0
                }
            }
        
        # Calcular fechas del ciclo usando el billing_cycle_start_day
        month_num = MONTH_NAMES.index(cycle_name) + 1
        current_date = datetime.now()
        year = current_date.year
        
        # El ciclo termina en el mes del cycle_name, el día antes del start_day
        from dateutil.relativedelta import relativedelta
        cycle_end_temp = _safe_date(year, month_num, billing_cycle_start_day)
        cycle_end = cycle_end_temp - timedelta(days=1)
        
        # El inicio es un mes antes del end_temp
        cycle_start = cycle_end_temp - relativedelta(months=1)
        
        # Si las fechas están en el futuro, ajustar al año pasado (normalizando tipos)
        if cycle_start.date() > current_date.date():
            cycle_start = (cycle_start - relativedelta(years=1))
            cycle_end = (cycle_end - relativedelta(years=1))
    
    cycle_dates = {
        "start_date": cycle_start,
        "end_date": cycle_end
    }
    
    # (debug cycle dates removidos)
    
    # Calcular gastos/ingresos reales por categoría
    # Importante: Transaction.date es Date (sin tiempo); las fechas del ciclo son datetimes.
    # Usar .date() para evitar exclusión silenciosa por comparación datetime vs date.
    _start_date = cycle_dates["start_date"].date() if hasattr(cycle_dates["start_date"], "date") else cycle_dates["start_date"]
    _end_date = cycle_dates["end_date"].date() if hasattr(cycle_dates["end_date"], "date") else cycle_dates["end_date"]
    actual_transactions = db.query(
        Transaction.category_id,
        func.sum(Transaction.amount_pen).label('total_amount')
    ).filter(
        and_(
            Transaction.date >= _start_date,
                Transaction.date <= _end_date,
                Transaction.transaction_type != 'transfer'
        )
    ).group_by(Transaction.category_id).all()
    # (debug salario removido)
    
    # (debug transacciones removido)
    
    # Crear mapa de reales
    actual_map = {t.category_id: t.total_amount for t in actual_transactions}

    # Obtener TODAS las categorías activas para calcular totales correctos
    from app.models.category import Category
    all_active_categories = db.query(Category).filter(Category.is_active == True).all()
    
    # Crear mapa de categorías (para acceso rápido)
    category_map = {cat.id: cat for cat in all_active_categories}
    
    # Crear mapa de planes (para acceso rápido)
    plan_map = {}
    seen_plan_categories = set()
    for plan in plans:
        if plan.category_id not in seen_plan_categories:
            plan_map[plan.category_id] = plan
            seen_plan_categories.add(plan.category_id)
    
    # Inicializar sumarios
    total_budgeted_income = 0
    total_actual_income = 0
    total_budgeted_expense = 0
    total_actual_expense = 0
    
    # Calcular totales presupuestados usando TODAS las categorías activas
    for category in all_active_categories:
        plan = plan_map.get(category.id)
        budgeted_amount = plan.amount if plan else 0
        
        if category.type == "income":
            total_budgeted_income += budgeted_amount
        else:  # expense
            total_budgeted_expense += budgeted_amount
    
    # Debug log (temporal)
    print(f"DEBUG: Total categorías activas: {len(all_active_categories)}")
    print(f"DEBUG: Categorías con plan: {len(plan_map)}")
    print(f"DEBUG: Total budgeted expense: {total_budgeted_expense}")
    print(f"DEBUG: Total budgeted income: {total_budgeted_income}")
    
    # Calcular totales reales usando el mapa de categorías
    for category_id, actual_amount in actual_map.items():
        category = category_map.get(category_id)
        if category:
            if category.type == "income":
                total_actual_income += actual_amount
            else:  # expense
                total_actual_expense += actual_amount
    
    # Combinar datos para retornar (solo categorías con plan o con transacciones)
    categories_data = []
    seen_categories = set()
    
    # Primero agregar categorías que tienen plan
    for plan in plans:
        # Skip duplicates (same category_id)
        if plan.category_id in seen_categories:
            continue
        seen_categories.add(plan.category_id)
        
        budgeted = plan.amount
        actual = actual_map.get(plan.category_id, 0)
        variance = budgeted - actual
        variance_percentage = (variance / budgeted * 100) if budgeted != 0 else 0
        compliance_percentage = (actual / budgeted * 100) if budgeted != 0 else 0
        
        category_type = plan.category.type if plan.category else "expense"
        
        # No acumular en totales aquí - ya se calcularon arriba
        
        categories_data.append({
            "category_id": plan.category_id,
            "category_name": plan.category.name if plan.category else "Unknown",
            "category_icon": plan.category.icon if plan.category else "help-circle",
            "category_type": category_type,
            "budgeted": budgeted,
            "actual": actual,
            "variance": variance,
            "variance_percentage": round(variance_percentage, 1),
            "compliance_percentage": round(compliance_percentage, 1)
        })
    
    # Calcular ahorros
    total_budgeted_saving = total_budgeted_income - total_budgeted_expense
    total_actual_saving = total_actual_income - total_actual_expense
    
    # Calcular compliance general
    total_budgeted = total_budgeted_income + total_budgeted_expense
    total_actual = total_actual_income + total_actual_expense
    overall_compliance = (total_actual / total_budgeted * 100) if total_budgeted != 0 else 0
    
    return {
        "cycle_name": cycle_name,
        "start_date": cycle_dates["start_date"].isoformat(),
        "end_date": cycle_dates["end_date"].isoformat(),
        "categories": categories_data,
        "summary": {
            "total_budgeted_income": total_budgeted_income,
            "total_actual_income": total_actual_income,
            "total_budgeted_expense": total_budgeted_expense,
            "total_actual_expense": total_actual_expense,
            "total_budgeted_saving": total_budgeted_saving,
            "total_actual_saving": total_actual_saving,
            "overall_compliance": round(overall_compliance, 1)
        }
    }
