"""Reading tone is chosen by the player and shared by every provider profile."""

from typing import Any, Literal

ReadingStyle = Literal["classic", "fun"]

FUN_CONNECTION = """Write lively, concrete card reflections and one practical next step tied to the
question. Keep the tone gentle in hardship. The app adds the illustrated comparisons after
generation; omit character fields and keep all named celebrities and fictional characters out of the prose."""


def model_context(context: dict[str, Any]) -> dict[str, Any]:
    if context.get("reading_style") != "fun":
        return context
    return {**context, "cards": [
        {k: v for k, v in card.items() if k != "reference_characters"} for card in context["cards"]
    ]}


def saved_style(state: dict) -> ReadingStyle:
    return "fun" if state.get("reading_style") == "fun" else "classic"
