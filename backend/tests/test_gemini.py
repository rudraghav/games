import json

import httpx
import pytest
from test_tarot import example_reading

from app.games.tarot.reading import (
    ReadingLimitError,
    ReadingOutputError,
    ReadingView,
    generate_reading,
)
from app.settings import settings


@pytest.fixture(autouse=True)
def transport_reference_candidates(monkeypatch):
    # Transport/retry tests isolate provider behavior with a declared shortlist.
    # Real catalogue breadth and budget are checked in test_tarot_selection.
    from app.games.tarot.characters import find_character
    pairs = [("Chihiro", "Spirited Away"), ("Miles Morales", "Spider-Man: Into the Spider-Verse"),
             ("Leslie Knope", "Parks and Recreation")]
    monkeypatch.setattr("app.games.tarot.reading.reference_candidates",
                        lambda *_args, **_kwargs: [[find_character(*pair)] for pair in pairs])
    monkeypatch.setattr(settings(), "gemini_api_key", "local-test-adapter")
    monkeypatch.setattr(settings(), "tarot_provider_order", ["gemini"])


def test_gemini_request_is_bounded_private_and_schema_checked(monkeypatch):
    cards = ["major-00", "cups-03", "swords-10"]
    real_client = httpx.Client
    captured = []

    def respond(request):
        captured.append(json.loads(request.content))
        assert request.url == "https://generativelanguage.googleapis.com/v1beta/interactions"
        assert "key=" not in str(request.url)
        assert request.headers["x-goog-api-key"] == "test-key"
        return httpx.Response(
            200,
            json={
                "status": "completed",
                "steps": [
                    {
                        "type": "model_output",
                        "content": [{"type": "text", "text": json.dumps(example_reading(cards))}],
                    }
                ],
                "usage": {
                    "total_input_tokens": 500,
                    "total_cached_tokens": 100,
                    "total_output_tokens": 800,
                },
            },
        )

    monkeypatch.setattr(settings(), "gemini_api_key", "test-key")
    monkeypatch.setattr(
        "app.games.tarot.reading.httpx.Client",
        lambda **kwargs: real_client(transport=httpx.MockTransport(respond), **kwargs),
    )
    result = generate_reading(cards, "What deserves my attention?")
    assert result.cards[0].card_id == cards[0]
    payload = captured[0]
    assert payload["store"] is False
    assert payload["generation_config"] == {"thinking_level": "low", "max_output_tokens": 8192}
    assert payload["response_format"]["mime_type"] == "application/json"
    context = json.loads(payload["input"])
    assert context["cards"][0]["card_id"] == cards[0]
    schema = payload["response_format"]["schema"]
    assert schema["properties"]["title"]["description"] == "Use 1–100 characters."
    positions = ["Where you are", "What is shifting", "Your next move"]
    for item, card_id, position in zip(
        schema["properties"]["cards"]["prefixItems"], cards, positions, strict=True
    ):
        assert item["properties"]["card_id"]["enum"] == [card_id]
        assert item["properties"]["position"]["enum"] == [position]
        assert {"quirky_interpretation", "characters"} <= set(item["required"])
        assert "pop_culture" not in item["properties"]
        assert item["properties"]["characters"]["minItems"] == 1
        assert item["properties"]["characters"]["maxItems"] == 2
    assert schema["$defs"]["CharacterConnection"]["properties"]["connection"]["description"] == "Use 30–300 characters."


def test_incomplete_provider_output_is_not_returned_as_a_reading(monkeypatch):
    real_client = httpx.Client
    monkeypatch.setattr(
        "app.games.tarot.reading.httpx.Client",
        lambda **kwargs: real_client(
            transport=httpx.MockTransport(
                lambda request: httpx.Response(200, json={"status": "failed"})
            ),
            **kwargs,
        ),
    )
    with pytest.raises(ReadingOutputError) as error:
        generate_reading(["major-00", "cups-03", "swords-10"], "")
    assert error.value.reason == "not_completed"


def test_usage_counts_thinking_without_logging_provider_content(caplog):
    from app.games.tarot.reading import _log_usage

    with caplog.at_level("INFO", logger="uvicorn.error"):
        _log_usage({"usage": {"total_input_tokens": 1708, "total_output_tokens": 882,
                              "total_thought_tokens": 2702},
                    "steps": [{"signature": "private-thought-signature"}],
                    "output_text": "private-reading-content"}, "test-model", 1)
    receipt = json.loads(caplog.records[-1].message)
    assert receipt["output_tokens"] == 882
    assert receipt["thought_tokens"] == 2702
    assert receipt["generated_tokens"] == 3584
    assert "private-" not in caplog.text


@pytest.mark.parametrize("invalid", [-1, True, "private-provider-content", None, {}])
def test_invalid_usage_is_not_logged(caplog, invalid):
    from app.games.tarot.reading import _log_usage

    with caplog.at_level("INFO", logger="uvicorn.error"):
        _log_usage({"usage": {"total_thought_tokens": invalid}}, "test-model", 1)
    assert not caplog.records


@pytest.mark.parametrize("tier", ["free", "paid"])
def test_reading_view_reports_configured_data_use_tier(monkeypatch, tier):
    monkeypatch.setattr(settings(), "tarot_api_tier", tier)
    assert ReadingView(status="ready").model_dump()["api_tier"] == tier


CARDS = ["major-00", "cups-03", "swords-10"]


def provider_body(payload, *, status="completed"):
    return {
        "status": status,
        "steps": [{"type": "model_output", "content": [{"type": "text", "text": payload}]}],
    }


def mock_provider(monkeypatch, responses):
    real_client = httpx.Client
    calls = []

    def respond(request):
        calls.append(json.loads(request.content))
        response = responses[min(len(calls) - 1, len(responses) - 1)]
        if isinstance(response, Exception):
            raise response
        return response

    monkeypatch.setattr(
        "app.games.tarot.reading.httpx.Client",
        lambda **kwargs: real_client(transport=httpx.MockTransport(respond), **kwargs),
    )
    return calls


@pytest.mark.parametrize("failure", ["json", "too_long", "missing", "wrong_card", "extra", "truncated"])
def test_one_fresh_generation_recovers_invalid_output_without_returning_or_logging_it(
    monkeypatch, caplog, failure
):
    invalid = example_reading(CARDS)
    if failure == "too_long":
        invalid["cards"][1]["pop_culture"] = "private-rejected-content" * 25
    elif failure == "missing":
        del invalid["cards"][0]["interpretation"]
    elif failure == "wrong_card":
        invalid["cards"][0]["card_id"] = "major-21"
    elif failure == "extra":
        invalid["unexpected"] = "private-rejected-content"
    text = "{private-rejected-content" if failure in {"json", "truncated"} else json.dumps(invalid)
    first = provider_body(text, status="incomplete" if failure == "truncated" else "completed")
    calls = mock_provider(monkeypatch, [
        httpx.Response(200, json=first),
        httpx.Response(200, json=provider_body(json.dumps(example_reading(CARDS)))),
    ])
    reservations = []
    result = generate_reading(
        CARDS, "private-test-question", before_attempt=lambda: reservations.append(True)
    )
    assert result.model_dump() == example_reading(CARDS)
    assert len(calls) == len(reservations) == 2
    feedback = json.loads(calls[1]["input"])
    assert feedback["validation_feedback"] in {
        "invalid_schema", "invalid_json", "incorrect_cards", "truncated"
    }
    assert "private-rejected-content" not in calls[1]["input"] + caplog.text
    assert "private-test-question" not in caplog.text


def test_repeated_invalid_output_stops_after_two_attempts(monkeypatch):
    calls = mock_provider(monkeypatch, [
        httpx.Response(200, json=provider_body('{"title":"unfinished')),
    ])
    with pytest.raises(ReadingOutputError) as error:
        generate_reading(CARDS, "")
    assert error.value.reason == "invalid_json"
    assert len(calls) == 2


@pytest.mark.parametrize("body", [
    {"status": "failed", "error": {"code": "safety"}},
    {"status": "cancelled"},
    {"status": "completed", "steps": []},
    {"status": "incomplete", "error": {"code": "safety"}},
    {"status": "completed", "steps": None},
    ["unexpected envelope"],
])
def test_blocked_or_malformed_envelope_does_not_trigger_regeneration(monkeypatch, body):
    calls = mock_provider(monkeypatch, [httpx.Response(200, json=body)])
    with pytest.raises(ReadingOutputError):
        generate_reading(CARDS, "")
    assert len(calls) == 1


@pytest.mark.parametrize("body,reason", [
    ({"status": "failed"}, "not_completed"),
    ({"status": "cancelled"}, "not_completed"),
    ({"status": "incomplete"}, "not_completed"),
    ({"status": "requires_continuation"}, "not_completed"),
    ({"status": "completed", "steps": []}, "empty_output"),
    ({"status": "completed", "error": {"code": "api_error"}}, "not_completed"),
    (provider_body("   "), "empty_output"),
])
def test_generic_service_failure_allows_manual_retry_without_same_provider_repeat(monkeypatch, body, reason):
    from app.games.tarot.reading import reading_failure

    calls = mock_provider(monkeypatch, [httpx.Response(200, json=body)])
    reservations = []
    with pytest.raises(ReadingOutputError) as error:
        generate_reading(CARDS, "", before_attempt=lambda: reservations.append(True))
    assert error.value.reason == reason and not error.value.retryable
    failure = reading_failure(error.value)
    assert failure.code == "invalid_output" and failure.retryable
    assert "question" not in failure.message
    assert len(calls) == len(reservations) == 1


def test_standalone_parser_uses_explicit_policy_codes_not_error_prose():
    from app.games.tarot.reading import _parse_output, reading_failure

    for body in (
        {"status": "failed", "error": {"code": "prohibited_content"}},
        {"status": "completed", "errors": [{"code": "recitation"}]},
    ):
        with pytest.raises(ReadingOutputError) as error:
            _parse_output(body, CARDS)
        assert error.value.reason == "refusal"
        assert reading_failure(error.value).code == "blocked"
    with pytest.raises(ReadingOutputError) as error:
        _parse_output({"status": "failed", "error": {"code": "api_error", "message": "private safety refusal"}}, CARDS)
    assert reading_failure(error.value).code == "invalid_output"


@pytest.mark.parametrize("status", [400, 401, 402, 429, 500, 502])
def test_provider_errors_are_not_retried_or_replaced_with_fake_readings(monkeypatch, status):
    calls = mock_provider(monkeypatch, [httpx.Response(status, json={"error": "unavailable"})])
    with pytest.raises(httpx.HTTPStatusError):
        generate_reading(CARDS, "")
    assert len(calls) == 1


def test_transport_timeout_is_not_automatically_repeated(monkeypatch):
    calls = mock_provider(monkeypatch, [httpx.ReadTimeout("private provider detail")])
    with pytest.raises(httpx.ReadTimeout):
        generate_reading(CARDS, "")
    assert len(calls) == 1


def test_temporary_overload_recovers_once_with_a_new_budget_reservation(monkeypatch):
    calls = mock_provider(monkeypatch, [
        httpx.Response(503, headers={"Retry-After": "2"}),
        httpx.Response(200, json=provider_body(json.dumps(example_reading(CARDS)))),
    ])
    waits, reservations = [], []
    monkeypatch.setattr("app.games.tarot.reading.time.sleep", waits.append)
    result = generate_reading(CARDS, "", before_attempt=lambda: reservations.append(True))
    assert len(result.cards) == 3
    assert len(calls) == len(reservations) == 2
    assert waits == [2]
    assert calls[0] == calls[1]


@pytest.mark.parametrize("retry_after,elapsed,expected_calls", [("2", 0, 2), ("30", 0, 1), ("2", 100, 1)])
def test_overload_recovery_stops_at_attempt_wait_and_deadline_bounds(
    monkeypatch, retry_after, elapsed, expected_calls
):
    clock = [0.0]
    calls = mock_provider(monkeypatch, [httpx.Response(503, headers={"Retry-After": retry_after})])
    monkeypatch.setattr("app.games.tarot.reading.time.monotonic", lambda: clock[0])
    monkeypatch.setattr("app.games.tarot.reading.time.sleep", lambda _delay: None)
    def reserve():
        clock[0] = elapsed
    with pytest.raises(httpx.HTTPStatusError):
        generate_reading(CARDS, "", before_attempt=reserve)
    assert len(calls) == expected_calls


def test_overload_retry_cannot_bypass_daily_budget(monkeypatch):
    calls = mock_provider(monkeypatch, [httpx.Response(503, headers={"Retry-After": "1"})])
    monkeypatch.setattr("app.games.tarot.reading.time.sleep", lambda _delay: None)
    reservations = []
    def reserve():
        reservations.append(True)
        if len(reservations) == 2:
            raise ReadingLimitError("budget exhausted")
    with pytest.raises(ReadingLimitError):
        generate_reading(CARDS, "", before_attempt=reserve)
    assert len(calls) == 1 and len(reservations) == 2


@pytest.mark.parametrize("slow_attempt", [1, 2])
def test_slow_reservation_cannot_transmit_after_deadline(monkeypatch, slow_attempt):
    from app.games.tarot.reading import REQUEST_DEADLINE_SECONDS

    clock, reservations = [0.0], []
    calls = mock_provider(monkeypatch, [httpx.Response(503, headers={"Retry-After": "1"})])
    monkeypatch.setattr("app.games.tarot.reading.time.monotonic", lambda: clock[0])
    monkeypatch.setattr("app.games.tarot.reading.time.sleep", lambda _delay: None)
    def reserve():
        reservations.append(True)
        if len(reservations) == slow_attempt:
            clock[0] = REQUEST_DEADLINE_SECONDS + 1
    with pytest.raises(ReadingOutputError) as error:
        generate_reading(CARDS, "", before_attempt=reserve)
    assert error.value.reason == "deadline_exhausted"
    assert not error.value.retryable
    assert len(reservations) == slow_attempt and len(calls) == slow_attempt - 1


@pytest.mark.parametrize("first_seconds", [40, 106])
def test_slow_read_has_headroom_without_resetting_the_total_retry_deadline(monkeypatch, first_seconds):
    real_client = httpx.Client
    clock = [0.0]
    timeouts = []

    def respond(request):
        timeouts.append(request.extensions["timeout"])
        if len(timeouts) == 1:
            clock[0] = first_seconds
            return httpx.Response(200, json=provider_body("{"))
        return httpx.Response(200, json=provider_body(json.dumps(example_reading(CARDS))))

    monkeypatch.setattr("app.games.tarot.reading.time.monotonic", lambda: clock[0])
    monkeypatch.setattr(
        "app.games.tarot.reading.httpx.Client",
        lambda **kwargs: real_client(transport=httpx.MockTransport(respond), **kwargs),
    )
    if first_seconds > 105:
        with pytest.raises(ReadingOutputError):
            generate_reading(CARDS, "")
        assert len(timeouts) == 1
    else:
        assert len(generate_reading(CARDS, "").cards) == 3
        assert timeouts[1]["read"] == 65
    assert timeouts[0]["read"] == 90
    assert all(timeout["connect"] == 5 for timeout in timeouts)


def test_retry_requires_its_own_budget_reservation_before_transmission(monkeypatch):
    calls = mock_provider(monkeypatch, [httpx.Response(200, json=provider_body("{"))])
    attempts = []

    def reserve():
        attempts.append(True)
        if len(attempts) == 2:
            raise ReadingLimitError("budget exhausted")

    with pytest.raises(ReadingLimitError):
        generate_reading(CARDS, "", before_attempt=reserve)
    assert len(attempts) == 2 and len(calls) == 1


def test_input_budget_rejects_before_provider_or_reservation(monkeypatch):
    calls = mock_provider(monkeypatch, [httpx.Response(200, json={})])
    reservations = []
    with pytest.raises(ValueError, match="request budget"):
        generate_reading(CARDS, "x" * 16000, before_attempt=lambda: reservations.append(True))
    assert not calls and not reservations
