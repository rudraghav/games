"""Factual58-card base inventory; original IDs/presentation, not publisher assets."""

from collections import Counter
from dataclasses import dataclass

from app.core.contracts import CardView

INVENTORY = {
    "crab": {"navy": 2, "turquoise": 2, "black": 1, "yellow": 2, "green": 1, "gray": 1},
    "boat": {"navy": 2, "turquoise": 2, "black": 2, "yellow": 2},
    "fish": {"navy": 2, "turquoise": 1, "black": 2, "yellow": 1, "green": 1},
    "swimmer": {"navy": 1, "turquoise": 1, "black": 1, "yellow": 1, "peach": 1},
    "shark": {"navy": 1, "turquoise": 1, "black": 1, "green": 1, "purple": 1},
    "mermaid": {"white": 4},
    "shell": {"navy": 1, "turquoise": 1, "black": 1, "yellow": 1, "green": 1, "gray": 1},
    "octopus": {"turquoise": 1, "yellow": 1, "green": 1, "purple": 1, "gray": 1},
    "penguin": {"purple": 1, "peach": 1, "pink": 1},
    "sailor": {"pink": 1, "orange": 1},
    "lighthouse": {"purple": 1},
    "shoal": {"gray": 1},
    "penguin-colony": {"green": 1},
    "captain": {"peach": 1},
}
NAMES = {kind: kind.replace("-", " ").title() for kind in INVENTORY}
NAMES.update({"shoal": "Shoal of fish"})
DESCRIPTIONS = {
    "crab": "Pair · Search a discard pile", "boat": "Pair · Take another turn",
    "fish": "Pair · Draw a card", "swimmer": "With shark · Steal a card",
    "shark": "With swimmer · Steal a card", "mermaid": "Score a different color group",
    "shell": "Collection · 0 / 2 / 4 / 6 / 8 / 10",
    "octopus": "Collection · 0 / 3 / 6 / 9 / 12", "penguin": "Collection · 1 / 3 / 5",
    "sailor": "Collection · 0 / 5", "lighthouse": "+1 per boat", "shoal": "+1 per fish",
    "penguin-colony": "+2 per penguin", "captain": "+3 per sailor",
}


@dataclass(frozen=True)
class PaperCard:
    id: str
    kind: str
    color: str

    def view(self) -> CardView:
        return CardView(id=self.id, label=f"{NAMES[self.kind]} · {self.color.title()}",
                        value=NAMES[self.kind], suit=self.kind, color=self.color,
                        subtitle=DESCRIPTIONS[self.kind])


CARDS = [PaperCard(f"paper-{kind}-{color}-{n}", kind, color)
         for kind, colors in INVENTORY.items() for color, count in colors.items() for n in range(count)]
BY_ID = {card.id: card for card in CARDS}


def card_points(cards: list[str]) -> int:
    kinds = Counter(BY_ID[c].kind for c in cards)
    colors = sorted(Counter(BY_ID[c].color for c in cards).values(), reverse=True)
    points = sum(kinds[kind] // 2 for kind in ("crab", "boat", "fish"))
    points += min(kinds["swimmer"], kinds["shark"])
    points += max(0, 2 * (kinds["shell"] - 1)) + max(0, 3 * (kinds["octopus"] - 1))
    points += max(0, 2 * kinds["penguin"] - 1) + (5 if kinds["sailor"] == 2 else 0)
    points += sum(colors[:kinds["mermaid"]])
    for multiplier, kind, factor in (("lighthouse", "boat", 1), ("shoal", "fish", 1),
                                     ("penguin-colony", "penguin", 2), ("captain", "sailor", 3)):
        points += kinds[multiplier] * kinds[kind] * factor
    return points


def color_bonus(cards: list[str]) -> int:
    return max(Counter(BY_ID[c].color for c in cards).values(), default=0)
