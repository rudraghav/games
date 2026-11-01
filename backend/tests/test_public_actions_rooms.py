from uuid import uuid4

from fastapi.testclient import TestClient
from room_helpers import player, require_isolated, seated_room

from app.db import sessions
from app.main import app
from app.models import Receipt


def test_public_action_is_durable_membership_scoped_versioned_and_retry_safe():
    require_isolated()
    with TestClient(app) as client:
        room, headers = seated_room(client, "holdem", 3)
        actor = next(
            h
            for h in headers
            if client.get("/v1/me", headers=h).json()["profile"]["id"]
            == room["game"]["current_player"]
        )
        path = f"/v1/rooms/{room['id']}"
        action = {
            "match_id": room["match_id"],
            "action_id": str(uuid4()),
            "expected_version": room["match_version"],
            "action": {"type": "call"},
        }
        moved = client.post(path + "/actions", headers=actor, json=action)
        assert moved.status_code == 200
        snapshot = moved.json()
        cue = snapshot["last_action"]
        assert cue == {
            "version": 2,
            "actor_id": room["game"]["current_player"],
            "type": "call",
            "amount": 2,
        }
        assert (
            client.post(path + "/actions", headers=actor, json=action).json()["last_action"] == cue
        )
        for h in headers:
            assert client.get(path, headers=h).json()["last_action"] == cue
        assert client.get(path, headers=player(client)).status_code == 404
        assert set(cue) == {"version", "actor_id", "type", "amount"}
        # Fresh service/session reconstructs the event from committed receipts.
        with TestClient(app) as fresh:
            assert fresh.get(path, headers=actor).json()["last_action"] == cue
        # A pre-release receipt has no event; never invent a historical action.
        with sessions()() as session, session.begin():
            saved = session.get(Receipt, (room["match_id"], action["action_id"]))
            saved.response = {"committedVersion": 2}
        assert client.get(path, headers=actor).json()["last_action"] is None
