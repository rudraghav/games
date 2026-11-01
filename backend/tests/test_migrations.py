from room_helpers import require_isolated
from sqlalchemy import text

from app.db import sessions


def test_all_private_tables_have_rls_and_no_public_grants():
    require_isolated()
    with sessions()() as session:
        tables = session.execute(
            text("""SELECT c.relname, c.relrowsecurity
            FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
            WHERE n.nspname='games' AND c.relkind='r'""")
        ).all()
        assert len(tables) == 8
        assert all(rls for _, rls in tables)
        assert not session.execute(
            text("""SELECT 1 FROM information_schema.table_privileges
            WHERE table_schema='games' AND grantee='PUBLIC'""")
        ).all()
        definition = session.execute(
            text("SELECT pg_get_functiondef('games.notify_room()'::regprocedure)")
        ).scalar_one()
        assert "'roomId'" in definition and "'version'" in definition
        assert "NEW.state" not in definition and "SECURITY DEFINER" not in definition
