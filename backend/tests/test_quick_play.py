"""Intentful, atomic starts; browser retries cannot create another private match."""

import hashlib
import time
from concurrent.futures import ThreadPoolExecutor
from threading import Event
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from room_helpers import player, require_isolated
from sqlalchemy import func, select

from app.auth import identity
from app.db import sessions
from app.games.registry import ENGINES
from app.main import app
from app.models import Match, Member, Profile, RateBucket, Room, TarotReading
from app.rooms.repository import Repository
from app.rooms.service import RoomService


@pytest.fixture
def client():
    require_isolated()
    with TestClient(app) as value:
        yield value


def play(client, headers, game="tarot", request_id=None):
    return client.post(
        f"/v1/games/{game}/play", headers=headers,
        json={"request_id": request_id or str(uuid4())},
    )


@pytest.mark.parametrize("game_id", list(ENGINES))
def test_every_game_quick_starts_at_default_capacity_with_one_human(client, game_id):
    headers = player(client)
    response = play(client, headers, game_id)
    assert response.status_code == 200, response.text
    room = response.json()
    count = 1 if game_id == "tarot" else max(2, ENGINES[game_id].manifest.min_players)
    assert room["status"] == "playing" and room["match_version"] == 1
    assert room["capacity"] == count and room["game_id"] == game_id
    assert len(room["members"]) == len(room["game"]["players"]) == count
    assert sum(not member["is_bot"] for member in room["members"]) == 1
    assert sum(member["is_bot"] for member in room["members"]) == count - 1
    assert next(member for member in room["members"] if not member["is_bot"])["id"] == room["owner_id"]
    assert response.headers["cache-control"] == "private, no-store"
    saved = client.get(f"/v1/rooms/{room['id']}", headers=headers)
    assert saved.status_code == 200 and saved.json()["match_id"] == room["match_id"]
    assert saved.json()["game"] == room["game"]
    assert '"deck"' not in response.text and '"seed"' not in response.text
    if game_id == "tarot":
        assert room["game"]["community"] == []
        assert len(room["game"]["actions"]) == 78
        with sessions()() as session:
            assert session.get(TarotReading, room["match_id"]) is None


def test_concurrent_repeated_intent_commits_one_room_match_and_bot_group(client):
    headers, request_id = player(client), str(uuid4())
    with ThreadPoolExecutor(max_workers=2) as pool:
        responses = list(pool.map(lambda _: play(client, headers, "uno", request_id), range(2)))
    assert [response.status_code for response in responses] == [200, 200]
    left, right = [response.json() for response in responses]
    assert left == right
    owner = left["owner_id"]
    with sessions()() as session:
        assert session.scalar(select(func.count()).select_from(Room).where(Room.owner_id == owner)) == 1
        assert session.scalar(select(func.count()).select_from(Match).where(Match.room_id == left["id"])) == 1
        assert session.scalar(select(func.count()).select_from(Member).where(Member.room_id == left["id"])) == 2
    with TestClient(app) as restarted:
        repeated = play(restarted, headers, "uno", request_id)
        assert repeated.status_code == 200 and repeated.json()["match_id"] == left["match_id"]


def test_existing_profile_is_unchanged_and_separate_intents_are_distinct(client):
    headers = player(client)
    assert client.put("/v1/profile", headers=headers, json={"name": "Mira", "avatar": 6}).status_code == 200
    first, second = play(client, headers).json(), play(client, headers).json()
    assert first["id"] != second["id"] and first["match_id"] != second["match_id"]
    assert first["members"][0]["name"] == second["members"][0]["name"] == "Mira"
    assert first["members"][0]["avatar"] == second["members"][0]["avatar"] == 6
    profile = client.get("/v1/me", headers=headers).json()["profile"]
    assert profile["name"] == "Mira" and profile["avatar"] == 6


def test_quick_play_replay_can_overlap_rejoin_without_profile_lock_inversion(client, monkeypatch):
    headers, request_id = player(client), str(uuid4())
    room = play(client, headers, "uno", request_id).json()
    join_locked, replay_lock_requested = Event(), Event()
    save_profile, get_room = Repository.save_profile, Repository.room

    def waiting_save(self, *args):
        join_locked.set()
        assert replay_lock_requested.wait(5)
        return save_profile(self, *args)

    def waiting_room(self, room_id, lock=False):
        if room_id == room["id"] and lock:
            replay_lock_requested.set()
        return get_room(self, room_id, lock)

    monkeypatch.setattr(Repository, "save_profile", waiting_save)
    monkeypatch.setattr(Repository, "room", waiting_room)
    with ThreadPoolExecutor(max_workers=2) as pool:
        joined = pool.submit(client.post, "/v1/rooms/join", headers=headers, json={
            "invite": room["code"], "name": "Mira", "avatar": 6,
        })
        assert join_locked.wait(5)
        replayed = pool.submit(play, client, headers, "uno", request_id)
        assert joined.result(timeout=5).status_code == 200
        replay = replayed.result(timeout=5)
    assert replay.status_code == 200 and replay.json()["match_id"] == room["match_id"]
    assert next(member for member in replay.json()["members"] if not member["is_bot"])["name"] == "Mira"


def test_same_request_id_is_bound_to_the_actor_and_game(client):
    owner, outsider, request_id = player(client), player(client), str(uuid4())
    room = play(client, owner, request_id=request_id).json()
    assert client.get(f"/v1/rooms/{room['id']}", headers=outsider).status_code == 404
    own_room = play(client, outsider, request_id=request_id).json()
    assert own_room["id"] != room["id"] and own_room["owner_id"] != room["owner_id"]
    assert play(client, owner, "uno", request_id).status_code == 409
    assert play(client, owner, request_id=request_id).json()["match_id"] == room["match_id"]


def test_replay_preserves_progress_and_cannot_restart_a_closed_or_changed_session(client):
    headers, request_id = player(client), str(uuid4())
    room = play(client, headers, request_id=request_id).json()
    path = f"/v1/rooms/{room['id']}"
    moved = client.post(path + "/actions", headers=headers, json={
        "match_id": room["match_id"], "expected_version": room["match_version"],
        "action_id": str(uuid4()), "action": room["game"]["actions"][0]["action"],
    })
    assert moved.status_code == 200
    replay = play(client, headers, request_id=request_id)
    assert replay.status_code == 200 and replay.json()["game"]["community"] == moved.json()["game"]["community"]
    assert replay.json()["match_version"] == 2
    assert client.post(path + "/abandon", headers=headers).status_code == 200
    assert play(client, headers, request_id=request_id).status_code == 409
    assert client.put(path + "/ready", headers=headers, json={"ready": True}).status_code == 200
    rematch = client.post(path + "/start", headers=headers)
    assert rematch.status_code == 200 and rematch.json()["match_id"] != room["match_id"]
    assert play(client, headers, request_id=request_id).status_code == 409
    assert client.post(path + "/abandon", headers=headers).status_code == 200
    assert client.post(path + "/leave", headers=headers).status_code == 200
    assert play(client, headers, request_id=request_id).status_code == 410
    with sessions()() as session:
        assert session.get(Room, room["id"]).status == "closed"
        assert session.scalar(select(func.count()).select_from(Match).where(Match.room_id == room["id"])) == 2


def test_quick_play_rolls_back_profile_room_and_match_when_start_fails(client, monkeypatch):
    headers, request_id = player(client), str(uuid4())
    owner_id = identity(headers["Authorization"]).id
    original = RoomService._start_match

    def fail(self, room, *, match_id=None):
        original(self, room, match_id=match_id)
        raise RuntimeError("Injected after match creation")

    monkeypatch.setattr(RoomService, "_start_match", fail)
    with TestClient(app, raise_server_exceptions=False) as failing:
        assert play(failing, headers, request_id=request_id).status_code == 500
    with sessions()() as session:
        assert session.get(Profile, owner_id) is None
        assert session.scalar(select(func.count()).select_from(Room).where(Room.owner_id == owner_id)) == 0
    monkeypatch.setattr(RoomService, "_start_match", original)
    recovered = play(client, headers, request_id=request_id)
    assert recovered.status_code == 200 and recovered.json()["status"] == "playing"


def test_new_launches_share_creation_budget_but_replay_does_not_consume_it(client):
    headers, request_id = player(client), str(uuid4())
    room = play(client, headers, request_id=request_id).json()
    key = hashlib.sha256((room["owner_id"] + ":create").encode()).hexdigest()
    window = int(time.time()) // 3600
    with sessions()() as session, session.begin():
        session.get(RateBucket, (key, window)).count = 12
    assert play(client, headers, request_id=request_id).status_code == 200
    assert play(client, headers).status_code == 429
    with sessions()() as session:
        assert session.get(RateBucket, (key, window)).count == 12
        assert session.scalar(select(func.count()).select_from(Room).where(Room.owner_id == room["owner_id"])) == 1


def test_quick_play_requires_auth_valid_intent_and_supported_game(client, monkeypatch):
    headers = player(client)
    assert play(client, {}).status_code == 401
    assert play(client, headers, "unknown").status_code == 422
    assert play(client, headers, request_id="invalid").status_code == 422
    assert client.post("/v1/games/tarot/play", headers=headers, json={}).status_code == 422
    assert client.post("/v1/games/tarot/play", headers=headers, json={
        "request_id": str(uuid4()), "name": "Unexpected profile overwrite",
    }).status_code == 422
    monkeypatch.setattr("app.bots.supports_bots", lambda _: False)
    assert play(client, headers, "uno").status_code == 422
    assert client.get("/v1/me", headers=headers).json()["profile"] is None


def test_quick_start_can_finish_a_one_human_bot_match_and_replay_keeps_the_result(client, monkeypatch):
    from app.bots import choose_action
    from app.core.contracts import GameView

    monkeypatch.setattr("app.rooms.service.BOT_DELAY_SECONDS", 0)
    monkeypatch.setattr("app.rooms.service.bot_delay", lambda *args: 0)
    headers, request_id = player(client), str(uuid4())
    room = play(client, headers, "four-in-a-row", request_id).json()
    match_id = room["match_id"]
    memory = None
    for _ in range(50):
        if room["status"] == "finished":
            break
        path = f"/v1/rooms/{room['id']}"
        body = {"match_id": room["match_id"], "expected_version": room["match_version"]}
        if room["bot_pending"]:
            response = client.post(path + "/bots/drive", headers=headers, json=body)
        else:
            choice = choose_action(GameView.model_validate(room["game"]), room["owner_id"], memory)
            memory = choice.memory
            response = client.post(path + "/actions", headers=headers, json={
                **body, "action_id": str(uuid4()), "action": choice.action.model_dump(),
            })
        assert response.status_code == 200, response.text
        room = response.json()
    assert room["status"] == "finished"
    replay = play(client, headers, "four-in-a-row", request_id)
    assert replay.status_code == 200
    assert replay.json()["match_id"] == match_id and replay.json()["status"] == "finished"
    assert any(match["id"] == match_id for match in client.get("/v1/me", headers=headers).json()["history"])
