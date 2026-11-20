"""Catch clear portrait mix-ups in fresh Fun connections only."""

import json
import re
from functools import cache
from pathlib import Path

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


# Passing a character's name or common instructions alone cannot ground a scene.
_SCENE_STOP = frozenset("""
a an the and or but as at by for from in into of on over through to under with without
i we you your they their he she it him his her its who which what that this these those
is are was were be been has have had gives gets takes makes make get take can could would
will might does did do try someone something one other new own later after before while
""".split())
_SCENE_WORD = re.compile(r"[^\W_]+(?:[-’'][^\W_]+)*")


def _scene_words(text: str) -> list[str]:
    return [word.group().casefold().replace("’", "'") for word in _SCENE_WORD.finditer(text)]


@cache
def _reviewed_phrases() -> dict[str, list[str]]:
    return json.loads(Path(__file__).with_name("familiar-scenes.json").read_text())


def scene_hints(evidence: str, figure: dict) -> list[str]:
    # Excerpting can select a different sentence for a particular question.
    return [phrase for phrase in _reviewed_phrases().get(figure.get("id", ""), []) if phrase in evidence]


def uses_scene_detail(connection: str, figure: dict, evidence: str) -> bool:
    text = " " + " ".join(_scene_words(connection)) + " "
    hints = scene_hints(evidence, figure)
    if hints:
        return any(" " + " ".join(_scene_words(hint)) + " " in text for hint in hints)
    # The selected excerpt contains none of the curated phrases. Two meaningful words in
    # one short span distinguish a detail from generic advice or a copied name.
    identity = " ".join((figure["name"], figure["source"], *figure.get("aliases", [])))
    skip = _SCENE_STOP | set(_scene_words(identity))
    words = _scene_words(evidence)
    for start, word in enumerate(words):
        if len(word) <= 2 or word.removesuffix("'s") in skip:
            continue
        for end in range(start + 1, min(start + 6, len(words))):
            if len(words[end]) > 2 and words[end].removesuffix("'s") not in skip:
                if " " + " ".join(words[start:end + 1]) + " " in text:
                    return True
    return False
