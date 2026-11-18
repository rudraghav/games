"""Failure diagnostics cannot expose output or disable factual contracts."""

import json

import pytest
from test_astrology_reading import CARDS, interpretation, synthetic_chart
from test_tarot import example_reading

from app.games.tarot.reading import ReadingOutputError, _parse_output, reading_failure
from app.games.tarot.recovery import ValidationIssue, question_relaxed, retry_request


def parse(payload, chart=None):
    return _parse_output({"status": "completed", "steps": [{
        "type": "model_output", "content": [{"type": "text", "text": json.dumps(payload)}],
    }]}, CARDS, chart)


@pytest.mark.parametrize("check,field", [
    ("private-provider-text", "cards.0.secret-personal-field"),
    ("question_form", "cards.9.interpretation"),
    ("question_form", "astrology_interpretation.private-data"),
    ("chart", "astrology_interpretation.western.normal"),
    ("reference", "cards.0.characters.0.name"),
])
def test_untrusted_or_factual_checks_cannot_grant_style_relaxation(check, field):
    issue = ValidationIssue(check, field)
    assert not issue.relaxable
    request = retry_request({"input": json.dumps({"question": "private-question"})}, issue)
    context = json.loads(request["input"])
    assert "validation_relaxations" not in context
    assert not question_relaxed(request, "cards.0.interpretation")
    assert "private" not in repr(issue) + str(issue.feedback()) + issue.message(retrying=True)


def test_retry_grants_only_the_exact_field_and_never_mutates_original_request():
    original = {"input": json.dumps({"cards": [], "question": "private-question"})}
    retry = retry_request(original, ValidationIssue("question_form", "cards.1.interpretation"))
    assert question_relaxed(retry, "cards.1.interpretation")
    assert not question_relaxed(retry, "cards.0.interpretation")
    assert not question_relaxed(retry, "cards.1.characters.0.connection")
    assert not question_relaxed(original, "cards.1.interpretation")
    assert len(json.loads(retry_request(retry, ValidationIssue(
        "question_form", "cards.1.interpretation",
    ))["input"])["validation_relaxations"]) == 1


@pytest.mark.parametrize("kind,check,field", [
    ("short", "text_length", "cards.1.interpretation"),
    ("missing", "required_fields", "cards.1.quirky_interpretation"),
    ("private-extra", "unexpected_fields", "reading"),
    ("cards", "cards", "cards"),
    ("reference", "reference", "cards"),
    ("duplicate", "reference_diversity", "cards"),
    ("chart", "chart", "astrology_interpretation.western.normal"),
])
def test_specific_diagnostics_survive_schema_and_domain_wrapping(kind, check, field):
    payload = example_reading(CARDS)
    chart = None
    if kind == "short":
        payload["cards"][1]["interpretation"] = "private"
    elif kind == "missing":
        del payload["cards"][1]["quirky_interpretation"]
    elif kind == "private-extra":
        payload["private-extra"] = "private-provider-prose"
    elif kind == "cards":
        payload["cards"].reverse()
    elif kind == "reference":
        payload["cards"][0]["characters"][0]["name"] = "private-unknown-reference"
    elif kind == "duplicate":
        payload["cards"][1]["characters"] = payload["cards"][0]["characters"]
    else:
        chart = synthetic_chart("western")
        payload["astrology_interpretation"] = interpretation("western", chart)
        payload["astrology_interpretation"]["western"]["normal"] = (
            "Consider this symbolic invitation without any supplied chart placements."
        )
    with pytest.raises(ReadingOutputError) as failed:
        parse(payload, chart)
    issue = failed.value.issue
    assert (issue.check, issue.field, issue.relaxable) == (check, field, False)
    assert "private" not in str(issue.feedback()) + reading_failure(failed.value).message
    assert reading_failure(failed.value).retryable


def test_all_user_diagnostics_fit_persisted_progress_without_raw_output():
    from app.games.tarot.recovery import CHECKS

    for check in CHECKS:
        for field in ["reading", "cards.2.characters.0.connection",
                      "astrology_interpretation.western.focus_1.reflection_question"]:
            assert len(ValidationIssue(check, field).message(retrying=True)) <= 160


def test_chart_focus_diagnostic_names_the_known_system_without_relaxation():
    issue = ValidationIssue("chart", "astrology_interpretation.vedic.focus_1.point_id")
    assert issue.field == "astrology_interpretation.vedic.focus_1.point_id"
    assert issue.message() == "Vedic astrology didn't match the computed chart."
    assert not issue.relaxable


def test_worst_case_retry_metadata_stays_inside_reserved_request_budget():
    from app.games.tarot.reading import RECOVERY_RESERVE_CHARACTERS
    from app.games.tarot.recovery import ALTERNATIVE_RETRY_MAPPING, RETRY_INSTRUCTION

    request = {"input": "{}", "system_instruction": ""}
    before = len(json.dumps(request, ensure_ascii=False, separators=(",", ":")))
    for field in ["astrology_interpretation.western.focus_1.reflection_question",
                  "astrology_interpretation.western.focus_2.reflection_question"]:
        request = retry_request(request, ValidationIssue("question_form", field))
    request["system_instruction"] += RETRY_INSTRUCTION + ALTERNATIVE_RETRY_MAPPING
    assert len(json.dumps(request, ensure_ascii=False, separators=(",", ":"))) - before < RECOVERY_RESERVE_CHARACTERS


@pytest.mark.parametrize("reason", ["invalid_schema", "invalid_wire_schema"])
def test_unknown_format_failure_does_not_invent_a_missing_field(reason):
    error = ReadingOutputError(reason, retryable=True)
    assert error.issue.check == "invalid_output"
    assert error.issue.field == "reading"
    assert not error.issue.relaxable
    assert reading_failure(error).message == "The reading couldn't be validated."
