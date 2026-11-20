"""Reading tone is chosen by the player and shared by every provider profile."""

from typing import Literal

ReadingStyle = Literal["classic", "fun"]

FUN_CONNECTION = """Write connection in two short sentences. First show the named figure doing
something from this card's public_context, using one of its scene_phrases word for word.
When no phrase is listed copy a short action or object phrase from public_context.
Then make that SAME move practical: a choice you could try and what it might change.
Keep it playful and plain, gentle in hardship. Use only supplied facts and no other comparison.
Keep named figures in their own connection."""


def saved_style(state: dict) -> ReadingStyle:
    return "fun" if state.get("reading_style") == "fun" else "classic"
