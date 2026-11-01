import time
from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from room_helpers import create, player, require_isolated, seated_room
from test_tarot import example_reading

from app.db import sessions
from app.main import app
from app.models import Match, Member, Receipt
from app.settings import settings


@pytest.fixture
def client():
    require_isolated()
    with TestClient(app) as client:
        yield client


def test_room_auth_hidden_hands_late_join_and_no_cache(client):
    room, headers = seated_room(client)
    outsider = player(client)
    path = f"/v1/rooms/{room['id']}"
    assert client.get(path).status_code == 401
    assert client.get(path, headers=outsider).status_code == 404
    host = client.get(path, headers=headers[0])
    guest = client.get(path, headers=headers[1])
    assert host.headers["cache-control"] == "private, no-store"
    assert host.json()["invite_token"] and guest.json()["invite_token"] is None
    own = {c["id"] for c in host.json()["game"]["hand"]}
    assert not own.intersection(c["id"] for c in guest.json()["game"]["hand"])
    assert '"deck"' not in host.text and '"seed"' not in host.text
    late = client.post(
        "/v1/rooms/join", headers=outsider, json={"name": "Late guest", "invite": room["code"]}
    )
    assert late.status_code == 200 and late.json()["game"] is None
    assert not next(m for m in late.json()["members"] if m["name"] == "Late guest")["seated"]
    assert (
        client.put(
            path + "/settings", headers=headers[0], json={"game_id": "skyjo", "capacity": 2}
        ).status_code
        == 409
    )


def test_simultaneous_actions_retry_staleness_and_restart(client):
    room, headers = seated_room(client)
    path = f"/v1/rooms/{room['id']}"
    actor_index = next(
        i
        for i, member in enumerate(room["members"])
        if member["id"] == room["game"]["current_player"]
    )
    actor_headers = headers[actor_index]
    actor_room = client.get(path, headers=actor_headers).json()
    action = actor_room["game"]["actions"][0]["action"]
    body = {
        "match_id": room["match_id"],
        "expected_version": room["match_version"],
        "action_id": str(uuid4()),
        "action": action,
    }

    def send(data):
        return client.post(path + "/actions", headers=actor_headers, json=data)

    with ThreadPoolExecutor(max_workers=2) as pool:
        responses = list(pool.map(send, [body, {**body, "action_id": str(uuid4())}]))
    assert sorted(r.status_code for r in responses) == [200, 409]
    winner = next(r.json() for r in responses if r.status_code == 200)
    # Retry whichever request committed; receipts never increment version twice.
    retry = send(body)
    if responses[0].status_code == 200:
        assert retry.status_code == 200 and retry.json() == winner
    else:
        assert retry.status_code == 409
    assert (
        client.get(path, headers=actor_headers).json()["match_version"] == room["match_version"] + 1
    )
    # A new application lifespan/session reconstructs the saved state from Postgres.
    with TestClient(app) as restarted:
        restored = restarted.get(path, headers=actor_headers).json()
        assert restored["game"] == winner["game"]
    assert (
        client.post(path + "/actions", headers=headers[1 - actor_index], json=body).status_code
        == 409
    )
    with sessions()() as session:
        receipt = session.get(Receipt, (room["match_id"], body["action_id"]))
        if receipt:
            assert set(receipt.response) == {"committedVersion"}


def test_reconnect_host_takeover_invite_revocation_and_membership(client):
    room, headers = seated_room(client)
    path = f"/v1/rooms/{room['id']}"
    host_id = room["owner_id"]
    guest_id = next(m["id"] for m in room["members"] if m["id"] != host_id)
    with sessions()() as session, session.begin():
        session.get(Member, (room["id"], host_id)).seen_at = time.time() - 100
    assert client.get(path, headers=headers[1]).json()["paused"]
    response = client.post(path + "/claim-host", headers=headers[1])
    assert response.status_code == 200 and response.json()["owner_id"] == guest_id
    assert client.post(path + "/heartbeat", headers=headers[0]).json()["paused"] is False
    rotated = client.post(path + "/invite", headers=headers[1]).json()
    assert rotated["code"] != room["code"]
    outsider = player(client)
    for old in (room["code"], room["invite_token"]):
        assert (
            client.post(
                "/v1/rooms/join", headers=outsider, json={"name": "Visitor", "invite": old}
            ).status_code
            == 404
        )
    assert client.post(path + "/abandon", headers=headers[1]).json()["status"] == "lobby"
    assert client.delete(path + f"/members/{host_id}", headers=headers[1]).status_code == 200
    assert client.get(path, headers=headers[0]).status_code == 404


def test_chat_and_reactions_are_room_scoped(client):
    host, outsider = player(client), player(client)
    room = create(client, host)
    path = f"/v1/rooms/{room['id']}"
    assert client.post(path + "/chat", headers=outsider, json={"body": "peek"}).status_code == 404
    assert (
        client.post(path + "/chat", headers=host, json={"body": "  Hello table  "}).json()[
            "messages"
        ][-1]["body"]
        == "Hello table"
    )
    assert (
        client.post(
            path + "/chat", headers=host, json={"body": "arbitrary", "kind": "reaction"}
        ).status_code
        == 422
    )
    assert (
        client.post(
            path + "/chat", headers=host, json={"body": "🎉", "kind": "reaction"}
        ).status_code
        == 200
    )


def test_tarot_ai_output_is_saved_and_reading_private(client, monkeypatch):
    room, headers = seated_room(client, "tarot", 1)
    path = f"/v1/rooms/{room['id']}"
    for i in (2, 18, 49):
        room = client.post(
            path + "/actions",
            headers=headers[0],
            json={
                "match_id": room["match_id"],
                "action_id": str(uuid4()),
                "expected_version": room["match_version"],
                "action": {"type": "pick", "choice": str(i)},
            },
        ).json()
    assert room["game"]["phase"] == "reading"
    assert client.get(path + "/reading", headers=player(client)).status_code == 404
    monkeypatch.setattr(settings(), "gemini_api_key", "local-test-adapter-only")
    calls = []

    def provider(cards, question):
        from app.games.tarot.reading import validate_reading

        calls.append(question)
        return validate_reading(example_reading(cards), cards)

    monkeypatch.setattr("app.rooms.service.generate_reading", provider)
    payload = {"match_id": room["match_id"], "question": "What should I focus on?"}
    reading = client.post(path + "/reading", headers=headers[0], json=payload)
    assert reading.status_code == 200, reading.text
    assert reading.json()["status"] == "complete"
    assert client.post(path + "/reading", headers=headers[0], json=payload).json() == reading.json()
    assert client.get(path + "/reading", headers=headers[0]).json() == reading.json()
    assert len(calls) == 1
    finished = client.get(path, headers=headers[0]).json()
    assert finished["status"] == "finished"
    # Rematching keeps membership but creates a new, separate saved spread.
    client.put(path + "/ready", headers=headers[0], json={"ready": True})
    rematch = client.post(path + "/start", headers=headers[0]).json()
    assert rematch["match_id"] != room["match_id"]
    assert client.post(path + "/reading", headers=headers[0], json=payload).status_code == 409
    with sessions()() as session:
        assert session.get(Match, room["match_id"]).result is not None


def test_tarot_unavailable_does_not_fake_a_reading(client, monkeypatch):
    room, headers = seated_room(client, "tarot", 1)
    path = f"/v1/rooms/{room['id']}"
    for i in range(3):
        room = client.post(
            path + "/actions",
            headers=headers[0],
            json={
                "match_id": room["match_id"],
                "action_id": str(uuid4()),
                "expected_version": room["match_version"],
                "action": {"type": "pick", "choice": str(i)},
            },
        ).json()
    monkeypatch.setattr(settings(), "gemini_api_key", "")
    assert client.get(path + "/reading", headers=headers[0]).json()["status"] == "unavailable"
    assert (
        client.post(
            path + "/reading", headers=headers[0], json={"match_id": room["match_id"]}
        ).status_code
        == 503
    )
    assert len(client.get(path, headers=headers[0]).json()["game"]["community"]) == 3


def test_tarot_provider_failure_keeps_spread_and_logs_only_diagnostics(client, monkeypatch, caplog):
    room, headers = seated_room(client, "tarot", 1)
    path = f"/v1/rooms/{room['id']}"
    for index in range(3):
        room = client.post(
            path + "/actions", headers=headers[0],
            json={"match_id": room["match_id"], "action_id": str(uuid4()),
                  "expected_version": room["match_version"],
                  "action": {"type": "pick", "choice": str(index)}},
        ).json()
    monkeypatch.setattr(settings(), "gemini_api_key", "local-failure-test-key")

    def fail(_cards, question):
        raise ValueError(f"Private provider content: {question}; local-failure-test-key")

    monkeypatch.setattr("app.rooms.service.generate_reading", fail)
    payload = {"match_id": room["match_id"], "question": "Private verification question"}
    response = client.post(path + "/reading", headers=headers[0], json=payload)
    assert response.status_code == 502
    assert "error_type=ValueError" in caplog.text
    assert payload["question"] not in caplog.text + response.text
    assert "local-failure-test-key" not in caplog.text + response.text
    restored = client.get(path, headers=headers[0]).json()
    assert restored["game"]["community"] == room["game"]["community"]
    assert restored["game"]["phase"] == "reading"

    def recover(cards, _question):
        from app.games.tarot.reading import validate_reading

        return validate_reading(example_reading(cards), cards)

    monkeypatch.setattr("app.rooms.service.generate_reading", recover)
    recovered = client.post(path + "/reading", headers=headers[0], json=payload)
    assert recovered.status_code == 200 and recovered.json()["status"] == "complete"
    assert client.get(path + "/reading", headers=headers[0]).json() == recovered.json()
