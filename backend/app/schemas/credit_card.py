"""
Credit Card Schemas
-------------------
Schemas Pydantic para validación de datos de tarjetas de crédito.

Basado en ADR-004: Sistema de Gestión de Tarjetas de Crédito
"""

from pydantic import BaseModel, Field, field_validator
from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List


# ============================================================================
# Credit Card Schemas
# ============================================================================

class CreditCardBase(BaseModel):
    """Base schema para tarjeta de crédito"""
    name: str = Field(..., description="Nombre de la tarjeta", example="BBVA Visa Signature")
    bank: str = Field(..., description="Banco emisor", example="BBVA")
    card_type: Optional[str] = Field(None, description="Tipo de tarjeta", example="Visa")
    last_four_digits: Optional[str] = Field(None, max_length=4, description="Últimos 4 dígitos", example="0265")
    credit_limit: Decimal = Field(..., gt=0, description="Línea de crédito", example=13000.00)
    payment_due_day: Optional[int] = Field(None, ge=1, le=31, description="Día de vencimiento", example=5)
    statement_close_day: Optional[int] = Field(None, ge=1, le=31, description="Día de corte", example=10)
    revolving_interest_rate: Optional[Decimal] = Field(None, ge=0, description="TEA revolvente", example=44.99)


class CreditCardCreate(CreditCardBase):
    """Schema para crear tarjeta"""
    pass


class CreditCardUpdate(BaseModel):
    """Schema para actualizar tarjeta"""
    name: Optional[str] = None
    credit_limit: Optional[Decimal] = Field(None, gt=0)
    payment_due_day: Optional[int] = Field(None, ge=1, le=31)
    statement_close_day: Optional[int] = Field(None, ge=1, le=31)
    revolving_interest_rate: Optional[Decimal] = Field(None, ge=0)
    is_active: Optional[bool] = None


class CreditCard(CreditCardBase):
    """Schema de respuesta para tarjeta"""
    id: int
    current_balance: Decimal = Field(description="Deuda total actual")
    available_credit: Decimal = Field(description="Crédito disponible")
    revolving_debt: Decimal = Field(description="Deuda revolvente")
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


# ============================================================================
# Installment Schemas
# ============================================================================

class InstallmentBase(BaseModel):
    """Base schema para compra en cuotas"""
    concept: str = Field(..., description="Descripción de la compra", example="BM Ferretería")
    original_amount: Decimal = Field(..., gt=0, description="Monto original", example=14610.00)
    purchase_date: Optional[date] = Field(None, description="Fecha de compra")
    total_installments: int = Field(..., ge=1, description="Total de cuotas", example=6)
    monthly_payment: Decimal = Field(..., gt=0, description="Pago mensual", example=258.80)
    monthly_principal: Optional[Decimal] = Field(None, description="Capital mensual", example=234.61)
    monthly_interest: Optional[Decimal] = Field(None, description="Interés mensual", example=24.19)
    interest_rate: Optional[Decimal] = Field(None, ge=0, description="TEA", example=17.63)


class InstallmentCreate(InstallmentBase):
    """Schema para crear cuota"""
    credit_card_id: int
    current_installment: int = Field(default=1, ge=1, description="Cuota actual")
    
    @field_validator('current_installment')
    @classmethod
    def validate_current_installment(cls, v, info):
        """Validar que current_installment <= total_installments"""
        total = info.data.get('total_installments')
        if total and v > total:
            raise ValueError(f"current_installment ({v}) no puede ser mayor que total_installments ({total})")
        return v


class InstallmentUpdate(BaseModel):
    """Schema para actualizar cuota"""
    current_installment: Optional[int] = Field(None, ge=1)
    monthly_payment: Optional[Decimal] = Field(None, gt=0)
    monthly_principal: Optional[Decimal] = None
    monthly_interest: Optional[Decimal] = None
    interest_rate: Optional[Decimal] = Field(None, ge=0)
    is_active: Optional[bool] = None


class Installment(InstallmentBase):
    """Schema de respuesta para cuota"""
    id: int
    credit_card_id: int
    current_installment: int
    remaining_capital: Optional[Decimal]
    is_active: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}


# ============================================================================
# Statement Schemas
# ============================================================================

class StatementBase(BaseModel):
    """Base schema para estado de cuenta"""
    statement_date: date = Field(..., description="Fecha de corte")
    due_date: date = Field(..., description="Fecha de vencimiento")
    previous_balance: Decimal = Field(default=Decimal("0"), description="Saldo anterior")
    new_charges: Decimal = Field(default=Decimal("0"), description="Compras del mes")
    payments_received: Decimal = Field(default=Decimal("0"), description="Pagos recibidos")
    interest_charges: Decimal = Field(default=Decimal("0"), description="Intereses cobrados")
    fees: Decimal = Field(default=Decimal("0"), description="Comisiones")
    new_balance: Decimal = Field(default=Decimal("0"), description="Nuevo saldo")
    minimum_payment: Decimal = Field(default=Decimal("0"), description="Pago mínimo")
    total_payment: Decimal = Field(default=Decimal("0"), description="Pago total")
    revolving_balance: Decimal = Field(default=Decimal("0"), description="Deuda revolvente")
    installments_balance: Decimal = Field(default=Decimal("0"), description="Deuda en cuotas")
    
    @field_validator('due_date')
    @classmethod
    def validate_due_date(cls, v, info):
        """Validar que due_date > statement_date"""
        statement_date = info.data.get('statement_date')
        if statement_date and v <= statement_date:
            raise ValueError("due_date debe ser posterior a statement_date")
        return v


class StatementCreate(StatementBase):
    """Schema para crear estado de cuenta"""
    credit_card_id: int
    pdf_file_path: Optional[str] = None


class Statement(StatementBase):
    """Schema de respuesta para estado de cuenta"""
    id: int
    credit_card_id: int
    pdf_file_path: Optional[str]
    ai_parsed: bool = Field(default=False, description="Parseado por IA")
    ai_confidence: Optional[Decimal] = Field(None, description="Confianza del parser")
    manual_review_required: bool = Field(default=False, description="Requiere revisión")
    created_at: datetime
    
    model_config = {"from_attributes": True}


# ============================================================================
# Aggregate Schemas
# ============================================================================

class CreditCardSummary(BaseModel):
    """Vista completa de tarjeta con cuotas activas y último estado de cuenta"""
    card: CreditCard
    active_installments: List[Installment]
    latest_statement: Optional[Statement]
    total_monthly_installments: Decimal = Field(description="Total de cuotas mensuales")
    months_to_payoff_minimum: Optional[int] = Field(None, description="Meses para pagar con mínimo")
    projected_interest_minimum: Optional[Decimal] = Field(None, description="Interés proyectado con mínimo")
    
    model_config = {"from_attributes": True}


class DebtEvolutionPoint(BaseModel):
    """Punto de datos para evolución de deuda"""
    month: str = Field(description="Mes en formato YYYY-MM")
    total_debt: Decimal
    revolving_debt: Decimal
    installments_debt: Decimal
    payments_made: Decimal
    interest_paid: Decimal
    principal_paid: Decimal


class PayoffProjection(BaseModel):
    """Proyección de pago de deuda"""
    monthly_payment: Decimal = Field(description="Pago mensual propuesto")
    months_to_payoff: int = Field(description="Meses para terminar de pagar")
    total_interest: Decimal = Field(description="Total de intereses a pagar")
    total_to_pay: Decimal = Field(description="Total a pagar (capital + intereses)")
    savings_vs_minimum: Optional[Decimal] = Field(None, description="Ahorro vs pago mínimo")


# ============================================================================
# Upload Response
# ============================================================================

class StatementUploadResponse(BaseModel):
    """Respuesta al subir PDF de estado de cuenta"""
    status: str = Field(description="success | manual_review_required | error")
    statement_id: Optional[int] = None
    confidence: Optional[float] = Field(None, ge=0, le=1)
    needs_review: bool = Field(default=False)
    summary: Optional[dict] = None
    notes: Optional[str] = None
    error: Optional[str] = None
