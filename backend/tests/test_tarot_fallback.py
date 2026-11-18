"""Failure routing uses only mock transports and synthetic public readings."""

import asyncio
import json

import httpx
import pytest
from test_astrology_reading import CARDS, synthetic_chart
from test_tarot_alternative_providers import envelope, wire_payload

from app.games.tarot import reading
from app.games.tarot.characters import find_character
from app.games.tarot.groq_qwen import MODEL, OUTPUT_CAP
from app.games.tarot.groq_qwen_astrology import PROFILE_VERSION as ASTROLOGY_PROFILE_VERSION
from app.games.tarot.groq_qwen_astrology import build_groq_qwen_astrology_request
from app.games.tarot.groq_qwen_v2 import PROFILE_VERSION, build_groq_qwen_v2_request
from app.games.tarot.providers import build_alternative_request
from app.settings import settings


@pytest.fixture
def configured(monkeypatch):
    config = settings()
    for name, value in {
        "gemini_api_key": "private-gemini-key", "groq_api_key": "private-groq-key",
        "cloudflare_account_id": "a" * 32, "cloudflare_api_token": "private-cloudflare-key",
        "tarot_provider_order": ["gemini", "groq", "cloudflare"],
        "tarot_groq_modes": ["ordinary", "western", "vedic", "both"],
        "tarot_cloudflare_modes": ["ordinary", "western", "vedic", "both"],
    }.items():
        monkeypatch.setattr(config, name, value)
    references = [[find_character(*pair)] for pair in (
        ("Chihiro", "Spirited Away"), ("Miles Morales", "Spider-Man: Into the Spider-Verse"),
        ("Leslie Knope", "Parks and Recreation"),
    )]
    monkeypatch.setattr(reading, "reference_candidates", lambda *_args, **_kwargs: references)
    return config


def transport(monkeypatch, handler):
    real = httpx.Client
    calls = []
    def respond(request):
        calls.append(request)
        return handler(request, len(calls))
    monkeypatch.setattr(reading.httpx, "Client", lambda **kwargs: real(
        transport=httpx.MockTransport(respond), **kwargs,
    ))
    return calls


def qwen_envelope(canonical, chart=None):
    payload = wire_payload(canonical, chart)
    for index in range(1, 4):
        card = payload[f"card_{index}"]
        card.pop("interpretation")
        card["reflection_question"] = "What small possibility could you explore at your own pace?"
        card["imagery"] = card.pop("quirky_interpretation")
        card["connection"] = "What might this motif invite you to consider at your own pace?"
    if chart:
        for current in chart.charts:
            section = payload["astrology_interpretation"][current.system]
            section["imagery"] = section.pop("quirky")
    result = envelope("groq", payload)
    result["model"] = MODEL
    return result


@pytest.mark.parametrize("mode", ["ordinary", "western", "vedic", "both"])
def test_runtime_groq_matches_evaluated_wire_and_binds_exact_evidence(configured, monkeypatch, caplog, mode):
    monkeypatch.setattr(configured, "tarot_provider_order", ["groq"])
    references = [find_character(*pair) for pair in (
        ("Chihiro", "Spirited Away"), ("Miles Morales", "Spider-Man: Into the Spider-Verse"),
        ("Leslie Knope", "Parks and Recreation"),
    )]
    monkeypatch.setattr(reading, "reference_candidates", lambda *_args, **_kwargs: [
        references[index:] + references[:index] for index in range(3)
    ])
    chart = None if mode == "ordinary" else synthetic_chart(mode)
    canonical = reading.build_reading_request(CARDS, "private-question", astrology_chart=chart)
    if chart:
        effective, expected = build_groq_qwen_astrology_request(canonical)
    else:
        effective = canonical
        expected = build_groq_qwen_v2_request(build_alternative_request("groq", canonical))
    calls = transport(monkeypatch, lambda *_: httpx.Response(200, json=qwen_envelope(effective, chart)))
    with caplog.at_level("INFO", logger="uvicorn.error"):
        result = reading.generate_reading(CARDS, "private-question", astrology_chart=chart)
    assert len(calls) == 1 and json.loads(calls[0].content) == expected
    assert expected["model"] == MODEL and expected["max_completion_tokens"] == OUTPUT_CAP
    assert expected["reasoning_effort"] == ("medium" if chart else "none")
    assert expected["reasoning_format"] == "hidden"
    assert "include_reasoning" not in expected
    context = json.loads(effective["input"])
    assert all(len(card["reference_characters"]) == (2 if chart else 3) for card in context["cards"])
    for card, supplied in zip(result.cards, context["cards"], strict=True):
        assert card.characters[0].evidence == supplied["reference_characters"][0]["public_context"]
    usage = [json.loads(record.message) for record in caplog.records if record.message.startswith("{")]
    assert len(usage) == 1
    assert usage[0]["model"] == MODEL
    assert usage[0]["profile"] == (ASTROLOGY_PROFILE_VERSION if chart else PROFILE_VERSION)
    assert usage[0]["output_cap"] == OUTPUT_CAP
    assert "private-" not in caplog.text and "PRIVATE" not in caplog.text


def test_astro_effective_shortlist_is_used_for_domain_validation_and_later_provider(configured, monkeypatch):
    monkeypatch.setattr(configured, "tarot_provider_order", ["groq", "cloudflare"])
    references = [find_character(*pair) for pair in (
        ("Chihiro", "Spirited Away"), ("Miles Morales", "Spider-Man: Into the Spider-Verse"),
        ("Leslie Knope", "Parks and Recreation"),
    )]
    monkeypatch.setattr(reading, "reference_candidates", lambda *_args, **_kwargs: [
        references[index:] + references[:index] for index in range(3)
    ])
    chart = synthetic_chart("both")
    canonical = reading.build_reading_request(CARDS, "", astrology_chart=chart)
    effective, _ = build_groq_qwen_astrology_request(canonical)
    validated_candidates = []
    validate = reading.validate_reading
    def record_validation(*args, **kwargs):
        validated_candidates.append(kwargs["candidates"])
        return validate(*args, **kwargs)
    monkeypatch.setattr(reading, "validate_reading", record_validation)
    responses = [qwen_envelope(effective, chart), envelope("cloudflare", wire_payload(canonical, chart))]
    def respond(request, attempt):
        if attempt == 1:
            return httpx.Response(503)
        assert json.loads(request.content) == build_alternative_request("cloudflare", canonical)
        return httpx.Response(200, json=responses[1])
    calls = transport(monkeypatch, respond)
    assert len(reading.generate_reading(CARDS, "", astrology_chart=chart).cards) == 3
    assert len(calls) == 2
    assert all(len(row) == 3 for row in validated_candidates[0])
    validated_candidates.clear()
    effective_candidates = [card["reference_characters"] for card in json.loads(effective["input"])["cards"]]
    reading._alternative_reading("groq", responses[0], effective, CARDS, chart, effective_candidates)
    assert validated_candidates == [effective_candidates]
    with pytest.raises(reading.ReadingOutputError) as error:
        reading._alternative_reading("groq", responses[0], canonical, CARDS, chart, effective_candidates)
    assert error.value.reason == "invalid_astrology_effective_shortlist"


@pytest.mark.parametrize("refusal", ["message", "content_filter"])
def test_qwen_refusal_stops_without_fallback(configured, monkeypatch, refusal):
    monkeypatch.setattr(configured, "tarot_provider_order", ["groq", "cloudflare"])
    canonical = reading.build_reading_request(CARDS, "")
    body = qwen_envelope(canonical)
    if refusal == "message":
        body["choices"][0]["message"]["refusal"] = "PRIVATE refusal"
    else:
        body["choices"][0]["finish_reason"] = "content_filter"
    calls = transport(monkeypatch, lambda *_: httpx.Response(200, json=body))
    with pytest.raises(reading.ReadingOutputError) as error:
        reading.generate_reading(CARDS, "")
    assert error.value.reason == "refusal" and len(calls) == 1


@pytest.mark.parametrize("tamper,reason", [
    ("reference_id", "invalid_reference_evidence"), ("evidence", "invalid_wire_schema"),
    ("model", "unexpected_model"),
])
def test_runtime_qwen_rejects_unbound_reference_or_model_evidence(configured, tamper, reason):
    canonical = reading.build_reading_request(CARDS, "")
    body = qwen_envelope(canonical)
    if tamper == "model":
        body["model"] = "openai/gpt-oss-120b"
    else:
        payload = json.loads(body["choices"][0]["message"]["content"])
        payload["card_1"][tamper] = (payload["card_2"]["reference_id"]
                                     if tamper == "reference_id" else "Invented provider evidence")
        body["choices"][0]["message"]["content"] = json.dumps(payload)
    candidates = [card["reference_characters"] for card in json.loads(canonical["input"])["cards"]]
    with pytest.raises(reading.ReadingOutputError) as error:
        reading._alternative_reading("groq", body, canonical, CARDS, None, candidates)
    assert error.value.reason == reason


@pytest.mark.parametrize("failure", [400, 401, 403, 429, 500, 502, 503, "timeout", "invalid"])
def test_eligible_failure_uses_alternate_once_with_same_cards_and_new_reservation(
    configured, monkeypatch, caplog, failure,
):
    canonical = reading.build_reading_request(CARDS, "private-question")
    def respond(request, attempt):
        if attempt == 1:
            if failure == "timeout":
                raise httpx.ReadTimeout("private-error")
            if failure == "invalid":
                return httpx.Response(200, json={"status": "completed", "steps": [{
                    "type": "model_output", "content": [{"type": "text", "text": "{private-rejected"}],
                }]})
            return httpx.Response(failure, json={"error": "private-error"})
        assert request.url.host == "api.groq.com"
        assert request.headers["authorization"] == "Bearer private-groq-key"
        return httpx.Response(200, json=qwen_envelope(canonical))
    calls = transport(monkeypatch, respond)
    reservations = []
    with caplog.at_level("INFO", logger="uvicorn.error"):
        result = reading.generate_reading(CARDS, "private-question", before_attempt=lambda: reservations.append(True))
    assert [card.card_id for card in result.cards] == CARDS
    assert len(calls) == len(reservations) == 2
    assert "private-" not in caplog.text
    assert "private-rejected" not in calls[1].content.decode()


def test_refusal_never_seeks_another_provider(configured, monkeypatch):
    calls = transport(monkeypatch, lambda *_: httpx.Response(200, json={
        "status": "failed", "error": {"code": "safety"},
    }))
    with pytest.raises(reading.ReadingOutputError):
        reading.generate_reading(CARDS, "")
    assert len(calls) == 1


@pytest.mark.parametrize("status", [200, 400, 403])
@pytest.mark.parametrize("code", [
    "safety", "recitation", "language", "prohibited_content", "spii", "blocklist",
    "image_safety", "image_prohibited_content", "image_recitation", "image_other", "content_blocked",
    "content_filter", "content_policy_violation", "ResponsibleAIPolicyViolation",
])
def test_http_policy_refusal_never_falls_back(configured, monkeypatch, status, code):
    calls = transport(monkeypatch, lambda *_: httpx.Response(status, json={
        "error": {"code": code, "message": "private-error"},
    }))
    reservations = []
    with pytest.raises(reading.ReadingOutputError) as error:
        reading.generate_reading(CARDS, "", before_attempt=lambda: reservations.append(True))
    assert error.value.reason == "refusal"
    assert not reading.reading_failure(error.value).retryable
    assert len(calls) == len(reservations) == 1


@pytest.mark.parametrize("body", [
    {"status": "failed"}, {"status": "cancelled"}, {"status": "incomplete"},
    {"status": "completed", "steps": []},
    {"status": "failed", "error": {"code": "api_error", "message": "private safety text"}},
    {"status": "failed", "error": {"code": "image_network_failure"}},
])
def test_generic_terminal_or_empty_response_uses_approved_alternate(configured, monkeypatch, body):
    canonical = reading.build_reading_request(CARDS, "")
    calls = transport(monkeypatch, lambda _request, attempt: httpx.Response(200, json=(
        body if attempt == 1 else qwen_envelope(canonical)
    )))
    reservations = []
    assert len(reading.generate_reading(CARDS, "", before_attempt=lambda: reservations.append(True)).cards) == 3
    assert len(calls) == len(reservations) == 2
    assert [request.url.host for request in calls] == ["generativelanguage.googleapis.com", "api.groq.com"]


@pytest.mark.parametrize("finish", [None, "unknown_provider_finish"])
@pytest.mark.parametrize("alternate", [False, True])
def test_unknown_alternative_finish_is_rejected_but_not_a_question_block(configured, monkeypatch, finish, alternate):
    monkeypatch.setattr(configured, "tarot_provider_order", ["groq", "cloudflare"] if alternate else ["groq"])
    canonical = reading.build_reading_request(CARDS, "")
    invalid = qwen_envelope(canonical)
    invalid["choices"][0]["finish_reason"] = finish
    calls = transport(monkeypatch, lambda _request, attempt: httpx.Response(200, json=(
        invalid if attempt == 1 else envelope("cloudflare", wire_payload(canonical, None))
    )))
    if alternate:
        assert len(reading.generate_reading(CARDS, "").cards) == 3
        assert len(calls) == 2
    else:
        with pytest.raises(reading.ReadingOutputError) as error:
            reading.generate_reading(CARDS, "")
        assert error.value.reason == "not_completed" and not error.value.retryable
        failure = reading.reading_failure(error.value)
        assert failure.code == "invalid_output" and failure.retryable
        assert len(calls) == 1


def test_empty_alternative_response_does_not_repeat_same_provider(configured, monkeypatch):
    monkeypatch.setattr(configured, "tarot_provider_order", ["groq"])
    calls = transport(monkeypatch, lambda *_: httpx.Response(200, json={
        "model": MODEL, "choices": [{"finish_reason": "stop", "message": {"content": ""}}],
    }))
    with pytest.raises(reading.ReadingOutputError) as error:
        reading.generate_reading(CARDS, "")
    assert not error.value.retryable
    assert reading.reading_failure(error.value).retryable
    assert len(calls) == 1


def test_actual_caller_cancellation_escapes_without_another_reservation(configured, monkeypatch):
    def cancel(_request, _attempt):
        raise asyncio.CancelledError()
    calls = transport(monkeypatch, cancel)
    reservations = []
    with pytest.raises(asyncio.CancelledError):
        reading.generate_reading(CARDS, "", before_attempt=lambda: reservations.append(True))
    assert len(calls) == len(reservations) == 1


@pytest.mark.parametrize("reservation_seconds", [0, 10])
def test_cloudflare_fallback_retains_useful_time(configured, monkeypatch, reservation_seconds):
    monkeypatch.setattr(configured, "tarot_provider_order", ["gemini", "cloudflare"])
    canonical = reading.build_reading_request(CARDS, "")
    clock = [0.0]
    monkeypatch.setattr(reading.time, "monotonic", lambda: clock[0])
    def respond(request, attempt):
        if attempt == 1:
            assert request.extensions["timeout"]["read"] <= 80 - reservation_seconds
            return httpx.Response(503)
        return httpx.Response(200, json=envelope("cloudflare", wire_payload(canonical, None)))
    calls = transport(monkeypatch, respond)
    def reserve():
        clock[0] += reservation_seconds
    assert len(reading.generate_reading(CARDS, "", before_attempt=reserve).cards) == 3
    assert len(calls) == 2


def test_provider_structured_retry_delay_survives_without_prose():
    response = httpx.Response(429, json={"error": {"message": "private-error", "details": [{
        "@type": "type.googleapis.com/google.rpc.RetryInfo", "retryDelay": "7973.4s",
    }]}})
    assert reading._retry_delay(response) == 7973.4


def test_provider_json_rejection_is_retryable_output_not_configuration(configured, monkeypatch):
    monkeypatch.setattr(configured, "tarot_provider_order", ["groq"])
    calls = transport(monkeypatch, lambda *_: httpx.Response(400, json={
        "error": {"code": "json_validate_failed", "message": "private-error"},
    }))
    with pytest.raises(reading.ReadingOutputError) as error:
        reading.generate_reading(CARDS, "")
    assert len(calls) == 2
    assert reading.reading_failure(error.value).code == "invalid_output"
    assert reading.reading_failure(error.value).retryable


def test_fallback_cannot_bypass_application_budget(configured, monkeypatch):
    calls = transport(monkeypatch, lambda *_: httpx.Response(429))
    reservations = []
    def reserve():
        reservations.append(True)
        if len(reservations) == 2:
            raise reading.ReadingLimitError("test-budget")
    with pytest.raises(reading.ReadingLimitError):
        reading.generate_reading(CARDS, "", before_attempt=reserve)
    assert len(calls) == 1 and len(reservations) == 2


@pytest.mark.parametrize("elapsed,expected", [(90, 2), (98, 1)])
def test_timeout_fallback_shares_deadline_and_has_minimum_useful_time(configured, monkeypatch, elapsed, expected):
    clock = [0.0]
    canonical = reading.build_reading_request(CARDS, "")
    monkeypatch.setattr(reading.time, "monotonic", lambda: clock[0])
    def respond(request, attempt):
        if attempt == 1:
            clock[0] = elapsed
            raise httpx.ReadTimeout("private-error")
        assert request.extensions["timeout"]["read"] == 105 - elapsed
        return httpx.Response(200, json=qwen_envelope(canonical))
    calls = transport(monkeypatch, respond)
    if expected == 1:
        with pytest.raises(httpx.ReadTimeout):
            reading.generate_reading(CARDS, "")
    else:
        assert len(reading.generate_reading(CARDS, "").cards) == 3
    assert len(calls) == expected


def test_three_provider_chain_is_bounded_and_does_not_repeat_quota(configured, monkeypatch):
    calls = transport(monkeypatch, lambda *_: httpx.Response(429))
    with pytest.raises(httpx.HTTPStatusError):
        reading.generate_reading(CARDS, "")
    assert [call.url.host for call in calls] == [
        "generativelanguage.googleapis.com", "api.groq.com", "api.cloudflare.com",
    ]


def test_only_configured_and_accepted_modes_receive_a_request(configured, monkeypatch):
    monkeypatch.setattr(configured, "tarot_provider_order", ["groq", "cloudflare", "gemini"])
    monkeypatch.setattr(configured, "tarot_groq_modes", ["ordinary"])
    monkeypatch.setattr(configured, "cloudflare_api_token", "")
    assert reading.configured_providers(synthetic_chart("both")) == ["gemini"]
    assert reading.provider_names() == ["Groq", "Google Gemini"]
    monkeypatch.setattr(configured, "gemini_api_key", "")
    calls = transport(monkeypatch, lambda *_: pytest.fail("No provider may receive this chart"))
    with pytest.raises(reading.ReadingGenerationError) as error:
        reading.generate_reading(CARDS, "", astrology_chart=synthetic_chart("both"))
    assert error.value.failure.code == "unavailable" and not calls


def test_no_request_after_slow_fallback_reservation(configured, monkeypatch):
    clock, reservations = [0.0], []
    monkeypatch.setattr(reading.time, "monotonic", lambda: clock[0])
    calls = transport(monkeypatch, lambda *_: httpx.Response(503))
    def reserve():
        reservations.append(True)
        if len(reservations) == 2:
            clock[0] = 106
    with pytest.raises(reading.ReadingOutputError) as error:
        reading.generate_reading(CARDS, "", before_attempt=reserve)
    assert error.value.reason == "deadline_exhausted"
    assert len(calls) == 1


@pytest.mark.parametrize("status,code,retryable", [(401, "unavailable", False), (429, "rate_limited", True), (503, "temporary", True)])
def test_safe_failure_policy_ignores_provider_prose(status, code, retryable):
    error = httpx.HTTPStatusError("private-error", request=httpx.Request("POST", "https://example.invalid"),
                                  response=httpx.Response(status, headers={"Retry-After": "120"}))
    result = reading.reading_failure(error)
    assert (result.code, result.retryable) == (code, retryable)
    assert "private" not in json.dumps(result.model_dump())
    if status == 429:
        assert 119 <= result.retry_at - reading.time.time() <= 120
