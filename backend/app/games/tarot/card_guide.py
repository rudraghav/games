"""The card guide: original reference text for all 78 cards, upright and reversed.

`card-guide.json` is the source of truth (see CARD_GUIDE.md). This module only
loads and validates it. It deliberately imports nothing from the reading or
provider modules, so the guide can be used by the engine, exports and tests
without loading a model client.
"""

import json
import re
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator

Orientation = Literal["upright", "reversed"]
ORIENTATIONS: tuple[Orientation, ...] = ("upright", "reversed")
SUITS = ("wands", "cups", "swords", "pentacles")
RANK_LABELS = (
    "Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Page", "Knight", "Queen", "King",
)
ROMAN = (
    "0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII",
    "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI",
)

# Correspondence vocabularies (tradition and choices are documented in CARD_GUIDE.md).
ELEMENTS = ("Fire", "Water", "Air", "Earth")
COURT_ELEMENTS = tuple(f"{part} of {suit}" for suit in ELEMENTS for part in ELEMENTS)
SIGNS = (
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius",
    "Capricorn", "Aquarius", "Pisces",
)
CLASSICAL_PLANETS = ("Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn")
MODERN_PLANETS = ("Uranus", "Neptune", "Pluto")
DECANS = tuple(f"{planet} in {sign}" for sign in SIGNS for planet in CLASSICAL_PLANETS)
ELEMENT_SIGNS = tuple(f"{element} signs" for element in ELEMENTS)
ELEMENT_NAMES = frozenset(ELEMENTS + COURT_ELEMENTS)
ASTROLOGY_NAMES = frozenset(SIGNS + CLASSICAL_PLANETS + MODERN_PLANETS + DECANS + ELEMENT_SIGNS)
NUMBER_NAMES = frozenset([str(n) for n in range(22)] + ["Page", "Knight", "Queen", "King"])

_STRICT = ConfigDict(extra="forbid", frozen=True, str_strip_whitespace=False)


Keyword = Annotated[str, StringConstraints(min_length=3, max_length=28, pattern=r"^\S+( \S+)?$")]
Sentence = Annotated[str, StringConstraints(min_length=60, max_length=170)]
Gloss = Annotated[str, StringConstraints(min_length=40, max_length=130)]
Question = Annotated[str, StringConstraints(min_length=40, max_length=140, pattern=r"\?$")]


class Symbol(BaseModel):
    model_config = _STRICT
    symbol: Annotated[str, StringConstraints(min_length=3, max_length=40)]
    meaning: Annotated[str, StringConstraints(min_length=40, max_length=140)]


class Side(BaseModel):
    """One orientation of a card. `short` is the one-line meaning used in a spread."""

    model_config = _STRICT
    short: Annotated[str, StringConstraints(min_length=30, max_length=120)]
    keywords: Annotated[list[Keyword], Field(min_length=4, max_length=6)]
    meaning: Annotated[str, StringConstraints(min_length=200, max_length=420)]
    love: Sentence
    work: Sentence
    self: Sentence
    advice: Annotated[str, StringConstraints(min_length=50, max_length=150)]


class Correspondence(BaseModel):
    model_config = _STRICT
    name: Annotated[str, StringConstraints(min_length=1, max_length=30)]
    gloss: Gloss


class Correspondences(BaseModel):
    model_config = _STRICT
    element: Correspondence
    astrology: Correspondence
    number: Correspondence

    @model_validator(mode="after")
    def _known_names(self) -> "Correspondences":
        if self.element.name not in ELEMENT_NAMES:
            raise ValueError(f"unknown element {self.element.name!r}")
        if self.astrology.name not in ASTROLOGY_NAMES:
            raise ValueError(f"unknown astrological attribution {self.astrology.name!r}")
        if self.number.name not in NUMBER_NAMES:
            raise ValueError(f"unknown number {self.number.name!r}")
        return self


class CardGuide(BaseModel):
    model_config = _STRICT
    id: Annotated[str, StringConstraints(pattern=r"^(major-\d{2}|(wands|cups|swords|pentacles)-\d{2})$")]
    name: Annotated[str, StringConstraints(min_length=3, max_length=40)]
    arcana: Literal["major", "minor"]
    suit: Literal["wands", "cups", "swords", "pentacles"] | None
    number_label: Annotated[str, StringConstraints(min_length=1, max_length=8)]
    essence: Annotated[str, StringConstraints(min_length=20, max_length=90)]
    figure: Annotated[str, StringConstraints(min_length=180, max_length=420)]
    symbols: Annotated[list[Symbol], Field(min_length=3, max_length=5)]
    upright: Side
    reversed: Side
    correspondences: Correspondences
    questions: Annotated[list[Question], Field(min_length=2, max_length=2)]

    @model_validator(mode="after")
    def _consistent(self) -> "CardGuide":
        prefix, number = self.id.split("-")
        rank = int(number)
        expected: tuple[str, str | None, str]
        if prefix == "major":
            expected = ("major", None, ROMAN[rank] if rank < len(ROMAN) else "")
        else:
            label = RANK_LABELS[rank - 1] if 1 <= rank <= len(RANK_LABELS) else ""
            expected = ("minor", prefix, label)
        if (self.arcana, self.suit, self.number_label) != expected:
            raise ValueError(f"{self.id}: arcana, suit and number_label must match the id")
        if len(self.reversed.short) > 110:
            raise ValueError(f"{self.id}: the reversed short meaning is limited to 110 characters")
        for field in ("short", "meaning", "love", "work", "self", "advice"):
            if _plain(getattr(self.upright, field)) == _plain(getattr(self.reversed, field)):
                raise ValueError(f"{self.id}: reversed {field} repeats the upright text")
        if len(set(self.upright.keywords)) != len(self.upright.keywords) or len(
            set(self.reversed.keywords)
        ) != len(self.reversed.keywords):
            raise ValueError(f"{self.id}: keywords must not repeat")
        if set(self.upright.keywords) & set(self.reversed.keywords):
            raise ValueError(f"{self.id}: an orientation needs its own keywords")
        return self

    def side(self, orientation: Orientation = "upright") -> Side:
        return self.reversed if orientation == "reversed" else self.upright


def _plain(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()


GUIDE_PATH = Path(__file__).with_name("card-guide.json")


@lru_cache(maxsize=1)
def _guides() -> dict[str, CardGuide]:
    cards = [CardGuide.model_validate(item) for item in json.loads(GUIDE_PATH.read_text())]
    by_id = {card.id: card for card in cards}
    if len(by_id) != len(cards):
        raise ValueError("The card guide lists a card more than once.")
    return by_id


def all_guides() -> tuple[CardGuide, ...]:
    """Every guide entry in the file's order (the deck's canonical order)."""
    return tuple(_guides().values())


def guide(card_id: str) -> CardGuide:
    """The full guide entry for one card id, for example `major-02` or `cups-05`."""
    try:
        return _guides()[card_id]
    except KeyError:
        raise KeyError(f"No card guide entry for {card_id!r}.") from None


def short_meaning(card_id: str, orientation: Orientation = "upright") -> str:
    """The one-line meaning for a drawn card in the given orientation."""
    if orientation not in ORIENTATIONS:
        raise ValueError(f"Unknown orientation {orientation!r}.")
    return guide(card_id).side(orientation).short
