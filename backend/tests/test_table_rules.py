"""Independent rule outcomes, not only self-consistent legal-action playthroughs."""

import json
import random
from collections import Counter

import pytest

from app.core.cards import blackjack_total, poker_rank, standard_deck, teen_rank
from app.core.contracts import Action, RuleError
from app.games.blackjack.engine import BlackjackEngine
from app.games.holdem.engine import HoldemEngine
from app.games.registry import ENGINES
from app.games.rummy.engine import RummyEngine
from app.games.rummy.melds import deadwood, meld_type, valid_declaration
from app.games.skyjo.engine import SkyjoEngine
from app.games.teen_patti.engine import TeenPattiEngine


def action(engine, state, kind, **kwargs):
    actor = engine.project_view(state, state["order"][0]).current_player
    return engine.apply_action(state, actor, Action(type=kind, **kwargs))


def test_holdem_heads_up_order_and_full_raise_size():
    engine = HoldemEngine()
    state = engine.setup(["a", "b"], {}, seed=2)
    assert state["turn"] == 0
    assert state["players"]["a"]["bet"] == 1
    assert state["players"]["b"]["bet"] == 2
    state = action(engine, state, "call")
    state = action(engine, state, "check")
    assert state["phase"] == "flop" and state["turn"] == 1
    assert len(state["board"]) == 3 and len(state["burn"]) == 1
    state = action(engine, state, "raise", amount=6)
    raise_option = next(o for o in engine.legal_actions(state, "a") if o.action.type == "raise")
    assert raise_option.minimum == 12
    with pytest.raises(RuleError):
        engine.apply_action(state, "a", Action(type="raise", amount=11))


@pytest.mark.parametrize("cumulative", [False, True])
def test_holdem_short_all_in_reopens_only_after_full_cumulative_increase(cumulative):
    engine = HoldemEngine()
    state = engine.setup(["a", "b", "c", "d"], {}, seed=2)
    state = action(engine, state, "raise", amount=10)
    state["players"]["a"]["chips"] = 14
    state = action(engine, state, "all_in")
    if cumulative:
        state["players"]["b"]["chips"] = 17
        state = action(engine, state, "all_in")
    else:
        state = action(engine, state, "call")
    state = action(engine, state, "call")
    assert state["order"][state["turn"]] == "d"
    raises = [o for o in engine.legal_actions(state, "d") if o.action.type == "raise"]
    assert bool(raises) is cumulative
    if raises:
        assert raises[0].minimum == 26
    else:
        assert not any(o.action.type == "all_in" for o in engine.legal_actions(state, "d"))


def test_holdem_uncalled_refund_is_not_a_winning_side_pot():
    engine = HoldemEngine()
    state = engine.setup(["a", "b"], {}, seed=2)
    state["board"] = ["2S:0", "3H:0", "4D:0", "9C:0", "TH:0"]
    state["players"]["a"].update(cards=["AS:0", "5S:0"], total=20, chips=180)
    state["players"]["b"].update(cards=["KS:0", "KH:0"], total=100, chips=100)
    engine._settle(state, True)
    assert state["winners"] == ["a"]
    assert state["pots"] == [{"amount": 40, "winners": ["a"], "eligible": ["a", "b"],
                              "awards": {"a": 40}, "odd_chips": []}]
    assert state["refunds"] == {"b": 80}
    assert [state["players"][p]["chips"] for p in ["a", "b"]] == [220, 180]
    assert engine.project_view(state, "a").pot == 40


def test_holdem_cannot_raise_when_only_opponent_is_all_in():
    engine = HoldemEngine()
    state = engine.setup(["a", "b"], {}, seed=2)
    state = engine.apply_action(state, "a", Action(type="call"))
    state = engine.apply_action(state, "b", Action(type="all_in"))
    assert [o.action.type for o in engine.legal_actions(state, "a")] == ["fold", "call", "all_in"]
    # A deeper remaining stack cannot wager against a player with no chips left.
    state["players"]["a"]["chips"] += 50
    assert [o.action.type for o in engine.legal_actions(state, "a")] == ["fold", "call"]


def test_holdem_split_pot_odd_chip_starts_left_of_button():
    engine = HoldemEngine()
    state = engine.setup(["a", "b", "c"], {}, seed=2)
    state["board"] = ["AS:0", "KS:0", "QS:0", "JS:0", "TS:0"]
    for p in state["order"]:
        state["players"][p].update(total=5, chips=195)
    state["players"]["c"]["folded"] = True
    engine._settle(state, True)
    assert [state["players"][p]["chips"] for p in state["order"]] == [202, 203, 195]
    assert state["winners"] == ["a", "b"]
    assert not engine.project_view(state, "a").players[2].cards


def test_poker_rank_categories_wheel_and_kickers():
    hands = [
        ["AS", "KH", "JD", "8C", "4S"],
        ["AS", "AH", "JD", "8C", "4S"],
        ["AS", "AH", "JD", "JC", "4S"],
        ["AS", "AH", "AD", "8C", "4S"],
        ["AS", "2H", "3D", "4C", "5S"],
        ["AS", "JS", "9S", "8S", "4S"],
        ["AS", "AH", "AD", "8C", "8S"],
        ["AS", "AH", "AD", "AC", "4S"],
        ["9S", "TS", "JS", "QS", "KS"],
    ]
    ranked = [poker_rank([c + ":0" for c in cards]) for cards in hands]
    assert [r[0] for r in ranked] == list(range(9))
    assert sorted(ranked) == ranked
    assert poker_rank([c + ":0" for c in ["2S", "3H", "4D", "5C", "6S"]]) > ranked[4]


def blackjack_scenario(dealer, hand, future=(), settings=None, bet=10):
    engine = BlackjackEngine()
    state = engine.setup(["a"], settings or {}, seed=1)
    draws = [*dealer, *hand, *future]
    assert len(draws) == len(set(draws))
    state["deck"] = [c for c in state["deck"] if c not in draws] + list(reversed(draws))
    return engine, engine.apply_action(state, "a", Action(type="bet", amount=bet))


def test_blackjack_natural_payout_and_dealer_peek():
    engine, state = blackjack_scenario(["TS:0", "7H:0"], ["AS:0", "KD:0"])
    assert state["phase"] == "finished" and state["players"]["a"]["chips"] == 215
    engine, state = blackjack_scenario(["TS:0", "AH:0"], ["9S:0", "KD:0"])
    assert state["phase"] == "finished" and state["players"]["a"]["chips"] == 190


def test_blackjack_insurance_funding_and_natural_push():
    engine, state = blackjack_scenario(["AS:0", "KH:0"], ["AH:0", "KD:0"])
    view = engine.project_view(state, "a")
    assert len(view.community) == 1 and view.detail["dealer_hidden"]
    state = engine.apply_action(state, "a", Action(type="accept"))
    assert state["phase"] == "finished" and state["players"]["a"]["chips"] == 210
    engine, state = blackjack_scenario(["AS:0", "KH:0"], ["9H:0", "KD:0"], bet=200)
    assert [o.action.type for o in engine.legal_actions(state, "a")] == ["decline"]
    with pytest.raises(RuleError):
        engine.apply_action(state, "a", Action(type="accept"))


def test_blackjack_split_twenty_one_is_complete_but_not_natural():
    engine, state = blackjack_scenario(["TS:0", "7H:0"], ["TH:0", "TD:0"],
                                       ["AS:0", "AH:0"])
    state = engine.apply_action(state, "a", Action(type="split"))
    assert state["phase"] == "finished"
    assert state["players"]["a"]["chips"] == 220
    assert all(hand["done"] and hand["split"] for hand in state["players"]["a"]["hands"])


def test_blackjack_split_aces_one_card_and_double_one_card():
    engine, state = blackjack_scenario(["TS:0", "7H:0"], ["AS:0", "AH:0"],
                                       ["2S:0", "3H:0"])
    state = engine.apply_action(state, "a", Action(type="split"))
    assert state["phase"] == "finished"
    assert [len(hand["cards"]) for hand in state["players"]["a"]["hands"]] == [2, 2]
    engine, state = blackjack_scenario(["TS:0", "7H:0"], ["5S:0", "6H:0"], ["TD:0"])
    state = engine.apply_action(state, "a", Action(type="double"))
    assert state["phase"] == "finished" and state["players"]["a"]["chips"] == 220
    assert len(state["players"]["a"]["hands"][0]["cards"]) == 3


@pytest.mark.parametrize("hit_soft_17,expected", [(False, 200), (True, 210)])
def test_blackjack_dealer_soft_seventeen_variant(hit_soft_17, expected):
    engine, state = blackjack_scenario(["AS:0", "6H:0"], ["TS:0", "7H:0"],
                                       ["5S:0", "KD:0"], {"hit_soft_17": hit_soft_17})
    state = engine.apply_action(state, "a", Action(type="decline"))
    state = engine.apply_action(state, "a", Action(type="stand"))
    assert state["players"]["a"]["chips"] == expected
    assert blackjack_total(state["dealer"])[0] == (22 if hit_soft_17 else 17)


def test_teen_patti_blind_stakes_seen_show_and_sideshow_ties():
    engine = TeenPattiEngine()
    state = engine.setup(["a", "b", "c"], {}, seed=1)
    assert not engine.project_view(state, "a").hand
    state = engine.apply_action(state, "a", Action(type="peek"))
    assert len(engine.project_view(state, "a").hand) == 3
    assert next(o for o in engine.legal_actions(state, "a") if o.action.type == "bet").step == 2
    with pytest.raises(RuleError):
        engine.apply_action(state, "a", Action(type="bet", amount=3))
    state["players"]["c"]["seen"] = True
    state["players"]["a"]["cards"] = ["2S:0", "3S:0", "4S:0"]
    state["players"]["c"]["cards"] = ["2H:0", "3H:0", "4H:0"]
    state = engine.apply_action(state, "a", Action(type="sideshow"))
    assert not engine.legal_actions(state, "b")
    assert engine.project_view(state, "b").current_player == "c"
    state = engine.apply_action(state, "c", Action(type="accept"))
    assert state["players"]["a"]["folded"] and state["turn"] == 1
    assert sum(p["chips"] for p in state["players"].values()) + state["pot"] == 600
    state = engine.setup(["a", "b"], {}, seed=1)
    state = engine.apply_action(state, "a", Action(type="peek"))
    assert not any(o.action.type == "show" for o in engine.legal_actions(state, "a"))
    state["players"]["b"]["seen"] = True
    assert any(o.action.type == "show" for o in engine.legal_actions(state, "a"))


def test_teen_patti_show_tie_loses_requester_and_house_sequence_order():
    engine = TeenPattiEngine()
    state = engine.setup(["a", "b"], {}, seed=1)
    state["players"]["a"]["cards"] = ["AS:0", "KH:0", "QD:0"]
    state["players"]["b"]["cards"] = ["AH:0", "KD:0", "QC:0"]
    state = engine.apply_action(state, "a", Action(type="show"))
    assert state["winners"] == ["b"]
    assert sum(p["chips"] for p in state["players"].values()) == 400
    assert teen_rank(["AS:0", "KH:0", "QD:0"]) > teen_rank(["AS:0", "2H:0", "3D:0"])


def test_rummy_scoring_requires_both_sequences_and_pure():
    one_sequence = ["2S:0", "3S:0", "4S:0", "7H:0", "7D:0", "7C:0",
                    "9H:0", "9D:0", "9C:0", "JH:0", "JD:0", "JC:0", "KH:0"]
    assert deadwood(one_sequence, "A") == 80
    two_sequences = ["2S:0", "3S:0", "4S:0", "5H:0", "6H:0", "7H:0",
                     "9H:0", "9D:0", "9C:0", "JH:0", "JD:0", "JC:0", "KH:0"]
    assert deadwood(two_sequences, "A") == 10
    assert meld_type(["2S:0", "3S:0", "4S:0"], "3") == (True, True)
    assert meld_type(["KS:0", "AS:0", "2S:0"], "9") is None
    assert meld_type(["8S:0", "8S:1", "JK:0"], "9") is None


@pytest.mark.parametrize("count", [2, 6])
def test_rummy_conserved_valid_declaration_at_both_limits(count):
    engine = RummyEngine()
    players = [f"p{i}" for i in range(count)]
    state = engine.setup(players, {}, seed=31)
    # A controlled local deal, not a claim that a random browser chose these cards.
    winning = ["AS:0", "2S:0", "3S:0", "4H:0", "5H:0", "6H:0", "7H:0",
               "8S:0", "8H:0", "8D:0", "KC:0", "KD:0", "KH:0"]
    all_cards = standard_deck(2, 2)
    state["cut"], state["wild"] = "9C:0", "9"
    others = [c for c in all_cards if c not in {*winning, state["cut"], "TS:0"}]
    state["hands"][players[0]] = winning
    for p in players[1:]:
        state["hands"][p], others = others[:13], others[13:]
    state["discard"] = [others.pop()]
    state["deck"] = others + ["TS:0"]
    state = engine.apply_action(state, players[0], Action(type="draw_stock"))
    assert valid_declaration(winning, state["wild"])
    state = engine.apply_action(state, players[0], Action(type="declare", card="TS:0"))
    assert state["phase"] == "finished" and state["winners"] == [players[0]]
    assert sum(state["scores"].values()) == 0
    assert Counter(state["deck"] + state["discard"] + [state["cut"]]
                   + sum(state["hands"].values(), [])) == Counter(all_cards)


def test_rummy_open_pickup_cannot_immediately_be_discarded():
    engine = RummyEngine()
    state = engine.setup(["a", "b"], {}, seed=31)
    while state["discard"][-1].startswith("JK") or state["discard"][-1][0] == state["wild"]:
        state["discard"].append(state["deck"].pop())
    card = state["discard"][-1]
    state = engine.apply_action(state, "a", Action(type="draw_discard"))
    assert not any(o.action.card == card for o in engine.legal_actions(state, "a"))
    with pytest.raises(RuleError):
        engine.apply_action(state, "a", Action(type="discard", card=card))


def test_rummy_false_declaration_and_first_later_drop_penalties():
    engine = RummyEngine()
    state = engine.setup(["a", "b", "c"], {}, seed=31)
    state = engine.apply_action(state, "a", Action(type="fold"))
    assert state["dropped"]["a"] == 20
    state = engine.apply_action(state, "b", Action(type="draw_stock"))
    # This fixture is deliberately not partitionable into valid melds.
    assert not valid_declaration(state["hands"]["b"][:-1], state["wild"])
    state = engine.apply_action(state, "b", Action(type="declare", card=state["hands"]["b"][-1]))
    assert state["phase"] == "finished" and state["winners"] == ["c"]
    assert state["scores"] == {"a": -20, "b": -80, "c": 100}
    state = engine.setup(["a", "b"], {}, seed=31)
    for _ in range(2):
        actor = state["order"][state["turn"]]
        state = engine.apply_action(state, actor, Action(type="draw_stock"))
        state = engine.apply_action(state, actor, Action(type="discard", card=state["hands"][actor][-1]))
    state = engine.apply_action(state, "a", Action(type="fold"))
    assert state["scores"] == {"a": -40, "b": 40}


def test_skyjo_final_reveal_removes_columns_before_double_and_scoring():
    engine = SkyjoEngine()
    state = engine.setup(["a", "b"], {}, seed=31)
    # A has ended; B's final turn reveals the rest at scoring, including a 7 column.
    state.update(phase="reveal", turn=1, finisher="a", remaining=["b"])
    state["grids"]["a"] = ["sky:1:0"] + [None] * 11
    state["revealed"]["a"] = [True] * 12
    state["grids"]["b"] = ["sky:7:0", "sky:2:0", None, None,
                              "sky:7:1", None, None, None,
                              "sky:7:2", None, None, None]
    state["revealed"]["b"] = [False] * 12
    state = engine.apply_action(state, "b", Action(type="reveal", slot=1))
    assert state["phase"] == "between_rounds"
    assert state["round_scores"] == {"a": 1, "b": 2}
    assert all(state["grids"]["b"][i] is None for i in [0, 4, 8])
    state = engine.apply_action(state, "a", Action(type="next_round"))
    for _ in range(4):
        state = action(engine, state, "reveal", slot=next(
            o.action.slot for o in engine.legal_actions(state, state["order"][state["turn"]])))
    assert state["order"][state["turn"]] == "a" and state["round"] == 2


@pytest.mark.parametrize("value,expected", [(2, 4), (0, 0), (-1, -1)])
def test_skyjo_finisher_ties_double_positive_scores_only(value, expected):
    engine = SkyjoEngine()
    state = engine.setup(["a", "b", "c"], {}, seed=31)
    state.update(phase="reveal", turn=0)
    state["grids"] = {p: [f"sky:{value}:{i}"] + [None] * 11
                       for i, p in enumerate(state["order"])}
    state["revealed"] = {p: [False] * 12 for p in state["order"]}
    state = engine.apply_action(state, "a", Action(type="reveal", slot=0))
    assert state["finisher"] == "a" and state["remaining"] == ["b", "c"]
    for p in ["b", "c"]:
        state = engine.apply_action(state, p, Action(type="draw_stock"))
        state = engine.apply_action(state, p, Action(type="discard"))
        state = engine.apply_action(state, p, Action(type="reveal", slot=0))
    assert state["round_scores"] == {"a": expected, "b": value, "c": value}


def test_teen_patti_pot_cap_forces_multiway_showdown_without_chip_loss():
    engine = TeenPattiEngine()
    state = engine.setup(["a", "b", "c", "d", "e", "f"], {}, seed=29)
    for _ in range(100):
        if state["phase"] == "finished":
            break
        actor = state["order"][state["turn"]]
        bets = [o for o in engine.legal_actions(state, actor) if o.action.type == "bet"]
        state = engine.apply_action(state, actor,
                                    bets[0].action.model_copy(update={"amount": bets[0].maximum})
                                    if bets else Action(type="fold"))
    assert state["phase"] == "finished" and state["pot"] >= 1024
    assert len(state["shown"]) > 2
    assert sum(p["chips"] for p in state["players"].values()) == 1200


def test_teen_patti_sideshow_cannot_defer_pot_cap_showdown():
    engine = TeenPattiEngine()
    state = engine.setup(["a", "b", "c", "d", "e", "f"], {}, seed=29)
    state.update(pot=1020, stake=2)
    for p in state["players"].values():
        p.update(chips=30, seen=True)
    state = engine.apply_action(state, "a", Action(type="sideshow"))
    assert state["phase"] == "finished" and state["pending"] is None
    assert len(state["shown"]) == 6 and state["pot"] == 1024
    assert sum(p["chips"] for p in state["players"].values()) == 1200


@pytest.mark.parametrize("game_id", ["holdem", "teen-patti", "blackjack", "skyjo",
                                     "four-in-a-row", "reversi", "word-agents", "gem-market"])
@pytest.mark.parametrize("maximum", [False, True])
def test_table_matches_conserve_inventory_and_reach_results(game_id, maximum):
    engine = ENGINES[game_id]
    count = engine.manifest.max_players if maximum else engine.manifest.min_players
    players = [f"p{i}" for i in range(count)]
    state = engine.setup(players, {}, seed=29)
    chooser = random.Random(31)
    for _ in range(5000):
        if state["phase"] == "finished":
            break
        if game_id in {"holdem", "teen-patti"}:
            assert sum(p["chips"] for p in state["players"].values()) + (
                state["pot"] if game_id == "teen-patti"
                else sum(p["total"] for p in state["players"].values())) == 200 * count
        if game_id == "skyjo":
            cards = state["deck"] + state["discard"] + [c for grid in state["grids"].values() for c in grid if c]
            cards += [state["drawn"]] if state["drawn"] else []
            assert len(cards) == len(set(cards)) == 150
        if game_id in {"holdem", "teen-patti", "blackjack"}:
            cards = state["deck"] + state.get("board", []) + state.get("burn", []) + state.get("dealer", [])
            cards += [c for p in state["players"].values() for c in p.get("cards", [])]
            cards += [c for p in state["players"].values() for h in p.get("hands", []) for c in h["cards"]]
            assert len(cards) == len(set(cards)) == (312 if game_id == "blackjack" else 52)
        actor = engine.project_view(state, players[0]).current_player
        options = engine.legal_actions(state, actor)
        assert options
        preferred = [o for o in options if o.action.type in {
            "check", "call", "show", "decline", "stand", "buy", "draw_stock", "discard",
        }]
        option = chooser.choice(preferred or options)
        move = option.action
        if option.input == "amount":
            move = move.model_copy(update={"amount": option.minimum})
        elif option.input == "text":
            move = move.model_copy(update={"choice": "galactic"})
        before = json.dumps(state, sort_keys=True)
        next_state = engine.apply_action(state, actor, move)
        assert json.dumps(state, sort_keys=True) == before
        state = next_state
    assert state["phase"] == "finished"
    assert all(not engine.legal_actions(state, p) for p in players)
    if game_id in {"holdem", "teen-patti"}:
        assert sum(p["chips"] for p in state["players"].values()) == 200 * count
