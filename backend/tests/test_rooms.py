import hashlib
import time
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4

import httpx
import pytest
from fastapi.testclient import TestClient
from room_helpers import create, player, require_isolated, seated_room
from test_tarot import example_reading

from app.db import sessions
from app.games.registry import ENGINES
from app.main import app
from app.models import Match, Member, RateBucket, Receipt, TarotReading
from app.settings import settings


@pytest.fixture
def client():
    require_isolated()
    with TestClient(app) as client:
        yield client


@pytest.mark.parametrize("game_id", list(ENGINES))
@pytest.mark.parametrize("maximum", [False, True])
def test_every_game_starts_and_roundtrips_persisted_match_at_both_seat_limits(client, game_id, maximum):
    engine = ENGINES[game_id]
    count = engine.manifest.max_players if maximum else engine.manifest.min_players
    room, headers = seated_room(client, game_id, count)
    assert room["status"] == "playing" and room["match_version"] == 1
    assert room["game"]["game_id"] == game_id
    # A separate authorized request must project the committed database state;
    # pure setup() alone cannot catch persistence constraints such as version size.
    saved = client.get(f"/v1/rooms/{room['id']}", headers=headers[-1])
    assert saved.status_code == 200
    assert saved.json()["match_id"] == room["match_id"]
    assert len(saved.json()["game"]["players"]) == count


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

    def provider(cards, question, *, before_attempt=None):
        from app.games.tarot.reading import validate_reading

        if before_attempt:
            before_attempt()
        calls.append(question)
        return validate_reading(example_reading(cards), cards)

    monkeypatch.setattr("app.rooms.service.generate_reading", provider)
    payload = {"match_id": room["match_id"], "question": "What should I focus on?"}
    reading = client.post(path + "/reading", headers=headers[0], json=payload)
    assert reading.status_code == 200, reading.text
    assert reading.json()["status"] == "complete"
    assert all(
        card["quirky_interpretation"] and 1 <= len(card["characters"]) <= 2
        for card in reading.json()["reading"]["cards"]
    )
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


def test_legacy_tarot_history_remains_readable_without_regeneration_or_fabricated_layers(
    client, monkeypatch
):
    room, headers = seated_room(client, "tarot", 1)
    path = f"/v1/rooms/{room['id']}"
    for i in range(3):
        room = client.post(
            path + "/actions", headers=headers[0],
            json={"match_id": room["match_id"], "action_id": str(uuid4()),
                  "expected_version": room["match_version"],
                  "action": {"type": "pick", "choice": str(i)}},
        ).json()
    cards = [card["id"] for card in room["game"]["community"]]
    legacy = example_reading(cards)
    for section in legacy["cards"]:
        del section["quirky_interpretation"], section["characters"]
        section["pop_culture"] = "A character analogy from the saved earlier reading."
    with sessions()() as session:
        session.add(TarotReading(
            match_id=room["match_id"], status="complete", payload=legacy,
            question="An earlier saved question", prompt_version="pop-tarot-2",
            attempt_id=str(uuid4()), lease_until=0,
        ))
        session.commit()

    def forbidden(*args, **kwargs):
        raise AssertionError("Saved readings must not make another provider call.")

    monkeypatch.setattr("app.rooms.service.generate_reading", forbidden)
    saved = client.get(path + "/reading", headers=headers[0])
    assert saved.status_code == 200 and saved.json()["status"] == "complete"
    assert saved.json()["question"] == "An earlier saved question"
    for section in saved.json()["reading"]["cards"]:
        assert section["quirky_interpretation"] is None and section["characters"] == []
        assert section["pop_culture"] == "A character analogy from the saved earlier reading."
    repeated = client.post(
        path + "/reading", headers=headers[0], json={"match_id": room["match_id"]}
    )
    assert repeated.json() == saved.json()
    with sessions()() as session:
        assert session.get(TarotReading, room["match_id"]).payload == legacy


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

    def fail(_cards, question, *, before_attempt=None):
        if before_attempt:
            before_attempt()
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

    def recover(cards, _question, *, before_attempt=None):
        from app.games.tarot.reading import validate_reading

        if before_attempt:
            before_attempt()
        return validate_reading(example_reading(cards), cards)

    monkeypatch.setattr("app.rooms.service.generate_reading", recover)
    recovered = client.post(path + "/reading", headers=headers[0], json=payload)
    assert recovered.status_code == 200 and recovered.json()["status"] == "complete"
    assert client.get(path + "/reading", headers=headers[0]).json() == recovered.json()


@pytest.mark.parametrize("budget_allows_retry", [True, False])
def test_tarot_regeneration_is_budgeted_and_saved_or_recoverable(
    client, monkeypatch, budget_allows_retry
):
    import json

    from sqlalchemy import select

    room, headers = seated_room(client, "tarot", 1)
    path = f"/v1/rooms/{room['id']}"
    for index in range(3):
        room = client.post(
            path + "/actions", headers=headers[0],
            json={"match_id": room["match_id"], "action_id": str(uuid4()),
                  "expected_version": room["match_version"],
                  "action": {"type": "pick", "choice": str(index)}},
        ).json()
    with sessions()() as session:
        before = sum(session.scalars(select(RateBucket.count).where(
            RateBucket.key == hashlib.sha256(b"tarot-provider-daily-budget").hexdigest(),
            RateBucket.window == int(time.time()) // 86400,
        )).all())
    monkeypatch.setattr(settings(), "gemini_api_key", "test-budgeted-provider")
    monkeypatch.setattr(settings(), "tarot_daily_limit", before + (2 if budget_allows_retry else 1))
    real_client, calls = httpx.Client, []

    def respond(request):
        context = json.loads(json.loads(request.content)["input"])
        calls.append(True)
        reading = example_reading([card["card_id"] for card in context["cards"]])
        if len(calls) == 1:
            del reading["cards"][0]["interpretation"]
        return httpx.Response(200, json={"status": "completed", "steps": [{
            "type": "model_output", "content": [{"type": "text", "text": json.dumps(reading)}]
        }]})

    monkeypatch.setattr(
        "app.games.tarot.reading.httpx.Client",
        lambda **kwargs: real_client(transport=httpx.MockTransport(respond), **kwargs),
    )
    payload = {"match_id": room["match_id"], "question": "A private saved question"}
    result = client.post(path + "/reading", headers=headers[0], json=payload)
    assert result.status_code == (200 if budget_allows_retry else 429)
    assert len(calls) == (2 if budget_allows_retry else 1)
    with sessions()() as session:
        after = sum(session.scalars(select(RateBucket.count).where(
            RateBucket.key == hashlib.sha256(b"tarot-provider-daily-budget").hexdigest(),
            RateBucket.window == int(time.time()) // 86400,
        )).all())
        saved = session.get(TarotReading, room["match_id"])
        assert after - before == 2  # The rejected reservation is rate-limited too.
        assert saved.status == ("complete" if budget_allows_retry else "failed")
    if budget_allows_retry:
        assert client.get(path + "/reading", headers=headers[0]).json() == result.json()
        assert client.post(path + "/reading", headers=headers[0], json=payload).json() == result.json()
        assert len(calls) == 2
    else:
        fresh = client.get(path, headers=headers[0]).json()
        assert fresh["game"]["community"] == room["game"]["community"]
        assert fresh["game"]["phase"] == "reading"


@pytest.mark.parametrize("game_id", ["deal", "deal-no-mercy"])
def test_large_legal_deal_payment_crosses_api_boundary_and_preserves_every_card(client, game_id):
    import json

    room, headers = seated_room(client, game_id, 2)
    path = f"/v1/rooms/{room['id']}"
    game = ENGINES[game_id]
    # A conserved controlled deal complements shuffled browser matches. It puts
    # thirty-three legitimate cards into a bank, then uses actual API actions.
    with sessions()() as session, session.begin():
        match = session.get(Match, room["match_id"])
        owner, payer = match.participants
        state = game.setup(match.participants, {}, seed=31)
        attack = next(card.id for card in game.cards.values()
                      if card.action == ("debt" if game_id == "deal" else "yoink"))
        bank = [card.id for card in game.cards.values()
                if card.kind != "property" and card.id != attack][:33]
        state.update(
            hands={owner: [attack], payer: []}, banks={owner: [], payer: bank},
            deck=[card for card in game.cards if card not in {*bank, attack}],
            discard=[], properties={owner: {}, payer: {}},
        )
        before = json.dumps(state, sort_keys=True)
        match.state = state

    def inventory(state):
        return Counter([
            *state["deck"], *state["discard"],
            *(card for hand in state["hands"].values() for card in hand),
            *(card for assets in state["banks"].values() for card in assets),
            *(card for groups in state["properties"].values() for group in groups.values() for card in group),
        ])

    assert inventory(state) == Counter(game.cards.keys())
    legal = game.legal_actions(state, owner)
    action = next(option.action for option in legal if option.action.type == "play" and option.action.card == attack)
    game.apply_action(state, owner, action)
    assert hashlib.sha256(json.dumps(state, sort_keys=True).encode()).digest() == hashlib.sha256(before.encode()).digest()

    def move(header, snapshot, action):
        return client.post(path + "/actions", headers=header, json={
            "match_id": snapshot["match_id"], "action_id": str(uuid4()),
            "expected_version": snapshot["match_version"], "action": action,
        })

    billed = move(headers[0], room, action.model_dump())
    assert billed.status_code == 200
    pending = client.get(path, headers=headers[1]).json()
    accept = next(option["action"] for option in pending["game"]["actions"] if option["action"]["type"] == "accept")
    accepted = move(headers[1], pending, accept)
    assert accepted.status_code == 200
    pending = accepted.json()
    option = next(option for option in pending["game"]["actions"] if option["action"]["type"] == "pay")
    assert len(option["eligible_cards"]) == 33
    assert set(option["eligible_cards"]) == set(bank)
    # A bigger wire allowance must not permit someone else's/discarded assets.
    rejected = move(headers[1], pending, {**option["action"], "cards": [*bank, attack]})
    assert rejected.status_code == 422
    assert client.get(path, headers=headers[1]).json()["match_version"] == pending["match_version"]
    paid = move(headers[1], pending, {**option["action"], "cards": bank})
    assert paid.status_code == 200
    after = client.get(path, headers=headers[1]).json()
    assert after["match_version"] == pending["match_version"] + 1
    public_players = {player["id"]: player for player in after["game"]["players"]}
    assert not public_players[payer]["bank"]
    assert len(public_players[owner]["bank"]) == 33
    with sessions()() as session:
        saved = session.get(Match, room["match_id"])
        assert inventory(saved.state) == Counter(game.cards.keys())
        assert set(saved.state["banks"][owner]) == set(bank)
