"""Reversed draws: decided by the server with the shuffle, secret until drawn."""

import json
import random

import httpx
import pytest
from test_tarot import example_reading

from app.core.contracts import Action
from app.games.tarot import card_guide, deck
from app.games.tarot.engine import REVERSALS, TarotEngine, drawn_orientations
from app.games.tarot.reading import (
    Reading,
    Section,
    alternate_view,
    build_reading_request,
    generate_reading,
    provider_schema,
    with_orientations,
)
from app.games.tarot.reference_retrieval import NEW_READING_EXCLUSIONS
from app.settings import settings

ENGINE = TarotEngine()


def pick(state, position):
    return ENGINE.apply_action(state, "reader", Action(type="pick", choice=str(position)))


def flip_undrawn(state):
    """The same match, with every card still in the deck turned the other way."""
    drawn = {state["deck"][index] for index in state["picks"]}
    turned = set(state["reversed"])
    return {**state, "reversed": [
        card for card in state["deck"]
        if (card in turned) == (card in drawn)
    ]}


def test_orientation_is_decided_with_the_shuffle_seeded_stable_and_one_in_three():
    state = ENGINE.setup(["reader"], {}, seed=7)
    assert state == ENGINE.setup(["reader"], {}, seed=7)
    # The shuffle itself is the one earlier seeds produced; orientation is drawn after it.
    expected = [card.id for card in deck.DECK]
    random.Random(7).shuffle(expected)
    assert state["deck"] == expected
    turned = state["reversed"]
    assert len(turned) == len(set(turned)) == 25 and set(turned) < set(state["deck"])
    assert [card in turned for card in state["deck"][:6]] == [True, False, False, True, False, True]
    # Over many seeded matches: a third overall, and no card or deck position is favoured.
    matches = [ENGINE.setup(["reader"], {}, seed=seed) for seed in range(600)]
    share = sum(len(match["reversed"]) for match in matches) / (600 * 78)
    assert 0.32 < share < 0.35
    by_card = {card.id: 0 for card in deck.DECK}
    by_position = [0] * 78
    for match in matches:
        for card in match["reversed"]:
            by_card[card] += 1
            by_position[match["deck"].index(card)] += 1
    assert all(150 < count < 250 for count in [*by_card.values(), *by_position])
    assert ENGINE.setup(["reader"], {}, seed=8)["reversed"] != turned


def test_the_table_setting_turns_reversals_off_and_defaults_on():
    setting = next(item for item in ENGINE.manifest.settings if item.key == REVERSALS)
    assert (setting.label, setting.default) == ("Include reversed cards", True)
    off = ENGINE.setup(["reader"], {REVERSALS: False}, seed=7)
    on = ENGINE.setup(["reader"], {REVERSALS: True}, seed=7)
    assert off["reversed"] == [] and off["deck"] == on["deck"]
    assert on == ENGINE.setup(["reader"], {}, seed=7)
    for position in range(3):
        off = pick(off, position)
    assert [card.orientation for card in ENGINE.project_view(off, "reader").community] == ["upright"] * 3


def test_a_state_saved_before_reversals_reads_every_card_upright():
    state = ENGINE.setup(["reader"], {}, seed=7)
    old = {key: value for key, value in state.items() if key != "reversed"}
    for position in (0, 3, 5):
        old = pick(old, position)
    assert "reversed" not in old
    assert set(drawn_orientations(old).values()) == {"upright"}
    view = ENGINE.project_view(old, "reader")
    assert [card.orientation for card in view.community] == ["upright"] * 3
    assert [card.subtitle for card in view.community] == [deck.BY_ID[card.id].meaning for card in view.community]


@pytest.mark.parametrize("seed", [3, 7, 101])
def test_no_projection_action_or_message_depends_on_an_undrawn_orientation(seed):
    state = ENGINE.setup(["reader"], {}, seed=seed)
    picks = [0, 3, 5]
    for step in range(4):
        other = flip_undrawn(state)
        assert other["reversed"] != state["reversed"]
        assert drawn_orientations(other) == drawn_orientations(state)
        for viewer in ("reader", "outsider"):
            ours = ENGINE.project_view(state, viewer).model_dump_json()
            assert ours == ENGINE.project_view(other, viewer).model_dump_json()
            assert ENGINE.legal_actions(state, viewer) == ENGINE.legal_actions(other, viewer)
            # Orientation appears once per DRAWN card for its reader, and nowhere else.
            shown = step if viewer == "reader" else 0
            assert ours.count('"orientation"') == shown
            assert ours.count("reversed") == (
                list(drawn_orientations(state).values()).count("reversed") if viewer == "reader" else 0
            )
            for index, card in enumerate(state["deck"]):
                assert (json.dumps(card) in ours) == (viewer == "reader" and index in state["picks"])
        assert state["message"] == other["message"]
        assert "revers" not in state["message"].casefold() and "upright" not in state["message"].casefold()
        if step < 3:
            # The next draw turns over exactly the orientation saved for that card.
            card = state["deck"][picks[step]]
            state, other = pick(state, picks[step]), pick(other, picks[step])
            assert state["message"] == other["message"]
            drawn = ENGINE.project_view(state, "reader").community[-1]
            assert (drawn.id, drawn.orientation) == (
                card, "reversed" if card in state["reversed"] else "upright")
            assert ENGINE.project_view(other, "reader").community[-1].orientation != drawn.orientation
    outsider = ENGINE.project_view(state, "outsider")
    assert not outsider.community and not outsider.actions and not outsider.detail and not outsider.message


def test_a_drawn_card_shows_its_orientation_and_that_orientations_meaning():
    state = ENGINE.setup(["reader"], {}, seed=7)
    for position in range(3):
        state = pick(state, position)
    cards = ENGINE.project_view(state, "reader").model_dump(mode="json")["community"]
    assert [(card["id"], card["orientation"]) for card in cards] == [
        ("cups-03", "reversed"), ("major-00", "upright"), ("pentacles-14", "upright")]
    assert cards[0]["subtitle"] == card_guide.short_meaning("cups-03", "reversed")
    assert cards[0]["subtitle"] != deck.BY_ID["cups-03"].meaning
    assert cards[1]["subtitle"] == deck.BY_ID["major-00"].meaning
    assert cards[0]["label"] == "Three of Cups"  # The name never changes with orientation.


def test_card_meaning_comes_from_the_guide_and_upright_text_is_unchanged():
    for card in deck.DECK:
        # The reference index is built from TarotCard.meaning: the two must stay word for word.
        assert deck.card_meaning(card.id) == deck.card_meaning(card.id, "upright") == card.meaning
        turned = deck.card_meaning(card.id, "reversed")
        assert turned == card_guide.short_meaning(card.id, "reversed") and turned != card.meaning
    for bad in (("major-00", "sideways"), ("unknown-card", "upright")):
        with pytest.raises(ValueError):
            deck.card_meaning(*bad)
    # Another card's orientation never leaks into this card's view.
    assert deck.BY_ID["major-00"].view().orientation == "upright"
    assert deck.BY_ID["major-00"].view("reversed").orientation == "reversed"


def test_other_games_cards_do_not_gain_an_orientation_field():
    from app.core.cards import card_view

    assert "orientation" not in card_view("AS:0").model_dump()
    assert "orientation" not in card_view("AS:0").model_dump_json()


def drawn_spread(seed=7):
    state = ENGINE.setup(["reader"], {}, seed=seed)
    for position in range(3):
        state = pick(state, position)
    return drawn_orientations(state)


def test_the_reading_request_carries_each_drawn_orientation_and_its_meaning():
    orientations = drawn_spread()
    cards = list(orientations)
    assert orientations == {"cups-03": "reversed", "major-00": "upright", "pentacles-14": "upright"}
    for style in ("classic", "fun"):
        request = build_reading_request(cards, "How do I rest this month?", reading_style=style,
                                        orientations=orientations)
        context = json.loads(request["input"])["cards"]
        assert [(card["card_id"], card["orientation"]) for card in context] == list(orientations.items())
        assert context[0]["meaning"] == card_guide.short_meaning("cups-03", "reversed")
        assert context[1]["meaning"] == deck.BY_ID["major-00"].meaning
        assert "For a reversed card, say\nplainly that it is reversed" in request["system_instruction"]
        # The model never authors an orientation: the field is not in its schema.
        assert "orientation" not in json.dumps(request["response_format"]["schema"])
    assert "orientation" not in json.dumps(provider_schema(cards))
    # Nothing about cards that were not drawn reaches the request.
    assert len(json.loads(request["input"])["cards"]) == 3


def provider(monkeypatch, payload):
    from app.games.tarot.characters import find_character

    pairs = [("Chihiro", "Spirited Away"), ("Miles Morales", "Spider-Man: Into the Spider-Verse"),
             ("Leslie Knope", "Parks and Recreation")]
    monkeypatch.setattr("app.games.tarot.reading.reference_candidates",
                        lambda *_args, **_kwargs: [[find_character(*pair)] for pair in pairs])
    monkeypatch.setattr(settings(), "tarot_provider_order", ["gemini"])
    real_client, calls = httpx.Client, []

    def respond(request):
        calls.append(json.loads(request.content))
        return httpx.Response(200, json={"status": "completed", "steps": [{
            "type": "model_output", "content": [{"type": "text", "text": json.dumps(payload)}]}]})

    monkeypatch.setattr("app.games.tarot.reading.httpx.Client",
                        lambda **kwargs: real_client(transport=httpx.MockTransport(respond), **kwargs))
    return calls


def test_a_generated_reading_is_stamped_with_the_saved_draw_not_the_models_word(monkeypatch):
    orientations = drawn_spread()
    cards = list(orientations)
    payload = example_reading(cards)
    # A model that volunteers an orientation is overruled by the draw.
    payload["cards"][0]["orientation"] = "upright"
    payload["cards"][1]["orientation"] = "reversed"
    calls = provider(monkeypatch, payload)
    result = generate_reading(cards, "private-test-question", orientations=orientations)
    assert [section.orientation for section in result.cards] == ["reversed", "upright", "upright"]
    assert [card["orientation"] for card in json.loads(calls[0]["input"])["cards"]] == [
        "reversed", "upright", "upright"]
    stored = result.model_dump(mode="json")
    assert [section["orientation"] for section in stored["cards"]] == ["reversed", "upright", "upright"]
    assert Reading.model_validate(stored) == result
    # With no draw supplied (a caller from before reversals) every section is upright.
    plain = generate_reading(cards, "private-test-question")
    assert [section.orientation for section in plain.cards] == ["upright"] * 3


def test_saved_sections_default_to_upright_and_the_alternate_view_keeps_orientation():
    cards = ["cups-03", "major-00", "pentacles-14"]
    old = Reading.model_validate(example_reading(cards))
    assert [section.orientation for section in old.cards] == ["upright"] * 3
    assert "orientation" not in example_reading(cards)["cards"][0]
    with pytest.raises(ValueError):
        Section.model_validate({**example_reading(cards)["cards"][0], "orientation": "sideways"})
    saved = with_orientations(old, {"cups-03": "reversed"})
    assert [section.orientation for section in saved.cards] == ["reversed", "upright", "upright"]
    assert [section.orientation for section in old.cards] == ["upright"] * 3
    for style in ("classic", "fun"):
        view = alternate_view(saved, style, cards, "How do I rest this month?")
        assert [section.orientation for section in view.cards] == ["reversed", "upright", "upright"]
        assert [section.interpretation for section in view.cards] == [s.interpretation for s in saved.cards]
    with pytest.raises(ValueError):
        with_orientations(old, {"cups-03": "sideways"})


def test_adult_industry_biographies_are_not_offered_as_new_comparisons():
    from app.games.tarot.characters import CHARACTERS, reference_candidates

    words = ("pornograph", "adult film", "adult model", "adult entertainment", "stripper")
    flagged = {
        reference["id"] for reference in CHARACTERS
        if any(word in (reference.get("sourceContext", "") + reference.get("description", "")).casefold()
               for word in words)
    }
    assert flagged and flagged <= NEW_READING_EXCLUSIONS.keys()
    # Fan-fiction tags have no place in any text a reading can show.
    tags = ("smut", "fluff", "nsfw", "kink", "hurt/comfort", "ao3", "fanfic")
    for reference in CHARACTERS:
        shown = " ".join(str(reference.get(key, "")) for key in (
            "name", "source", "description", "sourceContext", "tradition")).casefold()
        assert not any(tag in shown.split() or f" {tag} " in f" {shown} " for tag in tags), reference["id"]
    for cards in (["major-06", "major-15", "cups-02"], ["major-03", "wands-13", "cups-13"]):
        rows = reference_candidates(cards, "What do I want from love and desire?")
        assert not {choice["id"] for row in rows for choice in row} & NEW_READING_EXCLUSIONS.keys()
