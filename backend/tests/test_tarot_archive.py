"""Private historical reads in a disposable database; never calls an AI provider."""
import copy
import json
import time
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from room_helpers import player, require_isolated, seated_room
from test_tarot import example_reading

from app.db import sessions
from app.games.tarot.reading import Reading
from app.main import app
from app.models import Match, Member, Room, TarotReading


@pytest.fixture
def client(monkeypatch):
    require_isolated()

    def no_provider(*args, **kwargs):
        raise AssertionError("Archive reads must never generate a reading")

    monkeypatch.setattr("app.rooms.service.generate_reading", no_provider)
    with TestClient(app) as client:
        yield client


def spread(client):
    room, headers = seated_room(client, "tarot", 1)
    for index in range(3):
        response = client.post(f"/v1/rooms/{room['id']}/actions", headers=headers[0], json={
            "match_id": room["match_id"], "expected_version": room["match_version"],
            "action_id": str(uuid4()), "action": {"type": "pick", "choice": str(index)},
        })
        assert response.status_code == 200
        room = response.json()
    return room, headers[0]


def store(room, *, status="complete", payload=None, lease_until=0):
    card_ids = [card["id"] for card in room["game"]["community"]]
    if payload is None and status == "complete":
        payload = example_reading(card_ids)
    with sessions()() as session, session.begin():
        session.add(TarotReading(
            match_id=room["match_id"], status=status, question="Private archive question canary",
            attempt_id=str(uuid4()), lease_until=lease_until, payload=payload,
            prompt_version="archive-test",
        ))
        if status == "complete":
            match = session.get(Match, room["match_id"])
            match.state = {**match.state, "phase": "finished"}
            match.result = {"winners": [], "scores": {room["owner_id"]: 0}}
            current = session.get(Room, room["id"])
            current.status = "finished"
    return payload


def test_archive_is_exact_private_read_only_and_excludes_unpicked_cards(client):
    room, owner = spread(client)
    payload = store(room)
    path = f"/v1/readings/{room['match_id']}"
    assert client.get(path).status_code == 401
    assert client.get(path, headers=player(client)).status_code == 404
    assert client.get(f"/v1/readings/{uuid4()}", headers=owner).status_code == 404
    assert client.get("/v1/readings/not-a-match", headers=owner).status_code == 422
    assert client.post(path, headers=owner, json={}).status_code == 405
    first = client.get(path, headers=owner)
    assert first.status_code == 200
    assert first.headers["cache-control"] == "private, no-store"
    saved = first.json()
    assert saved["status"] == "complete" and saved["can_resume"] is True
    assert saved["reading"] == Reading.model_validate(payload).model_dump(mode="json")
    assert saved["cards"] == room["game"]["community"]
    assert client.get(path, headers=owner).json() == saved
    with sessions()() as session:
        match = session.get(Match, room["match_id"])
        assert session.get(TarotReading, match.id).payload == payload
        wire = json.dumps(saved)
        for index, card in enumerate(match.state["deck"]):
            assert (json.dumps(card) in wire) == (index in match.state["picks"])
    other, _ = seated_room(client, "uno", 2)
    assert client.get(f"/v1/readings/{other['match_id']}", headers=owner).status_code == 404


def test_archive_and_profile_history_survive_rematch_closure_and_absent_membership(client):
    room, owner = spread(client)
    store(room)
    path = f"/v1/readings/{room['match_id']}"
    original = client.get(path, headers=owner).json()
    assert client.put(f"/v1/rooms/{room['id']}/ready", headers=owner, json={"ready": True}).status_code == 200
    rematch = client.post(f"/v1/rooms/{room['id']}/start", headers=owner)
    assert rematch.status_code == 200 and rematch.json()["match_id"] != room["match_id"]
    archived = client.get(path, headers=owner).json()
    assert archived == {**original, "can_resume": False}
    assert client.get(f"/v1/rooms/{room['id']}/reading", headers=owner).json()["reading"] is None
    assert client.post(f"/v1/rooms/{room['id']}/leave", headers=owner).status_code == 200
    assert client.get(f"/v1/rooms/{room['id']}", headers=owner).status_code == 404
    assert client.get(path, headers=owner).json() == archived
    # Exercise the archive boundary without a membership row, in this isolated
    # test database only. Historical match/reading records are never removed.
    with sessions()() as session, session.begin():
        session.delete(session.get(Member, (room["id"], room["owner_id"])))
    assert client.get(path, headers=owner).json() == archived
    history = client.get("/v1/me", headers=owner).json()["history"]
    assert [entry["id"] for entry in history] == [room["match_id"]]
    outsider = player(client)
    assert client.get(path, headers=outsider).status_code == 404
    assert client.get("/v1/me", headers=outsider).json()["history"] == []


def test_legacy_reading_keeps_its_saved_text_without_fabricating_new_layers(client):
    room, owner = spread(client)
    payload = example_reading([card["id"] for card in room["game"]["community"]])
    for card in payload["cards"]:
        card.pop("characters")
        card.pop("quirky_interpretation")
        card["pop_culture"] = "An original analogy from the earlier saved reading."
    store(room, payload=payload)
    response = client.get(f"/v1/readings/{room['match_id']}", headers=owner)
    assert response.status_code == 200 and response.json()["status"] == "complete"
    for card in response.json()["reading"]["cards"]:
        assert card["pop_culture"] == payload["cards"][0]["pop_culture"]
        assert not card["characters"] and card["quirky_interpretation"] is None
    with sessions()() as session:
        assert session.get(TarotReading, room["match_id"]).payload == payload


@pytest.mark.parametrize("stored,lease,status", [
    (None, 0, "incomplete"),
    ("failed", 0, "incomplete"),
    ("generating", -10, "incomplete"),
    ("generating", 120, "generating"),
    ("complete", 0, "unavailable"),
])
def test_incomplete_or_unreadable_archive_is_explicit_and_never_rewritten(client, caplog, stored, lease, status):
    room, owner = spread(client)
    payload = {"private_invalid_payload_canary": "keep the original"}
    if stored:
        store(room, status=stored, payload=payload, lease_until=time.time() + lease)
    with sessions()() as session:
        record = session.get(TarotReading, room["match_id"])
        before = copy.deepcopy(record.payload) if record else None
    response = client.get(f"/v1/readings/{room['match_id']}", headers=owner)
    assert response.status_code == 200
    assert response.json()["status"] == status and response.json()["reading"] is None
    assert "private_invalid_payload_canary" not in response.text
    assert "private_invalid_payload_canary" not in caplog.text
    if status == "unavailable":
        assert "games.reading_archive.invalid_payload" in caplog.text
    with sessions()() as session:
        record = session.get(TarotReading, room["match_id"])
        assert (record.payload if record else None) == before
