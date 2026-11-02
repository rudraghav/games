import pytest

from app.core.contracts import Action
from app.games.gem_market.deck import CARDS, COLORS
from app.games.gem_market.engine import GemMarketEngine, bonuses, purchase_quote, score


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


def test_purchase_quote_matches_actual_discounted_matching_then_gold_spend():
    engine = GemMarketEngine()
    state = engine.setup(["a", "b"], {}, seed=17)
    target = "gem-1-pearl-0"  # one sapphire, ruby and emerald
    for zone in [*state["decks"].values(), *state["market"].values()]:
        if target in zone:
            zone.remove(target)
    state["reserved"]["a"].append(target)
    give_development(state, "a", "gem-1-ruby-0")
    for color, count in {"sapphire": 1, "gold": 2}.items():
        state["tokens"]["a"][color] = count
        state["bank"][color] -= count
    before = engine.copy(state)
    quote = purchase_quote(state, "a", target)
    assert quote["discount"] == {"sapphire": 0, "ruby": 1, "emerald": 0}
    assert {c: n for c, n in quote["spend"].items() if n} == {"sapphire": 1, "gold": 1}
    assert quote["after"]["gold"] == 1 and quote["shortfall"] == 0
    assert engine.project_view(state, "a").detail["purchase_quotes"][target] == quote
    after = engine.apply_action(state, "a", Action(type="buy", card=target))
    assert after["tokens"]["a"] == quote["after"]
    assert state == before


def test_purchase_quote_shortfall_free_purchase_and_private_reservation_boundary():
    engine = GemMarketEngine()
    state = engine.setup(["a", "b"], {}, seed=17)
    target = "gem-1-pearl-0"
    assert purchase_quote(state, "a", target)["shortfall"] == 3
    assert purchase_quote(state, "a", target)["after"] is None
    for color in ("sapphire", "ruby", "emerald"):
        give_development(state, "a", f"gem-1-{color}-0")
    quote = purchase_quote(state, "a", target)
    assert quote["affordable"] and not any(quote["spend"].values())
    secret = state["decks"]["3"].pop()
    state["reserved"]["b"].append(secret)
    view = engine.project_view(state, "a")
    assert secret not in view.detail["purchase_quotes"]
    assert secret not in view.model_dump_json()
    for _ in range(3):
        state["reserved"]["a"].append(state["decks"]["1"].pop())
    state["tokens"]["a"].update(pearl=4, sapphire=4, ruby=3)
    state["phase"] = "return_tokens"
    view = engine.project_view(state, "a")
    assert view.detail["return_count"] == 1 and view.detail["reservation_limit"] is True
