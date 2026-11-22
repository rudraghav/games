"""Failure diagnostics cannot expose output or disable factual contracts."""

import json

import pytest
from test_astrology_reading import CARDS, PLAIN, interpretation, synthetic_chart
from test_tarot import example_reading

from app.games.tarot.reading import ReadingOutputError, _parse_output, reading_failure
from app.games.tarot.recovery import ValidationIssue, retry_request, says_something


def parse(payload, chart=None):
    return _parse_output({"status": "completed", "steps": [{
        "type": "model_output", "content": [{"type": "text", "text": json.dumps(payload)}],
    }]}, CARDS, chart)


@pytest.mark.parametrize("check,field", [
    ("private-provider-text", "cards.0.secret-personal-field"),
    ("answer_form", "cards.9.interpretation"),
    ("answer_form", "astrology_interpretation.private-data"),
    ("answer_form", "cards.1.pop_culture"),
    ("question_form", "cards.1.interpretation"),
    ("chart", "astrology_interpretation.western.normal"),
    ("reference", "cards.0.characters.0.name"),
])
def test_feedback_names_only_reviewed_checks_and_never_relaxes_one(check, field):
    issue = ValidationIssue(check, field)
    request = retry_request({"input": json.dumps({"question": "private-question"})}, issue)
    context = json.loads(request["input"])
    assert set(context) == {"question", "validation_feedback"}
    assert context["validation_feedback"]["action"] == "correct_complete_output"
    assert "private" not in repr(issue) + str(issue.feedback()) + issue.message(retrying=True)
    assert issue.message(retrying=True).endswith(" Retrying the reading.")


def test_retry_replaces_earlier_feedback_and_never_mutates_the_original_request():
    original = {"input": json.dumps({"cards": [], "question": "private-question"})}
    retry = retry_request(original, ValidationIssue("answer_form", "cards.1.interpretation"))
    assert json.loads(original["input"]) == {"cards": [], "question": "private-question"}
    again = retry_request(retry, ValidationIssue("text_length", "cards.2.pop_culture"))
    assert json.loads(again["input"])["validation_feedback"] == {
        "check": "text_length", "field": "cards.2.pop_culture", "action": "correct_complete_output",
    }
    assert ValidationIssue("answer_form", "cards.1.pop_culture").message() == "Card 2 wording asked without saying what it means."
    assert ValidationIssue("answer_form", "astrology_interpretation.vedic.focus_2.reflection").message() == (
        "Vedic astrology asked without saying what it means."
    )


@pytest.mark.parametrize("text,limit,expected", [
    ("What competing ideas are currently vying for attention in your mind?", 2, False),
    ("How might this land? What would you change? Where would you begin?", 2, False),
    ("A canvas with paintbrushes.", 2, False),
    ("This card may point to a crowded week rather than a lack of interest in the hobby.", 2, True),
    ("This card may point to a crowded week rather than a lack of interest. What could move?", 2, True),
    ("The Sun at 13.32 degrees is traditionally linked with what a person tends towards.", 1, True),
    ("It could mean pausing first. What would help? And who could you ask? Then decide.", 1, False),
    ("It could mean pausing first. What would help? And who could you ask? Then decide.", 2, True),
    ("Elle pourrait indiquer une semaine trop remplie plutôt qu'un manque d'envie.", 2, True),
    ("“It may be less about time than about permission to begin badly.” What then?", 2, True),
])
def test_a_part_must_state_something_and_may_ask_only_a_little(text, limit, expected):
    assert says_something(text, max_questions=limit) is expected


def test_an_image_needs_a_second_sentence_that_says_what_it_means():
    image = "It is like standing on the porch with your bags packed, staring at a subway map for the express train."
    meaning = " For this question, that suggests the choice may need a timetable before it needs a verdict."
    assert says_something(image) and not says_something(image, min_sentences=2)
    assert says_something(image + meaning, min_sentences=2)
    payload = example_reading(CARDS)
    payload["cards"][2]["quirky_interpretation"] = image
    with pytest.raises(ReadingOutputError) as failed:
        parse(payload)
    assert (failed.value.issue.check, failed.value.issue.field) == ("answer_form", "cards.2.quirky_interpretation")
    payload["cards"][2]["quirky_interpretation"] = image + meaning
    assert parse(payload).cards[2].quirky_interpretation.endswith("a verdict.")


@pytest.mark.parametrize("field,value,check", [
    ("introduction", "What could these three cards be inviting you to notice about the week ahead, and about the "
                     "room you are trying to make for something of your own in the middle of it all?", "answer_form"),
    ("next_step", "What is one small step from the question that you could take before the weekend?", "answer_form"),
    ("cards.0.interpretation", "What competing ideas are currently vying for attention in your mind, and which of them "
                               "has been waiting longest for a clear hour of its own in the week that is coming up?",
     "answer_form"),
    ("cards.2.quirky_interpretation", "What would a bird perched on the edge of an open cage notice first about the "
                                      "room beyond it this week?", "answer_form"),
    ("cards.1.characters.0.connection", "How might their willingness to try a new approach mirror the invitation that "
                                        "this card is making to you?", "answer_form"),
    ("cards.1.characters.0.connection", "Their willingness to try a new approach mirrors this card.", "text_length"),
    ("cards.1.interpretation", "Make a little room for an intentional next step.", "text_length"),
])
def test_fresh_text_that_only_asks_or_is_a_one_liner_is_rejected_with_its_own_field(field, value, check):
    payload = example_reading(CARDS)
    parts = field.split(".")
    target = payload
    for part in parts[:-1]:
        target = target[int(part)] if part.isdigit() else target[part]
    target[parts[-1]] = value
    with pytest.raises(ReadingOutputError) as failed:
        parse(payload)
    assert (failed.value.issue.check, failed.value.issue.field) == (check, field)
    assert failed.value.retryable and "?" not in reading_failure(failed.value).message
    # Saved readings keep the wider stored contract and still load.
    from app.games.tarot.reading import Reading

    assert Reading.model_validate(payload)


@pytest.mark.parametrize("field,value,check", [
    ("western.normal", "Why?", "text_length"),
    ("western.quirky", "What would a cosmic potluck with one dish too many be asking you to put down before the "
                       "guests arrive this week?", "answer_form"),
    ("tarot_connection", "How do the supplied chart themes and these three cards speak to each other about the one "
                         "intentional next step that the question is circling around this week?", "answer_form"),
    ("next_step", "Which practical change from the question could you try once this week?", "answer_form"),
])
def test_fresh_chart_text_must_explain_itself_too(field, value, check):
    chart = synthetic_chart("western")
    payload = {**example_reading(CARDS), "astrology_interpretation": interpretation("western", chart)}
    target = payload["astrology_interpretation"]
    parts = field.split(".")
    for part in parts[:-1]:
        target = target[part]
    target[parts[-1]] = value
    with pytest.raises(ReadingOutputError) as failed:
        parse(payload, chart)
    assert (failed.value.issue.check, failed.value.issue.field) == (check, "astrology_interpretation." + field)


def test_chart_text_may_ask_one_question_per_focus_point_after_explaining():
    chart = synthetic_chart("western")
    payload = {**example_reading(CARDS), "astrology_interpretation": interpretation("western", chart)}
    section = payload["astrology_interpretation"]["western"]
    section["normal"] += " What would steadiness look like? And what would the new thing ask of you?"
    assert parse(payload, chart).astrology.interpretation.western.normal.endswith("ask of you?")
    section["normal"] += " Why now?"
    with pytest.raises(ReadingOutputError) as failed:
        parse(payload, chart)
    assert (failed.value.issue.check, failed.value.issue.field) == (
        "answer_form", "astrology_interpretation.western.normal")


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
            "Consider this symbolic invitation without any supplied chart placements." + PLAIN
        )
    with pytest.raises(ReadingOutputError) as failed:
        parse(payload, chart)
    issue = failed.value.issue
    assert (issue.check, issue.field) == (check, field)
    assert "private" not in str(issue.feedback()) + reading_failure(failed.value).message
    assert reading_failure(failed.value).retryable


def test_all_user_diagnostics_fit_persisted_progress_without_raw_output():
    from app.games.tarot.recovery import CHECKS

    for check in CHECKS:
        for field in ["reading", "cards.2.characters.0.connection",
                      "cards.0.pop_culture", "astrology_interpretation.western.focus_1.reflection"]:
            assert len(ValidationIssue(check, field).message(retrying=True)) <= 160


def test_chart_focus_diagnostic_names_the_known_system():
    issue = ValidationIssue("chart", "astrology_interpretation.vedic.focus_1.point_id")
    assert issue.field == "astrology_interpretation.vedic.focus_1.point_id"
    assert issue.message() == "Vedic astrology didn't match the computed chart."


def test_worst_case_retry_metadata_stays_inside_reserved_request_budget():
    from app.games.tarot.reading import RECOVERY_RESERVE_CHARACTERS
    from app.games.tarot.recovery import ALTERNATIVE_RETRY_MAPPING, RETRY_INSTRUCTION

    request = {"input": "{}", "system_instruction": ""}
    before = len(json.dumps(request, ensure_ascii=False, separators=(",", ":")))
    for field in ["astrology_interpretation.western.focus_1.reflection_question",
                  "astrology_interpretation.western.focus_2.reflection_question"]:
        request = retry_request(request, ValidationIssue("reference_evidence", field))
    request["system_instruction"] += RETRY_INSTRUCTION + ALTERNATIVE_RETRY_MAPPING
    assert len(json.dumps(request, ensure_ascii=False, separators=(",", ":"))) - before < RECOVERY_RESERVE_CHARACTERS


@pytest.mark.parametrize("reason", ["invalid_schema", "invalid_wire_schema"])
def test_unknown_format_failure_does_not_invent_a_missing_field(reason):
    error = ReadingOutputError(reason, retryable=True)
    assert error.issue.check == "invalid_output"
    assert error.issue.field == "reading"
    assert reading_failure(error).message == "The reading couldn't be validated."

