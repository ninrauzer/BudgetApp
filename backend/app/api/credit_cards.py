"""
Credit Cards API Endpoints
---------------------------
Gestión de tarjetas de crédito, estados de cuenta y compras en cuotas.

Basado en ADR-004: Sistema de Gestión de Tarjetas de Crédito
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal
from datetime import date

from app.db.database import get_db
from app.models.credit_card import CreditCard, CreditCardStatement, CreditCardInstallment
from app.schemas.credit_card import (
    CreditCardCreate,
    CreditCardUpdate,
    CreditCard as CreditCardSchema,
    CreditCardSummary,
    InstallmentCreate,
    InstallmentUpdate,
    Installment as InstallmentSchema,
    StatementCreate,
    Statement as StatementSchema,
    DebtEvolutionPoint,
    PayoffProjection,
    StatementUploadResponse,
)

router = APIRouter(prefix="/credit-cards", tags=["credit-cards"])


# ============================================================================
# Credit Card CRUD
# ============================================================================

@router.post("/", response_model=CreditCardSchema, status_code=status.HTTP_201_CREATED)
async def create_credit_card(
    card: CreditCardCreate,
    db: Session = Depends(get_db)
):
    """
    Crear nueva tarjeta de crédito
    
    Ejemplo:
        POST /api/credit-cards
        {
            "name": "BBVA Visa Signature",
            "bank": "BBVA",
            "card_type": "Visa",
            "last_four_digits": "0265",
            "credit_limit": 13000,
            "payment_due_day": 5,
            "statement_close_day": 10,
            "revolving_interest_rate": 44.99
        }
    """
    db_card = CreditCard(
        **card.model_dump(),
        available_credit=card.credit_limit,  # Inicialmente todo disponible
        current_balance=Decimal("0"),
        revolving_debt=Decimal("0")
    )
    
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    
    return db_card


@router.get("/", response_model=List[CreditCardSchema])
async def get_credit_cards(
    active_only: bool = Query(True, description="Mostrar solo tarjetas activas"),
    db: Session = Depends(get_db)
):
    """Listar todas las tarjetas de crédito"""
    query = db.query(CreditCard)
    
    if active_only:
        query = query.filter(CreditCard.is_active == True)
    
    cards = query.order_by(CreditCard.created_at.desc()).all()
    return cards


@router.get("/{card_id}", response_model=CreditCardSummary)
async def get_credit_card_summary(
    card_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtener resumen completo de una tarjeta
    
    Incluye:
    - Información de la tarjeta
    - Cuotas activas
    - Último estado de cuenta
    - Total de cuotas mensuales
    - Proyecciones de pago
    """
    # Buscar tarjeta
    card = db.query(CreditCard).filter(CreditCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    
    # Cuotas activas
    active_installments = db.query(CreditCardInstallment).filter(
        CreditCardInstallment.credit_card_id == card_id,
        CreditCardInstallment.is_active == True
    ).all()
    
    # Último estado de cuenta
    latest_statement = db.query(CreditCardStatement).filter(
        CreditCardStatement.credit_card_id == card_id
    ).order_by(CreditCardStatement.statement_date.desc()).first()
    
    # Calcular total de cuotas mensuales
    total_monthly = sum(inst.monthly_payment for inst in active_installments)
    
    # TODO: Calcular proyecciones (months_to_payoff_minimum, projected_interest_minimum)
    # Por ahora retornar None
    
    return CreditCardSummary(
        card=card,
        active_installments=active_installments,
        latest_statement=latest_statement,
        total_monthly_installments=total_monthly,
        months_to_payoff_minimum=None,
        projected_interest_minimum=None
    )


@router.put("/{card_id}", response_model=CreditCardSchema)
async def update_credit_card(
    card_id: int,
    card_update: CreditCardUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar información de tarjeta"""
    db_card = db.query(CreditCard).filter(CreditCard.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    
    # Actualizar campos proporcionados
    update_data = card_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_card, field, value)
    
    # Si se actualiza credit_limit, recalcular available_credit
    if "credit_limit" in update_data:
        db_card.available_credit = db_card.credit_limit - db_card.current_balance
    
    db.commit()
    db.refresh(db_card)
    
    return db_card


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_credit_card(
    card_id: int,
    db: Session = Depends(get_db)
):
    """
    Desactivar tarjeta (soft delete)
    
    La tarjeta no se elimina de la BD, solo se marca como inactiva.
    """
    db_card = db.query(CreditCard).filter(CreditCard.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    
    db_card.is_active = False
    db.commit()
    
    return None


# ============================================================================
# Installments (Cuotas)
# ============================================================================

@router.post("/{card_id}/installments", response_model=InstallmentSchema, status_code=status.HTTP_201_CREATED)
async def create_installment(
    card_id: int,
    installment: InstallmentCreate,
    db: Session = Depends(get_db)
):
    """
    Agregar nueva compra en cuotas
    
    Ejemplo:
        POST /api/credit-cards/1/installments
        {
            "concept": "BM Ferretería",
            "original_amount": 14610,
            "purchase_date": "2025-02-15",
            "current_installment": 4,
            "total_installments": 6,
            "monthly_payment": 258.80,
            "monthly_principal": 234.61,
            "monthly_interest": 24.19,
            "interest_rate": 17.63
        }
    """
    # Verificar que la tarjeta existe
    card = db.query(CreditCard).filter(CreditCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    
    # Calcular remaining_capital
    remaining_installments = installment.total_installments - installment.current_installment
    remaining_capital = (installment.original_amount * remaining_installments) / installment.total_installments
    
    # Crear cuota
    db_installment = CreditCardInstallment(
        credit_card_id=card_id,
        **installment.model_dump(exclude={"credit_card_id"}),
        remaining_capital=remaining_capital
    )
    
    db.add(db_installment)
    
    # Actualizar saldo de la tarjeta
    # installments_balance = suma de remaining_capital de todas las cuotas activas
    card.current_balance += remaining_capital
    card.available_credit = card.credit_limit - card.current_balance
    
    db.commit()
    db.refresh(db_installment)
    
    return db_installment


@router.get("/{card_id}/installments", response_model=List[InstallmentSchema])
async def get_installments(
    card_id: int,
    active_only: bool = Query(True, description="Mostrar solo cuotas activas"),
    db: Session = Depends(get_db)
):
    """Listar cuotas de una tarjeta"""
    query = db.query(CreditCardInstallment).filter(
        CreditCardInstallment.credit_card_id == card_id
    )
    
    if active_only:
        query = query.filter(CreditCardInstallment.is_active == True)
    
    installments = query.order_by(CreditCardInstallment.created_at.desc()).all()
    return installments


@router.put("/installments/{installment_id}", response_model=InstallmentSchema)
async def update_installment(
    installment_id: int,
    installment_update: InstallmentUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualizar cuota (típicamente para avanzar en el pago)
    
    Cuando se actualiza current_installment:
    - Recalcula remaining_capital
    - Si current_installment == total_installments → marca como completada
    """
    db_installment = db.query(CreditCardInstallment).filter(
        CreditCardInstallment.id == installment_id
    ).first()
    
    if not db_installment:
        raise HTTPException(status_code=404, detail="Cuota no encontrada")
    
    # Guardar valores anteriores para ajustar saldo de tarjeta
    old_remaining = db_installment.remaining_capital or Decimal("0")
    
    # Actualizar campos
    update_data = installment_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_installment, field, value)
    
    # Recalcular remaining_capital si cambió current_installment
    if "current_installment" in update_data:
        remaining_installments = db_installment.total_installments - db_installment.current_installment
        db_installment.remaining_capital = (
            db_installment.original_amount * remaining_installments
        ) / db_installment.total_installments
        
        # Si se completó, marcar como inactiva
        if db_installment.current_installment >= db_installment.total_installments:
            db_installment.is_active = False
            db_installment.completed_at = db.execute("SELECT CURRENT_TIMESTAMP").scalar()
    
    # Actualizar saldo de tarjeta
    card = db.query(CreditCard).filter(CreditCard.id == db_installment.credit_card_id).first()
    if card:
        new_remaining = db_installment.remaining_capital or Decimal("0")
        card.current_balance += (new_remaining - old_remaining)
        card.available_credit = card.credit_limit - card.current_balance
    
    db.commit()
    db.refresh(db_installment)
    
    return db_installment


# ============================================================================
# Statements (Estados de Cuenta)
# ============================================================================

@router.post("/{card_id}/statements", response_model=StatementSchema, status_code=status.HTTP_201_CREATED)
async def create_statement(
    card_id: int,
    statement: StatementCreate,
    db: Session = Depends(get_db)
):
    """
    Registrar nuevo estado de cuenta manualmente
    
    Al crear un statement, actualiza:
    - current_balance de la tarjeta
    - revolving_debt
    - available_credit
    """
    # Verificar que la tarjeta existe
    card = db.query(CreditCard).filter(CreditCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    
    # Crear statement
    db_statement = CreditCardStatement(
        credit_card_id=card_id,
        **statement.model_dump(exclude={"credit_card_id"})
    )
    
    db.add(db_statement)
    
    # Actualizar tarjeta
    card.current_balance = statement.new_balance
    card.revolving_debt = statement.revolving_balance
    card.available_credit = card.credit_limit - statement.new_balance
    
    db.commit()
    db.refresh(db_statement)
    
    return db_statement


@router.get("/{card_id}/statements", response_model=List[StatementSchema])
async def get_statements(
    card_id: int,
    limit: int = Query(12, description="Número máximo de estados de cuenta", ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Obtener historial de estados de cuenta (ordenado por fecha DESC)"""
    statements = db.query(CreditCardStatement).filter(
        CreditCardStatement.credit_card_id == card_id
    ).order_by(CreditCardStatement.statement_date.desc()).limit(limit).all()
    
    return statements


@router.post("/{card_id}/statements/upload", response_model=StatementUploadResponse)
async def upload_statement_pdf(
    card_id: int,
    file: UploadFile = File(..., description="PDF del estado de cuenta"),
    db: Session = Depends(get_db)
):
    """
    Subir PDF de estado de cuenta y procesarlo automáticamente con IA
    
    Proceso:
    1. Validar formato PDF
    2. Guardar archivo en storage
    3. Extraer texto con PyPDF2
    4. Parsear con GPT-4o (ADR-006)
    5. Crear Statement + actualizar Installments
    6. Actualizar saldo de tarjeta
    
    Estado: Pending implementation (ADR-006)
    """
    # TODO: Implementar en ADR-006
    raise HTTPException(
        status_code=501,
        detail="Upload de PDF pendiente de implementación (ver ADR-006)"
    )


# ============================================================================
# Analytics
# ============================================================================

@router.get("/{card_id}/analytics/evolution", response_model=List[DebtEvolutionPoint])
async def get_debt_evolution(
    card_id: int,
    months: int = Query(6, description="Número de meses a mostrar", ge=1, le=24),
    db: Session = Depends(get_db)
):
    """
    Obtener evolución de deuda en los últimos N meses
    
    Retorna array con:
    - Deuda total
    - Deuda revolvente
    - Deuda en cuotas
    - Pagos realizados
    - Intereses pagados
    - Capital pagado
    
    Estado: Pending implementation
    """
    # TODO: Implementar análisis de evolución histórica
    raise HTTPException(
        status_code=501,
        detail="Analytics de evolución pendiente de implementación"
    )


@router.get("/{card_id}/analytics/projection", response_model=PayoffProjection)
async def get_payoff_projection(
    card_id: int,
    monthly_payment: Decimal = Query(..., description="Pago mensual propuesto", gt=0),
    db: Session = Depends(get_db)
):
    """
    Proyectar cuándo se terminará de pagar con un monto mensual dado
    
    Calcula:
    - Meses para terminar de pagar
    - Total de intereses a pagar
    - Comparación vs pago mínimo
    - Ahorro potencial
    
    Estado: Pending implementation
    """
    # TODO: Implementar calculadora de proyección de pago
    raise HTTPException(
        status_code=501,
        detail="Proyección de pago pendiente de implementación"
    )
