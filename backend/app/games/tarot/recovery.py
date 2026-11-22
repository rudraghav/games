"""Allowlisted failure metadata and targeted correction feedback.

Never retain provider prose, arbitrary schema keys or user inputs in diagnostics.
Every part of a fresh reading must say something (``answer_form``). No check ever
relaxes: a failed check is named to the next attempt, which must correct it.
"""

import json
import re
from dataclasses import dataclass
from typing import Any

from pydantic import ValidationError

CHECKS = frozenset({
    "answer_form", "question_form", "text_length", "required_fields", "unexpected_fields",
    "duplicate_fields", "invalid_json", "cards", "reference", "reference_evidence",
    "reference_diversity", "scene_detail", "chart", "placeholder", "incomplete", "invalid_output",
})
_PATH = re.compile(
    r"^(?:reading|title|introduction|next_step|cards(?:\.[0-2](?:\.(?:card_id|position|title|"
    r"interpretation|pop_culture|quirky_interpretation|characters(?:\.[0-1](?:\.(?:name|source|connection|evidence))?)?))?)?"
    r"|astrology_interpretation(?:\.(?:tarot_connection|next_step|western|vedic)"
    r"(?:\.(?:normal|quirky|focus_points(?:\.[0-2])?|focus_[12](?:\.(?:reflection|reflection_question|point_id))?))?)?)$"
)


@dataclass(frozen=True)
class ValidationIssue:
    check: str
    field: str = "reading"

    def __post_init__(self) -> None:
        if self.check not in CHECKS:
            object.__setattr__(self, "check", "invalid_output")
        if not isinstance(self.field, str) or not _PATH.fullmatch(self.field):
            object.__setattr__(self, "field", "reading")

    def feedback(self) -> dict[str, str]:
        return {"check": self.check, "field": self.field, "action": "correct_complete_output"}

    def message(self, *, retrying: bool = False) -> str:
        parts = self.field.split(".")
        label = "The reading"
        if parts[0] == "cards" and len(parts) > 1:
            label = f"Card {int(parts[1]) + 1}"
            label += "'s character connection" if "characters" in parts else " wording"
        elif parts[0] == "astrology_interpretation":
            label = (parts[1].capitalize() + " astrology") if len(parts) > 1 and parts[1] in {
                "western", "vedic",
            } else "The astrology section"
        elif self.field in {"title", "introduction", "next_step"}:
            label = {"title": "The title", "introduction": "The introduction",
                     "next_step": "The next step"}[self.field]
        reason = {
            "answer_form": "asked without saying what it means",
            "question_form": "didn't match the question format",
            "text_length": "didn't fit the text limits",
            "required_fields": "was missing a required part",
            "unexpected_fields": "included an unexpected part",
            "duplicate_fields": "repeated a required field",
            "invalid_json": "had an unreadable format",
            "cards": "didn't match your cards",
            "reference": "used an unmatched character",
            "reference_evidence": "didn't match the character source",
            "reference_diversity": "repeated a character connection",
            "scene_detail": "missed the detail from its scene",
            "chart": "didn't match the computed chart",
            "placeholder": "contained unfinished text",
            "incomplete": "was incomplete",
            "invalid_output": "couldn't be validated",
        }[self.check]
        return f"{label} {reason}.{' Retrying the reading.' if retrying else ''}"


class ReadingValidationError(ValueError):
    def __init__(self, issue: ValidationIssue, message: str) -> None:
        super().__init__(message)
        self.issue = issue


def schema_issue(error: ValidationError) -> ValidationIssue:
    # Pydantic input/error messages can contain private output. Inspect only
    # reviewed type/location values and our own typed domain exceptions.
    first = error.errors(include_input=False, include_url=False)[0]
    wrapped = first.get("ctx", {}).get("error")
    if isinstance(wrapped, ReadingValidationError):
        return wrapped.issue
    field = ".".join(str(part) for part in first["loc"])
    check = {
        "string_too_short": "text_length", "string_too_long": "text_length",
        "too_short": "required_fields", "too_long": "unexpected_fields",
        "missing": "required_fields", "extra_forbidden": "unexpected_fields",
    }.get(first["type"], "invalid_output")
    return ValidationIssue(check, field)


def reason_issue(reason: str) -> ValidationIssue:
    return ValidationIssue({
        "invalid_json": "invalid_json", "invalid_schema": "invalid_output",
        "invalid_wire_schema": "invalid_output", "duplicate_wire_key": "duplicate_fields",
        "invalid_text_length": "text_length", "placeholder_text": "placeholder",
        "invalid_reflection_question": "question_form", "invalid_answer": "answer_form",
        "incorrect_cards": "cards",
        "invalid_reference_id": "reference", "invalid_reference_evidence": "reference_evidence",
        "invalid_focus_id": "chart", "truncated": "incomplete", "empty_output": "incomplete",
        "not_completed": "incomplete",
    }.get(reason, "invalid_output"))


# A part "goes somewhere" when it states something before, or instead of, asking.
MAX_QUESTIONS = 2
_SENTENCE = re.compile(r"[^.!?…]+(?:[.!?…]+[\"'”’)\]]*|$)")


def says_something(text: str, *, max_questions: int = MAX_QUESTIONS, min_sentences: int = 1) -> bool:
    """At least one declarative sentence and a bounded number of questions.

    ``min_sentences=2`` is for an image that must be followed by what it means.

    Structural only: it reads punctuation and sentence length, never names, topics
    or the player's words, so it holds for any question in any language.
    """
    sentences = [part.strip() for part in _SENTENCE.findall(text) if part.strip()]
    statements = [part for part in sentences
                  if "?" not in part[-3:] and len(part.split()) >= 5]
    return bool(statements) and len(sentences) >= min_sentences and text.count("?") <= max_questions


def retry_request(request: dict[str, Any], issue: ValidationIssue) -> dict[str, Any]:
    """Name the latest failed check to the next attempt; the rest of the request is unchanged."""
    context = json.loads(request["input"])
    context["validation_feedback"] = issue.feedback()
    return {**request, "input": json.dumps(context, ensure_ascii=False, separators=(",", ":"))}


RETRY_INSTRUCTION = (
    " On validation_feedback correct the named check and field in a COMPLETE response. "
    "answer_form means that field must state in plain words what it means for the "
    "question and ask at most one question. Keep every other field rule, "
    "length limit, supplied fact, identity and chart constraint."
)


ALTERNATIVE_RETRY_MAPPING = (
    " Feedback uses zero-based card paths: use each card's output_section; "
    "interpretation maps to reflection, quirky_interpretation to imagery, "
    "pop_culture to bridge, and character connection to the schema's connection field."
)
