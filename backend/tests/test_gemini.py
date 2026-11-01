import json

import httpx
import pytest
from test_tarot import example_reading

from app.games.tarot.reading import ReadingView, generate_reading
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
    with pytest.raises(ValueError, match="not completed"):
        generate_reading(["major-00", "cups-03", "swords-10"], "")


@pytest.mark.parametrize("tier", ["free", "paid"])
def test_reading_view_reports_configured_data_use_tier(monkeypatch, tier):
    monkeypatch.setattr(settings(), "tarot_api_tier", tier)
    assert ReadingView(status="ready").model_dump()["api_tier"] == tier
