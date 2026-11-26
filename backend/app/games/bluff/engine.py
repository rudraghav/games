"""Bluff (Cheat): play cards face down as one declared rank, or call the last play."""

from app.core.cards import card_view, rng, standard_deck
from app.core.contracts import (
    Action,
    BaseEngine,
    GameManifest,
    GameView,
    LegalAction,
    PlayerView,
    RuleError,
    State,
    legal,
    validate_action,
)

# Ace low to King, as the rank is written on a card (`CardView.value`).
RANK_ORDER = "A23456789TJQK"
RANK_VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
RANK_NAMES = dict(
    zip(
        RANK_VALUES,
        ["Aces", "Twos", "Threes", "Fours", "Fives", "Sixes", "Sevens", "Eights", "Nines", "Tens",
         "Jacks", "Queens", "Kings"],
        strict=True,
    )
)
MAX_PLAY = 4


def rank_value(card: str) -> str:
    return RANK_VALUES[RANK_ORDER.index(card[0])]


def hand_order(card: str) -> tuple[int, str]:
    return RANK_ORDER.index(card[0]), card[1]


class BluffEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(
            GameManifest(
                id="bluff",
                name="Bluff",
                subtitle="Shed your cards face down and call the bluffs",
                family="bluff",
                min_players=2,
                max_players=6,
                minutes="15–30",
                icon="spade",
                color="sky",
                score_label="Cards left",
                score_order="low",
                rules_version="friendly-1",
                rules=[
                    "Also known as Cheat. All 52 cards are dealt out. Be the first to get rid of yours.",
                    "Whoever starts a round plays one to four cards face down and says what rank they are. They need not tell the truth.",
                    "Each next player plays one to four cards as that same rank, passes, or calls bluff on the last play.",
                    "On a call only the last play is turned over. If every card is the declared rank the caller takes the whole pile; otherwise the player who bluffed takes it.",
                    "Whoever took the pile does not start. The other of the two starts a new round with any rank.",
                    "If everyone else passes after a play, the pile is set aside face down and the last player who played starts a new round.",
                    "Playing your last cards wins once that play stands: the next player plays or passes, or calls and finds it honest.",
                ],
            )
        )

    def setup(
        self, players: list[str], settings: dict[str, bool], seed: int | None = None
    ) -> State:
        self.require_players(players)
        cards = standard_deck()
        rng(seed).shuffle(cards)
        hands: dict[str, list[str]] = {player: [] for player in players}
        for index, card in enumerate(cards):
            hands[players[index % len(players)]].append(card)
        for hand in hands.values():
            hand.sort(key=hand_order)
        return {
            "order": list(players),
            "turn": 0,
            "phase": "playing",
            "hands": hands,
            # Face-down cards of the current round, oldest first.
            "pile": [],
            # Piles set aside after everyone passed. Never shown again.
            "discarded": [],
            "rank": None,
            "plays": [],
            "last": None,
            "passed": [],
            "reveal": None,
            "winners": [],
            "message": "Start a round: play one to four cards face down and say what rank they are.",
        }

    def _going_out(self, s: State) -> str | None:
        """The player whose last play emptied their hand and has yet to stand."""
        last = s["last"]
        return str(last["player"]) if last and not s["hands"][last["player"]] else None

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished" or player not in s["order"]:
            return []
        if player != s["order"][s["turn"]]:
            return []
        if s["phase"] == "reveal":
            return [legal("Continue", "continue")]
        hand = s["hands"][player]
        most = min(MAX_PLAY, len(hand))
        if s["rank"] is None:
            return [
                legal(f"Play as {RANK_NAMES[value]}", "play", choice=value, input="cards",
                      minimum=1, maximum=most, eligible_cards=list(hand))
                for value in RANK_VALUES
            ]
        return [
            legal(f"Play as {RANK_NAMES[s['rank']]}", "play", choice=s["rank"], input="cards",
                  minimum=1, maximum=most, eligible_cards=list(hand)),
            legal("Pass", "skip"),
            legal("Call bluff", "call_bluff"),
        ]

    def _finish(self, s: State, winner: str) -> None:
        s.update(phase="finished", winners=[winner],
                 message="Every card is gone from one hand. That player wins.")

    def _new_round(self, s: State, starter: str) -> None:
        s.update(phase="playing", rank=None, plays=[], last=None, passed=[],
                 turn=s["order"].index(starter),
                 message="Start a round: play one to four cards face down and say what rank they are.")

    def _advance(self, s: State) -> None:
        s["turn"] = (s["turn"] + 1) % len(s["order"])
        names = RANK_NAMES[s["rank"]]
        s["message"] = f"The rank is {names}. Play one to four cards as {names}, pass, or call bluff."

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        if action.type == "continue":
            reveal = s["reveal"]
            s["hands"][reveal["taker"]].extend(s["pile"])
            s["hands"][reveal["taker"]].sort(key=hand_order)
            s["pile"] = []
            if reveal["truthful"] and not s["hands"][reveal["player"]]:
                # An honest last play survived its call.
                self._finish(s, reveal["player"])
                return s
            s["reveal"] = None
            self._new_round(s, reveal["starter"])
            return s
        if action.type == "call_bluff":
            last = s["last"]
            truthful = all(rank_value(card) == s["rank"] for card in last["cards"])
            taker = player if truthful else last["player"]
            starter = last["player"] if truthful else player
            s["reveal"] = {
                "caller": player,
                "player": last["player"],
                "rank": s["rank"],
                "count": len(last["cards"]),
                "truthful": truthful,
                "taker": taker,
                "pile_count": len(s["pile"]),
                "starter": starter,
            }
            s.update(
                phase="reveal",
                turn=s["order"].index(starter),
                message="The play was honest: the caller takes the pile. Continue when everyone has seen it."
                if truthful
                else "It was a bluff: the player who bluffed takes the pile. Continue when everyone has seen it.",
            )
            return s
        hand = s["hands"][player]
        if action.type == "play":
            cards = list(action.cards)
            if (
                not 1 <= len(cards) <= MAX_PLAY
                or len(set(cards)) != len(cards)
                or not set(cards) <= set(hand)
            ):
                raise RuleError("Choose one to four of your own cards.")
        going_out = self._going_out(s)
        if going_out is not None:
            # The next player let the last play stand by playing or passing.
            self._finish(s, going_out)
            return s
        if action.type == "skip":
            s["passed"].append(player)
            if len(s["passed"]) >= len(s["order"]) - 1:
                s["discarded"].extend(s["pile"])
                s["pile"] = []
                self._new_round(s, s["last"]["player"])
            else:
                self._advance(s)
            return s
        if s["rank"] is None:
            s["rank"] = action.choice
        for card in cards:
            hand.remove(card)
        s["pile"].extend(cards)
        s["last"] = {"player": player, "cards": cards}
        s["plays"].append({"player": player, "count": len(cards)})
        s["passed"] = []
        self._advance(s)
        return s

    def project_view(self, s: State, player: str) -> GameView:
        last = s["last"]
        return GameView(
            game_id=self.manifest.id,
            phase=s["phase"],
            current_player=None if s["phase"] == "finished" else s["order"][s["turn"]],
            players=[
                PlayerView(id=p, count=len(s["hands"][p]), score=len(s["hands"][p]))
                for p in s["order"]
            ],
            hand=[card_view(card) for card in s["hands"].get(player, [])],
            # Only the play that was called, and only while its reveal is on the table.
            community=[card_view(card) for card in last["cards"]]
            if s["phase"] == "reveal" and last
            else [],
            actions=self.legal_actions(s, player),
            winners=s["winners"],
            message=s["message"],
            detail={
                "rank": s["rank"],
                "pile_count": len(s["pile"]),
                "discarded_count": len(s["discarded"]),
                "plays": [dict(play) for play in s["plays"]],
                "last_play": {"player": last["player"], "count": len(last["cards"])}
                if last
                else None,
                "passed": list(s["passed"]),
                "going_out": self._going_out(s) if s["phase"] != "finished" else None,
                "reveal": dict(s["reveal"]) if s["reveal"] else None,
            },
        )
