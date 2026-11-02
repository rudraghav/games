import json
import logging
from datetime import UTC, datetime

import httpx
import pytest
from pydantic import ValidationError
from test_tarot import example_reading

from app.astrology.chart import chart_at
from app.games.tarot.reading import (
    Reading,
    ReadingInput,
    ReadingOutputError,
    generate_reading,
    provider_schema,
    validate_reading,
)

CARDS = ["major-00", "cups-03", "swords-10"]


def synthetic_chart(system="both"):
    return chart_at(datetime(2000, 1, 1, 12, tzinfo=UTC), 51.4779, 0, system).chart


def interpretation(system="both", chart=None):
    chart = chart or synthetic_chart(system)
    sections = {}
    for current in chart.charts:
        points = current.placements[:2]
        sections[current.system] = {
            "focus_points": [p.id for p in points],
            "normal": "; ".join(f"{p.name} in {p.sign}, house {p.house}" for p in points)
            + ". Use these contrasting themes to choose one practical priority.",
            "quirky": "Your inner committee is hosting a cosmic potluck: choose one dish before rearranging the buffet.",
        }
    return {**sections,
            "tarot_connection": "The supplied chart themes and these cards both invite one intentional next step.",
            "next_step": "Pick one practical change to try this week."}


def provider_response(payload):
    return httpx.Response(200, json={"status": "completed", "steps": [{
        "type": "model_output", "content": [{"type": "text", "text": json.dumps(payload)}]
    }]})


@pytest.mark.parametrize("system", ["western", "vedic", "both"])
def test_combined_reading_is_one_bounded_request_with_only_computed_placements(monkeypatch, caplog, system):
    chart = synthetic_chart(system)
    captured, reservations = [], []
    real_client = httpx.Client

    def respond(request):
        body = json.loads(request.content)
        captured.append(body)
        return provider_response({**example_reading(CARDS), "astrology_interpretation": interpretation(system)})

    monkeypatch.setattr("app.games.tarot.reading.httpx.Client",
                        lambda **kwargs: real_client(transport=httpx.MockTransport(respond), **kwargs))
    with caplog.at_level(logging.INFO):
        result = generate_reading(CARDS, "x" * 400, astrology_chart=chart,
                                  before_attempt=lambda: reservations.append(True))
    assert len(captured) == len(reservations) == 1
    assert result.astrology.chart == chart
    body = captured[0]
    assert body["store"] is False and body["generation_config"]["max_output_tokens"] == 3600
    assert len(body["input"]) + len(body["system_instruction"]) + len(json.dumps(body["response_format"]["schema"])) <= 16000
    context = json.loads(body["input"])
    assert {c["system"] for c in context["astrology"]} == {c.system for c in chart.charts}
    serialized = json.dumps(context)
    for forbidden in ["birth_date", "birth_time", "place_id", "latitude", "longitude", "timezone",
                      "utc_offset", "time_resolution",
                      "2000-01-01", "12:00", "Greenwich", "London"]:
        assert forbidden not in serialized
        assert forbidden not in caplog.text
    assert "astrology_interpretation" in body["response_format"]["schema"]["required"]
    assert "astrology" not in body["response_format"]["schema"]["properties"]


def test_opt_out_and_legacy_readings_omit_astrology_everywhere(monkeypatch):
    captured = []
    real_client = httpx.Client

    def respond(request):
        captured.append(json.loads(request.content))
        return provider_response(example_reading(CARDS))

    monkeypatch.setattr("app.games.tarot.reading.httpx.Client",
                        lambda **kwargs: real_client(transport=httpx.MockTransport(respond), **kwargs))
    result = generate_reading(CARDS, "")
    assert result.model_dump() == example_reading(CARDS)
    assert "astrology" not in result.model_dump()
    assert "astrology" not in json.loads(captured[0]["input"])
    assert "astrology_interpretation" not in provider_schema(CARDS)["properties"]
    assert "astrology" not in Reading.model_validate(example_reading(CARDS)).model_dump()
    assert ReadingInput(match_id="x" * 36).reuse_saved_astrology is None


def test_model_may_interpret_only_requested_systems_and_cannot_supply_chart_positions():
    payload = {**example_reading(CARDS), "astrology_interpretation": interpretation()}
    with pytest.raises(ValueError):
        validate_reading(payload, CARDS, astrology_chart=synthetic_chart("western"))
    with pytest.raises(ValidationError):
        validate_reading({**payload, "chart": {"sun": "Invented"}}, CARDS, astrology_chart=synthetic_chart())
    with pytest.raises(ValidationError):
        validate_reading(payload, CARDS)
    payload["astrology_interpretation"]["western"]["normal"] = "tiny"
    with pytest.raises(ValidationError):
        validate_reading(payload, CARDS, astrology_chart=synthetic_chart())


def test_invalid_astrology_output_has_no_second_call_or_fake_fallback(monkeypatch):
    captured = []
    real_client = httpx.Client

    def respond(request):
        captured.append(True)
        return provider_response(example_reading(CARDS))

    monkeypatch.setattr("app.games.tarot.reading.httpx.Client",
                        lambda **kwargs: real_client(transport=httpx.MockTransport(respond), **kwargs))
    with pytest.raises(ReadingOutputError):
        generate_reading(CARDS, "", astrology_chart=synthetic_chart())
    assert len(captured) == 1


@pytest.mark.parametrize("failure", ["generic", "unknown", "duplicate", "swapped"])
def test_astrology_focus_points_are_grounded_in_each_exact_computed_chart(failure):
    chart = synthetic_chart()
    payload = {**example_reading(CARDS), "astrology_interpretation": interpretation()}
    section = payload["astrology_interpretation"]["western"]
    if failure == "generic":
        section["normal"] = "Tropical influences encourage a rich and meaningful balance of inner and outer priorities."
    elif failure == "unknown":
        section["focus_points"] = ["sun", "invented_body"]
    elif failure == "duplicate":
        section["focus_points"] = ["sun", "sun"]
    else:
        sun, moon = chart.charts[0].placements[:2]
        section["normal"] = f"Sun in {moon.sign}, house {moon.house}; Moon in {sun.sign}, house {sun.house}. These are reflective metaphors."
    with pytest.raises(ValueError):
        validate_reading(payload, CARDS, astrology_chart=chart)
