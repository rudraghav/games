"""Export synthetic, authorized casino motion sequences through real engines."""

import argparse
import json
import sys
from pathlib import Path
from uuid import NAMESPACE_DNS, uuid5

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from app.core.contracts import Action
from app.games.registry import ENGINES
from app.rooms.public_actions import public_action
from app.rooms.schemas import MemberView, RoomView


def export_game(game: str, count: int) -> dict:
    engine = ENGINES[game]
    players = [
        str(uuid5(NAMESPACE_DNS, f"casino-motion-player-{i}")) for i in range(count)
    ]
    viewer = players[0]
    seed = 17
    if game == "blackjack":
        # Find a real legal non-ace split, rather than replacing a hidden deck.
        for candidate in range(500):
            opening = engine.setup(players, {}, seed=candidate)
            dealt = engine.apply_action(opening, viewer, Action(type="bet", amount=10))
            if (
                any(
                    option.action.type == "split"
                    for option in engine.legal_actions(dealt, viewer)
                )
                and engine.project_view(dealt, viewer).hand[0].value != "A"
            ):
                seed = candidate
                break
        else:
            raise RuntimeError("No deterministic split fixture found")
    state = engine.setup(players, {}, seed=seed)
    snapshots = []
    cue = None
    version = 1
    hits = set()
    raised = False
    folded = False
    split = False

    def record() -> None:
        view = engine.project_view(state, viewer)
        snapshots.append(
            RoomView(
                id=str(uuid5(NAMESPACE_DNS, f"casino-motion-{game}")),
                name="Motion preview",
                code="PREVIEW1",
                game_id=game,
                owner_id=viewer,
                capacity=count,
                settings={},
                status="finished" if view.phase == "finished" else "playing",
                revision=version,
                match_id=str(uuid5(NAMESPACE_DNS, f"casino-motion-match-{game}")),
                match_version=version,
                paused=False,
                missing_players=[],
                messages=[],
                members=[
                    MemberView(
                        id=player,
                        name=[
                            "Alex",
                            "Dev",
                            "Mira",
                            "Sam",
                            "Noor",
                            "Jules",
                            "Kai",
                            "Robin",
                            "Ari",
                        ][i],
                        avatar=i % 8,
                        ready=False,
                        seated=True,
                        connected=True,
                        last_seen=0,
                    )
                    for i, player in enumerate(players)
                ],
                game=view,
                last_action=cue,
            ).model_dump(mode="json")
        )

    record()
    for _ in range(200):
        view = engine.project_view(state, viewer)
        if view.phase == "finished":
            break
        actor = view.current_player
        own = engine.project_view(state, actor)
        options = engine.legal_actions(state, actor)
        by_type = {option.action.type: option for option in options}
        if game == "holdem":
            if not raised and "raise" in by_type:
                option = by_type["raise"]
                raised = True
            elif raised and not folded and "fold" in by_type:
                option = by_type["fold"]
                folded = True
            else:
                option = by_type.get("check") or by_type.get("call") or options[0]
        elif game == "teen-patti":
            if "peek" in by_type:
                option = by_type["peek"]
            elif not folded and version > 6 and actor != viewer and "fold" in by_type:
                option = by_type["fold"]
                folded = True
            else:
                option = (
                    (by_type.get("show") if version > 8 else None)
                    or by_type.get("bet")
                    or options[0]
                )
        else:
            hand = state.get("hand_index", 0)
            if "bet" in by_type:
                option = by_type["bet"]
            elif not split and "split" in by_type:
                option = by_type["split"]
                split = True
            elif hand not in hits and "hit" in by_type:
                option = by_type["hit"]
                hits.add(hand)
            else:
                option = by_type.get("stand") or by_type.get("decline") or options[0]
        action = option.action.model_copy(deep=True)
        if option.input == "amount":
            action.amount = (
                10
                if game == "blackjack" and action.type == "bet"
                else option.minimum or 0
            )
        cue = public_action(own, actor, action, version + 1)
        state = engine.apply_action(state, actor, action)
        version += 1
        record()
    else:
        raise RuntimeError("Motion fixture failed to reach results")
    if state["phase"] != "finished":
        raise RuntimeError("Motion fixture is incomplete")
    return {"selfId": viewer, "snapshots": snapshots}


def export() -> dict:
    return {
        game: export_game(game, count)
        for game, count in [("holdem", 9), ("teen-patti", 3), ("blackjack", 1)]
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    target = ROOT / "apps/web/src/stories/fixtures/casino-motion.json"
    text = json.dumps(export(), indent=2) + "\n"
    if args.check:
        if not target.is_file() or target.read_text() != text:
            raise SystemExit(
                "Casino motion fixture drift. Run backend/.venv/bin/python scripts/export_casino_motion.py."
            )
        print("Casino motion fixtures match real engine projections.")
    else:
        target.write_text(text)
        print("Exported three complete authorized casino motion sequences.")


if __name__ == "__main__":
    main()
