"""Player progress and earned rewards over HTTP: worked out by the server from
finished matches, private to the player, and never grantable by a client."""

import time
from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from room_helpers import create, player, require_isolated, seated_room

from app.bots import choose_action
from app.core.contracts import GameView
from app.db import sessions
from app.main import app
from app.models import Match, Profile, Room

EMPTY = {
    "xp": 0, "level": 1, "level_xp": 0, "next_level_xp": 50,
    "streak": {"current": 0, "best": 0, "played_today": False},
    "totals": {"games": 0, "wins": 0, "different_games": 0, "with_friends": 0},
}
MEMBER_KEYS = {
    "id", "name", "avatar", "frame", "ready", "seated", "connected", "last_seen",
    "is_bot", "bot_level",
}
PRIVATE_WORDS = ('"xp"', '"badges"', '"rewards"', '"streak"', "claimed", "back-midnight",
                 "cosmetics")


@pytest.fixture
def client():
    require_isolated()
    with TestClient(app) as client:
        yield client


def progress(client, headers, **params):
    response = client.get("/v1/progress", headers=headers, params=params)
    assert response.status_code == 200, response.text
    assert response.headers["cache-control"] == "private, no-store"
    return response.json()


def redeem(client, headers, reward_id):
    return client.post(f"/v1/rewards/{reward_id}/redeem", headers=headers)


def wear(client, headers, **body):
    return client.put("/v1/profile/cosmetics", headers=headers, json=body)


def reward(view, reward_id):
    return next(r for r in view["rewards"] if r["id"] == reward_id)


def badge(view, badge_id):
    return next(b for b in view["badges"] if b["id"] == badge_id)


def act(client, headers, room, action):
    response = client.post(f"/v1/rooms/{room['id']}/actions", headers=headers, json={
        "match_id": room["match_id"], "expected_version": room["match_version"],
        "action_id": str(uuid4()), "action": action,
    })
    assert response.status_code == 200, response.text
    return response.json()


def quick(client, headers, game):
    response = client.post(
        f"/v1/games/{game}/play", headers=headers, json={"request_id": str(uuid4())}
    )
    assert response.status_code == 200, response.text
    return response.json()


def spin_out(client, headers, game="roulette"):
    """Play a whole solo wheel or reel session through the real endpoints."""
    room = quick(client, headers, game)
    for _ in range(5):
        room = act(client, headers, room, {**room["game"]["actions"][0]["action"], "amount": 1})
    assert room["status"] == "finished"
    return room


def session_xp(room):
    """What one finished solo session is worth as a first game of its kind. A wheel
    or reel session may name its player a winner, but a win needs someone to beat,
    so a game played alone is never worth the win bonus."""
    return 25


def me(client, headers):
    return client.get("/v1/me", headers=headers).json()["profile"]


def add_results(room_id, user_id, games, won=True, created_at=None):
    """Saved results for an existing room of this player, as finished matches leave them."""
    with sessions()() as db, db.begin():
        for game in games:
            db.add(Match(
                id=str(uuid4()), room_id=room_id, game_id=game, rules_version="test",
                # A won game was won against someone: here, one bot.
                state={"phase": "finished"},
                participants=[user_id, "bot:rival"] if won else [user_id],
                result={"winners": [user_id] if won else [], "scores": {user_id: 0}},
                **({"created_at": created_at} if created_at is not None else {}),
            ))


def revision(room_id):
    with sessions()() as db:
        return db.get(Room, room_id).revision


def test_a_player_with_no_matches_gets_the_empty_level_one_view(client):
    assert client.get("/v1/progress").status_code == 401
    assert client.post("/v1/rewards/frame-gold/redeem").status_code == 401
    assert client.put("/v1/profile/cosmetics", json={}).status_code == 401
    fresh = player(client)  # no profile yet: still an answer, never a 404
    view = progress(client, fresh)
    assert {key: view[key] for key in EMPTY} == EMPTY
    assert len(view["badges"]) == 14 and len(view["rewards"]) == 9
    assert all(not b["earned"] and b["value"] == 0 for b in view["badges"])
    assert all(r["state"] == "locked" and not r["equipped"] for r in view["rewards"])
    assert {r["kind"] for r in view["rewards"]} == {"frame", "card_back"}
    assert client.get("/v1/me", headers=fresh).json()["profile"] is None
    # Asking did not create a profile.
    assert progress(client, fresh, tz_offset=330) == view
    for bad in (-721, 841, "east"):
        assert client.get(
            "/v1/progress", headers=fresh, params={"tz_offset": bad}
        ).status_code == 422
    # A profile with no games is the same empty view.
    named = player(client)
    assert client.put("/v1/profile", headers=named, json={"name": "Asha"}).status_code == 200
    assert progress(client, named) == view
    assert me(client, named)["frame"] is None and me(client, named)["card_back"] is None


def test_a_real_finished_match_changes_progress_and_an_abandoned_one_does_not(
    client, monkeypatch
):
    monkeypatch.setattr("app.rooms.service.BOT_DELAY_SECONDS", 0)
    monkeypatch.setattr("app.rooms.bots.BOT_REVIEW_DELAY_SECONDS", {})
    headers = player(client)
    room = quick(client, headers, "four-in-a-row")
    # Started but not finished: nothing yet.
    assert progress(client, headers)["xp"] == 0
    memory = None
    for _ in range(100):
        if room["status"] == "finished":
            break
        if room["bot_pending"]:
            response = client.post(f"/v1/rooms/{room['id']}/bots/drive", headers=headers, json={
                "match_id": room["match_id"], "expected_version": room["match_version"],
            })
            assert response.status_code == 200, response.text
            room = response.json()
        else:
            decision = choose_action(GameView.model_validate(room["game"]), room["owner_id"], memory)
            memory = decision.memory
            room = act(client, headers, room, decision.action.model_dump())
    assert room["status"] == "finished"
    won = room["owner_id"] in room["game"]["winners"]
    view = progress(client, headers)
    # 10 for finishing, 15 for a first four-in-a-row, 10 more for a win; a bot is not company.
    assert view["xp"] == 25 + (10 if won else 0)
    assert view["totals"] == {
        "games": 1, "wins": int(won), "different_games": 1, "with_friends": 0,
    }
    assert view["streak"] == {"current": 1, "best": 1, "played_today": True}
    assert badge(view, "first-game")["earned"]
    assert badge(view, "first-win")["earned"] is won
    assert not badge(view, "good-company")["value"]
    # A rematch that is abandoned adds nothing.
    path = f"/v1/rooms/{room['id']}"
    assert client.put(path + "/ready", headers=headers, json={"ready": True}).status_code == 200
    assert client.post(path + "/start", headers=headers).status_code == 200
    assert client.post(path + "/abandon", headers=headers).status_code == 200
    assert progress(client, headers) == view
    # A second finished game of another kind adds its own 25 and reaches level 2.
    slots = spin_out(client, headers, "slots")
    after = progress(client, headers)
    assert after["xp"] == view["xp"] + session_xp(slots)
    assert after["totals"]["games"] == 2 and after["totals"]["different_games"] == 2
    assert (after["level"], after["level_xp"], after["next_level_xp"]) == (2, 50, 150)
    assert reward(after, "frame-gold")["state"] == "available"
    # Leaving both rooms, which closes them, keeps what was earned.
    assert client.post(path + "/leave", headers=headers).status_code == 200
    assert progress(client, headers) == after


def test_two_people_finishing_a_game_together_both_earn_the_company_bonus(client):
    room, (host, guest) = seated_room(client, "four-in-a-row", 2)
    seats = {
        client.get("/v1/me", headers=h).json()["profile"]["id"]: h for h in (host, guest)
    }
    for _ in range(60):
        if room["status"] == "finished":
            break
        for player_id, headers in seats.items():
            mine = client.get(f"/v1/rooms/{room['id']}", headers=headers).json()
            if mine["status"] == "playing" and mine["game"]["actions"]:
                decision = choose_action(GameView.model_validate(mine["game"]), player_id, None)
                room = act(client, headers, mine, decision.action.model_dump())
                break
    assert room["status"] == "finished"
    winners = room["game"]["winners"]
    for player_id, headers in seats.items():
        view = progress(client, headers)
        won = player_id in winners
        assert view["xp"] == 10 + 15 + 5 + (10 if won else 0)
        assert view["totals"] == {
            "games": 1, "wins": int(won), "different_games": 1, "with_friends": 1,
        }
        assert badge(view, "good-company")["value"] == 1
    # A watcher who never sat in the match earns nothing from it.
    watcher = player(client)
    assert client.post(
        "/v1/rooms/join", headers=watcher, json={"invite": room["code"], "name": "Watcher"}
    ).status_code == 200
    assert {key: progress(client, watcher)[key] for key in EMPTY} == EMPTY


def test_a_client_cannot_grant_itself_xp_a_badge_or_a_reward(client):
    headers = player(client)
    assert client.put("/v1/profile", headers=headers, json={"name": "Keen"}).status_code == 200
    locked = redeem(client, headers, "frame-gold")
    assert locked.status_code == 409
    assert locked.json()["detail"] == "Gold frame is not earned yet. Reach level 2 first."
    badge_locked = redeem(client, headers, "back-sunrise")
    assert badge_locked.status_code == 409
    assert "Earn the Explorer badge" in badge_locked.json()["detail"]
    for unknown in ("frame-made-up", "first-game", "xp"):
        missing = redeem(client, headers, unknown)
        assert missing.status_code == 404
        assert missing.json()["detail"] == "There is no reward with that name."
    unworn = wear(client, headers, frame="frame-gold")
    assert unworn.status_code == 409
    assert unworn.json()["detail"] == "Gold frame is not earned yet. Reach level 2 first."
    assert wear(client, headers, card_back="back-midnight").status_code == 409
    # Unknown ids and a reward of the other kind are refused outright.
    assert wear(client, headers, frame="frame-made-up").status_code == 422
    assert wear(client, headers, card_back="back-made-up").status_code == 422
    assert wear(client, headers, frame="back-midnight").status_code == 422
    assert wear(client, headers, card_back="frame-gold").status_code == 422
    assert wear(client, headers, frame="f" * 33).status_code == 422
    # No request carries a number or a list the server would believe.
    for extra in ({"xp": 5000}, {"claimed": ["frame-gold"]}, {"level": 9}, {"badges": []}):
        assert wear(client, headers, **extra).status_code == 422
    for body in ({"name": "Keen", "frame": "frame-gold"}, {"name": "Keen", "xp": 5000},
                 {"name": "Keen", "cosmetics": {"claimed": ["frame-gold"], "frame": "frame-gold"}}):
        assert client.put("/v1/profile", headers=headers, json=body).status_code == 422
    assert client.post(
        "/v1/rewards/frame-gold/redeem", headers=headers, json={"state": "redeemed", "xp": 5000}
    ).status_code == 409
    view = progress(client, headers)
    assert {key: view[key] for key in EMPTY} == EMPTY
    assert all(r["state"] == "locked" and not r["equipped"] for r in view["rewards"])
    assert me(client, headers)["frame"] is None and me(client, headers)["card_back"] is None
    with sessions()() as db:
        assert db.get(Profile, me(client, headers)["id"]).cosmetics == {}
    # Taking nothing off is allowed and changes nothing.
    assert wear(client, headers).status_code == 200
    # Someone with no profile is refused the same way, and still gets no profile.
    nobody = player(client)
    assert redeem(client, nobody, "frame-gold").status_code == 409
    assert wear(client, nobody, frame="frame-gold").status_code == 409
    assert wear(client, nobody).status_code == 200
    assert client.get("/v1/me", headers=nobody).json()["profile"] is None


def test_a_stored_claim_or_frame_that_was_never_earned_is_not_honoured(client):
    headers = player(client)
    room = spin_out(client, headers)  # at most 35 XP: level 1, nothing earned
    user_id = room["owner_id"]
    with sessions()() as db, db.begin():
        db.get(Profile, user_id).cosmetics = {
            "claimed": ["frame-crown", "back-royal", "frame-made-up"],
            "frame": "frame-made-up", "card_back": "frame-gold", "xp": 5000,
        }
    view = progress(client, headers)
    assert view["xp"] == session_xp(room) and view["level"] == 1
    assert all(r["state"] == "locked" and not r["equipped"] for r in view["rewards"])
    assert wear(client, headers, frame="frame-crown").status_code == 409
    assert wear(client, headers, card_back="back-royal").status_code == 409
    # An id that is not a known frame, or not a card back, is shown to nobody.
    profile = me(client, headers)
    assert profile["frame"] is None and profile["card_back"] is None
    seen = client.get(f"/v1/rooms/{room['id']}", headers=headers).json()
    assert seen["members"][0]["frame"] is None


def test_redeem_then_wear_shows_only_the_frame_to_other_members(client):
    host = player(client)
    solo = spin_out(client, host)
    host_id = solo["owner_id"]
    # Four more games won, each a different one, add 4 * 35 = 140 XP: level 3.
    add_results(solo["id"], host_id, ["uno", "ludo", "chess", "go"])
    before = progress(client, host)
    assert (before["xp"], before["level"]) == (session_xp(solo) + 140, 3)
    assert reward(before, "frame-gold")["state"] == "available"
    assert reward(before, "back-midnight")["state"] == "available"
    # Available is not redeemed: it cannot be worn yet.
    early = wear(client, host, frame="frame-gold")
    assert early.status_code == 409
    assert early.json()["detail"] == "Redeem Gold frame before wearing it."
    redeemed = redeem(client, host, "frame-gold")
    assert redeemed.status_code == 200
    assert redeemed.headers["cache-control"] == "private, no-store"
    assert reward(redeemed.json(), "frame-gold") == {
        "id": "frame-gold", "kind": "frame", "name": "Gold frame",
        "requirement": "Reach level 2", "state": "redeemed", "equipped": False,
        "value": 2, "goal": 2,
    }
    assert reward(redeemed.json(), "back-midnight")["state"] == "available"
    # Redeeming again changes nothing.
    assert redeem(client, host, "frame-gold").json() == redeemed.json()
    assert redeem(client, host, "back-midnight").status_code == 200
    with sessions()() as db:
        assert db.get(Profile, host_id).cosmetics == {
            "claimed": ["frame-gold", "back-midnight"], "frame": None, "card_back": None,
        }
    assert me(client, host)["frame"] is None  # redeemed, not yet worn

    room = create(client, host, "uno", 3)
    guest = player(client)
    joined = client.post(
        "/v1/rooms/join", headers=guest, json={"invite": room["code"], "name": "Guest"}
    )
    assert joined.status_code == 200
    bots = client.post(f"/v1/rooms/{room['id']}/bots", headers=host, json={"count": 1})
    assert bots.status_code == 200
    start = revision(room["id"])
    solo_start = revision(solo["id"])

    worn = wear(client, host, frame="frame-gold", card_back="back-midnight")
    assert worn.status_code == 200
    assert reward(worn.json(), "frame-gold")["equipped"]
    assert reward(worn.json(), "back-midnight")["equipped"]
    assert sum(r["equipped"] for r in worn.json()["rewards"]) == 2
    assert worn.json() == progress(client, host)
    # Every open room the player sits in is told to refresh.
    assert revision(room["id"]) == start + 1 and revision(solo["id"]) == solo_start + 1

    own = me(client, host)
    assert (own["frame"], own["card_back"]) == ("frame-gold", "back-midnight")
    saved = client.put("/v1/profile", headers=host, json={"name": "Host", "avatar": 2})
    assert (saved.json()["frame"], saved.json()["card_back"]) == ("frame-gold", "back-midnight")

    theirs = client.get(f"/v1/rooms/{room['id']}", headers=guest)
    members = {m["id"]: m for m in theirs.json()["members"]}
    assert members[host_id]["frame"] == "frame-gold"
    assert all(set(member) == MEMBER_KEYS for member in members.values())
    assert [m["frame"] for m in members.values() if m["id"] != host_id] == [None, None]
    assert any(m["is_bot"] for m in members.values())
    # Nothing else about the host's progress reaches another player.
    beat = client.post(f"/v1/rooms/{room['id']}/heartbeat", headers=guest)
    for response in (theirs, beat, client.get("/v1/me", headers=guest)):
        assert response.status_code == 200
        assert not any(word in response.text for word in PRIVATE_WORDS), response.text
    # A card back is on its owner's profile only, never on a seat at a table.
    assert '"card_back"' not in theirs.text and '"card_back"' not in beat.text
    assert me(client, guest)["card_back"] is None and me(client, guest)["frame"] is None
    # The guest's own progress is their own: empty.
    assert {key: progress(client, guest)[key] for key in EMPTY} == EMPTY
    assert wear(client, guest, frame="frame-gold").status_code == 409

    # Wearing the same frame again, or changing only the card back, moves no table.
    assert wear(client, host, frame="frame-gold", card_back="back-midnight").status_code == 200
    assert wear(client, host, frame="frame-gold").status_code == 200
    assert revision(room["id"]) == start + 1
    assert me(client, host)["card_back"] is None and me(client, host)["frame"] == "frame-gold"
    # Both fields are always applied: leaving the frame out takes it off.
    off = wear(client, host, card_back="back-midnight")
    assert off.status_code == 200 and not reward(off.json(), "frame-gold")["equipped"]
    assert reward(off.json(), "frame-gold")["state"] == "redeemed"
    assert revision(room["id"]) == start + 2
    assert me(client, host)["frame"] is None and me(client, host)["card_back"] == "back-midnight"
    seen = client.get(f"/v1/rooms/{room['id']}", headers=guest).json()
    assert next(m for m in seen["members"] if m["id"] == host_id)["frame"] is None

    # A room the player has left, and so closed, is not touched.
    assert client.post(f"/v1/rooms/{solo['id']}/leave", headers=host).status_code == 200
    closed = revision(solo["id"])
    assert wear(client, host, frame="frame-gold").status_code == 200
    assert revision(solo["id"]) == closed and revision(room["id"]) == start + 3


def test_two_rewards_redeemed_at_once_are_both_kept(client):
    headers = player(client)
    room = spin_out(client, headers)
    add_results(room["id"], room["owner_id"], ["uno", "ludo", "chess", "go"])
    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(
            lambda reward_id: redeem(client, headers, reward_id), ["frame-gold", "back-midnight"]
        ))
    assert [r.status_code for r in results] == [200, 200]
    view = progress(client, headers)
    assert reward(view, "frame-gold")["state"] == "redeemed"
    assert reward(view, "back-midnight")["state"] == "redeemed"
    with sessions()() as db:
        assert db.get(Profile, room["owner_id"]).cosmetics["claimed"] == [
            "frame-gold", "back-midnight",
        ]


def test_a_streak_follows_the_offset_the_player_sends(client):
    headers = player(client)
    room = spin_out(client, headers)
    now = time.time()
    # An offset that makes it about 01:00 for the player right now.
    offset = (60 - int(now % 86400) // 60) % 1440
    offset = offset - 1440 if offset > 720 else offset
    with sessions()() as db, db.begin():
        db.get(Match, room["match_id"]).created_at = now - 7200  # 23:00 the day before
    late = progress(client, headers, tz_offset=offset)
    assert late["streak"] == {"current": 1, "best": 1, "played_today": False}
    # Two hours further east it is 03:00 and the game was at 01:00 today.
    east = progress(client, headers, tz_offset=offset + 120)
    assert east["streak"] == {"current": 1, "best": 1, "played_today": True}
    assert east["xp"] == late["xp"] == session_xp(room)
    # Three days running, ending yesterday, earn the streak badge and its frame.
    add_results(room["id"], room["owner_id"], ["roulette"], won=False, created_at=now - 7200 - 86400)
    add_results(room["id"], room["owner_id"], ["roulette"], won=False, created_at=now - 7200 - 172800)
    run = progress(client, headers, tz_offset=offset)
    assert run["streak"] == {"current": 3, "best": 3, "played_today": False}
    assert badge(run, "streak-3")["earned"] and reward(run, "frame-flame")["state"] == "available"
    claimed = client.post(
        "/v1/rewards/frame-flame/redeem", headers=headers, params={"tz_offset": offset}
    )
    assert claimed.status_code == 200
    assert reward(claimed.json(), "frame-flame")["state"] == "redeemed"
    worn = client.put(
        "/v1/profile/cosmetics", headers=headers, params={"tz_offset": offset},
        json={"frame": "frame-flame"},
    )
    assert worn.status_code == 200 and reward(worn.json(), "frame-flame")["equipped"]
    assert worn.json()["streak"] == run["streak"]


def test_progress_is_limited_to_about_sixty_requests_a_minute(client):
    headers = player(client)
    codes = [client.get("/v1/progress", headers=headers).status_code for _ in range(125)]
    assert 429 in codes
    first = codes.index(429)
    # Sixty are answered in one window; a run that crosses a minute may get more.
    assert first >= 60 and codes[:first] == [200] * first
