"""Real saved progress under an isolated lease; no provider traffic."""
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from room_helpers import player, require_isolated
from test_astrology_rooms import completed, spread

from app.db import sessions
from app.games.tarot.progress import ProgressEvent, ProgressState
from app.main import app
from app.models import TarotReading
from app.rooms.service import RoomService
from app.settings import settings


@pytest.fixture
def client(monkeypatch):
    require_isolated()
    monkeypatch.setattr(settings(), "gemini_api_key", "test-progress-no-provider")
    with TestClient(app) as client:
        yield client


def test_progress_is_private_durable_and_visible_during_the_original_post(client, monkeypatch):
    room, owner, path = spread(client)
    entered, switch, switched, finish = (threading.Event() for _ in range(4))
    calls = []

    def provider(cards, question, *, before_attempt=None, astrology_chart=None, on_progress=None, reading_style="classic"):
        assert reading_style == "fun"
        calls.append(True)
        before_attempt()
        on_progress(ProgressEvent("writing", "gemini", 1, 3))
        entered.set()
        assert switch.wait(10)
        before_attempt()
        on_progress(ProgressEvent(
            "retrying", "groq", 2, 3,
            "Card 1 wording failed its question format. Retrying without that format.",
        ))
        on_progress(ProgressEvent("writing", "groq", 2, 3))
        switched.set()
        assert finish.wait(10)
        on_progress(ProgressEvent("checking", "groq", 2, 3))
        return completed(cards)

    monkeypatch.setattr("app.rooms.service.generate_reading", provider)
    with ThreadPoolExecutor(max_workers=1) as pool:
        payload = {"match_id": room["match_id"], "question": "Private question canary", "reading_style": "fun"}
        result = pool.submit(client.post, path + "/reading", headers=owner, json=payload)
        try:
            assert entered.wait(10)
            first = client.get(path + "/reading", headers=owner)
            assert first.status_code == 200
            assert first.json()["reading_style"] == "fun"
            initial = first.json()["progress"]
            assert initial["stage"] == "writing" and initial["provider"] == "Gemini"
            assert "private, no-store" == first.headers["cache-control"]
            assert "Private question canary" not in str(initial)
            assert client.get(path + "/reading", headers=player(client)).status_code == 404
            duplicate = client.post(path + "/reading", headers=owner, json={**payload, "reading_style": "classic"}).json()
            assert duplicate["reading_style"] == "fun"
            assert duplicate["status"] == "generating" and len(calls) == 1
            switch.set()
            assert switched.wait(10)
            changed = client.get(path + "/reading", headers=owner).json()["progress"]
            assert changed["stage"] == "retrying" and changed["provider"] == "Groq"
            assert changed["attempt"] == 2 and changed["started_at"] == initial["started_at"]
            assert changed["estimated_percent"] >= initial["estimated_percent"]
            assert changed["retry_detail"] == (
                "Card 1 wording failed its question format. Retrying without that format."
            )
            assert "Private question canary" not in str(changed)
            with sessions()() as session:
                stored = session.get(TarotReading, room["match_id"])
                assert stored.payload["_progress"]["provider"] == "Groq"
                assert stored.payload["_progress"]["retry_detail"] == changed["retry_detail"]
        finally:
            switch.set()
            finish.set()
        response = result.result()
        assert response.status_code == 200 and response.json()["status"] == "complete"
        assert "progress" not in response.json()
    assert response.json()["reading_style"] == "fun"
    assert client.get(f"/v1/readings/{room['match_id']}", headers=owner).json()["reading_style"] == "fun"
    assert client.get(path + "/reading", headers=owner).json() == response.json()
    with sessions()() as session:
        assert "_progress" not in session.get(TarotReading, room["match_id"]).payload


@pytest.mark.parametrize("superseded,expired,status", [
    pytest.param(True, False, "generating", id="newer-attempt"),
    pytest.param(False, True, "generating", id="expired-lease"),
    pytest.param(False, False, "complete", id="completed-reading"),
])
def test_a_stale_progress_writer_cannot_change_saved_state(client, superseded, expired, status):
    room, _owner, _path = spread(client)
    old, current = str(uuid4()), str(uuid4())
    state = ProgressState.begin(time.time())
    payload = {"_progress": state.model_dump(mode="json")}
    if status == "complete":
        payload = completed([card["id"] for card in room["game"]["community"]]).model_dump(mode="json")
    attempt = current if superseded else old
    lease_until = time.time() + (-1 if expired else 180)
    with sessions()() as session:
        session.add(TarotReading(match_id=room["match_id"], status=status, question="", prompt_version="pop-tarot-11",
                                attempt_id=attempt, lease_until=lease_until, payload=payload))
        session.commit()
    with sessions()() as session:
        RoomService(session)._update_reading_progress(
            room["id"], room["match_id"], old, ProgressEvent("checking", "cloudflare", 3, 3),
        )
    with sessions()() as session:
        saved = session.get(TarotReading, room["match_id"])
        assert saved.payload == payload
        assert saved.status == status and saved.attempt_id == attempt and saved.lease_until == lease_until


def test_an_older_running_lease_has_compatible_progress_and_expiry_clears_it(client):
    room, owner, path = spread(client)
    with sessions()() as session:
        session.add(TarotReading(match_id=room["match_id"], status="generating", question="", prompt_version="pop-tarot-11",
                                attempt_id=str(uuid4()), lease_until=time.time() + 120, payload=None))
        session.commit()
    live = client.get(path + "/reading", headers=owner).json()
    assert live["status"] == "generating" and live["progress"]["stage"] == "writing"
    with sessions()() as session:
        session.get(TarotReading, room["match_id"]).lease_until = time.time() - 1
        session.commit()
    expired = client.get(path + "/reading", headers=owner).json()
    assert expired["status"] == "ready" and "progress" not in expired
