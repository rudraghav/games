"""Seating bots: how many, their names and how well each plays, through HTTP."""

from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from room_helpers import player, require_isolated
from sqlalchemy import select

from app import bots as bot_policies
from app.db import sessions
from app.main import app
from app.models import Member, Profile


@pytest.fixture
def client():
    require_isolated()
    with TestClient(app) as client:
        yield client


def table(client, headers, game="uno", capacity=4, **extra):
    return client.post(
        "/v1/rooms",
        headers=headers,
        json={"name": "Host", "room_name": "Bot setup", "game_id": game, "capacity": capacity, **extra},
    )


def bots(room):
    return [m for m in room["members"] if m["is_bot"]]


def test_bot_seats_set_each_bots_name_and_level_and_replace_the_plain_count(client):
    host = player(client)
    made = table(client, host, bots=1, bot_seats=[
        {"name": "  Captain   Crunch ", "level": "easy"},
        {"level": "medium"},
        {},
    ])
    assert made.status_code == 201, made.text
    room = made.json()
    assert [(b["name"], b["bot_level"]) for b in bots(room)] == [
        ("Captain Crunch", "easy"), ("Bot Ada", "medium"), ("Bot Bo", "hard"),
    ]
    assert all(b["ready"] and b["seated"] and b["id"].startswith("bot:") for b in bots(room))
    person = next(m for m in room["members"] if not m["is_bot"])
    assert person["bot_level"] is None
    with sessions()() as db:
        saved = {
            db.get(Profile, m.user_id).name: m.bot_level
            for m in db.scalars(select(Member).where(Member.room_id == room["id"], Member.is_bot))
        }
    assert saved == {"Captain Crunch": "easy", "Bot Ada": "medium", "Bot Bo": "hard"}
    # An empty list means no bots at all, whatever the plain count says.
    alone = table(client, player(client), bots=2, bot_seats=[])
    assert alone.status_code == 201 and not bots(alone.json())
    # The plain count still works on its own.
    counted = table(client, player(client), bots=2)
    assert [(b["name"], b["bot_level"]) for b in bots(counted.json())] == [
        ("Bot Ada", "hard"), ("Bot Bo", "hard"),
    ]


def test_bot_seats_obey_seats_names_and_levels(client):
    host = player(client)
    assert table(client, host, capacity=2, bot_seats=[{}, {}]).status_code == 422
    assert table(client, host, bot_seats=[{"level": "expert"}]).status_code == 422
    assert table(client, host, bot_seats=[{"name": ""}]).status_code == 422
    assert table(client, host, bot_seats=[{"name": "x" * 31}]).status_code == 422
    assert table(client, host, bot_seats=[{"name": "Zed", "skill": 3}]).status_code == 422
    assert table(client, host, game="tarot", capacity=1, bot_seats=[{}]).status_code == 422
    # Names are unique at the table without regard to case: against the host and
    # against each other.
    for seats in ([{"name": "host"}], [{"name": "Zed"}, {"name": "ZED"}]):
        clash = table(client, host, bot_seats=seats)
        assert clash.status_code == 422, seats
        assert "already called" in clash.json()["detail"]
    # None of the refused tables was created.
    assert client.get("/v1/me", headers=host).json()["rooms"] == []
    # A default name steps aside for a host's choice of the same name.
    made = table(client, host, bot_seats=[{}, {"name": "bot ada"}, {}])
    assert made.status_code == 201
    assert [b["name"] for b in bots(made.json())] == ["Bot Bo", "bot ada", "Bot Cleo"]


def test_added_bots_take_one_level_and_a_name_only_one_at_a_time(client):
    host = player(client)
    room = table(client, host, capacity=6).json()
    path = f"/v1/rooms/{room['id']}/bots"
    two = client.post(path, headers=host, json={"count": 2, "level": "easy"})
    assert two.status_code == 200
    assert [(b["name"], b["bot_level"]) for b in bots(two.json())] == [
        ("Bot Ada", "easy"), ("Bot Bo", "easy"),
    ]
    named = client.post(path, headers=host, json={"count": 1, "level": "medium", "name": "Rook"})
    assert named.status_code == 200 and bots(named.json())[-1]["name"] == "Rook"
    assert bots(named.json())[-1]["bot_level"] == "medium"
    default = client.post(path, headers=host, json={})
    assert default.status_code == 200 and bots(default.json())[-1]["bot_level"] == "hard"
    many = client.post(path, headers=host, json={"count": 2, "name": "Twins"})
    assert many.status_code == 422
    assert many.json()["detail"] == "A name can be given to one bot at a time."
    taken = client.post(path, headers=host, json={"name": "rook"})
    assert taken.status_code == 422 and "already called Rook" not in taken.json()["detail"]
    assert "already called rook" in taken.json()["detail"]
    assert client.post(path, headers=host, json={"level": "impossible"}).status_code == 422
    assert len(bots(client.get(f"/v1/rooms/{room['id']}", headers=host).json())) == 4


def test_the_host_renames_and_relevels_a_bot_between_matches(client):
    host, guest, outsider = player(client), player(client), player(client)
    room = table(client, host, game="uno", capacity=3, bot_seats=[{"level": "easy"}]).json()
    path = f"/v1/rooms/{room['id']}"
    bot = bots(room)[0]
    edit = f"{path}/bots/{bot['id']}"
    renamed = client.patch(edit, headers=host, json={"name": " Deep   Blue "})
    assert renamed.status_code == 200 and bots(renamed.json())[0]["name"] == "Deep Blue"
    assert bots(renamed.json())[0]["bot_level"] == "easy"
    assert renamed.json()["revision"] > room["revision"]
    harder = client.patch(edit, headers=host, json={"level": "hard"})
    assert harder.status_code == 200 and bots(harder.json())[0]["bot_level"] == "hard"
    assert bots(harder.json())[0]["name"] == "Deep Blue"
    both = client.patch(edit, headers=host, json={"name": "Kasparov", "level": "medium"})
    assert (bots(both.json())[0]["name"], bots(both.json())[0]["bot_level"]) == ("Kasparov", "medium")
    # Its own name again is fine; another member's name is not.
    assert client.patch(edit, headers=host, json={"name": "kasparov"}).status_code == 200
    clash = client.patch(edit, headers=host, json={"name": "HOST"})
    assert clash.status_code == 422 and "already called" in clash.json()["detail"]
    assert client.patch(edit, headers=host, json={}).status_code == 422
    assert client.patch(edit, headers=host, json={"level": "expert"}).status_code == 422
    assert client.patch(edit, headers=host, json={"is_bot": False}).status_code == 422
    # Only the host; an outsider cannot even learn the room exists.
    assert client.patch(edit, headers=outsider, json={"level": "easy"}).status_code == 404
    assert client.patch(edit).status_code in {401, 422}
    spectator = client.post("/v1/rooms/join", headers=guest, json={"invite": room["code"], "name": "Guest"})
    assert spectator.status_code == 200
    assert client.patch(edit, headers=guest, json={"level": "easy"}).status_code == 403
    # Only an active bot of this room can be edited.
    host_id = room["owner_id"]
    other = table(client, player(client), bot_seats=[{}]).json()
    for target in (host_id, "bot:" + uuid4().hex, bots(other)[0]["id"], "nobody"):
        missing = client.patch(f"{path}/bots/{target}", headers=host, json={"level": "easy"})
        assert missing.status_code == 404, target
        assert missing.json()["detail"] == "That bot is not at this table."
    with sessions()() as db:
        assert db.get(Member, (other["id"], bots(other)[0]["id"])).bot_level == "hard"
    # Not while a match is being played.
    guest_id = next(m["id"] for m in spectator.json()["members"] if m["name"] == "Guest")
    assert client.delete(f"{path}/members/{guest_id}", headers=host).status_code == 200
    assert client.put(path + "/ready", headers=host, json={"ready": True}).status_code == 200
    assert client.post(path + "/start", headers=host).status_code == 200
    playing = client.patch(edit, headers=host, json={"level": "easy"})
    assert playing.status_code == 409
    assert playing.json()["detail"] == "Bots can be changed between matches."
    # A removed bot is gone for editing too.
    assert client.post(path + "/abandon", headers=host).status_code == 200
    assert client.delete(f"{path}/members/{bot['id']}", headers=host).status_code == 200
    assert client.patch(edit, headers=host, json={"level": "easy"}).status_code == 404


def test_bots_seated_before_levels_existed_show_and_play_as_hard(client, monkeypatch):
    host = player(client)
    room = table(client, host, game="four-in-a-row", capacity=2, bots=1).json()
    bot_id = bots(room)[0]["id"]
    with sessions()() as db, db.begin():
        db.get(Member, (room["id"], bot_id)).bot_level = None
    shown = client.get(f"/v1/rooms/{room['id']}", headers=host).json()
    assert bots(shown)[0]["bot_level"] == "hard"
    assert played_levels(client, monkeypatch, room, host) == [()]


def test_quick_play_bots_stay_hard(client):
    quick = client.post(
        "/v1/games/uno/play", headers=player(client), json={"request_id": str(uuid4())}
    )
    assert quick.status_code == 200
    assert [b["bot_level"] for b in bots(quick.json())] == ["hard"]


def played_levels(client, monkeypatch, room, host):
    """Start the match and drive one bot move; return the level arguments it received."""
    monkeypatch.setattr("app.rooms.service.BOT_DELAY_SECONDS", 0)
    path = f"/v1/rooms/{room['id']}"
    assert client.put(path + "/ready", headers=host, json={"ready": True}).status_code == 200
    live = client.post(path + "/start", headers=host).json()
    seen = []
    actual = bot_policies.choose_action

    def spy(view, player_id, memory=None, *level):
        seen.append(level)
        return actual(view, player_id, memory, *level)

    monkeypatch.setattr(bot_policies, "choose_action", spy)
    for _ in range(4):
        if seen:
            break
        if live["game"]["current_player"] == live["owner_id"]:
            live = client.post(path + "/actions", headers=host, json={
                "match_id": live["match_id"], "expected_version": live["match_version"],
                "action_id": str(uuid4()), "action": live["game"]["actions"][0]["action"],
            }).json()
        live = client.post(path + "/bots/drive", headers=host, json={
            "match_id": live["match_id"], "expected_version": live["match_version"],
        }).json()
    return seen


@pytest.mark.parametrize("level,expected", [("easy", [("easy",)]), ("medium", [("medium",)]), ("hard", [()])])
def test_the_acting_bots_own_level_reaches_its_policy(client, monkeypatch, level, expected):
    host = player(client)
    room = table(
        client, host, game="four-in-a-row", capacity=2, bot_seats=[{"level": level}]
    ).json()
    assert played_levels(client, monkeypatch, room, host) == expected


def test_a_joining_friend_replaces_a_bot_whatever_its_name_or_level(client):
    host, guest = player(client), player(client)
    room = table(client, host, capacity=3, bot_seats=[
        {"name": "Keeper", "level": "easy"}, {"name": "Last in", "level": "medium"},
    ]).json()
    joined = client.post("/v1/rooms/join", headers=guest, json={"invite": room["code"], "name": "Friend"})
    assert joined.status_code == 200
    assert [(b["name"], b["bot_level"]) for b in bots(joined.json())] == [("Keeper", "easy")]
    friend = next(m for m in joined.json()["members"] if m["name"] == "Friend")
    assert friend["seated"] and friend["bot_level"] is None
