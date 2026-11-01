from copy import deepcopy

from app.core.cards import draw
from app.core.contracts import Action
from app.games.uno.engine import UnoEngine


def situation(mercy=False):
    engine = UnoEngine(mercy)
    state = engine.setup(["a", "b"], {}, seed=1)
    state.update(
        turn=0,
        color="red",
        pending=None,
        penalty=0,
        penalty_floor=0,
        discard=["red:5:0"],
        hands={"a": ["red:draw2:0"], "b": ["blue:9:0"]},
        deck=["yellow:2:0", "green:3:0", "blue:4:0", "red:8:0", "yellow:6:0", "green:1:0"],
    )
    return engine, state


def test_classic_final_draw_two_is_counted_before_scoring():
    engine, state = situation()
    result = engine.apply_action(state, "a", Action(type="play", card="red:draw2:0"))
    assert result["phase"] == "finished"
    assert len(result["hands"]["b"]) == 3
    assert result["scores"]["a"] == 16


def test_classic_final_wild_four_preserves_challenge_and_scores_draw():
    engine, state = situation()
    state["hands"]["a"] = ["wild:wild4:0"]
    result = engine.apply_action(state, "a", Action(type="play", card="wild:wild4:0", color="blue"))
    assert result["phase"] != "finished" and not result["winners"]
    result = engine.apply_action(result, "b", Action(type="accept"))
    assert result["phase"] == "finished" and result["winners"] == ["a"]
    assert len(result["hands"]["b"]) == 5


def test_no_mercy_final_draw_wins_immediately():
    engine, state = situation(True)
    result = engine.apply_action(state, "a", Action(type="play", card="red:draw2:0"))
    assert result["winners"] == ["a"] and result["hands"]["b"] == ["blue:9:0"]


def test_roulette_stops_on_immediate_elimination_without_stock_loop():
    engine, state = situation(True)
    state.update(turn=1, pending={"type": "roulette"})
    state["hands"]["a"] = ["red:1:0"]
    state["hands"]["b"] = [f"blue:{i % 10}:{i}" for i in range(24)]
    state["deck"] = ["green:2:0", "wild:wild6:0"]
    result = engine.apply_action(state, "b", Action(type="choose", color="yellow"))
    assert result["winners"] == ["a"] and len(result["hands"]["b"]) == 25


def test_all_classic_opening_action_effects_are_reachable_and_decks_conserved():
    engine = UnoEngine()
    seen = set()
    for seed in range(150):
        state = engine.setup(["a", "b", "c"], {}, seed=seed)
        kind = state["discard"][-1].split(":")[1]
        seen.add(kind)
        assert (
            len(state["deck"]) + len(state["discard"]) + sum(map(len, state["hands"].values()))
            == 108
        )
        assert kind != "wild4"
        if kind == "draw2":
            assert state["turn"] == 1 and len(state["hands"]["a"]) == 9
        elif kind == "skip":
            assert state["turn"] == 1
        elif kind == "reverse":
            assert state["turn"] == 2 and state["direction"] == -1
        elif kind == "wild":
            state = engine.apply_action(state, "a", Action(type="choose", color="green"))
            assert state["color"] == "green" and state["turn"] == 0
    assert {"wild", "draw2", "reverse", "skip"} <= seen


def test_recycling_is_reproducible_without_revealing_private_shuffle_context():
    engine, state = situation()
    state["deck"] = []
    state["discard"] = ["red:3:0", "blue:4:0", "green:2:0", "red:5:0"]
    first, second = deepcopy(state), deepcopy(state)
    assert draw(first, 3) == draw(second, 3)
    assert first == second and first["discard"] == ["red:5:0"]
    assert "_shuffle_key" not in engine.project_view(first, "a").model_dump_json()
