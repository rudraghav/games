"""Independent scoring/positions, hidden-view boundaries and conserved full matches."""

import json
from collections import Counter
from random import Random

import pytest

from app.core.contracts import Action, RuleError
from app.games.boop.engine import BoopEngine
from app.games.sea_salt_paper.deck import BY_ID, CARDS, card_points, color_bonus
from app.games.sea_salt_paper.engine import PaperEngine


def ids(kind, count, *, color=None):
    return [c.id for c in CARDS if c.kind == kind and (color is None or c.color == color)][:count]


def paper_state(hands, *, played=None, phase="playing"):
    engine = PaperEngine()
    state = engine.setup(list(hands), {}, seed=83)
    played = played or {p: [] for p in hands}
    used = [c for hand in hands.values() for c in hand] + [
        c for cards in played.values() for c in cards
    ]
    assert len(used) == len(set(used))
    remaining = [c.id for c in CARDS if c.id not in used]
    state.update(hands=hands, played=played, deck=remaining, piles=[[], []], phase=phase)
    return engine, state


def paper_inventory(s):
    return Counter(
        s["deck"]
        + s["draft"]
        + [c for p in s["piles"] for c in p]
        + [c for hand in s["hands"].values() for c in hand]
        + [c for pile in s["played"].values() for c in pile]
    )


def assert_boop_counts(s):
    for p in s["order"]:
        counts = Counter(t["kind"] for t in s["board"] if t and t["owner"] == p)
        assert counts["kitten"] + s["pools"][p]["kitten"] + s["retired"][p] == 8
        assert counts["cat"] + s["pools"][p]["cat"] + s["reserve"][p] == 8
        assert counts.total() + sum(s["pools"][p].values()) == 8


def test_paper_independent_type_color_and_physical_id_inventory():
    assert len(CARDS) == len(BY_ID) == 58
    assert Counter(c.kind for c in CARDS) == {
        "crab": 9,
        "boat": 8,
        "fish": 7,
        "swimmer": 5,
        "shark": 5,
        "mermaid": 4,
        "shell": 6,
        "octopus": 5,
        "penguin": 3,
        "sailor": 2,
        "lighthouse": 1,
        "shoal": 1,
        "penguin-colony": 1,
        "captain": 1,
    }
    assert Counter(c.color for c in CARDS) == {
        "navy": 9,
        "turquoise": 9,
        "black": 8,
        "yellow": 8,
        "green": 6,
        "white": 4,
        "purple": 4,
        "gray": 4,
        "peach": 3,
        "pink": 2,
        "orange": 1,
    }


@pytest.mark.parametrize(
    "kind,n,expected",
    [
        ("shell", 1, 0),
        ("shell", 2, 2),
        ("shell", 6, 10),
        ("octopus", 1, 0),
        ("octopus", 3, 6),
        ("octopus", 5, 12),
        ("penguin", 1, 1),
        ("penguin", 2, 3),
        ("penguin", 3, 5),
        ("sailor", 1, 0),
        ("sailor", 2, 5),
        ("crab", 5, 2),
        ("boat", 8, 4),
        ("fish", 7, 3),
    ],
)
def test_paper_collection_and_duo_scores(kind, n, expected):
    assert card_points(ids(kind, n)) == expected


def test_paper_mermaids_distinct_colors_include_white_and_multipliers():
    cards = ids("mermaid", 2) + ids("fish", 2, color="navy") + ids("shell", 1, color="navy")
    assert card_points(cards) == 6  # navy3+white2, plus one fish pair
    assert color_bonus(cards) == 3
    assert card_points(ids("captain", 1) + ids("sailor", 2)) == 11
    assert card_points(ids("lighthouse", 1) + ids("boat", 3)) == 4
    assert card_points(ids("shoal", 1) + ids("fish", 3)) == 4
    assert card_points(ids("penguin-colony", 1) + ids("penguin", 2)) == 7
    assert card_points(ids("shark", 3) + ids("swimmer", 2)) == 2


def test_paper_private_two_card_choice_and_forced_empty_pile():
    engine, s = paper_state({"a": [], "b": []}, phase="draw")
    s["piles"][1].append(s["deck"].pop())
    s = engine.apply_action(s, "a", Action(type="take_stock"))
    assert "Keep one" in engine.project_view(s, "a").message
    assert len(engine.project_view(s, "a").detail["private_options"]) == 2
    assert engine.project_view(s, "b").detail["private_options"] == []
    assert {o.action.choice for o in engine.legal_actions(s, "a")} == {"0"}
    draft = set(s["draft"])
    other = engine.project_view(s, "b").model_dump_json()
    assert all(c not in other for c in draft)
    before = json.dumps(s, sort_keys=True)
    updated = engine.apply_action(s, "a", engine.legal_actions(s, "a")[0].action)
    assert json.dumps(s, sort_keys=True) == before
    assert len(updated["hands"]["a"]) == 1 and len(updated["piles"][0]) == 1
    assert "Card kept" in engine.project_view(updated, "a").message
    assert paper_inventory(updated) == Counter(BY_ID.keys())


def test_paper_crab_only_inspects_chosen_pile_and_keeps_choice_private():
    engine, s = paper_state({"a": ids("crab", 2), "b": []})
    s["piles"] = [[s["deck"].pop(), s["deck"].pop()], [s["deck"].pop(), s["deck"].pop()]]
    pair = next(o for o in engine.legal_actions(s, "a") if o.action.type == "pair")
    s = engine.apply_action(s, "a", pair.action)
    assert s["phase"] == "crab_pile" and engine.project_view(s, "a").detail["private_options"] == []
    s = engine.apply_action(s, "a", Action(type="inspect", choice="0"))
    own = engine.project_view(s, "a")
    assert {c["id"] for c in own.detail["private_options"]} == set(s["piles"][0])
    hidden = s["piles"][0][0]
    assert hidden not in engine.project_view(s, "b").model_dump_json()
    s = engine.apply_action(s, "a", Action(type="take_inspected", card=hidden))
    assert hidden in s["hands"]["a"] and paper_inventory(s) == Counter(BY_ID.keys())


def test_paper_boat_repeat_and_fish_draw_effects():
    for kind, expected in [("boat", "draw"), ("fish", "playing")]:
        engine, s = paper_state({"a": ids(kind, 2), "b": []})
        before = len(s["deck"])
        s = engine.apply_action(
            s, "a", next(o.action for o in engine.legal_actions(s, "a") if o.action.type == "pair")
        )
        assert s["phase"] == expected and s["turn"] == 0
        assert len(s["played"]["a"]) == 2
        assert len(s["deck"]) == before - (kind == "fish")
        assert paper_inventory(s) == Counter(BY_ID.keys())


def test_paper_theft_only_unprotected_targets_and_no_hidden_state():
    engine, s = paper_state(
        {"a": ids("shark", 1) + ids("swimmer", 1), "b": ids("shell", 2), "c": ids("penguin", 2)}
    )
    s["protected"] = ["b"]
    s = engine.apply_action(
        s, "a", next(o.action for o in engine.legal_actions(s, "a") if o.action.type == "pair")
    )
    assert {o.action.target for o in engine.legal_actions(s, "a")} == {"c"}
    with pytest.raises(RuleError):
        engine.apply_action(s, "a", Action(type="steal", target="b"))
    before = set(s["hands"]["c"])
    s = engine.apply_action(s, "a", Action(type="steal", target="c"))
    assert len(before.intersection(s["hands"]["a"])) == 1
    assert paper_inventory(s) == Counter(BY_ID.keys())
    assert '"seed"' not in engine.project_view(s, "c").model_dump_json()


@pytest.mark.parametrize("caller_wins", [False, True])
def test_paper_last_chance_success_tie_and_failure_scoring(caller_wins):
    caller = ids("shell", 6)  # 10 card points; color bonus1
    opponent = ids("penguin", 3) + ids("sailor", 2)  # 10 card points; color bonus2
    if not caller_wins:
        opponent += ids("captain", 1)  # 16 card points
    engine, s = paper_state({"a": caller, "b": opponent})
    s = engine.apply_action(s, "a", Action(type="last_chance"))
    assert s["protected"] == ["a"] and s["turn"] == 1
    # Controlled post-draw state: final player has completed its draw without
    # altering the pinned card/colour totals above.
    s["phase"] = "playing"
    s = engine.apply_action(s, "b", Action(type="end_turn"))
    assert s["scores"] == ({"a": 11, "b": 2} if caller_wins else {"a": 1, "b": 16})
    assert s["starter"] == 1 and set(s["protected"]) == {"a", "b"}


def test_paper_stop_gate_exhaustion_and_instant_mermaid_win():
    engine, s = paper_state({"a": ids("shell", 2), "b": []})
    assert not any(o.action.type == "stop" for o in engine.legal_actions(s, "a"))
    with pytest.raises(RuleError):
        engine.apply_action(s, "a", Action(type="stop"))
    s["piles"][0].extend(s["deck"])
    s["deck"] = []
    s = engine.apply_action(s, "a", Action(type="end_turn"))
    assert s["phase"] == "round_over" and s["scores"] == {"a": 0, "b": 0}
    assert paper_inventory(s) == Counter(BY_ID.keys())
    engine, s = paper_state({"a": ids("mermaid", 4), "b": ids("shell", 6)})
    s = engine.apply_action(s, "a", Action(type="reveal_mermaids"))
    assert s["winners"] == ["a"] and s["phase"] == "finished"


@pytest.mark.parametrize("seats", [2, 4])
def test_paper_complete_standard_target_match(seats):
    e = PaperEngine()
    players = [f"p{i}" for i in range(seats)]
    s = e.setup(players, {}, seed=31)
    rng = Random(55)
    for _ in range(4000):
        assert paper_inventory(s) == Counter(BY_ID.keys())
        if s["phase"] == "finished":
            assert s["winners"] and (
                max(s["scores"].values()) >= {2: 40, 4: 30}[seats] or s["instant_mermaids"]
            )
            return
        p = s["order"][s["turn"]]
        options = e.legal_actions(s, p)
        preferred = [o for o in options if o.action.type in {"stop", "reveal_mermaids"}]
        if not preferred:
            preferred = (
                [o for o in options if o.action.type != "end_turn"]
                if rng.random() < 0.65
                else options
            )
        s = e.apply_action(s, p, rng.choice(preferred or options).action)
    pytest.fail("Base Sea Salt & Paper match did not finish")


def boop_state(pieces):
    e = BoopEngine()
    s = e.setup(["a", "b"], {})
    for slot, owner, kind in pieces:
        if kind == "cat":
            s["pools"][owner]["kitten"] -= 1
            s["retired"][owner] += 1
            s["reserve"][owner] -= 1
        else:
            s["pools"][owner]["kitten"] -= 1
        s["board"][slot] = {"owner": owner, "kind": kind}
    return e, s


def test_boop_no_chain_blocking_and_strength():
    e, s = boop_state([(14, "b", "kitten"), (15, "b", "kitten"), (8, "b", "cat")])
    s = e.apply_action(s, "a", Action(type="place", color="kitten", choice="13"))
    assert s["board"][14] and s["board"][15]  # blocked line of two
    assert s["board"][8]["kind"] == "cat"  # kitten cannot push adult
    assert_boop_counts(s)


def test_boop_off_board_return_and_no_secondary_movement():
    e, s = boop_state([(0, "b", "kitten"), (14, "b", "kitten"), (26, "b", "kitten")])
    s = e.apply_action(s, "a", Action(type="place", color="kitten", choice="7"))
    assert e.project_view(s, "a").message == e.project_view(s, "b").message
    assert "Choose an available piece" in e.project_view(s, "b").message
    assert s["board"][0] is None and s["pools"]["b"]["kitten"] == 6
    assert s["board"][21] and s["board"][26]  # moved piece does not boop neighbor
    assert_boop_counts(s)


def test_boop_mixed_graduation_retires_only_kittens_and_passes_turn():
    e, s = boop_state([(12, "a", "kitten"), (13, "a", "cat"), (14, "a", "kitten")])
    s["phase"] = "graduating"
    s = e.apply_action(s, "a", Action(type="graduate", choice="12,13,14"))
    assert s["retired"]["a"] == 3 and s["pools"]["a"] == {"kitten": 5, "cat": 3}
    assert all(s["board"][i] is None for i in [12, 13, 14]) and s["turn"] == 1
    assert_boop_counts(s)


def test_boop_overlapping_graduation_and_eight_piece_return_choices():
    e, s = boop_state([(i, "a", "kitten") for i in [0, 1, 2, 3, 12, 14, 24, 26]])
    s["phase"] = "graduating"
    actions = e.legal_actions(s, "a")
    assert {o.action.choice for o in actions if o.action.type == "graduate"} >= {"0,1,2", "1,2,3"}
    assert len([o for o in actions if o.action.type == "return_piece"]) == 8
    s = e.apply_action(s, "a", Action(type="return_piece", choice="26"))
    assert s["board"][26] is None and s["pools"]["a"]["cat"] == 1
    assert_boop_counts(s)


def test_boop_checks_only_active_player_and_checks_after_pushes():
    e, s = boop_state([(0, "b", "cat"), (1, "b", "cat"), (2, "b", "cat")])
    s = e.apply_action(s, "a", Action(type="place", color="kitten", choice="35"))
    assert not s["winners"] and s["turn"] == 1
    # The opponent's existing line survives their next placement and wins then.
    s = e.apply_action(s, "b", Action(type="place", color="kitten", choice="30"))
    assert s["winners"] == ["b"]
    e, s = boop_state([(0, "a", "cat"), (1, "a", "cat"), (2, "a", "cat")])
    s = e.apply_action(s, "a", Action(type="place", color="kitten", choice="35"))
    assert s["winners"] == ["a"] and not e.legal_actions(s, "a")


def test_boop_eight_adults_win_and_invalid_moves_rejected():
    positions = [0, 2, 4, 7, 15, 18, 22]
    e, s = boop_state([(i, "a", "cat") for i in positions])
    # Eighth adult in available pool after all eight kittens were graduated.
    s["pools"]["a"] = {"kitten": 0, "cat": 1}
    s["retired"]["a"] = 8
    s["reserve"]["a"] = 0
    with pytest.raises(RuleError):
        e.apply_action(s, "b", Action(type="place", color="cat", choice="35"))
    with pytest.raises(RuleError):
        e.apply_action(s, "a", Action(type="place", color="cat", choice="0"))
    s = e.apply_action(s, "a", Action(type="place", color="cat", choice="35"))
    assert s["winners"] == ["a"]
    assert_boop_counts(s)


def test_boop_complete_public_game_conserves_and_never_mutates():
    e = BoopEngine()
    s = e.setup(["a", "b"], {})
    rng = Random(17)
    for _ in range(2000):
        assert_boop_counts(s)
        assert '"seed"' not in e.project_view(s, "a").model_dump_json()
        if s["phase"] == "finished":
            assert s["winners"]
            return
        p = s["order"][s["turn"]]
        options = e.legal_actions(s, p)
        assert options
        adults = [o for o in options if o.action.type == "place" and o.action.color == "cat"]
        choice = rng.choice(adults or options)
        before = json.dumps(s, sort_keys=True)
        new = e.apply_action(s, p, choice.action)
        assert json.dumps(s, sort_keys=True) == before
        s = new
    pytest.fail("boop did not reach a natural win")
