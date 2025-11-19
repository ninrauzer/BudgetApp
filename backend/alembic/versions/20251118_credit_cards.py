"""add credit cards tables

Revision ID: 20251118_credit_cards
Revises: # TODO: Update with latest revision
Create Date: 2025-11-18

Implementa ADR-004: Sistema de Gestión de Tarjetas de Crédito

Tablas creadas:
- credit_cards: Información de tarjetas de crédito
- credit_card_statements: Estados de cuenta mensuales
- credit_card_installments: Compras en cuotas
"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime


# revision identifiers, used by Alembic.
revision = '20251118_credit_cards'
down_revision = None  # TODO: Update with latest migration
branch_labels = None
depends_on = None


def upgrade():
    # ========================================================================
    # Tabla: credit_cards
    # ========================================================================
    op.create_table(
        'credit_cards',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        
        # Información de tarjeta
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('bank', sa.String(), nullable=False),
        sa.Column('card_type', sa.String(), nullable=True),
        sa.Column('last_four_digits', sa.String(4), nullable=True),
        
        # Límites de crédito
        sa.Column('credit_limit', sa.Numeric(10, 2), nullable=False),
        sa.Column('current_balance', sa.Numeric(10, 2), server_default='0', nullable=False),
        sa.Column('available_credit', sa.Numeric(10, 2), nullable=True),
        sa.Column('revolving_debt', sa.Numeric(10, 2), server_default='0', nullable=False),
        
        # Configuración de pagos
        sa.Column('payment_due_day', sa.Integer(), nullable=True),
        sa.Column('statement_close_day', sa.Integer(), nullable=True),
        
        # Tasas de interés
        sa.Column('revolving_interest_rate', sa.Numeric(5, 2), nullable=True),
        
        # Estado
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        
        # Metadata
        sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow),
        
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_index('ix_credit_cards_id', 'credit_cards', ['id'])
    op.create_index('ix_credit_cards_is_active', 'credit_cards', ['is_active'])
    
    # ========================================================================
    # Tabla: credit_card_statements
    # ========================================================================
    op.create_table(
        'credit_card_statements',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('credit_card_id', sa.Integer(), nullable=False),
        
        # Fechas
        sa.Column('statement_date', sa.Date(), nullable=False),
        sa.Column('due_date', sa.Date(), nullable=False),
        
        # Saldos
        sa.Column('previous_balance', sa.Numeric(10, 2), server_default='0', nullable=False),
        sa.Column('new_charges', sa.Numeric(10, 2), server_default='0', nullable=False),
        sa.Column('payments_received', sa.Numeric(10, 2), server_default='0', nullable=False),
        sa.Column('interest_charges', sa.Numeric(10, 2), server_default='0', nullable=False),
        sa.Column('fees', sa.Numeric(10, 2), server_default='0', nullable=False),
        sa.Column('new_balance', sa.Numeric(10, 2), server_default='0', nullable=False),
        
        # Pagos
        sa.Column('minimum_payment', sa.Numeric(10, 2), server_default='0', nullable=False),
        sa.Column('total_payment', sa.Numeric(10, 2), server_default='0', nullable=False),
        
        # Desglose
        sa.Column('revolving_balance', sa.Numeric(10, 2), server_default='0', nullable=False),
        sa.Column('installments_balance', sa.Numeric(10, 2), server_default='0', nullable=False),
        
        # Archivo original
        sa.Column('pdf_file_path', sa.String(), nullable=True),
        
        # Campos para parser de IA (ADR-006)
        sa.Column('raw_text', sa.Text(), nullable=True),
        sa.Column('ai_parsed', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('ai_confidence', sa.Numeric(3, 2), nullable=True),
        sa.Column('parsing_errors', sa.JSON(), nullable=True),
        sa.Column('manual_review_required', sa.Boolean(), server_default='false', nullable=False),
        
        # Metadata
        sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        
        sa.ForeignKeyConstraint(['credit_card_id'], ['credit_cards.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_index('ix_statements_card_id', 'credit_card_statements', ['credit_card_id'])
    op.create_index('ix_statements_date', 'credit_card_statements', ['statement_date'])
    
    # ========================================================================
    # Tabla: credit_card_installments
    # ========================================================================
    op.create_table(
        'credit_card_installments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('credit_card_id', sa.Integer(), nullable=False),
        
        # Información de la compra
        sa.Column('concept', sa.String(), nullable=False),
        sa.Column('original_amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('purchase_date', sa.Date(), nullable=True),
        
        # Cuotas
        sa.Column('current_installment', sa.Integer(), server_default='1', nullable=False),
        sa.Column('total_installments', sa.Integer(), nullable=False),
        sa.Column('monthly_payment', sa.Numeric(10, 2), nullable=False),
        sa.Column('monthly_principal', sa.Numeric(10, 2), nullable=True),
        sa.Column('monthly_interest', sa.Numeric(10, 2), nullable=True),
        
        # Tasas
        sa.Column('interest_rate', sa.Numeric(5, 2), nullable=True),
        
        # Saldos
        sa.Column('remaining_capital', sa.Numeric(10, 2), nullable=True),
        
        # Estado
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        
        # Metadata
        sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.Column('updated_at', sa.DateTime(), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow),
        
        sa.ForeignKeyConstraint(['credit_card_id'], ['credit_cards.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_index('ix_installments_card_id', 'credit_card_installments', ['credit_card_id'])
    op.create_index('ix_installments_is_active', 'credit_card_installments', ['is_active'])


def downgrade():
    # Drop en orden inverso por foreign keys
    op.drop_index('ix_installments_is_active', table_name='credit_card_installments')
    op.drop_index('ix_installments_card_id', table_name='credit_card_installments')
    op.drop_table('credit_card_installments')
    
    op.drop_index('ix_statements_date', table_name='credit_card_statements')
    op.drop_index('ix_statements_card_id', table_name='credit_card_statements')
    op.drop_table('credit_card_statements')
    
    op.drop_index('ix_credit_cards_is_active', table_name='credit_cards')
    op.drop_index('ix_credit_cards_id', table_name='credit_cards')
    op.drop_table('credit_cards')
