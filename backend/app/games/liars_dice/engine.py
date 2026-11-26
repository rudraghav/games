"""Liar's Dice: five hidden dice each, rising bids, and a call that reveals all."""

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

START_DICE = 5
FACE_NAMES = {1: "ones", 2: "twos", 3: "threes", 4: "fours", 5: "fives", 6: "sixes"}


def matching(dice: list[int], face: int, wild_ones: bool) -> int:
    """Dice that count towards a bid on `face`. A bid on ones counts only ones."""
    return sum(die == face or (wild_ones and face != 1 and die == 1) for die in dice)


def minimum_quantity(bid: dict[str, int] | None, face: int) -> int:
    """Lowest legal quantity for `face`: more of anything, or the same of a higher face."""
    if bid is None:
        return 1
    return bid["quantity"] if face > bid["face"] else bid["quantity"] + 1


class LiarsDiceEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(
            GameManifest(
                id="liars-dice",
                name="Liar’s Dice",
                subtitle="Bid on hidden dice and call the liar",
                family="dice",
                min_players=2,
                max_players=6,
                minutes="10–25",
                icon="circle-dot",
                color="plum",
                score_label="Dice left",
                rules_version="friendly-1",
                settings=[Setting(key="wild_ones", label="Ones are wild", default=True)],
                rules=[
                    "Everyone starts with five dice. Each round all dice are rolled and you see only your own.",
                    "On your turn, raise the bid or call liar. A bid names a quantity and a face: how many dice of that face are on the whole table.",
                    "A raise is a higher quantity of any face, or the same quantity of a higher face.",
                    "Call liar and every die is shown. If the bid is met, the caller loses a die; if not, the bidder loses one.",
                    "With “Ones are wild” on, ones count as any face. A bid on ones itself counts only ones.",
                    "Whoever lost the die starts the next round. A player with no dice is out; the next player still in starts instead.",
                    "The last player with dice wins.",
                ],
            )
        )

    def setup(
        self, players: list[str], settings: dict[str, bool], seed: int | None = None
    ) -> State:
        self.require_players(players)
        s: State = {
            "order": list(players),
            "turn": 0,
            "phase": "bidding",
            "round": 0,
            # Private. Each round's roll is derived from this and the round number.
            "seed": rng(seed).randrange(2**63),
            "counts": dict.fromkeys(players, START_DICE),
            "dice": {},
            "bid": None,
            "bids": [],
            "reveal": None,
            "starter": players[0],
            "out": [],
            "wild_ones": bool(settings.get("wild_ones", True)),
            "winners": [],
            "message": "",
        }
        self._roll(s)
        return s

    def _roll(self, s: State) -> None:
        s["round"] += 1
        random = Random(s["seed"] + s["round"])
        s["dice"] = {
            player: sorted(random.randint(1, 6) for _ in range(s["counts"][player]))
            for player in s["order"]
        }
        s.update(
            phase="bidding",
            bid=None,
            bids=[],
            reveal=None,
            turn=s["order"].index(s["starter"]),
            message="Open the bidding: choose a face and how many of it are on the table.",
        )

    def _total(self, s: State) -> int:
        return int(sum(s["counts"].values()))

    def _after(self, s: State, player: str) -> str:
        """The next player clockwise who still has dice."""
        index = s["order"].index(player)
        for offset in range(1, len(s["order"]) + 1):
            seat = s["order"][(index + offset) % len(s["order"])]
            if s["counts"][seat]:
                return str(seat)
        return player

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished" or player not in s["order"]:
            return []
        if player != s["order"][s["turn"]]:
            return []
        if s["phase"] == "reveal":
            return [legal("Roll the next round", "next_round")]
        total = self._total(s)
        options = [
            legal(
                f"Bid {FACE_NAMES[face]}",
                "bid",
                choice=str(face),
                input="amount",
                minimum=minimum_quantity(s["bid"], face),
                maximum=total,
            )
            for face in range(1, 7)
            if minimum_quantity(s["bid"], face) <= total
        ]
        if s["bid"] is not None:
            options.append(legal("Call liar", "call_liar"))
        return options

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        if action.type == "next_round":
            self._roll(s)
            return s
        if action.type == "bid":
            bid: dict[str, Any] = {
                "player": player, "quantity": action.amount, "face": int(action.choice),
            }
            s["bid"] = bid
            s["bids"].append(dict(bid))
            s["turn"] = s["order"].index(self._after(s, player))
            s["message"] = (
                f"The bid is {bid['quantity']} × {FACE_NAMES[bid['face']]}. Raise it or call liar."
            )
            return s
        bid = s["bid"]
        every = [die for dice in s["dice"].values() for die in dice]
        count = matching(every, bid["face"], s["wild_ones"])
        held = count >= bid["quantity"]
        loser = player if held else bid["player"]
        s["counts"][loser] -= 1
        eliminated = s["counts"][loser] == 0
        if eliminated:
            s["out"].append(loser)
        s["starter"] = loser if not eliminated else self._after(s, loser)
        s["reveal"] = {
            "caller": player,
            "bidder": bid["player"],
            "quantity": bid["quantity"],
            "face": bid["face"],
            "count": count,
            "held": held,
            "loser": loser,
            "eliminated": eliminated,
        }
        remaining = [seat for seat in s["order"] if s["counts"][seat]]
        if len(remaining) == 1:
            s.update(
                phase="finished",
                winners=remaining,
                message="Only one player still has dice. They win.",
            )
            return s
        s.update(
            phase="reveal",
            turn=s["order"].index(s["starter"]),
            message="Every die is shown. Check the count, then roll the next round.",
        )
        return s

    def project_view(self, s: State, player: str) -> GameView:
        reveal = None
        if s["reveal"] is not None:
            # Every die of the round that was just called, exactly as it was rolled.
            reveal = {**s["reveal"], "dice": {p: list(s["dice"][p]) for p in s["order"]}}
        return GameView(
            game_id=self.manifest.id,
            phase=s["phase"],
            current_player=None if s["phase"] == "finished" else s["order"][s["turn"]],
            players=[
                PlayerView(
                    id=p, count=s["counts"][p], score=s["counts"][p], eliminated=not s["counts"][p]
                )
                for p in s["order"]
            ],
            hand=[],
            actions=self.legal_actions(s, player),
            winners=s["winners"],
            message=s["message"],
            detail={
                "round": s["round"],
                # The viewer's own dice only, until a call reveals the table.
                "dice": list(s["dice"].get(player, [])),
                # Dice rolled this round: the number a bid is measured against.
                "total_dice": sum(len(dice) for dice in s["dice"].values()),
                "wild_ones": s["wild_ones"],
                "bid": dict(s["bid"]) if s["bid"] else None,
                "bids": [dict(bid) for bid in s["bids"]],
                "starter": s["starter"],
                "out": list(s["out"]),
                "reveal": reveal,
            },
        )
