"""Azul engine messages are instructions for the seat that can act.

Every other seat sees who the room waits for and the attributed last move, so a
message must never restate someone else's move or address waiting players.
"""

from app.games.azul.engine import DRAFT_PROMPT, AzulEngine


def test_azul_messages_follow_the_acting_seat_through_a_round():
    engine = AzulEngine()
    state = engine.setup(["a", "b"], {}, 5)
    assert state["message"] == "Take every tile of one colour from a factory."
    while state["phase"] != "round_over":
        player = state["order"][state["turn"]]
        option = engine.legal_actions(state, player)[0]
        state = engine.apply_action(state, player, option.action)
        if state["phase"] == "placing":
            count, color = len(state["draft"]), state["draft"][0].split("-")[0]
            tiles = "tile" if count == 1 else "tiles"
            assert state["message"] == f"Place your {count} {color} {tiles} on one pattern line or the floor."
        elif state["phase"] == "drafting":
            assert state["message"] == DRAFT_PROMPT
    assert state["message"] == "Round 1 is scored. Start round 2 when everyone has looked."
    assert engine.legal_actions(state, state["order"][state["turn"]])[0].action.type == "next_round"


def test_azul_finished_message_is_neutral_for_every_seat():
    engine = AzulEngine()
    state = engine.setup(["a", "b"], {}, 5)
    state["wall"]["a"][0] = ["blue-0", "yellow-0", "red-0", "black-0", "white-0"]
    engine._finish(state)
    assert state["phase"] == "finished"
    assert not state["message"].lower().startswith("your")
    assert "end bonuses" in state["message"].lower()
