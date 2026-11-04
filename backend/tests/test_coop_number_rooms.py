"""Cooperative defeat and private simultaneous selections survive persistence."""

import json
from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from room_helpers import player, require_isolated, seated_room
from sqlalchemy import select

from app.db import sessions
from app.games.registry import ENGINES
from app.main import app
from app.models import Match, Receipt
from app.rooms.schemas import PublicMoveView


@pytest.fixture
def client():
    require_isolated()
    with TestClient(app) as client:
        yield client


def test_gang_natural_team_defeat_finishes_and_is_saved_in_every_players_history(
    client, monkeypatch
):
    # Fix only the ordinary setup shuffle. Every state transition below is a
    # legal HTTP action, with no injected near-terminal engine/database state.
    engine = ENGINES["the-gang"]
    setup = engine.setup
    monkeypatch.setattr(engine, "setup", lambda players, settings: setup(players, settings, seed=0))
    room, headers = seated_room(client, "the-gang", 3)
    path = f"/v1/rooms/{room['id']}"
    ids = [client.get("/v1/me", headers=h).json()["profile"]["id"] for h in headers]
    actors = dict(zip(ids, headers, strict=True))
    for _ in range(100):
        view = room["game"]
        if view["phase"] == "finished":
            break
        actor = view["current_player"]
        room = client.get(path, headers=actors[actor]).json()
        options = room["game"]["actions"]
        if room["game"]["phase"] == "chips":
            assigned = set(room["game"]["detail"]["chips"].values())
            options = [
                o
                for o in options
                if o["action"]["type"] == "claim_chip" and o["action"]["amount"] not in assigned
            ]
        response = client.post(
            path + "/actions",
            headers=actors[actor],
            json={
                "match_id": room["match_id"],
                "expected_version": room["match_version"],
                "action_id": str(uuid4()),
                "action": options[0]["action"],
            },
        )
        assert response.status_code == 200, response.text
        room = response.json()
    else:
        pytest.fail("The seeded basic match did not reach its natural defeat")

    assert room["status"] == "finished" and room["game"]["phase"] == "finished"
    assert room["game"]["detail"]["alarms"] == 3
    assert room["game"]["detail"]["vaults"] == 2
    assert room["game"]["winners"] == []
    assert all(p["score"] == 2 for p in room["game"]["players"])
    for header in headers:
        history = client.get("/v1/me", headers=header).json()["history"]
        result = next(item for item in history if item["id"] == room["match_id"])
        assert result["winners"] == [] and result["score"] == 2
    with sessions()() as session:
        saved = session.get(Match, room["match_id"])
        assert saved.result == {"winners": [], "scores": dict.fromkeys(ids, 2)}
    with TestClient(app) as restarted:
        restored = restarted.get(path, headers=headers[1]).json()
        assert restored["status"] == "finished" and restored["game"]["winners"] == []
        assert restored["match_version"] == room["match_version"]


def test_six_private_simultaneous_choices_conflict_retry_restart_and_reveal(client):
    room, headers = seated_room(client, "six-nimmt", 3)
    path = f"/v1/rooms/{room['id']}"
    ids = [client.get("/v1/me", headers=h).json()["profile"]["id"] for h in headers]
    views = [client.get(path, headers=h).json()["game"] for h in headers]
    choices = [view["actions"][0]["action"] for view in views]
    bodies = [
        {
            "match_id": room["match_id"],
            "expected_version": 1,
            "action_id": str(uuid4()),
            "action": action,
        }
        for action in choices
    ]

    def send(index):
        return client.post(path + "/actions", headers=headers[index], json=bodies[index])

    with ThreadPoolExecutor(max_workers=2) as pool:
        responses = list(pool.map(send, [0, 1]))
    assert sorted(r.status_code for r in responses) == [200, 409]
    committed = next(i for i, response in enumerate(responses) if response.status_code == 200)
    rejected = 1 - committed
    own = client.get(path, headers=headers[committed]).json()["game"]
    assert own["actions"] == []
    assert own["detail"]["own_selection"]["id"] == choices[committed]["card"]
    waiting = client.get(path, headers=headers[2])
    assert waiting.headers["cache-control"] == "private, no-store"
    public = waiting.json()["game"]
    assert public["phase"] == "selecting" and public["community"] == []
    assert public["detail"]["selected_players"] == [ids[committed]]
    assert public["detail"]["own_selection"] is None
    early = PublicMoveView.model_validate(waiting.json()["activity"][0])
    assert early.model_dump() == {
        "version": 2, "actor_id": ids[committed], "type": "select_number",
        "label": "Locked a secret number", "targets": [], "amount": None,
        "cards": [], "destination": None, "count": 1,
    }
    with sessions()() as session:
        receipt = session.get(Receipt, (room["match_id"], bodies[committed]["action_id"]))
        assert set(receipt.response) == {"committedVersion", "public_move"}
        assert receipt.response["public_move"] == early.model_dump()
        assert all(choice["card"] not in json.dumps(receipt.response) for choice in choices)
    assert f'"{choices[committed]["card"]}"' not in waiting.text
    for private_key in ('"hands"', '"selected"', '"deck"', '"seed"', '"pending"'):
        assert private_key not in waiting.text
    assert client.get(path, headers=player(client)).status_code == 404
    assert send(committed).json()["match_version"] == 2
    assert (
        client.post(path + "/actions", headers=headers[2], json=bodies[committed]).status_code
        == 409
    )

    with TestClient(app) as restarted:
        assert restarted.get(path, headers=headers[committed]).json()["game"] == own
        hidden = restarted.get(path, headers=headers[2]).json()["game"]
        assert hidden["detail"]["own_selection"] is None and hidden["community"] == []

    for actor, version in [(rejected, 2), (2, 3)]:
        body = {**bodies[actor], "expected_version": version, "action_id": str(uuid4())}
        response = client.post(path + "/actions", headers=headers[actor], json=body)
        assert response.status_code == 200, response.text
        assert response.json()["match_version"] == version + 1
    revealed = response.json()["game"]
    assert revealed["phase"] in {"take_row", "review"}
    assert {c["id"] for c in revealed["community"]} == {a["card"] for a in choices}
    numbers = [int(c["value"]) for c in revealed["community"]]
    assert numbers == sorted(numbers)
    assert revealed["detail"]["own_selection"] is None
    assert send(committed).json()["match_version"] == 4
    with sessions()() as session:
        saved = session.get(Match, room["match_id"])
        receipts = list(
            session.scalars(select(Receipt).where(Receipt.match_id == room["match_id"]))
        )
        assert saved.version == 4 and len(receipts) == 3
        assert {receipt.response["committedVersion"] for receipt in receipts} == {2, 3, 4}
        for receipt in receipts:
            assert set(receipt.response) == {"committedVersion", "public_move"}
            event = PublicMoveView.model_validate(receipt.response["public_move"])
            assert event.version == receipt.response["committedVersion"]
            assert event.type == "select_number" and event.targets == []
            assert event.amount is None and event.destination is None
            if event.version < 4:
                assert event.cards == [] and event.count == 1 and event.label == "Locked a secret number"
                assert all(choice["card"] not in json.dumps(receipt.response) for choice in choices)
            else:
                assert {card.id for card in event.cards} == {choice["card"] for choice in choices}
                assert event.count == 3 and event.label == "Everyone’s numbers were revealed"
