from collections import Counter
from itertools import product
from math import prod
from random import Random, SystemRandom

from app.core.contracts import (
    Action,
    BaseEngine,
    GameManifest,
    GameView,
    LegalAction,
    PlayerView,
    State,
    legal,
    validate_action,
)

STARTING_CHIPS = 100
SPIN_LIMIT = 5
MAX_STAKE = 10

# Three independently indexed circular strips. Each listed stop is equally likely.
REELS = (
    ("cherry", "lemon", "star", "cherry", "bell", "lemon",
     "cherry", "seven", "bell", "lemon", "star", "cherry"),
    ("bell", "cherry", "lemon", "star", "cherry", "seven",
     "lemon", "cherry", "bell", "star", "cherry", "lemon"),
    ("star", "lemon", "cherry", "bell", "cherry", "lemon",
     "seven", "cherry", "star", "lemon", "cherry", "bell"),
)
AWARDS = {
    "triple_seven": ("Three sevens", 100),
    "triple_star": ("Three stars", 15),
    "triple_bell": ("Three bells", 12),
    "triple_lemon": ("Three lemons", 8),
    "triple_cherry": ("Three cherries", 5),
    "two_cherries": ("Exactly two cherries", 2),
    "miss": ("All other lines", 0),
}


def classify(line: tuple[str, ...]) -> str:
    if line[0] == line[1] == line[2]:
        return f"triple_{line[0]}"
    return "two_cherries" if line.count("cherry") == 2 else "miss"


# Derive the advertised odds from the same three strips used for play.
WAYS = Counter(classify(line) for line in product(*REELS))
TOTAL_OUTCOMES = prod(map(len, REELS))
RETURN_NUMERATOR = sum(ways * AWARDS[result][1] for result, ways in WAYS.items())


class SlotsEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(
            GameManifest(
                id="slots", name="Slots", subtitle="Spin three reels on one payline",
                family="casino", play_mode="solo", score_label="Net chips",
                min_players=1, max_players=1, minutes="1–3", icon="cherry", color="coral",
                rules=[
                    "Start with 100 free chips. Stake 1–10 chips on each of five spins.",
                    "Read the middle line. Three matching symbols or exactly two cherries pay.",
                    "Multiply your stake by the listed return. It includes the stake.",
                    "Finish above 100 chips to win. A new match starts with 100 chips.",
                ],
            )
        )

    def setup(self, players: list[str], settings: dict[str, bool], seed: int | None = None) -> State:
        self.require_players(players)
        randomizer = SystemRandom() if seed is None else Random(seed)
        return {
            "order": list(players), "turn": 0, "phase": "spinning", "winners": [],
            "chips": STARTING_CHIPS, "history": [],
            # Only the server reads these stops. The stake cannot influence a spin.
            "_stops": [[randomizer.randrange(len(reel)) for reel in REELS] for _ in range(SPIN_LIMIT)],
        }

    def legal_actions(self, state: State, player: str) -> list[LegalAction]:
        if player not in state["order"] or state["phase"] != "spinning" or state["chips"] < 1:
            return []
        return [legal("Spin", "spin", input="amount", minimum=1, maximum=min(MAX_STAKE, state["chips"]))]

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        line = tuple(reel[stop] for reel, stop in zip(REELS, s["_stops"].pop(0), strict=True))
        result = classify(line)
        multiplier = AWARDS[result][1]
        payout = action.amount * multiplier
        net = payout - action.amount
        s["chips"] += net
        s["history"].append({
            "spin": len(s["history"]) + 1, "stake": action.amount, "reels": list(line),
            "result": result, "multiplier": multiplier, "payout": payout,
            "net": net, "balance": s["chips"],
        })
        if len(s["history"]) == SPIN_LIMIT or s["chips"] == 0:
            s["phase"] = "finished"
            s["winners"] = [player] if s["chips"] > STARTING_CHIPS else []
        return s

    def project_view(self, state: State, player: str) -> GameView:
        owner = state["order"][0]
        if player != owner:
            return GameView(game_id="slots", phase=state["phase"], current_player=None,
                            players=[], hand=[])
        net = state["chips"] - STARTING_CHIPS
        finished = state["phase"] == "finished"
        return GameView(
            game_id="slots", phase=state["phase"], current_player=None if finished else owner,
            players=[PlayerView(id=owner, chips=state["chips"], score=net)], hand=[],
            actions=self.legal_actions(state, player), winners=state["winners"],
            message="Session complete." if finished else "Choose your stake and spin.",
            detail={
                "chips": state["chips"], "starting_chips": STARTING_CHIPS, "spin_limit": SPIN_LIMIT,
                "spins_remaining": 0 if finished else SPIN_LIMIT - len(state["history"]),
                "history": state["history"],
                "paytable": [
                    {"result": result, "label": label, "multiplier": multiplier, "ways": WAYS[result]}
                    for result, (label, multiplier) in AWARDS.items()
                ],
                "total_outcomes": TOTAL_OUTCOMES, "winning_outcomes": TOTAL_OUTCOMES - WAYS["miss"],
                "return_numerator": RETURN_NUMERATOR,
            },
        )
