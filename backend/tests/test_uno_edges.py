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


def three(mercy=False, settings=None):
    engine = UnoEngine(mercy)
    state = engine.setup(["a", "b", "c"], settings or {}, seed=1)
    state.update(
        turn=0, direction=1, color="red", pending=None, penalty=0, penalty_floor=0,
        drawn=None, catchable=None, called=[], eliminated=[], discard=["red:5:0"],
        hands={"a": [], "b": [], "c": []},
        deck=["yellow:2:0", "green:3:0", "blue:4:0", "red:8:0", "yellow:6:0", "green:1:0"] * 1,
    )
    return engine, state


def test_card_and_action_labels_name_the_card_and_its_colour():
    engine, state = three(settings={"seven_zero": True})
    state["hands"]["a"] = ["wild:wild:0", "red:7:0", "yellow:4:0", "red:4:0"]
    labels = [option.label for option in engine.legal_actions(state, "a")]
    assert "Play Wild · Red" in labels and "Play Wild Wild" not in " ".join(labels)
    assert "Play Red 7" in labels and "Play Red 4" in labels
    assert engine.project_view(state, "a").hand[0].label == "Wild"
    mercy, mercy_state = three(True)
    mercy_state["hands"]["a"] = ["wild:roulette:0"]
    assert mercy.project_view(mercy_state, "a").hand[0].label == "Colour roulette"


def test_messages_instruct_the_next_actor_without_restating_the_move():
    engine, state = three()
    state["hands"] = {"a": ["red:skip:0", "blue:9:0"], "b": ["green:2:0"], "c": ["blue:1:0", "blue:2:0"]}
    result = engine.apply_action(state, "a", Action(type="play", card="red:skip:0"))
    assert result["order"][result["turn"]] == "c"
    assert result["message"] == "Match Red or Skip, or draw a card."
    assert "Played" not in result["message"]
    event = engine.project_view(result, "c").detail["last_event"]
    assert event["actor"] == "a" and event["kind"] == "skip" and event["skipped"] == ["b"]


def test_challenge_outcomes_are_public_events_after_resolution_only():
    for holds_red, outcome, drawer, count in [(True, "succeeded", "a", 4), (False, "failed", "b", 6)]:
        engine, state = three()
        state["deck"] = [f"green:{i}:1" for i in range(1, 9)]
        state["hands"] = {
            "a": ["wild:wild4:0", "red:1:0" if holds_red else "blue:1:0"],
            "b": ["green:2:0"], "c": ["blue:3:0"],
        }
        played = engine.apply_action(state, "a", Action(type="play", card="wild:wild4:0", color="blue"))
        pending = engine.project_view(played, "b").detail
        assert pending["pending_kind"] == "challenge" and pending["last_event"]["outcome"] is None
        # The challenge is judged against the colour before the +4, which the table already saw.
        assert pending["last_event"]["from_color"] == "red" and pending["last_event"]["color"] == "blue"
        assert played["message"] == "Take 4 cards, or challenge the Wild +4."
        resolved = engine.apply_action(played, "b", Action(type="challenge"))
        for viewer in "abc":
            event = engine.project_view(resolved, viewer).detail["last_event"]
            assert event["type"] == "challenge" and event["actor"] == "b" and event["target"] == "a"
            assert event["outcome"] == outcome and event["drew"] == {drawer: count}
        # Only the drawer sees which cards they took.
        assert len(engine.project_view(resolved, drawer).detail["you_drew"]) == count
        others = [viewer for viewer in "abc" if viewer != drawer]
        assert all(engine.project_view(resolved, viewer).detail["you_drew"] == [] for viewer in others)


def test_swaps_catches_and_discard_all_report_counts_but_no_faces():
    engine, state = three(settings={"seven_zero": True})
    state["hands"] = {"a": ["red:7:0", "red:1:0", "blue:2:0"], "b": ["green:2:0"], "c": ["blue:3:0", "blue:4:0"]}
    swapped = engine.apply_action(state, "a", Action(type="play", card="red:7:0", target="c"))
    event = engine.project_view(swapped, "b").detail["last_event"]
    assert event["kind"] == "7" and event["target"] == "c" and event["drew"] == {}
    caught = engine.apply_action(swapped, "c", Action(type="catch_uno", target="b"))
    event = engine.project_view(caught, "a").detail["last_event"]
    assert event == {"type": "catch_uno", "actor": "c", "kind": None, "color": None, "from_color": None,
                     "target": "b", "outcome": None, "discarded": 0, "skipped": [], "drew": {"b": 2},
                     "eliminated": []}
    assert engine.project_view(caught, "a").detail["you_drew"] == []
    assert len(engine.project_view(caught, "b").detail["you_drew"]) == 2
    mercy, state = three(True)
    state["hands"] = {"a": ["red:discard_all:0", "red:1:0", "red:2:0", "blue:1:0"], "b": ["green:2:0"],
                      "c": ["blue:3:0"]}
    played = mercy.apply_action(state, "a", Action(type="play", card="red:discard_all:0"))
    assert mercy.project_view(played, "b").detail["last_event"]["discarded"] == 2


def test_no_mercy_warns_before_and_records_elimination_after_a_penalty():
    engine, state = three(True)
    state.update(penalty=10, penalty_floor=10)
    state["deck"] = [f"green:{i % 10}:{i // 10}" for i in range(20)]
    state["hands"] = {"a": [f"blue:{i % 10}:{i // 10}" for i in range(18)], "b": ["red:1:0"], "c": ["red:2:0"]}
    labels = [option.label for option in engine.legal_actions(state, "a")]
    assert labels == ["Draw 10 — you’re out"]
    engine._prompt(state)
    assert state["message"] == "Stack +10 or higher, or draw 10 — drawing puts you out."
    result = engine.apply_action(state, "a", Action(type="draw"))
    detail = engine.project_view(result, "b").detail
    assert detail["last_event"]["eliminated"] == ["a"] and detail["last_event"]["drew"] == {"a": 10}
    assert detail["out"] == [{"player": "a", "cards": 28}]
    assert engine.legal_actions(result, "a") == []


def test_finished_message_says_how_the_hand_was_won():
    engine, state = situation()
    result = engine.apply_action(state, "a", Action(type="play", card="red:draw2:0"))
    assert result["message"] == "Hand emptied. The winner scores the cards left in the other hands."
    assert engine.project_view(result, "b").detail["last_event"]["drew"] == {"b": 2}
