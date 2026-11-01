import pytest

from app.core.contracts import Action
from app.games.gem_market.deck import CARDS, COLORS
from app.games.gem_market.engine import GemMarketEngine, bonuses, score


def give_development(state, player, ident):
    for zone in [*state["decks"].values(), *state["market"].values()]:
        if ident in zone:
            zone.remove(ident)
    state["bought"][player].append(ident)
    for tier, row in state["market"].items():
        while len(row) < 4 and state["decks"][tier]:
            row.append(state["decks"][tier].pop())


@pytest.mark.parametrize("tie", [False, True])
def test_final_round_and_fewer_developments_tiebreak(tie):
    engine = GemMarketEngine()
    state = engine.setup(["a", "b"], {}, seed=17)
    used = set()

    def give_points(player, points):
        for value in points:
            ident = next(c for c, card in CARDS.items() if card.points == value and c not in used)
            used.add(ident)
            give_development(state, player, ident)

    give_points("a", [5, 5, 5] if tie else [5, 5, 4])
    actor = "b" if tie else "a"
    if tie:
        give_points("b", [5, 5, 4])
        state["turn"], state["final_round"] = 1, True
    target = next(c for c in state["market"]["1"] if CARDS[c].points == 1)
    discount = bonuses(state, actor)
    for color, cost in CARDS[target].cost.items():
        required = max(0, cost - discount[color])
        state["tokens"][actor][color] = required
        state["bank"][color] -= required
    state = engine.apply_action(state, actor, Action(type="buy", card=target))
    if not tie:
        assert state["final_round"] and state["turn"] == 1 and state["phase"] != "finished"
        option = next(o for o in engine.legal_actions(state, "b") if o.action.type == "take_pair")
        state = engine.apply_action(state, "b", option.action)
    else:
        assert score(state, "a") == score(state, "b") == 15
    assert state["phase"] == "finished" and state["winners"] == ["a"]


def test_multiple_eligible_patrons_only_one_per_turn():
    engine = GemMarketEngine()
    state = engine.setup(["a", "b"], {}, seed=17)
    for color in COLORS[:4]:
        for ident in [c for c, card in CARDS.items() if card.bonus == color and card.points == 0][:3]:
            give_development(state, "a", ident)
    state["patrons"] = ["patron-0", "patron-1", "patron-9"]
    state = engine.apply_action(state, "a", Action(type="take_pair", choice="ruby"))
    assert state["phase"] == "patron"
    assert len(engine.legal_actions(state, "a")) == 2
    state = engine.apply_action(state, "a", Action(type="patron", card="patron-0"))
    assert state["claimed"]["a"] == ["patron-0"] and "patron-1" in state["patrons"]
    assert state["turn"] == 1 and not engine.legal_actions(state, "a")
