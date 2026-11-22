"""Publish the validated Tarot card guide for the web client."""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from app.games.tarot.card_guide import all_guides
from app.games.tarot.deck import BY_ID, DECK


def validated_guide() -> list[dict]:
    """Every deck card once, in deck order, with today's upright sentence unchanged."""
    guides = all_guides()
    if [card.id for card in guides] != [card.id for card in DECK]:
        raise SystemExit("The card guide must list every deck card once, in deck order.")
    for card in guides:
        deck_card = BY_ID[card.id]
        if card.name != deck_card.name or card.upright.short != deck_card.meaning:
            raise SystemExit(f"The card guide and deck disagree about {card.id}.")
    return [card.model_dump() for card in guides]


def export(check: bool = False) -> None:
    result = validated_guide()
    target = ROOT / "packages/api-client/src/generated/tarot-card-guide.json"
    text = json.dumps(result, indent=2, ensure_ascii=False) + "\n"
    if check:
        if not target.is_file() or json.loads(target.read_text()) != result:
            raise SystemExit(
                "Tarot card guide drift. Run scripts/export_tarot_card_guide.py."
            )
    else:
        target.write_text(text)
    print(f"{'Checked' if check else 'Exported'} {len(result)} Tarot card guide entries.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    export(parser.parse_args().check)
