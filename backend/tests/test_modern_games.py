"""Conserved physical inventories and complete modern-game matches."""

import json
from collections import Counter
from copy import deepcopy
from random import Random

import pytest

from app.core.contracts import Action, RuleError
from app.games.azul.engine import (
    COLORS,
    AzulEngine,
    end_bonus,
    placement_score,
    wall_column,
)
from app.games.flip_seven.engine import FlipSevenEngine, deck, round_points
from app.games.trio.engine import TrioEngine, number


def flip_cards(s):
    return s["deck"] + s["discard"] + [c for pile in s["table"].values() for c in pile]


def azul_cards(s):
    return (s["bag"] + s["discard"] + s["center"] + s["draft"]
            + [t for f in s["factories"] for t in f]
            + [t for lines in s["lines"].values() for line in lines for t in line]
            + [t for wall in s["wall"].values() for row in wall for t in row if t]
            + [t for floor in s["floor"].values() for t in floor if t != "first"])


def trio_cards(s):
    # Pending table reveals remain in place; pending hand reveals are temporarily out.
    return ([t for t in s["table"] if t]
            + [t for hand in s["hands"].values() for t in hand]
            + [t for trio in s["trios"].values() for t in trio]
            + ([r["card"] for r in s["reveals"] if r["owner"] != "table"]
               if s["phase"] == "revealing" or s.get("failed") else []))


@pytest.mark.parametrize("engine,seats", [(FlipSevenEngine(), 3), (FlipSevenEngine(), 10),
                                         (TrioEngine(), 3), (TrioEngine(), 6),
                                         (AzulEngine(), 2), (AzulEngine(), 4)])
def test_modern_complete_matches_conserve_and_project(engine, seats):
    players = [f"p{i}" for i in range(seats)]
    s = engine.setup(players, {}, seed=41)
    inventory = flip_cards if isinstance(engine, FlipSevenEngine) else azul_cards if isinstance(engine, AzulEngine) else trio_cards
    expected = Counter(inventory(s))
    rng = Random(19)
    for _ in range(6000):
        assert Counter(inventory(s)) == expected
        view = engine.project_view(s, players[0])
        assert "seed" not in view.detail and "deck" not in view.detail and "bag" not in view.detail
        if s["phase"] == "finished":
            assert s["winners"]
            assert not engine.legal_actions(s, players[0])
            return
        actor = s["order"][s["turn"]]
        options = engine.legal_actions(s, actor)
        assert options
        if isinstance(engine, TrioEngine):
            # Controlled legal fixture strategy; no strategy information enters a client view.
            goal = number(s["reveals"][0]["card"]) if s["reveals"] else None
            ranked = []
            for o in options:
                a = o.action
                value = (number(s["table"][int(a.choice)]) if a.type == "reveal_table" else
                         number(s["hands"][a.target][0 if a.choice == "low" else -1]) if a.type == "reveal_hand" else 0)
                ranked.append((o, value))
            matches = [o for o, v in ranked if v == goal] if goal else []
            choice = rng.choice(matches or options)
        elif isinstance(engine, AzulEngine):
            if s["phase"] == "placing":
                preferred = [o for o in options if o.action.choice == "0"]
                choices = preferred or [o for o in options if o.action.choice != "floor"] or options
            else:
                choices = [o for o in options if o.action.type != "draft_tiles" or
                           s["wall"][actor][0][wall_column(0, o.action.color)] is None] or options
            choice = rng.choice(choices)
        else:
            choices = [o for o in options if o.action.type == "stay"] if round_points(s, actor) >= 18 else []
            choice = rng.choice(choices or options)
        old = json.dumps(s, sort_keys=True)
        next_state = engine.apply_action(s, actor, choice.action)
        assert json.dumps(s, sort_keys=True) == old
        s = next_state
    pytest.fail(f"{engine.manifest.id} did not finish")


def test_flip_inventory_and_score_order():
    assert len(deck()) == 94 == len(set(deck()))
    assert Counter(int(c.split("-")[1]) for c in deck() if c.startswith("n-")) == Counter({0: 1, **{n: n for n in range(1, 13)}})
    engine = FlipSevenEngine()
    s = engine.setup(["a", "b", "c"], {}, 7)
    s["table"]["a"] = [f"n-{n}-0" for n in range(7)] + ["times-2", "plus-10"]
    s["status"]["a"] = "active"
    assert round_points(s, "a") == 21 * 2 + 10 + 15
    s["status"]["a"] = "busted"
    assert round_points(s, "a") == 0


def controlled_flip(cards):
    engine = FlipSevenEngine()
    s = engine.setup(["a", "b", "c"], {}, 13)
    s.update(table={p: [] for p in s["order"]}, status=dict.fromkeys(s["order"], "active"),
             tasks=[], pending=None, turn=0, resume=1, phase="playing", deck=list(reversed(cards)))
    s["discard"] = [c for c in deck() if c not in cards]
    return engine, s


def test_flip_protection_no_replacement_and_second_protection_transfer():
    e, s = controlled_flip(["n-5-1", "n-2-0"])
    s["table"]["a"] = ["n-5-0", "chance-0"]
    for c in s["table"]["a"]:
        s["discard"].remove(c)
    s = e.apply_action(s, "a", Action(type="hit"))
    assert s["table"]["a"] == ["n-5-0"]
    assert s["deck"] == ["n-2-0"] and s["turn"] == 1
    e, s = controlled_flip(["chance-1"])
    s["table"]["a"] = ["chance-0"]
    s["discard"].remove("chance-0")
    s = e.apply_action(s, "a", Action(type="hit"))
    assert {o.action.target for o in e.legal_actions(s, "a")} == {"b", "c"}
    s = e.apply_action(s, "a", Action(type="target_effect", target="b"))
    assert s["table"]["b"] == ["chance-1"] and s["table"]["a"] == ["chance-0"]
    assert len(flip_cards(s)) == 94


def test_flip_three_defers_freeze_and_cancels_on_bust():
    e, s = controlled_flip(["three-0", "freeze-0", "n-4-0", "n-4-1"])
    s = e.apply_action(s, "a", Action(type="hit"))
    s = e.apply_action(s, "a", Action(type="target_effect", target="b"))
    assert s["status"]["b"] == "busted" and s["pending"] is None
    assert s["status"]["a"] == s["status"]["c"] == "active"
    assert len(flip_cards(s)) == 94
    e, s = controlled_flip(["three-0", "freeze-0", "n-4-0", "plus-4"])
    s = e.apply_action(s, "a", Action(type="hit"))
    s = e.apply_action(s, "a", Action(type="target_effect", target="b"))
    assert s["phase"] == "target" and s["turn"] == 1
    assert len(s["table"]["b"]) == 4  # incoming Flip Three plus the three draws
    s = e.apply_action(s, "b", Action(type="target_effect", target="c"))
    assert s["status"]["c"] == "frozen" and s["turn"] == 1


def test_flip_deferred_effects_survive_self_freeze_and_last_active_targets_self():
    e, s = controlled_flip(["three-0", "freeze-0", "three-1", "n-2-0", "n-3-0", "n-4-0", "n-5-0"])
    s = e.apply_action(s, "a", Action(type="hit"))
    s = e.apply_action(s, "a", Action(type="target_effect", target="b"))
    s = e.apply_action(s, "b", Action(type="target_effect", target="b"))
    assert s["status"]["b"] == "frozen" and s["pending"]["card"] == "three-1"
    assert {o.action.target for o in e.legal_actions(s, "b")} == {"a", "c"}
    s = e.apply_action(s, "b", Action(type="target_effect", target="c"))
    assert len(s["table"]["c"]) == 4  # incoming action stays with its target
    e, s = controlled_flip(["freeze-0"])
    s["status"].update(b="stayed", c="busted")
    s = e.apply_action(s, "a", Action(type="hit"))
    assert [o.action.target for o in e.legal_actions(s, "a")] == ["a"]
    s = e.apply_action(s, "a", Action(type="target_effect", target="a"))
    assert s["phase"] == "round_over"


def test_flip_mid_round_shuffle_keeps_inactive_cards_and_seed_reproduces():
    e, s = controlled_flip([])
    s["table"]["b"] = ["n-12-0", "n-12-1"]
    s["status"]["b"] = "busted"
    for card in s["table"]["b"]:
        s["discard"].remove(card)
    after = e.apply_action(s, "a", Action(type="hit"))
    again = e.apply_action(s, "a", Action(type="hit"))
    assert after == again and after["table"]["b"] == s["table"]["b"]
    assert Counter(flip_cards(after)) == Counter(deck())


def test_flip_transferred_action_does_not_allow_an_empty_drawer_to_stay():
    e, s = controlled_flip(["freeze-0"])
    s = e.apply_action(s, "a", Action(type="hit"))
    s = e.apply_action(s, "a", Action(type="target_effect", target="b"))
    assert not s["table"]["a"] and s["table"]["b"] == ["freeze-0"]
    # Return a normal turn to the empty drawer without exposing new cards.
    s["turn"] = 0
    assert [o.action.type for o in e.legal_actions(s, "a")] == ["hit"]
    assert Counter(flip_cards(s)) == Counter(deck())


def test_flip_seven_ends_immediately_and_ties_continue():
    e, s = controlled_flip(["n-6-0", "n-12-0"])
    s["table"]["a"] = [f"n-{n}-0" for n in range(6)]
    for c in s["table"]["a"]:
        s["discard"].remove(c)
    s = e.apply_action(s, "a", Action(type="hit"))
    assert s["phase"] == "round_over" and s["round_scores"]["a"] == 36
    assert s["deck"] == ["n-12-0"]
    s["scores"] = {"a": 200, "b": 200, "c": 0}
    s["table"] = {p: [] for p in s["order"]}
    e._finish_round(s)
    assert s["phase"] == "round_over" and not s["winners"]


def test_trio_privacy_mismatch_and_dynamic_ends():
    e = TrioEngine()
    s = e.setup(["a", "b", "c"], {}, 17)
    view = e.project_view(s, "a")
    projected = json.dumps(view.model_dump())
    assert not any(c in projected for c in s["hands"]["b"] + s["hands"]["c"] + s["table"])
    s = e.apply_action(s, "a", Action(type="reveal_hand", target="b", choice="low"))
    first = s["reveals"][0]["card"]
    assert first not in s["hands"]["b"]
    end = s["hands"]["b"][-1]
    s = e.apply_action(s, "a", Action(type="reveal_hand", target="b", choice="high"))
    assert number(first) != number(end) and s["phase"] == "review"
    s = e.apply_action(s, "a", Action(type="continue"))
    assert first in s["hands"]["b"] and end in s["hands"]["b"]
    assert s["turn"] == 1
    with pytest.raises(RuleError):
        e.apply_action(s, "a", Action(type="reveal_table", choice="0"))


@pytest.mark.parametrize("value,prior", [(7, []), (4, ["trio-1-0", "trio-1-1", "trio-1-2", "trio-2-0", "trio-2-1", "trio-2-2"])])
def test_trio_both_victory_conditions(value, prior):
    e = TrioEngine()
    s = e.setup(["a", "b", "c"], {}, 8)
    s.update(hands={"a": [], "b": [], "c": []}, table=[f"trio-{value}-{i}" for i in range(3)],
             trios={"a": prior, "b": [], "c": []})
    for i in range(3):
        s = e.apply_action(s, "a", Action(type="reveal_table", choice=str(i)))
    assert s["phase"] == "finished" and s["winners"] == ["a"]


def test_azul_adjacency_and_bonuses():
    wall = [[None] * 5 for _ in range(5)]
    wall[2][2] = "red-0"
    assert placement_score(wall, 2, 2) == 1
    wall[2][1], wall[1][2], wall[3][2] = "white-0", "blue-0", "black-0"
    assert placement_score(wall, 2, 2) == 5
    full = [[f"{COLORS[(c-r) % 5]}-{r}" for c in range(5)] for r in range(5)]
    assert end_bonus(full) == 5 * 2 + 5 * 7 + 5 * 10


def test_azul_center_marker_overflow_and_illegal_line():
    e = AzulEngine()
    s = e.setup(["a", "b"], {}, 9)
    s["center"] = ["blue-0", "blue-1", "red-0"]
    s = e.apply_action(s, "a", Action(type="draft_tiles", choice="center", color="blue"))
    assert s["floor"]["a"] == ["first"] and s["center"] == ["red-0"]
    s = e.apply_action(s, "a", Action(type="place_tiles", choice="0"))
    assert s["lines"]["a"][0] == ["blue-0"] and s["floor"]["a"] == ["first", "blue-1"]
    s["turn"], s["phase"], s["draft"] = 0, "placing", ["red-1"]
    with pytest.raises(RuleError):
        e.apply_action(s, "a", Action(type="place_tiles", choice="0"))
    s["floor"]["a"] = ["first"] + [f"white-{i}" for i in range(6)]
    e._floor(s, "a", ["red-1", "red-2"])
    assert len(s["floor"]["a"]) == 7 and s["discard"][-2:] == ["red-1", "red-2"]


def test_azul_floor_clamp_top_down_scores_and_stock_refill():
    e = AzulEngine()
    s = e.setup(["a", "b"], {}, 19)
    s["lines"]["a"] = [["blue-0"], ["blue-1", "blue-2"], [], [], []]
    # Row 0/blue is column 0; row 1/blue is column 1. Each new tile
    # links two horizontal and two vertical tiles, including itself.
    s["wall"]["a"][0][1] = "yellow-0"
    s["wall"]["a"][1][0] = "white-0"
    s["floor"]["a"] = ["first", "red-1", "red-2", "red-3", "red-4", "red-5", "red-6"]
    e._score_round(s)
    assert s["last_scores"]["a"] == {"wall": 8, "floor": 14}
    assert s["scores"]["a"] == 0 and s["lines"]["a"][:2] == [[], []]
    assert "first" not in s["discard"]
    # Explicit short stock: refill exactly when bag empties; no tile invented.
    s.update(bag=["blue-10"], discard=["red-10", "red-11"], factories=[[], [], [], [], []])
    e._offer(s)
    assert [len(f) for f in s["factories"]] == [3, 0, 0, 0, 0]
    assert sorted(t for f in s["factories"] for t in f) == ["blue-10", "red-10", "red-11"]
    assert s["phase"] == "drafting" and e.legal_actions(s, s["order"][s["turn"]])
    assert not s["winners"]


def test_azul_conserved_zero_offer_finishes_without_reclaiming_lines():
    e = AzulEngine()
    s = e.setup(["a", "b", "c", "d"], {}, 23)
    pool = {color: [f"{color}-{i}" for i in range(20)] for color in COLORS}
    missing = ("blue", "yellow", "red", "black", "blue")
    for p in s["order"]:
        s["wall"][p] = [[None] * 5 for _ in range(5)]
        for row in range(5):
            for color in COLORS:
                if color != missing[row]:
                    s["wall"][p][row][wall_column(row, color)] = pool[color].pop()
        s["lines"][p] = [[], [pool["yellow"].pop()], [pool["red"].pop()],
                          [pool["black"].pop()], [pool["blue"].pop(), pool["blue"].pop()]]
    assert not any(pool.values())
    s.update(bag=[], discard=[], factories=[[] for _ in range(9)], center=[], draft=[])
    s["scores"] = {p: 10 + i for i, p in enumerate(s["order"])}
    expected = Counter(f"{color}-{i}" for color in COLORS for i in range(20))
    assert Counter(azul_cards(s)) == expected
    preserved = deepcopy(s["lines"])
    e._score_round(s)
    assert s["phase"] == "finished" and s["exhausted"]
    assert s["winners"] == ["d"] and s["scores"]["d"] == 30
    assert s["lines"] == preserved and Counter(azul_cards(s)) == expected
    assert "Games exhaustion convention" in e.project_view(s, "a").message
    assert not e.legal_actions(s, "a")


def test_azul_round_end_bonuses_and_completed_rows_break_score_ties():
    e = AzulEngine()
    s = e.setup(["a", "b"], {}, 2)
    s["lines"] = {p: [[] for _ in range(5)] for p in ("a", "b")}
    s["wall"]["a"][0] = [f"{c}-0" for c in COLORS]
    s["wall"]["b"][0] = [f"{c}-1" for c in COLORS]
    s["wall"]["a"][1] = [f"{COLORS[(i - 1) % 5]}-2" for i in range(5)]
    s["scores"] = {"a": 10, "b": 12}  # row bonuses make both totals 14
    e._score_round(s)
    assert s["scores"] == {"a": 14, "b": 14}
    assert s["winners"] == ["a"] and s["phase"] == "finished"
    with pytest.raises(RuleError):
        e.apply_action(s, "a", Action(type="next_round"))


@pytest.mark.parametrize("engine", [FlipSevenEngine(), TrioEngine(), AzulEngine()])
def test_modern_player_limits_and_illegal_moves(engine):
    with pytest.raises(RuleError):
        engine.setup(["a"], {}, 3)
    s = engine.setup([f"p{i}" for i in range(engine.manifest.min_players)], {}, 4)
    with pytest.raises(RuleError):
        engine.apply_action(s, "p0", Action(type="invented_move"))
