"""A completed roulette/slot session remains private and read-only after leaving."""

from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from room_helpers import player, require_isolated, seated_room
from sqlalchemy import func, select

from app.db import sessions
from app.main import app
from app.models import Match, Member, Receipt


@pytest.fixture
def client():
    require_isolated()
    with TestClient(app) as value:
        yield value


def saved_snapshot(match_id):
    with sessions()() as db:
        match = db.get(Match, match_id)
        receipts = db.scalar(select(func.count()).select_from(Receipt).where(Receipt.match_id == match_id))
        return match.version, match.state, match.result, receipts


@pytest.mark.parametrize("game", ["roulette", "slots"])
def test_finished_session_reopens_exact_spins_after_rematch_and_room_closure(client, game):
    room, (owner,) = seated_room(client, game, 1)
    path = f"/v1/chance-sessions/{room['match_id']}"
    outsider = player(client)
    assert client.get(path, headers=owner).status_code == 404
    for _ in range(5):
        option = room["game"]["actions"][0]
        action = {**option["action"], "amount": 1}
        request = {
            "match_id": room["match_id"], "expected_version": room["match_version"],
            "action_id": str(uuid4()), "action": action,
        }
        url = f"/v1/rooms/{room['id']}/actions"
        response = client.post(url, headers=owner, json=request)
        assert response.status_code == 200, response.text
        room = response.json()
        assert client.post(url, headers=owner, json=request).json()["match_version"] == room["match_version"]
    assert room["status"] == "finished"
    before = saved_snapshot(room["match_id"])
    assert before[-1] == 5
    for header, status in [(None, 401), (outsider, 404)]:
        assert client.get(path, headers=header).status_code == status
    response = client.get(path, headers=owner)
    assert response.status_code == 200 and response.headers["cache-control"] == "private, no-store"
    archive = response.json()
    assert archive == room["game"] and not archive["actions"]
    assert len(archive["detail"]["history"]) == 5
    assert "_stops" not in response.text and "_pockets" not in response.text
    assert client.post(path, headers=owner, json={}).status_code == 405
    assert client.put(f"/v1/rooms/{room['id']}/ready", headers=owner, json={"ready": True}).status_code == 200
    rematch = client.post(f"/v1/rooms/{room['id']}/start", headers=owner)
    assert rematch.status_code == 200 and rematch.json()["match_id"] != room["match_id"]
    assert rematch.json()["game"]["detail"]["history"] == []
    assert client.get(path, headers=owner).json() == archive
    assert client.post(f"/v1/rooms/{room['id']}/leave", headers=owner).status_code == 200
    abandoned = f"/v1/chance-sessions/{rematch.json()['match_id']}"
    assert client.get(abandoned, headers=owner).status_code == 404
    assert client.get(path, headers=owner).json() == archive
    with sessions()() as db, db.begin():
        db.delete(db.get(Member, (room["id"], room["owner_id"])))
    assert client.get(path, headers=owner).json() == archive
    assert [m["id"] for m in client.get("/v1/me", headers=owner).json()["history"]] == [room["match_id"]]
    assert client.get(path, headers=outsider).status_code == 404
    assert not client.get("/v1/me", headers=outsider).json()["history"]
    assert saved_snapshot(room["match_id"]) == before


def test_archive_rejects_unrelated_missing_and_non_solo_matches_before_projection(client, monkeypatch):
    room, (owner,) = seated_room(client, "roulette", 1)
    match_id = room["match_id"]
    path = f"/v1/chance-sessions/{match_id}"
    with sessions()() as db, db.begin():
        match = db.get(Match, match_id)
        match.state = {**match.state, "phase": "finished"}
        match.result = {"winners": [], "scores": {}}
        match.participants = [room["owner_id"], str(uuid4())]
    def forbidden(*args):
        raise AssertionError("An unauthorized request reached the game projection")

    monkeypatch.setattr("app.games.roulette.engine.RouletteEngine.project_view", forbidden)
    denied = client.get(path, headers=owner)
    assert denied.status_code == 404
    assert client.get(f"/v1/chance-sessions/{uuid4()}", headers=owner).json() == denied.json()
    with sessions()() as db, db.begin():
        match = db.get(Match, match_id)
        match.participants = [room["owner_id"]]
        match.game_id = "blackjack"
    assert client.get(path, headers=owner).status_code == 404
