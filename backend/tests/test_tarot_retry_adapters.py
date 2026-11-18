"""Only a failed question's grammar can relax; original facts and bounds survive."""

import json
from copy import deepcopy

import pytest
from pydantic import ValidationError
from test_astrology_reading import CARDS
from test_tarot_alternative_providers import canonical as canonical
from test_tarot_fallback import qwen_envelope
from test_tarot_grounded import grounded_envelope

from app.games.tarot import reading
from app.games.tarot.groq_qwen_astrology import (
    build_groq_qwen_astrology_request,
    decode_groq_qwen_astrology_output,
)
from app.games.tarot.grounded import decode_grounded_output
from app.games.tarot.providers import AlternativeOutputError

REFLECTION = "Consider which small possibility could offer a useful place to begin, at your own pace."


def relax(request, field, check="question_form"):
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
    ("reflection_question", "cards.0.interpretation"),
    ("connection_question", "cards.0.characters.0.connection"),
])
def test_grounded_retry_relaxes_only_identified_card_question(canonical, provider, mode, wire_field, field):
    request, chart = canonical(mode)
    body = replace_payload(grounded_envelope(provider, request, chart),
                           lambda payload: payload["card_1"].update({wire_field: REFLECTION}))
    before_request, before_body = deepcopy(request), deepcopy(body)
    with pytest.raises(AlternativeOutputError) as rejected:
        decode_grounded_output(provider, body, request)
    assert rejected.value.reason == "invalid_reflection_question"
    assert rejected.value.issue.check == "question_form"
    assert rejected.value.issue.field == field
    retry = relax(request, field)
    result = validate(decode_grounded_output(provider, body, retry), retry, chart)
    actual = (result.cards[0].interpretation if wire_field == "reflection_question"
              else result.cards[0].characters[0].connection)
    assert actual == REFLECTION
    assert request == before_request and body == before_body
    with pytest.raises(AlternativeOutputError):
        decode_grounded_output(provider, body, request)


@pytest.mark.parametrize("provider", ["groq", "cloudflare"])
@pytest.mark.parametrize("system", ["western", "vedic"])
@pytest.mark.parametrize("focus", ["focus_1", "focus_2"])
def test_grounded_astrology_retry_has_exact_focus_scope(canonical, provider, system, focus):
    request, chart = canonical("both")
    field = f"astrology_interpretation.{system}.{focus}.reflection_question"
    body = replace_payload(grounded_envelope(provider, request, chart), lambda payload:
                           payload["astrology_interpretation"][system][focus].update(reflection_question=REFLECTION))
    with pytest.raises(AlternativeOutputError) as rejected:
        decode_grounded_output(provider, body, request)
    assert rejected.value.issue.field == field
    retry = relax(request, field)
    result = validate(decode_grounded_output(provider, body, retry), retry, chart)
    assert REFLECTION in getattr(result.astrology.interpretation, system).normal
    assert result.astrology.chart == chart


def test_grounded_retry_does_not_relax_another_card(canonical):
    request, chart = canonical()
    def update(payload):
        for card in ("card_1", "card_2"):
            payload[card]["reflection_question"] = REFLECTION
    body = replace_payload(grounded_envelope("groq", request, chart), update)
    with pytest.raises(AlternativeOutputError) as rejected:
        decode_grounded_output("groq", body, relax(request, "cards.0.interpretation"))
    assert rejected.value.issue.check == "question_form"
    assert rejected.value.issue.field == "cards.1.interpretation"


@pytest.mark.parametrize("tamper,check", [
    ("short", "text_length"), ("empty", "text_length"), ("placeholder", "placeholder"),
    ("reference", "reference"), ("focus", "chart"),
    ("missing", "required_fields"), ("extra", "unexpected_fields"),
])
def test_relaxed_question_retains_hard_checks_and_safe_diagnostics(canonical, tamper, check):
    request, chart = canonical("both")
    def update(payload):
        payload["card_1"]["reflection_question"] = REFLECTION
        if tamper == "short":
            payload["card_1"]["reflection_question"] = "Maybe"
        elif tamper == "empty":
            payload["card_1"]["reflection_question"] = "   "
        elif tamper == "placeholder":
            payload["card_1"]["reflection_question"] = "TBD"
        elif tamper == "reference":
            payload["card_1"]["reference_id"] = "PRIVATE INVENTED REFERENCE"
        elif tamper == "focus":
            payload["astrology_interpretation"]["western"]["focus_1"]["point_id"] = "PRIVATE INVALID POINT"
        elif tamper == "missing":
            payload["card_1"].pop("imagery")
        else:
            payload["card_1"]["PRIVATE UNEXPECTED FIELD"] = "PRIVATE REJECTED VALUE"
    body = replace_payload(grounded_envelope("cloudflare", request, chart), update)
    with pytest.raises(AlternativeOutputError) as rejected:
        decode_grounded_output("cloudflare", body, relax(request, "cards.0.interpretation"))
    assert rejected.value.issue.check == check
    assert "PRIVATE" not in repr(rejected.value.issue)
    assert "PRIVATE" not in str(rejected.value)


@pytest.mark.parametrize("wire_field,field", [
    ("reflection_question", "cards.0.interpretation"),
    ("connection", "cards.0.characters.0.connection"),
])
def test_legacy_western_retry_uses_same_field_scoped_policy(canonical, wire_field, field):
    request, chart = canonical("western")
    effective, _wire = build_groq_qwen_astrology_request(request)
    body = replace_payload(qwen_envelope(effective, chart),
                           lambda payload: payload["card_1"].update({wire_field: REFLECTION}))
    with pytest.raises(AlternativeOutputError) as rejected:
        decode_groq_qwen_astrology_output(body, effective)
    assert rejected.value.issue.check == "question_form"
    assert rejected.value.issue.field == field
    retry = relax(effective, field)
    result = validate(decode_groq_qwen_astrology_output(body, retry), retry, chart)
    actual = result.cards[0].interpretation if wire_field == "reflection_question" else result.cards[0].characters[0].connection
    assert actual == REFLECTION and result.astrology.chart == chart


@pytest.mark.parametrize("value", ["", "TBD", "Maybe", "x" * 851])
def test_legacy_western_relaxation_keeps_content_and_domain_bounds(canonical, value):
    request, chart = canonical("western")
    effective, _wire = build_groq_qwen_astrology_request(request)
    body = replace_payload(qwen_envelope(effective, chart),
                           lambda payload: payload["card_1"].update(reflection_question=value))
    retry = relax(effective, "cards.0.interpretation")
    with pytest.raises((AlternativeOutputError, ValidationError)):
        validate(decode_groq_qwen_astrology_output(body, retry), retry, chart)


@pytest.mark.parametrize("check,field", [
    ("text_length", "cards.0.interpretation"),
    ("question_form", "cards.1.interpretation"),
    ("question_form", "cards.*.interpretation"),
    ("PRIVATE UNKNOWN", "cards.0.interpretation"),
])
def test_unknown_or_unrelated_relaxation_never_changes_validation(canonical, check, field):
    request, chart = canonical()
    body = replace_payload(grounded_envelope("groq", request, chart),
                           lambda payload: payload["card_1"].update(reflection_question=REFLECTION))
    with pytest.raises(AlternativeOutputError) as rejected:
        decode_grounded_output("groq", body, relax(request, field, check))
    assert rejected.value.issue.check == "question_form"
    assert rejected.value.issue.field == "cards.0.interpretation"
