"""Secret Santa: the organiser's list, the exclusion rules, the draw and its secrecy."""

import base64
import json
import logging
import random
from collections import Counter

import pytest
from test_playthroughs import choose

from app.bots import supports_bots
from app.core.contracts import Action, RuleError
from app.games.registry import ENGINES
from app.games.secret_santa.engine import SecretSantaEngine
from app.main import HidePrivateLinks
from app.rooms.public_history import LABELS, public_move
from app.rooms.santa_links import link_token, opens, read_token

ENGINE = ENGINES["secret-santa"]
HOST = "organiser"
EVERY_ACTION = {
    "add_name", "rename", "remove_name", "set_exclusions", "add_group", "rename_group",
    "remove_group", "set_group", "set_title", "set_location", "set_budget", "set_day",
    "clear", "draw", "reveal", "hide", "redraw", "finish",
}
DETAIL_KEYS = {
    "title", "day", "location", "budget", "people", "pairs", "groups", "drawn",
    "draw_number", "can_draw", "blocked", "showing", "limits",
}


def act(state, kind, **fields):
    return ENGINE.apply_action(state, HOST, Action(type=kind, **fields))


def table(*names, seed=5):
    state = ENGINE.setup([HOST], {}, seed=seed)
    for name in names:
        state = act(state, "add_name", choice=name)
    return state


def detail(state):
    return ENGINE.project_view(state, HOST).detail


def offered(state):
    return {option.action.type for option in ENGINE.legal_actions(state, HOST)}


def refused(state, kind, **fields):
    """The action is rejected and the saved state is untouched."""
    before = json.dumps(state, sort_keys=True)
    with pytest.raises(RuleError):
        act(state, kind, **fields)
    assert json.dumps(state, sort_keys=True) == before


def assert_fair_draw(state):
    """A permutation where nobody draws themselves, an excluded person or a group mate."""
    people = [person["id"] for person in state["people"]]
    assignment = state["assignment"]
    assert sorted(assignment) == sorted(assignment.values()) == sorted(people)
    for giver, recipient in assignment.items():
        assert giver != recipient
        assert sorted([giver, recipient]) not in state["pairs"]
        assert not any({giver, recipient} <= set(group["members"]) for group in state["groups"])


def test_manifest_is_a_solo_organiser_table_without_bots_or_scores():
    manifest = ENGINE.manifest
    assert (manifest.id, manifest.name, manifest.family) == ("secret-santa", "Secret Santa", "organiser")
    assert (manifest.play_mode, manifest.min_players, manifest.max_players) == ("solo", 1, 1)
    assert manifest.score_order == "none" and not manifest.settings
    assert not supports_bots("secret-santa") and not manifest.bots_supported
    with pytest.raises(RuleError):
        ENGINE.setup([HOST, "second"], {})


def test_opening_view_has_exactly_the_agreed_detail_and_only_the_organiser_sees_it():
    state = ENGINE.setup([HOST], {}, seed=1)
    view = ENGINE.project_view(state, HOST)
    assert set(view.detail) == DETAIL_KEYS
    assert view.detail == {
        "title": "Secret Santa", "day": None, "location": "", "budget": "", "people": [],
        "pairs": [], "groups": [], "drawn": False, "draw_number": 0, "can_draw": False,
        "blocked": "Add at least 3 people.", "showing": None,
        "limits": {"people": 30, "groups": 8, "name": 30, "title": 60, "location": 80, "budget": 30},
    }
    assert view.phase == "setup" and view.current_player == HOST
    assert view.message == "Add the people taking part."
    assert offered(state) == {"add_name", "add_group", "set_title", "set_location",
                              "set_budget", "set_day", "clear"}
    stranger = ENGINE.project_view(state, "stranger")
    assert stranger.detail == {} and stranger.actions == [] and stranger.message == ""
    assert stranger.current_player is None and ENGINE.legal_actions(state, "stranger") == []
    refused(state, "add_name", choice="Asha", target="p1")  # a field the option never carries


def test_names_are_trimmed_limited_and_numbered_when_they_repeat():
    state = table("  Sam  ", "sam", "SAM", "Sam (2)")
    assert [p["name"] for p in state["people"]] == ["Sam", "sam (2)", "SAM (3)", "Sam (2) (2)"]
    assert [p["id"] for p in state["people"]] == ["p1", "p2", "p3", "p4"]
    for blank in ("", "   ", "​", "\n\t"):
        refused(state, "add_name", choice=blank)
    refused(state, "add_name", choice="x" * 31)
    longest = "N" * 30
    state = act(act(state, "add_name", choice=longest), "add_name", choice=longest)
    assert [p["name"] for p in state["people"]][-2:] == [longest, "N" * 26 + " (2)"]
    assert all(len(p["name"]) <= 30 for p in state["people"])
    tidy = act(state, "add_name", choice="  Mary\tAnn\n\x00 Lee ")
    assert tidy["people"][-1]["name"] == "Mary Ann Lee"


def test_rename_keeps_the_id_and_never_collides_with_someone_else():
    state = table("Asha", "Ben", "Chen")
    state = act(state, "set_exclusions", target="p1", cards=["p2"])
    renamed = act(state, "rename", target="p1", choice="ASHA")
    assert renamed["people"][0] == {"id": "p1", "name": "ASHA"}  # their own name, recased
    clash = act(renamed, "rename", target="p1", choice="ben")
    assert clash["people"][0] == {"id": "p1", "name": "ben (2)"}
    assert clash["pairs"] == [["p1", "p2"]]
    refused(state, "rename", target="p9", choice="Nobody")
    refused(state, "rename", target="p1", choice="x" * 31)
    refused(state, "rename", target="p1", choice=" ")


def test_removing_someone_drops_their_exclusions_and_group_places_and_ids_are_not_reused():
    state = table("Asha", "Ben", "Chen", "Dara")
    state = act(state, "set_exclusions", target="p2", cards=["p1", "p3"])
    state = act(state, "set_exclusions", target="p3", cards=["p2", "p4"])
    state = act(act(state, "add_group", choice="Flat 2"), "set_group", target="g1", cards=["p2", "p4"])
    assert state["pairs"] == [["p1", "p2"], ["p2", "p3"], ["p3", "p4"]]
    state = act(state, "remove_name", target="p2")
    assert [p["id"] for p in state["people"]] == ["p1", "p3", "p4"]
    assert state["pairs"] == [["p3", "p4"]]
    assert state["groups"] == [{"id": "g1", "label": "Flat 2", "members": ["p4"]}]
    state = act(state, "add_name", choice="Eli")
    assert state["people"][-1] == {"id": "p5", "name": "Eli"}
    refused(state, "remove_name", target="p2")


def test_exclusions_replace_one_persons_whole_list_and_cut_both_ways():
    state = table("Asha", "Ben", "Chen", "Dara")
    option = next(o for o in ENGINE.legal_actions(state, HOST)
                  if o.action.type == "set_exclusions" and o.action.target == "p3")
    assert option.input == "cards" and option.eligible_cards == ["p1", "p2", "p4"]
    state = act(state, "set_exclusions", target="p3", cards=["p4", "p1"])
    assert detail(state)["pairs"] == [["p1", "p3"], ["p3", "p4"]]
    # Set from the other side: the same pair, stored once.
    state = act(state, "set_exclusions", target="p1", cards=["p3", "p2"])
    assert detail(state)["pairs"] == [["p1", "p2"], ["p1", "p3"], ["p3", "p4"]]
    # A new list for Chen replaces every pair Chen was in and leaves the rest.
    state = act(state, "set_exclusions", target="p3", cards=["p2"])
    assert detail(state)["pairs"] == [["p1", "p2"], ["p2", "p3"]]
    assert act(state, "set_exclusions", target="p2", cards=[])["pairs"] == []
    for wrong in (["p3"], ["p9"], ["p1", "p1"], ["p1", "p3"], ["g1"]):
        refused(state, "set_exclusions", target="p3", cards=wrong)
    refused(state, "set_exclusions", target="p9", cards=["p1"])
    alone = table("Asha")
    assert "set_exclusions" not in offered(alone)


def test_groups_are_limited_named_once_and_take_a_complete_member_list():
    state = table("Asha", "Ben", "Chen")
    for label in ("Flat 2", "flat 2", "The Okafors"):
        state = act(state, "add_group", choice=f" {label} ")
    assert [g["label"] for g in state["groups"]] == ["Flat 2", "flat 2 (2)", "The Okafors"]
    assert [g["id"] for g in state["groups"]] == ["g1", "g2", "g3"]
    state = act(state, "set_group", target="g1", cards=["p3", "p1"])
    assert detail(state)["groups"][0] == {"id": "g1", "label": "Flat 2", "members": ["p1", "p3"]}
    state = act(state, "set_group", target="g1", cards=["p2"])
    assert state["groups"][0]["members"] == ["p2"]
    for wrong in (["p9"], ["p1", "p1"], ["g1"]):
        refused(state, "set_group", target="g1", cards=wrong)
    refused(state, "set_group", target="g9", cards=["p1"])
    refused(state, "add_group", choice="x" * 31)
    state = act(state, "rename_group", target="g2", choice="The Okafors")
    assert state["groups"][1]["label"] == "The Okafors (2)"
    state = act(state, "remove_group", target="g1")
    assert [g["id"] for g in state["groups"]] == ["g2", "g3"]
    refused(state, "remove_group", target="g1")
    for index in range(6):
        state = act(state, "add_group", choice=f"Group {index}")
    assert len(state["groups"]) == 8 and state["groups"][-1]["id"] == "g9"
    assert "add_group" not in offered(state)
    refused(state, "add_group", choice="One too many")


def test_at_most_thirty_people():
    state = table(*[f"Person {index}" for index in range(30)])
    assert len(state["people"]) == 30 and "add_name" not in offered(state)
    refused(state, "add_name", choice="Thirty-one")
    assert detail(state)["can_draw"] is True


def test_event_details_are_limited_and_can_be_cleared_before_and_after_the_draw():
    state = table("Asha", "Ben", "Chen")
    state = act(state, "set_title", choice="  Office   party ")
    state = act(state, "set_location", choice="The Crown, upstairs")
    state = act(state, "set_budget", choice="£15")
    state = act(state, "set_day", amount=2545)
    assert {k: detail(state)[k] for k in ("title", "day", "location", "budget")} == {
        "title": "Office party", "day": 2545, "location": "The Crown, upstairs", "budget": "£15"}
    for kind, limit in (("set_title", 60), ("set_location", 80), ("set_budget", 30)):
        assert act(state, kind, choice="x" * limit)
        refused(state, kind, choice="x" * (limit + 1))
        refused(state, kind, choice="  ")
    assert act(state, "set_day", amount=0)["day"] == 0
    assert act(state, "set_day", amount=40000)["day"] == 40000
    refused(state, "set_day", amount=40001)
    refused(state, "clear", target="title")
    drawn = act(state, "draw")
    drawn = act(act(drawn, "set_location", choice="Moved to the Swan"), "set_day", amount=2546)
    assert (drawn["location"], drawn["day"], drawn["phase"]) == ("Moved to the Swan", 2546, "drawn")
    for field, empty in (("day", None), ("location", ""), ("budget", "")):
        drawn = act(drawn, "clear", target=field)
        assert drawn[field] == empty
    assert drawn["title"] == "Office party" and drawn["assignment"] == act(state, "draw")["assignment"]


def test_draw_is_blocked_with_a_plain_reason_until_a_complete_draw_exists():
    state = table("Asha", "Ben")
    assert (detail(state)["can_draw"], detail(state)["blocked"]) == (False, "Add at least 3 people.")
    assert "draw" not in offered(state)
    refused(state, "draw")
    state = act(state, "add_name", choice="Chen")
    assert (detail(state)["can_draw"], detail(state)["blocked"]) == (True, None)
    assert "draw" in offered(state)
    assert ENGINE.project_view(state, HOST).message == "Ready when you are. Draw the names."

    # One person with nobody left: excluded from one, in a group with the other.
    stuck = act(state, "set_exclusions", target="p1", cards=["p2"])
    stuck = act(act(stuck, "add_group", choice="Flat"), "set_group", target="g1", cards=["p1", "p3"])
    reason = "Asha has nobody left to draw. Remove an exclusion or a group."
    assert (detail(stuck)["can_draw"], detail(stuck)["blocked"]) == (False, reason)
    assert ENGINE.project_view(stuck, HOST).message == reason
    refused(stuck, "draw")
    assert detail(act(stuck, "remove_group", target="g1"))["blocked"] != reason


def test_draw_is_blocked_when_everyone_has_a_candidate_but_no_complete_draw_exists():
    # Asha and Ben may each draw only Chen, so one of them is always left over.
    state = act(table("Asha", "Ben", "Chen"), "set_exclusions", target="p1", cards=["p2"])
    assert detail(state)["blocked"] == (
        "Asha and Ben can only draw 1 person between them. Remove an exclusion or a group.")
    refused(state, "draw")

    # Two households of three and two: the three can only draw the two.
    state = table("Asha", "Ben", "Chen", "Dara", "Eli")
    state = act(act(state, "add_group", choice="Three"), "set_group", target="g1", cards=["p1", "p2", "p3"])
    state = act(act(state, "add_group", choice="Two"), "set_group", target="g2", cards=["p4", "p5"])
    assert detail(state)["can_draw"] is False
    assert detail(state)["blocked"] == (
        "Asha, Ben and Chen can only draw 2 people between them. Remove an exclusion or a group.")
    refused(state, "draw")
    # Moving one person out of the larger household makes a draw possible.
    fixed = act(state, "set_group", target="g1", cards=["p1", "p2"])
    assert detail(fixed)["blocked"] is None
    assert_fair_draw(act(fixed, "draw"))

    # A larger crowd is described without a list of names.
    big = table(*"ABCDEFGHIJK")
    big = act(act(big, "add_group", choice="Six"), "set_group", target="g1",
              cards=["p1", "p2", "p3", "p4", "p5", "p6"])
    assert detail(big)["blocked"] == (
        "These exclusions leave no way for everyone to draw a name. Remove an exclusion or a group.")


@pytest.mark.parametrize("seed", range(120))
def test_every_draw_is_a_complete_draw_that_breaks_no_rule(seed):
    chooser = random.Random(seed)
    names = [f"Person {index}" for index in range(chooser.randint(3, 30))]
    state = table(*names, seed=seed)
    people = [p["id"] for p in state["people"]]
    for group in range(chooser.randint(0, 4)):
        state = act(state, "add_group", choice=f"Group {group}")
        members = chooser.sample(people, chooser.randint(0, min(4, len(people))))
        state = act(state, "set_group", target=state["groups"][-1]["id"], cards=members)
    for person in chooser.sample(people, min(len(people), 6)):
        others = [p for p in people if p != person]
        state = act(state, "set_exclusions", target=person,
                    cards=chooser.sample(others, chooser.randint(0, min(3, len(others)))))
    view = ENGINE.project_view(state, HOST)
    assert view.detail["can_draw"] == ("draw" in offered(state)) == (view.detail["blocked"] is None)
    if not view.detail["can_draw"]:
        refused(state, "draw")
        return
    drawn = act(state, "draw")
    assert drawn["phase"] == "drawn" and drawn["draw_number"] == 1
    assert_fair_draw(drawn)


def test_a_list_with_exactly_two_possible_draws_is_still_drawn_and_both_turn_up():
    # Ten people in a ring: each may draw only the next or the previous person,
    # so the only complete draws are "everyone gives clockwise" and the reverse.
    # A random order almost never fits, which exercises the matching fallback.
    names = [f"Person {index}" for index in range(10)]
    seen = Counter()
    for seed in range(40):
        state = table(*names, seed=seed)
        ids = [p["id"] for p in state["people"]]
        for index, person in enumerate(ids):
            near = {ids[index - 1], ids[(index + 1) % 10]}
            state = act(state, "set_exclusions", target=person,
                        cards=[p for p in ids if p != person and p not in near])
        assert detail(state)["can_draw"] is True
        drawn = act(state, "draw")
        assert_fair_draw(drawn)
        seen["clockwise" if drawn["assignment"]["p1"] == "p2" else "anticlockwise"] += 1
    assert set(seen) == {"clockwise", "anticlockwise"} and min(seen.values()) >= 10


def test_the_draw_is_fair_across_every_possible_outcome():
    # Four people have exactly nine complete draws (the derangements of four,
    # two-person swaps included). Over 1800 private seeds each should turn up
    # about 200 times; a draw biased by typing order would miss this band.
    seen = Counter()
    for seed in range(1800):
        drawn = act(table("Asha", "Ben", "Chen", "Dara", seed=seed), "draw")
        assert_fair_draw(drawn)
        seen[tuple(drawn["assignment"][p] for p in ("p1", "p2", "p3", "p4"))] += 1
    assert len(seen) == 9
    assert ("p2", "p1", "p4", "p3") in seen  # two swaps is a legitimate draw
    assert min(seen.values()) >= 150 and max(seen.values()) <= 250, sorted(seen.values())
    # Each person is drawn by each of the other three about a third of the time.
    for giver in range(4):
        counts = Counter()
        for outcome, count in seen.items():
            counts[outcome[giver]] += count
        assert len(counts) == 3 and min(counts.values()) >= 520, counts


def test_the_draw_comes_from_the_private_number_never_from_the_request():
    base = table("Asha", "Ben", "Chen", "Dara", "Eli", "Fay", seed=11)
    assert act(base, "draw") == act(base, "draw")  # the same saved state draws the same way
    assert len({json.dumps(act(table(*"ABCDEF", seed=seed), "draw")["assignment"])
                for seed in range(30)}) > 20
    for extra in ({"choice": "p2"}, {"cards": ["p2", "p1"]}, {"target": "p1"}, {"amount": 7}):
        refused(base, "draw", **extra)


def test_redraw_returns_to_the_list_keeps_everything_typed_and_numbers_the_next_draw():
    state = table("Asha", "Ben", "Chen", "Dara", "Eli", seed=3)
    state = act(state, "set_exclusions", target="p1", cards=["p2"])
    state = act(act(state, "add_group", choice="Flat"), "set_group", target="g1", cards=["p3", "p4"])
    state = act(act(state, "set_location", choice="The Crown"), "set_day", amount=2545)
    first = act(act(state, "draw"), "reveal", target="p2")
    assert (first["draw_number"], first["opened"], first["showing"]) == (1, ["p2"], "p2")
    assert not offered(first) & {"add_name", "rename", "remove_name", "set_exclusions",
                                 "add_group", "rename_group", "remove_group", "set_group", "draw"}
    back = act(first, "redraw")
    assert (back["phase"], back["assignment"], back["opened"], back["showing"]) == ("setup", {}, [], None)
    for key in ("people", "pairs", "groups", "title", "day", "location", "budget"):
        assert back[key] == state[key]
    assert detail(back)["drawn"] is False and detail(back)["draw_number"] == 1
    assert all(not person["opened"] for person in detail(back)["people"])
    assert SecretSantaEngine.private_draw(back, "p1") is None
    second = act(back, "draw")
    assert second["draw_number"] == 2 and detail(second)["draw_number"] == 2
    assert_fair_draw(second)
    # Across many tables the second draw is not a copy of the first.
    changed = 0
    for seed in range(20):
        one = act(table(*"ABCDEF", seed=seed), "draw")
        changed += act(act(one, "redraw"), "draw")["assignment"] != one["assignment"]
    assert changed >= 15


def test_the_organisers_view_never_depends_on_who_drew_whom():
    names = ["Asha-canary", "Ben-canary", "Chen-canary", "Dara-canary", "Eli-canary"]
    drawn = act(table(*names, seed=8), "draw")
    view = ENGINE.project_view(drawn, HOST)
    wire = view.model_dump_json()
    assert '"assignment"' not in wire and '"seed"' not in wire and '"deck"' not in wire
    assert view.detail["showing"] is None and "recipient" not in wire
    assert set(view.detail) == DETAIL_KEYS and view.detail["drawn"] is True
    assert view.message == "Names are drawn. Share each person's link."
    # A different draw of the same list is indistinguishable from this screen.
    ids = [p["id"] for p in drawn["people"]]
    for shift in (1, 2, 3):
        other = {**drawn, "assignment": {ids[i]: ids[(i + shift) % 5] for i in range(5)}}
        assert ENGINE.project_view(other, HOST).model_dump_json() == wire
    assert ENGINE.project_view(drawn, "stranger").model_dump_json().count("canary") == 0
    # Each name appears as a person and in that person's own button, nowhere else.
    for name in names:
        assert wire.count(name) == 2


def test_reveal_shows_exactly_one_recipient_until_hidden():
    names = ["Asha-canary", "Ben-canary", "Chen-canary", "Dara-canary"]
    drawn = act(table(*names, seed=4), "draw")
    quiet = ENGINE.project_view(drawn, HOST).model_dump_json()
    assert "hide" not in offered(drawn)
    refused(drawn, "hide")
    refused(drawn, "reveal", target="p9")
    shown = act(drawn, "reveal", target="p3")
    name_of = {p["id"]: p["name"] for p in shown["people"]}
    view = ENGINE.project_view(shown, HOST)
    recipient = name_of[shown["assignment"]["p3"]]
    assert view.detail["showing"] == {
        "giver": "p3", "giver_name": "Chen-canary", "recipient_name": recipient}
    assert [p["opened"] for p in view.detail["people"]] == [False, False, True, False]
    assert view.message == "Showing one name. Hide it before you pass the phone on."
    wire = view.model_dump_json()
    # Only the shown pair is added to the quiet screen; every other recipient stays out.
    assert wire.count(recipient) == quiet.count(recipient) + 1
    assert wire.count("Chen-canary") == quiet.count("Chen-canary") + 1
    for other in set(names) - {recipient, "Chen-canary"}:
        assert wire.count(other) == quiet.count(other)
    assert '"assignment"' not in wire
    # Showing the next person replaces the first; both stay marked as having looked.
    moved = act(shown, "reveal", target="p1")
    assert detail(moved)["showing"]["giver"] == "p1" and moved["opened"] == ["p3", "p1"]
    again = act(moved, "reveal", target="p3")
    assert again["opened"] == ["p3", "p1"]
    hidden = act(again, "hide")
    assert detail(hidden)["showing"] is None and "hide" not in offered(hidden)
    assert [p["opened"] for p in detail(hidden)["people"]] == [True, False, True, False]
    assert "recipient" not in ENGINE.project_view(hidden, HOST).model_dump_json()


def test_finish_ends_the_table_with_no_winner_no_score_and_no_actions():
    drawn = act(act(table("Asha", "Ben", "Chen", seed=2), "draw"), "reveal", target="p1")
    done = act(drawn, "finish")
    view = ENGINE.project_view(done, HOST)
    assert (done["phase"], done["winners"], done["showing"]) == ("finished", [], None)
    assert view.current_player is None and view.actions == [] and view.winners == []
    assert [p.score for p in view.players] == [0] and ENGINE.outcome(done) == []
    assert view.detail["drawn"] is True and view.detail["showing"] is None
    assert [p["opened"] for p in view.detail["people"]] == [True, False, False]
    assert "recipient" not in view.model_dump_json()
    assert ENGINE.legal_actions(done, HOST) == []
    for kind in ("redraw", "finish", "hide", "draw"):
        refused(done, kind)
    refused(done, "reveal", target="p1")
    refused(done, "set_title", choice="Too late")
    # Private links still resolve from a finished table.
    assert SecretSantaEngine.private_draw(done, "p2")["giver_name"] == "Ben"


def test_rejected_actions_never_change_the_saved_state():
    state = table("Asha", "Ben", "Chen")
    refused(state, "invented")
    refused(state, "reveal", target="p1")  # nothing is drawn yet
    refused(state, "redraw")
    refused(state, "finish")
    refused(state, "add_name")
    refused(state, "set_day", amount=3, choice="tomorrow")
    with pytest.raises(RuleError):
        ENGINE.apply_action(state, "stranger", Action(type="add_name", choice="Mallory"))
    drawn = act(state, "draw")
    for kind in ("add_name", "add_group"):
        refused(drawn, kind, choice="Late")
    refused(drawn, "remove_name", target="p1")
    refused(drawn, "set_exclusions", target="p1", cards=["p2"])
    refused(drawn, "draw")


def test_private_draw_and_opened_mark_are_pure_and_only_exist_after_a_draw():
    state = table("Asha", "Ben", "Chen", seed=6)
    state = act(act(state, "set_title", choice="Team gifts"), "set_location", choice="Room 4")
    state = act(act(state, "set_budget", choice="£10"), "set_day", amount=2550)
    assert SecretSantaEngine.private_draw(state, "p1") is None
    assert SecretSantaEngine.mark_opened(state, "p1") is None
    assert not SecretSantaEngine.is_drawn(state)
    drawn = act(state, "draw")
    saved = json.dumps(drawn, sort_keys=True)
    name_of = {p["id"]: p["name"] for p in drawn["people"]}
    for person in ("p1", "p2", "p3"):
        assert SecretSantaEngine.private_draw(drawn, person) == {
            "title": "Team gifts", "day": 2550, "location": "Room 4", "budget": "£10",
            "giver_name": name_of[person],
            "recipient_name": name_of[drawn["assignment"][person]],
        }
    assert SecretSantaEngine.private_draw(drawn, "p9") is None
    assert SecretSantaEngine.mark_opened(drawn, "p9") is None
    opened = SecretSantaEngine.mark_opened(drawn, "p2")
    assert opened is not None and opened["opened"] == ["p2"]
    assert json.dumps(drawn, sort_keys=True) == saved  # the input is left alone
    assert {k: v for k, v in opened.items() if k != "opened"} == {
        k: v for k, v in drawn.items() if k != "opened"}
    assert SecretSantaEngine.mark_opened(opened, "p2") is None  # once
    assert [p["opened"] for p in detail(opened)["people"]] == [False, True, False]


@pytest.mark.parametrize("seed", range(25))
def test_random_legal_edits_never_fail_and_the_table_can_always_finish(seed):
    state = ENGINE.setup([HOST], {}, seed=seed)
    chooser = random.Random(seed)
    used = set()
    for _ in range(3000):
        if state["phase"] == "finished":
            break
        view = ENGINE.project_view(state, HOST)
        assert view.actions and len({p["name"].casefold() for p in view.detail["people"]}) == len(
            view.detail["people"])
        if state["phase"] == "drawn":
            assert_fair_draw(state)
        action = choose(view, chooser)
        used.add(action.type)
        state = ENGINE.apply_action(state, HOST, action)
    assert state["phase"] == "finished"
    assert used <= EVERY_ACTION and {"draw", "finish"} <= used


def test_history_labels_cover_every_action_and_copy_nothing_that_was_typed():
    assert set(LABELS["secret-santa"]) == EVERY_ACTION
    state = act(table("Asha-canary", "Ben-canary", "Chen-canary"), "add_group", choice="Flat-canary")
    drawn = act(state, "draw")
    samples = [
        (state, Action(type="add_name", choice="Private-canary")),
        (state, Action(type="rename", target="p1", choice="Private-canary")),
        (state, Action(type="set_exclusions", target="p1", cards=["p2"])),
        (state, Action(type="set_group", target="g1", cards=["p1", "p2"])),
        (state, Action(type="set_location", choice="Private-canary Street")),
        (state, Action(type="set_day", amount=2545)),
        (state, Action(type="draw")),
        (drawn, Action(type="reveal", target="p2")),
        (drawn, Action(type="finish")),
    ]
    for before, action in samples:
        after = ENGINE.apply_action(before, HOST, action)
        views = ({HOST: ENGINE.project_view(before, HOST)}, {HOST: ENGINE.project_view(after, HOST)})
        event = public_move(*views, HOST, action, 7)
        assert event is not None and event.type == action.type
        assert event.label == LABELS["secret-santa"][action.type]
        assert (event.targets, event.cards, event.amount, event.count, event.destination) == (
            [], [], None, None, None)
        encoded = event.model_dump_json()
        assert "canary" not in encoded and '"p2"' not in encoded and "2545" not in encoded


MATCH = "0b8f6c1e-5a43-4f0e-9d53-1f2a6c7d8e90"
SECRET = "a-test-secret-that-is-long-enough-for-this"


def test_link_tokens_are_short_url_safe_and_bound_to_match_draw_person_and_key():
    token = link_token(SECRET, MATCH, 1, "p1")
    assert token == link_token(SECRET, MATCH, 1, "p1")
    assert 20 <= len(token) < 100 and set(token) <= set(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_")
    assert read_token(token) == (MATCH, "p1")
    assert read_token(link_token(SECRET, MATCH, 3, "p300")) == (MATCH, "p300")
    assert len(link_token(SECRET, MATCH, 9, "p70000")) < 100
    others = {
        link_token(SECRET, MATCH, 2, "p1"),  # a later draw
        link_token(SECRET, MATCH, 1, "p2"),  # another person
        link_token(SECRET, MATCH[:-1] + "1", 1, "p1"),  # another table
        link_token(SECRET + "x", MATCH, 1, "p1"),  # another key
    }
    assert len(others) == 4 and token not in others
    assert opens(token, token) and not any(opens(other, token) for other in others)
    # The token carries no name, no recipient and no key material in the clear.
    raw = base64.urlsafe_b64decode(token + "=" * (-len(token) % 4))
    assert len(raw) == 33 and SECRET.encode() not in raw


def test_malformed_tokens_name_nothing_and_respelled_tokens_do_not_open():
    token = link_token(SECRET, MATCH, 1, "p5")
    for bad in ("", "x", token[:-1], token + "A", token[:10], "!" * 44, "é" * 44,
                token[:-1] + "=", " " + token[1:], "A" * 43, "A" * 49, "A" * 200):
        assert read_token(bad) is None, bad
    # The same bytes with a padded person number read as p5 but are not the token.
    raw = base64.urlsafe_b64decode(token + "=" * (-len(token) % 4))
    padded = base64.urlsafe_b64encode(raw[:16] + b"\x00" + raw[16:]).rstrip(b"=").decode()
    assert read_token(padded) == (MATCH, "p5") and not opens(padded, token)
    # A person number swapped under someone else's signature names them, and fails.
    swapped = base64.urlsafe_b64encode(raw[:16] + b"\x06" + raw[17:]).rstrip(b"=").decode()
    assert read_token(swapped) == (MATCH, "p6")
    assert not opens(swapped, link_token(SECRET, MATCH, 1, "p6"))


def test_access_log_keeps_the_route_and_drops_the_private_link():
    token = link_token(SECRET, MATCH, 1, "p1")
    record = logging.LogRecord(
        "uvicorn.access", logging.INFO, __file__, 1, '%s - "%s %s HTTP/%s" %d',
        ("127.0.0.1:5000", "GET", f"/v1/secret-santa/{token}?x=1", "1.1", 200), None)
    assert HidePrivateLinks().filter(record) is True
    line = record.getMessage()
    assert token not in line and '"GET /v1/secret-santa/[link]?x=1 HTTP/1.1" 200' in line
    other = logging.LogRecord(
        "uvicorn.access", logging.INFO, __file__, 1, '%s - "%s %s HTTP/%s" %d',
        ("127.0.0.1:5000", "GET", "/v1/rooms/abc/secret-santa/links", "1.1", 200), None)
    HidePrivateLinks().filter(other)
    assert "/v1/rooms/abc/secret-santa/links" in other.getMessage()
    assert any(isinstance(item, HidePrivateLinks)
               for item in logging.getLogger("uvicorn.access").filters)
