# ADR-004: Sistema de Gestión de Tarjetas de Crédito

## Estado
Propuesto

## Contexto
Los usuarios necesitan trackear deudas de tarjetas de crédito que incluyen:
- Deuda revolvente (sin cuotas fijas)
- Compras en cuotas con diferentes tasas de interés
- Pagos automáticos/suscripciones
- Pagos realizados desde cuentas bancarias

Actualmente la app solo maneja transacciones individuales, sin visibilidad de:
- Saldo total de tarjeta
- Desglose de deuda (revolvente vs cuotas)
- Intereses pagados vs capital amortizado
- Evolución mensual de la deuda
- Proyecciones de pago

### Caso de Uso Real
Usuario con BBVA Visa Signature:
- Línea de crédito: S/ 10,000
- Deuda actual: S/ 6,245 (62%)
- **Deuda en cuotas**: 
  - Compra BM: S/ 7,305 (14/36 cuotas) TEA 17.63% → S/ 258.80/mes
  - Hindu Ananda 1: S/ 1,200 (8/12 cuotas) TEA 35.99% → S/ 118.25/mes
  - Hindu Ananda 2: S/ 899 (5/12 cuotas) TEA 35.99% → S/ 88.56/mes
- **Deuda revolvente**: S/ 3,750.87 (TEA 44.99%)
- **Pago mínimo**: S/ 703.08
- **Pago total**: S/ 4,424.05

**Problema crítico**: Si solo paga mínimo → 81 meses (6.75 años), pagará S/ 4,627 en intereses + S/ 3,240 en comisiones = casi 3x la deuda original.

## Decisión

### Fase 1: Implementación Simple (MVP)
Sistema de tracking manual con actualización mensual vía PDF.

#### 1.1 Modelos de Base de Datos

```python
# app/models/credit_card.py
class CreditCard(Base):
    """Tarjeta de crédito del usuario"""
    __tablename__ = "credit_cards"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))  # Para multi-usuario futuro
    name = Column(String, nullable=False)  # "BBVA Visa Signature"
    bank = Column(String, nullable=False)  # "BBVA"
    card_type = Column(String)  # "Visa", "Mastercard", "Amex"
    last_four_digits = Column(String(4))  # "0865"
    credit_limit = Column(Numeric(10, 2), nullable=False)  # 10000.00
    current_balance = Column(Numeric(10, 2), default=0)  # Deuda total actual
    available_credit = Column(Numeric(10, 2))  # Calculado: limit - balance
    revolving_debt = Column(Numeric(10, 2), default=0)  # Deuda sin cuotas
    
    # Configuración de pagos
    payment_due_day = Column(Integer)  # Día del mes (5)
    statement_close_day = Column(Integer)  # Día de corte (10)
    
    # Tasas de interés
    revolving_interest_rate = Column(Numeric(5, 2))  # TEA revolvente (44.99)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    statements = relationship("CreditCardStatement", back_populates="credit_card")
    installments = relationship("CreditCardInstallment", back_populates="credit_card")


class CreditCardStatement(Base):
    """Estado de cuenta mensual"""
    __tablename__ = "credit_card_statements"
    
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
    revolving_balance = Column(Numeric(10, 2), default=0)
    installments_balance = Column(Numeric(10, 2), default=0)
    
    # Archivo original
    pdf_file_path = Column(String, nullable=True)  # Path al PDF guardado
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    credit_card = relationship("CreditCard", back_populates="statements")


class CreditCardInstallment(Base):
    """Compra en cuotas"""
    __tablename__ = "credit_card_installments"
    
    id = Column(Integer, primary_key=True, index=True)
    credit_card_id = Column(Integer, ForeignKey("credit_cards.id"), nullable=False)
    
    # Información de la compra
    concept = Column(String, nullable=False)  # "Tienda Hindu Ananda"
    original_amount = Column(Numeric(10, 2), nullable=False)  # 1200.00
    purchase_date = Column(Date)  # Fecha de compra original
    
    # Cuotas
    current_installment = Column(Integer, default=1)  # 8
    total_installments = Column(Integer, nullable=False)  # 12
    monthly_payment = Column(Numeric(10, 2), nullable=False)  # 118.25
    monthly_principal = Column(Numeric(10, 2))  # 104.06 (capital)
    monthly_interest = Column(Numeric(10, 2))  # 14.19 (interés)
    
    # Tasas
    interest_rate = Column(Numeric(5, 2))  # TEA (35.99)
    
    # Saldos
    remaining_capital = Column(Numeric(10, 2))  # Capital pendiente
    
    # Estado
    is_active = Column(Boolean, default=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    credit_card = relationship("CreditCard", back_populates="installments")
```

#### 1.2 Schemas Pydantic

```python
# app/schemas/credit_card.py
from pydantic import BaseModel, Field
from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List

class CreditCardBase(BaseModel):
    name: str
    bank: str
    card_type: Optional[str] = None
    last_four_digits: Optional[str] = None
    credit_limit: Decimal
    payment_due_day: Optional[int] = None
    statement_close_day: Optional[int] = None
    revolving_interest_rate: Optional[Decimal] = None

class CreditCardCreate(CreditCardBase):
    pass

class CreditCardUpdate(BaseModel):
    name: Optional[str] = None
    credit_limit: Optional[Decimal] = None
    payment_due_day: Optional[int] = None
    statement_close_day: Optional[int] = None
    revolving_interest_rate: Optional[Decimal] = None
    is_active: Optional[bool] = None

class CreditCard(CreditCardBase):
    id: int
    current_balance: Decimal
    available_credit: Decimal
    revolving_debt: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class InstallmentBase(BaseModel):
    concept: str
    original_amount: Decimal
    purchase_date: Optional[date] = None
    total_installments: int
    monthly_payment: Decimal
    monthly_principal: Optional[Decimal] = None
    monthly_interest: Optional[Decimal] = None
    interest_rate: Optional[Decimal] = None

class InstallmentCreate(InstallmentBase):
    credit_card_id: int
    current_installment: int = 1

class Installment(InstallmentBase):
    id: int
    credit_card_id: int
    current_installment: int
    remaining_capital: Optional[Decimal]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class StatementBase(BaseModel):
    statement_date: date
    due_date: date
    previous_balance: Decimal = Decimal("0")
    new_charges: Decimal = Decimal("0")
    payments_received: Decimal = Decimal("0")
    interest_charges: Decimal = Decimal("0")
    fees: Decimal = Decimal("0")
    new_balance: Decimal = Decimal("0")
    minimum_payment: Decimal = Decimal("0")
    total_payment: Decimal = Decimal("0")
    revolving_balance: Decimal = Decimal("0")
    installments_balance: Decimal = Decimal("0")

class StatementCreate(StatementBase):
    credit_card_id: int
    pdf_file_path: Optional[str] = None

class Statement(StatementBase):
    id: int
    credit_card_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class CreditCardSummary(BaseModel):
    """Vista completa de tarjeta con cuotas activas"""
    card: CreditCard
    active_installments: List[Installment]
    latest_statement: Optional[Statement]
    total_monthly_installments: Decimal
    months_to_payoff_minimum: Optional[int]
    projected_interest_minimum: Optional[Decimal]
```

#### 1.3 API Endpoints

```python
# app/api/credit_cards.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.credit_card import *

router = APIRouter(prefix="/credit-cards", tags=["credit-cards"])

@router.post("/", response_model=CreditCard)
async def create_credit_card(
    card: CreditCardCreate,
    db: Session = Depends(get_db)
):
    """Crear nueva tarjeta de crédito"""
    # TODO: Implementar lógica de creación
    pass

@router.get("/", response_model=List[CreditCard])
async def get_credit_cards(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Listar todas las tarjetas"""
    # TODO: Implementar lógica de listado
    pass

@router.get("/{card_id}", response_model=CreditCardSummary)
async def get_credit_card_summary(
    card_id: int,
    db: Session = Depends(get_db)
):
    """Obtener resumen completo de una tarjeta con cuotas y último estado de cuenta"""
    # TODO: Implementar lógica de resumen
    pass

@router.put("/{card_id}", response_model=CreditCard)
async def update_credit_card(
    card_id: int,
    card: CreditCardUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar información de tarjeta"""
    # TODO: Implementar lógica de actualización
    pass

@router.delete("/{card_id}")
async def delete_credit_card(
    card_id: int,
    db: Session = Depends(get_db)
):
    """Desactivar tarjeta"""
    # TODO: Soft delete (is_active = False)
    pass


# Gestión de Cuotas
@router.post("/{card_id}/installments", response_model=Installment)
async def create_installment(
    card_id: int,
    installment: InstallmentCreate,
    db: Session = Depends(get_db)
):
    """Agregar nueva compra en cuotas"""
    # TODO: Implementar lógica de creación
    pass

@router.get("/{card_id}/installments", response_model=List[Installment])
async def get_installments(
    card_id: int,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Listar cuotas de una tarjeta"""
    # TODO: Implementar lógica de listado
    pass

@router.put("/installments/{installment_id}", response_model=Installment)
async def update_installment(
    installment_id: int,
    current_installment: int,
    db: Session = Depends(get_db)
):
    """Actualizar número de cuota pagada"""
    # TODO: Implementar lógica de actualización
    # Si current_installment == total_installments → is_active = False
    pass


# Gestión de Estados de Cuenta
@router.post("/{card_id}/statements", response_model=Statement)
async def create_statement(
    card_id: int,
    statement: StatementCreate,
    db: Session = Depends(get_db)
):
    """Registrar nuevo estado de cuenta manualmente"""
    # TODO: Implementar lógica de creación
    # Actualizar current_balance de la tarjeta
    pass

@router.post("/{card_id}/statements/upload")
async def upload_statement_pdf(
    card_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Subir PDF de estado de cuenta y procesarlo automáticamente
    (Fase 2 - Parser automático)
    """
    # TODO: 
    # 1. Guardar PDF en storage
    # 2. Procesar con PyPDF2
    # 3. Parsear datos específicos de BBVA
    # 4. Crear Statement automáticamente
    # 5. Actualizar cuotas activas
    pass

@router.get("/{card_id}/statements", response_model=List[Statement])
async def get_statements(
    card_id: int,
    limit: int = 12,  # Últimos 12 meses por default
    db: Session = Depends(get_db)
):
    """Obtener historial de estados de cuenta"""
    # TODO: Implementar lógica de listado ordenado por fecha DESC
    pass

@router.get("/{card_id}/statements/{statement_id}")
async def download_statement_pdf(
    card_id: int,
    statement_id: int,
    db: Session = Depends(get_db)
):
    """Descargar PDF original del estado de cuenta"""
    # TODO: Retornar FileResponse con el PDF
    pass


# Analytics y Proyecciones
@router.get("/{card_id}/analytics/evolution")
async def get_debt_evolution(
    card_id: int,
    months: int = 6,
    db: Session = Depends(get_db)
):
    """
    Obtener evolución de deuda en los últimos N meses
    """
    # TODO: Retornar array con:
    # [
    #   {
    #     month: "2024-06",
    #     total_debt: 6245.82,
    #     revolving_debt: 3750.87,
    #     installments_debt: 2494.95,
    #     payments_made: 675.50,
    #     interest_paid: 187.57,
    #     principal_paid: 487.93
    #   },
    #   ...
    # ]
    pass

@router.get("/{card_id}/analytics/projection")
async def get_payoff_projection(
    card_id: int,
    monthly_payment: Decimal,
    db: Session = Depends(get_db)
):
    """
    Proyectar cuándo se terminará de pagar si se paga X monto mensual
    """
    # TODO: Calcular:
    # - Meses para terminar de pagar
    # - Total de intereses a pagar
    # - Comparación vs pago mínimo
    # Retornar: {
    #   months_to_payoff: 18,
    #   total_interest: 1250.00,
    #   total_to_pay: 7495.82,
    #   savings_vs_minimum: 3371.43
    # }
    pass
```

#### 1.4 Script de Parseo de PDF

```python
# app/services/pdf_parser.py
import PyPDF2
import re
from decimal import Decimal
from datetime import datetime
from typing import Dict, List, Optional

class BBVAStatementParser:
    """Parser específico para estados de cuenta BBVA"""
    
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.text = self._extract_text()
    
    def _extract_text(self) -> str:
        """Extrae texto completo del PDF"""
        with open(self.pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            full_text = ""
            for page in reader.pages:
                full_text += page.extract_text()
        return full_text
    
    def parse(self) -> Dict:
        """
        Parsea el estado de cuenta y retorna datos estructurados
        """
        return {
            'card_info': self._parse_card_info(),
            'statement_info': self._parse_statement_info(),
            'balances': self._parse_balances(),
            'installments': self._parse_installments(),
            'transactions': self._parse_transactions()
        }
    
    def _parse_card_info(self) -> Dict:
        """Extrae información de la tarjeta"""
        # Buscar patrones:
        # - Línea de Crédito: S/ 10,000.00
        # - Tarjeta: 4147-91**-****-0865
        credit_limit_match = re.search(r'Línea de Crédito\s+S/\s+([\d,]+\.\d{2})', self.text)
        card_number_match = re.search(r'(\d{4}-\d{2}\*\*-\*\*\*\*-\d{4})', self.text)
        
        return {
            'credit_limit': Decimal(credit_limit_match.group(1).replace(',', '')) if credit_limit_match else None,
            'last_four': card_number_match.group(1)[-4:] if card_number_match else None
        }
    
    def _parse_statement_info(self) -> Dict:
        """Extrae fechas y montos principales"""
        # Buscar patrones:
        # - Fecha de Cierre: 10/06/2024
        # - Último día de Pago: 05/07/2024
        # - PAGO MINIMO: 703.08
        # - Pago Total Mes: 4,424.05
        
        close_date_match = re.search(r'Fecha de Cierre\s+(\d{2}/\d{2}/\d{4})', self.text)
        due_date_match = re.search(r'Último día de Pago\s+(\d{2}/\d{2}/\d{4})', self.text)
        min_payment_match = re.search(r'PAGO MINIMO:.*?Soles\s+([\d,]+\.\d{2})', self.text, re.DOTALL)
        total_payment_match = re.search(r'Pago Total Mes\s+([\d,]+\.\d{2})', self.text)
        
        return {
            'statement_date': datetime.strptime(close_date_match.group(1), '%d/%m/%Y').date() if close_date_match else None,
            'due_date': datetime.strptime(due_date_match.group(1), '%d/%m/%Y').date() if due_date_match else None,
            'minimum_payment': Decimal(min_payment_match.group(1).replace(',', '')) if min_payment_match else None,
            'total_payment': Decimal(total_payment_match.group(1).replace(',', '')) if total_payment_match else None
        }
    
    def _parse_balances(self) -> Dict:
        """Extrae saldos de crédito"""
        # Buscar patrones:
        # - Crédito Utilizado: S/ 6,245.82
        # - Crédito Disponible: S/ 3,983.77
        # - SALDO CREDITO UTILIZADO MES ANTERIOR: 3,662.58
        # - INTERESES SI PAGA TOTAL: 187.57
        
        used_match = re.search(r'Crédito Utilizado\s+S/\s+([\d,]+\.\d{2})', self.text)
        available_match = re.search(r'Crédito Disponible\s*S/\s+([\d,]+\.\d{2})', self.text)
        previous_match = re.search(r'SALDO CREDITO UTILIZADO MES ANTERIOR\s+([\d,]+\.\d{2})', self.text)
        interest_match = re.search(r'INTERESES SI PAGA TOTAL\s+([\d,]+\.\d{2})', self.text)
        
        return {
            'current_balance': Decimal(used_match.group(1).replace(',', '')) if used_match else None,
            'available_credit': Decimal(available_match.group(1).replace(',', '')) if available_match else None,
            'previous_balance': Decimal(previous_match.group(1).replace(',', '')) if previous_match else None,
            'interest_charges': Decimal(interest_match.group(1).replace(',', '')) if interest_match else None
        }
    
    def _parse_installments(self) -> List[Dict]:
        """Extrae información de cuotas"""
        # Buscar tabla de cuotas:
        # COMPRA DE DEUDA      BM F           7,305.00 14 de 36  17.63%      189.74       69        258.80
        
        installments = []
        pattern = r'([\w\s*]+?)\s+([\d,]+\.\d{2})\s+(\d+)\s+de\s+(\d+)\s+([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)'
        
        for match in re.finditer(pattern, self.text):
            installments.append({
                'concept': match.group(1).strip(),
                'original_amount': Decimal(match.group(2).replace(',', '')),
                'current_installment': int(match.group(3)),
                'total_installments': int(match.group(4)),
                'interest_rate': Decimal(match.group(5)),
                'monthly_principal': Decimal(match.group(6)),
                'monthly_interest': Decimal(match.group(7)),
                'monthly_payment': Decimal(match.group(8))
            })
        
        return installments
    
    def _parse_transactions(self) -> List[Dict]:
        """Extrae movimientos del mes (opcional para Fase 2)"""
        # Parsear tabla de operaciones
        # 03/06/2024 0865   (C) UNICEF                                                                         100.00
        # 05/06/2024 0865       DISP.PAGOEFECTIVO SOLES                                                        440.00
        
        transactions = []
        # TODO: Implementar si se necesita importar transacciones automáticamente
        return transactions


# Función helper para uso en endpoints
def parse_bbva_statement(pdf_path: str) -> Dict:
    """
    Procesa un estado de cuenta BBVA y retorna datos estructurados
    """
    parser = BBVAStatementParser(pdf_path)
    return parser.parse()
```

#### 1.5 Frontend - Nuevas Páginas

```typescript
// frontend/src/pages/CreditCards.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCardIcon, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';

interface CreditCard {
  id: number;
  name: string;
  bank: string;
  last_four_digits: string;
  credit_limit: number;
  current_balance: number;
  available_credit: number;
  revolving_debt: number;
  payment_due_day: number;
}

interface Installment {
  id: number;
  concept: string;
  original_amount: number;
  current_installment: number;
  total_installments: number;
  monthly_payment: number;
  interest_rate: number;
}

interface CreditCardSummary {
  card: CreditCard;
  active_installments: Installment[];
  total_monthly_installments: number;
  months_to_payoff_minimum: number;
  projected_interest_minimum: number;
}

export default function CreditCards() {
  const { data: cards } = useQuery<CreditCard[]>({
    queryKey: ['credit-cards'],
    queryFn: () => fetch('/api/credit-cards').then(r => r.json())
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tarjetas de Crédito</h1>
      
      {cards?.map(card => (
        <CreditCardCard key={card.id} cardId={card.id} />
      ))}
    </div>
  );
}

function CreditCardCard({ cardId }: { cardId: number }) {
  const { data } = useQuery<CreditCardSummary>({
    queryKey: ['credit-card-summary', cardId],
    queryFn: () => fetch(`/api/credit-cards/${cardId}`).then(r => r.json())
  });

  if (!data) return null;

  const { card, active_installments, total_monthly_installments } = data;
  const usagePercent = (card.current_balance / card.credit_limit) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
            <CreditCardIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{card.name}</h2>
            <p className="text-gray-500">**** **** **** {card.last_four_digits}</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Ver Detalles
        </button>
      </div>

      {/* Credit Limit Progress */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Línea de Crédito</span>
          <span className="text-sm font-semibold">
            S/ {card.current_balance.toLocaleString()} / S/ {card.credit_limit.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full ${
              usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-orange-500' : 'bg-green-500'
            }`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Disponible: S/ {card.available_credit.toLocaleString()} ({(100 - usagePercent).toFixed(1)}%)
        </p>
      </div>

      {/* Debt Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-orange-50 rounded-xl">
          <p className="text-sm text-orange-600 font-semibold mb-1">Deuda Revolvente</p>
          <p className="text-2xl font-bold text-orange-700">
            S/ {card.revolving_debt.toLocaleString()}
          </p>
          <p className="text-xs text-orange-500">TEA 44.99% ⚠️</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-600 font-semibold mb-1">Cuotas Mensuales</p>
          <p className="text-2xl font-bold text-blue-700">
            S/ {total_monthly_installments.toLocaleString()}
          </p>
          <p className="text-xs text-blue-500">{active_installments.length} cuotas activas</p>
        </div>
      </div>

      {/* Active Installments */}
      {active_installments.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Cuotas Activas</h3>
          <div className="space-y-2">
            {active_installments.map(inst => (
              <div key={inst.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{inst.concept}</p>
                  <p className="text-xs text-gray-500">
                    {inst.current_installment}/{inst.total_installments} cuotas • TEA {inst.interest_rate}%
                  </p>
                </div>
                <p className="font-semibold text-blue-600">
                  S/ {inst.monthly_payment.toFixed(2)}/mes
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning if paying minimum */}
      {data.months_to_payoff_minimum > 24 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Alerta: Deuda prolongada</p>
            <p className="text-xs text-amber-700 mt-1">
              Si solo pagas el mínimo, tardarás {data.months_to_payoff_minimum} meses en pagar y 
              pagarás S/ {data.projected_interest_minimum.toLocaleString()} en intereses.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
```

#### 1.6 Migración de Base de Datos

```python
# backend/alembic/versions/XXXX_add_credit_cards.py
"""add credit cards tables

Revision ID: XXXX
Revises: YYYY
Create Date: 2024-XX-XX

"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    # Crear tabla credit_cards
    op.create_table(
        'credit_cards',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('bank', sa.String(), nullable=False),
        sa.Column('card_type', sa.String(), nullable=True),
        sa.Column('last_four_digits', sa.String(4), nullable=True),
        sa.Column('credit_limit', sa.Numeric(10, 2), nullable=False),
        sa.Column('current_balance', sa.Numeric(10, 2), server_default='0'),
        sa.Column('available_credit', sa.Numeric(10, 2), nullable=True),
        sa.Column('revolving_debt', sa.Numeric(10, 2), server_default='0'),
        sa.Column('payment_due_day', sa.Integer(), nullable=True),
        sa.Column('statement_close_day', sa.Integer(), nullable=True),
        sa.Column('revolving_interest_rate', sa.Numeric(5, 2), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_credit_cards_id', 'credit_cards', ['id'])

    # Crear tabla credit_card_statements
    op.create_table(
        'credit_card_statements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('credit_card_id', sa.Integer(), nullable=False),
        sa.Column('statement_date', sa.Date(), nullable=False),
        sa.Column('due_date', sa.Date(), nullable=False),
        sa.Column('previous_balance', sa.Numeric(10, 2), server_default='0'),
        sa.Column('new_charges', sa.Numeric(10, 2), server_default='0'),
        sa.Column('payments_received', sa.Numeric(10, 2), server_default='0'),
        sa.Column('interest_charges', sa.Numeric(10, 2), server_default='0'),
        sa.Column('fees', sa.Numeric(10, 2), server_default='0'),
        sa.Column('new_balance', sa.Numeric(10, 2), server_default='0'),
        sa.Column('minimum_payment', sa.Numeric(10, 2), server_default='0'),
        sa.Column('total_payment', sa.Numeric(10, 2), server_default='0'),
        sa.Column('revolving_balance', sa.Numeric(10, 2), server_default='0'),
        sa.Column('installments_balance', sa.Numeric(10, 2), server_default='0'),
        sa.Column('pdf_file_path', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['credit_card_id'], ['credit_cards.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Crear tabla credit_card_installments
    op.create_table(
        'credit_card_installments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('credit_card_id', sa.Integer(), nullable=False),
        sa.Column('concept', sa.String(), nullable=False),
        sa.Column('original_amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('purchase_date', sa.Date(), nullable=True),
        sa.Column('current_installment', sa.Integer(), server_default='1'),
        sa.Column('total_installments', sa.Integer(), nullable=False),
        sa.Column('monthly_payment', sa.Numeric(10, 2), nullable=False),
        sa.Column('monthly_principal', sa.Numeric(10, 2), nullable=True),
        sa.Column('monthly_interest', sa.Numeric(10, 2), nullable=True),
        sa.Column('interest_rate', sa.Numeric(5, 2), nullable=True),
        sa.Column('remaining_capital', sa.Numeric(10, 2), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['credit_card_id'], ['credit_cards.id']),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('credit_card_installments')
    op.drop_table('credit_card_statements')
    op.drop_table('credit_cards')
```

### Fase 2: Mejoras Futuras (Opcional)

- **Parser automático de PDF**: Subir PDF y parsear automáticamente
- **Link con transacciones**: Vincular pagos de tarjeta con transacciones de cuentas
- **Proyecciones avanzadas**: Simulador "¿Qué pasa si pago X al mes?"
- **Alertas inteligentes**: 
  - "Tu cuota de Hindu Ananda termina en 3 meses"
  - "Si aumentas tu pago en S/ 200, ahorras S/ 1,500 en intereses"
- **Estrategias de pago**: Calculadora de método Avalancha vs Bola de Nieve
- **Gráficos de evolución**: Chart.js mostrando progreso mes a mes
- **Exportación de reportes**: PDF con análisis de deuda

## Consecuencias

### Positivas
- ✅ Visibilidad completa de deudas de tarjetas de crédito
- ✅ Tracking preciso de cuotas vs deuda revolvente
- ✅ Cálculo automático de intereses pagados
- ✅ Proyecciones realistas de pago
- ✅ Alertas de deudas prolongadas
- ✅ Histórico mensual para ver progreso
- ✅ Base sólida para expandir a otras deudas (préstamos, hipotecas)

### Negativas
- ⚠️ Requiere actualización manual mensual vía PDF (Fase 1)
- ⚠️ Parser específico para BBVA (otros bancos necesitarán adaptación)
- ⚠️ No hay sincronización automática con el banco
- ⚠️ Usuario debe registrar pagos en ambos lados (BCP + BBVA)

### Riesgos
- 📌 Parser de PDF puede romperse si BBVA cambia formato
- 📌 Datos pueden estar desactualizados entre cortes mensuales
- 📌 Complejidad adicional en modelo de datos

## Alternativas Consideradas

### Alternativa 1: Cuenta de Tarjeta como Cuenta Negativa
**Pros**: Más simple, usa modelo existente
**Contras**: No distingue cuotas vs revolvente, no calcula intereses

### Alternativa 2: Integración con API de Banco
**Pros**: Datos en tiempo real, automático
**Contras**: BBVA no tiene API pública, requiere credenciales sensibles

### Alternativa 3: Scraping Web
**Pros**: Datos actualizados automáticamente
**Contras**: Frágil, viola TOS del banco, requiere credenciales

## Notas de Implementación

### Orden de Ejecución
1. ✅ Crear modelos SQLAlchemy
2. ✅ Crear schemas Pydantic
3. ✅ Ejecutar migración Alembic
4. ✅ Implementar endpoints básicos (CRUD)
5. ✅ Crear página frontend CreditCards
6. ✅ Probar flujo manual (crear tarjeta, agregar cuotas)
7. ✅ Implementar parser de PDF (Fase 2)
8. ✅ Crear endpoint de upload PDF
9. ✅ Agregar analytics y proyecciones

### Testing
- Unit tests para parser de PDF con diferentes formatos
- Integration tests para endpoints de CRUD
- E2E test del flujo completo: crear tarjeta → agregar cuotas → subir PDF → verificar actualización

### Consideraciones de Seguridad
- PDFs deben guardarse en storage privado (no accesible públicamente)
- Validar que usuario solo acceda a sus propias tarjetas
- Sanitizar datos parseados del PDF

## Referencias
- Estado de cuenta real BBVA Visa Signature (Junio 2024)
- Modelo de deuda de tarjeta de crédito estándar
- Cálculo de intereses compuestos (TEA)
- Estrategias de pago: Avalancha vs Bola de Nieve

## Fecha
2024-11-14

## Autor
GitHub Copilot + Usuario

## Estado de Revisión
- [ ] Revisado por equipo
- [ ] Aprobado para implementación
- [ ] Implementado
- [ ] Validado con usuario
