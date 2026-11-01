import json

import pytest

from app.core.contracts import Action, RuleError
from app.games.tarot.deck import BY_ID, DECK, MINOR_MEANINGS, POSITIONS
from app.games.tarot.engine import TarotEngine
from app.games.tarot.reading import Reading, validate_reading


def test_full_deck_and_irreversible_unique_choices():
    engine = TarotEngine()
    assert len(DECK) == len({card.id for card in DECK}) == 78
    state = engine.setup(["reader"], {}, seed=101)
    original = json.dumps(state)
    assert state == engine.setup(["reader"], {}, seed=101)
    for position in (0, 29, 77):
        before = len(state["picks"])
        state = engine.apply_action(state, "reader", Action(type="pick", choice=str(position)))
        assert len(state["picks"]) == before + 1
        assert all(
            option.action.choice != str(position)
            for option in engine.legal_actions(state, "reader")
        )
    assert state["phase"] == "reading" and not engine.legal_actions(state, "reader")
    with pytest.raises(RuleError):
        engine.apply_action(state, "reader", Action(type="pick", choice="1"))
    assert len(json.loads(original)["picks"]) == 0


def test_projection_never_discloses_unpicked_cards_or_other_reader():
    engine = TarotEngine()
    state = engine.setup(["reader"], {}, seed=3)
    state = engine.apply_action(state, "reader", Action(type="pick", choice="40"))
    wire = engine.project_view(state, "reader").model_dump_json()
    for i, card in enumerate(state["deck"]):
        assert (json.dumps(card) in wire) == (i == 40)
    outsider = engine.project_view(state, "outsider")
    assert not outsider.community and not outsider.actions and not outsider.detail


def example_reading(card_ids):
    characters = [
        ("Chihiro", "Spirited Away"),
        ("Miles Morales", "Spider-Man: Into the Spider-Verse"),
        ("Leslie Knope", "Parks and Recreation"),
    ]
    return {
        "title": "A fresh chapter",
        "introduction": "A reflection on the three cards you chose.",
        "cards": [
            {
                "card_id": card_id,
                "position": position,
                "title": "Try a new angle",
                "interpretation": "Make a little room for an intentional next step.",
                "pop_culture": None,
                "quirky_interpretation": "Give your inner committee a snack break, then pick one manageable next step.",
                "characters": [{
                    "name": characters[index][0],
                    "source": characters[index][1],
                    "connection": "Their willingness to try a new approach mirrors this card's invitation to begin.",
                }],
            }
            for index, (card_id, position) in enumerate(zip(card_ids, POSITIONS, strict=True))
        ],
        "next_step": "Write down one small step you can take today.",
    }


def test_reader_contract_rejects_wrong_cards_order_and_extra_fields():
    cards = ["major-00", "cups-03", "swords-10"]
    payload = example_reading(cards)
    assert validate_reading(payload, cards).cards[0].card_id == cards[0]
    with pytest.raises(ValueError):
        validate_reading(payload, cards[::-1])
    payload["cards"][0]["position"] = "A prediction"
    with pytest.raises(ValueError):
        validate_reading(payload, cards)
    with pytest.raises(ValueError):
        validate_reading({**example_reading(cards), "extra": "bad"}, cards)


@pytest.mark.parametrize("missing", ["quirky_interpretation", "characters"])
def test_fresh_reading_requires_each_new_layer_but_legacy_history_remains_readable(missing):
    cards = ["major-00", "cups-03", "swords-10"]
    payload = example_reading(cards)
    del payload["cards"][1][missing]
    with pytest.raises(ValueError):
        validate_reading(payload, cards)
    for card in payload["cards"]:
        card.pop("quirky_interpretation", None)
        card.pop("characters", None)
        card["pop_culture"] = "A thoughtful character analogy saved by the earlier reading contract."
    legacy = Reading.model_validate(payload)
    assert all(card.quirky_interpretation is None and not card.characters for card in legacy.cards)
    assert legacy.cards[0].pop_culture == payload["cards"][0]["pop_culture"]


@pytest.mark.parametrize("connections", [[], [{"name": "A", "source": "B", "connection": "Too brief"}]])
def test_character_connections_require_named_explained_references(connections):
    cards = ["major-00", "cups-03", "swords-10"]
    payload = example_reading(cards)
    payload["cards"][0]["characters"] = connections
    with pytest.raises(ValueError):
        validate_reading(payload, cards)


def test_reading_limits_character_count_and_repetition_across_spread():
    cards = ["major-00", "cups-03", "swords-10"]
    payload = example_reading(cards)
    payload["cards"][1]["characters"][0]["name"] = "  CHIHIRO "
    with pytest.raises(ValueError, match="different character"):
        validate_reading(payload, cards)
    payload = example_reading(cards)
    payload["cards"][0]["characters"] *= 3
    with pytest.raises(ValueError):
        validate_reading(payload, cards)


def test_all_minor_cards_have_distinct_suit_specific_archetypes():
    assert all(len(meanings) == 14 for meanings in MINOR_MEANINGS.values())
    assert len({card.meaning for card in DECK}) == 78
    assert "disappointment" in BY_ID["cups-05"].meaning
    assert "scarcity" in BY_ID["pentacles-05"].meaning
    assert "Rest" in BY_ID["swords-04"].meaning
    assert "milestone" in BY_ID["wands-04"].meaning
