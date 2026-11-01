import json
import random

import pytest
from hypothesis import given, settings
from hypothesis import strategies as st

from app.core.cards import blackjack_total, poker_rank, teen_rank
from app.core.contracts import Action, RuleError
from app.games.deal.deck import make_deck
from app.games.registry import ENGINES
from app.games.rummy.melds import deadwood, valid_declaration
from app.games.uno.deck import deck


def test_deck_inventories():
    assert len(deck(False)) == len(set(deck(False))) == 108
    assert len(deck(True)) == len(set(deck(True))) == 168
    assert len(make_deck(False)) == 106
    assert len(make_deck(True)) == 115


@pytest.mark.parametrize("game_id", list(ENGINES))
@pytest.mark.parametrize("maximum", [False, True])
def test_setup_limits_and_hidden_information(game_id, maximum):
    engine = ENGINES[game_id]
    n = engine.manifest.max_players if maximum else engine.manifest.min_players
    players = [f"p{i}" for i in range(n)]
    state = engine.setup(players, {}, seed=17)
    for viewer in players:
        wire = engine.project_view(state, viewer).model_dump_json()
        assert '"deck"' not in wire and '"seed"' not in wire
        for other in players:
            if other == viewer:
                continue
            hidden = state.get("hands", {}).get(other, [])
            if game_id in {"holdem", "teen-patti"}:
                hidden = state["players"][other]["cards"]
            if game_id == "skyjo":
                hidden = state["grids"][other]
            for card in hidden:
                # Number-row cards use native integers internally, while the
                # wire carries distinct string IDs. Searching raw `3` also
                # matches unrelated counts and number-30, giving false leaks.
                card_id = f"number-{card}" if game_id == "six-nimmt" else card
                assert json.dumps(card_id) not in wire
    with pytest.raises(RuleError):
        engine.setup(players + players, {})


@pytest.mark.parametrize("game_id", list(ENGINES))
def test_illegal_action_rejected_without_state_mutation(game_id):
    engine = ENGINES[game_id]
    players = [f"p{i}" for i in range(engine.manifest.min_players)]
    state = engine.setup(players, {}, seed=1)
    original = json.dumps(state, sort_keys=True)
    with pytest.raises(RuleError):
        engine.apply_action(state, players[0], Action(type="invented"))
    assert json.dumps(state, sort_keys=True) == original


def test_rankings_and_soft_aces():
    assert blackjack_total(["AS:0", "AH:0", "9D:0"]) == (21, True)
    assert blackjack_total(["AS:0", "AH:0", "KD:0"]) == (12, False)
    royal = ["AS:0", "KS:0", "QS:0", "JS:0", "TS:0", "2H:0", "3D:0"]
    four = ["AS:0", "AH:0", "AC:0", "AD:0", "KS:0", "2H:0", "3D:0"]
    assert poker_rank(royal) > poker_rank(four)
    assert teen_rank(["AS:0", "AH:0", "AC:0"]) > teen_rank(["KS:0", "QS:0", "JS:0"])
    assert teen_rank(["AS:0", "2H:0", "3C:0"]) > teen_rank(["KS:0", "QH:0", "JC:0"])


def test_rummy_declarations_cover_all_thirteen_and_reject_wrapping():
    hand = [
        "AS:0",
        "2S:0",
        "3S:0",
        "4H:0",
        "5H:0",
        "6H:0",
        "7H:0",
        "8S:0",
        "8H:0",
        "8D:0",
        "KC:0",
        "KD:0",
        "KH:0",
    ]
    assert valid_declaration(hand, "9")
    assert not valid_declaration(hand[:-1], "9")
    assert deadwood(hand, "9") == 0
    invalid = hand.copy()
    invalid[1] = "KS:1"
    assert not valid_declaration(invalid, "9")


def test_no_mercy_ascending_stack_and_elimination():
    engine = ENGINES["uno-no-mercy"]
    s = engine.setup(["a", "b", "c"], {}, seed=9)
    s.update(turn=1, penalty=6, penalty_floor=6)
    s["hands"]["b"] = ["red:draw4:0", "wild:wild10:0"]
    choices = engine.legal_actions(s, "b")
    assert not any(c.action.card == "red:draw4:0" for c in choices)
    chosen = next(c.action for c in choices if c.action.card == "wild:wild10:0")
    after = engine.apply_action(s, "b", chosen)
    assert after["penalty"] == 16
    after["hands"]["c"] = after["hands"]["c"] * 2
    after = engine.apply_action(after, "c", Action(type="draw"))
    assert "c" in after["eliminated"]


def test_holdem_side_pots_and_odd_chip_conservation():
    engine = ENGINES["holdem"]
    s = engine.setup(["a", "b", "c"], {}, seed=1)
    s["board"] = ["2S:0", "3H:0", "4D:0", "9C:0", "TH:0"]
    for p, cards, total in [
        ("a", ["AS:0", "5S:0"], 20),
        ("b", ["KS:0", "KH:0"], 50),
        ("c", ["QS:0", "QH:0"], 100),
    ]:
        s["players"][p].update(cards=cards, total=total, chips=200 - total, folded=False)
    engine._settle(s, True)
    assert [s["players"][p]["chips"] for p in ["a", "b", "c"]] == [240, 210, 150]
    assert sum(p["chips"] for p in s["players"].values()) == 600


@pytest.mark.parametrize(
    "game_id", ["uno", "uno-no-mercy", "holdem", "teen-patti", "blackjack", "skyjo"]
)
@pytest.mark.parametrize("seed", [2, 19, 47])
def test_complete_legal_playthroughs(game_id, seed):
    engine = ENGINES[game_id]
    players = ["a", "b", "c"]
    s = engine.setup(players, {}, seed=seed)
    chooser = random.Random(seed)
    for _ in range(5000):
        if s["phase"] == "finished":
            break
        player = engine.project_view(s, "a").current_player
        options = engine.legal_actions(s, player)
        assert options, (game_id, s["phase"], player)
        if game_id == "holdem":
            option = next(o for o in options if o.action.type in {"check", "call"})
        elif game_id == "blackjack":
            option = next(
                (o for o in options if o.action.type in {"bet", "stand", "decline"}), options[0]
            )
        elif game_id == "teen-patti":
            option = next((o for o in options if o.action.type == "show"), options[0])
        else:
            plays = [o for o in options if o.action.type == "play"]
            option = chooser.choice(plays or options)
        action = (
            option.action.model_copy(update={"amount": 10})
            if option.input == "amount"
            else option.action
        )
        original = json.dumps(s, sort_keys=True)
        s2 = engine.apply_action(s, player, action)
        assert json.dumps(s, sort_keys=True) == original
        s = s2
        for p in players:
            engine.project_view(s, p).model_dump_json()
    assert s["phase"] == "finished", (game_id, seed)
    if game_id in {"holdem", "teen-patti"}:
        assert sum(p["chips"] for p in s["players"].values()) == 600


@settings(max_examples=15, deadline=None)
@given(st.integers(min_value=0, max_value=10000))
def test_uno_shuffle_preserves_inventory(seed):
    engine = ENGINES["uno-no-mercy"]
    s = engine.setup(["a", "b", "c"], {}, seed=seed)
    all_cards = s["deck"] + s["discard"] + sum(s["hands"].values(), [])
    assert len(all_cards) == len(set(all_cards)) == 168
