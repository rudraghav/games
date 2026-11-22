"""Uno and Uno No Mercy: the stacking toggle, play-after-draw and missed turns.

Every scenario is built from a conserved deck and resolved through legal engine
actions, so the assertions are independent of the legal-action generator only
where they inspect state directly.
"""

import random
from collections import Counter

import pytest

from app.core.contracts import Action, RuleError
from app.games.registry import ENGINES
from app.games.uno.deck import deck, penalty
from app.games.uno.engine import LIMIT, UnoEngine

ON, OFF = {"stack_draws": True}, {"stack_draws": False}


def table(mercy=False, players="abc", settings=None, **hands):
    """A quiet table on Red 5 with the named hands; every other card is in the stock."""
    engine = UnoEngine(mercy)
    ids = list(players)
    state = engine.setup(ids, dict(settings or {}), seed=3)
    pool = deck(mercy)
    pool.remove("red:5:0")
    state.update(
        turn=0, direction=1, color="red", pending=None, penalty=0, penalty_floor=0, drawn=None,
        catchable=None, called=[], eliminated=[], missing=[], discard=["red:5:0"],
        hands={p: [] for p in ids}, deck=pool,
    )
    state.pop("last_event", None)
    for seat, cards in hands.items():
        for card in cards:
            pool.remove(card)
            state["hands"][seat].append(card)
    # An empty hand has already won, so unnamed seats hold two off-colour sixes.
    spare = iter(["green", "yellow", "blue"])
    for seat in ids:
        if seat not in hands:
            colour = next(spare)
            for card in (f"{colour}:6:0", f"{colour}:6:1"):
                pool.remove(card)
                state["hands"][seat].append(card)
    engine._prompt(state)
    return engine, state


def stock(state, *cards):
    """Put these cards on top of the stock, the first one drawn first."""
    for card in cards:
        state["deck"].remove(card)
    state["deck"].extend(reversed(cards))


def play(engine, state, seat, card, **extra):
    chosen = {key: value for key, value in extra.items() if value is not None}
    return engine.apply_action(state, seat, Action(type="play", card=card, **chosen))


def act(engine, state, seat, kind, **extra):
    return engine.apply_action(state, seat, Action(type=kind, **extra))


def turn(state):
    return state["order"][state["turn"]]


def kinds(engine, state, seat):
    return sorted({option.action.type for option in engine.legal_actions(state, seat)})


def playable(engine, state, seat):
    return sorted(
        {o.action.card for o in engine.legal_actions(state, seat) if o.action.type == "play"}
    )


def conserved(engine, state):
    cards = state["deck"] + state["discard"] + sum(state["hands"].values(), [])
    assert Counter(cards) == Counter(deck(engine.mercy))


# --- The setting -----------------------------------------------------------------


def test_one_toggle_on_both_games_off_for_classic_and_on_for_no_mercy():
    classic, mercy = ENGINES["uno"].manifest, ENGINES["uno-no-mercy"].manifest
    assert [(s.key, s.label, s.default) for s in classic.settings] == [
        ("stack_draws", "Stack draw cards", False),
        ("seven_zero", "7 swaps & 0 passes", False),
    ]
    assert [(s.key, s.label, s.default) for s in mercy.settings] == [
        ("stack_draws", "Stack draw cards", True)
    ]
    for manifest in (classic, mercy):
        text = " ".join(manifest.rules)
        assert "Stack draw cards on" in text and "Off: draw the penalty" in text
        assert "miss your next turn" in text and "Drawing a penalty passes your turn" in text
    assert "cannot be challenged" in " ".join(classic.rules)
    assert "may be challenged" in " ".join(classic.rules)


@pytest.mark.parametrize(
    "mercy,settings,expected",
    [
        (False, {}, False),
        (True, {}, True),
        (False, {"stack_draws": True}, True),
        (True, {"stack_draws": False}, False),
        # Rooms saved before the toggle covered every draw card.
        (False, {"stack_draw_two": True, "seven_zero": False}, True),
        (False, {"stack_draw_two": False, "seven_zero": True}, False),
        (False, {"stack_draw_two": True, "stack_draws": False}, False),
    ],
)
def test_stacking_resolves_from_new_key_old_alias_then_the_game_default(mercy, settings, expected):
    engine, state = table(mercy, settings=settings)
    for viewer in state["order"]:
        assert engine.project_view(state, viewer).detail["stacking"] is expected


# --- Stacking on -----------------------------------------------------------------


def test_classic_stacks_plus_two_on_plus_two_of_any_colour_and_it_accumulates():
    engine, state = table(
        settings=ON, a=["red:draw2:0", "red:1:0", "red:4:0"],
        b=["blue:draw2:0", "red:2:0", "red:3:0"], c=["green:draw2:0", "green:1:0", "green:2:0"],
    )
    state = play(engine, state, "a", "red:draw2:0")
    assert turn(state) == "b" and state["penalty"] == 2 and state["penalty_floor"] == 2
    assert state["message"] == "Stack a +2 or higher, or draw 2. Drawing passes your turn."
    # Only the draw card may answer, whatever its colour; the matching red numbers may not.
    assert playable(engine, state, "b") == ["blue:draw2:0"]
    assert kinds(engine, state, "b") == ["draw", "play"]
    with pytest.raises(RuleError):
        play(engine, state, "b", "red:2:0")
    state = play(engine, state, "b", "blue:draw2:0")
    assert turn(state) == "c" and state["penalty"] == 4 and state["color"] == "blue"
    detail = engine.project_view(state, "a").detail
    assert detail["penalty"] == 4 and detail["stack_floor"] == 2 and detail["stacking"] is True
    state = play(engine, state, "c", "green:draw2:0")
    assert turn(state) == "a" and state["penalty"] == 6
    held = len(state["hands"]["a"])
    state = act(engine, state, "a", "draw")
    assert len(state["hands"]["a"]) == held + 6 and state["penalty"] == 0
    assert state["penalty_floor"] == 0 and turn(state) == "b"
    assert engine.project_view(state, "b").detail["stack_floor"] == 0
    conserved(engine, state)


def test_classic_wild_four_stacks_on_plus_two_names_a_colour_and_cannot_be_challenged():
    engine, state = table(
        settings=ON, a=["red:draw2:0", "red:1:0", "red:6:0"],
        b=["wild:wild4:0", "blue:2:0", "blue:3:0"], c=["yellow:draw2:0", "wild:wild4:1", "red:4:0"],
    )
    state = play(engine, state, "a", "red:draw2:0")
    labels = [o.label for o in engine.legal_actions(state, "b") if o.action.type == "play"]
    assert labels == [f"Play Wild +4 · {c}" for c in ("Red", "Yellow", "Green", "Blue")]
    state = play(engine, state, "b", "wild:wild4:0", color="green")
    assert state["pending"] is None and state["penalty"] == 6 and state["penalty_floor"] == 4
    assert state["color"] == "green" and turn(state) == "c"
    assert engine.project_view(state, "c").detail["pending_kind"] is None
    assert state["message"] == "Stack a +4, or draw 6. Drawing passes your turn."
    # Never a lower draw on a higher one, and no accept/challenge in this mode.
    assert playable(engine, state, "c") == ["wild:wild4:1"]
    assert kinds(engine, state, "c") == ["draw", "play"]
    with pytest.raises(RuleError):
        play(engine, state, "c", "yellow:draw2:0")
    with pytest.raises(RuleError):
        act(engine, state, "c", "challenge")
    state = play(engine, state, "c", "wild:wild4:1", color="yellow")
    assert state["penalty"] == 10 and turn(state) == "a" and state["color"] == "yellow"
    state = act(engine, state, "a", "draw")
    assert len(state["hands"]["a"]) == 12 and turn(state) == "b"
    conserved(engine, state)


def test_classic_wild_four_on_an_ordinary_card_starts_a_stack_when_stacking_is_on():
    engine, state = table(
        settings=ON, a=["wild:wild4:0", "red:1:0", "red:2:0"], b=["blue:2:0", "blue:3:0"]
    )
    state = play(engine, state, "a", "wild:wild4:0", color="blue")
    assert state["pending"] is None and state["penalty"] == 4 and turn(state) == "b"
    assert kinds(engine, state, "b") == ["draw"]
    assert [o.label for o in engine.legal_actions(state, "b")] == ["Draw 4"]
    state = act(engine, state, "b", "draw")
    assert len(state["hands"]["b"]) == 6 and turn(state) == "c"
    assert engine.project_view(state, "a").detail["last_event"]["kind"] == "penalty"


MERCY_DRAWS = ["red:draw2:0", "blue:draw4:0", "wild:reverse4:0", "wild:wild6:0", "wild:wild10:0"]


@pytest.mark.parametrize("first", MERCY_DRAWS)
@pytest.mark.parametrize(
    "answer", ["green:draw2:0", "yellow:draw4:0", "wild:reverse4:1", "wild:wild6:1", "wild:wild10:1"]
)
def test_no_mercy_stacks_equal_or_higher_draw_values_regardless_of_colour(first, answer):
    engine, state = table(
        True, players="abcd", settings=ON, a=[first, "red:1:0", "red:3:0"],
        b=[answer, "red:2:0"], c=["green:3:0", "green:7:0"],
        d=["green:4:0", "green:5:0", "wild:reverse4:2"],
    )
    # Stacking is colour-blind, so the opening card only has to be playable.
    state["color"] = first.split(":")[0] if not first.startswith("wild") else "red"
    state = play(engine, state, "a", first, color="blue" if first.startswith("wild") else None)
    # A Reverse +4 turns play around, so its penalty lands on the seat before its player.
    victim = "d" if "reverse4" in first else "b"
    assert turn(state) == victim and state["penalty"] == penalty(first)
    if victim == "d":
        allowed = penalty("wild:reverse4:2") >= penalty(first)
        assert playable(engine, state, "d") == (["wild:reverse4:2"] if allowed else [])
        return
    allowed = penalty(answer) >= penalty(first)
    assert (answer in playable(engine, state, "b")) is allowed
    assert "red:2:0" not in playable(engine, state, "b")
    if not allowed:
        assert kinds(engine, state, "b") == ["draw"]
        with pytest.raises(RuleError):
            play(engine, state, "b", answer, color="red" if answer.startswith("wild") else None)
        return
    state = play(engine, state, "b", answer, color="red" if answer.startswith("wild") else None)
    assert state["penalty"] == penalty(first) + penalty(answer)
    assert state["penalty_floor"] == penalty(answer)
    assert engine.project_view(state, "c").detail["stack_floor"] == penalty(answer)
    conserved(engine, state)


def test_no_mercy_stack_grows_from_two_to_twenty_two_and_the_drawer_loses_the_turn():
    engine, state = table(
        True, players="abcd", settings=ON, a=["red:draw2:0", "red:1:0", "red:3:0"],
        b=["blue:draw4:0", "blue:1:0", "blue:6:0"], c=["wild:wild6:0", "blue:2:0", "blue:7:0"],
        d=["wild:wild10:0", "blue:3:0", "blue:8:0"],
    )
    state = play(engine, state, "a", "red:draw2:0")
    state = play(engine, state, "b", "blue:draw4:0")
    assert state["message"] == "Stack a +4 or higher, or draw 6. Drawing passes your turn."
    state = play(engine, state, "c", "wild:wild6:0", color="green")
    state = play(engine, state, "d", "wild:wild10:0", color="yellow")
    assert state["penalty"] == 22 and state["penalty_floor"] == 10 and turn(state) == "a"
    assert state["message"] == "Stack a +10, or draw 22. Drawing passes your turn."
    assert [o.label for o in engine.legal_actions(state, "a")] == ["Draw 22"]
    state = act(engine, state, "a", "draw")
    assert len(state["hands"]["a"]) == 24 and turn(state) == "b" and state["penalty"] == 0
    assert state["message"] == "Match Yellow, or draw until you can."
    conserved(engine, state)


# --- Stacking off ----------------------------------------------------------------


def test_classic_without_stacking_must_draw_and_keeps_the_wild_four_challenge():
    engine, state = table(
        settings=OFF, a=["red:draw2:0", "red:1:0", "red:6:0"],
        b=["blue:draw2:0", "wild:wild4:0", "red:2:0"], c=["wild:wild4:1", "blue:1:0", "blue:3:0"],
    )
    state = play(engine, state, "a", "red:draw2:0")
    assert kinds(engine, state, "b") == ["draw"] and playable(engine, state, "b") == []
    assert state["message"] == "Draw 2; your turn then passes."
    assert engine.project_view(state, "b").detail["stack_floor"] == 0
    for card, colour in [("blue:draw2:0", None), ("wild:wild4:0", "red")]:
        with pytest.raises(RuleError):
            play(engine, state, "b", card, color=colour)
    state = act(engine, state, "b", "draw")
    assert len(state["hands"]["b"]) == 5 and turn(state) == "c"
    state = play(engine, state, "c", "wild:wild4:1", color="blue")
    assert state["pending"]["type"] == "challenge" and state["penalty"] == 0
    assert kinds(engine, state, "a") == ["accept", "challenge"]
    assert state["message"] == "Take 4 cards, or challenge the Wild +4."
    conserved(engine, state)


@pytest.mark.parametrize(
    "answer,holds_colour,drawer,count,next_turn",
    [
        ("accept", False, "b", 4, "c"),
        ("challenge", False, "b", 6, "c"),  # failed: six cards and the turn is lost
        ("challenge", True, "a", 4, "b"),  # succeeded: the challenger still plays
    ],
)
def test_classic_wild_four_answers_when_stacking_is_off(answer, holds_colour, drawer, count, next_turn):
    engine, state = table(
        settings=OFF, a=["wild:wild4:0", "red:1:0" if holds_colour else "blue:1:0", "green:9:0"],
        b=["wild:wild4:1", "green:2:0"], c=["blue:3:0"],
    )
    state = play(engine, state, "a", "wild:wild4:0", color="green")
    assert playable(engine, state, "b") == []
    before = len(state["hands"][drawer])
    state = act(engine, state, "b", answer)
    assert len(state["hands"][drawer]) == before + count and turn(state) == next_turn
    assert state["pending"] is None and state["penalty"] == 0
    conserved(engine, state)


@pytest.mark.parametrize("card", MERCY_DRAWS)
def test_no_mercy_without_stacking_makes_every_penalty_a_plain_draw(card):
    engine, state = table(
        True, settings=OFF, a=[card, "red:1:0", "red:3:0"],
        b=["wild:wild10:2", "wild:wild6:2", "red:2:0"],
        c=["wild:wild10:1", "blue:draw4:1", "green:3:0"],
    )
    state["color"] = card.split(":")[0] if not card.startswith("wild") else "red"
    state = play(engine, state, "a", card, color="blue" if card.startswith("wild") else None)
    victim = "c" if "reverse4" in card else "b"
    assert turn(state) == victim and state["penalty"] == penalty(card)
    assert kinds(engine, state, victim) == ["draw"]
    assert state["message"] == f"Draw {penalty(card)}; your turn then passes."
    detail = engine.project_view(state, "a").detail
    assert detail["stacking"] is False and detail["stack_floor"] == 0
    before = len(state["hands"][victim])
    state = act(engine, state, victim, "draw")
    assert len(state["hands"][victim]) == before + penalty(card) and state["penalty"] == 0
    assert turn(state) == ("b" if victim == "c" else "c")
    conserved(engine, state)


def test_no_mercy_without_stacking_still_eliminates_at_the_limit():
    engine, state = table(
        True, settings=OFF, a=["wild:wild10:0", "red:1:0", "red:3:0"], b=[], c=["red:2:0", "red:4:0"]
    )
    state["hands"]["b"] = [state["deck"].pop() for _ in range(16)]
    state = play(engine, state, "a", "wild:wild10:0", color="red")
    assert [o.label for o in engine.legal_actions(state, "b")] == ["Draw 10 — you’re out"]
    assert state["message"] == "Draw 10 — drawing puts you out."
    state = act(engine, state, "b", "draw")
    assert state["eliminated"] == ["b"] and turn(state) == "c" and LIMIT == 25


# --- Taking a penalty ends the turn ----------------------------------------------


@pytest.mark.parametrize("mercy", [False, True])
@pytest.mark.parametrize("stacking", [False, True])
def test_drawing_a_pending_penalty_always_passes_the_turn(mercy, stacking):
    engine, state = table(
        mercy, settings={"stack_draws": stacking}, a=["red:draw2:0", "red:1:0", "red:6:0"],
        b=["red:2:0", "red:3:0"], c=["red:4:0", "red:7:0"],
    )
    state = play(engine, state, "a", "red:draw2:0")
    state = act(engine, state, "b", "draw")
    event = engine.project_view(state, "c").detail["last_event"]
    assert event["type"] == "draw" and event["kind"] == "penalty" and event["drew"] == {"b": 2}
    assert turn(state) == "c" and state["drawn"] is None
    # The two red cards b now holds would have matched; the turn is gone all the same.
    assert kinds(engine, state, "b") == []
    assert "play" in kinds(engine, state, "c")


# --- Play after a voluntary draw -------------------------------------------------


def test_classic_may_play_the_card_just_drawn_or_pass_and_nothing_else():
    engine, state = table(a=["blue:1:0", "blue:2:0"], b=["green:1:0", "green:2:0"])
    stock(state, "red:9:0")
    state = act(engine, state, "a", "draw")
    assert turn(state) == "a" and state["drawn"] == "red:9:0"
    assert state["message"] == "Play the card you drew, or pass."
    assert [o.label for o in engine.legal_actions(state, "a")] == ["Play Red 9", "Pass"]
    assert engine.project_view(state, "a").detail["you_drew"] == ["red:9:0"]
    assert engine.project_view(state, "b").detail["you_drew"] == []
    assert turn(play(engine, state, "a", "red:9:0")) == "b"
    passed = act(engine, state, "a", "end_turn")
    assert turn(passed) == "b" and "red:9:0" in passed["hands"]["a"]


def test_classic_draw_of_a_good_action_card_can_be_thrown_at_once():
    engine, state = table(settings=ON, a=["blue:1:0", "blue:2:0"], b=["green:1:0", "green:2:0"])
    stock(state, "wild:wild4:0")
    state = act(engine, state, "a", "draw")
    assert playable(engine, state, "a") == ["wild:wild4:0"]
    state = play(engine, state, "a", "wild:wild4:0", color="blue")
    assert state["penalty"] == 4 and turn(state) == "b"


def test_classic_unplayable_draw_passes_the_turn_without_a_choice():
    engine, state = table(a=["blue:1:0", "blue:2:0"], b=["green:1:0", "green:2:0"])
    stock(state, "yellow:9:0")
    state = act(engine, state, "a", "draw")
    assert turn(state) == "b" and state["drawn"] is None
    assert engine.project_view(state, "a").detail["you_drew"] == ["yellow:9:0"]


def test_no_mercy_draws_until_a_card_fits_and_that_card_can_be_played_at_once():
    engine, state = table(True, a=["blue:1:0", "blue:2:0"], b=["green:1:0", "green:2:0"])
    stock(state, "yellow:9:0", "green:8:0", "red:9:0", "red:8:0")
    assert [o.label for o in engine.legal_actions(state, "a")] == ["Draw until playable"]
    state = act(engine, state, "a", "draw")
    assert state["hands"]["a"] == ["blue:1:0", "blue:2:0", "yellow:9:0", "green:8:0", "red:9:0"]
    assert turn(state) == "a" and state["drawn"] == "red:9:0"
    assert state["message"] == "Play the card you drew."
    assert [o.label for o in engine.legal_actions(state, "a")] == ["Play Red 9"]
    assert engine.project_view(state, "a").detail["you_drew"] == ["yellow:9:0", "green:8:0", "red:9:0"]
    assert engine.project_view(state, "b").detail["last_event"]["drew"] == {"a": 3}
    state = play(engine, state, "a", "red:9:0")
    assert turn(state) == "b" and state["discard"][-1] == "red:9:0"


# --- Caught without UNO: two cards and one missed turn ---------------------------


def missing(engine, state):
    views = [engine.project_view(state, viewer).detail["missing_turn"] for viewer in state["order"]]
    assert all(view == views[0] for view in views), "the mark is public and the same for everyone"
    return views[0]


def missed(engine, state):
    return engine.project_view(state, state["order"][0]).detail["last_event"]["missed"]


def test_three_players_caught_player_takes_two_and_misses_exactly_one_turn():
    engine, state = table(
        a=["red:1:0", "red:2:0"], b=["red:3:0", "red:4:0", "red:6:0", "red:7:0"],
        c=["red:8:0", "red:9:0", "red:1:1", "red:2:1"],
    )
    state = play(engine, state, "a", "red:1:0")
    assert state["catchable"] == "a" and turn(state) == "b"
    state = act(engine, state, "b", "catch_uno", target="a")
    assert len(state["hands"]["a"]) == 3 and missing(engine, state) == ["a"]
    assert turn(state) == "b" and missed(engine, state) == []
    state = play(engine, state, "b", "red:3:0")
    state = play(engine, state, "c", "red:8:0")
    # The turn would have reached a: it passes over them, once, in public.
    assert turn(state) == "b" and missed(engine, state) == ["a"] and missing(engine, state) == []
    assert kinds(engine, state, "a") == []
    state = play(engine, state, "b", "red:4:0")
    state = play(engine, state, "c", "red:9:0")
    assert turn(state) == "a" and missed(engine, state) == []
    assert "play" in kinds(engine, state, "a")
    conserved(engine, state)


def test_two_players_the_catcher_plays_twice_then_the_caught_player_returns():
    engine, state = table(
        players="ab", a=["red:1:0", "red:2:0"], b=["red:3:0", "red:4:0", "red:6:0", "red:7:0"]
    )
    state = play(engine, state, "a", "red:1:0")
    state = act(engine, state, "b", "catch_uno", target="a")
    assert turn(state) == "b" and missing(engine, state) == ["a"]
    state = play(engine, state, "b", "red:3:0")
    assert turn(state) == "b" and missed(engine, state) == ["a"] and missing(engine, state) == []
    state = play(engine, state, "b", "red:4:0")
    assert turn(state) == "a" and missed(engine, state) == []


def test_four_players_reverse_brings_the_turn_to_the_caught_player_who_misses_it():
    engine, state = table(
        players="abcd", a=["red:1:0", "red:2:0"], b=["red:reverse:0", "red:3:0", "blue:9:0"],
        c=["red:4:0", "red:6:0"], d=["red:7:0", "red:8:0", "red:9:0"],
    )
    state = play(engine, state, "a", "red:1:0")
    state = act(engine, state, "c", "catch_uno", target="a")  # anyone may catch, out of turn
    assert turn(state) == "b" and missing(engine, state) == ["a"]
    state = play(engine, state, "b", "red:reverse:0")
    assert state["direction"] == -1 and turn(state) == "d" and missed(engine, state) == ["a"]
    state = play(engine, state, "d", "red:7:0")
    state = play(engine, state, "c", "red:4:0")
    state = play(engine, state, "b", "red:3:0")
    assert turn(state) == "a" and missing(engine, state) == []


def test_caught_player_who_is_the_very_next_seat_misses_that_turn():
    engine, state = table(
        a=["red:1:0", "red:2:0", "red:3:0"], b=["red:4:0", "red:6:0", "blue:8:0"], c=["red:7:0"]
    )
    state = play(engine, state, "a", "red:1:0")
    assert state["catchable"] == "c" and turn(state) == "b"
    state = act(engine, state, "a", "catch_uno", target="c")
    assert len(state["hands"]["c"]) == 3 and missing(engine, state) == ["c"] and turn(state) == "b"
    view = engine.project_view(state, "b").detail
    # "Next" names who will really play: the marked seat is passed over.
    assert view["next_player"] == "a"
    state = play(engine, state, "b", "red:4:0")
    assert turn(state) == "a" and missed(engine, state) == ["c"]
    state = play(engine, state, "a", "red:2:0")
    state = play(engine, state, "b", "red:6:0")
    assert turn(state) == "c"


def test_caught_on_your_own_turn_ends_that_turn_at_once():
    engine, state = table(players="ab", a=["red:skip:0", "red:1:0"], b=["red:3:0", "red:4:0"])
    state = play(engine, state, "a", "red:skip:0")
    assert turn(state) == "a" and state["catchable"] == "a"
    state = act(engine, state, "b", "catch_uno", target="a")
    assert len(state["hands"]["a"]) == 3 and turn(state) == "b"
    assert missed(engine, state) == ["a"] and missing(engine, state) == []
    assert state["message"] == "Match Red or Skip, or draw a card."
    state = play(engine, state, "b", "red:3:0")
    assert turn(state) == "a"


def test_a_skip_card_and_a_missed_turn_each_cost_one_turn():
    engine, state = table(
        players="abcd", a=["red:1:0", "red:2:0"], b=["red:3:0", "red:4:0", "red:6:0", "blue:9:0"],
        c=["red:7:0", "red:8:0", "red:9:0", "blue:8:0"],
        d=["red:skip:0", "red:1:1", "red:2:1", "blue:7:0"],
    )
    state = play(engine, state, "a", "red:1:0")
    state = act(engine, state, "b", "catch_uno", target="a")
    state = play(engine, state, "b", "red:3:0")
    state = play(engine, state, "c", "red:7:0")
    state = play(engine, state, "d", "red:skip:0")
    # The Skip took this turn; the mark still stands for the next one.
    assert turn(state) == "b" and missed(engine, state) == [] and missing(engine, state) == ["a"]
    assert engine.project_view(state, "c").detail["last_event"]["skipped"] == ["a"]
    state = play(engine, state, "b", "red:4:0")
    state = play(engine, state, "c", "red:8:0")
    state = play(engine, state, "d", "red:1:1")
    assert turn(state) == "b" and missed(engine, state) == ["a"] and missing(engine, state) == []
    state = play(engine, state, "b", "red:6:0")
    state = play(engine, state, "c", "red:9:0")
    state = play(engine, state, "d", "red:2:1")
    assert turn(state) == "a"


def test_skip_everyone_keeps_the_mark_until_the_turn_really_reaches_that_seat():
    engine, state = table(
        True, a=["red:1:0", "red:2:0"], b=["red:skip_all:0", "red:3:0", "red:4:0", "red:6:0"],
        c=["red:7:0", "red:8:0", "red:9:0"],
    )
    state = play(engine, state, "a", "red:1:0")
    state = act(engine, state, "c", "catch_uno", target="a")
    state = play(engine, state, "b", "red:skip_all:0")
    assert turn(state) == "b" and missing(engine, state) == ["a"]
    state = play(engine, state, "b", "red:3:0")
    state = play(engine, state, "c", "red:8:0")
    assert turn(state) == "b" and missed(engine, state) == ["a"]


@pytest.mark.parametrize("stacking", [False, True])
def test_a_penalty_aimed_at_a_caught_player_is_answered_first_then_one_turn_is_missed(stacking):
    engine, state = table(
        settings={"stack_draws": stacking},
        a=["red:1:0", "red:2:0", "blue:1:0", "blue:2:0", "yellow:9:0"],
        b=["red:draw2:0", "red:4:0", "red:6:0", "blue:4:0", "blue:6:0", "yellow:8:0"],
        c=["blue:draw2:0"],
    )
    state["turn"] = 1
    state = play(engine, state, "b", "red:draw2:0")
    assert turn(state) == "c" and state["catchable"] == "c" and state["penalty"] == 2
    state = act(engine, state, "a", "catch_uno", target="c")
    # The mark never absorbs or deflects the draw: c still faces it.
    assert turn(state) == "c" and state["penalty"] == 2 and missing(engine, state) == ["c"]
    assert len(state["hands"]["c"]) == 3 and missed(engine, state) == []
    if stacking:
        state = play(engine, state, "c", "blue:draw2:0")
        assert turn(state) == "a" and state["penalty"] == 4
        state = act(engine, state, "a", "draw")
        first, second, third = "blue:4:0", "blue:1:0", "blue:6:0"
    else:
        assert kinds(engine, state, "c") == ["draw"]
        state = act(engine, state, "c", "draw")
        assert len(state["hands"]["c"]) == 5 and turn(state) == "a"
        state = play(engine, state, "a", "red:1:0")
        first, second, third = "red:4:0", "red:2:0", "red:6:0"
    assert turn(state) == "b" and missing(engine, state) == ["c"]
    state = play(engine, state, "b", first)
    assert turn(state) == "a" and missed(engine, state) == ["c"] and missing(engine, state) == []
    state = play(engine, state, "a", second)
    state = play(engine, state, "b", third)
    assert turn(state) == "c" and missed(engine, state) == []
    conserved(engine, state)


def test_successful_challenge_by_a_caught_player_then_costs_their_ordinary_turn():
    engine, state = table(
        settings=OFF, a=["wild:wild4:0", "red:1:0", "red:2:0"], b=["green:2:0"], c=["blue:3:0"]
    )
    state = play(engine, state, "a", "wild:wild4:0", color="green")
    assert state["catchable"] == "c"
    state["catchable"] = "b"  # b reached one card earlier and never called
    state = act(engine, state, "c", "catch_uno", target="b")
    assert turn(state) == "b" and state["pending"]["type"] == "challenge"
    state = act(engine, state, "b", "challenge")
    assert len(state["hands"]["a"]) == 6 and turn(state) == "c" and missed(engine, state) == ["b"]


def test_the_mark_stays_with_the_seat_through_seven_swaps_and_zero_passes():
    engine, state = table(
        settings={"seven_zero": True}, a=["red:1:0", "red:2:0"],
        b=["red:7:0", "red:0:0", "red:3:0", "red:4:0"], c=["red:6:0", "red:8:0", "red:9:0"],
    )
    state = play(engine, state, "a", "red:1:0")
    state = act(engine, state, "b", "catch_uno", target="a")
    state = play(engine, state, "b", "red:7:0", target="a")
    assert len(state["hands"]["b"]) == 3 and missing(engine, state) == ["a"]
    state = play(engine, state, "c", "red:6:0")
    assert turn(state) == "b" and missed(engine, state) == ["a"]
    engine, state = table(
        True, a=["red:1:0", "red:2:0"], b=["red:0:0", "red:3:0", "red:4:0"],
        c=["red:6:0", "red:8:0", "red:9:0"],
    )
    state = play(engine, state, "a", "red:1:0")
    state = act(engine, state, "b", "catch_uno", target="a")
    state = play(engine, state, "b", "red:0:0")
    assert missing(engine, state) == ["a"] and turn(state) == "c"
    state = play(engine, state, "c", next(c for c in state["hands"]["c"] if c.startswith("red")))
    assert turn(state) == "b" and missed(engine, state) == ["a"]


def test_two_catches_before_the_turn_is_served_still_cost_one_turn():
    engine, state = table(
        settings={"seven_zero": True}, a=["red:1:0", "red:2:0"],
        b=["red:7:0", "red:3:0", "red:4:0", "red:6:0"], c=["red:8:0", "red:9:0", "red:1:1"],
    )
    state = play(engine, state, "a", "red:1:0")
    state = act(engine, state, "b", "catch_uno", target="a")
    state["hands"]["b"] = ["red:7:0", "red:3:0"]  # b swaps a one-card hand to a
    state["deck"].extend(["red:4:0", "red:6:0"])
    state = play(engine, state, "b", "red:7:0", target="a")
    assert state["catchable"] == "a" and len(state["hands"]["a"]) == 1
    state = act(engine, state, "c", "catch_uno", target="a")
    assert state["missing"] == ["a"] and len(state["hands"]["a"]) == 3
    state = play(engine, state, "c", "red:8:0")
    assert turn(state) == "b" and missed(engine, state) == ["a"]
    state = play(engine, state, "b", next(c for c in state["hands"]["b"] if c.startswith("red")))
    state = play(engine, state, "c", "red:9:0")
    assert turn(state) == "a"


def test_elimination_and_the_end_of_the_match_clear_the_mark():
    engine, state = table(True, a=["red:1:0", "red:2:0"], b=["wild:wild10:0", "red:3:0"], c=["red:4:0"])
    state["hands"]["c"] = ["red:4:0"] + [state["deck"].pop() for _ in range(22)]
    state["catchable"] = "c"
    state = act(engine, state, "a", "catch_uno", target="c")
    # The two caught cards reach the limit: out, with no turn left to miss.
    assert state["eliminated"] == ["c"] and missing(engine, state) == []
    engine, state = table(
        True, a=["red:1:0", "red:2:0"], b=["red:3:0", "red:6:0", "red:7:0"],
        c=["wild:wild10:0", "red:4:0", "red:8:0"],
    )
    state["hands"]["a"] += [state["deck"].pop() for _ in range(12)]
    state["turn"], state["catchable"] = 2, "a"
    state = act(engine, state, "b", "catch_uno", target="a")
    assert missing(engine, state) == ["a"] and len(state["hands"]["a"]) == 16
    state = play(engine, state, "c", "wild:wild10:0", color="red")
    assert turn(state) == "a" and missing(engine, state) == ["a"]
    state = act(engine, state, "a", "draw")
    # Marked, then eliminated by the penalty: the mark goes with the seat.
    assert state["eliminated"] == ["a"] and missing(engine, state) == [] and turn(state) == "b"
    engine, state = table(players="ab", a=["red:1:0", "red:2:0"], b=["red:3:0", "red:4:0"])
    state = play(engine, state, "a", "red:1:0")
    state = act(engine, state, "b", "catch_uno", target="a")
    state = play(engine, state, "b", "red:3:0")
    state = act(engine, state, "b", "uno")
    state = play(engine, state, "b", "red:4:0")
    assert state["phase"] == "finished" and state["winners"] == ["b"] and state["missing"] == []
    assert engine.project_view(state, "a").detail["missing_turn"] == []


def test_a_marked_seat_keeps_its_out_of_turn_reactions_only():
    engine, state = table(
        a=["red:1:0", "red:2:0"], b=["red:3:0", "red:4:0"], c=["red:6:0", "red:7:0", "red:8:0"]
    )
    state = play(engine, state, "a", "red:1:0")
    state = act(engine, state, "c", "catch_uno", target="a")
    state = play(engine, state, "b", "red:3:0")
    assert state["catchable"] == "b" and turn(state) == "c"
    # a misses a turn but may still catch someone else.
    assert kinds(engine, state, "a") == ["catch_uno"]


# --- States saved before this change ---------------------------------------------


def old_state(engine, state, settings):
    """What a match saved before the toggle and the missed-turn mark looks like."""
    state = engine.copy(state)
    state["settings"] = settings
    state.pop("missing")
    if state.get("last_event"):
        state["last_event"].pop("missed", None)
    return state


def test_a_classic_match_saved_with_the_old_stacking_key_still_loads_and_stacks():
    engine, state = table(a=["red:draw2:0", "red:1:0"], b=["blue:draw2:0", "wild:wild4:0"], c=["red:2:0"])
    state = old_state(engine, state, {"stack_draw_two": True, "seven_zero": False})
    for viewer in "abc":
        detail = engine.project_view(state, viewer).detail
        assert detail["stacking"] is True and detail["missing_turn"] == []
    state = play(engine, state, "a", "red:draw2:0")
    assert state["missing"] == [] and playable(engine, state, "b") == ["blue:draw2:0", "wild:wild4:0"]
    state = play(engine, state, "b", "wild:wild4:0", color="red")
    assert state["penalty"] == 6 and state["pending"] is None


def test_an_old_match_keeps_a_challenge_that_was_already_open_and_the_old_off_setting():
    engine, state = table(a=["wild:wild4:0", "blue:1:0"], b=["green:2:0", "wild:wild4:1"], c=["red:2:0"])
    off = old_state(engine, state, {"stack_draw_two": False, "seven_zero": False})
    off = play(engine, off, "a", "wild:wild4:0", color="green")
    assert off["pending"]["type"] == "challenge"
    # Saved mid-challenge under the old on-setting: the open window still resolves.
    saved = old_state(engine, off, {"stack_draw_two": True, "seven_zero": False})
    assert kinds(engine, saved, "b") == ["accept", "challenge"]
    saved = act(engine, saved, "b", "accept")
    assert len(saved["hands"]["b"]) == 6 and turn(saved) == "c"


def test_an_old_no_mercy_match_with_no_settings_keeps_stacking():
    engine, state = table(True, a=["red:draw2:0", "red:1:0"], b=["wild:wild6:0", "red:2:0"])
    state = old_state(engine, state, {})
    state = play(engine, state, "a", "red:draw2:0")
    assert playable(engine, state, "b") == ["wild:wild6:0"]
    state = old_state(engine, state, {})
    caught = dict(state, catchable="c")
    caught["hands"] = {**state["hands"], "c": ["red:9:0"]}
    caught["deck"] = [c for c in state["deck"] if c != "red:9:0"]
    caught = act(engine, caught, "a", "catch_uno", target="c")
    assert caught["missing"] == ["c"]


# --- No configuration deadlocks ---------------------------------------------------

CONFIGURATIONS = [
    ("uno", {"stack_draws": False, "seven_zero": False}),
    ("uno", {"stack_draws": True, "seven_zero": False}),
    ("uno", {"stack_draws": False, "seven_zero": True}),
    ("uno", {"stack_draws": True, "seven_zero": True}),
    ("uno", {"stack_draw_two": True, "seven_zero": False}),
    ("uno-no-mercy", {"stack_draws": True}),
    ("uno-no-mercy", {"stack_draws": False}),
    ("uno-no-mercy", {}),
]


@pytest.mark.parametrize("game,settings", CONFIGURATIONS)
@pytest.mark.parametrize("count", [2, 3, 4, "max"])
@pytest.mark.parametrize("seed", [5, 23, 41, 77])
def test_random_legal_play_never_deadlocks_and_serves_each_catch_once(game, settings, count, seed):
    engine = ENGINES[game]
    count = engine.manifest.max_players if count == "max" else count
    players = [f"p{i}" for i in range(count)]
    state = engine.setup(players, dict(settings), seed=seed)
    chooser = random.Random(seed * 31 + count)
    stacking = engine._stacking(state)
    catches = served = stacked = 0
    for _ in range(8000):
        conserved(engine, state)
        if state["phase"] == "finished":
            break
        current = turn(state)
        assert current not in state["eliminated"]
        options = engine.legal_actions(state, current)
        # Whoever holds the turn can always act, and never while marked on an open turn.
        assert [o for o in options if o.action.type not in {"uno", "catch_uno"}], state["message"]
        assert set(state["missing"]).isdisjoint(state["eliminated"])
        assert len(set(state["missing"])) == len(state["missing"])
        if state["penalty"] and not stacking:
            assert not [o for o in options if o.action.type == "play"]
        if state["pending"] and state["pending"]["type"] == "challenge":
            assert not stacking
        # Out-of-turn reactions: sometimes call UNO, sometimes get caught instead.
        reactions = [
            (p, o) for p in players for o in engine.legal_actions(state, p)
            if o.action.type in {"uno", "catch_uno"}
        ]
        if reactions and chooser.random() < 0.6:
            actor, option = chooser.choice(reactions)
        else:
            plays = [o for o in options if o.action.type == "play"]
            rest = [o for o in options if o.action.type not in {"uno", "catch_uno"}]
            actor, option = current, chooser.choice(plays if plays and chooser.random() < 0.85 else rest)
        before = state
        state = engine.apply_action(state, actor, option.action)
        event = state["last_event"]
        if option.action.type == "catch_uno":
            catches += 1
        elif option.action.type == "play" and before["penalty"]:
            stacked += 1
            assert stacking and penalty(option.action.card) >= before["penalty_floor"]
        if option.action.type != "uno":
            served += len(event["missed"])
            assert len(set(event["missed"])) == len(event["missed"])
        if option.action.type == "draw" and before["penalty"]:
            assert turn(state) != actor or len(players) - len(state["eliminated"]) == 1 or (
                # Everyone else is missing a turn, so play comes straight back.
                set(event["missed"]) | set(state["eliminated"]) | {actor} >= set(players)
            )
    assert state["phase"] == "finished" and len(state["winners"]) == 1
    assert state["missing"] == [] and served <= catches
    assert all(not engine.legal_actions(state, p) for p in players)
    if not stacking:
        assert stacked == 0


@pytest.mark.parametrize("game,settings", CONFIGURATIONS)
def test_random_play_reaches_stacks_catches_and_missed_turns_in_every_configuration(game, settings):
    """The property test above is only meaningful if these situations really occur."""
    engine = ENGINES[game]
    totals = Counter()
    for seed in range(12):
        players = [f"p{i}" for i in range(3)]
        state = engine.setup(players, dict(settings), seed=seed)
        chooser = random.Random(seed)
        for _ in range(6000):
            if state["phase"] == "finished":
                break
            current = turn(state)
            options = engine.legal_actions(state, current)
            catchers = [
                (p, o) for p in players for o in engine.legal_actions(state, p)
                if o.action.type == "catch_uno"
            ]
            if catchers and chooser.random() < 0.8:
                actor, option = chooser.choice(catchers)
            else:
                plays = [o for o in options if o.action.type == "play"]
                rest = [o for o in options if o.action.type not in {"uno", "catch_uno"}]
                actor, option = current, chooser.choice(plays or rest)
            if option.action.type == "play" and state["penalty"]:
                totals["stacked"] += 1
            totals[option.action.type] += 1
            state = engine.apply_action(state, actor, option.action)
            totals["missed"] += len(state["last_event"]["missed"])
        assert state["phase"] == "finished"
    assert totals["catch_uno"] and totals["missed"]
    assert bool(totals["stacked"]) is engine._stacking(engine.setup(["a", "b"], dict(settings), seed=1))


# --- Bots ------------------------------------------------------------------------


def bot_move(engine, state, seat):
    from app.bots import choose_action

    return choose_action(engine.project_view(state, seat), seat, {"seed": "uno-stack"}).action


def test_bot_passes_a_penalty_on_with_its_smallest_card_that_stacks():
    engine, state = table(
        True, players="abcd", a=["red:draw2:0", "red:1:0", "red:3:0"],
        b=["wild:wild10:0", "blue:draw4:0", "wild:wild6:0", "red:2:0"],
        c=["green:1:0", "green:2:0", "green:3:0"], d=["green:4:0", "green:5:0", "green:6:0"],
    )
    state = play(engine, state, "a", "red:draw2:0")
    assert bot_move(engine, state, "b") == Action(type="play", card="blue:draw4:0")
    # The next player is nearly out: use the card that is hardest to answer.
    state["deck"].append(state["hands"]["c"].pop())
    move = bot_move(engine, state, "b")
    assert move.type == "play" and move.card == "wild:wild10:0" and move.color in {"red", "blue"}


def test_bot_draws_a_penalty_it_cannot_or_may_not_stack():
    for settings, expected in [(ON, "play"), (OFF, "draw")]:
        engine, state = table(
            True, settings=settings, a=["red:draw2:0", "red:1:0", "red:3:0"],
            b=["wild:wild6:0", "red:2:0", "red:4:0"],
        )
        state = play(engine, state, "a", "red:draw2:0")
        assert bot_move(engine, state, "b").type == expected
    engine, state = table(True, a=["wild:wild10:0", "red:1:0", "red:3:0"], b=["wild:wild6:0", "red:2:0"])
    state = play(engine, state, "a", "wild:wild10:0", color="red")
    assert bot_move(engine, state, "b") == Action(type="draw")


def test_bot_does_not_reverse_a_penalty_back_onto_itself_with_two_players():
    engine, state = table(
        True, players="ab", a=["red:draw4:0", "red:1:0", "red:3:0"],
        b=["wild:reverse4:0", "red:2:0", "red:4:0"],
    )
    state = play(engine, state, "a", "red:draw4:0")
    assert "wild:reverse4:0" in playable(engine, state, "b")
    assert bot_move(engine, state, "b") == Action(type="draw")
    state["hands"]["b"].append("wild:wild6:0")
    state["deck"].remove("wild:wild6:0")
    assert bot_move(engine, state, "b").card == "wild:wild6:0"


def test_classic_bot_stacks_a_wild_four_when_allowed_and_accepts_one_otherwise():
    engine, state = table(
        settings=ON, a=["wild:wild4:0", "red:1:0", "red:3:0"], b=["wild:wild4:1", "red:2:0", "red:4:0"]
    )
    state = play(engine, state, "a", "wild:wild4:0", color="blue")
    move = bot_move(engine, state, "b")
    assert move.type == "play" and move.card == "wild:wild4:1" and move.color == "red"
    engine, state = table(
        settings=OFF, a=["wild:wild4:0", "red:1:0", "red:3:0"], b=["wild:wild4:1", "red:2:0", "red:4:0"]
    )
    state = play(engine, state, "a", "wild:wild4:0", color="blue")
    assert bot_move(engine, state, "b") == Action(type="accept")


def test_a_bot_that_misses_its_turn_is_never_scheduled_for_it():
    from app.bots import choose_action
    from app.models import Member
    from app.rooms.bots import next_bot_view

    engine, state = table(
        a=["red:1:0", "red:2:0"], b=["red:3:0", "red:4:0", "red:6:0"], c=["red:7:0", "red:8:0", "red:9:0"]
    )
    bots = [Member(room_id="room", user_id=seat, is_bot=True, seated=True) for seat in "ac"]
    state = play(engine, state, "a", "red:1:0")
    state = act(engine, state, "b", "catch_uno", target="a")
    state = play(engine, state, "b", "red:3:0")
    assert next_bot_view(engine, state, bots)[0] == "c"
    state = engine.apply_action(state, "c", bot_move(engine, state, "c"))
    # The turn passed over the marked bot to the person; no bot is due.
    assert turn(state) == "b" and missed(engine, state) == ["a"]
    assert next_bot_view(engine, state, bots) is None
    with pytest.raises(RuleError):
        choose_action(engine.project_view(state, "a"), "a", {})


@pytest.mark.parametrize("game,settings", CONFIGURATIONS)
@pytest.mark.parametrize("count,seed", [(2, 3), (2, 19), (3, 11), ("max", 29)])
def test_bots_finish_every_configuration_and_serve_missed_turns(game, settings, count, seed):
    from app.bots import choose_action

    engine = ENGINES[game]
    count = engine.manifest.max_players if count == "max" else count
    players = [f"p{i}" for i in range(count)]
    state = engine.setup(players, dict(settings), seed=seed)
    memory = {p: {"seed": f"stack:{seed}:{p}"} for p in players}
    lazy = random.Random(seed)  # half the time a catcher is quicker than the UNO call
    caught = served = 0
    for _ in range(6000):
        conserved(engine, state)
        if state["phase"] == "finished":
            break
        catchers, callers = (
            [p for p in players if kind in kinds(engine, state, p)] for kind in ("catch_uno", "uno")
        )
        actor = (
            catchers[0] if catchers and lazy.random() < 0.5
            else callers[0] if callers
            else turn(state)
        )
        decision = choose_action(engine.project_view(state, actor), actor, memory[actor])
        memory[actor] = decision.memory
        state = engine.apply_action(state, actor, decision.action)
        if decision.action.type == "catch_uno":
            caught += 1
        elif decision.action.type != "uno":
            served += len(state["last_event"]["missed"])
    assert state["phase"] == "finished" and len(state["winners"]) == 1
    assert state["missing"] == [] and served <= caught
