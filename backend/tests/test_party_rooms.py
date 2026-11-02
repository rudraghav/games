"""Persisted simultaneous party decisions must stay private across retries/restarts."""

from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from room_helpers import player, require_isolated, seated_room
from sqlalchemy import select

from app.db import sessions
from app.main import app
from app.models import Match, Receipt
from app.rooms.schemas import PublicMoveView


@pytest.fixture
def client():
    require_isolated()
    with TestClient(app) as client:
        yield client


@pytest.mark.parametrize("game_id", ["most-likely", "hot-seat"])
def test_simultaneous_private_choices_retries_and_lifespan_restart(client, game_id):
    room, headers = seated_room(client, game_id, 3)
    path = f"/v1/rooms/{room['id']}"
    ids = [client.get("/v1/me", headers=h).json()["profile"]["id"] for h in headers]
    assert room["game"]["detail"]["spotlight"] == ids[0]
    actions = (
        [{"type": "vote", "target": ids[1]}, {"type": "vote", "target": ids[0]}]
        if game_id == "most-likely"
        else [{"type": "choose", "choice": "a"}, {"type": "predict", "choice": "b"}]
    )
    actors = [0, 2]
    bodies = [{"match_id": room["match_id"], "expected_version": 1,
               "action_id": str(uuid4()), "action": action} for action in actions]

    def send(index):
        return client.post(path + "/actions", headers=headers[actors[index]], json=bodies[index])

    with ThreadPoolExecutor(max_workers=2) as pool:
        responses = list(pool.map(send, [0, 1]))
    assert sorted(r.status_code for r in responses) == [200, 409]
    committed = next(i for i, response in enumerate(responses) if response.status_code == 200)
    rejected = 1 - committed

    # A waiting third player sees status, not either contender's secret value.
    waiting = client.get(path, headers=headers[1])
    assert waiting.headers["cache-control"] == "private, no-store"
    hidden = waiting.json()["game"]
    assert hidden["detail"]["result"] is None and hidden["detail"]["own_choice"] is None
    assert len(hidden["detail"]["submitted"]) == 1
    assert all(p["score"] == 0 for p in hidden["players"])
    # Durable history describes the lock, never its private target or answer.
    event = PublicMoveView.model_validate(waiting.json()["activity"][0])
    assert event.actor_id == ids[actors[committed]] and event.version == 2
    assert event.type == actions[committed]["type"]
    assert event.targets == [] and event.cards == []
    assert event.amount is None and event.destination is None and event.count is None
    assert event.label in {"Locked a choice", "Locked a prediction"}
    with sessions()() as session:
        receipt = session.get(Receipt, (room["match_id"], bodies[committed]["action_id"]))
        assert set(receipt.response) == {"committedVersion", "public_move"}
        assert receipt.response["public_move"] == event.model_dump()
    for forbidden in ('"decisions"', '"choices"', '"deck"', '"history"', '"seed"'):
        assert forbidden not in waiting.text
    outsider = player(client)
    assert client.get(path, headers=outsider).status_code == 404

    # Retrying the exact committed action is safe; another actor cannot claim its receipt.
    retry = send(committed)
    assert retry.status_code == 200 and retry.json()["match_version"] == 2
    assert client.post(path + "/actions", headers=headers[1], json=bodies[committed]).status_code == 409
    before_restart = client.get(path, headers=headers[actors[committed]]).json()["game"]
    with TestClient(app) as restarted:
        restored = restarted.get(path, headers=headers[actors[committed]])
        assert restored.status_code == 200 and restored.json()["game"] == before_restart
        private_other = restarted.get(path, headers=headers[1]).json()["game"]["detail"]
        assert private_other["result"] is None and private_other["own_choice"] is None

    # The rejected player explicitly reviews a fresh version and submits a new action.
    reviewed = {**bodies[rejected], "expected_version": 2, "action_id": str(uuid4())}
    response = client.post(path + "/actions", headers=headers[actors[rejected]], json=reviewed)
    assert response.status_code == 200 and response.json()["match_version"] == 3
    assert client.get(path, headers=headers[1]).json()["game"]["detail"]["result"] is None
    last = {"type": "vote", "target": ids[0]} if game_id == "most-likely" else {"type": "predict", "choice": "a"}
    response = client.post(path + "/actions", headers=headers[1], json={
        "match_id": room["match_id"], "expected_version": 3,
        "action_id": str(uuid4()), "action": last,
    })
    assert response.status_code == 200 and response.json()["match_version"] == 4
    view = response.json()["game"]
    assert view["phase"] == "reveal"
    expected = {ids[0]: 1, ids[1]: 0, ids[2]: 0} if game_id == "most-likely" else {ids[0]: 0, ids[1]: 1, ids[2]: 0}
    assert {p["id"]: p["score"] for p in view["players"]} == expected
    assert len(view["detail"]["result"]["choices"]) == 3
    assert send(committed).json()["match_version"] == 4
    with sessions()() as session:
        saved = session.get(Match, room["match_id"])
        assert saved.version == 4 and saved.state["phase"] == "reveal"
        receipts = list(session.scalars(select(Receipt).where(Receipt.match_id == room["match_id"])))
        assert len(receipts) == 3
        assert {receipt.response["committedVersion"] for receipt in receipts} == {2, 3, 4}
        for receipt in receipts:
            assert set(receipt.response) == {"committedVersion", "public_move"}
            public = PublicMoveView.model_validate(receipt.response["public_move"])
            assert public.version == receipt.response["committedVersion"]
            assert public.type in {"vote", "choose", "predict"}
            assert public.label in {"Locked a choice", "Locked a prediction"}
            assert public.targets == [] and public.cards == []
            assert public.amount is None and public.destination is None and public.count is None
