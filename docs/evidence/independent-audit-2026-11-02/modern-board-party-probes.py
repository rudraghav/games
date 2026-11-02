"""Read-only, deterministic audit probes. No server, database, or network access.

Run from the repository root:
PYTHONPATH=backend backend/.venv/bin/python -B docs/evidence/independent-audit-2026-11-02/modern-board-party-probes.py

All positions start at setup and use enumerated legal actions; no state injection.
Output contains decision ordinals and public outcome summaries, never deck order
or unrevealed card identities. This is audit evidence, not a replacement test suite.
"""

import json
from collections import Counter
from copy import deepcopy
from pathlib import Path

from app.games.board.four import FourEngine
from app.games.sea_salt_paper.deck import CARDS
from app.games.sea_salt_paper.engine import PaperEngine, pair_kind


def inventory(state):
    return Counter(
        state["deck"] + state["draft"]
        + [c for pile in state["piles"] for c in pile]
        + [c for hand in state["hands"].values() for c in hand]
        + [c for played in state["played"].values() for c in played]
    )


def act(engine, state, trace, predicate):
    actor = state["order"][state["turn"]]
    actions = engine.legal_actions(state, actor)
    index, chosen = next((i, option) for i, option in enumerate(actions) if predicate(option.action))
    before = deepcopy(state)
    next_state = engine.apply_action(state, actor, chosen.action)
    assert state == before, "Engine mutated its input"
    assert inventory(next_state) == Counter(c.id for c in CARDS), "Inventory not conserved"
    trace.append({"actor_seat": state["turn"], "phase": state["phase"],
                  "legal_action_index": index, "action_type": chosen.action.type})
    return next_state


def reach_stock(seats, remaining, seed):
    engine = PaperEngine()
    state = engine.setup([f"qa-{i}" for i in range(seats)], {}, seed=seed)
    trace = []
    for _ in range(200):
        if state["phase"] == "playing" and len(state["deck"]) == remaining:
            return engine, state, trace
        desired = {"draw": "take_stock", "choosing": "keep", "playing": "end_turn"}[state["phase"]]
        state = act(engine, state, trace, lambda action: action.type == desired)
    raise AssertionError("Target state not reached")


def ready_stock(seats, remaining):
    for seed in range(200):
        engine, state, trace = reach_stock(seats, remaining, seed)
        actions = engine.legal_actions(state, state["order"][state["turn"]])
        has_stop = any(a.action.type == "stop" for a in actions)
        has_boat = any(a.action.type == "pair" and pair_kind(a.action.cards) == "boat" for a in actions)
        if has_stop and has_boat:
            return engine, state, trace, seed
    raise AssertionError("No suitable legal prefix within seed budget")


def summary(engine, state):
    viewer = state["order"][state["turn"]]
    view = engine.project_view(state, viewer)
    return {"phase": view.phase, "actor_seat": state["turn"], "stock_count": view.draw_count,
            "own_points": view.detail["own_points"],
            "legal_action_types": sorted({a.action.type for a in view.actions}),
            "remaining_final_turns": len(state["final_queue"]),
            "scores": state["scores"], "round_result": view.detail["round_result"],
            "message": view.message}


def paper_cases():
    results = []
    for seats in (2, 4):
        engine, base, prefix, seed = ready_stock(seats, 0)
        for branch in ("ordinary_finish", "immediate_stop", "last_chance", "boat_then_finish", "boat_then_stop"):
            state, trace = base, []
            initial = summary(engine, state)
            if branch == "ordinary_finish":
                state = act(engine, state, trace, lambda a: a.type == "end_turn")
            elif branch == "immediate_stop":
                state = act(engine, state, trace, lambda a: a.type == "stop")
            elif branch == "last_chance":
                state = act(engine, state, trace, lambda a: a.type == "last_chance")
                after_call = summary(engine, state)
                state = act(engine, state, trace, lambda a: a.type == "take_discard")
                state = act(engine, state, trace, lambda a: a.type == "end_turn")
            else:
                boats = [a for a in engine.legal_actions(state, state["order"][state["turn"]])
                         if a.action.type == "pair" and pair_kind(a.action.cards) == "boat"]
                if not boats:
                    results.append({"seats": seats, "branch": branch, "status": "not reached"})
                    continue
                state = act(engine, state, trace, lambda a: a.type == "pair" and pair_kind(a.cards) == "boat")
                after_call = summary(engine, state)
                state = act(engine, state, trace, lambda a: a.type == "take_discard")
                desired = "end_turn" if branch == "boat_then_finish" else "stop"
                state = act(engine, state, trace, lambda a: a.type == desired)
            record = {"seats": seats, "seed": seed, "branch": branch, "prefix_actions": len(prefix),
                      "prefix_recipe": "First legal take_stock, keep, or end_turn for the phase; stop at playing with stock 0.",
                      "initial": initial, "branch_trace": trace, "final": summary(engine, state)}
            if branch in {"last_chance", "boat_then_finish", "boat_then_stop"}:
                record["after_special_action"] = after_call
            results.append(record)
        engine, state, prefix, seed = ready_stock(seats, 2)
        trace = []
        initial = summary(engine, state)
        state = act(engine, state, trace, lambda a: a.type == "last_chance")
        state = act(engine, state, trace, lambda a: a.type == "take_stock")
        state = act(engine, state, trace, lambda a: a.type == "keep")
        state = act(engine, state, trace, lambda a: a.type == "end_turn")
        results.append({"seats": seats, "seed": seed, "branch": "stock_exhausted_during_final_turn",
                        "prefix_actions": len(prefix),
                        "prefix_recipe": "First legal take_stock, keep, or end_turn for the phase; stop at playing with stock 2.",
                        "initial": initial, "branch_trace": trace, "final": summary(engine, state)})
    return results


def four_result():
    engine = FourEngine()
    state = engine.setup(["qa-0", "qa-1"], {}, seed=0)
    columns = [0, 1, 0, 1, 0, 1, 0]
    for column in columns:
        actor = state["order"][state["turn"]]
        option = next(a for a in engine.legal_actions(state, actor) if a.action.choice == str(column))
        state = engine.apply_action(state, actor, option.action)
    view = engine.project_view(state, "qa-0")
    assert view.phase == "finished" and view.winners == ["qa-0"]
    return {"columns_zero_indexed": columns, "phase": view.phase, "message": view.message,
            "winners": view.winners, "projected_detail": view.detail,
            "observation": "Projection identifies last_move, but not the winning four cells or win direction."}


if __name__ == "__main__":
    output = {"evidence_type": "fresh local legal engine sequences; no saved match or production actions",
              "paper": paper_cases(), "four_in_a_row": four_result()}
    destination = Path(__file__).with_suffix(".json")
    destination.write_text(json.dumps(output, indent=2) + "\n")
    print(json.dumps({"output": str(destination), "paper_cases": len(output["paper"]),
                      "four_in_a_row": output["four_in_a_row"]}, indent=2))
