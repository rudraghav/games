"""Regenerate or check public Uno/Deal artwork inventory from canonical decks."""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "apps/web/src/stories/generated/card-faces.json"
sys.path.insert(0, str(ROOT / "backend"))


def card_faces() -> list[dict[str, object]]:
    # These pure deck modules have no database, player state or random setup.
    from app.games.deal.deck import make_deck
    from app.games.uno.deck import deck, view

    rows: list[dict[str, object]] = []
    for mercy in (False, True):
        edition = "no-mercy" if mercy else "classic"
        seen_uno: set[tuple[str, str]] = set()
        for raw in deck(mercy):
            color, kind, _ = raw.split(":")
            if (color, kind) in seen_uno:
                continue
            seen_uno.add((color, kind))
            rows.append(
                {
                    "key": f"uno:{edition}:{color}:{kind}",
                    "game": "uno-no-mercy" if mercy else "uno",
                    "family": "shedding",
                    "kind": kind,
                    "card": view(raw).model_dump(),
                }
            )

        seen_deal: set[tuple[str, str, int, tuple[str, ...], str]] = set()
        for card in make_deck(mercy).values():
            semantic = (card.kind, card.action, card.value, card.colors, card.name)
            if semantic in seen_deal:
                continue
            seen_deal.add(semantic)
            # Keep each permitted orientation, even when two wilds share the
            # same current color and bank value. Only physical copies collapse.
            orientations: tuple[str | None, ...] = (
                card.colors if card.kind == "property" else (None,)
            )
            for orientation in orientations:
                rows.append(
                    {
                        "key": f"deal:{edition}:{card.id}:{orientation or 'hand'}",
                        "game": "monopoly-deal-no-mercy" if mercy else "monopoly-deal",
                        "family": "property",
                        "kind": card.kind,
                        "orientation": orientation,
                        "card": card.view(orientation).model_dump(),
                    }
                )
    return rows


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check", action="store_true", help="Fail on drift without writing files"
    )
    args = parser.parse_args(argv)
    rows = card_faces()
    expected = json.dumps(rows, indent=2) + "\n"
    if args.check:
        if not TARGET.is_file() or TARGET.read_text() != expected:
            raise SystemExit(
                f"Public card-face inventory drift: {TARGET.relative_to(ROOT)}. Run "
                "backend/.venv/bin/python scripts/export_card_faces.py."
            )
        print(
            f"Public card-face inventory matches {len(rows)} canonical faces/orientations."
        )
        return
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(expected)
    print(
        f"Generated {len(rows)} public canonical card faces/orientations "
        f"in {TARGET.relative_to(ROOT)}."
    )


if __name__ == "__main__":
    main()
