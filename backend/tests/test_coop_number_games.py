"""Independent expected outcomes, privacy and conserved complete matches."""

import json
from collections import Counter
from random import Random

import pytest

from app.core.cards import standard_deck
from app.core.contracts import Action, RuleError
from app.games.six_nimmt.engine import SixNimmtEngine, penalty
from app.games.the_gang.engine import GangEngine


def six_inventory(s):
    return (s["deck"] + [n for hand in s["hands"].values() for n in hand]
            + [n for row in s["rows"] for n in row]
            + [n for pile in s["captured"].values() for n in pile]
            + list(s["selected"].values()) + [item["number"] for item in s["pending"]])


def gang_inventory(s):
    return s["deck"] + s["board"] + [c for hand in s["hands"].values() for c in hand]


def six_position(hands, rows, captured=None, scores=None):
    players = list(hands)
    s = SixNimmtEngine().setup(players, {}, seed=7)
    piles = captured or {p: [] for p in players}
    used = [n for h in hands.values() for n in h] + [n for row in rows for n in row] + [n for pile in piles.values() for n in pile]
    s.update(hands=hands, rows=rows, captured=piles, deck=[n for n in range(1, 105) if n not in used],
             scores=scores or dict.fromkeys(players, 0))
    assert Counter(six_inventory(s)) == Counter(range(1, 105))
    return s


def gang_showdown(board, hands, vaults=0, alarms=0):
    engine = GangEngine()
    s = engine.setup(list(hands), {}, seed=3)
    board = [c + ":0" for c in board]
    hands = {p: [c + ":0" for c in cards] for p, cards in hands.items()}
    used = board + [c for hand in hands.values() for c in hand]
    s.update(board=board, hands=hands, deck=[c for c in standard_deck() if c not in used],
             phase="showdown", street=3, chips={p: i + 1 for i, p in enumerate(hands)},
             revealed=[], vaults=vaults, alarms=alarms)
    assert Counter(gang_inventory(s)) == Counter(standard_deck())
    return s


def reveal_all(engine, state):
    while state["phase"] == "showdown":
        actor = state["order"][state["turn"]]
        state = engine.apply_action(state, actor, Action(type="reveal_hand"))
    return state


def test_six_exact_inventory_and_penalty_hierarchy():
    assert [penalty(n) for n in [1, 5, 10, 11, 55, 100, 104]] == [1, 2, 3, 5, 7, 3, 1]
    assert sum(penalty(n) for n in range(1, 105)) == 171
    for n in [2, 10]:
        s = SixNimmtEngine().setup([str(i) for i in range(n)], {}, seed=1)
        assert Counter(six_inventory(s)) == Counter(range(1, 105))
        assert len(s["deck"]) == 104 - 10 * n - 4


def test_six_secret_lock_does_not_reveal_a_number_or_allow_a_second_submission():
    e = SixNimmtEngine()
    s = e.setup(["a", "b", "c"], {}, seed=9)
    card = s["hands"]["a"][0]
    old = json.dumps(s, sort_keys=True)
    moved = e.apply_action(s, "a", Action(type="select_number", card=f"number-{card}"))
    assert json.dumps(s, sort_keys=True) == old
    assert e.project_view(moved, "a").detail["own_selection"]["id"] == f"number-{card}"
    other = e.project_view(moved, "b").model_dump_json()
    assert f'"id":"number-{card}"' not in other
    assert e.project_view(moved, "b").community == []
    assert e.project_view(moved, "b").detail["own_selection"] is None
    assert e.legal_actions(moved, "a") == []
    with pytest.raises(RuleError):
        e.apply_action(moved, "a", Action(type="select_number", card=f"number-{card}"))
    assert Counter(six_inventory(moved)) == Counter(range(1, 105))


def test_six_sixth_card_takes_only_prior_five_then_later_number_uses_new_row():
    e = SixNimmtEngine()
    s = six_position({"a": [55], "b": [56]}, [[10, 20, 30, 40, 50], [60], [70], [80]])
    s = e.apply_action(s, "b", Action(type="select_number", card="number-56"))
    assert s["phase"] == "selecting"
    s = e.apply_action(s, "a", Action(type="select_number", card="number-55"))
    assert s["rows"][0] == [55, 56]
    assert s["captured"]["a"] == [10, 20, 30, 40, 50]
    assert s["scores"] == {"a": 15, "b": 0}
    assert Counter(six_inventory(s)) == Counter(range(1, 105))


def test_six_low_card_owner_chooses_row_before_other_cards_resolve():
    e = SixNimmtEngine()
    s = six_position({"a": [2], "b": [3]}, [[10], [20], [30], [40]])
    for player, card in [("b", 3), ("a", 2)]:
        s = e.apply_action(s, player, Action(type="select_number", card=f"number-{card}"))
    assert s["phase"] == "take_row" and s["order"][s["turn"]] == "a"
    assert [item["number"] for item in s["pending"]] == [2, 3]
    with pytest.raises(RuleError):
        e.apply_action(s, "b", Action(type="take_row", choice="3"))
    s = e.apply_action(s, "a", Action(type="take_row", choice="3"))
    assert s["rows"][3] == [2, 3]
    assert s["captured"]["a"] == [40]
    assert s["scores"]["a"] == 3
    assert Counter(six_inventory(s)) == Counter(range(1, 105))


def test_six_uses_largest_lower_row_end_not_first_eligible():
    e = SixNimmtEngine()
    s = six_position({"a": [25], "b": [26]}, [[1], [20], [30], [40]])
    for p, n in [("a", 25), ("b", 26)]:
        s = e.apply_action(s, p, Action(type="select_number", card=f"number-{n}"))
    assert s["rows"] == [[1], [20, 25, 26], [30], [40]]


def test_six_waits_until_tenth_selection_even_after_threshold_was_crossed():
    e = SixNimmtEngine()
    s = six_position({"a": [2, 80], "b": [3, 90]}, [[10], [20], [30], [40]], scores={"a": 65, "b": 0})
    for p, n in [("a", 2), ("b", 3)]:
        s = e.apply_action(s, p, Action(type="select_number", card=f"number-{n}"))
    s = e.apply_action(s, "a", Action(type="take_row", choice="0"))
    assert s["phase"] == "review" and not s["winners"]
    assert e.project_view(s, "a").detail["total_penalties"]["a"] == 68
    s = e.apply_action(s, "a", Action(type="next_selection"))
    for p, n in [("a", 80), ("b", 90)]:
        s = e.apply_action(s, p, Action(type="select_number", card=f"number-{n}"))
    assert s["phase"] == "finished" and s["winners"] == ["b"]


def test_six_exact_low_score_tie_shares_victory_and_not_double_counts_round():
    e = SixNimmtEngine()
    s = six_position({"a": [11], "b": [12]}, [[1], [20], [30], [40]],
                     captured={"a": [3], "b": [4]}, scores={"a": 65, "b": 65})
    for p, n in [("a", 11), ("b", 12)]:
        s = e.apply_action(s, p, Action(type="select_number", card=f"number-{n}"))
    assert s["phase"] == "finished" and s["winners"] == ["a", "b"]
    assert s["scores"] == {"a": 66, "b": 66}
    assert e.project_view(s, "a").detail["total_penalties"] == {"a": 66, "b": 66}


def test_six_resolution_records_each_placement_capture_and_low_card_take():
    e = SixNimmtEngine()
    s = six_position({"a": [2, 90], "b": [56, 91], "c": [21, 92]}, [[10, 20, 30, 40, 50], [60], [70], [80]])
    for player, card in [("b", 56), ("c", 21), ("a", 2)]:
        s = e.apply_action(s, player, Action(type="select_number", card=f"number-{card}"))
    view = e.project_view(s, "c")
    assert s["phase"] == "take_row" and view.detail["resolution"] == []
    assert [item["card"]["value"] for item in view.detail["unresolved"]] == ["2", "21", "56"]
    assert "Your 2 is lower than every row end" in e.project_view(s, "a").message
    s = e.apply_action(s, "a", Action(type="take_row", choice="1"))
    steps = e.project_view(s, "b").detail["resolution"]
    # Later cards resolve against the updated rows: 21 follows the new starter 2.
    assert [(step["player"], step["card"]["value"], step["row"], step["kind"]) for step in steps] == [
        ("a", "2", 1, "low"), ("c", "21", 1, "placed"), ("b", "56", 0, "sixth")]
    assert [card["value"] for card in steps[0]["captured"]] == ["60"] and steps[0]["penalties"] == 3
    assert steps[1]["captured"] == [] and steps[1]["penalties"] == 0
    assert [card["value"] for card in steps[2]["captured"]] == ["10", "20", "30", "40", "50"]
    assert steps[2]["penalties"] == 3 + 3 + 3 + 3 + 3
    assert e.project_view(s, "b").detail["unresolved"] == []
    s = e.apply_action(s, s["order"][s["turn"]], Action(type="next_selection"))
    assert e.project_view(s, "a").detail["resolution"] == []


def test_simultaneous_messages_instruct_the_seat_that_can_act():
    e = SixNimmtEngine()
    s = six_position({"a": [2, 5], "b": [3, 6]}, [[10], [20], [30], [40]])
    s = e.apply_action(s, "a", Action(type="select_number", card="number-5"))
    # Only "b" can act; the message is an instruction, not "card locked" news.
    assert "Choose one number" in e.project_view(s, "b").message
    g = GangEngine()
    t = g.setup(["a", "b", "c"], {}, seed=3)
    t = g.apply_action(t, "a", Action(type="claim_chip", amount=2))
    assert g.project_view(t, "b").message.startswith("Take, swap or return chips")


def test_gang_taken_chip_is_reported_to_the_crew_until_its_holder_chooses_again():
    e = GangEngine()
    s = e.setup(["a", "b", "c"], {}, seed=3)
    s = e.apply_action(s, "a", Action(type="claim_chip", amount=2))
    s = e.apply_action(s, "b", Action(type="claim_chip", amount=2))
    assert s["chips"] == {"a": None, "b": 2, "c": None}
    for viewer in ["a", "b", "c"]:
        assert e.project_view(s, viewer).detail["taken_chips"] == {"a": {"by": "b", "rank": 2}}
    s = e.apply_action(s, "a", Action(type="claim_chip", amount=3))
    assert e.project_view(s, "a").detail["taken_chips"] == {}
    s = e.apply_action(s, "c", Action(type="claim_chip", amount=3))
    assert e.project_view(s, "a").detail["taken_chips"] == {"a": {"by": "c", "rank": 3}}
    s = e.apply_action(s, "a", Action(type="claim_chip", amount=1))
    assert s["street"] == 1 and e.project_view(s, "a").detail["taken_chips"] == {}


def test_gang_chip_transfer_return_and_final_pick_advance_canonical_street():
    e = GangEngine()
    s = e.setup(["a", "b", "c"], {}, seed=3)
    before = json.dumps(s, sort_keys=True)
    s1 = e.apply_action(s, "b", Action(type="claim_chip", amount=2))
    assert json.dumps(s, sort_keys=True) == before
    s1 = e.apply_action(s1, "a", Action(type="claim_chip", amount=1))
    s1 = e.apply_action(s1, "b", Action(type="return_chip"))
    assert s1["chips"] == {"a": 1, "b": None, "c": None}
    s1 = e.apply_action(s1, "b", Action(type="claim_chip", amount=2))
    s1 = e.apply_action(s1, "c", Action(type="claim_chip", amount=1))
    assert s1["chips"] == {"a": None, "b": 2, "c": 1}
    assert s1["street"] == 0 and len(s1["board"]) == 0
    s1 = e.apply_action(s1, "a", Action(type="claim_chip", amount=3))
    assert s1["street"] == 1 and len(s1["board"]) == 3
    assert s1["chips"] == dict.fromkeys(["a", "b", "c"])
    assert s1["history"] == [{"a": 3, "b": 2, "c": 1}]
    assert Counter(gang_inventory(s1)) == Counter(standard_deck())


def test_gang_private_hands_and_future_community_cards_are_not_projected():
    e = GangEngine()
    s = e.setup(["a", "b", "c"], {}, seed=4)
    view = e.project_view(s, "a")
    assert [c.id for c in view.hand] == s["hands"]["a"]
    assert all(p.cards == [None, None] for p in view.players)
    public = view.model_dump_json()
    for card in s["hands"]["b"] + s["hands"]["c"] + s["deck"]:
        assert f'"id":"{card}"' not in public
    assert "seed" not in public and "deck" not in view.detail
    assert e.legal_actions(s, "outsider") == []


def test_gang_identical_board_hands_allow_any_chip_order_and_team_victory():
    e = GangEngine()
    s = gang_showdown(["TS", "JS", "QS", "KS", "AS"],
                      {"a": ["2H", "3H"], "b": ["4H", "5H"], "c": ["6H", "7H"]}, vaults=2)
    s = reveal_all(e, s)
    assert s["phase"] == "finished" and s["vaults"] == 3 and s["alarms"] == 0
    assert s["winners"] == ["a", "b", "c"]
    assert all(p.score == 3 for p in e.project_view(s, "a").players)


def test_gang_full_kickers_matter_and_three_alarms_has_no_individual_winner():
    e = GangEngine()
    s = gang_showdown(["2S", "2H", "9D", "TC", "5S"],
                      {"a": ["AS", "4H"], "b": ["KH", "3C"], "c": ["QH", "6H"]}, alarms=2)
    first = e.apply_action(s, "a", Action(type="reveal_hand"))
    assert len(e.project_view(first, "c").players[0].cards) == 2
    assert e.project_view(first, "c").players[1].cards == [None, None]
    s = reveal_all(e, first)
    assert s["phase"] == "finished" and s["alarms"] == 3
    assert s["winners"] == [] and s["last_success"] is False


@pytest.mark.parametrize("engine,count", [(SixNimmtEngine(), 2), (SixNimmtEngine(), 10),
                                         (GangEngine(), 3), (GangEngine(), 6)])
def test_complete_seeded_matches_conserve_inventory_and_finish(engine, count):
    players = [f"p{i}" for i in range(count)]
    s = engine.setup(players, {}, seed=17)
    random = Random(13)
    inventory = six_inventory if isinstance(engine, SixNimmtEngine) else gang_inventory
    expected = Counter(range(1, 105)) if isinstance(engine, SixNimmtEngine) else Counter(standard_deck())
    for _ in range(4000):
        assert Counter(inventory(s)) == expected
        if s["phase"] == "finished":
            assert all(not engine.legal_actions(s, p) for p in players)
            return
        actor = s["order"][s["turn"]]
        options = engine.legal_actions(s, actor)
        assert options
        if isinstance(engine, GangEngine) and s["phase"] == "chips":
            assigned = set(s["chips"].values())
            options = [o for o in options if o.action.type == "claim_chip" and o.action.amount not in assigned]
        old = json.dumps(s, sort_keys=True)
        next_state = engine.apply_action(s, actor, random.choice(options).action)
        assert json.dumps(s, sort_keys=True) == old
        s = next_state
    pytest.fail("A complete match failed to reach its natural result.")
