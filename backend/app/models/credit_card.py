"""
Credit Card Models
------------------
Modelos para gestión de tarjetas de crédito, estados de cuenta y compras en cuotas.

Basado en ADR-004: Sistema de Gestión de Tarjetas de Crédito
"""

from sqlalchemy import Column, Integer, String, Numeric, Boolean, Date, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class CreditCard(Base):
    """
    Tarjeta de crédito del usuario
    
    Representa una tarjeta de crédito con su línea de crédito, saldo actual,
    y configuración de fechas de pago.
    
    Ejemplo:
        BBVA Visa Signature
        Línea: S/ 13,000
        Saldo: S/ 5,738.68
        Disponible: S/ 7,261.32
    """
    __tablename__ = "credit_cards"
    
    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    # Nota: user_id sin ForeignKey porque aún no existe tabla users.
    # Cuando se implemente multi-usuario, agregar: ForeignKey("users.id")
    user_id = Column(Integer, nullable=True)
    
    # Información de tarjeta
    name = Column(String, nullable=False)  # "BBVA Visa Signature"
    bank = Column(String, nullable=False)  # "BBVA"
    card_type = Column(String, nullable=True)  # "Visa", "Mastercard", "Amex"
    last_four_digits = Column(String(4), nullable=True)  # "0265"
    
    # Límites de crédito
    credit_limit = Column(Numeric(10, 2), nullable=False)  # 13000.00
    current_balance = Column(Numeric(10, 2), default=0)  # Deuda total actual
    available_credit = Column(Numeric(10, 2), nullable=True)  # Calculado: limit - balance
    revolving_debt = Column(Numeric(10, 2), default=0)  # Deuda sin cuotas
    
    # Configuración de pagos
    payment_due_day = Column(Integer, nullable=True)  # Día del mes (5)
    statement_close_day = Column(Integer, nullable=True)  # Día de corte (10)
    
    # Tasas de interés
    revolving_interest_rate = Column(Numeric(5, 2), nullable=True)  # TEA revolvente (44.99)
    
    # Estado
    is_active = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relaciones
    statements = relationship("CreditCardStatement", back_populates="credit_card", cascade="all, delete-orphan")
    installments = relationship("CreditCardInstallment", back_populates="credit_card", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<CreditCard(id={self.id}, name='{self.name}', bank='{self.bank}', balance={self.current_balance})>"


class CreditCardStatement(Base):
    """
    Estado de cuenta mensual
    
    Snapshot mensual del estado de cuenta de la tarjeta, incluyendo
    saldos, cargos, pagos e intereses del período.
    
    Ejemplo:
        Cierre: 10/11/2025
        Vencimiento: 05/12/2025
        Saldo anterior: S/ 8,077
        Nuevo saldo: S/ 5,738.68
    """
    __tablename__ = "credit_card_statements"
    
    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    credit_card_id = Column(Integer, ForeignKey("credit_cards.id"), nullable=False)
    
    # Fechas
    statement_date = Column(Date, nullable=False)  # Fecha de corte
    due_date = Column(Date, nullable=False)  # Fecha límite de pago
    
    # Saldos
    previous_balance = Column(Numeric(10, 2), default=0)  # Saldo anterior
    new_charges = Column(Numeric(10, 2), default=0)  # Compras del mes
    payments_received = Column(Numeric(10, 2), default=0)  # Pagos aplicados
    interest_charges = Column(Numeric(10, 2), default=0)  # Intereses cobrados
    fees = Column(Numeric(10, 2), default=0)  # Comisiones
    new_balance = Column(Numeric(10, 2), default=0)  # Saldo nuevo
    
    # Pagos
    minimum_payment = Column(Numeric(10, 2), default=0)  # Pago mínimo
    total_payment = Column(Numeric(10, 2), default=0)  # Pago para no generar intereses
    
    # Desglose
    revolving_balance = Column(Numeric(10, 2), default=0)  # Deuda revolvente
    installments_balance = Column(Numeric(10, 2), default=0)  # Deuda en cuotas
    
    # Archivo original
    pdf_file_path = Column(String, nullable=True)  # Path al PDF guardado
    
    # Campos para parser de IA (ADR-006)
    raw_text = Column(Text, nullable=True)  # Texto extraído del PDF
    ai_parsed = Column(Boolean, default=False)  # Si fue parseado por IA
    ai_confidence = Column(Numeric(3, 2), nullable=True)  # Confianza del parser (0-1)
    parsing_errors = Column(JSON, nullable=True)  # Errores encontrados
    manual_review_required = Column(Boolean, default=False)  # Requiere revisión manual
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relaciones
    credit_card = relationship("CreditCard", back_populates="statements")
    
    def __repr__(self):
        return f"<Statement(id={self.id}, card_id={self.credit_card_id}, date={self.statement_date}, balance={self.new_balance})>"


class CreditCardInstallment(Base):
    """
    Compra en cuotas
    
    Representa una compra financiada en cuotas mensuales con intereses.
    Trackea el progreso de pago y calcula capital vs intereses.
    
    Ejemplo:
        BM Ferretería: S/ 14,610
        Cuota 4 de 6
        TEA 17.63%
        Pago mensual: S/ 258.80 (Capital: S/ 234.61, Interés: S/ 24.19)
    """
    __tablename__ = "credit_card_installments"
    
    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    credit_card_id = Column(Integer, ForeignKey("credit_cards.id"), nullable=False)
    
    # Información de la compra
    concept = Column(String, nullable=False)  # "BM Ferretería"
    original_amount = Column(Numeric(10, 2), nullable=False)  # 14610.00
    purchase_date = Column(Date, nullable=True)  # Fecha de compra original
    
    # Cuotas
    current_installment = Column(Integer, default=1)  # 4
    total_installments = Column(Integer, nullable=False)  # 6
    monthly_payment = Column(Numeric(10, 2), nullable=False)  # 258.80
    monthly_principal = Column(Numeric(10, 2), nullable=True)  # 234.61 (capital)
    monthly_interest = Column(Numeric(10, 2), nullable=True)  # 24.19 (interés)
    
    # Tasas
    interest_rate = Column(Numeric(5, 2), nullable=True)  # TEA (17.63)
    
    # Saldos
    remaining_capital = Column(Numeric(10, 2), nullable=True)  # Capital pendiente
    
    # Estado
    is_active = Column(Boolean, default=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relaciones
    credit_card = relationship("CreditCard", back_populates="installments")
    
    def __repr__(self):
        return f"<Installment(id={self.id}, concept='{self.concept}', {self.current_installment}/{self.total_installments}, payment={self.monthly_payment})>"
    
    @property
    def installments_remaining(self) -> int:
        """Cuotas pendientes de pago"""
        return self.total_installments - self.current_installment
    
    @property
    def progress_percent(self) -> float:
        """Porcentaje de avance (0-100)"""
        return (self.current_installment / self.total_installments) * 100
    
    @property
    def total_remaining(self) -> float:
        """Monto total pendiente de pagar"""
        return float(self.monthly_payment) * self.installments_remaining
