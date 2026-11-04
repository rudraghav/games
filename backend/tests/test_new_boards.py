"""Independent expected board positions, captures, draws and conservation."""

import random

import pytest

from app.core.contracts import Action, RuleError
from app.games.board.checkers import CheckersEngine, position
from app.games.board.mancala import MancalaEngine


def checkers_position(pieces):
    s = CheckersEngine().setup(["a", "b"], {})
    s["board"] = [pieces.get(i) for i in range(64)]
    s["positions"] = {}
    return s


def test_checkers_compulsory_capture_and_complete_jump_chain():
    engine = CheckersEngine()
    s = checkers_position({42: 0, 35: 1, 19: 1, 7: 1, 60: 0})
    assert [a.action.choice for a in engine.legal_actions(s, "a")] == ["42:28"]
    with pytest.raises(RuleError):
        engine.apply_action(s, "a", Action(type="move", choice="60:51"))
    next_state = engine.apply_action(s, "a", Action(type="move", choice="42:28"))
    assert s["board"][35] == 1  # pure engine: the previous snapshot is unchanged
    assert next_state["board"][35] is None
    assert next_state["turn"] == 0 and next_state["forced"] == 28
    assert [a.action.choice for a in engine.legal_actions(next_state, "a")] == ["28:10"]
    end = engine.apply_action(next_state, "a", Action(type="move", choice="28:10"))
    assert end["turn"] == 1 and end["forced"] is None
    assert end["board"][19] is None and end["board"][10] == 0


def test_checkers_crowning_ends_capture_turn_and_kings_move_backwards():
    engine = CheckersEngine()
    s = checkers_position({17: 0, 10: 1, 12: 1})
    end = engine.apply_action(s, "a", Action(type="move", choice="17:3"))
    assert end["board"][3] == 2 and end["turn"] == 1
    assert end["forced"] is None and end["board"][12] == 1
    backwards = checkers_position({26: 2, 63: 3})
    assert "26:35" in [a.action.choice for a in engine.legal_actions(backwards, "a")]
    backwards["board"][26] = 0
    assert "26:35" not in [a.action.choice for a in engine.legal_actions(backwards, "a")]


def test_checkers_blocked_opponent_win_and_quiet_draw():
    engine = CheckersEngine()
    s = checkers_position({42: 0, 35: 1})
    end = engine.apply_action(s, "a", Action(type="move", choice="42:28"))
    assert end["phase"] == "finished" and end["winners"] == ["a"]
    assert engine.project_view(end, "a").detail["outcome_reason"] == "no-pieces"
    with pytest.raises(RuleError):
        engine.apply_action(end, "a", Action(type="move", choice="28:19"))
    s = checkers_position({56: 2, 7: 3})
    s["quiet"] = 79
    end = engine.apply_action(s, "a", Action(type="move", choice="56:49"))
    assert end["phase"] == "finished" and end["draw"] and not end["winners"]
    assert engine.project_view(end, "b").detail["outcome_reason"] == "quiet-limit"


def test_checkers_third_repetition_counts_initial_position_and_side_to_move():
    engine = CheckersEngine()
    s = checkers_position({56: 2, 7: 3})
    key = position(s)
    s["positions"][key] = 1
    s["turn"] = 1
    assert position(s) != key
    s["turn"] = 0
    cycle = [("a", "56:49"), ("b", "7:14"), ("a", "49:56"), ("b", "14:7")]
    for player, move in cycle:
        s = engine.apply_action(s, player, Action(type="move", choice=move))
    assert s["phase"] == "playing" and s["positions"][key] == 2
    for player, move in cycle:
        s = engine.apply_action(s, player, Action(type="move", choice=move))
    assert s["phase"] == "finished" and s["draw"] and not s["winners"]
    assert s["positions"][key] == 3
    assert engine.project_view(s, "a").detail["outcome_reason"] == "threefold"
    assert not engine.legal_actions(s, "a") and not engine.legal_actions(s, "b")


@pytest.mark.parametrize("pieces,move", [({42: 0, 7: 3}, "42:33"), ({42: 2, 35: 1, 7: 3}, "42:28")])
def test_checkers_man_move_or_capture_resets_quiet_draw_count(pieces, move):
    engine = CheckersEngine()
    s = checkers_position(pieces)
    s["quiet"] = 79
    end = engine.apply_action(s, "a", Action(type="move", choice=move))
    assert end["phase"] == "playing" and end["quiet"] == 0


def test_checkers_capture_path_choice_has_no_longest_jump_requirement():
    engine = CheckersEngine()
    s = checkers_position({42: 0, 35: 1, 19: 1, 44: 0, 37: 1, 7: 1})
    captures = {o.action.choice for o in engine.legal_actions(s, "a")}
    assert {"42:28", "44:30"} <= captures
    # The right-hand jump ends immediately; the longer left-hand path is optional.
    end = engine.apply_action(s, "a", Action(type="move", choice="44:30"))
    assert end["turn"] == 1 and end["forced"] is None


def test_mancala_sowing_extra_turn_and_skipping_opponent_store():
    engine = MancalaEngine()
    s = engine.setup(["a", "b"], {})
    after = engine.apply_action(s, "a", Action(type="sow", choice="2"))
    assert after["pits"][:7] == [4, 4, 0, 5, 5, 5, 1]
    assert after["turn"] == 0 and sum(after["pits"]) == 48
    s["pits"] = [15, 1, 1, 1, 1, 1, 0, 4, 4, 4, 4, 4, 4, 0]
    after = engine.apply_action(s, "a", Action(type="sow", choice="0"))
    assert after["pits"][13] == 0 and sum(after["pits"]) == 44
    with pytest.raises(RuleError):
        engine.apply_action(s, "b", Action(type="sow", choice="7"))


def test_mancala_capture_and_no_capture_opposite_empty():
    engine = MancalaEngine()
    s = engine.setup(["a", "b"], {})
    s["pits"] = [1, 0, 1, 0, 0, 0, 20, 1, 0, 5, 0, 0, 0, 20]
    after = engine.apply_action(s, "a", Action(type="sow", choice="2"))
    assert after["pits"][6] == 26 and after["pits"][3] == after["pits"][9] == 0
    assert sum(after["pits"]) == 48
    s["pits"][9] = 0
    after = engine.apply_action(s, "a", Action(type="sow", choice="2"))
    assert after["pits"][3] == 1 and after["pits"][6] == 20


def test_mancala_sweeps_on_empty_side_before_extra_turn():
    engine = MancalaEngine()
    s = engine.setup(["a", "b"], {})
    s["pits"] = [0, 0, 0, 0, 0, 1, 20, 2, 3, 0, 0, 0, 0, 22]
    end = engine.apply_action(s, "a", Action(type="sow", choice="5"))
    assert end["phase"] == "finished" and end["winners"] == ["b"]
    assert end["pits"][6] == 21 and end["pits"][13] == 27
    assert sum(end["pits"]) == 48
    assert not engine.legal_actions(end, "a")


def test_mancala_second_player_store_and_capture_mirror_first_player():
    engine = MancalaEngine()
    s = engine.setup(["a", "b"], {})
    s["turn"] = 1
    after = engine.apply_action(s, "b", Action(type="sow", choice="9"))
    assert after["pits"][7:] == [4, 4, 0, 5, 5, 5, 1]
    assert after["turn"] == 1 and sum(after["pits"]) == 48
    s["pits"] = [1, 0, 0, 5, 0, 0, 20, 1, 0, 1, 0, 0, 0, 20]
    after = engine.apply_action(s, "b", Action(type="sow", choice="9"))
    assert after["pits"][13] == 20  # pit 10 is opposite empty pit 2: no capture
    assert after["pits"][10] == 1
    s["pits"][2], s["pits"][3] = 5, 0
    after = engine.apply_action(s, "b", Action(type="sow", choice="9"))
    assert after["pits"][13] == 26 and after["pits"][10] == after["pits"][2] == 0
    assert sum(after["pits"]) == 48


def test_mancala_equal_stores_after_final_sweep_is_a_draw():
    engine = MancalaEngine()
    s = engine.setup(["a", "b"], {})
    s["pits"] = [0, 0, 0, 0, 0, 1, 23, 1, 0, 0, 0, 0, 0, 23]
    end = engine.apply_action(s, "a", Action(type="sow", choice="5"))
    assert end["phase"] == "finished" and end["draw"] and not end["winners"]
    assert end["pits"][6] == end["pits"][13] == 24
    assert sum(end["pits"]) == 48


@pytest.mark.parametrize("engine", [CheckersEngine(), MancalaEngine()])
@pytest.mark.parametrize("seed", [7, 31, 93])
def test_new_boards_finish_conserve_and_rematch(engine, seed):
    s = engine.setup(["a", "b"], {}, seed)
    chooser = random.Random(seed)
    for _ in range(3000):
        if s["phase"] == "finished":
            break
        view = engine.project_view(s, s["order"][s["turn"]])
        assert view.actions
        s = engine.apply_action(s, view.current_player, chooser.choice(view.actions).action)
        if engine.manifest.id == "mancala":
            assert sum(s["pits"]) == 48
        else:
            assert sum(p is not None for p in s["board"]) <= 24
    assert s["phase"] == "finished" and (s["winners"] or s.get("draw"))
    assert engine.setup(["a", "b"], {}, seed)["phase"] == "playing"


def test_board_messages_are_perspective_safe_and_consequences_are_public():
    """Shared messages never tell a loser "you"; consequence detail matches the move."""
    from app.games.board.four import FourEngine
    from app.games.board.reversi import ReversiEngine
    from app.games.boop.engine import BoopEngine

    engine = CheckersEngine()
    blocked = checkers_position({42: 0, 35: 1, 7: 1, 14: 0, 21: 0})
    end = engine.apply_action(blocked, "a", Action(type="move", choice="42:28"))
    assert end["outcome_reason"] == "no-legal-move"
    assert end["message"] == "Ivory has no legal move left, so Coral wins."
    for view in (engine.project_view(end, "a"), engine.project_view(end, "b")):
        assert "you" not in view.message.lower() and "opponent" not in view.message.lower()
        assert view.detail["last_from"] == 42 and view.detail["last_captured"] == 35

    four = FourEngine()
    s = four.setup(["a", "b"], {})
    for column in ["0", "1", "0", "1", "0", "1"]:
        s = four.apply_action(s, s["order"][s["turn"]], Action(type="drop", choice=column))
    view = four.project_view(s, "a")
    assert view.detail["landing"]["0"] == 14 and view.detail["landing"]["6"] == 41
    s = four.apply_action(s, "a", Action(type="drop", choice="0"))
    assert s["message"] == "Coral connected four in a row."

    reversi = ReversiEngine()
    s = reversi.setup(["a", "b"], {})
    view = reversi.project_view(s, "b")
    assert view.detail["flips"]["19"] == [27]
    s = reversi.apply_action(s, "a", Action(type="place", choice="19"))
    assert reversi.project_view(s, "b").detail["last_flips"] == [27]
    assert s["message"].startswith("You play White")

    boop = BoopEngine()
    s = boop.setup(["a", "b"], {})
    cats = [0, 2, 4, 12, 16, 24, 26, 28]
    for slot in cats[:7]:
        s["board"][slot] = {"owner": "a", "kind": "cat"}
    s["pools"]["a"] = {"kitten": 0, "cat": 1}
    s = boop.apply_action(s, "a", Action(type="place", color="cat", choice="28"))
    assert s["phase"] == "finished" and s["winners"] == ["a"]
    assert "you" not in s["message"].lower()


def test_mancala_previews_match_the_sowing_they_describe():
    engine = MancalaEngine()
    chooser = random.Random(5)
    s = engine.setup(["a", "b"], {})
    while s["phase"] != "finished":
        actor = s["order"][s["turn"]]
        previews = engine.project_view(s, "b" if actor == "a" else "a").detail["previews"]
        actions = engine.legal_actions(s, actor)
        assert set(previews) == {option.action.choice for option in actions}
        option = chooser.choice(actions)
        expected = previews[option.action.choice]
        after = engine.apply_action(s, actor, option.action)
        assert after["last_move"] == expected["landing"]
        captured = after["last_capture"]["seeds"] if after["last_capture"] else 0
        assert captured == expected["captures"]
        if after["phase"] != "finished":
            assert (after["turn"] == s["turn"]) == expected["extra_turn"]
        s = after
    assert s["sweep"] is not None and sum(s["pits"]) == 48
