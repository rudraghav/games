"""Reading tone is chosen by the player and shared by every provider profile."""

from typing import Any, Literal

ReadingStyle = Literal["classic", "fun"]
DEFAULT_READING_STYLE: ReadingStyle = "fun"

# The live Fun contract. Each card's portrait (figure, reviewed scene and editorial
# move) stays server-owned; the model only translates the move into the question.
# ``{bridge}`` is the profile's own name for that one generated field.
FUN_CONNECTION = """Each card has one portrait: a public figure, a reviewed scene and a move (a concrete
action), shown by the app unchanged. {bridge} says what that move means for the
question in two sentences. First turn the idea behind the move (what it tests,
protects or makes possible) into an action in the asker's own situation, in fresh
words: "For your question, that could look like …". Swap every object, medium
and setting in the move for ones the question names; reuse none of the move's
sentences or props. Then say how that helps with what they asked, using only
people, things and feelings the question names. Shape only: move "Ask the expert
which sign shows they are on course", question about a baking class: "For your
question, that could look like asking your baking teacher which sign tells her
the dough is ready. Then you have something real to check before giving up on a
batch." Keep to that idea even when the fit is loose; do not restate the card.
With a blank question, apply it to whatever they are carrying into this spread.
Analogy only: add no fact about the
figure, name no other person, and never suggest the figure knows, endorses or
advises anything. Keep every name out of all other fields. Write lively, concrete
prose; stay gentle in hardship."""

# Appended only when no question was asked: a trusted fact about the request, never its content.
BLANK_QUESTION = """ No question was asked. Wherever these instructions say the question, speak to
whatever the asker is carrying into this spread: say what each card's theme could
offer in general, and presume no choice, problem, person, feeling or event. Never
write "your question"; a portrait's move begins "For whatever you are carrying
into this spread, that could look like …"."""

# Evaluation-only profiles written before the bridge keep their original wording.
LEGACY_FUN_CONNECTION = """Write lively, concrete card reflections and one practical next step tied to the
question. Keep the tone gentle in hardship. The app adds the illustrated comparisons after
generation; omit character fields and keep all named celebrities and fictional characters out of the prose."""


def model_context(context: dict[str, Any]) -> dict[str, Any]:
    """Legacy evaluation profiles: a Fun request without its portraits."""
    if context.get("reading_style") != "fun":
        return context
    return {**context, "cards": [
        {k: v for k, v in card.items() if k != "reference_characters"} for card in context["cards"]
    ]}


def saved_style(state: dict, *, submitted: bool) -> ReadingStyle:
    if state.get("reading_style") == "classic":
        return "classic"
    if state.get("reading_style") == "fun":
        return "fun"
    # Before style was recorded, every submitted reading used Classic.
    return "classic" if submitted else DEFAULT_READING_STYLE
