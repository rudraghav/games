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
    assert payload["generation_config"] == {"thinking_level": "low", "max_output_tokens": 2400}
    assert payload["response_format"]["mime_type"] == "application/json"
    assert json.loads(payload["input"])["cards"][0]["card_id"] == cards[0]
    schema = payload["response_format"]["schema"]
    assert schema["properties"]["title"]["description"] == "Use 1–100 characters."
    positions = ["Where you are", "What is shifting", "Your next move"]
    for item, card_id, position in zip(
        schema["properties"]["cards"]["prefixItems"], cards, positions, strict=True
    ):
        assert item["properties"]["card_id"]["enum"] == [card_id]
        assert item["properties"]["position"]["enum"] == [position]


def test_blocked_provider_output_is_not_returned_as_a_reading(monkeypatch):
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


@pytest.mark.parametrize("status", [400, 401, 402, 429, 503])
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
