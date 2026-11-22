"""Earned rewards a player has redeemed and what they wear.

Revision ID: 3002383be1bd
Revises: c4d19e7b52a6
"""

import sqlalchemy as sa

from alembic import op

revision = "3002383be1bd"
down_revision = "c4d19e7b52a6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # One column on the existing private, RLS-protected profiles table: no new
    # grant or policy. Existing profiles start with nothing redeemed or worn.
    # Stored shape: {"claimed": [reward ids], "frame": id or null, "card_back": id or null}.
    op.add_column(
        "profiles",
        sa.Column("cosmetics", sa.JSON(), nullable=False, server_default="{}"),
        schema="games",
    )


def downgrade() -> None:
    raise RuntimeError(
        "Forward-only application data migration; use a reviewed corrective revision."
    )
