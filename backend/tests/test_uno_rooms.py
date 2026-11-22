"""Uno rooms through HTTP and Postgres: the stacking setting and older saved data."""

from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from room_helpers import player, require_isolated, seated_room

from app.db import sessions
from app.games.registry import ENGINES
from app.main import app
from app.models import Match, Room


@pytest.fixture
def client():
    require_isolated()
    with TestClient(app) as client:
        yield client


def create(client, header, game, settings=None):
    return client.post(
        "/v1/rooms",
        headers=header,
        json={
            "name": "Host", "game_id": game, "capacity": 2, "room_name": "Stacking table",
            **({"settings": settings} if settings is not None else {}),
        },
    )


def begin(client, room, headers):
    path = f"/v1/rooms/{room['id']}"
    joined = client.post(
        "/v1/rooms/join", headers=headers[1], json={"invite": room["code"], "name": "Guest"}
    )
    assert joined.status_code == 200, joined.text
    for header in headers:
        assert client.put(path + "/ready", headers=header, json={"ready": True}).status_code == 200
    started = client.post(path + "/start", headers=headers[0])
    assert started.status_code == 200, started.text
    return started.json()


@pytest.mark.parametrize(
    "game,chosen,expected",
    [
        ("uno", None, False),
        ("uno", {"stack_draws": True}, True),
        ("uno-no-mercy", None, True),
        ("uno-no-mercy", {"stack_draws": False}, False),
    ],
)
def test_room_setup_saves_the_toggle_and_the_table_reports_it(client, game, chosen, expected):
    headers = [player(client), player(client)]
    response = create(client, headers[0], game, chosen)
    assert response.status_code == 201, response.text
    room = response.json()
    assert room["settings"]["stack_draws"] is expected
    started = begin(client, room, headers)
    assert started["game"]["detail"]["stacking"] is expected
    assert started["game"]["detail"]["missing_turn"] == []
    # The in-room options dialog saves the same key after the match is abandoned or finished.
    assert "stack_draw_two" not in room["settings"]


def test_the_retired_key_is_not_a_new_room_option_and_settings_can_be_changed(client):
    header = player(client)
    assert create(client, header, "uno", {"stack_draw_two": True}).status_code == 422
    room = create(client, header, "uno", {"stack_draws": True}).json()
    path = f"/v1/rooms/{room['id']}/settings"
    changed = client.put(
        path, headers=header,
        json={"game_id": "uno-no-mercy", "capacity": 2, "settings": {"stack_draws": False}},
    )
    assert changed.status_code == 200, changed.text
    assert changed.json()["settings"] == {"stack_draws": False}


def test_a_room_saved_with_the_old_setting_starts_a_stacking_match(client):
    headers = [player(client), player(client)]
    room = create(client, headers[0], "uno").json()
    with sessions()() as db, db.begin():
        db.get(Room, room["id"]).settings = {"stack_draw_two": True, "seven_zero": False}
    started = begin(client, room, headers)
    assert started["settings"] == {"stack_draw_two": True, "seven_zero": False}
    assert started["game"]["detail"]["stacking"] is True


def test_a_match_saved_before_the_change_still_loads_and_plays(client):
    room, headers = seated_room(client, "uno", 2)
    with sessions()() as db, db.begin():
        match = db.get(Match, room["match_id"])
        state = ENGINES["uno"].copy(match.state)
        # What the previous engine persisted: the old key, no mark and no "missed" list.
        state["settings"] = {"stack_draw_two": True, "seven_zero": False}
        state.pop("missing")
        (state.get("last_event") or {}).pop("missed", None)
        state.update(pending=None, penalty=0, penalty_floor=0)
        match.state = state
    path = f"/v1/rooms/{room['id']}"
    for header in headers:
        saved = client.get(path, headers=header)
        assert saved.status_code == 200, saved.text
        assert saved.json()["game"]["detail"]["stacking"] is True
        assert saved.json()["game"]["detail"]["missing_turn"] == []
    views = [client.get(path, headers=header).json() for header in headers]
    index = next(i for i, view in enumerate(views) if view["game"]["actions"])
    moved = client.post(
        path + "/actions", headers=headers[index],
        json={
            "match_id": room["match_id"], "expected_version": views[index]["match_version"],
            "action_id": str(uuid4()), "action": views[index]["game"]["actions"][0]["action"],
        },
    )
    assert moved.status_code == 200, moved.text
    with sessions()() as db:
        assert db.get(Match, room["match_id"]).state["missing"] == []
