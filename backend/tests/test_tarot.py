import json

import pytest

from app.core.contracts import Action, RuleError
from app.games.tarot.deck import DECK, POSITIONS
from app.games.tarot.engine import TarotEngine
from app.games.tarot.reading import validate_reading


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
    return {
        "title": "A fresh chapter",
        "introduction": "A reflection on the three cards you chose.",
        "cards": [
            {
                "card_id": card_id,
                "position": position,
                "title": "Try a new angle",
                "interpretation": "Make a little room for an intentional next step.",
                "pop_culture": "Like a character finding a new route through a familiar story.",
            }
            for card_id, position in zip(card_ids, POSITIONS, strict=True)
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
