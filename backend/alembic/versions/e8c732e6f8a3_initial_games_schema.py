"""initial_games_schema

Revision ID: e8c732e6f8a3
Revises:
Create Date: 2026-10-31 13:53:36.242071

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e8c732e6f8a3'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE SCHEMA games")
    op.create_table("profiles", sa.Column("id", sa.String(36), primary_key=True), sa.Column("name", sa.String(30), nullable=False), sa.Column("avatar", sa.Integer(), nullable=False), sa.Column("created_at", sa.Float(), nullable=False), schema="games")
    op.create_table("rooms", sa.Column("id", sa.String(36), primary_key=True), sa.Column("code", sa.String(8), nullable=False, unique=True), sa.Column("name", sa.String(60), nullable=False), sa.Column("owner_id", sa.String(36), sa.ForeignKey("games.profiles.id"), nullable=False), sa.Column("game_id", sa.String(32), nullable=False), sa.Column("settings", sa.JSON(), nullable=False), sa.Column("capacity", sa.Integer(), nullable=False), sa.Column("status", sa.String(16), nullable=False), sa.Column("revision", sa.Integer(), nullable=False), sa.Column("round_number", sa.Integer(), nullable=False), sa.Column("match_id", sa.String(36)), sa.Column("invite_hash", sa.String(64), nullable=False, unique=True), sa.Column("invite_ciphertext", sa.String(256), nullable=False), sa.Column("created_at", sa.Float(), nullable=False), schema="games")
    op.create_table("room_members", sa.Column("room_id", sa.String(36), sa.ForeignKey("games.rooms.id", ondelete="CASCADE"), primary_key=True), sa.Column("user_id", sa.String(36), sa.ForeignKey("games.profiles.id"), primary_key=True), sa.Column("ready", sa.Boolean(), nullable=False), sa.Column("seated", sa.Boolean(), nullable=False), sa.Column("active", sa.Boolean(), nullable=False), sa.Column("joined_at", sa.Float(), nullable=False), sa.Column("seen_at", sa.Float(), nullable=False), schema="games")
    op.create_table("matches", sa.Column("id", sa.String(36), primary_key=True), sa.Column("room_id", sa.String(36), sa.ForeignKey("games.rooms.id", ondelete="CASCADE"), nullable=False), sa.Column("game_id", sa.String(32), nullable=False), sa.Column("rules_version", sa.String(16), nullable=False), sa.Column("version", sa.Integer(), nullable=False), sa.Column("state", sa.JSON(), nullable=False), sa.Column("participants", sa.JSON(), nullable=False), sa.Column("result", sa.JSON()), sa.Column("created_at", sa.Float(), nullable=False), schema="games")
    op.create_index("ix_games_matches_room_id", "matches", ["room_id"], schema="games")
    op.create_table("action_receipts", sa.Column("match_id", sa.String(36), sa.ForeignKey("games.matches.id", ondelete="CASCADE"), primary_key=True), sa.Column("action_id", sa.String(36), primary_key=True), sa.Column("actor_id", sa.String(36), nullable=False), sa.Column("fingerprint", sa.String(64), nullable=False), sa.Column("response", sa.JSON(), nullable=False), schema="games")
    op.create_table("messages", sa.Column("id", sa.String(36), primary_key=True), sa.Column("room_id", sa.String(36), sa.ForeignKey("games.rooms.id", ondelete="CASCADE"), nullable=False), sa.Column("user_id", sa.String(36), sa.ForeignKey("games.profiles.id"), nullable=False), sa.Column("body", sa.String(300), nullable=False), sa.Column("kind", sa.String(16), nullable=False), sa.Column("created_at", sa.Float(), nullable=False), schema="games")
    op.create_index("ix_games_messages_room_id", "messages", ["room_id"], schema="games")
    op.create_table("rate_buckets", sa.Column("key", sa.String(64), primary_key=True), sa.Column("window", sa.Integer(), primary_key=True), sa.Column("count", sa.Integer(), nullable=False), sa.UniqueConstraint("key", "window"), schema="games")
    for table in ["profiles", "rooms", "room_members", "matches", "action_receipts", "messages", "rate_buckets"]:
        op.execute(f"ALTER TABLE games.{table} ENABLE ROW LEVEL SECURITY")
    op.execute("REVOKE ALL ON SCHEMA games FROM PUBLIC")
    op.execute("REVOKE ALL ON ALL TABLES IN SCHEMA games FROM PUBLIC")
    # Supabase owns auth/realtime. Plain local Postgres exercises persistence without inventing them.
    op.execute("""
    DO $migration$ BEGIN
      IF to_regprocedure('auth.uid()') IS NOT NULL THEN
        EXECUTE 'GRANT USAGE ON SCHEMA games TO authenticated';
        EXECUTE 'GRANT SELECT ON games.room_members TO authenticated';
        EXECUTE 'CREATE POLICY games_membership_self ON games.room_members FOR SELECT TO authenticated USING (user_id = (select auth.uid())::text AND active)';
        EXECUTE 'CREATE POLICY games_room_receivers ON realtime.messages FOR SELECT TO authenticated USING (realtime.topic() LIKE ''room:%'' AND EXISTS (SELECT 1 FROM games.room_members m WHERE m.room_id = substring(realtime.topic() from 6) AND m.user_id = (select auth.uid())::text AND m.active))';
        EXECUTE 'CREATE POLICY games_room_presence ON realtime.messages FOR INSERT TO authenticated WITH CHECK (extension = ''presence'' AND EXISTS (SELECT 1 FROM games.room_members m WHERE m.room_id = substring(realtime.topic() from 6) AND m.user_id = (select auth.uid())::text AND m.active))';
      END IF;
    END $migration$;
    """)
    op.execute("""
    CREATE FUNCTION games.notify_room() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $body$
    BEGIN
      IF to_regprocedure('realtime.send(jsonb,text,text,boolean)') IS NOT NULL THEN
        PERFORM realtime.send(jsonb_build_object('roomId', NEW.id, 'version', NEW.revision), 'state_changed', 'room:' || NEW.id, true);
      END IF;
      RETURN NEW;
    END $body$;
    REVOKE ALL ON FUNCTION games.notify_room() FROM PUBLIC;
    CREATE TRIGGER games_room_revision AFTER INSERT OR UPDATE OF revision ON games.rooms FOR EACH ROW EXECUTE FUNCTION games.notify_room();
    """)


def downgrade() -> None:
    """Downgrade schema."""
    raise RuntimeError("The initial Games schema is forward-only. Restore a reviewed backup to retire it.")
