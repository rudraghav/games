"""The card guide covers the whole deck, in both orientations, in the agreed voice."""

import importlib.util
import json
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.games.tarot import card_guide
from app.games.tarot.card_guide import CardGuide, all_guides, guide, short_meaning
from app.games.tarot.deck import BY_ID, DECK, RANKS

ROOT = Path(__file__).resolve().parents[2]
GUIDES = all_guides()
SOURCE = json.loads(card_guide.GUIDE_PATH.read_text())
SIDE_FIELDS = ("short", "meaning", "love", "work", "self", "advice")

SUIT_ELEMENT = {"wands": "Fire", "cups": "Water", "swords": "Air", "pentacles": "Earth"}
# Court pairing used by this guide: Page Earth, Knight Fire, Queen Water, King Air.
COURT_PART = {"Page": "Earth", "Knight": "Fire", "Queen": "Water", "King": "Air"}
# Golden Dawn decans for the Two to Ten of each suit, in rank order.
DECANS = {
    "wands": ("Mars in Aries", "Sun in Aries", "Venus in Aries", "Saturn in Leo", "Jupiter in Leo",
              "Mars in Leo", "Mercury in Sagittarius", "Moon in Sagittarius", "Saturn in Sagittarius"),
    "cups": ("Venus in Cancer", "Mercury in Cancer", "Moon in Cancer", "Mars in Scorpio",
             "Sun in Scorpio", "Venus in Scorpio", "Saturn in Pisces", "Jupiter in Pisces",
             "Mars in Pisces"),
    "swords": ("Moon in Libra", "Saturn in Libra", "Jupiter in Libra", "Venus in Aquarius",
               "Mercury in Aquarius", "Moon in Aquarius", "Jupiter in Gemini", "Mars in Gemini",
               "Sun in Gemini"),
    "pentacles": ("Jupiter in Capricorn", "Mars in Capricorn", "Sun in Capricorn",
                  "Mercury in Taurus", "Moon in Taurus", "Saturn in Taurus", "Sun in Virgo",
                  "Venus in Virgo", "Mercury in Virgo"),
}
COURT_SIGNS = {
    "wands": {"Knight": "Sagittarius", "Queen": "Aries", "King": "Leo"},
    "cups": {"Knight": "Pisces", "Queen": "Cancer", "King": "Scorpio"},
    "swords": {"Knight": "Gemini", "Queen": "Libra", "King": "Aquarius"},
    "pentacles": {"Knight": "Virgo", "Queen": "Capricorn", "King": "Taurus"},
}
# (astrology, element) for the Major Arcana, 0 to 21. Uranus, Neptune and Pluto are the
# modern planets for the three cards the Golden Dawn gave to an element alone.
MAJORS = (
    ("Uranus", "Air"), ("Mercury", "Air"), ("Moon", "Water"), ("Venus", "Earth"),
    ("Aries", "Fire"), ("Taurus", "Earth"), ("Gemini", "Air"), ("Cancer", "Water"),
    ("Leo", "Fire"), ("Virgo", "Earth"), ("Jupiter", "Fire"), ("Libra", "Air"),
    ("Neptune", "Water"), ("Scorpio", "Water"), ("Sagittarius", "Fire"), ("Capricorn", "Earth"),
    ("Mars", "Fire"), ("Aquarius", "Air"), ("Pisces", "Water"), ("Sun", "Fire"),
    ("Pluto", "Fire"), ("Saturn", "Earth"),
)

# Reflective, never predictive; no directives outside a card reader's remit; no adult or
# fan-fiction vocabulary; no placeholders; British spelling like deck.py.
BANNED = (
    r"\byou will\b", r"\byou'll\b", r"\bwill (happen|come|arrive|bring|be)\b", r"\bdestin(y|ed)\b",
    r"\bfated?\b", r"\bguaranteed\b", r"\bsoon\b", r"\bnext (week|month|year)\b",
    r"\bwithin (days|weeks|months)\b", r"\bbad luck\b", r"\bgood luck\b", r"\bthe answer is (yes|no)\b",
    r"\bdoctor\b", r"\blawyer\b", r"\btherap", r"\bmedicat", r"\bdiagnos", r"\bsue\b",
    r"\binvest (in|your money)\b", r"\bstocks\b", r"\bstock market\b", r"\bloan\b",
    r"\bsmut", r"\bfluff", r"\bnsfw\b", r"\blemon\b", r"\bkink", r"\bfan ?fic", r"\bsex", r"\berotic",
    r"\blust", r"\bseduc", r"\bfandom\b", r"\bheadcanon\b", r"\bone-shot\b", r"\bwhump\b",
    r"\btodo\b", r"\btbd\b", r"lorem", r"\bplaceholder\b", r"\bxxx\b", r"\?\?", r"\.\.\.", r"  ",
    r"\bcolor\b", r"\bfavor\b", r"\bhonor\b", r"\brealiz", r"\brecogniz", r"\borganiz",
    r"\bcenter\b", r"\bbehavior", r"\bjudgment\b", r"\bfulfill(?!ing|ed)", r"\bpracticing\b",
    r"\bgray\b", r"\btraveler", r"\bjeweled\b", r"\bsavor", r"\bdefense\b", r"\bneighbor",
    r"\bskillful",
)
# Cards with a frightening reputation are written without fear language.
GENTLE = ("major-13", "major-15", "major-16", "swords-03", "swords-10", "pentacles-05")
FEAR = (
    r"\bfear", r"\bdoom", r"\bdisaster", r"\bcatastroph", r"\bruin", r"\bdestroy", r"\bdestruct",
    r"\bdevastat", r"\bterrible", r"\bterrif", r"\bhorr", r"\bevil\b", r"\bcurse", r"\bfatal",
    r"\bdying\b", r"\bdie\b", r"\bagony", r"\bdread", r"\bdanger", r"\bbetray", r"\bafraid",
    r"\bscar(y|ed|es)\b", r"\bpanic", r"\bnightmare", r"\bviolen", r"\bsuffer", r"\bmisery",
    r"\bdespair", r"\bpoverty", r"\bdestitut", r"\bstabb",
)


def texts(card: CardGuide) -> list[tuple[str, str]]:
    """Every reader-facing string of a card, labelled by where it lives."""
    found = [("essence", card.essence), ("figure", card.figure)]
    found += [(f"symbol {s.symbol}", s.meaning) for s in card.symbols]
    found += [(f"symbol name {s.symbol}", s.symbol) for s in card.symbols]
    for orientation in card_guide.ORIENTATIONS:
        side = card.side(orientation)
        found += [(f"{orientation}.{field}", getattr(side, field)) for field in SIDE_FIELDS]
        found += [(f"{orientation}.keyword", keyword) for keyword in side.keywords]
    for key in ("element", "astrology", "number"):
        found.append((f"correspondences.{key}", getattr(card.correspondences, key).gloss))
    found += [("question", question) for question in card.questions]
    return found


def words(value: str) -> list[str]:
    return re.findall(r"[a-z']+", value.lower())


def sentences(value: str) -> list[str]:
    return [part for part in re.split(r"(?<=[.!?])\s+", value.strip()) if part]


def test_every_deck_card_has_exactly_one_entry_in_deck_order():
    assert [card.id for card in GUIDES] == [card.id for card in DECK]
    assert len({card.id for card in GUIDES}) == 78
    assert [item["id"] for item in SOURCE] == [card.id for card in DECK]
    for card in GUIDES:
        deck_card = BY_ID[card.id]
        assert card.name == deck_card.name
        assert (card.arcana == "major") == (deck_card.suit == "major")
        assert card.suit == (None if deck_card.suit == "major" else deck_card.suit)
        if card.arcana == "minor":
            assert card.number_label == RANKS[deck_card.rank - 1]
        else:
            assert card.number_label == card_guide.ROMAN[deck_card.rank]


@pytest.mark.parametrize("card", GUIDES, ids=lambda c: c.id)
def test_upright_short_meaning_is_the_deck_sentence_so_readings_do_not_change(card):
    assert card.upright.short == BY_ID[card.id].meaning
    assert short_meaning(card.id) == BY_ID[card.id].meaning
    assert short_meaning(card.id, "upright") == guide(card.id).upright.short
    assert short_meaning(card.id, "reversed") == card.reversed.short


@pytest.mark.parametrize("card", GUIDES, ids=lambda c: c.id)
def test_lengths_counts_and_shape(card):
    assert 20 <= len(card.essence) <= 90
    assert 180 <= len(card.figure) <= 420 and 2 <= len(sentences(card.figure)) <= 4
    assert 3 <= len(card.symbols) <= 5
    assert len({symbol.symbol for symbol in card.symbols}) == len(card.symbols)
    for symbol in card.symbols:
        assert len(symbol.symbol) <= 40 and 40 <= len(symbol.meaning) <= 140
    for orientation in card_guide.ORIENTATIONS:
        side = card.side(orientation)
        assert 4 <= len(side.keywords) <= 6
        assert all(1 <= len(keyword.split()) <= 2 for keyword in side.keywords)
        assert all(keyword == keyword.lower() for keyword in side.keywords)
        assert 200 <= len(side.meaning) <= 420 and 2 <= len(sentences(side.meaning)) <= 5
        for field in ("love", "work", "self"):
            assert 60 <= len(getattr(side, field)) <= 170
        assert 50 <= len(side.advice) <= 150
    assert 30 <= len(card.reversed.short) <= 110
    assert card.reversed.short.endswith(".") and len(sentences(card.reversed.short)) == 1
    for key in ("element", "astrology", "number"):
        assert 40 <= len(getattr(card.correspondences, key).gloss) <= 130
    assert len(card.questions) == 2 and card.questions[0] != card.questions[1]
    assert all(40 <= len(q) <= 140 and q.endswith("?") for q in card.questions)


@pytest.mark.parametrize("card", GUIDES, ids=lambda c: c.id)
def test_reversed_is_its_own_text_not_the_upright_repeated(card):
    for field in SIDE_FIELDS:
        upright, reversed_ = getattr(card.upright, field), getattr(card.reversed, field)
        assert upright != reversed_
        shared = set(zip(*[words(upright)[i:] for i in range(6)], strict=False)) & set(
            zip(*[words(reversed_)[i:] for i in range(6)], strict=False)
        )
        assert not shared, f"{card.id} {field} reuses upright wording"
    assert not set(card.upright.keywords) & set(card.reversed.keywords)


@pytest.mark.parametrize("card", GUIDES, ids=lambda c: c.id)
def test_tone_bans_and_british_spelling(card):
    for label, value in texts(card):
        assert value == value.strip() and "\n" not in value
        for pattern in BANNED:
            assert not re.search(pattern, value, re.IGNORECASE), f"{card.id} {label}: {pattern}"
        if card.id in GENTLE:
            for pattern in FEAR:
                assert not re.search(pattern, value, re.IGNORECASE), f"{card.id} {label}: {pattern}"


def test_gentle_cards_are_the_ones_the_guide_promises():
    assert [BY_ID[card_id].name for card_id in GENTLE] == [
        "Death", "The Devil", "The Tower", "Three of Swords", "Ten of Swords", "Five of Pentacles",
    ]


@pytest.mark.parametrize("card", GUIDES, ids=lambda c: c.id)
def test_correspondences_follow_the_documented_tradition(card):
    element = card.correspondences.element.name
    astrology = card.correspondences.astrology.name
    number = card.correspondences.number.name
    assert element in card_guide.ELEMENT_NAMES
    assert astrology in card_guide.ASTROLOGY_NAMES
    assert number in card_guide.NUMBER_NAMES
    rank = BY_ID[card.id].rank
    if card.arcana == "major":
        assert (astrology, element) == MAJORS[rank]
        assert number == str(rank)
        return
    assert card.suit is not None
    suit_element = SUIT_ELEMENT[card.suit]
    if rank == 1:
        assert (element, astrology, number) == (suit_element, f"{suit_element} signs", "1")
    elif rank <= 10:
        assert (element, astrology, number) == (suit_element, DECANS[card.suit][rank - 2], str(rank))
    else:
        court = card.number_label
        assert number == court
        assert element == f"{COURT_PART[court]} of {suit_element}"
        expected = f"{suit_element} signs" if court == "Page" else COURT_SIGNS[card.suit][court]
        assert astrology == expected


def test_no_sentence_or_six_word_run_is_shared_between_two_cards():
    """Seventy-eight distinct cards: no suit or rank template with one word swapped."""
    runs: dict[str, set[str]] = defaultdict(set)
    whole: dict[str, set[str]] = defaultdict(set)
    for card in GUIDES:
        for label, value in texts(card):
            if "keyword" in label or label.startswith("symbol name"):
                continue
            tokens = words(value)
            for start in range(len(tokens) - 5):
                runs[" ".join(tokens[start:start + 6])].add(card.id)
            for sentence in sentences(value):
                whole[sentence.lower()].add(card.id)
    assert {run: ids for run, ids in runs.items() if len(ids) > 1} == {}
    assert {sentence: ids for sentence, ids in whole.items() if len(ids) > 1} == {}
    for field in ("essence", "figure"):
        assert len({getattr(card, field) for card in GUIDES}) == 78
    assert len({card.reversed.short for card in GUIDES}) == 78


def test_the_model_is_strict_about_shape_and_vocabulary():
    entry = json.loads(json.dumps(SOURCE[0]))
    assert CardGuide.model_validate(entry).id == "major-00"
    for change in (
        lambda e: e.update(extra="x"),
        lambda e: e["upright"].update(note="x"),
        lambda e: e["correspondences"]["element"].update(name="Aether"),
        lambda e: e["correspondences"]["astrology"].update(name="Ceres"),
        lambda e: e["reversed"].update(short=e["upright"]["short"]),
        lambda e: e["reversed"].update(keywords=e["upright"]["keywords"]),
        lambda e: e.update(questions=e["questions"][:1]),
        lambda e: e["upright"].update(keywords=["one", "two", "three"]),
        lambda e: e["upright"]["keywords"].__setitem__(0, "far too many words"),
        lambda e: e.update(suit="cups"),
        lambda e: e.update(essence="x" * 91),
    ):
        broken = json.loads(json.dumps(entry))
        change(broken)
        with pytest.raises(ValidationError):
            CardGuide.model_validate(broken)


def test_lookup_errors_are_explicit():
    with pytest.raises(KeyError):
        guide("major-22")
    with pytest.raises(ValueError):
        short_meaning("major-00", "sideways")  # type: ignore[arg-type]
    assert guide("cups-05") is guide("cups-05")


def test_importing_the_guide_does_not_load_reading_or_provider_modules():
    code = (
        "import sys; import app.games.tarot.card_guide as g; "
        "assert len(g.all_guides()) == 78; "
        "print(sorted(m for m in sys.modules if m.startswith('app.') and m != 'app'))"
    )
    result = subprocess.run(
        [sys.executable, "-c", code], cwd=ROOT / "backend", capture_output=True, text=True, check=True
    )
    loaded = result.stdout
    assert "app.games.tarot.card_guide" in loaded
    for name in ("reading", "providers", "grounded", "groq", "style", "recovery", "characters"):
        assert f"app.games.tarot.{name}" not in loaded


def test_generated_client_copy_matches_the_source():
    spec = importlib.util.spec_from_file_location(
        "export_tarot_card_guide", ROOT / "scripts/export_tarot_card_guide.py"
    )
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    module.export(check=True)
    generated = json.loads(
        (ROOT / "packages/api-client/src/generated/tarot-card-guide.json").read_text()
    )
    assert generated == [card.model_dump() for card in GUIDES] == SOURCE
