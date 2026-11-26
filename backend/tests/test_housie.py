"""Housie: ticket shape, the hidden call order, claims, shares and the finish."""

import json
from random import Random

import pytest

from app.bots import choose_action
from app.core.contracts import Action, RuleError
from app.games.housie.engine import COLUMNS, PRIZES, HousieEngine, make_ticket, ticket_numbers
from app.models import Member
from app.rooms.bots import BOT_DELAY_SECONDS, BOT_REVIEW_DELAY_SECONDS, bot_delay, next_bot_view
from app.rooms.public_history import public_move

ENGINE = HousieEngine()
DETAIL_KEYS = {"ticket", "marked", "called", "last_called", "auto_mark", "prizes", "claimable"}
# Two tickets built by hand: valid shape, no number in common.
TICKET_A = [
    [1, 0, 21, 0, 41, 0, 61, 0, 81],
    [0, 12, 0, 32, 0, 52, 0, 72, 85],
    [5, 15, 25, 0, 45, 0, 0, 75, 0],
]
TICKET_B = [
    [2, 0, 22, 0, 42, 0, 62, 0, 82],
    [0, 13, 0, 33, 0, 53, 0, 73, 86],
    [6, 16, 26, 0, 46, 0, 0, 76, 0],
]


def start(players=("a", "b"), seed=7, **settings):
    return ENGINE.setup(list(players), settings, seed=seed)


def rigged(tickets, **settings):
    """A real opening with hand-written tickets, so a test can aim the calls."""
    state = start(tuple(tickets), **settings)
    state["tickets"] = {player: [list(row) for row in ticket] for player, ticket in tickets.items()}
    return state


def call(state, *numbers):
    """Have the caller draw exactly these numbers next, through legal actions."""
    for number in numbers:
        state = {**state, "bag": [n for n in state["bag"] if n != number] + [number]}
        state = ENGINE.apply_action(state, state["order"][state["turn"]], Action(type="call_number"))
    return state


def kinds(state, player):
    return [option.action.type for option in ENGINE.legal_actions(state, player)]


def claims(state, player):
    return [o.action.choice for o in ENGINE.legal_actions(state, player) if o.action.type == "claim"]


def claim(state, player, prize):
    return ENGINE.apply_action(state, player, Action(type="claim", choice=prize))


def winners(state, prize):
    return state["prizes"][prize]["winners"]


def test_manifest_is_the_documented_contract():
    manifest = ENGINE.manifest
    assert (manifest.id, manifest.name, manifest.family) == ("housie", "Housie", "housie")
    assert (manifest.min_players, manifest.max_players) == (2, 10)
    assert (manifest.minutes, manifest.icon, manifest.color) == ("10–25", "grid", "ochre")
    assert (manifest.play_mode, manifest.score_label, manifest.score_order) == (
        "competitive", "Points", "high")
    assert [(s.key, s.label, s.default) for s in manifest.settings] == [
        ("auto_mark", "Mark called numbers for me", True)]
    assert [(key, points) for key, _, points in PRIZES] == [
        ("early_five", 1), ("top_line", 2), ("middle_line", 2), ("bottom_line", 2),
        ("full_house", 5)]


@pytest.mark.parametrize("seed", range(250))
def test_every_ticket_has_the_traditional_shape(seed):
    ticket = make_ticket(Random(seed))
    assert len(ticket) == 3 and all(len(row) == 9 for row in ticket)
    numbers = ticket_numbers(ticket)
    assert len(numbers) == len(set(numbers)) == 15
    assert all(sum(bool(n) for n in row) == 5 for row in ticket)
    for column in range(9):
        held = [row[column] for row in ticket if row[column]]
        assert 1 <= len(held) <= 3
        assert all(number in COLUMNS[column] for number in held)
        assert held == sorted(held)


def test_columns_cover_one_to_ninety_once():
    covered = [number for column in COLUMNS for number in column]
    assert covered == list(range(1, 91))


def test_setup_deals_a_ticket_each_and_hides_one_shuffled_call_order():
    state = start(("a", "b", "c"))
    assert sorted(state["bag"]) == list(range(1, 91)) and state["bag"] != list(range(1, 91))
    assert set(state["tickets"]) == {"a", "b", "c"}
    assert state["called"] == [] and state["phase"] == "calling" and state["auto_mark"] is True
    assert start(("a", "b", "c")) == state
    assert start(("a", "b", "c"), seed=8)["bag"] != state["bag"]
    assert start(auto_mark=False)["auto_mark"] is False
    for count in (1, 11):
        with pytest.raises(RuleError):
            ENGINE.setup([f"p{i}" for i in range(count)], {})


def test_the_caller_rotates_and_ninety_numbers_never_repeat():
    state = start(("a", "b", "c"))
    order = []
    while state["phase"] == "calling":
        caller = state["order"][state["turn"]]
        assert ENGINE.project_view(state, "a").current_player == caller
        for player in state["order"]:
            assert ("call_number" in kinds(state, player)) == (player == caller)
        expected = state["bag"][-1]
        state = ENGINE.apply_action(state, caller, Action(type="call_number"))
        assert state["called"][-1] == expected
        order.append(caller)
    assert order[:6] == ["a", "b", "c", "a", "b", "c"] and len(order) == 90
    assert sorted(state["called"]) == list(range(1, 91)) and state["bag"] == []
    assert state["phase"] == "final_claims"


def test_auto_mark_marks_every_ticket_and_offers_no_mark_action():
    state = call(rigged({"a": TICKET_A, "b": TICKET_B}), 1, 2, 90, 21)
    assert state["marks"] == {"a": [1, 21], "b": [2]}
    assert "mark" not in kinds(state, "a") + kinds(state, "b")
    view = ENGINE.project_view(state, "a")
    assert view.detail["marked"] == [1, 21] and view.detail["called"] == [1, 2, 90, 21]
    assert view.detail["last_called"] == 21 and view.draw_count == 86
    assert [(p.id, p.count) for p in view.players] == [("a", 2), ("b", 1)]


def test_without_auto_mark_a_claim_counts_only_marked_numbers():
    state = call(rigged({"a": TICKET_A, "b": TICKET_B}, auto_mark=False), 1, 21, 41, 61, 81, 2)
    assert state["marks"] == {"a": [], "b": []}
    offered = [o.action for o in ENGINE.legal_actions(state, "a") if o.action.type == "mark"]
    assert [action.amount for action in offered] == [1, 21, 41, 61, 81]
    assert [o.action.amount for o in ENGINE.legal_actions(state, "b") if o.action.type == "mark"] == [2]
    assert claims(state, "a") == []  # five numbers are out, none is marked yet
    for number in (1, 21, 41, 61):
        state = ENGINE.apply_action(state, "a", Action(type="mark", amount=number))
        assert claims(state, "a") == []
    state = ENGINE.apply_action(state, "a", Action(type="mark", amount=81))
    assert claims(state, "a") == ["early_five", "top_line"]
    assert ENGINE.project_view(state, "a").message == "You can claim Early five, Top line."
    # Marking is the player's own job: a number not on the ticket, not yet called,
    # or already marked is refused.
    before = json.dumps(state, sort_keys=True)
    for number in (2, 5, 81, 90):
        with pytest.raises(RuleError):
            ENGINE.apply_action(state, "a", Action(type="mark", amount=number))
    assert json.dumps(state, sort_keys=True) == before


def test_a_prize_is_won_once_and_closes_on_the_next_call():
    state = call(rigged({"a": TICKET_A, "b": TICKET_B}), 1, 21, 41, 61, 81)
    assert claims(state, "a") == ["early_five", "top_line"] and claims(state, "b") == []
    state = claim(state, "a", "top_line")
    assert winners(state, "top_line") == ["a"] and state["scores"] == {"a": 2, "b": 0}
    assert state["prizes"]["top_line"]["call"] == 5
    assert claims(state, "a") == ["early_five"]  # never the same prize twice
    with pytest.raises(RuleError):
        claim(state, "a", "top_line")
    # b completes the same line later: the prize is gone.
    state = call(state, 2, 22, 42, 62, 82)
    assert claims(state, "b") == ["early_five"]
    with pytest.raises(RuleError):
        claim(state, "b", "top_line")
    assert winners(state, "top_line") == ["a"]


def test_two_claims_on_the_same_call_share_the_prize_in_full():
    state = call(rigged({"a": TICKET_A, "b": TICKET_A, "c": TICKET_B}), 5, 15, 25, 45, 75)
    assert claims(state, "a") == claims(state, "b") == ["early_five", "bottom_line"]
    state = claim(state, "b", "bottom_line")
    assert claims(state, "a") == ["early_five", "bottom_line"]  # still open on this call
    state = claim(state, "a", "bottom_line")
    assert winners(state, "bottom_line") == ["b", "a"]
    assert state["scores"] == {"a": 2, "b": 2, "c": 0}
    view = ENGINE.project_view(state, "c")
    prize = next(p for p in view.detail["prizes"] if p["key"] == "bottom_line")
    assert prize == {"key": "bottom_line", "label": "Bottom line", "points": 2,
                     "winners": ["b", "a"], "won_on_call": 5}


def test_a_share_is_lost_once_the_next_number_is_called():
    state = call(rigged({"a": TICKET_A, "b": TICKET_A}), 5, 15, 25, 45, 75)
    state = claim(state, "a", "early_five")
    state = call(state, 90)
    assert claims(state, "b") == ["bottom_line"]  # Early five closed, the line is still unwon


def test_an_unwon_prize_can_be_claimed_on_any_later_call():
    state = call(rigged({"a": TICKET_A, "b": TICKET_B}), 12, 32, 52, 72, 85, 90, 89, 88)
    assert claims(state, "a") == ["early_five", "middle_line"]
    state = claim(state, "a", "middle_line")
    assert state["prizes"]["middle_line"]["call"] == 8


def test_full_house_ends_the_match_and_the_highest_score_wins():
    state = rigged({"a": TICKET_A, "b": TICKET_B})
    state = call(state, *ticket_numbers(TICKET_B)[:5])
    state = claim(state, "b", "early_five")
    state = claim(state, "b", "top_line")
    state = call(state, *ticket_numbers(TICKET_A))
    assert claims(state, "a") == ["middle_line", "bottom_line", "full_house"]
    state = claim(state, "a", "full_house")
    assert state["phase"] == "finished" and winners(state, "full_house") == ["a"]
    assert state["scores"] == {"a": 5, "b": 3} and state["winners"] == ["a"]
    assert ENGINE.outcome(state) == ["a"]
    for player in ("a", "b"):
        assert ENGINE.legal_actions(state, player) == []
        view = ENGINE.project_view(state, player)
        assert view.current_player is None and view.winners == ["a"]
        assert view.detail["claimable"] == []
    with pytest.raises(RuleError):
        ENGINE.apply_action(state, "a", Action(type="call_number"))


def test_full_house_is_shared_with_every_ticket_complete_on_that_call_and_ties_share_the_win():
    state = call(rigged({"a": TICKET_A, "b": TICKET_A, "c": TICKET_B}), *ticket_numbers(TICKET_A))
    state = claim(state, "a", "full_house")
    assert state["phase"] == "finished" and winners(state, "full_house") == ["a", "b"]
    assert state["scores"] == {"a": 5, "b": 5, "c": 0} and state["winners"] == ["a", "b"]


def test_after_the_ninetieth_number_calling_stops_and_the_last_claim_finishes():
    state = start(("a", "b", "c"))
    while state["phase"] == "calling":
        state = ENGINE.apply_action(state, state["order"][state["turn"]], Action(type="call_number"))
    assert state["phase"] == "final_claims"
    for player in state["order"]:
        assert set(kinds(state, player)) == {"claim"}
        assert "full_house" in claims(state, player)
    assert ENGINE.project_view(state, "a").current_player in state["order"]
    state = claim(state, "c", "full_house")
    assert state["phase"] == "finished" and winners(state, "full_house") == ["c", "a", "b"]
    assert state["winners"] == ["a", "b", "c"]


def test_final_claims_without_auto_mark_never_leave_the_table_stuck():
    state = start(("a", "b"), auto_mark=False)
    while state["phase"] == "calling":
        state = ENGINE.apply_action(state, state["order"][state["turn"]], Action(type="call_number"))
    for _ in range(40):
        if state["phase"] == "finished":
            break
        actor = ENGINE.project_view(state, "a").current_player
        options = ENGINE.legal_actions(state, actor)
        assert options
        marks = [o for o in options if o.action.type == "mark"]
        state = ENGINE.apply_action(state, actor, (marks or options)[-1].action)
    assert state["phase"] == "finished"


def test_a_view_shows_only_its_own_ticket_and_never_the_call_order():
    state = call(start(("a", "b", "c")), *start(("a", "b", "c"))["bag"][-1:-9:-1])
    for viewer in state["order"]:
        view = ENGINE.project_view(state, viewer)
        assert set(view.detail) == DETAIL_KEYS
        assert view.detail["ticket"] == [[n or None for n in row] for row in state["tickets"][viewer]]
        wire = view.model_dump_json()
        assert '"bag"' not in wire and '"tickets"' not in wire and '"marks"' not in wire
        # Canary: reorder everything still to be called and replace every other
        # ticket. The viewer's bytes must not move.
        other = json.loads(json.dumps(state))
        other["bag"] = sorted(other["bag"])
        for index, player in enumerate(p for p in state["order"] if p != viewer):
            replacement = make_ticket(Random(1000 + index))
            keep = set(other["marks"][player])
            # Keep the public marked count; the numbers themselves are private.
            other["tickets"][player] = replacement
            other["marks"][player] = ticket_numbers(replacement)[: len(keep)]
        assert ENGINE.project_view(other, viewer).model_dump_json() == wire
    # Someone who is not seated sees the public table and nothing else.
    outside = ENGINE.project_view(state, "nobody")
    assert outside.detail["ticket"] == [] and outside.detail["marked"] == []
    assert outside.actions == [] and outside.detail["called"] == state["called"]


def test_rejected_actions_leave_the_state_untouched():
    state = call(rigged({"a": TICKET_A, "b": TICKET_B}), 1, 21)
    before = json.dumps(state, sort_keys=True)
    not_caller = "b" if state["order"][state["turn"]] == "a" else "a"
    for player, action in [
        (not_caller, Action(type="call_number")),
        ("a", Action(type="claim", choice="early_five")),
        ("a", Action(type="claim", choice="jackpot")),
        ("a", Action(type="mark", amount=1)),
        ("nobody", Action(type="call_number")),
        ("a", Action(type="invented")),
    ]:
        with pytest.raises(RuleError):
            ENGINE.apply_action(state, player, action)
    assert json.dumps(state, sort_keys=True) == before


def test_messages_speak_to_each_seat():
    state = rigged({"a": TICKET_A, "b": TICKET_B}, auto_mark=False)
    assert ENGINE.project_view(state, "a").message == "Call the next number."
    assert ENGINE.project_view(state, "b").message == "Wait for the next number."
    state = call(state, 2)
    assert ENGINE.project_view(state, "b").message == "Mark 2 on your ticket."


def history(state, actor, action, version=2):
    people = state["order"]
    before = {p: ENGINE.project_view(state, p) for p in people}
    after_state = ENGINE.apply_action(state, actor, action)
    after = {p: ENGINE.project_view(after_state, p) for p in people}
    return after_state, public_move(before, after, actor, action, version)


def test_history_names_the_called_number_and_the_prize_and_nothing_private():
    state = rigged({"a": TICKET_A, "b": TICKET_B}, auto_mark=False)
    state = {**state, "bag": [n for n in state["bag"] if n != 41] + [41]}
    state, event = history(state, "a", Action(type="call_number"))
    assert (event.type, event.label) == ("call_number", "Called 41")
    assert event.cards == [] and event.amount is None and event.count is None
    state, event = history(state, "a", Action(type="mark", amount=41))
    assert event.label == "Marked a number" and "41" not in event.model_dump_json()
    state = call(state, 1, 21, 61, 81)
    for number in (1, 21, 61, 81):
        state = ENGINE.apply_action(state, "a", Action(type="mark", amount=number))
    state, event = history(state, "a", Action(type="claim", choice="top_line"), version=9)
    assert event.label == "Claimed Top line" and event.targets == []
    # A label never trusts a number that not every seat can see.
    views = {p: ENGINE.project_view(state, p) for p in state["order"]}
    odd = {**views, "b": views["b"].model_copy(update={"detail": {**views["b"].detail, "last_called": 7}})}
    assert public_move(views, odd, "a", Action(type="call_number"), 3).label == "Called a number"


def test_bot_marks_then_claims_small_prizes_before_full_house_then_calls():
    state = call(rigged({"a": TICKET_A, "b": TICKET_B}, auto_mark=False), *ticket_numbers(TICKET_A))
    played = []
    memory = None
    while len(played) < 21:
        decision = choose_action(ENGINE.project_view(state, "a"), "a", memory)
        memory = decision.memory
        played.append(decision.action.choice or decision.action.type)
        state = ENGINE.apply_action(state, "a", decision.action)
        if state["phase"] == "finished":
            break
    assert played[:15] == ["mark"] * 15
    assert played[15:] == ["early_five", "top_line", "middle_line", "bottom_line", "full_house"]
    assert state["phase"] == "finished" and state["scores"]["a"] == 12
    fresh = start()
    caller = fresh["order"][fresh["turn"]]
    assert choose_action(ENGINE.project_view(fresh, caller), caller).action.type == "call_number"


@pytest.mark.parametrize("level", ["hard", "medium", "easy"])
@pytest.mark.parametrize("seats", [2, 10])
def test_bots_finish_a_match_marking_their_own_tickets(level, seats):
    players = [f"p{i}" for i in range(seats)]
    state = ENGINE.setup(players, {"auto_mark": False}, seed=seats)
    memory = {p: {"seed": f"housie:{p}"} for p in players}
    for _ in range(4000):
        if state["phase"] == "finished":
            break
        # As in a room: tickets are marked and prizes claimed before the next call.
        waiting = [p for p in players
                   if any(o.action.type != "call_number" for o in ENGINE.legal_actions(state, p))]
        actor = waiting[0] if waiting else state["order"][state["turn"]]
        view = ENGINE.project_view(state, actor)
        decision = choose_action(view, actor, memory[actor], level)
        if level != "hard" and choose_action(view, actor, memory[actor]).action.type == "call_number":
            # Calling is never withheld: a slip cannot replace it.
            assert decision.action.type == "call_number"
        memory[actor] = decision.memory
        state = ENGINE.apply_action(state, actor, decision.action)
    assert state["phase"] == "finished" and state["winners"]
    assert state["prizes"]["full_house"]["winners"]


def bots_for(players):
    return [Member(room_id="room", user_id=p, is_bot=True, seated=True) for p in players]


def test_a_claiming_bot_acts_before_a_bot_caller_and_calls_are_paced():
    human, first, second = "human-1", f"bot:{1:032x}", f"bot:{2:032x}"
    state = rigged({human: TICKET_B, first: TICKET_B, second: TICKET_A})
    state["turn"] = 1  # the first bot is the caller
    bots = bots_for([first, second])
    bot_id, view = next_bot_view(ENGINE, state, bots)
    assert bot_id == first and {o.action.type for o in view.actions} == {"call_number"}
    assert bot_delay(ENGINE, state, bots) == BOT_REVIEW_DELAY_SECONDS["call_number"] == 3.0
    # Five of the second bot's numbers come out while the first bot is still the caller.
    for number in (1, 21, 41, 61, 81):
        state = {**state, "bag": [n for n in state["bag"] if n != number] + [number], "turn": 1}
        state = ENGINE.apply_action(state, first, Action(type="call_number"))
    state["turn"] = 1
    bot_id, view = next_bot_view(ENGINE, state, bots)
    assert bot_id == second and "claim" in {o.action.type for o in view.actions}
    assert bot_delay(ENGINE, state, bots) == BOT_DELAY_SECONDS
    # A person calling is never rushed, and a bot with nothing to do stays quiet.
    state = rigged({human: TICKET_A, first: TICKET_B})
    assert next_bot_view(ENGINE, state, bots_for([first])) is None
