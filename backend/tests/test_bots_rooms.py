"""Room-owned algorithmic bots through the real HTTP/persistence boundary."""

import time
from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4

import jwt
import pytest
from fastapi.testclient import TestClient
from room_helpers import player, require_isolated
from sqlalchemy import select

from app.db import sessions
from app.games.registry import ENGINES
from app.main import app
from app.models import Match, Member, Profile, Receipt
from app.rooms.service import RoomService
from app.settings import settings


@pytest.fixture
def client():
    require_isolated()
    with TestClient(app) as client:
        yield client


def create_bots(client, game="four-in-a-row", seats=2, count=1):
    header = player(client)
    response = client.post(
        "/v1/rooms",
        headers=header,
        json={
            "name": "Bot test host",
            "room_name": "Bot verification",
            "game_id": game,
            "capacity": seats,
            "bots": count,
        },
    )
    assert response.status_code == 201, response.text
    return response.json(), header


def begin(client, room, header):
    path = f"/v1/rooms/{room['id']}"
    assert client.put(path + "/ready", headers=header, json={"ready": True}).status_code == 200
    response = client.post(path + "/start", headers=header)
    assert response.status_code == 200, response.text
    return response.json()


def drive(client, room, header):
    return client.post(
        f"/v1/rooms/{room['id']}/bots/drive",
        headers=header,
        json={"match_id": room["match_id"], "expected_version": room["match_version"]},
    )


def move(client, room, header, action):
    return client.post(
        f"/v1/rooms/{room['id']}/actions",
        headers=header,
        json={
            "match_id": room["match_id"],
            "expected_version": room["match_version"],
            "action_id": str(uuid4()),
            "action": action,
        },
    )


def test_bots_are_room_owned_ready_and_cannot_authenticate_or_host(client):
    room, host = create_bots(client, seats=2)
    path = f"/v1/rooms/{room['id']}"
    bot = next(m for m in room["members"] if m["is_bot"])
    assert bot["id"].startswith("bot:") and len(bot["id"]) == 36
    assert bot["ready"] and bot["connected"] and bot["id"] != room["owner_id"]
    assert not room["bot_pending"] and room["bot_due_at"] is None
    token = jwt.encode(
        {
            "sub": bot["id"],
            "aud": "games-dev",
            "iss": "games-local",
            "exp": int(time.time()) + 1000,
        },
        settings().app_secret,
        algorithm="HS256",
    )
    fake = {"Authorization": "Bearer " + token}
    for suffix in ["", "/claim-host", "/heartbeat"]:
        response = (
            client.get(path, headers=fake)
            if not suffix
            else client.post(path + suffix, headers=fake)
        )
        assert response.status_code == 401
    outsider = player(client)
    assert client.post(path + "/bots", headers=outsider, json={"count": 1}).status_code == 404
    assert client.post(path + "/bots", headers=host, json={"count": 1}).status_code == 422
    removed = client.delete(path + "/members/" + bot["id"], headers=host)
    assert removed.status_code == 200 and len(removed.json()["members"]) == 1
    added = client.post(path + "/bots", headers=host, json={"count": 1})
    assert added.status_code == 200 and added.json()["members"][-1]["is_bot"]
    solo = client.post(
        "/v1/rooms",
        headers=player(client),
        json={
            "name": "Solo",
            "game_id": "tarot",
            "capacity": 1,
            "bots": 1,
        },
    )
    assert solo.status_code == 422


def test_humans_replace_lobby_bots_and_bots_never_inherit_host(client):
    room, host = create_bots(client, game="uno", seats=3, count=2)
    path = f"/v1/rooms/{room['id']}"
    guest = player(client)
    joined = client.post(
        "/v1/rooms/join", headers=guest, json={"invite": room["code"], "name": "A real friend"}
    )
    assert joined.status_code == 200
    current = joined.json()
    assert len(current["members"]) == 3
    assert sum(m["is_bot"] for m in current["members"]) == 1
    friend = next(m for m in current["members"] if m["name"] == "A real friend")
    assert friend["seated"] and not friend["is_bot"]
    assert client.post(path + "/bots", headers=guest, json={"count": 1}).status_code == 403
    left = client.post(path + "/leave", headers=host)
    assert left.status_code == 200 and left.json()["owner_id"] == friend["id"]
    assert client.post(path + "/leave", headers=guest).status_code == 200
    assert client.get(path, headers=guest).status_code == 404
    with sessions()() as db:
        assert all(
            not m.active
            for m in db.scalars(
                select(Member).where(Member.room_id == room["id"], Member.is_bot.is_(True))
            ).all()
        )
        # Retired bot profiles remain available to the saved match history.
        assert db.get(Profile, next(m["id"] for m in current["members"] if m["is_bot"]))


def test_bot_drive_is_paced_concurrent_idempotent_and_restart_safe(client, monkeypatch):
    room, host = create_bots(client)
    path = f"/v1/rooms/{room['id']}"
    room = begin(client, room, host)
    human_action = room["game"]["actions"][0]["action"]
    response = move(client, room, host, human_action)
    assert response.status_code == 200
    room = response.json()
    assert room["bot_pending"] and room["bot_due_at"]
    with sessions()() as db, db.begin():
        db.get(Match, room["match_id"]).bot_due_at = time.time() + 100
    early = drive(client, room, host)
    assert early.status_code == 200 and early.json()["match_version"] == room["match_version"]
    with sessions()() as db, db.begin():
        db.get(Match, room["match_id"]).bot_due_at = 0
    outsider = player(client)
    assert drive(client, room, outsider).status_code == 404
    with ThreadPoolExecutor(max_workers=2) as pool:
        responses = list(pool.map(lambda _: drive(client, room, host), range(2)))
    assert [r.status_code for r in responses] == [200, 200]
    final = responses[-1].json()
    assert all(r.json()["match_version"] == room["match_version"] + 1 for r in responses)
    assert drive(client, room, host).json()["match_version"] == final["match_version"]
    bot_id = next(m["id"] for m in final["members"] if m["is_bot"])
    with sessions()() as db:
        saved = db.get(Match, room["match_id"])
        memory, due = saved.bot_memory, saved.bot_due_at
        assert memory[bot_id]["seed"] and memory[bot_id]["step"] == 1
        receipts = db.scalars(
            select(Receipt).where(Receipt.match_id == saved.id, Receipt.actor_id == bot_id)
        ).all()
        assert len(receipts) == 1
    with TestClient(app) as restarted:
        read = restarted.get(path, headers=host)
        assert read.status_code == 200 and read.json()["match_version"] == final["match_version"]
        assert "bot_memory" not in read.text and "seed" not in read.text
        assert drive(restarted, room, host).json()["match_version"] == final["match_version"]
    with sessions()() as db:
        assert db.get(Match, room["match_id"]).bot_memory == memory
        assert db.get(Match, room["match_id"]).bot_due_at == due
    monkeypatch.setattr("app.rooms.service.BOT_DELAY_SECONDS", 0)
    with TestClient(app) as restarted:
        live = restarted.get(path, headers=host).json()
        human = move(restarted, live, host, live["game"]["actions"][0]["action"])
        assert human.status_code == 200 and human.json()["bot_pending"]
        resumed = drive(restarted, human.json(), host)
        assert resumed.status_code == 200
        assert resumed.json()["match_version"] == human.json()["match_version"] + 1
    with sessions()() as db:
        continued = db.get(Match, room["match_id"]).bot_memory[bot_id]
        assert continued["seed"] == memory[bot_id]["seed"] and continued["step"] == 2
    assert client.post(path + "/bots", headers=host, json={"count": 1}).status_code == 409
    assert client.delete(path + "/members/" + bot_id, headers=host).status_code == 409
    assert move(client, room, host, human_action).status_code == 409


def test_bots_ignore_their_lease_but_missing_humans_pause_them(client, monkeypatch):
    monkeypatch.setattr("app.rooms.service.BOT_DELAY_SECONDS", 0)
    room, host = create_bots(client, game="uno", seats=3)
    guest = player(client)
    path = f"/v1/rooms/{room['id']}"
    assert (
        client.post(
            "/v1/rooms/join", headers=guest, json={"invite": room["code"], "name": "Friend"}
        ).status_code
        == 200
    )
    assert client.put(path + "/ready", headers=guest, json={"ready": True}).status_code == 200
    with sessions()() as db, db.begin():
        bot = db.scalar(select(Member).where(Member.room_id == room["id"], Member.is_bot.is_(True)))
        bot.seen_at = time.time() - 500
    room = begin(client, room, host)
    assert not room["paused"] and next(m for m in room["members"] if m["is_bot"])["connected"]
    human_id = next(m["id"] for m in room["members"] if m["name"] == "Friend")
    with sessions()() as db, db.begin():
        db.get(Member, (room["id"], human_id)).seen_at = time.time() - 100
    stalled = drive(client, room, host)
    assert stalled.status_code == 200 and stalled.json()["paused"]
    assert stalled.json()["match_version"] == room["match_version"]
    assert not stalled.json()["bot_pending"]
    assert client.post(path + "/heartbeat", headers=guest).status_code == 200
    assert not client.get(path, headers=host).json()["paused"]


def test_ranked_gang_bots_wait_without_churning_human_choices(client, monkeypatch):
    monkeypatch.setattr("app.rooms.service.BOT_DELAY_SECONDS", 0)
    room, host = create_bots(client, game="the-gang", seats=3, count=2)
    room = begin(client, room, host)
    host_id = room["owner_id"]
    for _ in range(2):
        assert room["bot_pending"]
        response = drive(client, room, host)
        assert response.status_code == 200, response.text
        room = response.json()
    assert room["game"]["detail"]["pending_players"] == [host_id]
    assert not room["bot_pending"]
    version = room["match_version"]
    for _ in range(3):
        room = drive(client, room, host).json()
        assert room["match_version"] == version


def test_one_human_can_rematch_change_game_and_close_all_bot_room(client, monkeypatch):
    from app.bots import choose_action

    monkeypatch.setattr("app.rooms.service.BOT_DELAY_SECONDS", 0)
    room, host = create_bots(client)
    path = f"/v1/rooms/{room['id']}"
    room = begin(client, room, host)
    first_match = room["match_id"]
    memory = None
    for _ in range(100):
        if room["status"] == "finished":
            break
        if room["bot_pending"]:
            response = drive(client, room, host)
        else:
            from app.core.contracts import GameView

            decision = choose_action(
                GameView.model_validate(room["game"]), room["owner_id"], memory
            )
            memory = decision.memory
            response = move(client, room, host, decision.action.model_dump())
        assert response.status_code == 200, response.text
        room = response.json()
    assert room["status"] == "finished"
    history = client.get("/v1/me", headers=host).json()["history"]
    assert next(m for m in history if m["id"] == first_match)["game_id"] == "four-in-a-row"
    assert all(m["ready"] for m in room["members"] if m["is_bot"])
    room = begin(client, room, host)
    assert room["match_id"] != first_match
    assert client.post(path + "/abandon", headers=host).status_code == 200
    changed = client.put(
        path + "/settings",
        headers=host,
        json={"game_id": "six-nimmt", "capacity": 2, "settings": {}},
    )
    assert changed.status_code == 200 and changed.json()["members"][-1]["ready"]
    assert begin(client, changed.json(), host)["game"]["game_id"] == "six-nimmt"
    assert client.post(path + "/leave", headers=host).status_code == 200
    assert client.get(path, headers=host).status_code == 404


def test_bot_policy_receives_only_its_projection_and_its_choice_stays_private(client, monkeypatch):
    import app.bots
    from app.bots import BotDecision

    monkeypatch.setattr("app.rooms.service.BOT_DELAY_SECONDS", 0)
    private_seed = 0xE51CD21AD3973B4D8106A7CF9362B026
    entropy_requests = []

    def entropy(bits):
        entropy_requests.append(bits)
        return private_seed

    observed = []
    actual = app.bots.choose_action

    def inspect(view, player_id, memory):
        observed.append((view, player_id))
        decision = actual(view, player_id, memory)
        return BotDecision(
            decision.action, {**decision.memory, "private_policy_note": "only-bot-memory"}
        )

    monkeypatch.setattr(app.bots, "choose_action", inspect)
    room, host = create_bots(client, game="six-nimmt")
    room = begin(client, room, host)
    # Patch only after the authoritative engine has independently shuffled.
    monkeypatch.setattr("app.rooms.service.secrets.randbits", entropy)
    own_cards = {card["id"] for card in room["game"]["hand"]}
    response = drive(client, room, host)
    assert response.status_code == 200, response.text
    current = response.json()
    view, bot_id = observed[0]
    assert bot_id.startswith("bot:")
    assert not own_cards.intersection(card.id for card in view.hand)
    assert not any(p.cards for p in view.players if p.id == room["owner_id"])
    assert current["game"]["detail"]["selected_players"] == [bot_id]
    assert current["game"]["detail"]["own_selection"] is None
    assert current["game"]["community"] == []
    assert "only-bot-memory" not in response.text and '"seed"' not in response.text
    assert '"deck"' not in response.text and '"bot_memory"' not in response.text
    assert entropy_requests == [128]
    with sessions()() as db:
        assert db.get(Match, room["match_id"]).bot_memory[bot_id]["seed"] == private_seed


@pytest.mark.parametrize("game_id", [game for game in ENGINES if game != "tarot"])
def test_one_human_with_bots_starts_every_game_at_its_maximum_capacity(client, game_id):
    seats = ENGINES[game_id].manifest.max_players
    room, host = create_bots(client, game=game_id, seats=seats, count=seats - 1)
    started = begin(client, room, host)
    assert len(started["game"]["players"]) == seats
    assert sum(m["is_bot"] for m in started["members"]) == seats - 1
    assert not started["paused"]


def test_human_bot_like_display_name_does_not_limit_available_bot_seats(client):
    response = client.post(
        "/v1/rooms",
        headers=player(client),
        json={
            "name": "Bot Ada",
            "game_id": "uno",
            "capacity": 10,
            "bots": 9,
        },
    )
    assert response.status_code == 201
    members = response.json()["members"]
    assert len(members) == 10 and sum(m["is_bot"] for m in members) == 9
    assert len({m["name"] for m in members}) == 10


def test_trio_bots_remember_public_reveals_even_during_the_humans_turn(client, monkeypatch):
    monkeypatch.setattr("app.rooms.service.BOT_DELAY_SECONDS", 0)
    room, host = create_bots(client, game="trio", seats=3, count=2)
    room = begin(client, room, host)
    option = next(o for o in room["game"]["actions"] if o["action"]["type"] == "reveal_table")
    response = move(client, room, host, option["action"])
    assert response.status_code == 200
    current = response.json()
    revealed = current["game"]["detail"]["revealed"][0]
    assert current["game"]["current_player"] == current["owner_id"]
    with sessions()() as db:
        memories = db.get(Match, room["match_id"]).bot_memory
        for bot in [m for m in current["members"] if m["is_bot"]]:
            saved = memories[bot["id"]]
            assert saved["step"] == 0
            assert saved["trio_table"][str(revealed["slot"])] == int(revealed["card"]["value"])
    assert '"bot_memory"' not in response.text and '"trio_table"' not in response.text


def test_bot_uno_announcement_precedes_another_bots_catch(client, monkeypatch):
    monkeypatch.setattr("app.rooms.service.BOT_DELAY_SECONDS", 0)
    room, host = create_bots(client, game="uno", seats=3, count=2)
    room = begin(client, room, host)
    bots = [m["id"] for m in room["members"] if m["is_bot"]]
    with sessions()() as db, db.begin():
        match = db.get(Match, room["match_id"])
        state = ENGINES["uno"].copy(match.state)
        # A conserved post-play reaction window: the next ordinary actor could
        # catch the bot, but the one-card owner can still legally announce UNO.
        state["deck"].extend(state["hands"][bots[0]][1:])
        state["hands"][bots[0]] = state["hands"][bots[0]][:1]
        state.update(
            called=[],
            catchable=bots[0],
            pending=None,
            penalty=0,
            turn=state["order"].index(bots[1]),
        )
        match.state = state
    response = drive(client, room, host)
    assert response.status_code == 200
    with sessions()() as db:
        state = db.get(Match, room["match_id"]).state
        assert bots[0] in state["called"] and state["catchable"] is None
        assert len(state["hands"][bots[0]]) == 1
        receipt = db.scalar(select(Receipt).where(Receipt.match_id == room["match_id"]))
        assert receipt.actor_id == bots[0]


@pytest.mark.parametrize("game_id", [game for game in ENGINES if game != "tarot"])
def test_one_human_and_bots_finish_every_multiplayer_game_through_http(
    client, monkeypatch, game_id
):
    from app.bots import choose_action, observe_view
    from app.core.contracts import GameView

    monkeypatch.setattr("app.rooms.service.BOT_DELAY_SECONDS", 0)
    # Pacing/rate limits have independent coverage. Bounded scenarios can exercise
    # thousands of legal turns without waiting for a production minute window.
    monkeypatch.setattr(RoomService, "_rate", lambda *args, **kwargs: None)
    # Reproducible authoritative deal and independent policy randomness. Neither
    # is exposed by the API or passed from engine state to a decision function.
    original_setup = ENGINES[game_id].setup
    monkeypatch.setattr(
        ENGINES[game_id],
        "setup",
        lambda players, settings, seed=None: original_setup(players, settings, seed=31),
    )
    monkeypatch.setattr("app.rooms.service.secrets.randbits", lambda bits: 73)
    seats = max(2, ENGINES[game_id].manifest.min_players)
    room, host = create_bots(client, game=game_id, seats=seats, count=seats - 1)
    room = begin(client, room, host)
    memory = {"seed": 88}
    for _ in range(5000):
        if room["status"] == "finished":
            break
        view = GameView.model_validate(room["game"])
        memory = observe_view(view, room["owner_id"], memory)
        if room["bot_pending"]:
            response = drive(client, room, host)
        else:
            assert view.actions, (game_id, view.phase)
            decision = choose_action(view, room["owner_id"], memory)
            memory = decision.memory
            response = move(client, room, host, decision.action.model_dump())
        assert response.status_code == 200, (game_id, response.text)
        room = response.json()
    assert room["status"] == "finished", (game_id, room["game"]["phase"])
    assert not room["bot_pending"]
    assert all(not m["is_bot"] or m["ready"] for m in room["members"])
    history = client.get("/v1/me", headers=host).json()["history"]
    assert any(m["id"] == room["match_id"] and m["game_id"] == game_id for m in history)
