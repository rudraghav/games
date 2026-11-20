"""Public reference cast. Saved historical readings remain unrestricted."""

import json
import re
import unicodedata
from pathlib import Path

from app.games.tarot.reference_retrieval import enriched, retrieve
from app.games.tarot.style import ReadingStyle

CHARACTERS = enriched(json.loads(Path(__file__).with_name("characters.json").read_text()))
REFERENCE_LANES = tuple(dict.fromkeys(c["lane"] for c in CHARACTERS))
REFERENCES_PER_CARD = 6


def normalized(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).casefold().replace("&", "and")
    return re.sub(r"[^a-z0-9]", "", value)


def _identity_index() -> dict[tuple[str, str], dict]:
    index: dict[tuple[str, str], dict] = {}
    for character in CHARACTERS:
        for name in [character["name"], *character["aliases"]]:
            for source in [character["source"], *character["sourceAliases"]]:
                key = normalized(name), normalized(source)
                previous = index.setdefault(key, character)
                if previous["id"] != character["id"]:
                    raise ValueError("The reference catalogue contains an ambiguous identity.")
    return index


_IDENTITIES = _identity_index()


def find_character(name: str, source: str) -> dict | None:
    return _IDENTITIES.get((normalized(name), normalized(source)))


def lane_characters(lane: str) -> list[dict[str, str]]:
    return [{"name": c["name"], "source": c["source"]} for c in CHARACTERS if c["lane"] == lane]


def reference_candidates(
    card_ids: list[str], question: str = "", *, per_card: int = REFERENCES_PER_CARD,
    reading_style: ReadingStyle = "classic",
) -> list[list[dict]]:
    """Choose bounded, evidence-backed references by meaning, then diversify.

    The local index contains public reference facts only. The optional question
    is encoded in memory once; no profile, history, logging or remote embedding.
    """
    return retrieve(CHARACTERS, card_ids, question, per_card=per_card, reading_style=reading_style)
