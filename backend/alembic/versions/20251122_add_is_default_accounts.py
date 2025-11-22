"""add is_default to accounts

Revision ID: 20251122_add_is_default_accounts
Revises: 20251118_credit_cards
Create Date: 2025-11-22

Agrega el campo is_default a la tabla accounts para permitir marcar
una cuenta como predeterminada. Solo una cuenta puede ser default a la vez.
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20251122_add_is_default_accounts'
down_revision = '20251118_credit_cards'
branch_labels = None
depends_on = None


def upgrade():
    """Add is_default column to accounts table."""
    op.add_column('accounts', sa.Column('is_default', sa.Boolean(), server_default='false', nullable=False))


def downgrade():
    """Remove is_default column from accounts table."""
    op.drop_column('accounts', 'is_default')
