import json
import logging
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from room_helpers import player, require_isolated, seated_room
from test_astrology_reading import interpretation
from test_tarot import example_reading

from app.astrology.models import AstrologyPlace, AstrologyPlaces
from app.db import sessions
from app.games.tarot.reading import validate_reading
from app.main import app
from app.models import TarotReading
from app.rooms.router import service as service_dependency
from app.rooms.service import RoomService
from app.settings import settings

ASTRO = {"system": "both", "birth_date": "1999-06-24", "birth_time": "06:17", "place_id": "geo:2643743"}
CITY = AstrologyPlace(id="geo:2643743", label="PrivateBirthplaceCanary", country_code="GB",
                      latitude=51.50853, longitude=-0.12574, timezone="Europe/London")


@pytest.fixture
def client():
    require_isolated()
    with TestClient(app) as client:
        yield client


@pytest.fixture
def private_services(monkeypatch):
    observed = {"session": None, "lookups": 0, "provider": 0}

    def dependency():
        with sessions()() as session:
            observed["session"] = session
            yield RoomService(session)

    def lookup(ident):
        assert not observed["session"].in_transaction()
        assert ident == CITY.id
        observed["lookups"] += 1
        return CITY

    app.dependency_overrides[service_dependency] = dependency
    monkeypatch.setattr("app.rooms.service.resolve_place", lookup)
    monkeypatch.setattr(settings(), "gemini_api_key", "test-adapter-not-provider")
    yield observed
    app.dependency_overrides.pop(service_dependency, None)


def spread(client):
    room, headers = seated_room(client, "tarot", 1)
    path = f"/v1/rooms/{room['id']}"
    for index in range(3):
        response = client.post(path + "/actions", headers=headers[0], json={
            "match_id": room["match_id"], "expected_version": room["match_version"],
            "action_id": str(uuid4()), "action": {"type": "pick", "choice": str(index)},
        })
        assert response.status_code == 200
        room = response.json()
    return room, headers[0], path


def completed(cards, chart=None):
    payload = example_reading(cards)
    if chart:
        payload["astrology_interpretation"] = interpretation(chart=chart)
    return validate_reading(payload, cards, astrology_chart=chart)


def test_preview_and_city_search_are_private_current_solo_match_only(client, private_services, monkeypatch):
    room, owner, path = spread(client)
    outsider = player(client)
    calls = []

    def search(query):
        assert not private_services["session"].in_transaction()
        calls.append(query)
        return AstrologyPlaces(places=[CITY])

    monkeypatch.setattr("app.rooms.service.search_places", search)
    body = {"match_id": room["match_id"], "query": "PrivateBirthplaceCanary"}
    assert client.post(path + "/astrology/places", json=body).status_code == 401
    assert client.post(path + "/astrology/places", headers=outsider, json=body).status_code == 404
    assert not calls
    places = client.post(path + "/astrology/places", headers=owner, json=body)
    assert places.status_code == 200 and places.json()["places"][0]["id"] == CITY.id
    assert places.headers["cache-control"] == "private, no-store"
    chart_body = {"match_id": room["match_id"], "astrology": ASTRO}
    assert client.post(path + "/astrology/chart", headers=outsider, json=chart_body).status_code == 404
    preview = client.post(path + "/astrology/chart", headers=owner, json=chart_body)
    assert preview.status_code == 200 and preview.json()["status"] == "ready"
    assert len(preview.json()["chart"]["charts"]) == 2
    assert preview.json()["time_resolution"] == {"timezone": "Europe/London", "utc_offset": "+01:00"}
    assert "utc_offset" not in json.dumps(preview.json()["chart"])
    assert preview.headers["cache-control"] == "private, no-store"
    assert client.get(path + "/astrology/places?query=not-supported", headers=owner).status_code == 405
    lookup_count = private_services["lookups"]
    client.post(path + "/abandon", headers=owner)
    client.put(path + "/ready", headers=owner, json={"ready": True})
    assert client.post(path + "/start", headers=owner).status_code == 200
    assert client.post(path + "/astrology/chart", headers=owner, json=chart_body).status_code == 409
    assert private_services["lookups"] == lookup_count


def test_astrology_generation_saves_only_computed_chart_and_refresh_is_idempotent(client, private_services, monkeypatch, caplog):
    room, owner, path = spread(client)

    def provider(cards, question, *, before_attempt=None, astrology_chart=None):
        assert not private_services["session"].in_transaction()
        private_services["provider"] += 1
        before_attempt()
        return completed(cards, astrology_chart)

    monkeypatch.setattr("app.rooms.service.generate_reading", provider)
    with caplog.at_level(logging.INFO):
        result = client.post(path + "/reading", headers=owner, json={
            "match_id": room["match_id"], "question": "A synthetic reflection", "astrology": ASTRO,
        })
    assert result.status_code == 200 and result.json()["reading"]["astrology"]["chart"]
    assert client.get(path + "/reading", headers=owner).json() == result.json()
    assert client.post(path + "/reading", headers=owner, json={"match_id": room["match_id"]}).json() == result.json()
    assert private_services["provider"] == 1
    with sessions()() as session:
        saved = session.get(TarotReading, room["match_id"])
        stored = json.dumps(saved.payload)
        assert saved.status == "complete"
    public = client.get(path, headers=owner).text
    for secret in [ASTRO["birth_date"], ASTRO["birth_time"], CITY.label, CITY.timezone,
                   "place_id", "birth_date", "utc_offset", "time_resolution"]:
        assert secret not in stored and secret not in public and secret not in caplog.text
    assert client.get(path + "/reading", headers=player(client)).status_code == 404


def test_failure_retains_only_private_computed_draft_for_explicit_resume_or_opt_out(client, private_services, monkeypatch, caplog):
    room, owner, path = spread(client)

    def failed(*args, **kwargs):
        raise RuntimeError("PrivateBirthplaceCanary 1999-06-24 06:17")

    monkeypatch.setattr("app.rooms.service.generate_reading", failed)
    with caplog.at_level(logging.WARNING):
        result = client.post(path + "/reading", headers=owner, json={"match_id": room["match_id"], "astrology": ASTRO})
    assert result.status_code == 502
    ready = client.get(path + "/reading", headers=owner).json()
    assert ready["status"] == "ready" and ready["astrology_chart"]
    with sessions()() as session:
        stored = json.dumps(session.get(TarotReading, room["match_id"]).payload)
    for secret in [ASTRO["birth_date"], ASTRO["birth_time"], CITY.label, "birth_date"]:
        assert secret not in stored and secret not in caplog.text and secret not in result.text
    lookup_count = private_services["lookups"]

    def ordinary(cards, question, *, before_attempt=None):
        before_attempt()
        return completed(cards)

    monkeypatch.setattr("app.rooms.service.generate_reading", ordinary)
    off = client.post(path + "/reading", headers=owner, json={"match_id": room["match_id"]})
    assert off.status_code == 200 and "astrology" not in off.json()["reading"]
    assert "astrology_chart" not in off.json()
    assert private_services["lookups"] == lookup_count
    with sessions()() as session:
        assert "astrology" not in json.dumps(session.get(TarotReading, room["match_id"]).payload)


def test_explicit_resume_uses_saved_chart_without_another_place_lookup(client, private_services, monkeypatch):
    room, owner, path = spread(client)
    monkeypatch.setattr("app.rooms.service.generate_reading", lambda *args, **kwargs: (_ for _ in ()).throw(RuntimeError()))
    assert client.post(path + "/reading", headers=owner, json={"match_id": room["match_id"], "astrology": ASTRO}).status_code == 502
    lookups = private_services["lookups"]

    def resumed(cards, question, *, before_attempt=None, astrology_chart=None):
        assert astrology_chart is not None
        before_attempt()
        return completed(cards, astrology_chart)

    monkeypatch.setattr("app.rooms.service.generate_reading", resumed)
    result = client.post(path + "/reading", headers=owner, json={"match_id": room["match_id"], "reuse_saved_astrology": True})
    assert result.status_code == 200 and result.json()["reading"]["astrology"]
    assert private_services["lookups"] == lookups


def test_active_generation_lease_returns_saved_chart_without_duplicate_provider(client, private_services, monkeypatch):
    room, owner, path = spread(client)
    entered, release = threading.Event(), threading.Event()
    calls = []

    def provider(cards, question, *, before_attempt=None, astrology_chart=None):
        calls.append(True)
        before_attempt()
        entered.set()
        assert release.wait(10)
        return completed(cards, astrology_chart)

    monkeypatch.setattr("app.rooms.service.generate_reading", provider)
    with ThreadPoolExecutor(max_workers=1) as pool:
        future = pool.submit(client.post, path + "/reading", headers=owner,
                             json={"match_id": room["match_id"], "astrology": ASTRO})
        try:
            assert entered.wait(10)
            pending = client.post(path + "/reading", headers=owner,
                                  json={"match_id": room["match_id"], "reuse_saved_astrology": True})
            assert pending.status_code == 200 and pending.json()["status"] == "generating"
            assert pending.json()["astrology_chart"]
            assert client.get(path, headers=owner).status_code == 200
        finally:
            release.set()
        assert future.result().status_code == 200
    assert len(calls) == 1


def test_expired_lease_retry_cannot_be_overwritten_by_the_old_astrology_attempt(client, private_services, monkeypatch):
    room, owner, path = spread(client)
    entered, release = threading.Event(), threading.Event()
    calls = []

    def provider(cards, question, *, before_attempt=None, astrology_chart=None):
        index = len(calls)
        calls.append(index)
        before_attempt()
        if index == 0:
            entered.set()
            assert release.wait(10)
        return completed(cards, astrology_chart).model_copy(update={"title": f"Attempt {index}"})

    monkeypatch.setattr("app.rooms.service.generate_reading", provider)
    with ThreadPoolExecutor(max_workers=1) as pool:
        future = pool.submit(client.post, path + "/reading", headers=owner,
                             json={"match_id": room["match_id"], "astrology": ASTRO})
        try:
            assert entered.wait(10)
            with sessions()() as session:
                session.get(TarotReading, room["match_id"]).lease_until = time.time() - 1
                session.commit()
            retried = client.post(path + "/reading", headers=owner,
                                  json={"match_id": room["match_id"], "reuse_saved_astrology": True})
            assert retried.status_code == 200 and retried.json()["reading"]["title"] == "Attempt 1"
        finally:
            release.set()
        assert future.result().status_code == 409
    assert client.get(path + "/reading", headers=owner).json()["reading"]["title"] == "Attempt 1"
    assert len(calls) == 2


def test_rematch_during_unlocked_astrology_generation_preserves_the_new_spread(client, private_services, monkeypatch):
    room, owner, path = spread(client)
    entered, release = threading.Event(), threading.Event()

    def provider(cards, question, *, before_attempt=None, astrology_chart=None):
        before_attempt()
        entered.set()
        assert release.wait(10)
        return completed(cards, astrology_chart)

    monkeypatch.setattr("app.rooms.service.generate_reading", provider)
    with ThreadPoolExecutor(max_workers=1) as pool:
        future = pool.submit(client.post, path + "/reading", headers=owner,
                             json={"match_id": room["match_id"], "astrology": ASTRO})
        try:
            assert entered.wait(10)
            assert client.post(path + "/abandon", headers=owner).status_code == 200
            assert client.put(path + "/ready", headers=owner, json={"ready": True}).status_code == 200
            fresh = client.post(path + "/start", headers=owner)
            assert fresh.status_code == 200 and fresh.json()["match_id"] != room["match_id"]
        finally:
            release.set()
        assert future.result().status_code == 409
    ready = client.get(path + "/reading", headers=owner).json()
    assert ready["status"] == "ready" and "astrology_chart" not in ready
