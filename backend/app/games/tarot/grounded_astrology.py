"""Groq astrology reasoning profile; exact bounded shortlist, shared prose/schema."""

import json
from copy import deepcopy
from itertools import product
from typing import Any

from app.games.tarot.characters import find_character
from app.games.tarot.grounded import build_grounded_request, decode_grounded_output
from app.games.tarot.providers import AlternativeOutputError, _context

PROFILE_VERSION = "grounded-qwen-astrology-3"
CANDIDATE_LIMIT = 2


def _viable_shortlists(context: dict[str, Any]) -> None:
    choices = [card["reference_characters"] for card in context["cards"]]
    # Keep at least one legal, distinct reference combination across all cards.
    # Ranking remains primary; retained source facts are never shortened.
    def family(reference: dict[str, Any]) -> tuple[str, str]:
        canonical = find_character(reference["name"], reference["source"])
        if canonical is None:
            raise AlternativeOutputError("invalid_reference_id")
        return canonical.get("identityFamily") or canonical["id"], canonical.get("kind", "")

    ranked = sorted(product(*(range(len(row)) for row in choices)), key=lambda indices: (sum(indices), indices))
    for indices in ranked:
        selected = [family(row[index]) for row, index in zip(choices, indices, strict=True)]
        if len({item[0] for item in selected}) == 3 and sum(item[1] == "meme" for item in selected) <= 1:
            for card, row, chosen in zip(context["cards"], choices, indices, strict=True):
                keep = sorted({chosen, next((index for index in range(len(row)) if index != chosen), chosen)})
                card["reference_characters"] = [row[index] for index in keep]
            return
    raise AlternativeOutputError("no_distinct_reference_combination")


def build_grounded_astrology_request(source: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    # Validate canonical shape using the same adapter before narrowing candidates.
    context = _context(source)
    if not context.get("astrology"):
        raise AlternativeOutputError("astrology_context_required")
    context = json.loads(source["input"])
    _viable_shortlists(context)
    effective = deepcopy(source)
    effective["input"] = json.dumps(context, ensure_ascii=False, separators=(",", ":"))
    body = build_grounded_request("groq", effective)
    body["reasoning_effort"] = "medium"
    return effective, body


def decode_grounded_astrology_output(body: object, source: dict[str, Any]) -> dict[str, Any]:
    context = _context(source)
    if (not context.get("astrology")
            or any(len(card["reference_characters"]) > CANDIDATE_LIMIT for card in context["cards"])):
        raise AlternativeOutputError("invalid_astrology_effective_shortlist")
    return decode_grounded_output("groq", body, source)
