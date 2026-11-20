from copy import deepcopy

import pytest

from app.core.contracts import Action, RuleError
from app.games.roulette.engine import RouletteEngine

# Clockwise from zero. On the European wheel the numbered pockets alternate
# red/black here, independently checking the engine's by-number colour table.
WHEEL = (
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
    5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
)


def test_every_advertised_bet_on_every_pocket_settles_the_stake_exactly():
    engine = RouletteEngine()
    start = engine.setup(["owner"], {}, seed=2)
    options = engine.legal_actions(start, "owner")
    assert {o.action.choice for o in options} == {
        "low", "high", "even", "odd", "red", "black", *map(str, range(37)),
    }
    assert all((o.input, o.minimum, o.maximum, o.step) == ("amount", 1, 100, 1) for o in options)
    for option in options:
        choice = option.action.choice
        total = wins = 0
        for index, pocket in enumerate(WHEEL):
            color = "green" if pocket == 0 else "red" if index % 2 else "black"
            winning_choices = {str(pocket)}
            if pocket:
                winning_choices.update([color, "odd" if pocket % 2 else "even",
                                        "low" if pocket <= 18 else "high"])
            stake = 7
            expected_payout = stake * (36 if choice.isdecimal() else 2) if choice in winning_choices else 0
            state = {**start, "_pockets": [pocket, *start["_pockets"][1:]]}
            result = engine.apply_action(state, "owner", Action(type="spin", choice=choice, amount=stake))
            view = engine.project_view(result, "owner")
            assert view.detail["history"] == [{
                "spin": 1, "choice": choice, "stake": stake, "pocket": pocket, "color": color,
                "payout": expected_payout, "net": expected_payout - stake,
                "balance": 100 + expected_payout - stake,
            }]
            assert view.players[0].chips == 100 + expected_payout - stake
            assert not state["history"] and state["chips"] == 100
            wins += bool(expected_payout)
            total += expected_payout
        assert wins == (1 if choice.isdecimal() else 18)
        assert total == 36 * stake


@pytest.mark.parametrize(("pockets", "final"), [
    ([1, 1, 1, 1, 1], 105), ([0, 0, 0, 0, 0], 95),
])
def test_five_spins_allow_repeated_pockets_and_end_with_the_exact_net(pockets, final):
    engine = RouletteEngine()
    state = engine.setup(["owner"], {}, seed=13)
    state["_pockets"] = pockets
    action = Action(type="spin", choice="red", amount=1)
    assert engine.apply_action(state, "owner", action) == engine.apply_action(state, "owner", action)
    for i in range(5):
        state = engine.apply_action(state, "owner", action)
        view = engine.project_view(state, "owner")
        assert view.detail["spins_remaining"] == 4 - i
        assert len(view.detail["history"]) == i + 1
    assert view.phase == "finished" and view.current_player is None and not view.actions
    assert view.players[0].chips == final and view.players[0].score == final - 100
    assert engine.outcome(state) == (["owner"] if final > 100 else [])
    with pytest.raises(RuleError):
        engine.apply_action(state, "owner", action)


def test_bankruptcy_zero_hit_and_affordable_next_wager():
    engine = RouletteEngine()
    state = engine.setup(["owner"], {}, seed=19)
    state["_pockets"] = [0] * 5
    spin = Action(type="spin", choice="even", amount=100)
    broke = engine.apply_action(state, "owner", spin)
    empty = engine.project_view(broke, "owner")
    assert empty.phase == "finished" and empty.detail["spins_remaining"] == 0
    assert empty.players[0].chips == 0 and not empty.actions and not empty.winners
    win = engine.apply_action(state, "owner", spin.model_copy(update={"choice": "0"}))
    assert win["chips"] == 3600 and len(win["history"]) == 1
    assert all(o.maximum == 3600 for o in engine.legal_actions(win, "owner"))
    fresh = engine.setup(["owner"], {}, seed=20)
    assert fresh["chips"] == 100 and not fresh["history"] and fresh["phase"] == "betting"


def test_only_settled_spins_are_visible_and_invalid_moves_leave_the_original_intact():
    engine = RouletteEngine()
    state = engine.setup(["owner"], {}, seed=13)
    state = engine.apply_action(state, "owner", Action(type="spin", choice="red", amount=1))
    before = deepcopy(state)
    changed = deepcopy(state)
    changed["_pockets"][1:] = [(n + 1) % 37 for n in changed["_pockets"][1:]]
    assert engine.project_view(state, "owner") == engine.project_view(changed, "owner")
    view = engine.project_view(state, "guest")
    assert view.detail == {} and not view.actions and not view.players and view.current_player is None
    for actor, kind, choice, stake in [
        ("owner", "spin", "00", 1), ("owner", "spin", "37", 1), ("owner", "spin", "red", 0),
        ("owner", "spin", "black", state["chips"] + 1), ("owner", "repeat", "red", 1),
        ("guest", "spin", "0", 1),
    ]:
        with pytest.raises(RuleError):
            engine.apply_action(state, actor, Action(type=kind, choice=choice, amount=stake))
    assert state == before
