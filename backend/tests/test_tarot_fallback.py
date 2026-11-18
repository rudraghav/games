"""Failure routing uses only mock transports and synthetic public readings."""

import asyncio
import json

import httpx
import pytest
from test_astrology_reading import CARDS, synthetic_chart
from test_tarot_alternative_providers import envelope, wire_payload
from test_tarot_grounded import grounded_envelope, grounded_json_envelope

from app.games.tarot import reading
from app.games.tarot.characters import find_character
from app.games.tarot.groq_qwen_astrology import PROFILE_VERSION as ASTROLOGY_PROFILE_VERSION
from app.games.tarot.groq_qwen_astrology import build_groq_qwen_astrology_request
from app.games.tarot.grounded import MODELS, OUTPUT_CAP, PROFILE_VERSION, build_grounded_request
from app.games.tarot.grounded_json import INSTRUCT_PROFILE_VERSION, build_grounded_json_request
from app.settings import settings

MODEL = MODELS["groq"]


@pytest.fixture
def configured(monkeypatch):
    config = settings()
    for name, value in {
        "gemini_api_key": "private-gemini-key", "groq_api_key": "private-groq-key",
        "cloudflare_account_id": "a" * 32, "cloudflare_api_token": "private-cloudflare-key",
        "tarot_provider_order": ["gemini", "cloudflare", "groq"],
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
    if not chart:
        return grounded_envelope("groq", canonical)
    if len(chart.charts) > 1 or chart.charts[0].system == "vedic":
        effective, _wire = build_grounded_json_request(canonical, reasoning_effort="none")
        return grounded_json_envelope(effective, chart)
    payload = wire_payload(canonical, chart)
    for index in range(1, 4):
        card = payload[f"card_{index}"]
        card.pop("interpretation")
        card["reflection_question"] = "What small possibility could you explore at your own pace?"
        card["imagery"] = card.pop("quirky_interpretation")
        card["connection"] = "What might this motif invite you to consider at your own pace?"
    for current in chart.charts:
        section = payload["astrology_interpretation"][current.system]
        section["imagery"] = section.pop("quirky")
    result = envelope("groq", payload)
    result["model"] = MODEL
    return result


@pytest.mark.parametrize("mode", ["ordinary", "western", "vedic", "both"])
def test_runtime_groq_matches_evaluated_wire_and_binds_exact_evidence(configured, monkeypatch, ai_caplog, mode):
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
    if mode in {"vedic", "both"}:
        effective, expected = build_grounded_json_request(canonical, reasoning_effort="none")
        profile = INSTRUCT_PROFILE_VERSION
    elif chart:
        effective, expected = build_groq_qwen_astrology_request(canonical)
        profile = ASTROLOGY_PROFILE_VERSION
    else:
        effective, expected = canonical, build_grounded_request("groq", canonical)
        profile = PROFILE_VERSION
    calls = transport(monkeypatch, lambda *_: httpx.Response(200, json=qwen_envelope(effective, chart)))
    with ai_caplog.at_level("INFO", logger="games.ai"):
        result = reading.generate_reading(CARDS, "private-question", astrology_chart=chart)
    assert len(calls) == 1 and json.loads(calls[0].content) == expected
    assert expected["model"] == MODEL and expected["max_completion_tokens"] == OUTPUT_CAP
    assert expected["reasoning_effort"] == ("medium" if mode == "western" else "none")
    assert expected["reasoning_format"] == "hidden"
    assert "include_reasoning" not in expected
    context = json.loads(effective["input"])
    assert all(len(card["reference_characters"]) == (2 if chart else 3) for card in context["cards"])
    for card, supplied in zip(result.cards, context["cards"], strict=True):
        assert card.characters[0].evidence == supplied["reference_characters"][0]["public_context"]
    usage = [json.loads(record.message) for record in ai_caplog.records if record.message.startswith("{")]
    assert len(usage) == 1
    assert usage[0]["model"] == MODEL
    assert usage[0]["profile"] == profile
    assert usage[0]["output_cap"] == OUTPUT_CAP
    assert "private-" not in ai_caplog.text and "PRIVATE" not in ai_caplog.text


def test_legacy_western_fallback_keeps_the_same_chart_and_cf_canonical_shortlist(configured, monkeypatch):
    monkeypatch.setattr(configured, "tarot_provider_order", ["groq", "cloudflare"])
    chart = synthetic_chart("western")
    canonical = reading.build_reading_request(CARDS, "", astrology_chart=chart)
    def respond(request, attempt):
        provider = "groq" if attempt == 1 else "cloudflare"
        expected = build_groq_qwen_astrology_request(canonical)[1] if provider == "groq" else build_grounded_request(provider, canonical)
        assert json.loads(request.content) == expected
        return httpx.Response(503) if attempt == 1 else httpx.Response(
            200, json=grounded_envelope(provider, canonical, chart))
    calls = transport(monkeypatch, respond)
    result = reading.generate_reading(CARDS, "", astrology_chart=chart)
    assert len(result.cards) == 3 and result.astrology.chart == chart
    assert len(calls) == 2


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
    ("reference_id", "invalid_reference_id"), ("evidence", "invalid_wire_schema"),
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
    configured, monkeypatch, ai_caplog, failure,
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
        assert request.url.host == "api.cloudflare.com"
        assert request.headers["authorization"] == "Bearer private-cloudflare-key"
        return httpx.Response(200, json=grounded_envelope("cloudflare", canonical))
    calls = transport(monkeypatch, respond)
    reservations = []
    with ai_caplog.at_level("INFO", logger="games.ai"):
        result = reading.generate_reading(CARDS, "private-question", before_attempt=lambda: reservations.append(True))
    assert [card.card_id for card in result.cards] == CARDS
    assert len(calls) == len(reservations) == 2
    assert "private-" not in ai_caplog.text
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
        body if attempt == 1 else grounded_envelope("cloudflare", canonical)
    )))
    reservations = []
    assert len(reading.generate_reading(CARDS, "", before_attempt=lambda: reservations.append(True)).cards) == 3
    assert len(calls) == len(reservations) == 2
    assert [request.url.host for request in calls] == ["generativelanguage.googleapis.com", "api.cloudflare.com"]


@pytest.mark.parametrize("finish", [None, "unknown_provider_finish"])
@pytest.mark.parametrize("alternate", [False, True])
def test_unknown_alternative_finish_is_rejected_but_not_a_question_block(configured, monkeypatch, finish, alternate):
    monkeypatch.setattr(configured, "tarot_provider_order", ["groq", "cloudflare"] if alternate else ["groq"])
    canonical = reading.build_reading_request(CARDS, "")
    invalid = qwen_envelope(canonical)
    invalid["choices"][0]["finish_reason"] = finish
    calls = transport(monkeypatch, lambda _request, attempt: httpx.Response(200, json=(
        invalid if attempt == 1 else grounded_envelope("cloudflare", canonical)
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
            assert request.extensions["timeout"]["read"] <= 69 - reservation_seconds
            return httpx.Response(503)
        return httpx.Response(200, json=grounded_envelope("cloudflare", canonical))
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


@pytest.mark.parametrize("elapsed,expected", [(80, 2), (90, 2), (98, 1)])
def test_timeout_fallback_shares_deadline_and_has_minimum_useful_time(configured, monkeypatch, elapsed, expected):
    clock = [0.0]
    canonical = reading.build_reading_request(CARDS, "")
    monkeypatch.setattr(reading.time, "monotonic", lambda: clock[0])
    def respond(request, attempt):
        if attempt == 1:
            clock[0] = elapsed
            raise httpx.ReadTimeout("private-error")
        assert request.url.host == "api.groq.com"
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
        "generativelanguage.googleapis.com", "api.cloudflare.com", "api.groq.com",
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


@pytest.mark.parametrize("provider", ["groq", "cloudflare"])
@pytest.mark.parametrize("mode", ["ordinary", "western", "vedic", "both"])
def test_safe_correction_retains_all_context_and_reports_actual_stages(configured, monkeypatch, provider, mode):
    monkeypatch.setattr(configured, "tarot_provider_order", [provider])
    chart = None if mode == "ordinary" else synthetic_chart(mode)
    canonical = reading.build_reading_request(CARDS, "private-question", astrology_chart=chart)
    events = []
    def respond(request, attempt):
        if attempt == 1:
            assert events[-1].stage == "writing" and events[-1].attempt == 1
            return httpx.Response(400, json={"error": {"code": "json_validate_failed", "message": "private-error"}})
        assert events[-1].stage == "writing" and events[-1].attempt == 2
        context = json.loads(json.loads(request.content)["messages"][1]["content"])
        assert context.pop("validation_feedback") == {
            "check": "invalid_output", "field": "reading", "action": "correct_complete_output",
        }
        if provider == "groq" and mode in {"vedic", "both"}:
            original_wire = build_grounded_json_request(canonical, reasoning_effort="none")[1]
        elif provider == "groq" and chart:
            original_wire = build_groq_qwen_astrology_request(canonical)[1]
        else:
            original_wire = build_grounded_request(provider, canonical)
        original = json.loads(original_wire["messages"][1]["content"])
        assert context == original
        return httpx.Response(200, json=(qwen_envelope(canonical, chart) if provider == "groq" and chart
                                        else grounded_envelope(provider, canonical, chart)))
    calls = transport(monkeypatch, respond)
    result = reading.generate_reading(CARDS, "private-question", astrology_chart=chart, on_progress=events.append)
    assert len(result.cards) == 3 and len(calls) == 2
    assert [event.stage for event in events] == ["matching", "writing", "retrying", "writing", "checking"]
    assert all(event.max_attempts == 2 for event in events)
    assert "private" not in repr(events)


def test_three_provider_timeouts_reserve_useful_time_for_every_queued_model(configured, monkeypatch):
    clock = [0.0]
    monkeypatch.setattr(reading.time, "monotonic", lambda: clock[0])
    canonical = reading.build_reading_request(CARDS, "")
    def respond(request, attempt):
        allowed = request.extensions["timeout"]["read"]
        assert allowed == [32, 44, 29][attempt - 1]
        if attempt < 3:
            clock[0] += allowed
            raise httpx.ReadTimeout("private-error")
        return httpx.Response(200, json=qwen_envelope(canonical))
    calls = transport(monkeypatch, respond)
    assert len(reading.generate_reading(CARDS, "").cards) == 3
    assert len(calls) == 3


@pytest.mark.parametrize("overhead_seconds", [1, 2, 3])
@pytest.mark.parametrize("failure", ["timeout", "invalid"])
def test_provider_time_slots_survive_progress_and_reservation_overhead(configured, monkeypatch, overhead_seconds, failure):
    clock = [0.0]
    monkeypatch.setattr(reading.time, "monotonic", lambda: clock[0])
    canonical = reading.build_reading_request(CARDS, "")
    def overhead(*_args):
        clock[0] += overhead_seconds
    def respond(request, attempt):
        seconds = request.extensions["timeout"]["read"]
        if attempt < 3:
            clock[0] += seconds
            if failure == "timeout":
                raise httpx.ReadTimeout("private-error")
            return httpx.Response(200, json={})
        assert request.url.host == "api.groq.com" and seconds >= 15
        assert seconds <= 105 + overhead_seconds - clock[0]
        return httpx.Response(200, json=qwen_envelope(canonical))
    calls = transport(monkeypatch, respond)
    assert len(reading.generate_reading(CARDS, "", before_attempt=overhead, on_progress=overhead).cards) == 3
    assert len(calls) == 3


@pytest.mark.parametrize("mode", ["ordinary", "western", "vedic", "both"])
@pytest.mark.parametrize("failure", ["temporary", "invalid"])
def test_all_modes_reach_groq_last_after_earlier_provider_failures(configured, monkeypatch, mode, failure):
    chart = None if mode == "ordinary" else synthetic_chart(mode)
    canonical = reading.build_reading_request(CARDS, "", astrology_chart=chart)
    assert reading.configured_providers(chart) == ["gemini", "cloudflare", "groq"]
    events, reservations = [], []
    def respond(request, attempt):
        if attempt < 3:
            return httpx.Response(503) if failure == "temporary" else httpx.Response(200, json={})
        assert request.url.host == "api.groq.com"
        wire = json.loads(request.content)
        assert wire["reasoning_effort"] == ("medium" if mode == "western" else "none")
        if mode in {"vedic", "both"}:
            assert wire["response_format"] == {"type": "json_object"}
        return httpx.Response(200, json=qwen_envelope(canonical, chart))
    calls = transport(monkeypatch, respond)
    result = reading.generate_reading(CARDS, "", astrology_chart=chart,
                                      before_attempt=lambda: reservations.append(True), on_progress=events.append)
    assert [card.card_id for card in result.cards] == CARDS
    assert (result.astrology.chart if result.astrology else None) == chart
    assert [call.url.host for call in calls] == [
        "generativelanguage.googleapis.com", "api.cloudflare.com", "api.groq.com",
    ]
    assert len(reservations) == 3
    assert [(event.provider, event.attempt) for event in events if event.stage == "retrying"] == [
        ("cloudflare", 2), ("groq", 3),
    ]


@pytest.mark.parametrize("provider", ["gemini", "cloudflare", "groq"])
@pytest.mark.parametrize("mode", ["ordinary", "western", "vedic", "both"])
def test_policy_refusal_at_any_point_stops_the_remaining_chain(configured, monkeypatch, provider, mode):
    chart = None if mode == "ordinary" else synthetic_chart(mode)
    position = ["gemini", "cloudflare", "groq"].index(provider) + 1
    def respond(_request, attempt):
        if attempt < position:
            return httpx.Response(429)
        return httpx.Response(403, json={"error": {"code": "content_filter", "message": "private-refusal"}})
    calls = transport(monkeypatch, respond)
    with pytest.raises(reading.ReadingOutputError) as error:
        reading.generate_reading(CARDS, "", astrology_chart=chart)
    assert error.value.reason == "refusal" and len(calls) == position


@pytest.mark.parametrize("mode", ["ordinary", "western", "vedic", "both"])
def test_final_groq_attempt_cannot_return_an_unsupplied_reference(configured, monkeypatch, mode):
    chart = None if mode == "ordinary" else synthetic_chart(mode)
    canonical = reading.build_reading_request(CARDS, "", astrology_chart=chart)
    body = qwen_envelope(canonical, chart)
    payload = json.loads(body["choices"][0]["message"]["content"])
    payload["card_1"]["reference_id"] = "unsupplied-reference"
    body["choices"][0]["message"]["content"] = json.dumps(payload)
    calls = transport(monkeypatch, lambda _request, attempt: (
        httpx.Response(503) if attempt < 3 else httpx.Response(200, json=body)
    ))
    with pytest.raises(reading.ReadingOutputError) as error:
        reading.generate_reading(CARDS, "", astrology_chart=chart)
    expected = "invalid_reference_evidence" if mode == "western" else "invalid_reference_id"
    assert error.value.reason == expected and len(calls) == 3
    failure = reading.reading_failure(error.value)
    assert failure.retryable and failure.code == "invalid_output"


def test_no_network_call_after_the_first_reservation_exhausts_deadline(configured, monkeypatch):
    clock = [0.0]
    monkeypatch.setattr(reading.time, "monotonic", lambda: clock[0])
    calls = transport(monkeypatch, lambda *_: pytest.fail("The elapsed deadline forbids transmission"))
    def reserve():
        clock[0] = 106
    with pytest.raises(reading.ReadingOutputError) as error:
        reading.generate_reading(CARDS, "", before_attempt=reserve)
    assert error.value.reason == "deadline_exhausted" and not calls


@pytest.mark.parametrize("provider", ["groq", "cloudflare"])
@pytest.mark.parametrize("mode", ["ordinary", "western", "vedic", "both"])
def test_failed_question_format_retries_without_only_that_field_check(configured, monkeypatch, ai_caplog, provider, mode):
    monkeypatch.setattr(configured, "tarot_provider_order", [provider])
    chart = None if mode == "ordinary" else synthetic_chart(mode)
    canonical = reading.build_reading_request(CARDS, "private-question", astrology_chart=chart)
    body = qwen_envelope(canonical, chart) if provider == "groq" else grounded_envelope(provider, canonical, chart)
    payload = json.loads(body["choices"][0]["message"]["content"])
    reflection = "Consider one small possibility you might explore at your own pace."
    payload["card_2"]["reflection_question"] = reflection
    body["choices"][0]["message"]["content"] = json.dumps(payload)
    events = []
    def respond(request, attempt):
        wire = json.loads(request.content)
        context = json.loads(wire["messages"][1]["content"])
        if attempt == 1:
            assert "validation_feedback" not in context
        else:
            assert context["validation_feedback"] == {
                "check": "question_form", "field": "cards.1.interpretation", "action": "allow_reflective_prose",
            }
            assert context["validation_relaxations"] == [{"check": "question_form", "field": "cards.1.interpretation"}]
            assert "tentative reflective" in wire["messages"][0]["content"]
            assert context["question"] == "private-question"
        return httpx.Response(200, json=body)
    calls = transport(monkeypatch, respond)
    with ai_caplog.at_level("INFO", logger="games.ai"):
        result = reading.generate_reading(CARDS, "private-question", astrology_chart=chart, on_progress=events.append)
    assert len(calls) == 2 and result.cards[1].interpretation == reflection
    assert result.astrology.chart == chart if chart else result.astrology is None
    detail = next(event.retry_detail for event in events if event.stage == "retrying")
    assert detail == "Card 2 wording didn't match the question format. Retrying without that format."
    assert "check=question_form field=cards.1.interpretation relaxable=True" in ai_caplog.text
    assert "private" not in repr(events) + ai_caplog.text and reflection not in ai_caplog.text


@pytest.mark.parametrize("mode", ["ordinary", "western", "vedic", "both"])
def test_failed_format_feedback_and_exact_relaxation_follow_next_provider(configured, monkeypatch, mode):
    monkeypatch.setattr(configured, "tarot_provider_order", ["cloudflare", "groq"])
    chart = None if mode == "ordinary" else synthetic_chart(mode)
    canonical = reading.build_reading_request(CARDS, "", astrology_chart=chart)
    def respond(request, attempt):
        body = (grounded_envelope("cloudflare", canonical, chart) if attempt == 1
                else qwen_envelope(canonical, chart))
        payload = json.loads(body["choices"][0]["message"]["content"])
        payload["card_1"]["reflection_question"] = "Consider a small possibility you might explore at your own pace."
        body["choices"][0]["message"]["content"] = json.dumps(payload)
        if attempt == 2:
            context = json.loads(json.loads(request.content)["messages"][1]["content"])
            assert request.url.host == "api.groq.com"
            assert context["validation_feedback"]["field"] == "cards.0.interpretation"
            assert context["validation_relaxations"] == [{"check": "question_form", "field": "cards.0.interpretation"}]
        return httpx.Response(200, json=body)
    calls = transport(monkeypatch, respond)
    assert reading.generate_reading(CARDS, "", astrology_chart=chart).cards[0].interpretation.startswith("Consider")
    assert len(calls) == 2


def test_factual_failure_is_reported_corrected_and_never_relaxed(configured, monkeypatch):
    monkeypatch.setattr(configured, "tarot_provider_order", ["cloudflare", "groq"])
    canonical = reading.build_reading_request(CARDS, "")
    def respond(request, attempt):
        if attempt == 1:
            body = grounded_envelope("cloudflare", canonical)
            payload = json.loads(body["choices"][0]["message"]["content"])
            payload["card_1"]["reference_id"] = "private-wrong-reference"
            body["choices"][0]["message"]["content"] = json.dumps(payload)
            return httpx.Response(200, json=body)
        context = json.loads(json.loads(request.content)["messages"][1]["content"])
        assert context["validation_feedback"]["check"] == "reference"
        assert context["validation_feedback"]["action"] == "correct_complete_output"
        assert "validation_relaxations" not in context
        assert "private-wrong" not in json.dumps(context)
        return httpx.Response(200, json=qwen_envelope(canonical))
    calls = transport(monkeypatch, respond)
    assert len(reading.generate_reading(CARDS, "").cards) == 3
    assert len(calls) == 2
