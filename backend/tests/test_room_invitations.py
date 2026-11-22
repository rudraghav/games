"""Inviting a player by username: who may ask, what each side sees, and how it ends."""

import json
import secrets

import pytest
from fastapi.testclient import TestClient
from room_helpers import create, player, require_isolated
from sqlalchemy import select

from app.db import sessions
from app.main import app
from app.models import Member, Profile, Room, RoomInvite
from app.rooms.service import RoomService


@pytest.fixture
def client():
    require_isolated()
    with TestClient(app) as client:
        yield client


@pytest.fixture
def unlimited(monkeypatch):
    monkeypatch.setattr(RoomService, "_rate", lambda *args, **kwargs: None)


def person(client, name, avatar=0):
    """A signed-in player with a display name and a username: (headers, username)."""
    headers = player(client)
    assert client.put("/v1/profile", headers=headers, json={"name": name, "avatar": avatar}).status_code == 200
    username = f"{name.lower()[:8]}_{secrets.token_hex(4)}"
    saved = client.put("/v1/profile/username", headers=headers, json={"username": username})
    assert saved.status_code == 200, saved.text
    return headers, username


def invite(client, headers, room, username):
    return client.post(f"/v1/rooms/{room['id']}/invites", headers=headers, json={"username": username})


def cancel(client, headers, room, username):
    return client.delete(f"/v1/rooms/{room['id']}/invites/{username}", headers=headers)


def invitations(client, headers):
    return client.get("/v1/me", headers=headers).json()["invitations"]


def pending(client, headers, room):
    return client.get(f"/v1/rooms/{room['id']}", headers=headers).json()["pending_invites"]


def stored(room):
    with sessions()() as db:
        return list(db.scalars(select(RoomInvite).where(RoomInvite.room_id == room["id"])))


def test_a_member_invites_by_username_and_both_sides_see_it(client):
    host, _ = person(client, "Hosty", 2)
    friend, friend_name = person(client, "Friend", 5)
    room = create(client, host, "uno", 4)
    asked = invite(client, host, room, f"@{friend_name.upper()}")
    assert asked.status_code == 200, asked.text
    assert asked.json()["pending_invites"] == [
        {"username": friend_name, "name": "Friend", "avatar": 5},
    ]
    assert asked.json()["revision"] == room["revision"] + 1
    # Asking again changes nothing: one invitation, no extra revision.
    again = invite(client, host, room, friend_name)
    assert again.status_code == 200 and again.json()["revision"] == asked.json()["revision"]
    assert len(stored(room)) == 1
    mine = invitations(client, friend)
    assert mine == [{
        "room_id": room["id"], "room_name": "Verification table", "game_id": "uno",
        "from_name": "Host", "from_avatar": 0, "players": 1, "capacity": 4,
        "created_at": mine[0]["created_at"],
    }]
    # The invitation is not a way in by itself and carries no code or token.
    text = client.get("/v1/me", headers=friend).text
    assert room["code"] not in text and room["invite_token"] not in text
    assert client.get(f"/v1/rooms/{room['id']}", headers=friend).status_code == 404
    assert client.post(f"/v1/rooms/{room['id']}/chat", headers=friend, json={"body": "hi"}).status_code == 404
    assert invitations(client, host) == []


def test_only_members_invite_and_only_people_who_can_be_invited(client, unlimited):
    host, host_name = person(client, "Hosty")
    guest, guest_name = person(client, "Guesty")
    outsider, outsider_name = person(client, "Outside")
    _, target_name = person(client, "Target")
    room = create(client, host, "uno", 4)
    assert client.post("/v1/rooms/join", headers=guest, json={"invite": room["code"], "name": "Guesty"}).status_code == 200
    # A non-member cannot invite, list or learn anything about the room.
    refused = invite(client, outsider, room, target_name)
    assert refused.status_code == 404
    assert refused.json()["detail"] == "This room is unavailable to your player session."
    assert client.post(f"/v1/rooms/{room['id']}/invites", json={"username": target_name}).status_code == 401
    assert stored(room) == []
    # Any member may invite, not only the host.
    assert invite(client, guest, room, target_name).status_code == 200
    unknown = invite(client, host, room, "nobody_" + secrets.token_hex(4))
    assert unknown.status_code == 404 and unknown.json()["detail"] == "No player has that username."
    own = invite(client, host, room, host_name)
    assert own.status_code == 409 and own.json()["detail"] == "You are already in this room."
    seated = invite(client, host, room, guest_name)
    assert seated.status_code == 409 and seated.json()["detail"] == "That player is already in this room."
    for bad in ("ab", "has space", "x" * 22):
        assert invite(client, host, room, bad).status_code == 422
    # Someone who has left can be invited back.
    assert client.post(f"/v1/rooms/{room['id']}/leave", headers=guest).status_code == 200
    assert invite(client, host, room, guest_name).status_code == 200
    # ... and, having left, can no longer invite anyone themselves.
    assert invite(client, guest, room, outsider_name).status_code == 404
    guest_id = client.get("/v1/me", headers=guest).json()["profile"]["id"]
    assert guest_id in {i.user_id for i in stored(room)} and len(stored(room)) == 2


def test_a_solo_table_cannot_invite_anyone(client):
    owner, _ = person(client, "Solo")
    _, target_name = person(client, "Target")
    room = create(client, owner, "tarot", 1)
    refused = invite(client, owner, room, target_name)
    assert refused.status_code == 409
    assert refused.json()["detail"] == (
        "This is a private Tarot reading, so it can't be joined. "
        "Start your own reading from the games library."
    )
    slots = create(client, owner, "slots", 1)
    refused = invite(client, owner, slots, target_name)
    assert refused.status_code == 409
    assert refused.json()["detail"] == (
        "This is a private solo table, so it can't be joined. "
        "Start your own from the games library."
    )
    assert stored(room) == [] and stored(slots) == []


def test_a_room_holds_at_most_twenty_pending_invitations(client, unlimited):
    host, _ = person(client, "Hosty")
    room = create(client, host, "uno", 4)
    names = [person(client, f"P{i}")[1] for i in range(21)]
    for name in names[:20]:
        assert invite(client, host, room, name).status_code == 200
    full = invite(client, host, room, names[20])
    assert full.status_code == 409
    assert full.json()["detail"] == "This room already has 20 invitations waiting. Cancel one first."
    assert len(pending(client, host, room)) == 20
    # Re-asking someone already invited is still fine; cancelling makes room.
    assert invite(client, host, room, names[0]).status_code == 200
    assert cancel(client, host, room, names[0]).status_code == 200
    assert invite(client, host, room, names[20]).status_code == 200


def test_inviting_is_limited_to_about_twenty_an_hour(client):
    host, _ = person(client, "Hosty")
    _, target_name = person(client, "Target")
    room = create(client, host, "uno", 4)
    codes = [invite(client, host, room, target_name).status_code for _ in range(22)]
    assert codes[:20] == [200] * 20 and codes[20:] == [429, 429]


def test_the_host_or_the_sender_cancels_and_nobody_else(client, unlimited):
    host, _ = person(client, "Hosty")
    sender, _ = person(client, "Sender")
    bystander, _ = person(client, "Bystand")
    outsider, _ = person(client, "Outside")
    invitee, invitee_name = person(client, "Invitee")
    _, other_name = person(client, "Other")
    room = create(client, host, "uno", 6)
    for headers, name in ((sender, "Sender"), (bystander, "Bystand")):
        assert client.post("/v1/rooms/join", headers=headers, json={"invite": room["code"], "name": name}).status_code == 200
    assert invite(client, sender, room, invitee_name).status_code == 200
    assert invite(client, sender, room, other_name).status_code == 200
    # A non-member cannot cancel or see the list; the invitee cannot cancel as a member would.
    for headers in (outsider, invitee):
        gone = cancel(client, headers, room, invitee_name)
        assert gone.status_code == 404
        assert gone.json()["detail"] == "This room is unavailable to your player session."
    assert client.delete(f"/v1/rooms/{room['id']}/invites/{invitee_name}").status_code == 401
    # Another member who did not send it is told plainly.
    denied = cancel(client, bystander, room, invitee_name)
    assert denied.status_code == 403
    assert denied.json()["detail"] == "Only the host or the player who sent this invitation can cancel it."
    assert len(stored(room)) == 2
    before = client.get(f"/v1/rooms/{room['id']}", headers=host).json()["revision"]
    by_sender = cancel(client, sender, room, "@" + invitee_name.upper())
    assert by_sender.status_code == 200
    assert [p["username"] for p in by_sender.json()["pending_invites"]] == [other_name]
    assert by_sender.json()["revision"] == before + 1
    assert invitations(client, invitee) == []
    by_host = cancel(client, host, room, other_name)
    assert by_host.status_code == 200 and by_host.json()["pending_invites"] == []
    for missing in (other_name, "nobody_" + secrets.token_hex(4), "bad name", "x"):
        gone = cancel(client, host, room, missing)
        assert gone.status_code == 404
        assert gone.json()["detail"] == "That invitation is no longer waiting."
    # All members see the same pending list.
    assert invite(client, host, room, other_name).status_code == 200
    assert pending(client, host, room) == pending(client, bystander, room) == [
        {"username": other_name, "name": "Other", "avatar": 0},
    ]


def test_accepting_joins_like_a_code_and_uses_the_saved_profile(client, unlimited):
    host, _ = person(client, "Hosty")
    friend, friend_name = person(client, "Friend", 6)
    room = client.post("/v1/rooms", headers=host, json={
        "name": "Hosty", "game_id": "uno", "capacity": 3, "room_name": "Bots and friends",
        "bot_seats": [{"name": "Keeper"}, {"name": "Last in", "level": "easy"}],
    }).json()
    assert invite(client, host, room, friend_name).status_code == 200
    assert invitations(client, friend)[0]["players"] == 3
    accepted = client.post(f"/v1/invitations/{room['id']}/accept", headers=friend)
    assert accepted.status_code == 200, accepted.text
    view = accepted.json()
    # The full lobby gave up its last bot for the friend, exactly as a code join does.
    assert [m["name"] for m in view["members"]] == ["Hosty", "Keeper", "Friend"]
    joined = view["members"][-1]
    assert joined["seated"] and joined["avatar"] == 6 and not joined["is_bot"]
    assert view["pending_invites"] == [] and view["invite_token"] is None
    assert view["revision"] > room["revision"] + 1
    assert stored(room) == [] and invitations(client, friend) == []
    assert client.get(f"/v1/rooms/{room['id']}", headers=friend).status_code == 200
    # It cannot be used twice, and there is nothing to accept without an invitation.
    for headers in (friend, person(client, "Nobody")[0]):
        missing = client.post(f"/v1/invitations/{room['id']}/accept", headers=headers)
        assert missing.status_code == 404
        assert missing.json()["detail"] == "This invitation is no longer available."
    assert client.post(f"/v1/invitations/{room['id']}/accept").status_code == 401
    unknown = client.post("/v1/invitations/not-a-room/accept", headers=friend)
    assert unknown.status_code == 404


def test_accepting_respects_full_rooms_and_running_matches(client, unlimited):
    host, _ = person(client, "Hosty")
    guest, _ = person(client, "Guesty")
    late, late_name = person(client, "Late")
    room = create(client, host, "uno", 2)
    path = f"/v1/rooms/{room['id']}"
    assert client.post("/v1/rooms/join", headers=guest, json={"invite": room["code"], "name": "Guesty"}).status_code == 200
    assert invite(client, host, room, late_name).status_code == 200
    for headers in (host, guest):
        assert client.put(path + "/ready", headers=headers, json={"ready": True}).status_code == 200
    assert client.post(path + "/start", headers=host).status_code == 200
    # A running match gains a watcher, never a player.
    watching = client.post(f"/v1/invitations/{room['id']}/accept", headers=late)
    assert watching.status_code == 200 and watching.json()["game"] is None
    assert not next(m for m in watching.json()["members"] if m["name"] == "Late")["seated"]
    # A room at its member limit refuses, and the invitation stays for later.
    crowded = create(client, host, "uno", 2)
    extra, extra_name = person(client, "Extra")
    assert invite(client, host, crowded, extra_name).status_code == 200
    with sessions()() as db, db.begin():
        for _ in range(19):  # with the host, the twenty members a room can hold
            filler = "bot:" + secrets.token_hex(16)
            db.add(Profile(id=filler, name="Filler", avatar=0))
            db.flush()
            db.add(Member(room_id=crowded["id"], user_id=filler, is_bot=True, seated=False))
    full = client.post(f"/v1/invitations/{crowded['id']}/accept", headers=extra)
    assert full.status_code == 409 and full.json()["detail"] == "This room is full."
    assert len(stored(crowded)) == 1 and len(invitations(client, extra)) == 1


def test_declining_removes_the_invitation_and_returns_a_fresh_me(client, unlimited):
    host, _ = person(client, "Hosty")
    friend, friend_name = person(client, "Friend")
    first, second = create(client, host, "uno", 4), create(client, host, "skyjo", 4)
    for room in (first, second):
        assert invite(client, host, room, friend_name).status_code == 200
    # Newest first.
    assert [i["room_id"] for i in invitations(client, friend)] == [second["id"], first["id"]]
    before = client.get(f"/v1/rooms/{first['id']}", headers=host).json()["revision"]
    declined = client.delete(f"/v1/invitations/{first['id']}", headers=friend)
    assert declined.status_code == 200
    me = declined.json()
    assert [i["room_id"] for i in me["invitations"]] == [second["id"]]
    assert me["profile"]["username"] == friend_name and me["rooms"] == []
    after = client.get(f"/v1/rooms/{first['id']}", headers=host).json()
    assert after["pending_invites"] == [] and after["revision"] == before + 1
    # Declining again, or declining something never offered, is a harmless no-op.
    for room_id in (first["id"], "not-a-room"):
        again = client.delete(f"/v1/invitations/{room_id}", headers=friend)
        assert again.status_code == 200 and len(again.json()["invitations"]) == 1
    assert client.get(f"/v1/rooms/{first['id']}", headers=host).json()["revision"] == before + 1
    assert client.delete(f"/v1/invitations/{first['id']}").status_code == 401
    # Declining did not let them in.
    assert client.get(f"/v1/rooms/{first['id']}", headers=friend).status_code == 404


def test_invitations_end_when_the_invitee_joins_by_code_or_the_room_closes(client, unlimited):
    host, _ = person(client, "Hosty")
    friend, friend_name = person(client, "Friend")
    other, other_name = person(client, "Other")
    room = create(client, host, "uno", 4)
    for name in (friend_name, other_name):
        assert invite(client, host, room, name).status_code == 200
    # Joining by code answers the invitation too.
    joined = client.post("/v1/rooms/join", headers=friend, json={"invite": room["code"], "name": "Friend"})
    assert joined.status_code == 200
    assert [p["username"] for p in joined.json()["pending_invites"]] == [other_name]
    assert invitations(client, friend) == []
    # Closing the room withdraws what is left; nothing can be accepted afterwards.
    assert len(invitations(client, other)) == 1
    for headers in (friend, host):
        assert client.post(f"/v1/rooms/{room['id']}/leave", headers=headers).status_code == 200
    assert stored(room) == [] and invitations(client, other) == []
    gone = client.post(f"/v1/invitations/{room['id']}/accept", headers=other)
    assert gone.status_code == 404
    with sessions()() as db:
        assert db.get(Room, room["id"]).status == "closed"
        assert db.get(Member, (room["id"], client.get("/v1/me", headers=other).json()["profile"]["id"])) is None


def test_a_closed_rooms_leftover_invitation_is_hidden_and_cannot_be_accepted(client, unlimited):
    host, _ = person(client, "Hosty")
    friend, friend_name = person(client, "Friend")
    room = create(client, host, "uno", 4)
    assert invite(client, host, room, friend_name).status_code == 200
    with sessions()() as db, db.begin():
        db.get(Room, room["id"]).status = "closed"  # closed by an older release, row left behind
    assert len(stored(room)) == 1
    assert invitations(client, friend) == []
    assert client.post(f"/v1/invitations/{room['id']}/accept", headers=friend).status_code == 404


def test_removing_a_player_or_clearing_a_username_withdraws_their_invitations(client, unlimited):
    host, _ = person(client, "Hosty")
    friend, friend_name = person(client, "Friend")
    room = create(client, host, "uno", 4)
    path = f"/v1/rooms/{room['id']}"
    friend_id = client.get("/v1/me", headers=friend).json()["profile"]["id"]
    assert invite(client, host, room, friend_name).status_code == 200
    removed = client.delete(f"{path}/members/{friend_id}", headers=host)
    assert removed.status_code == 200 and removed.json()["pending_invites"] == []
    assert invitations(client, friend) == []
    # A player who gives up their username can no longer be shown as invited.
    assert invite(client, host, room, friend_name).status_code == 200
    before = client.get(path, headers=host).json()["revision"]
    assert client.delete("/v1/profile/username", headers=friend).status_code == 200
    after = client.get(path, headers=host).json()
    assert after["pending_invites"] == [] and after["revision"] == before + 1
    assert stored(room) == [] and invitations(client, friend) == []
    # A changed username shows on the pending invitation straight away.
    assert client.put("/v1/profile/username", headers=friend, json={"username": friend_name}).status_code == 200
    assert invite(client, host, room, friend_name).status_code == 200
    renamed = "new_" + secrets.token_hex(4)
    assert client.put("/v1/profile/username", headers=friend, json={"username": renamed}).status_code == 200
    assert [p["username"] for p in pending(client, host, room)] == [renamed]
    assert cancel(client, host, room, friend_name).status_code == 404
    assert cancel(client, host, room, renamed).status_code == 200


def test_room_views_and_invitations_never_leak_ids_codes_or_other_usernames(client, unlimited):
    host, host_name = person(client, "Hosty")
    guest, guest_name = person(client, "Guesty")
    friend, friend_name = person(client, "Friend")
    room = create(client, host, "uno", 4)
    joined = client.post("/v1/rooms/join", headers=guest, json={"invite": room["code"], "name": "Guesty"})
    assert joined.status_code == 200
    asked = invite(client, guest, room, friend_name)
    friend_id = client.get("/v1/me", headers=friend).json()["profile"]["id"]
    for view in (asked.json(), client.get(f"/v1/rooms/{room['id']}", headers=host).json()):
        text = json.dumps(view)
        # The invitee appears only as username, name and avatar; never by account id.
        assert friend_id not in text
        assert view["pending_invites"] == [{"username": friend_name, "name": "Friend", "avatar": 0}]
        # Members' own usernames are still nowhere in the room.
        assert host_name not in text and guest_name not in text
    assert asked.json()["invite_token"] is None
    mine = client.get("/v1/me", headers=friend)
    for secret in (room["code"], room["invite_token"], host_name, guest_name, room["owner_id"]):
        assert secret not in mine.text
    assert mine.json()["invitations"][0]["from_name"] == "Guesty"
    assert set(mine.json()["invitations"][0]) == {
        "room_id", "room_name", "game_id", "from_name", "from_avatar", "players", "capacity",
        "created_at",
    }
