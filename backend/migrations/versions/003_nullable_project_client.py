"""Make projects.client_id nullable so projects can be created without a client.

Revision ID: 003
Revises: 002
Create Date: 2026-02-10
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("projects") as batch_op:
        batch_op.alter_column("client_id", existing_type=sa.String(64), nullable=True)


def downgrade() -> None:
    # Backfill NULLs before re-adding NOT NULL (avoid constraint violation)
    conn = op.get_bind()
    conn.execute(
        sa.text("UPDATE projects SET client_id = '' WHERE client_id IS NULL")
    )
    with op.batch_alter_table("projects") as batch_op:
        batch_op.alter_column("client_id", existing_type=sa.String(64), nullable=False)
