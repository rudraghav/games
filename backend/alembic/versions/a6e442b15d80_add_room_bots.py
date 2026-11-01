"""Persist room-owned bots and bounded bot turns.

Revision ID: a6e442b15d80
Revises: 7066963c5ae4
"""

import sqlalchemy as sa

from alembic import op

revision = "a6e442b15d80"
down_revision = "7066963c5ae4"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Existing human memberships and matches retain their behavior. These columns
    # stay in the existing private/RLS-protected tables; no new grants or policies.
    op.add_column(
        "room_members",
        sa.Column("is_bot", sa.Boolean(), nullable=False, server_default=sa.false()),
        schema="games",
    )
    op.add_column(
        "matches",
        sa.Column("bot_memory", sa.JSON(), nullable=False, server_default="{}"),
        schema="games",
    )
    op.add_column(
        "matches",
        sa.Column("bot_due_at", sa.Float(), nullable=False, server_default="0"),
        schema="games",
    )


def downgrade() -> None:
    raise RuntimeError(
        "Forward-only application data migration; use a reviewed corrective revision."
    )
