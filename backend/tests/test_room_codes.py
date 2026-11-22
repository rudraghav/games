"""Six-digit room codes: format, older codes, retirement, wrong-code limit and lookup."""

import re
from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from room_helpers import create, player, require_isolated
from sqlalchemy import select

from app.db import sessions
from app.main import app
from app.models import Member, Room
from app.rooms import service
from app.rooms.service import guessable, retired_code, room_code

SIX_DIGITS = re.compile(r"^[1-9][0-9]{5}$")
LEGACY = re.compile(r"^[ABCDEFGHJKMNPQRSTVWXYZ23456789]{8}$")
WRONG = "This invite is invalid or has been replaced."
NO_LOOKUP = "No room of yours matches that code or invite."
SLOW_DOWN = "Too many wrong codes. Wait ten minutes, then try again."


@pytest.fixture
def client():
    require_isolated()
    with TestClient(app) as client:
        yield client


def join(client, headers, invite, name="Guest"):
    return client.post("/v1/rooms/join", headers=headers, json={"invite": invite, "name": name})


def lookup(client, headers, invite):
    return client.get(f"/v1/rooms/lookup/{invite}", headers=headers)


def unused_code(client) -> str:
    with sessions()() as db:
        taken = set(db.scalars(select(Room.code)))
    return next(code for code in (room_code() for _ in range(1000)) if code not in taken)


def test_generated_codes_are_six_digits_and_never_the_obvious_ones():
    codes = {room_code() for _ in range(5000)}
    assert all(SIX_DIGITS.fullmatch(code) for code in codes)
    assert not any(guessable(code) for code in codes)
    for obvious in ("111111", "999999", "123456", "456789", "654321", "987654", "543210"):
        assert guessable(obvious)
    for fine in ("482913", "112233", "123457", "135790", "100000"):
        assert not guessable(fine)
    assert all(LEGACY.fullmatch(retired_code()) for _ in range(200))


def test_obvious_codes_are_skipped_when_drawn(monkeypatch):
    draws = iter([11111, 23456, 554321, 382913])  # 111111, 123456, 654321, then 482913
    monkeypatch.setattr(service.secrets, "randbelow", lambda _: next(draws))
    assert room_code() == "482913"


def test_new_quick_and_rotated_rooms_all_get_six_digit_codes(client):
    host = player(client)
    room = create(client, host, "uno", 3)
    assert SIX_DIGITS.fullmatch(room["code"])
    quick = client.post(
        "/v1/games/four-in-a-row/play", headers=player(client), json={"request_id": str(uuid4())}
    )
    assert quick.status_code == 200 and SIX_DIGITS.fullmatch(quick.json()["code"])
    # A solo table cannot be joined, so it takes no six-digit number.
    solo = create(client, player(client), "tarot", 1)
    assert not SIX_DIGITS.fullmatch(solo["code"]) and len(solo["code"]) == 8
    solo_quick = client.post(
        "/v1/games/tarot/play", headers=player(client), json={"request_id": str(uuid4())}
    )
    assert solo_quick.status_code == 200 and len(solo_quick.json()["code"]) == 8
    rotated = client.post(f"/v1/rooms/{room['id']}/invite", headers=host)
    assert rotated.status_code == 200
    assert SIX_DIGITS.fullmatch(rotated.json()["code"]) and rotated.json()["code"] != room["code"]
    assert join(client, player(client), room["code"]).status_code == 404
    assert join(client, player(client), rotated.json()["code"]).status_code == 200


@pytest.mark.parametrize("typed", ["{a}{b}", "{a} {b}", "{a}-{b}", "  {a}  {b} ", "{a} - {b}"])
def test_a_code_typed_with_spaces_or_a_dash_still_joins(client, typed):
    room = create(client, player(client), "uno", 4)
    code = room["code"]
    joined = join(client, player(client), typed.format(a=code[:3], b=code[3:]))
    assert joined.status_code == 200 and joined.json()["id"] == room["id"]


def test_an_older_eight_character_code_and_the_token_keep_working(client):
    host = player(client)
    room = create(client, host, "uno", 4)
    old = retired_code()
    with sessions()() as db, db.begin():
        db.get(Room, room["id"]).code = old  # a room created before six-digit codes
    assert client.get(f"/v1/rooms/{room['id']}", headers=host).json()["code"] == old
    for invite in (old, old.lower(), room["invite_token"]):
        joined = join(client, player(client), invite)
        assert joined.status_code == 200 and joined.json()["id"] == room["id"]
    assert join(client, player(client), room["code"]).status_code == 404


def test_closing_a_room_retires_its_code_and_frees_the_number(client, monkeypatch):
    host, guest = player(client), player(client)
    room = create(client, host, "uno", 2)
    code = room["code"]
    assert join(client, guest, code).status_code == 200
    path = f"/v1/rooms/{room['id']}"
    assert client.post(path + "/leave", headers=guest).status_code == 200
    with sessions()() as db:
        assert db.get(Room, room["id"]).code == code  # still open: the host is inside
    closed = client.post(path + "/leave", headers=host)
    assert closed.status_code == 200 and closed.json()["status"] == "closed"
    with sessions()() as db:
        saved = db.get(Room, room["id"])
        assert saved.status == "closed" and saved.code != code and LEGACY.fullmatch(saved.code)
        retired = saved.code
    # Neither the old number, the retired value nor the token opens the closed room,
    # and each answers exactly like a code that never existed.
    never = unused_code(client)
    answers = {
        (r.status_code, r.text)
        for r in (
            join(client, player(client), invite)
            for invite in (code, retired, room["invite_token"], never)
        )
    }
    assert answers == {(404, '{"detail":"' + WRONG + '"}')}
    # The number is free for a new room straight away.
    monkeypatch.setattr(service, "room_code", lambda: code)
    again = create(client, player(client), "uno", 2)
    assert again["code"] == code and again["id"] != room["id"]
    assert join(client, player(client), code).json()["id"] == again["id"]


def offered(monkeypatch, codes):
    """Make the next drawn room codes exactly these, in order."""
    draws = iter(codes)
    monkeypatch.setattr(service, "room_code", lambda: next(draws))


def test_a_taken_code_is_never_given_to_a_second_room(client, monkeypatch):
    first = create(client, player(client), "uno", 2)
    taken = first["code"]
    # A new room is offered the taken code three times before a free one.
    fresh = unused_code(client)
    offered(monkeypatch, [taken, taken, taken, fresh])
    second = create(client, player(client), "uno", 2)
    assert second["code"] == fresh
    # Quick play takes the same care ...
    fresh = unused_code(client)
    offered(monkeypatch, [taken, second["code"], fresh])
    quick = client.post(
        "/v1/games/four-in-a-row/play", headers=player(client), json={"request_id": str(uuid4())}
    )
    assert quick.status_code == 200 and quick.json()["code"] == fresh
    # ... and so does a rotated invite, which may not even land on its own old code.
    host = player(client)
    fresh = unused_code(client)
    offered(monkeypatch, [fresh])
    third = create(client, host, "uno", 2)
    last = unused_code(client)
    offered(monkeypatch, [taken, second["code"], third["code"], last])
    rotated = client.post(f"/v1/rooms/{third['id']}/invite", headers=host)
    assert rotated.status_code == 200 and rotated.json()["code"] == last
    with sessions()() as db:
        codes = list(db.scalars(select(Room.code)))
    assert len(codes) == len(set(codes))
    # If every draw is taken the request fails cleanly instead of sharing a code.
    monkeypatch.setattr(service, "room_code", lambda: taken)
    stuck = client.post(
        "/v1/rooms", headers=player(client),
        json={"name": "Host", "game_id": "uno", "capacity": 2, "room_name": "No code"},
    )
    assert stuck.status_code == 503
    assert stuck.json()["detail"] == "Couldn't open a room just now. Please try again."


def test_rooms_created_at_once_from_a_tiny_code_pool_never_collide(client, monkeypatch):
    # Thirty rooms race for three numbers before any other is offered: each number
    # goes to exactly one room and nobody sees a server error.
    pool = ["731946", "264815", "918273"]
    real = room_code
    calls = {"n": 0}

    def crowded() -> str:
        calls["n"] += 1
        return pool[calls["n"] % 3] if calls["n"] <= 60 else real()

    monkeypatch.setattr(service, "room_code", crowded)
    with sessions()() as db, db.begin():
        for room in db.scalars(select(Room).where(Room.code.in_(pool))):
            room.code = retired_code()
    hosts = [player(client) for _ in range(30)]

    def make(headers):
        return client.post(
            "/v1/rooms", headers=headers,
            json={"name": "Host", "game_id": "uno", "capacity": 2, "room_name": "Race"},
        )

    with ThreadPoolExecutor(max_workers=10) as pool_:
        responses = list(pool_.map(make, hosts))
    assert [r.status_code for r in responses] == [201] * 30
    codes = [r.json()["code"] for r in responses]
    assert len(set(codes)) == 30 and set(pool) <= set(codes)


def test_more_than_ten_wrong_codes_in_ten_minutes_are_refused(client):
    host, prober, friend = player(client), player(client), player(client)
    room = create(client, host, "uno", 4)
    wrong = unused_code(client)
    for _ in range(10):
        missed = join(client, prober, wrong)
        assert missed.status_code == 404 and missed.json()["detail"] == WRONG
    # The eleventh wrong code, and everything after it, is refused: even a right one.
    for invite in (wrong, room["code"], room["invite_token"]):
        refused = join(client, prober, invite)
        assert refused.status_code == 429 and refused.json()["detail"] == SLOW_DOWN
    assert lookup(client, prober, room["code"]).status_code == 429
    with sessions()() as db:
        assert len(list(db.scalars(select(Member).where(Member.room_id == room["id"])))) == 1
    # Someone else is not held back by another player's guessing.
    assert join(client, friend, room["code"]).status_code == 200


def test_right_codes_do_not_spend_the_wrong_code_allowance(client):
    guest = player(client)
    rooms = [create(client, player(client), "uno", 4) for _ in range(12)]
    for room in rooms:
        assert join(client, guest, room["code"]).status_code == 200
    assert join(client, guest, unused_code(client)).status_code == 404


def test_lookup_answers_only_for_a_person_already_inside_the_room(client):
    host, guest, outsider = player(client), player(client), player(client)
    room = create(client, host, "uno", 3)
    assert join(client, guest, room["code"]).status_code == 200
    code = room["code"]
    for headers in (host, guest):
        for invite in (code, f"{code[:3]} {code[3:]}", f"{code[:3]}-{code[3:]}", room["invite_token"]):
            found = lookup(client, headers, invite)
            assert found.status_code == 200
            assert found.json() == {"id": room["id"], "game_id": "uno"}
    assert lookup(client, host, code).headers["cache-control"] == "private, no-store"
    assert client.get(f"/v1/rooms/lookup/{code}").status_code == 401
    # A real code the caller is not in, a code that never existed, and a closed
    # room's code are one answer, byte for byte.
    closed = create(client, outsider, "uno", 2)
    assert client.post(f"/v1/rooms/{closed['id']}/leave", headers=outsider).status_code == 200
    answers = {
        (r.status_code, r.text)
        for r in (
            lookup(client, outsider, invite)
            for invite in (code, room["invite_token"], unused_code(client), closed["code"], "x")
        )
    }
    assert answers == {(404, '{"detail":"' + NO_LOOKUP + '"}')}
    # Looking a room up never seats anyone.
    with sessions()() as db:
        members = {m.user_id for m in db.scalars(select(Member).where(Member.room_id == room["id"]))}
    assert len(members) == 2
    assert client.get(f"/v1/rooms/{room['id']}", headers=outsider).status_code == 404
    # A member who has left is an outsider again.
    assert client.post(f"/v1/rooms/{room['id']}/leave", headers=guest).status_code == 200
    assert lookup(client, guest, code).status_code == 404


def test_lookup_misses_share_the_wrong_code_allowance_with_join(client):
    prober = player(client)
    room = create(client, player(client), "uno", 4)
    # Probing made-up codes through lookup spends the same ten as failed joins.
    for _ in range(10):
        assert lookup(client, prober, unused_code(client)).status_code == 404
    refused = lookup(client, prober, unused_code(client))
    assert refused.status_code == 429 and refused.json()["detail"] == SLOW_DOWN
    # Once over the limit, even a real code is refused, by lookup and by join.
    assert lookup(client, prober, room["code"]).status_code == 429
    assert join(client, prober, room["code"]).status_code == 429
    # Opening a friend's link before joining is not a wrong guess: the answer is the
    # same 404, it costs nothing, and the join that follows still works.
    friend = player(client)
    for _ in range(15):
        answer = lookup(client, friend, room["code"])
        assert answer.status_code == 404 and answer.json()["detail"] == NO_LOOKUP
    assert join(client, friend, room["code"]).status_code == 200
    # A member's own lookups succeed and cost nothing.
    host = player(client)
    mine = create(client, host, "uno", 2)
    for _ in range(15):
        assert lookup(client, host, mine["code"]).status_code == 200
    assert join(client, host, unused_code(client)).status_code == 404
