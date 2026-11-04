"""Rummy instructions are for the next actor; public penalties are projected for every seat."""

from app.core.contracts import Action
from app.games.rummy.engine import RummyEngine


def test_messages_are_instructions_for_the_seat_that_acts():
    engine = RummyEngine()
    state = engine.setup(["a", "b", "c"], {}, seed=5)
    top = state["discard"][-1]
    assert "Draw from the stock" in state["message"]
    assert ("can’t be taken" in state["message"]) == (top.startswith("JK") or top[0] == state["wild"])
    drawn = engine.apply_action(state, "a", Action(type="draw_stock"))
    assert drawn["message"].startswith("Discard one card, or declare")
    card = next(c for c in drawn["hands"]["a"] if not engine.project_view(drawn, "a").detail["discard_analyses"][c]["valid"])
    false = engine.apply_action(drawn, "a", Action(type="declare", card=card))
    # The next drawer is not told about someone else's false declaration as if it were theirs.
    assert "Invalid declaration" not in false["message"]
    assert false["message"].startswith("Draw from the stock")
    assert false["message"] == engine._draw_prompt(false)


def test_public_out_map_names_drops_and_false_declarations_for_every_seat():
    engine = RummyEngine()
    state = engine.setup(["a", "b", "c"], {}, seed=5)
    state = engine.apply_action(state, "a", Action(type="draw_stock"))
    card = state["hands"]["a"][0]
    state = engine.apply_action(state, "a", Action(type="declare", card=card))
    state = engine.apply_action(state, "b", Action(type="fold"))
    for viewer in ["a", "b", "c", "spectator"]:
        out = engine.project_view(state, viewer).detail["out"]
        assert out == {
            "a": {"penalty": 80, "reason": "false_declaration"},
            "b": {"penalty": 20, "reason": "drop"},
        }
    # Rules copy explains the cut card and the restrictions the table enforces.
    rules = " ".join(engine.manifest.rules)
    assert "cut card" in rules and "printed-joker cut makes aces wild" in rules
    assert "can’t be taken" in rules
