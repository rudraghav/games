"""Grounded wire contracts preserve model prose and server-owned facts."""

import json
from copy import deepcopy

import pytest
from test_astrology_reading import CARDS
from test_tarot_alternative_providers import canonical as canonical
from test_tarot_alternative_providers import envelope, wire_payload

from app.games.tarot import reading
from app.games.tarot.grounded import MODELS, build_grounded_request, decode_grounded_output
from app.games.tarot.providers import AlternativeOutputError


def grounded_payload(request, chart=None):
    payload = wire_payload(request, chart)
    for index in range(1, 4):
        card = payload[f"card_{index}"]
        card.pop("interpretation")
        card["reflection_question"] = "What small possibility could this card invite you to explore at your own pace?"
        card["imagery"] = card.pop("quirky_interpretation")
        card.pop("connection")
        card["connection_question"] = "What might this supplied motif invite you to consider at your own pace?"
    if chart:
        for current in chart.charts:
            payload["astrology_interpretation"][current.system] = {
                "focus_1": {"point_id": current.placements[0].id,
                            "reflection_question": "What could this symbol invite you to consider when choosing a manageable next step?"},
                "focus_2": {"point_id": current.placements[1].id,
                            "reflection_question": "Where might this contrasting symbol offer a useful question for reflection today?"},
                "imagery": "Picture these two symbolic invitations as paths on a map, each offering a different place to pause.",
            }
    return payload


def grounded_envelope(provider, canonical, chart=None):
    result = envelope(provider, grounded_payload(canonical, chart))
    result["model"] = MODELS[provider]
    return result


@pytest.mark.parametrize("provider", MODELS)
@pytest.mark.parametrize("mode", ["ordinary", "western", "vedic", "both"])
def test_grounded_adapter_preserves_prose_exact_facts_and_all_modes(canonical, provider, mode):
    request, chart = canonical(mode)
    before = deepcopy(request)
    wire = build_grounded_request(provider, request)
    assert wire["model"] == MODELS[provider]
    assert wire.get("max_tokens", wire.get("max_completion_tokens")) == 4096
    assert wire["response_format"]["json_schema"]["strict"]
    payload = grounded_payload(request, chart)
    body = grounded_envelope(provider, request, chart)
    adapted = decode_grounded_output(provider, body, request)
    context = json.loads(request["input"])
    result = reading.validate_reading(adapted, CARDS, astrology_chart=chart,
                                     candidates=[c["reference_characters"] for c in context["cards"]])
    assert request == before
    for index, section in enumerate(result.cards, 1):
        assert section.interpretation == payload[f"card_{index}"]["reflection_question"]
        assert section.quirky_interpretation == payload[f"card_{index}"]["imagery"]
        assert section.characters[0].evidence == context["cards"][index - 1]["reference_characters"][0]["public_context"]
    if chart:
        assert result.astrology.chart == chart
        for current in chart.charts:
            normal = getattr(result.astrology.interpretation, current.system).normal
            for index, point in enumerate(current.placements[:2], 1):
                generated = payload["astrology_interpretation"][current.system][f"focus_{index}"]["reflection_question"]
                assert f"{point.name} in {point.sign}, house {point.house}: {generated}" in normal


@pytest.mark.parametrize("tamper,reason", [
    ("duplicate", "duplicate_wire_key"), ("extra", "invalid_wire_schema"),
    ("missing", "invalid_wire_schema"), ("short", "invalid_text_length"),
    ("unknown_reference", "invalid_reference_id"), ("unknown_focus", "invalid_focus_id"),
    ("repeated_focus", "invalid_focus_id"), ("invented_evidence", "invalid_wire_schema"),
])
def test_grounded_adapter_rejects_invalid_output_without_salvage(canonical, tamper, reason):
    request, chart = canonical("both")
    body = grounded_envelope("groq", request, chart)
    payload = json.loads(body["choices"][0]["message"]["content"])
    if tamper == "extra":
        payload["private"] = "unrequested"
    elif tamper == "missing":
        del payload["card_1"]
    elif tamper == "short":
        payload["card_1"]["reflection_question"] = "Too brief."
    elif tamper == "unknown_reference":
        payload["card_1"]["reference_id"] = "unknown"
    elif tamper == "unknown_focus":
        payload["astrology_interpretation"]["western"]["focus_1"]["point_id"] = "unknown"
    elif tamper == "repeated_focus":
        section = payload["astrology_interpretation"]["western"]
        section["focus_2"]["point_id"] = section["focus_1"]["point_id"]
    elif tamper == "invented_evidence":
        payload["card_1"]["evidence"] = "Provider-authored fact"
    encoded = json.dumps(payload)
    if tamper == "duplicate":
        encoded = '{"title":"duplicate",' + encoded[1:]
    body["choices"][0]["message"]["content"] = encoded
    with pytest.raises(AlternativeOutputError) as error:
        decode_grounded_output("groq", body, request)
    assert error.value.reason == reason


@pytest.mark.parametrize("location", ["reflection_question", "connection_question", "astrology"])
@pytest.mark.parametrize("text", [
    "You are ready for change, and this card proves that something better is already coming.",
    "What might you consider about this possibility? How might you change your direction?",
    "Your struggles are ending. What might you consider about this new opportunity?",
])
def test_question_subcontract_rejects_assertions_multiple_questions_and_prefaces(canonical, location, text):
    request, chart = canonical("western")
    body = grounded_envelope("groq", request, chart)
    payload = json.loads(body["choices"][0]["message"]["content"])
    if location == "astrology":
        payload["astrology_interpretation"]["western"]["focus_1"]["reflection_question"] = text
    else:
        payload["card_1"][location] = text
    body["choices"][0]["message"]["content"] = json.dumps(payload)
    with pytest.raises(AlternativeOutputError) as error:
        decode_grounded_output("groq", body, request)
    assert error.value.reason == "invalid_reflection_question"


def test_astro_shortlist_keeps_three_distinct_choices_when_ranked_lists_overlap(canonical):
    from itertools import product

    from app.games.tarot.grounded_astrology import build_grounded_astrology_request

    request, _chart = canonical("both")
    context = json.loads(request["input"])
    references = [card["reference_characters"][0] for card in context["cards"]]
    for card in context["cards"]:
        card["reference_characters"] = references
    request["input"] = json.dumps(context)
    before = deepcopy(request)
    effective, wire = build_grounded_astrology_request(request)
    narrowed = json.loads(effective["input"])
    assert request == before and narrowed["astrology"] == context["astrology"]
    rows = [card["reference_characters"] for card in narrowed["cards"]]
    assert all(len(row) == 2 and all(reference in references for reference in row) for row in rows)
    assert any(len({ref["name"] for ref in chosen}) == 3 for chosen in product(*rows))
    assert wire["reasoning_effort"] == "medium" and wire["max_completion_tokens"] == 4096


def test_astro_decoder_rejects_unsupplied_full_shortlist(canonical):
    from app.games.tarot.grounded_astrology import (
        build_grounded_astrology_request,
        decode_grounded_astrology_output,
    )

    request, chart = canonical("both")
    context = json.loads(request["input"])
    references = [card["reference_characters"][0] for card in context["cards"]]
    for card in context["cards"]:
        card["reference_characters"] = references
    request["input"] = json.dumps(context)
    effective, _wire = build_grounded_astrology_request(request)
    with pytest.raises(AlternativeOutputError) as error:
        decode_grounded_astrology_output(grounded_envelope("groq", effective, chart), request)
    assert error.value.reason == "invalid_astrology_effective_shortlist"


def grounded_json_envelope(canonical, chart):
    body = grounded_envelope("groq", canonical, chart)
    payload = json.loads(body["choices"][0]["message"]["content"])
    for name in ("tarot_connection", "next_step"):
        payload["astrology_" + name] = payload["astrology_interpretation"].pop(name)
    body["choices"][0]["message"]["content"] = json.dumps(payload)
    return body


@pytest.mark.parametrize("mode", ["western", "vedic", "both"])
def test_json_astrology_fields_map_without_changing_any_generated_text(canonical, mode):
    from app.games.tarot.grounded_astrology import decode_grounded_astrology_output
    from app.games.tarot.grounded_json import (
        build_grounded_json_request,
        decode_grounded_json_output,
    )

    original, chart = canonical(mode)
    effective, wire = build_grounded_json_request(original)
    expected = decode_grounded_astrology_output(grounded_envelope("groq", effective, chart), effective)
    actual = decode_grounded_json_output(grounded_json_envelope(effective, chart), effective)
    assert actual == expected
    assert wire["response_format"] == {"type": "json_object"}
    assert "astrology_tarot_connection" in wire["messages"][0]["content"]
    reading.validate_reading(actual, CARDS, astrology_chart=chart,
                             candidates=[c["reference_characters"] for c in json.loads(effective["input"])["cards"]])


@pytest.mark.parametrize("tamper", ["old_parent_fields", "nested_chart_fields", "extra", "duplicate", "refusal"])
def test_json_astrology_decoder_requires_exact_shape_without_salvage(canonical, tamper):
    from app.games.tarot.grounded_json import (
        build_grounded_json_request,
        decode_grounded_json_output,
    )

    original, chart = canonical("western")
    effective, _wire = build_grounded_json_request(original)
    body = grounded_json_envelope(effective, chart)
    payload = json.loads(body["choices"][0]["message"]["content"])
    if tamper in ("old_parent_fields", "nested_chart_fields"):
        target = payload["astrology_interpretation"]
        if tamper == "nested_chart_fields":
            target = target["western"]
        for name in ("tarot_connection", "next_step"):
            target[name] = payload.pop("astrology_" + name)
    elif tamper == "extra":
        payload["invented_field"] = "Unrequested"
    elif tamper == "refusal":
        body["choices"][0]["message"]["refusal"] = "Blocked"
    encoded = json.dumps(payload)
    if tamper == "duplicate":
        encoded = '{"astrology_next_step":"duplicate",' + encoded[1:]
    body["choices"][0]["message"]["content"] = encoded
    with pytest.raises(AlternativeOutputError) as error:
        decode_grounded_json_output(body, effective)
    assert error.value.reason == ("refusal" if tamper == "refusal" else
                                  "duplicate_wire_key" if tamper == "duplicate" else "invalid_wire_schema")
