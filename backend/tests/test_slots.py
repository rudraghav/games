from collections import Counter
from copy import deepcopy
from fractions import Fraction
from itertools import product

import pytest

from app.core.contracts import Action, RuleError
from app.games.slots.engine import REELS, SlotsEngine

ENGINE = SlotsEngine()
PLAYER = "solo"
EXPECTED = {
    "triple_seven": (1, 100), "triple_star": (8, 15), "triple_bell": (8, 12),
    "triple_lemon": (27, 8), "triple_cherry": (64, 5), "two_cherries": (384, 2),
    "miss": (1236, 0),
}


def spin(state, stake=1):
    return ENGINE.apply_action(state, PLAYER, Action(type="spin", amount=stake))


def test_all_physical_stops_pay_the_published_single_line_return():
    base = ENGINE.setup([PLAYER], {}, seed=17)
    counts = Counter()
    for reel in REELS:
        assert Counter(reel) == {"cherry": 4, "lemon": 3, "bell": 2, "star": 2, "seven": 1}
    for stops in product(range(12), repeat=3):
        base["_stops"][0] = list(stops)
        line = [reel[stop] for reel, stop in zip(REELS, stops, strict=True)]
        if len(set(line)) == 1:
            expected = "triple_" + line[0]
        elif line.count("cherry") == 2:
            expected = "two_cherries"
        else:
            expected = "miss"
        counts[expected] += 1
        for stake in (1, 10):
            moved = spin(base, stake)
            multiplier = EXPECTED[expected][1]
            net = stake * multiplier - stake
            assert moved["history"] == [{
                "spin": 1, "stake": stake, "reels": line, "result": expected,
                "multiplier": multiplier, "payout": stake * multiplier,
                "net": net, "balance": 100 + net,
            }]
            assert moved["chips"] == 100 + net
        assert base["history"] == [] and base["chips"] == 100 and len(base["_stops"]) == 5
    assert counts == {key: ways for key, (ways, _) in EXPECTED.items()}
    detail = ENGINE.project_view(base, PLAYER).detail
    assert {row["result"]: (row["ways"], row["multiplier"]) for row in detail["paytable"]} == EXPECTED
    assert sum(counts.values()) == detail["total_outcomes"] == 1728
    assert sum(counts.values()) - counts["miss"] == detail["winning_outcomes"] == 492
    assert sum(counts[k] * m for k, (_, m) in EXPECTED.items()) == detail["return_numerator"] == 1620
    assert Fraction(detail["return_numerator"], detail["total_outcomes"]) == Fraction(15, 16)


def test_only_settled_lines_are_public_and_future_stops_cannot_affect_a_view():
    state = ENGINE.setup([PLAYER], {}, seed=8)
    other = ENGINE.setup([PLAYER], {}, seed=99)
    assert state["_stops"] != other["_stops"]
    for seat in (PLAYER, "outsider"):
        assert ENGINE.project_view(state, seat) == ENGINE.project_view(other, seat)
    state = spin(state, 4)
    snapshot = deepcopy(state)
    other = {**state, "_stops": [[0, 0, 0]] * 4}
    for seat in (PLAYER, "outsider"):
        view = ENGINE.project_view(state, seat)
        assert view == ENGINE.project_view(other, seat)
        if seat == "outsider":
            assert view.detail == {} and view.players == [] and view.actions == []
            assert view.current_player is None
            continue
        assert set(view.detail) == {
            "chips", "starting_chips", "spin_limit", "spins_remaining", "history", "paytable",
            "total_outcomes", "winning_outcomes", "return_numerator",
        }
        assert view.detail["spins_remaining"] == 4
        assert len(view.detail["history"]) == 1
        assert view.actions
        assert view.message == "Choose your stake and spin."
        assert view.hand == view.community == []
    assert snapshot == state


def test_stakes_and_identity_are_enforced_before_changing_a_spin():
    for seats in ([], [PLAYER, "second"]):
        with pytest.raises(RuleError):
            ENGINE.setup(seats, {}, seed=1)
    state = ENGINE.setup([PLAYER], {}, seed=1)
    before = deepcopy(state)
    for player, action in [
        ("outsider", Action(type="spin", amount=1)),
        (PLAYER, Action(type="spin", amount=0)), (PLAYER, Action(type="spin", amount=11)),
        (PLAYER, Action(type="spin", amount=1, choice="seven")),
        (PLAYER, Action(type="spin", amount=5, slot=2)), (PLAYER, Action(type="bet", amount=1)),
    ]:
        with pytest.raises(RuleError):
            ENGINE.apply_action(state, player, action)
    assert state == before
    low = {**state, "chips": 3}
    (offered,) = ENGINE.legal_actions(low, PLAYER)
    assert (offered.minimum, offered.maximum, offered.step) == (1, 3, 1)
    with pytest.raises(RuleError):
        spin(low, 4)
    assert ENGINE.legal_actions({**state, "chips": 0}, PLAYER) == []


def test_a_five_spin_session_replays_with_identical_results_independent_of_stakes():
    state = ENGINE.setup([PLAYER], {}, seed=311)
    parallel = ENGINE.setup([PLAYER], {}, seed=311)
    for index in range(1, 6):
        before = deepcopy(state)
        next_state = spin(state, index)
        assert state == before and spin(state, index) == next_state
        state, parallel = next_state, spin(parallel, 10)
        assert state["history"][-1]["reels"] == parallel["history"][-1]["reels"]
        view = ENGINE.project_view(state, PLAYER)
        assert view.detail["spins_remaining"] == 5 - index
        assert len(view.detail["history"]) == index
        profit = sum(item["net"] for item in state["history"])
        assert state["chips"] == 100 + profit
        assert (view.players[0].chips, view.players[0].score) == (100 + profit, profit)
        assert (view.phase == "finished") == (index == 5)
    assert view.winners == ([PLAYER] if profit > 0 else [])
    assert view.current_player is None and view.actions == []
    with pytest.raises(RuleError):
        spin(state)
    reset = ENGINE.project_view(ENGINE.setup([PLAYER], {}), PLAYER)
    assert (reset.detail["chips"], reset.detail["spins_remaining"], reset.detail["history"]) == (100, 5, [])


@pytest.mark.parametrize(("last_stake", "net"), [(3, -1), (4, 0), (5, 1)])
def test_finish_records_win_only_for_positive_net(last_stake, net):
    state = ENGINE.setup([PLAYER], {}, seed=41)
    miss = [reel.index(symbol) for reel, symbol in zip(REELS, ("bell", "lemon", "star"), strict=True)]
    pair = [reel.index(symbol) for reel, symbol in zip(REELS, ("cherry", "lemon", "cherry"), strict=True)]
    state["_stops"] = [miss] * 4 + [pair]
    for stake in [1, 1, 1, 1, last_stake]:
        state = spin(state, stake)
    assert state["chips"] == 100 + net
    assert ENGINE.outcome(state) == ([PLAYER] if net > 0 else [])
