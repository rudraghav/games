import json
import random

import pytest

from app.core.contracts import Action, RuleError
from app.games.board.four import FourEngine
from app.games.board.reversi import ReversiEngine, captures
from app.games.gem_market.deck import ALL_COLORS, CARDS, COLORS
from app.games.gem_market.engine import GemMarketEngine, payment
from app.games.word_agents.engine import WordAgentsEngine


@pytest.mark.parametrize("columns", [[0, 0, 1, 1, 2, 2, 3], [0, 1, 0, 1, 0, 1, 0]])
def test_four_gravity_lines_and_immutability(columns):
    engine = FourEngine()
    state = engine.setup(["a", "b"], {})
    for column in columns:
        before = json.dumps(state)
        result = engine.apply_action(state, state["order"][state["turn"]], Action(type="drop", choice=str(column)))
        assert json.dumps(state) == before
        state = result
    assert state["winners"] == ["a"] and state["phase"] == "finished"
    assert not engine.legal_actions(state, "b")


def test_four_diagonal_full_column_and_draw():
    engine = FourEngine()
    state = engine.setup(["a", "b"], {})
    for row, column, seat in [(5, 0, 0), (5, 1, 1), (4, 1, 0), (5, 2, 1), (4, 2, 1),
                              (3, 2, 0), (5, 3, 1), (4, 3, 0), (3, 3, 1), (5, 6, 0)]:
        state["board"][row * 7 + column] = seat
    assert engine.apply_action(state, "a", Action(type="drop", choice="3"))["winners"] == ["a"]
    state = engine.setup(["a", "b"], {})
    for row in range(6):
        state["board"][row * 7] = row % 2
    with pytest.raises(RuleError):
        engine.apply_action(state, "a", Action(type="drop", choice="0"))
    state["board"] = [((column // 2) + row) % 2 for row in range(6) for column in range(7)]
    state["board"][2], state["turn"] = None, 1
    result = engine.apply_action(state, "b", Action(type="drop", choice="2"))
    assert result["draw"] and not result["winners"] and result["phase"] == "finished"


def test_reversi_opening_and_eight_directions():
    engine = ReversiEngine()
    state = engine.setup(["a", "b"], {})
    assert len(engine.legal_actions(state, "a")) == 4
    with pytest.raises(RuleError):
        engine.apply_action(state, "a", Action(type="place", choice="0"))
    state["board"] = [None] * 64
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            if dr or dc:
                state["board"][(3 + dr) * 8 + 3 + dc] = 1
                state["board"][(3 + 2 * dr) * 8 + 3 + 2 * dc] = 0
    assert len(captures(state["board"], 27, 0)) == 8
    result = engine.apply_action(state, "a", Action(type="place", choice="27"))
    assert result["scores"] == {"a": 17, "b": 0} and result["winners"] == ["a"]


def test_reversi_forced_pass_and_terminal_scoring():
    engine = ReversiEngine()
    state = engine.setup(["a", "b"], {})
    state["board"] = [0] * 64
    state["board"][0] = state["board"][63] = None
    state["board"][1] = state["board"][62] = 1
    state = engine.apply_action(state, "a", Action(type="place", choice="0"))
    assert state["turn"] == 0 and "passes" in state["message"]
    state = engine.apply_action(state, "a", Action(type="place", choice="63"))
    assert state["scores"] == {"a": 64, "b": 0} and state["phase"] == "finished"


def word_spread():
    engine = WordAgentsEngine()
    players = [f"p{i}" for i in range(6)]
    state = engine.setup(players, {}, seed=4)
    team = state["active_team"]
    state = engine.apply_action(state, players[team], Action(type="clue", choice="galactic", amount=1))
    return engine, players, state, team


def test_word_agents_key_privacy_and_team_permissions():
    engine, players, state, team = word_spread()
    assert {c.color for c in engine.project_view(state, players[0]).community} == {"coral", "blue", "neutral", "assassin"}
    for viewer in [*players[2:], "outsider"]:
        view = engine.project_view(state, viewer)
        assert {c.color for c in view.community} == {"unknown"}
        assert "key" not in view.detail
    assert engine.legal_actions(state, players[4 + team])
    assert not engine.legal_actions(state, players[3 - team])
    assert not any(o.action.type == "end_guesses" for o in engine.legal_actions(state, players[2 + team]))


def test_word_agents_guess_limit_and_assassin():
    engine, players, state, team = word_spread()
    own = [i for i, role in enumerate(state["key"]) if role == team]
    for cell in own[:2]:
        state = engine.apply_action(state, players[2 + team], Action(type="guess", choice=str(cell)))
    assert state["phase"] == "clue" and state["active_team"] == 1 - team
    engine, players, state, team = word_spread()
    state = engine.apply_action(state, players[2 + team], Action(type="guess", choice=str(state["key"].index(3))))
    assert state["phase"] == "finished"
    assert state["winners"] == [p for i, p in enumerate(players) if i % 2 != team]


def test_word_agents_last_enemy_agent_and_bad_clue():
    engine, players, state, team = word_spread()
    targets = [i for i, role in enumerate(state["key"]) if role == 1 - team]
    for cell in targets[:-1]:
        state["revealed"][cell] = True
    state = engine.apply_action(state, players[2 + team], Action(type="guess", choice=str(targets[-1])))
    assert state["winners"] == [p for i, p in enumerate(players) if i % 2 != team]
    state = engine.setup(players, {}, seed=1)
    actor = players[state["turn"]]
    for clue in (state["words"][0], "two words", "", "x" * 33):
        with pytest.raises(RuleError):
            engine.apply_action(state, actor, Action(type="clue", choice=clue, amount=1))
    with pytest.raises(RuleError):
        engine.apply_action(state, actor, Action(type="clue", choice="galactic", amount=1, target="c"))


def assert_market_conservation(state):
    locations = [*state["decks"].values(), *state["market"].values(), *state["bought"].values(), *state["reserved"].values()]
    cards = [card for location in locations for card in location]
    assert len(cards) == len(set(cards)) == len(CARDS) == 90
    for color in ALL_COLORS:
        expected = 5 if color == "gold" else {2: 4, 3: 5, 4: 7}[len(state["order"])]
        assert state["bank"][color] + sum(held[color] for held in state["tokens"].values()) == expected
        assert state["bank"][color] >= 0 and all(held[color] >= 0 for held in state["tokens"].values())


def test_gems_reserve_privacy_and_pair_threshold():
    engine = GemMarketEngine()
    state = engine.setup(["a", "b"], {}, seed=17)
    after = engine.apply_action(state, "a", Action(type="reserve_blind", choice="1"))
    card = after["reserved"]["a"][0]
    assert card not in engine.project_view(after, "b").model_dump_json()
    assert card in engine.project_view(after, "a").model_dump_json()
    assert_market_conservation(after)
    state = engine.apply_action(state, "a", Action(type="take_pair", choice="ruby"))
    assert not any(o.action.type == "take_pair" and o.action.choice == "ruby" for o in engine.legal_actions(state, "b"))
    assert_market_conservation(state)


def test_gems_discount_gold_and_return_limit():
    engine = GemMarketEngine()
    state = engine.setup(["a", "b"], {}, seed=17)
    target = next(c for c, card in CARDS.items() if list(card.cost.values()) == [4])
    color = next(iter(CARDS[target].cost))
    state["bought"]["a"] = [next(c for c, card in CARDS.items() if card.bonus == color)]
    state["tokens"]["a"][color], state["tokens"]["a"]["gold"] = 2, 1
    paid = payment(state, "a", target)
    assert paid[color] == 2 and paid["gold"] == 1
    state["tokens"]["a"]["gold"] = 0
    assert payment(state, "a", target) is None
    state = engine.setup(["a", "b"], {}, seed=17)
    for c, amount in zip(COLORS, [3, 3, 3, 2, 0], strict=True):
        state["tokens"]["a"][c], state["bank"][c] = amount, state["bank"][c] - amount
    state["phase"] = "return_tokens"
    state = engine.apply_action(state, "a", Action(type="return", choice="pearl"))
    assert sum(state["tokens"]["a"].values()) == 10 and state["turn"] == 1
    assert_market_conservation(state)


@pytest.mark.parametrize("count", [2, 4])
def test_gems_complete_match_conserves_chips_and_cards(count):
    engine = GemMarketEngine()
    players = [f"p{i}" for i in range(count)]
    state = engine.setup(players, {}, seed=19)
    randomizer = random.Random(24)
    for _ in range(4000):
        assert_market_conservation(state)
        if state["phase"] == "finished":
            break
        actor = players[state["turn"]]
        options = engine.legal_actions(state, actor)
        buys = [o for o in options if o.action.type == "buy"]
        state = engine.apply_action(state, actor, randomizer.choice(buys or options).action)
    assert state["phase"] == "finished" and state["winners"]
