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
    "What might you consider about this possibility? How might you change your direction? Where could you begin?",
    "Your struggles are ending. What might you consider about this new opportunity?",
])
def test_question_subcontract_rejects_assertions_three_questions_and_prefaces(canonical, location, text):
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


@pytest.mark.parametrize("location", ["reflection_question", "connection_question", "astrology"])
def test_question_subcontract_preserves_two_complete_bounded_questions(canonical, location):
    request, chart = canonical("western")
    body = grounded_envelope("groq", request, chart)
    payload = json.loads(body["choices"][0]["message"]["content"])
    text = "What might you consider about this possibility? How could you explore it at your own pace?"
    if location == "astrology":
        payload["astrology_interpretation"]["western"]["focus_1"]["reflection_question"] = text
    else:
        payload["card_1"][location] = text
    body["choices"][0]["message"]["content"] = json.dumps(payload)
    result = decode_grounded_output("groq", body, request)
    reading.validate_reading(result, CARDS, astrology_chart=chart,
                             candidates=[c["reference_characters"] for c in json.loads(request["input"])["cards"]])
    if location == "astrology":
        assert text in result["astrology_interpretation"]["western"]["normal"]
    elif location == "reflection_question":
        assert result["cards"][0]["interpretation"] == text
    else:
        assert result["cards"][0]["characters"][0]["connection"] == text


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


@pytest.mark.parametrize("mode", ["vedic", "both"])
def test_json_instruct_changes_only_supported_generation_controls(canonical, mode):
    from app.games.tarot.grounded_json import (
        build_grounded_json_request,
        decode_grounded_json_output,
    )

    original, chart = canonical(mode)
    effective, medium = build_grounded_json_request(original)
    instruct_effective, instruct = build_grounded_json_request(original, reasoning_effort="none")
    assert instruct_effective == effective
    assert instruct == {**medium, "reasoning_effort": "none", "temperature": 0.7, "top_p": 0.8}
    assert instruct["max_completion_tokens"] == 4096
    assert instruct["reasoning_format"] == "hidden"
    assert not {"presence_penalty", "frequency_penalty", "top_k", "min_p"} & set(instruct)
    payload = decode_grounded_json_output(grounded_json_envelope(effective, chart), instruct_effective)
    reading.validate_reading(payload, CARDS, astrology_chart=chart,
                             candidates=[c["reference_characters"] for c in json.loads(effective["input"])["cards"]])


@pytest.mark.parametrize("mode", ["western", "vedic", "both"])
@pytest.mark.parametrize("placement", ["parent", "sole_chart"])
def test_json_known_complete_placements_preserve_every_generated_string(canonical, mode, placement):
    from app.games.tarot.grounded_json import (
        build_grounded_json_request,
        decode_grounded_json_output,
    )

    original, chart = canonical(mode)
    effective, _wire = build_grounded_json_request(original, reasoning_effort="none")
    body = grounded_json_envelope(effective, chart)
    expected = decode_grounded_json_output(body, effective)
    payload = json.loads(body["choices"][0]["message"]["content"])
    target = payload["astrology_interpretation"]
    if placement == "sole_chart":
        target = target["western" if mode == "both" else mode]
    for name in ("tarot_connection", "next_step"):
        target[name] = payload.pop("astrology_" + name)
    body["choices"][0]["message"]["content"] = json.dumps(payload)
    if placement == "sole_chart" and mode == "both":
        with pytest.raises(AlternativeOutputError) as error:
            decode_grounded_json_output(body, effective)
        assert error.value.reason == "invalid_wire_schema"
    else:
        assert decode_grounded_json_output(body, effective) == expected


@pytest.mark.parametrize("tamper", ["conflicting_parent", "conflicting_nested", "partial_parent", "partial_nested", "extra", "duplicate", "refusal"])
def test_json_astrology_decoder_requires_exact_shape_without_salvage(canonical, tamper):
    from app.games.tarot.grounded_json import (
        build_grounded_json_request,
        decode_grounded_json_output,
    )

    original, chart = canonical("western")
    effective, _wire = build_grounded_json_request(original)
    body = grounded_json_envelope(effective, chart)
    payload = json.loads(body["choices"][0]["message"]["content"])
    if tamper in ("conflicting_parent", "conflicting_nested", "partial_parent", "partial_nested"):
        target = payload["astrology_interpretation"]
        if tamper.endswith("nested"):
            target = target["western"]
        for name in ("tarot_connection", "next_step"):
            target[name] = payload["astrology_" + name]
        if tamper.startswith("partial"):
            target.pop("next_step")
            payload.pop("astrology_tarot_connection")
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


@pytest.mark.parametrize("provider", ["gemini", "groq", "cloudflare"])
@pytest.mark.parametrize("mode", ["ordinary", "western", "vedic", "both"])
def test_fun_connections_accept_statements_and_keep_supplied_evidence(canonical, provider, mode):
    from test_astrology_reading import interpretation
    from test_tarot import example_reading

    from app.games.tarot.groq_qwen_astrology import build_groq_qwen_astrology_request
    from app.games.tarot.grounded_json import build_grounded_json_request
    from app.games.tarot.style import FUN_CONNECTION

    source, chart = canonical(mode, reading_style="fun")
    connections = [
        "Chihiro cleans a polluted river spirit. Start with one visible mess and you could make a busy shift manageable.",
        "Miles trains with Peter B. Parker. A short first attempt with a coach could show you which part needs another try.",
        "Leslie tackles a dangerous construction pit. If you turn one complaint into a specific request, someone could act on it.",
    ]
    if provider == "gemini":
        payload = example_reading(CARDS)
        for section, connection in zip(payload["cards"], connections, strict=True):
            section["characters"][0]["connection"] = connection
        if chart:
            payload["astrology_interpretation"] = interpretation(chart=chart)
        candidates = [card["reference_characters"] for card in json.loads(source["input"])["cards"]]
        assert FUN_CONNECTION in source["system_instruction"]
        result = reading._parse_output({
            "status": "completed", "steps": [{"type": "model_output", "content": [
                {"type": "text", "text": json.dumps(payload)},
            ]}],
        }, CARDS, chart, candidates=candidates, reading_style="fun")
    else:
        if provider == "groq" and mode == "western":
            source, wire = build_groq_qwen_astrology_request(source)
            payload = wire_payload(source, chart)
            for index in range(1, 4):
                card = payload[f"card_{index}"]
                card.pop("interpretation")
                card["reflection_question"] = "Which possibility could fit the question?"
                card["imagery"] = card.pop("quirky_interpretation")
            western = payload["astrology_interpretation"]["western"]
            western["imagery"] = western.pop("quirky")
        else:
            if provider == "groq" and mode in {"vedic", "both"}:
                source, wire = build_grounded_json_request(source, reasoning_effort="none")
            else:
                wire = build_grounded_request(provider, source)
            payload = grounded_payload(source, chart)
            for index in range(1, 4):
                payload[f"card_{index}"].pop("connection_question")
        for index, connection in enumerate(connections, 1):
            payload[f"card_{index}"]["connection"] = connection
        assert FUN_CONNECTION in wire["messages"][0]["content"]
        assert "connection_question" not in wire["messages"][0]["content"]
        body = envelope(provider, payload)
        body["model"] = MODELS[provider]
        candidates = [card["reference_characters"] for card in json.loads(source["input"])["cards"]]
        result = reading._alternative_reading(provider, body, source, CARDS, chart, candidates)
    for index, section in enumerate(result.cards):
        character = section.characters[0]
        assert character.connection == connections[index]
        assert character.evidence == candidates[index][0]["public_context"]
    assert (result.astrology is not None) == (chart is not None)


def test_fun_connections_bind_the_named_figure_to_its_own_scene():
    from test_tarot import example_reading

    from app.games.tarot.characters import find_character
    from app.games.tarot.recovery import ReadingValidationError

    payload = example_reading(CARDS)
    holmes = find_character("Sherlock Holmes", "Sherlock Holmes")
    kalam = find_character("A. P. J. Abdul Kalam", "Science and invention")
    assert holmes and kalam
    for index, figure in [(0, holmes), (2, kalam)]:
        payload["cards"][index]["characters"][0].update(name=figure["name"], source=figure["source"])
    connections = [card["characters"][0] for card in payload["cards"]]
    connections[0]["connection"] = (
        "Sherlock and Dr. Watson examine evidence together. You could ask a friend to check one clue before choosing."
    )
    connections[1]["connection"] = "Miles trains with Peter B. Parker. You could practice one skill with a friend until you can use it with confidence."
    connections[2]["connection"] = (
        "Kalam's team reused rocket material for lighter leg calipers. You could try a tool you already have."
    )
    supplied = [[find_character(c["name"], c["source"])] for c in connections]
    supplied[0] = [{**holmes, "public_context": "Sherlock Holmes and Watson examine evidence together."}]
    reading.validate_reading(payload, CARDS, reading_style="fun", candidates=supplied)
    for index, line in [
        (0, "Reflect on the consequences, like the financial independence that allowed Charlie Chaplin to perfect his craft."),
        (2, "You could try applying knowledge to practical problems like Rancho from 3 Idiots."),
    ]:
        saved = connections[index]["connection"]
        connections[index]["connection"] = line
        with pytest.raises(ReadingValidationError) as failure:
            reading.validate_reading(payload, CARDS, reading_style="fun", candidates=supplied)
        assert failure.value.issue.field == f"cards.{index}.characters.0.connection"
        assert not failure.value.issue.relaxable
        connections[index]["connection"] = saved


def test_fun_scene_check_rejects_generic_advice_and_returns_actionable_field_feedback():
    from app.games.tarot.characters import find_character
    from app.games.tarot.recovery import ValidationIssue, retry_request
    from app.games.tarot.reference_mentions import scene_hints, uses_scene_detail

    for name, source, prose in [
        ("Sherlock Holmes", "Sherlock Holmes", "You could try using a journal to track the effects of your decisions."),
        ("Lara Croft", "Tomb Raider", "You could try taking a short walk outside without your phone to clear your mind."),
        ("Winnie-the-Pooh", "Winnie-the-Pooh by A. A. Milne", "You could try setting aside 10 minutes to brainstorm new ideas."),
    ]:
        figure = find_character(name, source)
        assert figure is not None
        evidence = figure["sourceContext"]
        assert not uses_scene_detail(prose, figure, evidence)
        if name == "Winnie-the-Pooh":
            assert not uses_scene_detail("Pooh has small adventures. You might enjoy one too.", figure, evidence)
        assert all(uses_scene_detail(hint, figure, evidence) for hint in scene_hints(evidence, figure))
    issue = ValidationIssue("scene_detail", "cards.0.characters.0.connection")
    corrected = json.loads(retry_request({"input": "{}"}, issue)["input"])
    assert corrected["validation_feedback"]["check"] == "scene_detail"
    assert "scene_phrases" in corrected["validation_feedback"]["instruction"]
    assert "validation_relaxations" not in corrected
