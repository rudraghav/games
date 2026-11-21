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


def store(room, *, status="complete", payload=None, lease_until=0, legacy_style=False):
    card_ids = [card["id"] for card in room["game"]["community"]]
    if payload is None and status == "complete":
        payload = example_reading(card_ids)
    with sessions()() as session, session.begin():
        session.add(TarotReading(
            match_id=room["match_id"], status=status, question="Private archive question canary",
            attempt_id=str(uuid4()), lease_until=lease_until, payload=payload,
            prompt_version="archive-test",
        ))
        match = session.get(Match, room["match_id"])
        if legacy_style:
            match.state = {k: v for k, v in match.state.items() if k != "reading_style"}
        if status == "complete":
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


def test_a_solo_reading_cannot_be_joined_and_stays_private_to_its_owner(client):
    room, owner = spread(client)
    store(room)
    path = f"/v1/rooms/{room['id']}"
    outsider = player(client)
    for invite in (room["code"], room["invite_token"]):
        refused = client.post("/v1/rooms/join", headers=outsider, json={"name": "Visitor", "invite": invite})
        assert refused.status_code == 409
        assert refused.json()["detail"] == (
            "This is a private Tarot reading, so it can't be joined. "
            "Start your own reading from the games library."
        )
        assert "Private archive question canary" not in refused.text
    # The refusal added no member, seat or spectator, and opened nothing to the outsider.
    with sessions()() as session:
        assert [member.user_id for member in session.query(Member).filter_by(room_id=room["id"])] == [room["owner_id"]]
    assert client.get(path, headers=outsider).status_code == 404
    assert client.get(path + "/reading", headers=outsider).status_code == 404
    assert client.get(f"/v1/readings/{room['match_id']}", headers=outsider).status_code == 404
    # The owner's own invite still returns them to the same private table.
    again = client.post("/v1/rooms/join", headers=owner, json={"name": "Host", "invite": room["code"]})
    assert again.status_code == 200 and again.json()["id"] == room["id"]
    assert [member["id"] for member in again.json()["members"]] == [room["owner_id"]]


def test_archive_and_profile_history_survive_rematch_closure_and_absent_membership(client):
    room, owner = spread(client)
    store(room, legacy_style=True)
    path = f"/v1/readings/{room['match_id']}"
    original = client.get(path, headers=owner).json()
    assert client.put(f"/v1/rooms/{room['id']}/ready", headers=owner, json={"ready": True}).status_code == 200
    rematch = client.post(f"/v1/rooms/{room['id']}/start", headers=owner)
    assert rematch.status_code == 200 and rematch.json()["match_id"] != room["match_id"]
    archived = client.get(path, headers=owner).json()
    assert archived == {**original, "can_resume": False}
    assert archived["reading_style"] == "classic"
    fresh = client.get(f"/v1/rooms/{room['id']}/reading", headers=owner).json()
    assert fresh["reading"] is None and fresh["reading_style"] == "fun"
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
    store(room, payload=payload, legacy_style=True)
    response = client.get(f"/v1/readings/{room['match_id']}", headers=owner)
    assert response.status_code == 200 and response.json()["status"] == "complete"
    assert response.json()["reading_style"] == "classic"
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


def test_archived_v13_fun_comparisons_keep_their_original_words(client):
    room, owner = spread(client)
    payload = store(room)
    with sessions()() as session, session.begin():
        match = session.get(Match, room["match_id"])
        match.state = {**match.state, "reading_style": "fun"}
        stored = session.get(TarotReading, match.id)
        stored.prompt_version = "pop-tarot-13"
    expected = Reading.model_validate(payload).model_dump(mode="json")
    for path in (f"/v1/readings/{room['match_id']}", f"/v1/rooms/{room['id']}/reading"):
        response = client.get(path, headers=owner)
        assert response.status_code == 200
        assert response.json()["reading_style"] == "fun" and response.json()["reading"] == expected
    with sessions()() as session:
        assert session.get(TarotReading, room["match_id"]).payload == payload

@pytest.mark.parametrize("previous_attempt,choice,expected", [
    (False, None, "fun"),
    (False, "classic", "classic"),
    (True, None, "classic"),
    (True, "fun", "fun"),
])
def test_unmarked_older_spreads_resolve_style_before_first_submission_and_retry(
    client, monkeypatch, previous_attempt, choice, expected,
):
    from app.settings import settings

    room, owner = spread(client)
    if previous_attempt:
        store(room, status="failed", legacy_style=True)
    else:
        with sessions()() as session, session.begin():
            match = session.get(Match, room["match_id"])
            match.state = {k: v for k, v in match.state.items() if k != "reading_style"}
    monkeypatch.setattr(settings(), "gemini_api_key", "test-archive-no-provider")
    live, archive = f"/v1/rooms/{room['id']}/reading", f"/v1/readings/{room['match_id']}"
    for path in (live, archive):
        assert client.get(path, headers=owner).json()["reading_style"] == ("classic" if previous_attempt else "fun")
    calls = []

    def provider(cards, question, *, reading_style, **_kwargs):
        calls.append(reading_style)
        if len(calls) == 1:
            raise ValueError("temporary")
        return Reading.model_validate(example_reading(cards))

    monkeypatch.setattr("app.rooms.service.generate_reading", provider)
    body = {"match_id": room["match_id"]}
    if choice:
        body["reading_style"] = choice
    assert client.post(live, headers=owner, json=body).status_code == 502
    assert client.get(live, headers=owner).json()["reading_style"] == expected
    result = client.post(live, headers=owner, json={"match_id": room["match_id"]})
    assert result.status_code == 200
    assert result.json()["reading_style"] == expected
    assert client.get(archive, headers=owner).json()["reading_style"] == expected
    assert calls == [expected, expected]


@pytest.mark.parametrize("original_style", ["fun", "classic"])
def test_alternate_style_is_a_private_read_only_projection_of_the_saved_cards(client, monkeypatch, original_style):
    from sqlalchemy import select
    from test_astrology_reading import interpretation, synthetic_chart

    from app.games.tarot.characters import editorial_portrait, reference_candidates
    from app.models import RateBucket

    room, owner = spread(client)
    ids = [card["id"] for card in room["game"]["community"]]
    payload = example_reading(ids)
    chart = synthetic_chart("both")
    payload["astrology"] = {"chart": chart.model_dump(mode="json"), "interpretation": interpretation(chart=chart)}
    for card in payload["cards"]:
        card["pop_culture"] = "An authentic historical comparison preserved in the original."
        if original_style == "classic":
            card.pop("characters")
    store(room, legacy_style=original_style == "classic", payload=payload)
    path = f"/v1/readings/{room['match_id']}"
    alternate = "fun" if original_style == "classic" else "classic"
    assert client.post(f"/v1/rooms/{room['id']}/leave", headers=owner).status_code == 200
    other = player(client)

    def snapshot():
        with sessions()() as session:
            saved = session.get(TarotReading, room["match_id"])
            match = session.get(Match, room["match_id"])
            return (saved.status, saved.question, saved.payload, saved.attempt_id, saved.lease_until, saved.prompt_version,
                    match.state, match.version, match.result, session.get(Room, room["id"]).revision,
                    session.execute(select(RateBucket.key, RateBucket.window, RateBucket.count).order_by(
                        RateBucket.key, RateBucket.window)).all())

    calls = []
    def match(card_ids, question, *, per_card, reading_style):
        calls.append((card_ids, question, per_card, reading_style))
        return reference_candidates(card_ids, question, per_card=per_card, reading_style=reading_style)
    monkeypatch.setattr("app.games.tarot.reading.reference_candidates", match)
    before = snapshot()
    original = client.get(path, headers=owner).json()
    assert original["reading_style"] == original_style and not original["can_resume"]
    assert "original_reading_style" not in original
    assert client.get(path, params={"style": alternate}).status_code == 401
    assert client.get(path, headers=other, params={"style": alternate}).status_code == 404
    assert client.get(path, headers=owner, params={"style": "bogus"}).status_code == 422
    assert client.get(path, headers=owner, params={"style": original_style}).json() == original
    assert not calls
    response = client.get(path, headers=owner, params={"style": alternate})
    assert response.status_code == 200, response.text
    assert response.headers["cache-control"] == "private, no-store"
    derived = response.json()
    assert derived["original_reading_style"] == original_style and derived["reading_style"] == alternate
    assert derived["cards"] == original["cards"] and derived["question"] == original["question"]
    assert {k: v for k, v in derived["reading"].items() if k != "cards"} == {
        k: v for k, v in original["reading"].items() if k != "cards"
    }
    if alternate == "fun":
        assert calls == [(ids, original["question"], 1, "fun")]
        rows = reference_candidates(ids, original["question"], per_card=1, reading_style="fun")
        portraits = [[editorial_portrait(row)[1]] for row in rows]
    else:
        assert calls == []
        portraits = [[], [], []]
    for section, old, characters in zip(derived["reading"]["cards"], original["reading"]["cards"], portraits, strict=True):
        assert section == {**old, "characters": characters, "pop_culture": None}
    assert client.get(path, headers=owner).json() == original
    assert snapshot() == before


def test_unavailable_alternate_never_hides_or_changes_the_saved_reading(client, monkeypatch, caplog):
    room, owner = spread(client)
    path = f"/v1/readings/{room['match_id']}"
    def broken(*args, **kwargs):
        raise ValueError("PRIVATE-LOOKUP-CANARY")
    monkeypatch.setattr("app.rooms.service.alternate_view", broken)
    pending = client.get(path, headers=owner).json()
    assert client.get(path, headers=owner, params={"style": "classic"}).json() == pending
    store(room, legacy_style=True)
    original = client.get(path, headers=owner).json()
    failed = client.get(path, headers=owner, params={"style": "fun"})
    assert failed.status_code == 503 and failed.headers["cache-control"] == "private, no-store"
    assert "PRIVATE-LOOKUP-CANARY" not in failed.text + caplog.text
    assert client.get(path, headers=owner, params={"style": "classic"}).json() == original
