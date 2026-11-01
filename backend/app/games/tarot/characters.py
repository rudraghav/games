"""Public reference cast. Saved historical readings remain unrestricted."""

import json
import re
import unicodedata
from pathlib import Path

CHARACTERS = json.loads(Path(__file__).with_name("characters.json").read_text())


def normalized(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).casefold().replace("&", "and")
    return re.sub(r"[^a-z0-9]", "", value)


def find_character(name: str, source: str) -> dict | None:
    for character in CHARACTERS:
        names = [character["name"], *character["aliases"]]
        sources = [character["source"], *character["sourceAliases"]]
        if normalized(name) in {normalized(n) for n in names} and any(
            normalized(s) == normalized(source) for s in sources
        ):
            return character
    return None


def lane_characters(lane: str) -> list[dict[str, str]]:
    return [{"name": c["name"], "source": c["source"]} for c in CHARACTERS if c["lane"] == lane]
