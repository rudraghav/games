"""Secret Santa over HTTP: the organiser's table, private links and what they reveal."""

import base64
import logging
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from room_helpers import create, player, require_isolated, seated_room
from sqlalchemy import func, select

from app.db import sessions
from app.main import app
from app.models import Match, Receipt, Room

NAMES = ["Asha-canary", "Ben-canary", "Chen-canary", "Dara-canary", "Eli-canary"]
NO_LINK = "This link doesn't open a name. Ask the organiser for a new one."
SLOW_DOWN = "Too many links that didn't work. Wait ten minutes, then try again."
URL_SAFE = set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_")


@pytest.fixture
def client():
    require_isolated()
    with TestClient(app) as client:
        yield client


def move(client, headers, room, kind, **fields):
    response = client.post(f"/v1/rooms/{room['id']}/actions", headers=headers, json={
        "match_id": room["match_id"], "expected_version": room["match_version"],
        "action_id": str(uuid4()), "action": {"type": kind, **fields},
    })
    assert response.status_code == 200, response.text
    return response.json()


def organised(client):
    """A started table with five people, one excluded pair, one group and the details."""
    room, (organiser,) = seated_room(client, "secret-santa", 1)
    for name in NAMES:
        room = move(client, organiser, room, "add_name", choice=name)
    room = move(client, organiser, room, "set_exclusions", target="p1", cards=["p2"])
    room = move(client, organiser, room, "add_group", choice="Flat-canary")
    room = move(client, organiser, room, "set_group", target="g1", cards=["p3", "p4"])
    room = move(client, organiser, room, "set_title", choice="Office-canary gifts")
    room = move(client, organiser, room, "set_location", choice="Crown-canary, upstairs")
    room = move(client, organiser, room, "set_budget", choice="£15")
    room = move(client, organiser, room, "set_day", amount=2545)
    return room, organiser


def links(client, headers, room):
    response = client.get(f"/v1/rooms/{room['id']}/secret-santa/links", headers=headers)
    assert response.status_code == 200, response.text
    assert response.headers["cache-control"] == "private, no-store"
    return {link["id"]: link for link in response.json()["links"]}


def open_link(client, headers, token):
    return client.get(f"/v1/secret-santa/{token}", headers=headers)


def saved(room):
    with sessions()() as db:
        match = db.get(Match, room["match_id"])
        return match.state, match.version, db.get(Room, room["id"]).revision


def test_organiser_sets_up_draws_and_gets_one_private_link_per_person(client):
    room, organiser = organised(client)
    path = f"/v1/rooms/{room['id']}/secret-santa/links"
    assert room["status"] == "playing" and len(room["code"]) == 8
    game = room["game"]
    assert game["phase"] == "setup" and game["detail"]["can_draw"] is True
    assert game["detail"]["pairs"] == [["p1", "p2"]]
    assert game["detail"]["groups"] == [{"id": "g1", "label": "Flat-canary", "members": ["p3", "p4"]}]
    assert (game["detail"]["title"], game["detail"]["day"]) == ("Office-canary gifts", 2545)
    # Before the draw there is nothing to link to.
    early = client.get(path, headers=organiser)
    assert early.status_code == 409
    assert early.json()["detail"] == "Draw the names first. The links appear after the draw."
    assert client.get(path).status_code == 401

    room = move(client, organiser, room, "draw")
    assert room["game"]["phase"] == "drawn" and room["game"]["detail"]["drawn"] is True
    assert room["game"]["message"] == "Names are drawn. Share each person's link."
    found = links(client, organiser, room)
    assert [(link["id"], link["name"]) for link in found.values()] == [
        (f"p{index + 1}", name) for index, name in enumerate(NAMES)]
    tokens = [link["token"] for link in found.values()]
    assert len(set(tokens)) == 5
    assert all(20 <= len(token) < 100 and set(token) <= URL_SAFE for token in tokens)
    assert links(client, organiser, room) == found  # derived, so the same every time

    # The organiser's table and its history name no recipient and copy nothing typed.
    fresh = client.get(f"/v1/rooms/{room['id']}", headers=organiser)
    assert '"assignment"' not in fresh.text and "recipient" not in fresh.text
    assert '"seed"' not in fresh.text and not any(token in fresh.text for token in tokens)
    activity = fresh.json()["activity"]
    assert [event["type"] for event in activity][-3:] == ["set_budget", "set_day", "draw"]
    assert activity[-1]["label"] == "Drew the names"
    for event in activity:
        assert "canary" not in str(event) and "2545" not in str(event)
        assert (event["targets"], event["cards"], event["amount"]) == ([], [], None)
    with sessions()() as db:
        receipts = db.scalars(select(Receipt.response).where(Receipt.match_id == room["match_id"])).all()
    assert len(receipts) == 13 and "canary" not in str(receipts)

    # The draw itself obeys the list: checked against the saved state, never the view.
    state, _, _ = saved(room)
    assignment = state["assignment"]
    assert sorted(assignment) == sorted(assignment.values()) == [f"p{i}" for i in range(1, 6)]
    assert all(giver != recipient for giver, recipient in assignment.items())
    assert assignment["p1"] != "p2" and assignment["p2"] != "p1"
    assert assignment["p3"] != "p4" and assignment["p4"] != "p3"


def test_a_guest_opens_one_link_and_sees_only_their_own_draw(client, caplog):
    room, organiser = organised(client)
    room = move(client, organiser, room, "draw")
    found = links(client, organiser, room)
    state, version, revision = saved(room)
    name_of = {person["id"]: person["name"] for person in state["people"]}
    token = found["p3"]["token"]
    assert client.get(f"/v1/secret-santa/{token}").status_code == 401

    guest = player(client)  # a guest session with no profile and no room
    with sessions()() as db:
        receipts = db.scalar(select(func.count()).select_from(Receipt))
    with caplog.at_level(logging.DEBUG):
        response = open_link(client, guest, token)
        assert response.status_code == 200, response.text
        found_again = links(client, organiser, room)
    assert response.headers["cache-control"] == "private, no-store"
    recipient = name_of[state["assignment"]["p3"]]
    assert response.json() == {
        "title": "Office-canary gifts", "day": 2545, "location": "Crown-canary, upstairs",
        "budget": "£15", "giver_name": "Chen-canary", "recipient_name": recipient,
    }
    # Nobody else's name or draw travels with it, and nothing about it is logged.
    for name in set(NAMES) - {"Chen-canary", recipient}:
        assert name not in response.text
    # (The test's own HTTP client logs the URLs it requests; the application must not.)
    logged = "\n".join(record.getMessage() for record in caplog.records
                       if not record.name.startswith("httpx"))
    assert "canary" not in logged and "secret-santa" not in logged
    assert not any(link["token"] in logged for link in found_again.values())

    # The organiser's table refreshes to show that Chen has looked, and still no recipient.
    after_state, after_version, after_revision = saved(room)
    assert after_state["opened"] == ["p3"] and after_state["assignment"] == state["assignment"]
    # The room revision moves so the open table refreshes; the move counter does not.
    assert (after_version, after_revision) == (version, revision + 1)
    view = client.get(f"/v1/rooms/{room['id']}", headers=organiser)
    table = view.json()
    assert table["match_version"] == version and table["revision"] == revision + 1
    assert [person["opened"] for person in table["game"]["detail"]["people"]] == [
        False, False, True, False, False]
    assert table["game"]["detail"]["showing"] is None and "recipient" not in view.text
    assert table["activity"] == room["activity"]  # opening a link is not a table event
    with sessions()() as db:
        assert db.scalar(select(func.count()).select_from(Receipt)) == receipts

    # Opening it again, by anyone, shows the same line and changes nothing more.
    assert open_link(client, guest, token).json() == response.json()
    assert open_link(client, organiser, token).json() == response.json()
    assert saved(room) == (after_state, after_version, after_revision)
    # The organiser was mid-choice when the link was opened: the move they had ready,
    # built from the table as it was before anyone looked, still goes through.
    ready = client.post(f"/v1/rooms/{room['id']}/actions", headers=organiser, json={
        "match_id": room["match_id"], "expected_version": room["match_version"],
        "action_id": str(uuid4()), "action": {"type": "set_budget", "choice": "£20"}})
    assert ready.status_code == 200 and ready.json()["game"]["detail"]["budget"] == "£20"
    assert [person["opened"] for person in ready.json()["game"]["detail"]["people"]] == [
        False, False, True, False, False]
    assert open_link(client, guest, token).json()["budget"] == "£20"
    # Each link opens its own line.
    for person, link in found.items():
        line = open_link(client, guest, link["token"]).json()
        assert (line["giver_name"], line["recipient_name"]) == (
            name_of[person], name_of[state["assignment"][person]])
    assert sorted(saved(room)[0]["opened"]) == ["p1", "p2", "p3", "p4", "p5"]


def test_links_route_is_for_the_organiser_of_a_secret_santa_draw_only(client):
    room, organiser = organised(client)
    room = move(client, organiser, room, "draw")
    path = f"/v1/rooms/{room['id']}/secret-santa/links"
    outsider = player(client)
    for headers in (outsider, player(client)):
        refused = client.get(path, headers=headers)
        assert refused.status_code == 404
        assert refused.json()["detail"] == "This room is unavailable to your player session."
    assert client.get(f"/v1/rooms/{uuid4()}/secret-santa/links", headers=organiser).status_code == 404
    # Another game's table has no links, whoever asks.
    tarot, (reader,) = seated_room(client, "tarot", 1)
    other = client.get(f"/v1/rooms/{tarot['id']}/secret-santa/links", headers=reader)
    assert other.status_code == 409
    assert other.json()["detail"] == "Start a Secret Santa table and draw the names first."
    waiting = player(client)
    lobby = create(client, waiting, "secret-santa", 1)
    lobby_path = f"/v1/rooms/{lobby['id']}/secret-santa/links"
    assert client.get(lobby_path, headers=waiting).status_code == 409  # not started yet
    assert client.get(lobby_path, headers=organiser).status_code == 404


def respelled(token, change):
    raw = bytearray(base64.urlsafe_b64decode(token + "=" * (-len(token) % 4)))
    change(raw)
    return base64.urlsafe_b64encode(bytes(raw)).rstrip(b"=").decode()


def test_forged_and_malformed_tokens_get_one_answer_and_then_a_limit(client):
    room, organiser = organised(client)
    room = move(client, organiser, room, "draw")
    found = links(client, organiser, room)
    token = found["p1"]["token"]

    def other_person(raw):
        raw[16] = 2  # Asha's signature on Ben's number

    def other_table(raw):
        raw[:16] = uuid4().bytes

    def bad_signature(raw):
        raw[-1] ^= 1

    forgeries = [
        respelled(token, other_person), respelled(token, other_table),
        respelled(token, bad_signature), token[:-1], token + "A", token[:-1] + "!",
        "not-a-link", "A" * 44, "A" * 300, str(uuid4()),
    ]
    assert token not in forgeries
    guesser = player(client)
    answers = [open_link(client, guesser, forged) for forged in forgeries]
    assert {(answer.status_code, answer.text) for answer in answers} == {
        (404, '{"detail":"' + NO_LINK + '"}')}
    # Ten misses were allowed. The next one, and then even the real link, must wait.
    eleventh = open_link(client, guesser, respelled(token, bad_signature))
    assert (eleventh.status_code, eleventh.json()["detail"]) == (429, SLOW_DOWN)
    blocked = open_link(client, guesser, token)
    assert (blocked.status_code, blocked.json()["detail"]) == (429, SLOW_DOWN)
    # The limit is that guesser's alone, and their guesses opened nothing.
    assert saved(room)[0]["opened"] == []
    assert open_link(client, player(client), token).status_code == 200
    assert saved(room)[0]["opened"] == ["p1"]
    # Wrong room codes are counted separately from wrong links.
    assert client.post("/v1/rooms/join", headers=guesser,
                       json={"invite": "000000", "name": "Guesser"}).status_code == 404


def test_successful_reads_are_limited_too(client):
    room, organiser = organised(client)
    room = move(client, organiser, room, "draw")
    token = links(client, organiser, room)["p2"]["token"]
    reader = player(client)
    statuses = [open_link(client, reader, token).status_code for _ in range(32)]
    assert statuses[0] == 200 and statuses[-1] == 429
    assert 28 <= statuses.count(200) <= 30  # thirty a minute; a minute may turn over mid-test


def test_drawing_again_or_removing_someone_makes_every_old_link_useless(client):
    room, organiser = organised(client)
    room = move(client, organiser, room, "draw")
    first = links(client, organiser, room)
    reader = player(client)
    assert open_link(client, reader, first["p5"]["token"]).status_code == 200

    room = client.get(f"/v1/rooms/{room['id']}", headers=organiser).json()
    assert room["game"]["detail"]["people"][4]["opened"] is True
    room = move(client, organiser, room, "redraw")
    assert room["game"]["phase"] == "setup" and room["game"]["detail"]["drawn"] is False
    assert all(not person["opened"] for person in room["game"]["detail"]["people"])
    assert client.get(f"/v1/rooms/{room['id']}/secret-santa/links", headers=organiser).status_code == 409
    for link in first.values():  # five misses, all the same answer
        answer = open_link(client, reader, link["token"])
        assert (answer.status_code, answer.json()["detail"]) == (404, NO_LINK)

    room = move(client, organiser, room, "remove_name", target="p5")
    room = move(client, organiser, room, "draw")
    assert room["game"]["detail"]["draw_number"] == 2
    second = links(client, organiser, room)
    assert sorted(second) == ["p1", "p2", "p3", "p4"]
    assert not {link["token"] for link in first.values()} & {link["token"] for link in second.values()}
    other = player(client)
    for link in first.values():  # outdated, and Eli's is for nobody now
        assert open_link(client, other, link["token"]).status_code == 404
    state, _, _ = saved(room)
    name_of = {person["id"]: person["name"] for person in state["people"]}
    line = open_link(client, player(client), second["p4"]["token"])
    assert line.status_code == 200
    assert line.json()["recipient_name"] == name_of[state["assignment"]["p4"]]
    assert state["opened"] == [] and saved(room)[0]["opened"] == ["p4"]


def test_links_keep_working_after_finish_and_after_the_organiser_leaves(client):
    room, organiser = organised(client)
    room = move(client, organiser, room, "draw")
    room = move(client, organiser, room, "reveal", target="p1")
    shown = room["game"]["detail"]["showing"]
    state, _, _ = saved(room)
    name_of = {person["id"]: person["name"] for person in state["people"]}
    assert shown == {"giver": "p1", "giver_name": "Asha-canary",
                     "recipient_name": name_of[state["assignment"]["p1"]]}
    assert room["activity"][-1]["label"] == "Showed one person their name"
    assert "canary" not in str(room["activity"])
    room = move(client, organiser, room, "hide")
    assert room["game"]["detail"]["showing"] is None

    room = move(client, organiser, room, "finish")
    assert room["status"] == "finished" and room["game"]["phase"] == "finished"
    assert room["game"]["actions"] == [] and room["game"]["winners"] == []
    assert "recipient" not in str(room["game"])
    found = links(client, organiser, room)
    guest = player(client)
    line = open_link(client, guest, found["p2"]["token"])
    assert line.status_code == 200
    assert line.json()["recipient_name"] == name_of[state["assignment"]["p2"]]
    table = client.get(f"/v1/rooms/{room['id']}", headers=organiser).json()
    assert [person["opened"] for person in table["game"]["detail"]["people"]] == [
        True, True, False, False, False]
    history = client.get("/v1/me", headers=organiser).json()["history"]
    assert [(item["game_id"], item["winners"], item["score"]) for item in history] == [
        ("secret-santa", [], 0)]

    closed = client.post(f"/v1/rooms/{room['id']}/leave", headers=organiser)
    assert closed.status_code == 200 and closed.json()["status"] == "closed"
    _, version, revision = saved(room)
    # The organiser is gone, so the list of links is too; each link still opens.
    assert client.get(f"/v1/rooms/{room['id']}/secret-santa/links", headers=organiser).status_code == 404
    late = open_link(client, guest, found["p4"]["token"])
    assert late.status_code == 200
    assert late.json() == {
        "title": "Office-canary gifts", "day": 2545, "location": "Crown-canary, upstairs",
        "budget": "£15", "giver_name": "Dara-canary",
        "recipient_name": name_of[state["assignment"]["p4"]],
    }
    after_state, after_version, after_revision = saved(room)
    assert after_state["opened"] == ["p1", "p2", "p4"]
    # The closed room is left alone; only the saved draw records the visit.
    assert (after_version, after_revision) == (version, revision)
    assert open_link(client, organiser, found["p4"]["token"]).status_code == 200


def test_links_survive_an_abandoned_table_but_not_a_table_never_drawn(client):
    room, organiser = organised(client)
    room = move(client, organiser, room, "draw")
    token = links(client, organiser, room)["p1"]["token"]
    assert client.post(f"/v1/rooms/{room['id']}/abandon", headers=organiser).status_code == 200
    assert client.get(f"/v1/rooms/{room['id']}/secret-santa/links", headers=organiser).status_code == 409
    _, _, revision = saved(room)
    assert open_link(client, player(client), token).status_code == 200
    # The room has moved on from that draw, so its revision is not touched.
    assert saved(room)[0]["opened"] == ["p1"] and saved(room)[2] == revision


def test_nobody_can_join_the_organisers_table(client):
    room, organiser = organised(client)
    message = ("This is a private solo table, so it can't be joined. "
               "Start your own from the games library.")
    for invite in (room["code"], room["invite_token"]):
        refused = client.post("/v1/rooms/join", headers=player(client),
                              json={"invite": invite, "name": "Guest"})
        assert (refused.status_code, refused.json()["detail"]) == (409, message)
    assert client.get(f"/v1/rooms/{room['id']}", headers=player(client)).status_code == 404
    assert len(client.get(f"/v1/rooms/{room['id']}", headers=organiser).json()["members"]) == 1


def test_quick_play_opens_an_empty_organiser_table(client):
    organiser = player(client)
    response = client.post("/v1/games/secret-santa/play", headers=organiser,
                           json={"request_id": str(uuid4())})
    assert response.status_code == 200, response.text
    room = response.json()
    assert room["status"] == "playing" and room["capacity"] == 1 and len(room["members"]) == 1
    assert room["game"]["detail"]["people"] == [] and room["game"]["detail"]["drawn"] is False
    assert {action["action"]["type"] for action in room["game"]["actions"]} == {
        "add_name", "add_group", "set_title", "set_location", "set_budget", "set_day", "clear"}
    assert client.get("/v1/games").json()[-1]["id"] == "secret-santa"
