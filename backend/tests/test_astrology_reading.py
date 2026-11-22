import json
import logging
from datetime import UTC, datetime

import httpx
import pytest
from pydantic import ValidationError
from test_tarot import example_reading, stored_reading

from app.astrology.chart import chart_at
from app.games.tarot.reading import (
    Reading,
    ReadingInput,
    ReadingOutputError,
    generate_reading,
    provider_schema,
    validate_reading,
)
from app.settings import settings

CARDS = ["major-00", "cups-03", "swords-10"]


@pytest.fixture(autouse=True)
def transport_reference_candidates(monkeypatch):
    # Transport/retry tests isolate provider behavior with a declared shortlist.
    # Real catalogue breadth and budget are checked in test_tarot_selection.
    from app.games.tarot.characters import find_character
    pairs = [("Chihiro", "Spirited Away"), ("Miles Morales", "Spider-Man: Into the Spider-Verse"),
             ("Leslie Knope", "Parks and Recreation")]
    monkeypatch.setattr("app.games.tarot.reading.reference_candidates",
                        lambda *_args, **_kwargs: [[find_character(*pair)] for pair in pairs])
    # These cases exercise Gemini's own schema and single-provider correction.
    # Cross-provider routing is covered separately, independent of local keys.
    monkeypatch.setattr(settings(), "gemini_api_key", "local-test-adapter")
    monkeypatch.setattr(settings(), "tarot_provider_order", ["gemini"])


def synthetic_chart(system="both"):
    return chart_at(datetime(2000, 1, 1, 12, tzinfo=UTC), 51.4779, 0, system).chart


# Plain-words padding with no body, sign or house: fresh chart text must explain itself.
PLAIN = (" In plain words, the first is traditionally linked with what a person tends towards and the second with"
         " how that is carried into daily life. For this question, that could mean weighing a steady routine"
         " against a wish for something new, and choosing one of them to try first.")


def interpretation(system="both", chart=None):
    chart = chart or synthetic_chart(system)
    sections = {}
    for current in chart.charts:
        points = current.placements[:2]
        sections[current.system] = {
            "focus_points": [p.id for p in points],
            "normal": "; ".join(f"{p.name} in {p.sign}, house {p.house}" for p in points)
            + ". Use these contrasting themes to choose one practical priority." + PLAIN,
            "quirky": ("Your inner committee is hosting a cosmic potluck: choose one dish before rearranging the buffet. "
                       "It suggests the question may need one choice, not a full menu."),
        }
    return {**sections,
            "tarot_connection": ("The supplied chart themes reinforce what the three cards said: both point to one "
                                 "intentional next step, and the chart tempers the first card's hurry."),
            "next_step": "Pick one practical change from the question and try it once this week."}


def provider_response(payload):
    return httpx.Response(200, json={"status": "completed", "steps": [{
        "type": "model_output", "content": [{"type": "text", "text": json.dumps(payload)}]
    }]})


@pytest.mark.parametrize("system", ["western", "vedic", "both"])
def test_combined_reading_is_one_bounded_request_with_only_computed_placements(monkeypatch, ai_caplog, system):
    chart = synthetic_chart(system)
    captured, reservations = [], []
    real_client = httpx.Client

    def respond(request):
        body = json.loads(request.content)
        captured.append(body)
        return provider_response({**example_reading(CARDS), "astrology_interpretation": interpretation(system)})

    monkeypatch.setattr("app.games.tarot.reading.httpx.Client",
                        lambda **kwargs: real_client(transport=httpx.MockTransport(respond), **kwargs))
    with ai_caplog.at_level(logging.INFO):
        result = generate_reading(CARDS, "x" * 400, astrology_chart=chart,
                                  before_attempt=lambda: reservations.append(True))
    assert len(captured) == len(reservations) == 1
    assert result.astrology.chart == chart
    body = captured[0]
    assert body["store"] is False and body["generation_config"]["max_output_tokens"] == 8192
    assert len(body["input"]) + len(body["system_instruction"]) + len(json.dumps(body["response_format"]["schema"])) <= 16000
    context = json.loads(body["input"])
    assert {c["system"] for c in context["astrology"]} == {c.system for c in chart.charts}
    serialized = json.dumps(context)
    for forbidden in ["birth_date", "birth_time", "place_id", "latitude", "longitude", "timezone",
                      "utc_offset", "time_resolution",
                      "2000-01-01", "12:00", "Greenwich", "London"]:
        assert forbidden not in serialized
        assert forbidden not in ai_caplog.text
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
    assert result.model_dump() == stored_reading(CARDS)
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


def test_invalid_astrology_output_has_one_bounded_correction_and_no_fake_fallback(monkeypatch):
    captured = []
    real_client = httpx.Client

    def respond(request):
        captured.append(True)
        return provider_response(example_reading(CARDS))

    monkeypatch.setattr("app.games.tarot.reading.httpx.Client",
                        lambda **kwargs: real_client(transport=httpx.MockTransport(respond), **kwargs))
    with pytest.raises(ReadingOutputError):
        generate_reading(CARDS, "", astrology_chart=synthetic_chart())
    assert len(captured) == 2


def test_astrology_recovers_once_only_from_definite_overload(monkeypatch):
    captured, waits = [], []
    real_client = httpx.Client
    def respond(request):
        captured.append(json.loads(request.content))
        if len(captured) == 1:
            return httpx.Response(503, headers={"Retry-After": "1"})
        return provider_response({**example_reading(CARDS), "astrology_interpretation": interpretation()})
    monkeypatch.setattr("app.games.tarot.reading.httpx.Client",
                        lambda **kwargs: real_client(transport=httpx.MockTransport(respond), **kwargs))
    monkeypatch.setattr("app.games.tarot.reading.time.sleep", waits.append)
    result = generate_reading(CARDS, "", astrology_chart=synthetic_chart())
    assert result.astrology is not None
    assert len(captured) == 2 and captured[0] == captured[1]
    assert waits == [1]


@pytest.mark.parametrize("failure", ["generic", "unknown", "duplicate", "swapped"])
def test_astrology_focus_points_are_grounded_in_each_exact_computed_chart(failure):
    chart = synthetic_chart()
    payload = {**example_reading(CARDS), "astrology_interpretation": interpretation()}
    section = payload["astrology_interpretation"]["western"]
    if failure == "generic":
        section["normal"] = "Tropical influences encourage a rich and meaningful balance of inner and outer priorities." + PLAIN
    elif failure == "unknown":
        section["focus_points"] = ["sun", "invented_body"]
    elif failure == "duplicate":
        section["focus_points"] = ["sun", "sun"]
    else:
        sun, moon = chart.charts[0].placements[:2]
        section["normal"] = f"Sun in {moon.sign}, house {moon.house}; Moon in {sun.sign}, house {sun.house}. These are reflective metaphors." + PLAIN
    with pytest.raises(ValueError):
        validate_reading(payload, CARDS, astrology_chart=chart)


@pytest.mark.parametrize("system", ["western", "vedic", "both"])
@pytest.mark.parametrize("degree_position", ["before_sign", "after_sign"])
def test_decimal_degrees_do_not_split_computed_body_sign_house_anchor(system, degree_position):
    chart = synthetic_chart(system)
    payload = {**example_reading(CARDS), "astrology_interpretation": interpretation(system, chart)}
    for current in chart.charts:
        points = [next(point for point in current.placements if point.id == ident) for ident in ("moon", "mars")]
        section = payload["astrology_interpretation"][current.system]
        section["focus_points"] = [point.id for point in points]
        section["normal"] = " ".join(
            (f"{point.name} at {point.degree:.2f} degrees in {point.sign} in the {point.house}th house"
             if degree_position == "before_sign" else
             f"{point.name} in {point.sign} at {point.degree:.2f} degrees in house {point.house}")
            + " invites reflection on one manageable priority."
            for point in points
        ) + PLAIN
    assert validate_reading(payload, CARDS, astrology_chart=chart).astrology.chart == chart


@pytest.mark.parametrize("sun_text", [
    "Sun at 13.32 degrees. Virgo in house 11 concerns shared plans.",
    "Sun in Virgo at 13.32 degrees. House 11 concerns shared plans.",
    "Sun at 13.32 degrees! Virgo in house 11 concerns shared plans.",
    "Sun in Virgo at 13.32 degrees; house 11 concerns shared plans.",
    "Sun in Virgo at 13.32. Mercury in house 11 concerns shared plans.",
    "Sun at 13.32 degrees while Mercury in Virgo in house 11 concerns shared plans.",
    "Sun in Virgo at 13.32 degrees while Mercury in house 11 concerns shared plans.",
    "Sun at 13.32 degrees in Libra in house 11 concerns shared plans.",
    "Sun in Virgo at 13.32 degrees in house 12 concerns shared plans.",
])
def test_decimal_degrees_do_not_relax_sentence_body_sign_or_house_boundaries(sun_text):
    chart = grouped_anchor_chart()
    payload = {**example_reading(CARDS), "astrology_interpretation": interpretation("vedic", chart)}
    section = payload["astrology_interpretation"]["vedic"]
    section["focus_points"] = ["sun", "moon"]
    section["normal"] = sun_text + " Moon in Sagittarius in house 2 invites reflection on resources." + PLAIN
    with pytest.raises(ValueError, match="computed body, sign and house"):
        validate_reading(payload, CARDS, astrology_chart=chart)


def grouped_anchor_chart():
    # Public synthetic date/location: Sun and Mercury share Virgo / house 11;
    # Moon is Sagittarius / house 2. No private birth details or provider calls.
    return chart_at(datetime(1985, 9, 23, 4, 45, tzinfo=UTC), 13.0827, 80.2707, "vedic").chart


@pytest.mark.parametrize("separator", [" and ", " & ", ", ", ", and "])
def test_astrology_direct_body_list_can_share_its_computed_sign_and_house(separator):
    chart = grouped_anchor_chart()
    payload = {**example_reading(CARDS), "astrology_interpretation": interpretation("vedic", chart)}
    section = payload["astrology_interpretation"]["vedic"]
    section["focus_points"] = ["sun", "mercury", "moon"]
    section["normal"] = (
        f"Sun{separator}Mercury in Virgo in house 11 invite reflection on shared plans. "
        "Moon in Sagittarius in house 2 invites reflection on resources."
    ) + PLAIN
    assert validate_reading(payload, CARDS, astrology_chart=chart).astrology.chart == chart


@pytest.mark.parametrize("different", ["sign", "house"])
def test_astrology_shared_anchor_rejects_a_group_member_with_a_different_placement(different):
    chart = grouped_anchor_chart()
    mercury = next(point for point in chart.charts[0].placements if point.id == "mercury")
    # Mercury is not a selected focus point: the Sun anchor must itself reject
    # the false group rather than relying on a separate check for Mercury.
    setattr(mercury, different, "Libra" if different == "sign" else 12)
    payload = {**example_reading(CARDS), "astrology_interpretation": interpretation("vedic", chart)}
    section = payload["astrology_interpretation"]["vedic"]
    section["focus_points"] = ["sun", "moon"]
    section["normal"] = (
        "Sun and Mercury in Virgo in house 11 invite reflection on shared plans. "
        "Moon in Sagittarius in house 2 invites reflection on resources."
    ) + PLAIN
    with pytest.raises(ValueError, match="computed body, sign and house"):
        validate_reading(payload, CARDS, astrology_chart=chart)


@pytest.mark.parametrize("sun_text", [
    "Sun invites reflection. Mercury in Virgo in house 11 concerns shared plans.",
    "Sun invites reflection. Virgo in house 11 concerns shared plans.",
    "Sun invites reflection while Mercury in Virgo in house 11 concerns shared plans.",
])
def test_astrology_anchor_cannot_borrow_a_later_sentence_or_indirect_body_placement(sun_text):
    chart = grouped_anchor_chart()
    payload = {**example_reading(CARDS), "astrology_interpretation": interpretation("vedic", chart)}
    section = payload["astrology_interpretation"]["vedic"]
    section["focus_points"] = ["sun", "moon"]
    section["normal"] = sun_text + " Moon in Sagittarius in house 2 invites reflection on resources." + PLAIN
    with pytest.raises(ValueError, match="computed body, sign and house"):
        validate_reading(payload, CARDS, astrology_chart=chart)
