"""Correction feedback names the failed field; it never relaxes a check or a fact."""

import json
from copy import deepcopy

import pytest
from test_astrology_reading import CARDS
from test_tarot_alternative_providers import canonical as canonical
from test_tarot_grounded import LONE_QUESTION, grounded_envelope

from app.games.tarot import reading
from app.games.tarot.grounded import decode_grounded_output
from app.games.tarot.providers import AlternativeOutputError
from app.games.tarot.recovery import ValidationIssue, retry_request

ANSWER = ("In this position the card may point to one small possibility within the question, which is "
          "traditionally read as a useful place to begin. That could mean trying it once, at your own pace.")


def forged(request, field, check="answer_form"):
    """A request that claims an old-style relaxation; nothing honours it."""
    retry = deepcopy(request)
    context = json.loads(retry["input"])
    context["validation_relaxations"] = [{"check": check, "field": field}]
    retry["input"] = json.dumps(context)
    return retry


def replace_payload(body, update):
    result = deepcopy(body)
    payload = json.loads(result["choices"][0]["message"]["content"])
    update(payload)
    result["choices"][0]["message"]["content"] = json.dumps(payload)
    return result


def validate(payload, request, chart):
    return reading.validate_reading(
        payload, CARDS, astrology_chart=chart,
        candidates=[c["reference_characters"] for c in json.loads(request["input"])["cards"]],
    )


@pytest.mark.parametrize("provider", ["groq", "cloudflare"])
@pytest.mark.parametrize("mode", ["ordinary", "western", "vedic", "both"])
@pytest.mark.parametrize("wire_field,field", [
    ("reflection", "cards.0.interpretation"),
    ("imagery", "cards.0.quirky_interpretation"),
    ("connection", "cards.0.characters.0.connection"),
])
def test_feedback_names_the_exact_card_field_and_a_corrected_answer_passes(canonical, provider, mode, wire_field, field):
    request, chart = canonical(mode)
    body = replace_payload(grounded_envelope(provider, request, chart),
                           lambda payload: payload["card_1"].update({wire_field: LONE_QUESTION}))
    before_request, before_body = deepcopy(request), deepcopy(body)
    with pytest.raises(AlternativeOutputError) as rejected:
        decode_grounded_output(provider, body, request)
    assert rejected.value.reason == "invalid_answer"
    assert (rejected.value.issue.check, rejected.value.issue.field) == ("answer_form", field)
    # The next attempt carries that feedback and is held to the same contract.
    retry = retry_request(request, rejected.value.issue)
    assert json.loads(retry["input"])["validation_feedback"] == {
        "check": "answer_form", "field": field, "action": "correct_complete_output",
    }
    for source in (retry, forged(request, field), forged(request, field, "question_form")):
        with pytest.raises(AlternativeOutputError) as again:
            decode_grounded_output(provider, body, source)
        assert again.value.issue == ValidationIssue("answer_form", field)
    corrected = replace_payload(body, lambda payload: payload["card_1"].update({wire_field: ANSWER}))
    result = validate(decode_grounded_output(provider, corrected, retry), retry, chart)
    actual = {"reflection": result.cards[0].interpretation, "imagery": result.cards[0].quirky_interpretation,
              "connection": result.cards[0].characters[0].connection}[wire_field]
    assert actual == ANSWER
    assert request == before_request and body == before_body


@pytest.mark.parametrize("provider", ["groq", "cloudflare"])
@pytest.mark.parametrize("system", ["western", "vedic"])
@pytest.mark.parametrize("focus", ["focus_1", "focus_2"])
def test_chart_feedback_has_exact_focus_scope(canonical, provider, system, focus):
    request, chart = canonical("both")
    field = f"astrology_interpretation.{system}.{focus}.reflection"
    body = replace_payload(grounded_envelope(provider, request, chart), lambda payload:
                           payload["astrology_interpretation"][system][focus].update(reflection=LONE_QUESTION))
    with pytest.raises(AlternativeOutputError) as rejected:
        decode_grounded_output(provider, body, request)
    assert (rejected.value.issue.check, rejected.value.issue.field) == ("answer_form", field)
    assert rejected.value.issue.message(retrying=True) == (
        f"{system.capitalize()} astrology asked without saying what it means. Retrying the reading.")
    retry = retry_request(request, rejected.value.issue)
    corrected = replace_payload(body, lambda payload:
                                payload["astrology_interpretation"][system][focus].update(reflection=ANSWER))
    result = validate(decode_grounded_output(provider, corrected, retry), retry, chart)
    assert ANSWER in getattr(result.astrology.interpretation, system).normal
    assert result.astrology.chart == chart


@pytest.mark.parametrize("tamper,check", [
    ("short", "text_length"), ("empty", "text_length"), ("placeholder", "placeholder"),
    ("reference", "reference"), ("focus", "chart"),
    ("missing", "required_fields"), ("extra", "unexpected_fields"),
])
def test_a_retry_retains_hard_checks_and_safe_diagnostics(canonical, tamper, check):
    request, chart = canonical("both")
    def update(payload):
        if tamper == "short":
            payload["card_1"]["reflection"] = "Maybe"
        elif tamper == "empty":
            payload["card_1"]["reflection"] = "   "
        elif tamper == "placeholder":
            payload["card_1"]["reflection"] = "TBD"
        elif tamper == "reference":
            payload["card_1"]["reference_id"] = "PRIVATE INVENTED REFERENCE"
        elif tamper == "focus":
            payload["astrology_interpretation"]["western"]["focus_1"]["point_id"] = "PRIVATE INVALID POINT"
        elif tamper == "missing":
            payload["card_1"].pop("imagery")
        else:
            payload["card_1"]["PRIVATE UNEXPECTED FIELD"] = "PRIVATE REJECTED VALUE"
    body = replace_payload(grounded_envelope("cloudflare", request, chart), update)
    retry = retry_request(request, ValidationIssue("answer_form", "cards.0.interpretation"))
    with pytest.raises(AlternativeOutputError) as rejected:
        decode_grounded_output("cloudflare", body, retry)
    assert rejected.value.issue.check == check
    assert "PRIVATE" not in repr(rejected.value.issue)
    assert "PRIVATE" not in str(rejected.value)
