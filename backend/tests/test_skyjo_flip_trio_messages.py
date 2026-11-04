"""Viewer-facing instructions and public table cues for Skyjo, Flip 7 and Trio."""

import json

from app.core.contracts import Action
from app.games.flip_seven.engine import FlipSevenEngine, deck
from app.games.skyjo.engine import SkyjoEngine, sky_card
from app.games.trio.engine import TrioEngine
from app.main import catalogue


def skyjo_after_opening():
    e = SkyjoEngine()
    s = e.setup(["a", "b"], {}, seed=3)
    while s["phase"] == "opening":
        actor = s["order"][s["turn"]]
        s = e.apply_action(s, actor, e.legal_actions(s, actor)[0].action)
    return e, s


def test_skyjo_message_follows_every_phase_for_the_actor():
    e = SkyjoEngine()
    s = e.setup(["a", "b"], {}, seed=3)
    assert e.project_view(s, "a").message == "Turn over two of your cards to begin."
    s = e.apply_action(s, "a", Action(type="reveal", slot=0))
    assert e.project_view(s, "a").message == "Turn over one more of your cards."
    e, s = skyjo_after_opening()
    actor = s["order"][s["turn"]]
    top = sky_card(s["discard"][-1]).value
    assert e.project_view(s, actor).message == f"Draw a card, or take the {top} from the discard pile."
    taken = e.apply_action(s, actor, Action(type="draw_discard"))
    assert e.project_view(taken, actor).message == (
        f"Replace one of your grid cards with the {top} you took.")
    drawn = e.apply_action(s, actor, Action(type="draw_stock"))
    discarded = e.apply_action(drawn, actor, Action(type="discard"))
    assert discarded["phase"] == "reveal"
    assert e.project_view(discarded, actor).message == "Turn over one of your face-down cards."
    # The persisted round-start text is unchanged: saved reshuffles hash the state.
    assert s["message"] == "Turn over two cards to begin."


def test_skyjo_private_draw_is_named_only_in_the_drawers_message():
    e, s = skyjo_after_opening()
    actor = s["order"][s["turn"]]
    other = next(p for p in s["order"] if p != actor)
    s = e.apply_action(s, actor, Action(type="draw_stock"))
    value = sky_card(s["drawn"]).value
    own = e.project_view(s, actor).message
    assert f"the {value} you drew" in own and "discard it and turn over" in own
    seen = e.project_view(s, other)
    assert "the drawn card" in seen.message and seen.drawn is None
    assert s["drawn"] not in json.dumps(seen.model_dump())


def test_skyjo_final_turn_and_round_review_messages():
    e, s = skyjo_after_opening()
    actor = s["order"][s["turn"]]
    closer = next(p for p in s["order"] if p != actor)
    s["finisher"], s["remaining"] = closer, [actor]
    assert e.project_view(s, actor).message.startswith("Final turn. Draw a card")
    s.update(phase="between_rounds", turn=s["order"].index(closer))
    assert e.project_view(s, closer).message == (
        f"Round {s['round']} is scored. Start round {s['round'] + 1} when everyone has checked the scores.")
    s["phase"] = "finished"
    assert "lowest total wins" in e.project_view(s, actor).message


def controlled_flip(cards):
    engine = FlipSevenEngine()
    s = engine.setup(["a", "b", "c"], {}, 13)
    s.update(table={p: [] for p in s["order"]}, status=dict.fromkeys(s["order"], "active"),
             tasks=[], pending=None, turn=0, resume=1, phase="playing", deck=list(reversed(cards)))
    s["discard"] = [c for c in deck() if c not in cards]
    return engine, s


def test_flip_messages_instruct_the_actor_and_name_the_numbers_at_risk():
    e, s = controlled_flip(["n-3-0"])
    assert e.project_view(s, "a").message == "Hit to flip your first card."
    s["table"]["a"] = ["n-5-0", "n-9-0", "plus-4"]
    for card in s["table"]["a"]:
        s["discard"].remove(card)
    assert e.project_view(s, "a").message == (
        "Hit to flip another card, or stay to bank 18. A repeated 5 or 9 busts you.")
    s["table"]["a"].append("chance-0")
    s["discard"].remove("chance-0")
    assert "Your Second Chance saves one repeated number." in e.project_view(s, "a").message


def test_flip_target_effects_are_public_and_attributed():
    e, s = controlled_flip(["freeze-0"])
    s = e.apply_action(s, "a", Action(type="hit"))
    assert e.project_view(s, "b").message.startswith("Choose who receives Freeze.")
    s = e.apply_action(s, "a", Action(type="target_effect", target="b"))
    for viewer in "abc":
        assert e.project_view(s, viewer).detail["effects"] == [{"card": "Freeze", "by": "a", "to": "b"}]
    e, s = controlled_flip(["three-0", "n-2-0", "n-3-0", "n-4-0"])
    s = e.apply_action(s, "a", Action(type="hit"))
    assert e.project_view(s, "a").message == "Choose who must flip three cards. A repeated number busts them."
    s = e.apply_action(s, "a", Action(type="target_effect", target="c"))
    assert e.project_view(s, "a").detail["effects"] == [{"card": "Flip Three", "by": "a", "to": "c"}]
    # A new round starts with no effects; round review and match end read as instructions.
    s["status"] = dict.fromkeys(s["order"], "stayed")
    e._finish_round(s)
    assert s["phase"] == "round_over"
    assert e.project_view(s, "a").message.startswith(f"Round {s['round']} is banked.")
    s = e.apply_action(s, s["order"][s["turn"]], Action(type="next_round"))
    assert e.project_view(s, "a").detail["effects"] == []


def test_trio_messages_and_public_hand_ends():
    e = TrioEngine()
    s = e.setup(["a", "b", "c"], {}, 17)
    assert e.project_view(s, "a").message.startswith("Reveal a table card, or ask any player")
    s = e.apply_action(s, "a", Action(type="reveal_hand", target="b", choice="high"))
    for viewer in "abc":
        reveal = e.project_view(s, viewer).detail["revealed"][0]
        assert reveal["owner"] == "b" and reveal["edge"] == "high"
    value = int(s["reveals"][0]["card"].split("-")[1])
    assert e.project_view(s, "a").message.startswith(f"You found {'an' if value in (8, 11) else 'a'} {value}.")
    s = e.apply_action(s, "a", Action(type="reveal_table", choice="0"))
    view = e.project_view(s, "c")
    assert view.detail["revealed"][1]["edge"] is None
    if s["phase"] == "review":
        assert view.message.startswith("No match.")
    hands = json.dumps(e.project_view(s, "c").model_dump())
    assert not any(card in hands for card in s["hands"]["a"] + s["hands"]["b"])


def test_trio_scores_count_trios_in_the_catalogue():
    trio = next(game for game in catalogue() if game.id == "trio")
    assert trio.score_label == "Trios"
