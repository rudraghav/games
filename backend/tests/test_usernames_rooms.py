"""Usernames and finding players by them; a username stays out of every room view."""

import json
import secrets
from concurrent.futures import ThreadPoolExecutor

import pytest
from fastapi.testclient import TestClient
from room_helpers import create, player, require_isolated
from sqlalchemy import select

from app.db import sessions
from app.main import app
from app.models import Profile, RateBucket
from app.rooms.service import RESERVED_USERNAMES, RoomService


@pytest.fixture
def client():
    require_isolated()
    with TestClient(app) as client:
        yield client


def named(client, name="Player", avatar=0):
    headers = player(client)
    saved = client.put("/v1/profile", headers=headers, json={"name": name, "avatar": avatar})
    assert saved.status_code == 200, saved.text
    return headers


def claim(client, headers, username):
    return client.put("/v1/profile/username", headers=headers, json={"username": username})


def search(client, headers, q):
    return client.get("/v1/players/search", headers=headers, params={"q": q})


def tag(prefix="u"):
    """A username no other test in this database run has used."""
    return f"{prefix}_{secrets.token_hex(4)}"


def test_a_username_needs_a_profile_and_is_returned_only_to_its_owner(client):
    fresh = player(client)
    early = claim(client, fresh, tag())
    assert early.status_code == 409
    assert early.json()["detail"] == "Choose a display name before picking a username."
    assert client.put("/v1/profile/username", json={"username": tag()}).status_code == 401
    owner = named(client, "Asha", 3)
    name = tag("asha")
    saved = claim(client, owner, f"  @{name.upper()} ")
    assert saved.status_code == 200
    assert saved.json() == {
        "id": saved.json()["id"], "name": "Asha", "avatar": 3, "username": name,
    }
    assert saved.headers["cache-control"] == "private, no-store"
    assert client.get("/v1/me", headers=owner).json()["profile"]["username"] == name
    renamed = client.put("/v1/profile", headers=owner, json={"name": "Asha K", "avatar": 4})
    assert renamed.json()["username"] == name and renamed.json()["name"] == "Asha K"
    # Asking for the same name again changes nothing and succeeds.
    assert claim(client, owner, name).json()["username"] == name
    with sessions()() as db:
        assert db.get(Profile, saved.json()["id"]).username == name
    cleared = client.delete("/v1/profile/username", headers=owner)
    assert cleared.status_code == 200 and cleared.json()["username"] is None
    assert client.get("/v1/me", headers=owner).json()["profile"]["username"] is None
    assert client.delete("/v1/profile/username", headers=owner).status_code == 200
    assert client.delete("/v1/profile/username", headers=fresh).status_code == 409


@pytest.mark.parametrize("bad", ["ab", "a" * 21, "has space", "dash-ed", "émile", "semi;colon", "", "@@x"])
def test_malformed_usernames_are_refused(client, bad):
    refused = claim(client, named(client), bad)
    assert refused.status_code == 422


def test_reserved_usernames_are_refused(client):
    required = {
        "admin", "administrator", "moderator", "mod", "support", "help", "system", "games",
        "bot", "guest", "anonymous", "null", "undefined", "me", "you",
    }
    assert required <= RESERVED_USERNAMES
    owner = named(client)
    for name in sorted(required | {"bot_ada", "bots", "BotMaster", "@Admin"}):
        refused = claim(client, owner, name)
        assert refused.status_code == 422, name
        if len(name) >= 3:  # "me" is also too short to be a username at all
            assert refused.json()["detail"] == "That username is reserved. Choose another."
    assert client.get("/v1/me", headers=owner).json()["profile"]["username"] is None
    # Containing a reserved word is fine; starting with "bot" is not.
    assert claim(client, owner, tag("robot")).status_code == 200


def test_a_taken_username_is_refused_whatever_its_case(client):
    first, second = named(client, "First"), named(client, "Second")
    name = tag("dup")
    assert claim(client, first, name).status_code == 200
    for attempt in (name, name.upper(), "@" + name):
        taken = claim(client, second, attempt)
        assert taken.status_code == 409 and taken.json()["detail"] == "That username is taken."
    # Released names can be taken by someone else; the old owner can pick a new one.
    assert client.delete("/v1/profile/username", headers=first).status_code == 200
    assert claim(client, second, name).status_code == 200
    assert claim(client, first, name).status_code == 409
    assert claim(client, first, tag("new")).status_code == 200


def test_two_people_claiming_one_free_username_at_once_get_one_winner(client, monkeypatch):
    # Remove the friendly pre-check so both requests reach the database constraint.
    from app.rooms.repository import Repository

    monkeypatch.setattr(Repository, "profile_by_username", lambda self, username: None)
    people = [named(client, f"Racer {i}") for i in range(6)]
    name = tag("race")
    with ThreadPoolExecutor(max_workers=6) as pool:
        results = list(pool.map(lambda headers: claim(client, headers, name), people))
    codes = sorted(r.status_code for r in results)
    assert codes == [200, 409, 409, 409, 409, 409]
    assert all(r.json()["detail"] == "That username is taken." for r in results if r.status_code == 409)
    with sessions()() as db:
        assert len(list(db.scalars(select(Profile).where(Profile.username == name)))) == 1


def test_username_changes_are_rate_limited_like_the_profile(client):
    owner = named(client)
    codes = [claim(client, owner, tag("rate")).status_code for _ in range(22)]
    assert codes[:20] == [200] * 20 and 429 in codes[20:]


def test_search_matches_a_prefix_exact_first_and_never_the_caller_or_a_bot(client):
    stem = tag("s")[:9]
    people = {}
    for suffix, display, avatar in (("", "Exact", 1), ("_zed", "Zed", 2), ("_amy", "Amy", 3), ("x", "Ex", 4)):
        headers = named(client, display, avatar)
        assert claim(client, headers, stem + suffix).status_code == 200
        people[stem + suffix] = headers
    nameless = named(client, stem.upper())  # a display name is not a username
    seeker = named(client, "Seeker")
    found = search(client, seeker, stem)
    assert found.status_code == 200 and found.headers["cache-control"] == "private, no-store"
    assert found.json() == {"players": [
        {"username": stem, "name": "Exact", "avatar": 1},
        {"username": stem + "_amy", "name": "Amy", "avatar": 3},
        {"username": stem + "_zed", "name": "Zed", "avatar": 2},
        {"username": stem + "x", "name": "Ex", "avatar": 4},
    ]}
    # Case and a leading @ do not matter; a prefix must start the username.
    for q in (stem.upper(), "@" + stem, f"  {stem} "):
        assert search(client, seeker, q).json() == found.json()
    assert search(client, seeker, stem[1:]).json()["players"] == []
    # "_" matches only itself, never "any character"; "%" matches nothing.
    assert [p["username"] for p in search(client, seeker, stem + "_").json()["players"]] == [
        stem + "_amy", stem + "_zed",
    ]
    assert search(client, seeker, stem[:-1] + "_").json()["players"] == []
    for wild in ("%%", stem + "%", stem[:3] + "%", "a%' OR 1=1 --"):
        assert search(client, seeker, wild).json()["players"] == []
    # The caller never finds themselves, and people without a username are not found.
    mine = search(client, people[stem], stem).json()["players"]
    assert [p["username"] for p in mine] == [stem + "_amy", stem + "_zed", stem + "x"]
    assert nameless and all(p["name"] != stem.upper() for p in found.json()["players"])
    # Nothing but the three public fields: no account or room identifier.
    assert all(set(p) == {"username", "name", "avatar"} for p in found.json()["players"])
    with sessions()() as db:
        ids = [p.id for p in db.scalars(select(Profile).where(Profile.username.like(stem + "%")))]
    assert len(ids) == 4 and not any(i in found.text for i in ids)


def test_search_returns_at_most_eight_and_needs_two_characters(client):
    stem = tag("m")[:8]
    for i in range(10):
        assert claim(client, named(client, f"Many {i}"), f"{stem}{i:02d}").status_code == 200
    seeker = named(client)
    found = search(client, seeker, stem).json()["players"]
    assert [p["username"] for p in found] == [f"{stem}{i:02d}" for i in range(8)]
    assert search(client, seeker, "a").status_code == 422
    assert search(client, seeker, "x" * 22).status_code == 422
    assert client.get("/v1/players/search", headers=seeker).status_code == 422
    assert search(client, seeker, "@" + stem[:1]).json() == {"players": []}
    assert client.get("/v1/players/search", params={"q": stem}).status_code == 401


def test_bots_are_never_found_even_if_a_row_somehow_had_a_username(client):
    host = named(client, "Host")
    room = client.post("/v1/rooms", headers=host, json={
        "name": "Host", "game_id": "uno", "capacity": 3,
        "bot_seats": [{"name": "Findme"}, {}],
    }).json()
    bot_ids = [m["id"] for m in room["members"] if m["is_bot"]]
    name = tag("zz")
    with sessions()() as db, db.begin():
        db.get(Profile, bot_ids[0]).username = name  # never written by the API
    assert search(client, named(client), name).json() == {"players": []}
    assert search(client, named(client), "findme").json() == {"players": []}
    assert search(client, named(client), "bot").json() == {"players": []}


def test_search_is_rate_limited_per_player(client):
    seeker, other = named(client), named(client)
    codes = [search(client, seeker, "zz").status_code for _ in range(32)]
    assert codes[:30] == [200] * 30 and codes[30:] == [429, 429]
    assert search(client, other, "zz").status_code == 200


def test_a_username_never_appears_in_anything_another_player_receives(client, monkeypatch):
    monkeypatch.setattr(RoomService, "_rate", lambda *args, **kwargs: None)
    host, guest = named(client, "Host"), named(client, "Guest")
    host_name, guest_name = tag("canary_h"), tag("canary_g")
    assert claim(client, host, host_name).status_code == 200
    assert claim(client, guest, guest_name).status_code == 200
    room = create(client, host, "uno", 2)
    path = f"/v1/rooms/{room['id']}"
    joined = client.post("/v1/rooms/join", headers=guest, json={"invite": room["code"], "name": "Guest"})
    for headers in (host, guest):
        assert client.put(path + "/ready", headers=headers, json={"ready": True}).status_code == 200
    started = client.post(path + "/start", headers=host)
    chat = client.post(path + "/chat", headers=guest, json={"body": "hello"})
    views = [
        room, joined.json(), started.json(), chat.json(),
        client.get(path, headers=host).json(), client.get(path, headers=guest).json(),
        client.post(path + "/heartbeat", headers=guest).json(),
    ]
    for view in views:
        text = json.dumps(view)
        assert host_name not in text and guest_name not in text
        assert all("username" not in member for member in view["members"])
    # Each player's own /me carries only their own username.
    host_me, guest_me = (client.get("/v1/me", headers=h).text for h in (host, guest))
    assert host_name in host_me and guest_name not in host_me
    assert guest_name in guest_me and host_name not in guest_me
    # Joining a room saves the display name and leaves the username alone.
    assert client.get("/v1/me", headers=guest).json()["profile"]["username"] == guest_name


def test_rate_buckets_hold_no_readable_username_or_query(client):
    seeker = named(client)
    needle = tag("needle")
    assert search(client, seeker, needle).status_code == 200
    with sessions()() as db:
        assert not any(needle in key for key in db.scalars(select(RateBucket.key)))
