"""Housie, Liar's Dice, Bluff and Truth or Dare through the real HTTP rooms.

Two people play whole matches with every response checked for the other
player's secrets, and one person plays each game against bots to the end.
"""

import itertools
import json

import pytest
from fastapi.testclient import TestClient
from room_helpers import player, require_isolated
from sqlalchemy import select
from test_bots_rooms import begin, drive, move, unpaced

from app.bots import choose_action
from app.core.contracts import GameView
from app.db import sessions
from app.games.registry import ENGINES
from app.games.truth_or_dare.prompts import NAUGHTY_DARES, NAUGHTY_FATES, NAUGHTY_TRUTHS
from app.main import app
from app.models import Match, Receipt

GAMES = ["housie", "liars-dice", "bluff", "truth-or-dare"]


@pytest.fixture
def client():
    require_isolated()
    with TestClient(app) as client:
        yield client


@pytest.fixture(autouse=True)
def fixed_matches(monkeypatch):
    """Each match here is the same match on every run.

    The engine's shuffle and every bot's private seed come from a fixed sequence
    instead of fresh entropy; room codes and invite tokens are not affected.
    """
    values = itertools.count(20261125)
    monkeypatch.setattr("secrets.randbits", lambda bits: next(values))


def open_room(client, game, seats, bots=0, settings=None):
    host = player(client)
    response = client.post(
        "/v1/rooms",
        headers=host,
        json={"name": "Host", "room_name": "Parlour verification", "game_id": game,
              "capacity": seats, "bots": bots, "settings": settings or {}},
    )
    assert response.status_code == 201, response.text
    return response.json(), host


def two_people(client, game, settings=None):
    room, host = open_room(client, game, 2, settings=settings)
    guest = player(client)
    joined = client.post("/v1/rooms/join", headers=guest,
                         json={"invite": room["code"], "name": "Guest"})
    assert joined.status_code == 200, joined.text
    path = f"/v1/rooms/{room['id']}"
    assert client.put(path + "/ready", headers=guest, json={"ready": True}).status_code == 200
    room = begin(client, room, host)
    headers = {}
    for header in (host, guest):
        headers[client.get("/v1/me", headers=header).json()["profile"]["id"]] = header
    return room, headers


def saved_state(room):
    with sessions()() as db:
        return db.get(Match, room["match_id"]).state


def moves(room, actor=None):
    """The match's committed public moves, oldest first."""
    with sessions()() as db:
        receipts = db.scalars(select(Receipt).where(Receipt.match_id == room["match_id"])).all()
        ordered = sorted(receipts, key=lambda r: r.response["committedVersion"])
        return [r.response["public_move"] for r in ordered
                if "public_move" in r.response and actor in (None, r.actor_id)]


def labels(room):
    return [event["label"] for event in moves(room)]


def play_two(client, room, headers, inspect, pick_actor=None, limit=700):
    """Both seats play their bot policy over HTTP; `inspect` sees every response."""
    path = f"/v1/rooms/{room['id']}"
    memory = {person: {"seed": seat} for seat, person in enumerate(headers)}
    for _ in range(limit):
        views = {}
        for person, header in headers.items():
            response = client.get(path, headers=header)
            assert response.status_code == 200
            views[person] = response
        state = saved_state(room)
        for person, response in views.items():
            inspect(state, person, response)
        room = next(iter(views.values())).json()
        if room["status"] == "finished":
            return room
        games = {person: response.json()["game"] for person, response in views.items()}
        actor = pick_actor(games) if pick_actor else None
        actor = actor or room["game"]["current_player"]
        decision = choose_action(GameView.model_validate(games[actor]), actor, memory[actor])
        memory[actor] = decision.memory
        sent = move(client, views[actor].json(), headers[actor], decision.action.model_dump())
        assert sent.status_code == 200, sent.text
    raise AssertionError("The match did not finish")


def test_two_people_play_housie_seeing_only_their_own_ticket(client):
    room, headers = two_people(client, "housie")
    seen = {"calls": 0}

    def inspect(state, person, response):
        game = response.json()["game"]
        other = next(p for p in headers if p != person)
        assert game["detail"]["ticket"] == [[n or None for n in row] for row in state["tickets"][person]]
        assert game["detail"]["ticket"] != [[n or None for n in row] for row in state["tickets"][other]]
        assert game["detail"]["called"] == state["called"] and game["draw_count"] == len(state["bag"])
        assert response.text.count('"ticket"') == 1
        for field in ('"bag"', '"tickets"', '"marks"', '"seed"'):
            assert field not in response.text
        seen["calls"] = max(seen["calls"], len(state["called"]))

    def claimant(games):
        return next((p for p, game in games.items()
                     if any(o["action"]["type"] == "claim" for o in game["actions"])), None)

    room = play_two(client, room, headers, inspect, claimant)
    state = saved_state(room)
    assert room["game"]["phase"] == "finished" and state["prizes"]["full_house"]["winners"]
    assert room["game"]["winners"] == state["winners"] and seen["calls"] >= 15
    called = [label for label in labels(room) if label.startswith("Called ")]
    assert called == [f"Called {number}" for number in state["called"]]
    assert "Claimed Full house" in labels(room)
    with sessions()() as db:
        result = db.get(Match, room["match_id"]).result
    assert result == {"winners": state["winners"], "scores": state["scores"]}
    for person, header in headers.items():
        history = client.get("/v1/me", headers=header).json()["history"]
        entry = next(item for item in history if item["id"] == room["match_id"])
        assert entry["score"] == state["scores"][person]


def test_housie_settings_reach_the_table_and_unknown_ones_are_refused(client):
    room, headers = two_people(client, "housie", {"auto_mark": False})
    assert room["game"]["detail"]["auto_mark"] is False and room["settings"] == {"auto_mark": False}
    caller = room["game"]["current_player"]
    called = move(client, room, headers[caller], {"type": "call_number"})
    assert called.status_code == 200
    number = called.json()["game"]["detail"]["last_called"]
    state = saved_state(room)
    for person, header in headers.items():
        game = client.get(f"/v1/rooms/{room['id']}", headers=header).json()["game"]
        holds = any(number in row for row in state["tickets"][person])
        marks = [o["action"]["amount"] for o in game["actions"] if o["action"]["type"] == "mark"]
        assert marks == ([number] if holds else []) and game["detail"]["marked"] == []
    refused = client.post("/v1/rooms", headers=player(client),
                          json={"name": "Host", "game_id": "housie", "capacity": 2,
                                "settings": {"wild_ones": True}})
    assert refused.status_code == 422


def test_two_people_play_liars_dice_and_dice_stay_hidden_until_a_call(client):
    room, headers = two_people(client, "liars-dice")
    seen = {"reveals": 0, "bidding": 0}

    def inspect(state, person, response):
        game = response.json()["game"]
        other = next(p for p in headers if p != person)
        assert '"seed"' not in response.text and '"counts"' not in response.text
        assert game["detail"]["dice"] == state["dice"][person]
        if game["phase"] == "bidding":
            seen["bidding"] += 1
            assert game["detail"]["reveal"] is None
            # The other player's dice appear nowhere: the only dice list is the viewer's own.
            assert response.text.count('"dice"') == 1
            assert next(p["count"] for p in game["players"] if p["id"] == other) == len(state["dice"][other])
        else:
            seen["reveals"] += 1
            assert game["detail"]["reveal"]["dice"] == state["dice"]

    room = play_two(client, room, headers, inspect)
    state = saved_state(room)
    assert room["game"]["phase"] == "finished" and len(state["winners"]) == 1
    assert seen["bidding"] and seen["reveals"] >= 5  # five dice have to be lost
    told = labels(room)
    assert any(label.startswith("Bid ") for label in told)
    assert {"Called liar and was right", "Called liar and was wrong"} & set(told)
    assert "Rolled the next round" in told


def test_two_people_play_bluff_and_only_a_called_play_is_ever_shown(client):
    room, headers = two_people(client, "bluff")
    seen = {"reveals": 0}

    def inspect(state, person, response):
        game = response.json()["game"]
        other = next(p for p in headers if p != person)
        assert [card["id"] for card in game["hand"]] == state["hands"][person]
        shown = [card["id"] for card in game["community"]]
        if state["phase"] == "reveal":
            seen["reveals"] += 1
            assert shown == state["last"]["cards"]
        else:
            assert shown == []
        # The table itself never names a hidden card. (The room's move history may
        # still list a play that an earlier call turned over for everyone.)
        table = json.dumps(game)
        hidden = set(state["hands"][other]) | set(state["pile"]) | set(state["discarded"])
        assert [card for card in hidden - set(shown) if json.dumps(card) in table] == []
        revealed = {card["id"] for event in response.json()["activity"] for card in event["cards"]}
        assert revealed >= {card for card in hidden if json.dumps(card) in response.text}
        assert all(event["cards"] == [] for event in response.json()["activity"]
                   if event["type"] != "call_bluff")
        assert game["detail"]["pile_count"] == len(state["pile"])
        for field in ('"pile"', '"hands"', '"discarded"', '"last"'):
            assert field not in response.text

    room = play_two(client, room, headers, inspect)
    state = saved_state(room)
    assert room["game"]["phase"] == "finished" and len(state["winners"]) == 1
    assert state["hands"][state["winners"][0]] == [] and seen["reveals"]
    assert len(state["pile"]) + len(state["discarded"]) + sum(map(len, state["hands"].values())) == 52
    # Durable history: a play is a count and a claimed rank; faces only for called plays.
    told = moves(room)
    assert all(m["cards"] == [] for m in told if m["type"] != "call_bluff")
    assert any(m["type"] == "call_bluff" and 1 <= len(m["cards"]) <= 4 for m in told)
    assert any(m["label"].startswith("Played ") and " as " in m["label"] for m in told)


def test_truth_or_dare_editions_stay_apart_over_http(client):
    naughty = [text.lower() for text in [*NAUGHTY_TRUTHS, *NAUGHTY_DARES]] + ["fuck", "kill"]
    room, headers = two_people(client, "truth-or-dare")
    assert room["settings"] == {"adults_only": False, "burning_building": True,
                                "name_players": False}
    seen = {"prompts": 0}

    def inspect(state, person, response):
        lowered = response.text.lower()
        assert not [needle for needle in naughty if needle in lowered]
        assert '"stock"' not in response.text and '"seed"' not in response.text
        game = response.json()["game"]
        assert game["detail"]["edition"] == "friendly"
        assert game["detail"]["fates"] == ["Kiss", "Marry", "Leave behind"]
        assert game["detail"]["prompt"] == state["prompt"]
        seen["prompts"] += state["prompt"] is not None

    room = play_two(client, room, headers, inspect)
    state = saved_state(room)
    assert room["game"]["phase"] == "finished" and seen["prompts"]
    assert state["turns_taken"] == dict.fromkeys(headers, 4)
    assert not [needle for needle in naughty if needle in json.dumps(labels(room)).lower()]
    # The adult edition is a deliberate room rule and brings its own fates.
    adult, people = two_people(client, "truth-or-dare", {"adults_only": True})
    assert adult["game"]["detail"]["edition"] == "naughty"
    assert adult["game"]["detail"]["fates"] == NAUGHTY_FATES
    first = adult["game"]["current_player"]
    drawn = move(client, adult, people[first], {"type": "pick", "choice": "truth"})
    assert drawn.status_code == 200
    assert drawn.json()["game"]["detail"]["prompt"]["text"] in NAUGHTY_TRUTHS
    other = next(p for p in people if p != first)
    shared = client.get(f"/v1/rooms/{adult['id']}", headers=people[other]).json()["game"]
    assert shared["detail"]["prompt"] == drawn.json()["game"]["detail"]["prompt"]
    assert shared["actions"] == []
    # The catalogue lists the game without the adult wording.
    listing = client.get("/v1/games").text.lower()
    assert "truth-or-dare" in listing and "fuck" not in listing


@pytest.mark.parametrize("game_id", GAMES)
def test_one_person_plays_a_whole_match_against_bots(client, monkeypatch, game_id):
    unpaced(monkeypatch)
    room, host = open_room(client, game_id, 3, bots=2)
    room = begin(client, room, host)
    human = room["owner_id"]
    memory = {"seed": 1}
    human_moves = bot_moves = 0
    for _ in range(1500):
        if room["status"] == "finished":
            break
        assert '"deck"' not in json.dumps(room) and '"seed"' not in json.dumps(room)
        if room["bot_pending"]:
            response = drive(client, room, host)
            bot_moves += 1
        else:
            assert room["game"]["actions"], (
                game_id, room["game"]["phase"], room["paused"], room["game"]["current_player"])
            decision = choose_action(GameView.model_validate(room["game"]), human, memory)
            memory = decision.memory
            response = move(client, room, host, decision.action.model_dump())
            human_moves += 1
        assert response.status_code == 200, response.text
        room = response.json()
    assert room["status"] == "finished" and room["game"]["phase"] == "finished"
    assert human_moves and bot_moves and room["game"]["winners"]
    history = client.get("/v1/me", headers=host).json()["history"]
    entry = next(item for item in history if item["id"] == room["match_id"])
    assert entry["game_id"] == game_id
    assert "Made a move" not in labels(room)
    with sessions()() as db:
        bots = db.get(Match, room["match_id"]).bot_memory
    assert len(bots) == 2 and all(len(json.dumps(value)) <= 16384 for value in bots.values())


def test_a_housie_bot_claims_before_the_next_number_is_called(client, monkeypatch):
    unpaced(monkeypatch)
    engine = ENGINES["housie"]
    room, host = open_room(client, "housie", 2, bots=1)
    room = begin(client, room, host)
    bot = next(m["id"] for m in room["members"] if m["is_bot"])
    claims = 0
    for _ in range(400):
        if room["status"] == "finished":
            break
        if room["bot_pending"]:
            # A bot holding a claim makes it before anything else, even as the caller.
            offered = {o.action.type for o in engine.legal_actions(saved_state(room), bot)}
            room = drive(client, room, host).json()
            expected = "claim" if "claim" in offered else "call_number"
            assert moves(room, bot)[-1]["type"] == expected
            claims += expected == "claim"
        else:
            # The person only ever calls: every prize is left for the bot.
            option = next(o for o in room["game"]["actions"] if o["action"]["type"] == "call_number")
            room = move(client, room, host, option["action"]).json()
    state = saved_state(room)
    assert room["status"] == "finished" and bot in state["winners"] and claims == 5
    # The bot was first to every prize. (Full house alone can be shared: when the
    # bot's last number is also the person's, both tickets are complete on that call.)
    assert all(prize["winners"][0] == bot for prize in state["prizes"].values())
    assert all(prize["winners"] == [bot] for key, prize in state["prizes"].items()
               if key != "full_house")
