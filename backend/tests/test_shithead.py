"""Independent rule fixtures and conserved natural Shithead matches."""

import json
from copy import deepcopy

import pytest

from app.bots import choose_action
from app.core.cards import standard_deck
from app.core.contracts import Action, RuleError
from app.games.shithead.engine import ShitheadEngine, comparison, playable


def scenario(hands, pile=(), up=None, down=None, stock=(), settings=None):
    e = ShitheadEngine()
    s = e.setup(list(hands), settings or {}, seed=1)
    s.update(
        phase="playing",
        hands=deepcopy(hands),
        pile=list(pile),
        deck=list(stock),
        face_up=up or {p: [] for p in hands},
        face_down=down or {p: [None, None, None] for p in hands},
    )
    used = s["deck"] + s["pile"] + sum(s["hands"].values(), []) + sum(s["face_up"].values(), [])
    used += [c for slots in s["face_down"].values() for c in slots if c is not None]
    assert len(used) == len(set(used))
    s["burned"] = [c for c in standard_deck() if c not in used]
    return e, s


def conserved(s):
    cards = (
        s["deck"]
        + s["pile"]
        + s["burned"]
        + sum(s["hands"].values(), [])
        + sum(s["face_up"].values(), [])
    )
    cards += [c for slots in s["face_down"].values() for c in slots if c is not None]
    assert sorted(cards) == sorted(standard_deck())


def test_setup_privacy_selection_and_opening_rank():
    e = ShitheadEngine()
    s = e.setup(["a", "b"], {}, seed=31)
    assert len(s["deck"]) == 34
    for p in s["order"]:
        view = e.project_view(s, p)
        wire = view.model_dump_json()
        assert len(view.hand) == 6
        assert '"deck"' not in wire and '"seed"' not in wire
        assert all(json.dumps(c) not in wire for slots in s["face_down"].values() for c in slots)
        other = "b" if p == "a" else "a"
        assert all(json.dumps(c) not in wire for c in s["hands"][other])
    chosen = list(s["hands"]["a"][:3])
    after = e.apply_action(s, "a", Action(type="arrange", cards=chosen))
    assert s["face_up"]["a"] == []
    assert len(after["hands"]["a"]) == len(after["face_up"]["a"]) == 3
    assert all(c.id in chosen for c in e.project_view(after, "b").players[0].cards)
    with pytest.raises(RuleError):
        e.apply_action(s, "b", Action(type="arrange", cards=s["hands"]["b"][:3]))
    for invalid in [chosen[:2], [chosen[0]] * 3, [*chosen[:2], s["face_down"]["a"][0]]]:
        with pytest.raises(RuleError):
            e.apply_action(s, "a", Action(type="arrange", cards=invalid))
    after = e.apply_action(after, "b", Action(type="arrange", cards=after["hands"]["b"][:3]))
    assert after["phase"] == "playing"
    expected = next(
        p
        for value in "3456789TJQKA2"
        for field in ["face_up", "hands"]
        for p in after["order"]
        if any(c[0] == value for c in after[field][p])
    )
    assert e.project_view(after, "a").current_player == expected
    conserved(after)


def test_groups_refill_and_no_same_turn_zone_switch():
    e, s = scenario(
        {"a": ["4S:0", "4H:0"], "b": ["KS:0"]},
        up={"a": ["QD:0"], "b": []},
        stock=["5S:0", "6S:0", "7S:0"],
    )
    before = deepcopy(s)
    after = e.apply_action(s, "a", Action(type="play", cards=["4H:0", "4S:0"]))
    assert s == before and len(after["hands"]["a"]) == 3 and not after["deck"]
    assert after["face_up"]["a"] == ["QD:0"] and after["turn"] == 1
    conserved(after)
    for invalid in [["4S:0", "KS:0"], ["4S:0", "4S:0"], ["QD:0"]]:
        with pytest.raises(RuleError):
            e.apply_action(s, "a", Action(type="play", cards=invalid))


def test_two_reset_and_any_ten_burn_give_extra_turn():
    e, s = scenario({"a": ["2S:0", "4S:0"], "b": ["5S:0"]}, pile=["AH:0"])
    after = e.apply_action(s, "a", Action(type="play", cards=["2S:0"]))
    assert comparison(after) == "2" and playable(after, "3H:0")
    e, s = scenario({"a": ["TS:0", "4S:0"], "b": ["5S:0"]}, pile=["AH:0"])
    after = e.apply_action(s, "a", Action(type="play", cards=["TS:0"]))
    assert not after["pile"] and after["turn"] == 0
    assert after["last_play"]["burned"] == 2
    conserved(after)


def test_four_consecutive_ranks_burn_whole_pile():
    e, s = scenario({"a": ["7C:0", "4S:0"], "b": ["5S:0"]}, pile=["3S:0", "7S:0", "7H:0", "7D:0"])
    after = e.apply_action(s, "a", Action(type="play", cards=["7C:0"]))
    assert not after["pile"] and after["turn"] == 0 and after["last_play"]["burned"] == 5
    conserved(after)


def test_optional_rules_are_off_and_transparent_three_preserves_seven_or_two():
    e, s = scenario({"a": ["3C:0", "8S:0", "6S:0"], "b": ["5S:0"]}, pile=["7S:0"])
    assert playable(s, "8S:0") and not playable(s, "6S:0") and not playable(s, "3C:0")
    s["settings"].update(seven_low=True, transparent_three=True)
    assert not playable(s, "8S:0") and playable(s, "6S:0") and playable(s, "3C:0")
    after = e.apply_action(s, "a", Action(type="play", cards=["3C:0"]))
    assert comparison(after) == "7" and not playable(after, "8H:0")
    after["pile"] = ["2D:0", "3H:0", "3D:0"]
    assert comparison(after) == "2" and playable(after, "AH:0")
    after["pile"] = ["3H:0", "3D:0"]
    assert comparison(after) is None and playable(after, "4H:0")


def test_transparent_threes_do_not_join_a_four_kind_across_a_two():
    e, s = scenario(
        {"a": ["3C:0", "4S:0"], "b": ["5S:0"]},
        pile=["3S:0", "3H:0", "2S:0", "3D:0"],
        settings={"transparent_three": True},
    )
    after = e.apply_action(s, "a", Action(type="play", cards=["3C:0"]))
    assert len(after["pile"]) == 5 and after["last_play"]["type"] == "play"
    conserved(after)


def test_face_up_pickup_adds_chosen_card_and_turn_ends():
    e, s = scenario({"a": [], "b": ["5S:0"]}, pile=["AH:0"], up={"a": ["3H:0", "4H:0"], "b": []})
    after = e.apply_action(s, "a", Action(type="pickup", card="3H:0"))
    assert after["hands"]["a"] == ["AH:0", "3H:0"]
    assert after["face_up"]["a"] == ["4H:0"] and after["turn"] == 1
    assert not after["pile"]
    assert all(o.action.card != "4H:0" for o in e.legal_actions(after, "a"))
    conserved(after)


def test_failed_blind_flip_is_unrevealed_until_committed_and_recovers_to_hand():
    e, s = scenario(
        {"a": [], "b": ["5S:0"]},
        pile=["AH:0"],
        down={"a": ["3H:0", "4H:0", None], "b": [None, None, None]},
    )
    for viewer in ["a", "b"]:
        wire = e.project_view(s, viewer).model_dump_json()
        assert '"3H:0"' not in wire and '"4H:0"' not in wire
    assert [o.action.slot for o in e.legal_actions(s, "a")] == [0, 1]
    after = e.apply_action(s, "a", Action(type="flip", slot=0))
    assert after["hands"]["a"] == ["AH:0", "3H:0"]
    assert after["face_down"]["a"] == [None, "4H:0", None]
    assert after["turn"] == 1 and not after["pile"]
    assert e.project_view(after, "b").detail["last_play"]["type"] == "failed_flip"
    conserved(after)


def test_last_legal_blind_burn_escapes_and_last_remaining_loses():
    e, s = scenario(
        {"a": [], "b": ["5S:0"]},
        pile=["AH:0"],
        down={"a": ["TH:0", None, None], "b": [None, None, None]},
    )
    after = e.apply_action(s, "a", Action(type="flip", slot=0))
    assert after["phase"] == "finished" and after["loser"] == "b"
    assert e.outcome(after) == ["a"] and not e.legal_actions(after, "b")
    conserved(after)


def test_escaped_player_skipped_and_every_escape_is_a_winner():
    e, s = scenario({"a": ["TS:0"], "b": ["5S:0"], "c": ["6S:0"]})
    after = e.apply_action(s, "a", Action(type="play", cards=["TS:0"]))
    assert after["escaped"] == ["a"] and after["turn"] == 1 and not after["winners"]
    after = e.apply_action(after, "b", Action(type="play", cards=["5S:0"]))
    assert after["phase"] == "finished" and after["loser"] == "c"
    assert e.outcome(after) == ["a", "b"]
    conserved(after)


@pytest.mark.parametrize("count", [2, 5])
@pytest.mark.parametrize("seed", [1, 12, 17, 31, 43, 73, 93])
@pytest.mark.parametrize("extras", [False, True])
def test_natural_complete_bot_matches_conserve_deck_and_memory(count, seed, extras):
    e = ShitheadEngine()
    players = [f"player-{i}" for i in range(count)]
    s = e.setup(players, {"seven_low": extras, "transparent_three": extras}, seed)
    memory = {p: {"seed": f"strategy-{seed}-{p}"} for p in players}
    for _move in range(3000):
        conserved(s)
        if s["phase"] == "finished":
            break
        player = s["order"][s["turn"]]
        before = json.dumps(s, sort_keys=True)
        view = e.project_view(s, player)
        decision = choose_action(view, player, memory[player])
        assert len(json.dumps(decision.memory)) < 16384
        memory[player] = decision.memory
        after = e.apply_action(s, player, decision.action)
        assert before == json.dumps(s, sort_keys=True)
        s = after
    assert s["phase"] == "finished", (count, seed, extras, _move)
    assert len(s["winners"]) == count - 1 and s["loser"] not in s["winners"]
    assert all(not e.legal_actions(s, p) for p in players)


def test_messages_instruct_the_next_actor_instead_of_restating_moves():
    # A normal play: the next player is told what beats the pile.
    e, s = scenario({"a": ["9S:0", "4S:0"], "b": ["5S:0", "KS:0"]})
    after = e.apply_action(s, "a", Action(type="play", cards=["9S:0"]))
    assert after["message"] == "Match or beat 9 (or play a 2 or 10) from your hand, or take the pile."
    # A pickup: the next player leads, and nobody is told "Pile taken" anonymously.
    taken = e.apply_action(after, "b", Action(type="pickup"))
    assert taken["message"] == "Lead any card from your hand."
    # A burn keeps the burner's turn and says so to them.
    e, s = scenario({"a": ["TS:0", "4S:0"], "b": ["5S:0"]}, pile=["AH:0"])
    burned = e.apply_action(s, "a", Action(type="play", cards=["TS:0"]))
    assert burned["message"] == "You burned the pile. Lead any card from your hand."
    # A failed blind flip: the next player leads; the flip itself is public history.
    e, s = scenario(
        {"a": [], "b": ["5S:0"]},
        pile=["AH:0"],
        down={"a": ["3H:0", "4H:0", None], "b": [None, None, None]},
    )
    flipped = e.apply_action(s, "a", Action(type="flip", slot=0))
    assert flipped["message"] == "Lead any card from your hand."
    # Face-up and hidden stages, and the seven-low house rule.
    e, s = scenario({"a": ["8S:0"], "b": []}, pile=["7S:0"], up={"a": [], "b": ["3H:0"]})
    s["settings"]["seven_low"] = True
    played = e.apply_action(s, "a", Action(type="pickup"))
    assert played["message"] == "Lead any card from your face-up cards."
    e, s = scenario(
        {"a": ["9S:0", "4C:0"], "b": []},
        pile=["4S:0"],
        down={"a": [None] * 3, "b": ["3H:0", None, None]},
    )
    blind = e.apply_action(s, "a", Action(type="play", cards=["9S:0"]))
    assert blind["message"].startswith("Flip a hidden table card.")
    for message in (after, taken, burned, flipped, played, blind):
        assert not any(old in message["message"] for old in ("Pile taken", "cannot beat", "played."))
