from dataclasses import dataclass

from app.core.contracts import CardView

RENTS = {
    "brown": [1, 2],
    "sky": [1, 2, 3],
    "pink": [1, 2, 4],
    "orange": [1, 3, 5],
    "red": [2, 3, 6],
    "yellow": [2, 4, 6],
    "green": [2, 4, 7],
    "blue": [3, 8],
    "rail": [1, 2, 3, 4],
    "utility": [1, 2],
}
PAIRS = [
    ("brown", "sky"),
    ("pink", "orange"),
    ("red", "yellow"),
    ("green", "blue"),
    ("rail", "utility"),
]
VALUES = {
    "brown": 1,
    "sky": 1,
    "pink": 2,
    "orange": 2,
    "red": 3,
    "yellow": 3,
    "green": 4,
    "blue": 4,
    "rail": 2,
    "utility": 2,
}
NAMES = {
    "pass_go": "Pass Go",
    "no": "Just say no",
    "debt": "Debt collector",
    "birthday": "It's my birthday",
    "sly": "Sly deal",
    "forced": "Forced deal",
    "breaker": "Deal breaker",
    "house": "House",
    "hotel": "Hotel",
    "double": "Double the rent",
    "rent": "Rent",
    "rent_double": "Double rent",
    "forced_debt": "Forced debt",
    "go_again": "Go again",
    "heist": "Heist",
    "crash": "Market crash",
    "fill": "Pass Go, Go, Go!",
    "repossession": "Repossession",
    "shack": "Shack",
    "super_sly": "Super sly deal",
    "tax": "Tax collector",
    "tough": "Tough luck",
    "unfair": "Unfair trade",
    "yoink": "Yoink!",
}


@dataclass(frozen=True)
class DealCard:
    id: str
    kind: str
    value: int
    colors: tuple[str, ...] = ()
    action: str = ""

    def view(self, orientation: str | None = None) -> CardView:
        color = orientation or (self.colors[0] if self.colors else "neutral")
        if self.kind == "money":
            return CardView(
                id=self.id,
                label=f"{self.value}M",
                value=f"{self.value}M",
                color="neutral",
                subtitle="MONEY",
            )
        name = (
            "Wild property"
            if self.kind == "property" and len(self.colors) > 1
            else color.title()
            if self.kind == "property"
            else NAMES[self.action]
        )
        return CardView(
            id=self.id,
            label=name,
            value=f"{self.value}M" if self.value else "✧",
            color=color,
            subtitle=name,
            suit="property" if self.kind == "property" else "action",
        )


def make_deck(mercy: bool) -> dict[str, DealCard]:
    cards: dict[str, DealCard] = {}

    def add(
        kind: str, value: int, count: int, colors: tuple[str, ...] = (), action: str = ""
    ) -> None:
        for _ in range(count):
            ident = f"d{len(cards):03}"
            cards[ident] = DealCard(ident, kind, value, colors, action)

    for value, count in (
        [(1, 6), (2, 4), (3, 3), (4, 2), (5, 2), (10, 1)]
        if mercy
        else [(1, 6), (2, 5), (3, 3), (4, 3), (5, 2), (10, 1)]
    ):
        add("money", value, count)
    for color, rents in RENTS.items():
        add("property", VALUES[color], len(rents), (color,))
    for colors, count in [
        (PAIRS[0], 1),
        (PAIRS[1], 2),
        (PAIRS[2], 2),
        (PAIRS[3], 1),
        (("sky", "rail"), 1),
        (("green", "rail"), 1),
        (PAIRS[4], 1),
    ]:
        add("property", max(VALUES[c] for c in colors), count, colors)
    add("property", 0, 2, tuple(RENTS))
    for colors in PAIRS:
        add("action", 1, 1 if mercy else 2, colors, "rent")
        if mercy:
            add("action", 1, 1, colors, "rent_double")
    add("action", 3, 3, tuple(RENTS), "rent")
    if mercy:
        add("action", 3, 3, tuple(RENTS), "rent_double")
        specs = [
            ("breaker", 5, 3),
            ("forced_debt", 3, 3),
            ("go_again", 1, 3),
            ("heist", 3, 3),
            ("no", 4, 5),
            ("crash", 3, 3),
            ("fill", 2, 4),
            ("repossession", 4, 2),
            ("shack", 3, 3),
            ("super_sly", 5, 3),
            ("tax", 4, 2),
            ("tough", 5, 3),
            ("unfair", 4, 2),
            ("yoink", 5, 3),
        ]
    else:
        specs = [
            ("pass_go", 1, 10),
            ("no", 4, 3),
            ("debt", 3, 3),
            ("birthday", 2, 3),
            ("sly", 3, 3),
            ("forced", 3, 3),
            ("breaker", 5, 2),
            ("house", 3, 3),
            ("hotel", 4, 2),
            ("double", 1, 2),
        ]
    for name, value, count in specs:
        add("action", value, count, action=name)
    return cards
