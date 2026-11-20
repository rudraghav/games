"""One free-chip wager on each independent spin of a European single-zero wheel."""

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
RED = frozenset({1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36})
OUTSIDE_BETS = {
    "red": ("Red", RED),
    "black": ("Black", frozenset(range(1, 37)) - RED),
    "odd": ("Odd", frozenset(range(1, 37, 2))),
    "even": ("Even", frozenset(range(2, 37, 2))),
    "low": ("1–18", frozenset(range(1, 19))),
    "high": ("19–36", frozenset(range(19, 37))),
}


def pocket_color(pocket: int) -> str:
    if pocket == 0:
        return "green"
    return "red" if pocket in RED else "black"


def gross_return(choice: str, stake: int, pocket: int) -> int:
    if choice in OUTSIDE_BETS:
        return 2 * stake if pocket in OUTSIDE_BETS[choice][1] else 0
    return 36 * stake if choice == str(pocket) else 0


class RouletteEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(GameManifest(
            id="roulette", name="Roulette", subtitle="Play the single-zero wheel",
            family="casino", play_mode="solo", min_players=1, max_players=1,
            minutes="2–4", icon="circle-dot", color="pine", score_label="Net chips",
            rules=[
                "Start with 100 free chips. Choose one bet and stake per spin.",
                "A single number pays 35 to 1. Red or black, odd or even, and either half pay 1 to 1.",
                "Zero is green and wins only a bet on 0. Each spin is independent.",
                "Finish above 100 after five spins to win. An empty stack ends the round early.",
            ],
        ))

    def setup(self, players: list[str], settings: dict[str, bool], seed: int | None = None) -> State:
        self.require_players(players)
        # Live matches use operating-system randomness. A test can replay the
        # same wheel; saved matches reuse these private draws across retries.
        randomizer = SystemRandom() if seed is None else Random(seed)
        return {"order": players, "turn": 0, "phase": "betting", "chips": STARTING_CHIPS,
                "_pockets": [randomizer.randrange(37) for _ in range(SPIN_LIMIT)],
                "history": [], "winners": []}

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if player not in s["order"] or s["phase"] != "betting":
            return []
        # The shared Action contract caps its integer amount at one million.
        maximum = min(s["chips"], 1_000_000)
        choices = [(name, label) for name, (label, _) in OUTSIDE_BETS.items()]
        choices.extend((str(pocket), f"Number {pocket}") for pocket in range(37))
        return [legal(label, "spin", choice=name, input="amount", minimum=1, maximum=maximum)
                for name, label in choices]

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        spin = len(s["history"]) + 1
        pocket = s["_pockets"][spin - 1]
        payout = gross_return(action.choice, action.amount, pocket)
        net = payout - action.amount
        s["chips"] += net
        s["history"].append({
            "spin": spin, "choice": action.choice, "stake": action.amount, "pocket": pocket,
            "color": pocket_color(pocket), "payout": payout, "net": net, "balance": s["chips"],
        })
        if spin == SPIN_LIMIT or s["chips"] == 0:
            s["phase"] = "finished"
            if s["chips"] > STARTING_CHIPS:
                s["winners"] = [player]
        return s

    def project_view(self, s: State, player: str) -> GameView:
        own = player in s["order"]
        playing = s["phase"] == "betting"
        remaining = SPIN_LIMIT - len(s["history"]) if playing else 0
        return GameView(
            game_id="roulette", phase=s["phase"], current_player=player if own and playing else None,
            players=[PlayerView(id=player, chips=s["chips"], score=s["chips"] - STARTING_CHIPS)]
            if own else [],
            hand=[], actions=self.legal_actions(s, player), winners=list(s["winners"]) if own else [],
            message=("Choose your bet and stake." if playing else "Round complete.") if own else "",
            detail={"spin_limit": SPIN_LIMIT, "spins_remaining": remaining,
                    "history": [dict(entry) for entry in s["history"]]} if own else {},
        )
