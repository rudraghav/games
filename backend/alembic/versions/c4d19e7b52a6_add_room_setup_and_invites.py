"""Usernames, bot difficulty and username invitations.

Revision ID: c4d19e7b52a6
Revises: a6e442b15d80
"""

import sqlalchemy as sa

from alembic import op

revision = "c4d19e7b52a6"
down_revision = "a6e442b15d80"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Both columns join existing private, RLS-protected tables and add no grant or
    # policy. Existing profiles keep no username; existing bots keep the full policy.
    op.add_column(
        "profiles", sa.Column("username", sa.String(length=20), nullable=True), schema="games"
    )
    op.create_unique_constraint(
        "profiles_username_key", "profiles", ["username"], schema="games"
    )
    op.add_column(
        "room_members", sa.Column("bot_level", sa.String(length=8), nullable=True), schema="games"
    )
    op.create_table(
        "room_invites",
        sa.Column("room_id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("invited_by", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["room_id"], ["games.rooms.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["games.profiles.id"]),
        sa.ForeignKeyConstraint(["invited_by"], ["games.profiles.id"]),
        sa.PrimaryKeyConstraint("room_id", "user_id"),
        schema="games",
    )
    op.create_index(
        "ix_games_room_invites_user_id", "room_invites", ["user_id"], schema="games"
    )
    # Private like every other Games table: only the API's own role reads it.
    op.execute("ALTER TABLE games.room_invites ENABLE ROW LEVEL SECURITY")
    op.execute("REVOKE ALL ON games.room_invites FROM PUBLIC")
    op.execute("""
    DO $migration$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        EXECUTE 'REVOKE ALL ON games.room_invites FROM anon';
      END IF;
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        EXECUTE 'REVOKE ALL ON games.room_invites FROM authenticated';
      END IF;
    END $migration$;
    """)


def downgrade() -> None:
    raise RuntimeError(
        "Forward-only application data migration; use a reviewed corrective revision."
    )
