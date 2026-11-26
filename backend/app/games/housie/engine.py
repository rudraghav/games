"""Housie (Tambola): private tickets, a hidden call order and claimed prizes."""

from random import Random
from typing import Any

from app.core.cards import rng
from app.core.contracts import (
    Action,
    BaseEngine,
    GameManifest,
    GameView,
    LegalAction,
    PlayerView,
    Setting,
    State,
    legal,
    validate_action,
)

# Key, label, points. The order is the order prizes are listed and claimed in.
PRIZES: list[tuple[str, str, int]] = [
    ("early_five", "Early five", 1),
    ("top_line", "Top line", 2),
    ("middle_line", "Middle line", 2),
    ("bottom_line", "Bottom line", 2),
    ("full_house", "Full house", 5),
]
LABEL = {key: label for key, label, _ in PRIZES}
POINTS = {key: points for key, _, points in PRIZES}
LINES = {"top_line": 0, "middle_line": 1, "bottom_line": 2}
# Column c holds numbers from its decade: 1-9, 10-19, ..., 70-79, 80-90.
COLUMNS = [range(1, 10), *(range(low, low + 10) for low in range(10, 80, 10)), range(80, 91)]
NUMBERS = 90


def make_ticket(random: Random) -> list[list[int]]:
    """Three rows of nine cells; 0 is a blank. Five numbers a row, 1-3 a column."""
    while True:
        counts = [1] * 9
        for _ in range(6):
            counts[random.choice([c for c in range(9) if counts[c] < 3])] += 1
        need = [5, 5, 5]
        grid = [[0] * 9 for _ in range(3)]
        fits = True
        # Fullest columns first, each into the rows that still need the most.
        for column in sorted(range(9), key=lambda c: (-counts[c], random.random())):
            rows = sorted(range(3), key=lambda r: (-need[r], random.random()))[: counts[column]]
            if any(need[row] == 0 for row in rows):
                fits = False
                break
            numbers = sorted(random.sample(COLUMNS[column], counts[column]))
            for row, number in zip(sorted(rows), numbers, strict=True):
                grid[row][column] = number
                need[row] -= 1
        if fits and need == [0, 0, 0]:
            return grid


def ticket_numbers(ticket: list[list[int]]) -> list[int]:
    return [number for row in ticket for number in row if number]


def satisfied(ticket: list[list[int]], marked: set[int], prize: str) -> bool:
    if prize == "early_five":
        return len(marked.intersection(ticket_numbers(ticket))) >= 5
    if prize == "full_house":
        return marked.issuperset(ticket_numbers(ticket))
    return marked.issuperset(number for number in ticket[LINES[prize]] if number)


class HousieEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(
            GameManifest(
                id="housie",
                name="Housie",
                subtitle="Mark your ticket and claim the prizes",
                family="housie",
                min_players=2,
                max_players=10,
                minutes="10–25",
                icon="grid",
                color="ochre",
                rules_version="friendly-1",
                settings=[
                    Setting(key="auto_mark", label="Mark called numbers for me", default=True),
                ],
                rules=[
                    "Also known as Tambola. Everyone holds one ticket: three rows of nine, fifteen numbers, five in each row.",
                    "Numbers 1 to 90 are called one at a time and never repeat. Players take turns calling the next number.",
                    "Mark called numbers on your ticket. With “Mark called numbers for me” on, your ticket is marked for you.",
                    "Claim a prize when your marked numbers complete it: Early five (any five), Top line, Middle line, Bottom line, Full house (all fifteen).",
                    "Each prize is won once, by the first claim. Anyone else who claims it before the next number is called shares it, and each sharer scores it in full.",
                    "A prize nobody has won can still be claimed on any later call.",
                    "Early five scores 1, each line 2 and Full house 5. Full house ends the match; every ticket complete on that call shares it.",
                    "Most points wins. Equal highest scores share the win.",
                ],
            )
        )

    def setup(
        self, players: list[str], settings: dict[str, bool], seed: int | None = None
    ) -> State:
        self.require_players(players)
        random = rng(seed)
        tickets = {player: make_ticket(random) for player in players}
        bag = list(range(1, NUMBERS + 1))
        random.shuffle(bag)
        return {
            "order": list(players),
            "turn": 0,
            "phase": "calling",
            # The call order. Numbers leave from the end; it never reaches a view.
            "bag": bag,
            "called": [],
            "tickets": tickets,
            "marks": {player: [] for player in players},
            "auto_mark": bool(settings.get("auto_mark", True)),
            "prizes": {key: {"winners": [], "call": None} for key, _, _ in PRIZES},
            "scores": dict.fromkeys(players, 0),
            "winners": [],
        }

    def _open(self, s: State, prize: str, player: str) -> bool:
        """Unwon, or won on the current call by somebody else (a shared prize)."""
        won = s["prizes"][prize]
        if not won["winners"]:
            return True
        return won["call"] == len(s["called"]) and player not in won["winners"]

    def _claimable(self, s: State, player: str) -> list[str]:
        marked = set(s["marks"][player])
        ticket = s["tickets"][player]
        return [
            key
            for key, _, _ in PRIZES
            if self._open(s, key, player) and satisfied(ticket, marked, key)
        ]

    def _unmarked(self, s: State, player: str) -> list[int]:
        own = set(ticket_numbers(s["tickets"][player]))
        marked = set(s["marks"][player])
        return [number for number in s["called"] if number in own and number not in marked]

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished" or player not in s["order"]:
            return []
        options: list[LegalAction] = []
        if s["phase"] == "calling" and player == s["order"][s["turn"]]:
            options.append(legal("Call the next number", "call_number"))
        options.extend(
            legal(f"Mark {number}", "mark", amount=number) for number in self._unmarked(s, player)
        )
        options.extend(
            legal(f"Claim {LABEL[key]}", "claim", choice=key) for key in self._claimable(s, player)
        )
        return options

    def _award(self, s: State, prize: str, player: str) -> None:
        won = s["prizes"][prize]
        if not won["winners"]:
            won["call"] = len(s["called"])
        won["winners"].append(player)
        s["scores"][player] += POINTS[prize]

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        if action.type == "call_number":
            number = s["bag"].pop()
            s["called"].append(number)
            if s["auto_mark"]:
                for seat in s["order"]:
                    if number in ticket_numbers(s["tickets"][seat]):
                        s["marks"][seat].append(number)
            if s["bag"]:
                s["turn"] = (s["turn"] + 1) % len(s["order"])
            else:
                # Every number is out. Calling stops; the last claims finish the match.
                s["phase"] = "final_claims"
        elif action.type == "mark":
            s["marks"][player].append(action.amount)
        else:
            self._award(s, action.choice, player)
            if action.choice == "full_house":
                # The match ends here, so the same-call share is settled at once:
                # every other ticket whose fifteen numbers are all out shares it.
                called = set(s["called"])
                for seat in s["order"]:
                    if seat != player and satisfied(s["tickets"][seat], called, "full_house"):
                        self._award(s, "full_house", seat)
                best = max(s["scores"].values())
                s["phase"] = "finished"
                s["winners"] = [seat for seat in s["order"] if s["scores"][seat] == best]
        return s

    def _message(self, s: State, player: str) -> str:
        if s["phase"] == "finished":
            return "Full house! The match is over. Most points wins."
        if player not in s["order"]:
            return ""
        claims = [LABEL[key] for key in self._claimable(s, player)]
        if claims:
            return f"You can claim {', '.join(claims)}."
        unmarked = self._unmarked(s, player)
        if unmarked:
            return f"Mark {', '.join(str(number) for number in unmarked)} on your ticket."
        if s["phase"] == "final_claims":
            return "All 90 numbers are out. Waiting for the Full house claim."
        if player == s["order"][s["turn"]]:
            return "Call the next number."
        return "Wait for the next number."

    def project_view(self, s: State, player: str) -> GameView:
        seated = player in s["order"]
        claimable: list[Any] = (
            list(self._claimable(s, player)) if seated and s["phase"] != "finished" else []
        )
        return GameView(
            game_id=self.manifest.id,
            phase=s["phase"],
            current_player=None if s["phase"] == "finished" else s["order"][s["turn"]],
            players=[
                PlayerView(id=p, count=len(s["marks"][p]), score=s["scores"][p])
                for p in s["order"]
            ],
            hand=[],
            draw_count=len(s["bag"]),
            actions=self.legal_actions(s, player),
            winners=s["winners"],
            message=self._message(s, player),
            detail={
                # Only the viewer's own ticket; other tickets are never sent.
                "ticket": [[number or None for number in row] for row in s["tickets"][player]]
                if seated
                else [],
                "marked": sorted(s["marks"][player]) if seated else [],
                "called": list(s["called"]),
                "last_called": s["called"][-1] if s["called"] else None,
                "auto_mark": s["auto_mark"],
                "prizes": [
                    {
                        "key": key,
                        "label": label,
                        "points": points,
                        "winners": list(s["prizes"][key]["winners"]),
                        "won_on_call": s["prizes"][key]["call"],
                    }
                    for key, label, points in PRIZES
                ],
                "claimable": claimable,
            },
        )
