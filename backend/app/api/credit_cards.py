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


# ============================================================================
# Billing Cycle Timeline & Calculator
# ============================================================================

@router.get("/{card_id}/cycle-timeline")
async def get_cycle_timeline(
    card_id: int,
    target_month: Optional[int] = Query(None, description="Mes objetivo (1-12)"),
    target_year: Optional[int] = Query(None, description="Año objetivo"),
    db: Session = Depends(get_db)
):
    """
    📅 TIMELINE DEL CICLO DE FACTURACIÓN
    
    Muestra el calendario del mes con:
    - Fecha de corte
    - Fecha de pago
    - Días de float (crédito gratis)
    - Mejor momento para comprar
    - Zona de riesgo (antes del pago)
    
    Ejemplo de respuesta:
    {
        "current_cycle": {
            "statement_date": "2025-11-10",
            "due_date": "2025-12-05",
            "days_in_cycle": 25,
            "days_until_close": 5,
            "days_until_payment": 18
        },
        "timeline": {
            "best_purchase_window": {
                "start": "2025-11-11",  # Justo después del corte
                "end": "2025-11-20",
                "float_days": 55,  # Días sin intereses
                "reason": "Máximo período de gracia"
            },
            "risk_zone": {
                "start": "2025-12-01",
                "end": "2025-12-05",
                "reason": "Próximo al vencimiento"
            },
            "cycle_phases": [
                {
                    "phase": "optimal",
                    "date_range": ["2025-11-11", "2025-11-20"],
                    "description": "🟢 Mejor momento para comprar"
                },
                {
                    "phase": "normal",
                    "date_range": ["2025-11-21", "2025-11-30"],
                    "description": "🟡 Momento regular"
                },
                {
                    "phase": "warning",
                    "date_range": ["2025-12-01", "2025-12-05"],
                    "description": "🔴 Evitar compras grandes"
                }
            ]
        },
        "float_calculator": {
            "if_buy_today": {
                "purchase_date": "2025-11-15",
                "will_appear_on_statement": "2025-12-10",
                "payment_due": "2026-01-05",
                "float_days": 51,
                "message": "Excelente momento - 51 días de crédito gratis"
            }
        }
    }
    """
    from datetime import datetime, timedelta
    from calendar import monthrange
    
    # Obtener tarjeta
    card = db.query(CreditCard).filter(CreditCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    
    if not card.statement_close_day or not card.payment_due_day:
        raise HTTPException(
            status_code=400,
            detail="La tarjeta no tiene configurados los días de corte y pago"
        )
    
    # Determinar mes objetivo
    today = datetime.now().date()
    if target_month and target_year:
        reference_date = date(target_year, target_month, 1)
    else:
        reference_date = today
    
    # Calcular fechas del ciclo actual
    close_day = card.statement_close_day
    payment_day = card.payment_due_day
    
    # Fecha de corte del mes actual
    year = reference_date.year
    month = reference_date.month
    
    # Si el día de corte ya pasó este mes, el ciclo actual ya cerró
    try:
        statement_date = date(year, month, close_day)
    except ValueError:
        # El día no existe en este mes (ej: 31 en feb)
        days_in_month = monthrange(year, month)[1]
        statement_date = date(year, month, days_in_month)
    
    if today > statement_date:
        # Ciclo actual ya cerró, mostrar el próximo
        if month == 12:
            next_month = 1
            next_year = year + 1
        else:
            next_month = month + 1
            next_year = year
        
        try:
            statement_date = date(next_year, next_month, close_day)
        except ValueError:
            days_in_month = monthrange(next_year, next_month)[1]
            statement_date = date(next_year, next_month, days_in_month)
    
    # Fecha de pago (siguiente mes después del corte)
    payment_month = statement_date.month + 1 if statement_date.month < 12 else 1
    payment_year = statement_date.year if statement_date.month < 12 else statement_date.year + 1
    
    try:
        due_date = date(payment_year, payment_month, payment_day)
    except ValueError:
        days_in_month = monthrange(payment_year, payment_month)[1]
        due_date = date(payment_year, payment_month, min(payment_day, days_in_month))
    
    # Calcular métricas
    days_in_cycle = (due_date - statement_date).days
    days_until_close = (statement_date - today).days if statement_date > today else 0
    days_until_payment = (due_date - today).days if due_date > today else 0
    
    # Ventana óptima de compra (justo después del corte)
    best_start = statement_date + timedelta(days=1)
    best_end = statement_date + timedelta(days=10)
    
    # Calcular float si compra hoy
    if today <= statement_date:
        # Aparecerá en el siguiente corte
        next_statement = statement_date
    else:
        # Aparecerá en el corte del siguiente mes
        if statement_date.month == 12:
            next_statement = date(statement_date.year + 1, 1, close_day)
        else:
            try:
                next_statement = date(statement_date.year, statement_date.month + 1, close_day)
            except ValueError:
                days_in_month = monthrange(statement_date.year, statement_date.month + 1)[1]
                next_statement = date(statement_date.year, statement_date.month + 1, days_in_month)
    
    # Pago del statement donde aparece
    next_payment_month = next_statement.month + 1 if next_statement.month < 12 else 1
    next_payment_year = next_statement.year if next_statement.month < 12 else next_statement.year + 1
    
    try:
        next_payment_date = date(next_payment_year, next_payment_month, payment_day)
    except ValueError:
        days_in_month = monthrange(next_payment_year, next_payment_month)[1]
        next_payment_date = date(next_payment_year, next_payment_month, min(payment_day, days_in_month))
    
    float_days = (next_payment_date - today).days
    
    # Determinar mensaje según float
    if float_days >= 45:
        float_message = f"🟢 Excelente momento - {float_days} días de crédito gratis"
    elif float_days >= 30:
        float_message = f"🟡 Buen momento - {float_days} días de float"
    else:
        float_message = f"🔴 Poco float - solo {float_days} días"
    
    # Zona de riesgo (5 días antes del pago)
    risk_start = due_date - timedelta(days=5)
    
    return {
        "current_cycle": {
            "statement_date": statement_date.isoformat(),
            "due_date": due_date.isoformat(),
            "days_in_cycle": days_in_cycle,
            "days_until_close": days_until_close,
            "days_until_payment": days_until_payment,
        },
        "timeline": {
            "best_purchase_window": {
                "start": best_start.isoformat(),
                "end": best_end.isoformat(),
                "float_days": (due_date - best_start).days,
                "reason": "Máximo período de gracia - compras no cobran hasta siguiente ciclo"
            },
            "risk_zone": {
                "start": risk_start.isoformat(),
                "end": due_date.isoformat(),
                "reason": "Próximo al vencimiento - evitar compras grandes"
            },
            "cycle_phases": [
                {
                    "phase": "optimal",
                    "date_range": [best_start.isoformat(), best_end.isoformat()],
                    "description": "🟢 Mejor momento para comprar - máximo float"
                },
                {
                    "phase": "normal",
                    "date_range": [best_end.isoformat(), risk_start.isoformat()],
                    "description": "🟡 Momento regular - float moderado"
                },
                {
                    "phase": "warning",
                    "date_range": [risk_start.isoformat(), due_date.isoformat()],
                    "description": "🔴 Evitar compras grandes - próximo vencimiento"
                }
            ]
        },
        "float_calculator": {
            "if_buy_today": {
                "purchase_date": today.isoformat(),
                "will_appear_on_statement": next_statement.isoformat(),
                "payment_due": next_payment_date.isoformat(),
                "float_days": float_days,
                "message": float_message
            }
        }
    }


@router.get("/{card_id}/purchase-advisor")
async def get_purchase_advisor(
    card_id: int,
    amount: Decimal = Query(..., description="Monto de la compra"),
    installments: Optional[int] = Query(None, description="Número de cuotas (None = revolvente)"),
    tea_installments: Optional[Decimal] = Query(None, description="TEA para cuotas"),
    db: Session = Depends(get_db)
):
    """
    💡 ASESOR DE COMPRAS: ¿Cuotas o Revolvente?
    
    Compara el costo real de comprar en cuotas vs revolvente
    y recomienda la mejor opción.
    
    Ejemplo:
        GET /api/credit-cards/1/purchase-advisor?amount=1500&installments=6&tea_installments=17.63
    
    Respuesta:
    {
        "purchase_amount": 1500.00,
        "revolvente_option": {
            "total_to_pay": 1500.00,
            "interest": 0.00,
            "condition": "Si pagas el total en el siguiente corte",
            "tea_effective": 0.00,
            "pros": ["Sin intereses", "Liberas crédito rápido"],
            "cons": ["Debes tener liquidez al corte"]
        },
        "installments_option": {
            "installments": 6,
            "monthly_payment": 258.80,
            "total_to_pay": 1552.80,
            "total_interest": 52.80,
            "tea": 17.63,
            "pros": ["Pagos fijos mensuales", "No afecta liquidez"],
            "cons": ["Pagas S/ 52.80 en intereses", "Compromete capacidad por 6 meses"]
        },
        "recommendation": {
            "best_option": "revolvente",
            "reason": "Ahorras S/ 52.80 si puedes pagar el total",
            "considerations": [
                "Requiere S/ 1,500 disponibles en 25 días",
                "Revolvente solo es mejor si pagas el TOTAL",
                "Si solo pagas mínimo, intereses suben a 44.99% TEA"
            ]
        },
        "impact_on_credit": {
            "current_available": 7261.32,
            "after_purchase": 5761.32,
            "utilization_before": 44.1,
            "utilization_after": 55.6,
            "warning": "Utilización > 50% puede afectar score crediticio"
        }
    }
    """
    # Obtener tarjeta
    card = db.query(CreditCard).filter(CreditCard.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    
    # ⚠️ VALIDACIÓN: Si el monto excede disponible
    if amount > card.available_credit:
        return {
            "error": True,
            "warning": {
                "type": "insufficient_credit",
                "title": "❌ Crédito Insuficiente",
                "message": f"No tienes suficiente disponible para esta compra",
                "details": {
                    "requested_amount": float(amount),
                    "available_credit": float(card.available_credit),
                    "short_by": float(amount - card.available_credit),
                    "action": "Reduce el monto o realiza un pago previo"
                }
            },
            "purchase_amount": None,
            "revolvente_option": None,
            "installments_option": None,
            "recommendation": None,
            "impact_on_credit": None
        }
    
    # OPCIÓN REVOLVENTE (pago total siguiente corte)
    revolvente_total = amount
    revolvente_interest = Decimal("0")
    revolvente_tea = Decimal("0")
    
    revolvente_pros = [
        "✅ Sin intereses si pagas el total",
        "✅ Liberas crédito rápido",
        "✅ Flexibilidad para pagar antes"
    ]
    revolvente_cons = [
        "⚠️ Debes tener liquidez completa al corte",
        "⚠️ Si no pagas total, intereses suben a {:.2f}% TEA".format(card.revolving_interest_rate or 0)
    ]
    
    # OPCIÓN CUOTAS
    installments_data = None
    if installments and installments > 1:
        # Calcular cuota mensual con TEA
        tea = tea_installments or Decimal("0")
        
        if tea > 0:
            # Fórmula de cuota con interés compuesto
            # Cuota = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
            # donde r = TEA_mensual = (1 + TEA_anual)^(1/12) - 1
            tea_decimal = tea / Decimal("100")
            r_monthly = (1 + tea_decimal) ** (Decimal("1") / Decimal("12")) - 1
            
            numerator = amount * (r_monthly * ((1 + r_monthly) ** installments))
            denominator = ((1 + r_monthly) ** installments) - 1
            monthly_payment = numerator / denominator
        else:
            # Sin intereses (cuotas 0% TEA)
            monthly_payment = amount / installments
        
        total_to_pay = monthly_payment * installments
        total_interest = total_to_pay - amount
        
        installments_data = {
            "installments": installments,
            "monthly_payment": float(round(monthly_payment, 2)),
            "total_to_pay": float(round(total_to_pay, 2)),
            "total_interest": float(round(total_interest, 2)),
            "tea": float(tea),
            "pros": [
                f"✅ Pagos fijos de S/ {monthly_payment:.2f}/mes",
                "✅ No afecta liquidez inmediata",
                "✅ Predecible y planificable"
            ],
            "cons": [
                f"⚠️ Pagas S/ {total_interest:.2f} en intereses",
                f"⚠️ Compromete capacidad por {installments} meses",
                "⚠️ Menos flexibilidad de pago anticipado"
            ]
        }
    
    # RECOMENDACIÓN
    recommendation = None
    if installments_data:
        interest_difference = installments_data["total_interest"]
        
        if interest_difference <= 50:  # Menos de S/ 50 de diferencia
            recommendation = {
                "best_option": "installments",
                "reason": f"Diferencia mínima (S/ {interest_difference:.2f}) - vale la pena la comodidad de cuotas",
                "considerations": [
                    "Ambas opciones son viables",
                    "Cuotas dan más tranquilidad financiera",
                    f"Solo {installments} meses de compromiso"
                ]
            }
        elif interest_difference > 200:  # Más de S/ 200
            recommendation = {
                "best_option": "revolvente",
                "reason": f"Ahorras S/ {interest_difference:.2f} si puedes pagar el total",
                "considerations": [
                    f"Requiere S/ {amount:.2f} disponibles en ~25 días",
                    "Revolvente solo es mejor si pagas el TOTAL",
                    f"Si solo pagas mínimo, intereses suben a {card.revolving_interest_rate}% TEA"
                ]
            }
        else:
            recommendation = {
                "best_option": "depends",
                "reason": f"Depende de tu liquidez - diferencia moderada (S/ {interest_difference:.2f})",
                "considerations": [
                    "Si tienes liquidez → Revolvente (ahorras intereses)",
                    "Si prefieres comodidad → Cuotas (pago predecible)",
                    "Evalúa tu flujo de caja del próximo mes"
                ]
            }
    else:
        recommendation = {
            "best_option": "revolvente",
            "reason": "Sin cuotas especificadas, revolvente es la única opción",
            "considerations": [
                "Paga el total antes del corte para evitar intereses",
                f"No pagar genera {card.revolving_interest_rate}% TEA"
            ]
        }
    
    # IMPACTO EN CRÉDITO
    current_utilization = (float(card.current_balance) / float(card.credit_limit)) * 100
    new_balance = card.current_balance + amount
    new_utilization = (float(new_balance) / float(card.credit_limit)) * 100
    
    utilization_warning = None
    if new_utilization > 70:
        utilization_warning = "⚠️ Utilización > 70% - Muy alto, puede afectar score crediticio"
    elif new_utilization > 50:
        utilization_warning = "⚠️ Utilización > 50% - Moderado, monitorear"
    elif new_utilization > 30:
        utilization_warning = "✅ Utilización saludable (30-50%)"
    else:
        utilization_warning = "✅ Utilización óptima (< 30%)"
    
    return {
        "purchase_amount": float(amount),
        "revolvente_option": {
            "total_to_pay": float(revolvente_total),
            "interest": float(revolvente_interest),
            "condition": "Si pagas el total en el siguiente corte",
            "tea_effective": float(revolvente_tea),
            "pros": revolvente_pros,
            "cons": revolvente_cons
        },
        "installments_option": installments_data,
        "recommendation": recommendation,
        "impact_on_credit": {
            "current_available": float(card.available_credit),
            "after_purchase": float(card.available_credit - amount),
            "utilization_before": round(current_utilization, 1),
            "utilization_after": round(new_utilization, 1),
            "warning": utilization_warning
        }
    }

