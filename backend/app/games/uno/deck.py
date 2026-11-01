from app.core.contracts import CardView

COLORS = ("red", "yellow", "green", "blue")
LABELS = {
    "skip": "Skip",
    "reverse": "Reverse",
    "draw2": "+2",
    "draw4": "+4",
    "discard_all": "Discard all",
    "skip_all": "Skip everyone",
    "wild": "Wild",
    "wild4": "+4",
    "reverse4": "Reverse +4",
    "wild6": "+6",
    "wild10": "+10",
    "roulette": "Colour roulette",
}


def deck(mercy: bool) -> list[str]:
    cards: list[str] = []
    for color in COLORS:
        for number in range(10):
            for copy in range(2 if mercy or number else 1):
                cards.append(f"{color}:{number}:{copy}")
        actions = (
            {"skip": 3, "reverse": 3, "draw2": 2, "draw4": 2, "discard_all": 3, "skip_all": 1}
            if mercy
            else {"skip": 2, "reverse": 2, "draw2": 2}
        )
        for kind, count in actions.items():
            cards += [f"{color}:{kind}:{i}" for i in range(count)]
    for kind in ["reverse4", "wild6", "wild10", "roulette"] if mercy else ["wild", "wild4"]:
        cards += [f"wild:{kind}:{i}" for i in range(8 if mercy else 4)]
    return cards


def view(card: str) -> CardView:
    color, kind, _ = card.split(":")
    return CardView(
        id=card,
        label=f"{color.title()} {LABELS.get(kind, kind)}",
        color=color,
        value=LABELS.get(kind, kind),
        subtitle="UNO",
    )


def penalty(card: str) -> int:
    return {"draw2": 2, "draw4": 4, "wild4": 4, "reverse4": 4, "wild6": 6, "wild10": 10}.get(
        card.split(":")[1], 0
    )


def points(card: str) -> int:
    color, kind, _ = card.split(":")
    return 50 if color == "wild" else int(kind) if kind.isdigit() else 20
