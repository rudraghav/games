"""Check the reviewed connection catalogue for clear portrait mix-ups."""

import re
from functools import cache

from app.games.tarot.characters import CHARACTERS
from app.games.tarot.reference_retrieval import FAMILIAR_CAST


@cache
def _familiar_names() -> list[tuple[str, re.Pattern, re.Pattern]]:
    patterns = []
    for figure in CHARACTERS:
        if figure["id"] not in FAMILIAR_CAST or figure.get("kind") == "meme":
            continue
        names = [figure["name"], *figure["aliases"]]
        mentions = []
        for name in names:
            token = rf"(?<!\w){re.escape(name)}(?!\w)"
            if " " in name:
                mentions.append(token)
            else:
                # Single names may be ordinary words (Joy, Link, Circuit).
                # Require capitalization plus an explicit comparison or work attribution.
                mentions.extend((rf"(?:[Ll]ike |[Tt]hink of ){token}", rf"{token} from [A-Z0-9]"))
        # A source may introduce a companion by surname (Watson for Dr. Watson).
        allowed = set(names) | {name.split()[-1] for name in names if len(name.split()[-1]) >= 4}
        sourced = re.compile(r"(?<!\w)(?:" + "|".join(map(re.escape, allowed)) + r")(?!\w)", re.I)
        patterns.append((figure.get("identityFamily") or figure["id"], re.compile("|".join(mentions)), sourced))
    return patterns


def has_unrelated_figure(connection: str, selected: dict, evidence: str) -> bool:
    family = selected.get("identityFamily") or selected["id"]
    source = " ".join((selected["name"], selected["source"], *selected["aliases"], evidence))
    return any(other != family and mention.search(connection) and not sourced.search(source)
               for other, mention, sourced in _familiar_names())
