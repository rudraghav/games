import random
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from room_helpers import player, require_isolated, seated_room
from test_playthroughs import choose

from app.core.contracts import GameView
from app.db import sessions
from app.games.registry import ENGINES
from app.main import app
from app.models import Match, Receipt


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
        rejected = client.post(path + "/actions", headers=actor, json={
            **action, "action_id": str(uuid4()), "expected_version": 2,
            "action": {"type": "invalid_private_canary"},
        })
        assert rejected.status_code == 422
        assert len(client.get(path, headers=actor).json()["activity"]) == 1
        waiting = player(client)
        joined = client.post("/v1/rooms/join", headers=waiting,
                             json={"invite": room["code"], "name": "Waiting guest"})
        assert joined.status_code == 200
        for view in (joined.json(), client.get(path, headers=waiting).json()):
            assert view["game"] is None and view["activity"] == []
            assert view["last_action"] is None
            assert not view["bot_pending"] and view["bot_due_at"] is None
        # Fresh service/session reconstructs the event from committed receipts.
        with TestClient(app) as fresh:
            assert fresh.get(path, headers=actor).json()["last_action"] == cue
        # A pre-release receipt has no event; never invent a historical action.
        with sessions()() as session, session.begin():
            saved = session.get(Receipt, (room["match_id"], action["action_id"]))
            saved.response = {"committedVersion": 2}
        assert client.get(path, headers=actor).json()["last_action"] is None


@pytest.mark.parametrize("game_id", list(ENGINES))
def test_every_game_persists_public_activity_for_members_after_a_real_legal_action(game_id):
    require_isolated()
    count = ENGINES[game_id].manifest.min_players
    with TestClient(app) as client:
        room, headers = seated_room(client, game_id, count)
        actor_index = next(i for i, header in enumerate(headers)
                           if client.get("/v1/me", headers=header).json()["profile"]["id"]
                           == room["game"]["current_player"])
        actor = headers[actor_index]
        actor_view = client.get(f"/v1/rooms/{room['id']}", headers=actor).json()
        action = choose(GameView.model_validate(actor_view["game"]), random.Random(73))
        path = f"/v1/rooms/{room['id']}"
        payload = {"match_id": room["match_id"], "action_id": str(uuid4()),
                   "expected_version": room["match_version"], "action": action.model_dump()}
        response = client.post(path + "/actions", headers=actor, json=payload)
        assert response.status_code == 200, response.text
        moved = response.json()
        assert len(moved["activity"]) == 1
        event = moved["activity"][0]
        assert event["version"] == moved["match_version"] == 2
        assert event["actor_id"] == actor_view["game"]["current_player"]
        assert event["type"] == action.type
        assert len(event["cards"]) <= 12
        # Identical retries return the same one event, not a duplicated append.
        assert client.post(path + "/actions", headers=actor, json=payload).json()["activity"] == [event]
        for header in headers:
            assert client.get(path, headers=header).json()["activity"] == [event]
        conflict = client.post(path + "/actions", headers=actor,
                               json={**payload, "action_id": str(uuid4())})
        assert conflict.status_code == 409
        assert client.get(path, headers=actor).json()["activity"] == [event]
        with TestClient(app) as fresh:
            assert fresh.get(path, headers=actor).json()["activity"] == [event]
        assert client.get(path, headers=player(client)).status_code == 404


def test_history_is_bounded_ordered_and_hidden_from_waiting_members_and_legacy_receipts():
    require_isolated()
    with TestClient(app) as client:
        room, headers = seated_room(client, "holdem", 2)
        path = f"/v1/rooms/{room['id']}"
        owner = client.get("/v1/me", headers=headers[0]).json()["profile"]["id"]
        with sessions()() as session, session.begin():
            for version in range(2, 106):
                session.add(Receipt(match_id=room["match_id"], action_id=str(uuid4()),
                                    actor_id=owner, fingerprint="0" * 64,
                                    response={"committedVersion": version, "public_move": {
                                        "version": version, "actor_id": owner, "type": "check",
                                        "label": "Checked", "targets": [], "cards": [],
                                        "amount": None, "count": None, "destination": None,
                                    }}))
            # Legacy and malformed optional rows are not invented into history.
            session.add(Receipt(match_id=room["match_id"], action_id=str(uuid4()),
                                actor_id=owner, fingerprint="1" * 64,
                                response={"committedVersion": 106}))
        view = client.get(path, headers=headers[0]).json()
        assert [event["version"] for event in view["activity"]] == list(range(26, 106))
        waiting = player(client)
        joined = client.post("/v1/rooms/join", headers=waiting,
                             json={"invite": room["code"], "name": "Waiting guest"})
        assert joined.status_code == 200
        assert joined.json()["game"] is None and joined.json()["activity"] == []
        assert client.get(path, headers=waiting).json()["activity"] == []
        # Starting another match resets the visible history without deleting
        # receipts or manufacturing events for the abandoned match.
        assert client.post(path + "/abandon", headers=headers[0]).status_code == 200
        for header in headers:
            assert client.put(path + "/ready", headers=header, json={"ready": True}).status_code == 200
        restarted = client.post(path + "/start", headers=headers[0])
        assert restarted.status_code == 200
        assert restarted.json()["match_id"] != room["match_id"]
        assert restarted.json()["activity"] == []


def test_bot_commits_share_public_history_and_duplicate_drives_do_not_replay_events():
    require_isolated()
    with TestClient(app) as client:
        human = player(client)
        room = client.post("/v1/rooms", headers=human, json={
            "name": "Human", "game_id": "holdem", "capacity": 2, "bots": 1,
        }).json()
        path = f"/v1/rooms/{room['id']}"
        assert client.put(path + "/ready", headers=human, json={"ready": True}).status_code == 200
        current = client.post(path + "/start", headers=human).json()
        human_id = client.get("/v1/me", headers=human).json()["profile"]["id"]
        if current["game"]["current_player"] == human_id:
            action = next(option["action"] for option in current["game"]["actions"]
                          if option["action"]["type"] in {"call", "check"})
            moved = client.post(path + "/actions", headers=human, json={
                "match_id": current["match_id"], "expected_version": current["match_version"],
                "action_id": str(uuid4()), "action": action,
            })
            assert moved.status_code == 200
            current = moved.json()
        assert current["game"]["current_player"].startswith("bot:")
        waiting = player(client)
        joined = client.post("/v1/rooms/join", headers=waiting,
                             json={"invite": current["code"], "name": "Waiting guest"})
        assert joined.status_code == 200
        assert current["bot_pending"]
        assert not joined.json()["bot_pending"]
        assert joined.json()["bot_due_at"] is None
        assert joined.json()["last_action"] is None
        with sessions()() as session, session.begin():
            session.get(Match, current["match_id"]).bot_due_at = 0
        payload = {"match_id": current["match_id"], "expected_version": current["match_version"]}
        driven = client.post(path + "/bots/drive", headers=human, json=payload)
        assert driven.status_code == 200
        activity = driven.json()["activity"]
        assert activity[-1]["actor_id"].startswith("bot:")
        assert activity[-1]["version"] == current["match_version"] + 1
        assert client.post(path + "/bots/drive", headers=human, json=payload).json()["activity"] == activity
