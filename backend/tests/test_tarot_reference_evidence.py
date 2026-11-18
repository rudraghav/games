"""Trusted reference prose is exact on generation and immutable in saved history."""

import json
from copy import deepcopy

import pytest
from test_tarot import example_reading

from app.games.tarot.characters import find_character
from app.games.tarot.reading import Reading, provider_schema, validate_reading

CARDS = ["major-00", "cups-03", "swords-10"]


def with_evidence():
    payload = example_reading(CARDS)
    candidates = []
    for section in payload["cards"]:
        choices = []
        for character in section["characters"]:
            reference = find_character(character["name"], character["source"])
            assert reference is not None
            context = reference.get("public_context") or reference.get("sourceContext") or reference["description"]
            character["evidence"] = context
            choices.append({"name": reference["name"], "source": reference["source"], "public_context": context})
        candidates.append(choices)
    return payload, candidates


@pytest.mark.parametrize("supply_candidates", [False, True])
def test_exact_source_evidence_survives_generation_and_storage(supply_candidates):
    payload, candidates = with_evidence()
    result = validate_reading(payload, CARDS, candidates=candidates if supply_candidates else None)
    saved = Reading.model_validate_json(result.model_dump_json())
    assert saved.cards[0].characters[0].evidence == payload["cards"][0]["characters"][0]["evidence"]


@pytest.mark.parametrize("supply_candidates", [False, True])
def test_model_paraphrase_cannot_masquerade_as_source_evidence(supply_candidates):
    payload, candidates = with_evidence()
    payload["cards"][0]["characters"][0]["evidence"] = "A plausible but unsupported replacement fact."
    with pytest.raises(ValueError, match="exactly match"):
        validate_reading(payload, CARDS, candidates=candidates if supply_candidates else None)


def test_evidence_is_bound_to_its_own_card_reference():
    payload, candidates = with_evidence()
    payload["cards"][0]["characters"][0]["evidence"] = payload["cards"][1]["characters"][0]["evidence"]
    with pytest.raises(ValueError, match="exactly match"):
        validate_reading(payload, CARDS, candidates=candidates)


def test_exact_whitespace_is_preserved_and_saved_history_is_not_rewritten():
    payload, candidates = with_evidence()
    evidence = "  A supplied fact with its original surrounding whitespace.  "
    candidates[0][0]["public_context"] = evidence
    payload["cards"][0]["characters"][0]["evidence"] = evidence
    saved = validate_reading(payload, CARDS, candidates=candidates).model_dump_json()
    changed = deepcopy(candidates)
    changed[0][0]["public_context"] = "A subsequently corrected source fact."
    with pytest.raises(ValueError, match="exactly match"):
        validate_reading(json.loads(saved), CARDS, candidates=changed)
    assert Reading.model_validate_json(saved).cards[0].characters[0].evidence == evidence


def test_legacy_readings_and_gemini_generation_do_not_gain_evidence_fields():
    saved = Reading.model_validate(example_reading(CARDS)).model_dump()
    assert all("evidence" not in ref for card in saved["cards"] for ref in card["characters"])
    assert "evidence" not in provider_schema(CARDS)["$defs"]["CharacterConnection"]["properties"]
