from dataclasses import dataclass
from itertools import combinations

from app.core.contracts import CardView

COLORS = ("pearl", "sapphire", "ruby", "emerald", "onyx")
ALL_COLORS = (*COLORS, "gold")
TEMPLATES = {
    1: [(0, (0, 1, 1, 1, 0)), (0, (0, 0, 2, 1, 1)), (0, (0, 2, 0, 2, 0)),
        (1, (1, 1, 1, 1, 1)), (0, (0, 0, 0, 3, 0)), (1, (0, 2, 2, 0, 1)),
        (0, (2, 0, 0, 0, 2)), (1, (0, 0, 4, 0, 0))],
    2: [(2, (0, 2, 3, 2, 0)), (2, (0, 0, 5, 0, 0)), (3, (0, 3, 0, 3, 2)),
        (2, (2, 2, 2, 2, 0)), (3, (0, 4, 2, 0, 2)), (2, (1, 1, 4, 1, 1))],
    3: [(4, (0, 3, 3, 5, 0)), (5, (0, 0, 7, 0, 3)),
        (4, (3, 3, 3, 3, 0)), (5, (0, 5, 0, 5, 2))],
}


@dataclass(frozen=True)
class Development:
    id: str
    tier: int
    bonus: str
    points: int
    cost: dict[str, int]

    def view(self) -> CardView:
        return CardView(id=self.id, label=f"{self.bonus.title()} {'Workshop' if self.tier == 1 else 'Guild' if self.tier == 2 else 'Palace'}",
                        value=str(self.points), color=self.bonus, suit="development",
                        subtitle=" · ".join(f"{n} {color}" for color, n in self.cost.items() if n))


CARDS = {
    f"gem-{tier}-{color}-{variant}": Development(
        id=f"gem-{tier}-{color}-{variant}", tier=tier, bonus=color, points=points,
        cost={COLORS[(index + offset) % 5]: n for offset, n in enumerate(cost) if n},
    )
    for tier, templates in TEMPLATES.items()
    for index, color in enumerate(COLORS)
    for variant, (points, cost) in enumerate(templates)
}
PATRONS = {f"patron-{i}": {color: 3 for color in colors}
           for i, colors in enumerate(combinations(COLORS, 3))}


def patron_view(ident: str) -> CardView:
    """Patrons are named by the three discounts they require, which identify them uniquely."""
    first, second, third = (color.title() for color in PATRONS[ident])
    return CardView(id=ident, label=f"Patron of {first}, {second} & {third}", value="3",
                    color="gold", suit="patron", subtitle=" · ".join(f"3 {c}" for c in PATRONS[ident]))
