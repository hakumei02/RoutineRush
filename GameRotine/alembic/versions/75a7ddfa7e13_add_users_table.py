"""add users table

Revision ID: 75a7ddfa7e13
Revises: 293a8b6644f3
Create Date: 2026-08-10 16:40:31.827296

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '75a7ddfa7e13'
down_revision: Union[str, Sequence[str], None] = '293a8b6644f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
