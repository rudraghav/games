"""Private hands and blind table cards for the last-player-loses card game."""

from itertools import combinations

from app.core.cards import RANKS, card_view, rng, standard_deck
from app.core.contracts import (
    Action,
    BaseEngine,
    GameManifest,
    GameView,
    LegalAction,
    PlayerView,
    RuleError,
    Setting,
    State,
    legal,
    validate_action,
)


def rank(card: str) -> str:
    return card[0]


def comparison(s: State) -> str | None:
    for card in reversed(s["pile"]):
        if s["settings"]["transparent_three"] and rank(card) == "3":
            continue
        return rank(card)
    return None


def playable(s: State, card: str) -> bool:
    value = rank(card)
    top = comparison(s)
    if value in {"2", "T"} or value == "3" and s["settings"]["transparent_three"]:
        return True
    if top in {None, "2"}:
        return True
    if top == "7" and s["settings"]["seven_low"]:
        return RANKS.index(value) <= RANKS.index("7")
    return RANKS.index(value) >= RANKS.index(top)


def stage(s: State, player: str) -> str:
    if player in s["escaped"]:
        return "out"
    if s["phase"] == "setup":
        return "setup"
    if s["hands"][player]:
        return "hand"
    return "face_up" if s["face_up"][player] else "face_down"


class ShitheadEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(
            GameManifest(
                id="shithead",
                name="Shithead",
                subtitle="Clear your hand, then your table cards",
                family="palace",
                min_players=2,
                max_players=5,
                minutes="15–30",
                icon="flame",
                color="ochre",
                rules_version="palace-1",
                score_order="none",
                score_label="Result",
                settings=[
                    Setting(key="seven_low", label="7: play seven or lower next", default=False),
                    Setting(key="transparent_three", label="3: transparent card", default=False),
                ],
                rules=[
                    "2–5 players, 52 cards. Choose three face-up cards from your six-card setup hand. Three table cards stay hidden even from you.",
                    "Play one or more equal-rank cards, matching or beating the pile. Refill your hand to three while stock remains.",
                    "2 resets; 10 always burns the pile. Four consecutive equal ranks also burn. A burn gives another turn.",
                    "Or pick up the nonempty pile and end your turn. With only face-up cards, add one chosen card before picking up.",
                    "Clear your hand, then face-up cards, then flip hidden slots blindly. A failed flip joins the pile in your hand.",
                    "Every player who clears all cards escapes. Play continues until the last remaining player loses. No points.",
                    "Optional house rules: 7 asks for seven or lower; transparent 3 looks through to the previous comparison. Both start off.",
                ],
            )
        )

    def setup(
        self, players: list[str], settings: dict[str, bool], seed: int | None = None
    ) -> State:
        self.require_players(players)
        random = rng(seed)
        deck = standard_deck()
        random.shuffle(deck)
        hidden = {p: [deck.pop() for _ in range(3)] for p in players}
        hands = {p: [deck.pop() for _ in range(6)] for p in players}
        return {
            "order": list(players),
            "turn": 0,
            "phase": "setup",
            "deck": deck,
            "hands": hands,
            "face_up": {p: [] for p in players},
            "face_down": hidden,
            "pile": [],
            "burned": [],
            "escaped": [],
            "winners": [],
            "loser": None,
            "settings": {
                key: bool(settings.get(key, False)) for key in ["seven_low", "transparent_three"]
            },
            "message": "Choose three cards to keep face-up on your table.",
            "last_play": None,
        }

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished" or player != s["order"][s["turn"]]:
            return []
        if s["phase"] == "setup":
            return [
                legal(
                    "Keep selected three face-up",
                    "arrange",
                    input="cards",
                    minimum=3,
                    maximum=3,
                    eligible_cards=s["hands"][player],
                )
            ]
        source = stage(s, player)
        if source == "face_down":
            return [
                legal(f"Flip hidden card {i + 1}", "flip", slot=i)
                for i, card in enumerate(s["face_down"][player])
                if card is not None
            ]
        pool = s["hands"][player] if source == "hand" else s["face_up"][player]
        options: list[LegalAction] = []
        for value in RANKS:
            same = sorted(c for c in pool if rank(c) == value)
            if not same or not playable(s, same[0]):
                continue
            for count in range(1, len(same) + 1):
                for combo in combinations(same, count):
                    label = card_view(combo[0]).value
                    options.append(
                        legal(
                            f"Play {count} × {label}"
                            if count > 1
                            else f"Play {card_view(combo[0]).label}",
                            "play",
                            cards=list(combo),
                        )
                    )
        if s["pile"]:
            if source == "face_up":
                options.extend(
                    legal(f"Take pile with {card_view(card).label}", "pickup", card=card)
                    for card in pool
                )
            else:
                options.append(legal("Take the pile", "pickup"))
        return options

    def _next(self, s: State, player: str, repeat: bool = False) -> None:
        if not s["hands"][player] and not s["face_up"][player] and not any(s["face_down"][player]):
            s["escaped"].append(player)
        remaining = [p for p in s["order"] if p not in s["escaped"]]
        if len(remaining) == 1:
            s.update(
                phase="finished",
                loser=remaining[0],
                winners=list(s["escaped"]),
                message="All other players escaped. The last player still holding cards loses.",
            )
            return
        if repeat and player not in s["escaped"]:
            return
        for offset in range(1, len(s["order"]) + 1):
            index = (s["turn"] + offset) % len(s["order"])
            if s["order"][index] not in s["escaped"]:
                s["turn"] = index
                return

    def _open(self, s: State) -> None:
        for value in "3456789TJQKA2":
            for field in ["face_up", "hands"]:
                for index, player in enumerate(s["order"]):
                    if any(rank(card) == value for card in s[field][player]):
                        s.update(
                            phase="playing",
                            turn=index,
                            message="Play from your hand. Match or beat the pile.",
                        )
                        return

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        if action.type == "arrange":
            if (
                len(action.cards) != 3
                or len(set(action.cards)) != 3
                or not set(action.cards) <= set(s["hands"][player])
            ):
                raise RuleError("Choose exactly three different cards from your setup hand.")
            s["face_up"][player] = list(action.cards)
            s["hands"][player] = [c for c in s["hands"][player] if c not in action.cards]
            if s["turn"] == len(s["order"]) - 1:
                self._open(s)
            else:
                s["turn"] += 1
            return s
        source = stage(s, player)
        played: list[str] = []
        if action.type == "pickup":
            if source == "face_up":
                s["face_up"][player].remove(action.card)
                s["pile"].append(action.card)
            amount = len(s["pile"])
            s["hands"][player].extend(s["pile"])
            s["pile"] = []
            s["last_play"] = {"player": player, "type": "pickup", "count": amount}
            s["message"] = f"Pile taken: {amount} cards. The next player leads."
            self._next(s, player)
            return s
        if action.type == "flip":
            card = s["face_down"][player][action.slot]
            s["face_down"][player][action.slot] = None
            if not playable(s, card):
                s["pile"].append(card)
                s["hands"][player].extend(s["pile"])
                amount = len(s["pile"])
                s["pile"] = []
                s["last_play"] = {
                    "player": player,
                    "type": "failed_flip",
                    "count": amount,
                    "card": card_view(card).model_dump(),
                }
                s["message"] = (
                    f"{card_view(card).label} cannot beat the pile. All {amount} cards are taken."
                )
                self._next(s, player)
                return s
            played = [card]
        else:
            played = list(action.cards)
            pool = s["hands"][player] if source == "hand" else s["face_up"][player]
            for card in played:
                pool.remove(card)
        s["pile"].extend(played)
        if source == "hand":
            while len(s["hands"][player]) < 3 and s["deck"]:
                s["hands"][player].append(s["deck"].pop())
        burned = (
            rank(played[0]) == "T"
            or len(s["pile"]) >= 4
            and len({rank(c) for c in s["pile"][-4:]}) == 1
        )
        amount = len(s["pile"]) if burned else 0
        if burned:
            s["burned"].extend(s["pile"])
            s["pile"] = []
        s["last_play"] = {
            "player": player,
            "type": "burn" if burned else "play",
            "count": len(played),
            "burned": amount,
            "cards": [card_view(c).model_dump() for c in played],
        }
        s["message"] = f"{len(played)} card{'s' if len(played) != 1 else ''} played." + (
            f" Burned {amount}; play again." if burned else ""
        )
        self._next(s, player, repeat=burned)
        return s

    def project_view(self, s: State, player: str) -> GameView:
        top = comparison(s)
        return GameView(
            game_id=self.manifest.id,
            phase=s["phase"],
            current_player=None if s["phase"] == "finished" else s["order"][s["turn"]],
            players=[
                PlayerView(
                    id=p,
                    count=len(s["hands"][p])
                    + len(s["face_up"][p])
                    + sum(c is not None for c in s["face_down"][p]),
                    score=0,
                    cards=[card_view(c) for c in s["face_up"][p]],
                )
                for p in s["order"]
            ],
            hand=[card_view(c) for c in s["hands"].get(player, [])],
            community=[card_view(c) for c in s["pile"][-12:]],
            discard=card_view(s["pile"][-1]) if s["pile"] else None,
            draw_count=len(s["deck"]),
            actions=self.legal_actions(s, player),
            winners=s["winners"],
            message=s["message"],
            detail={
                "stages": {p: stage(s, p) for p in s["order"]},
                "hand_counts": {p: len(s["hands"][p]) for p in s["order"]},
                "hidden_slots": {p: [c is not None for c in s["face_down"][p]] for p in s["order"]},
                "pile_count": len(s["pile"]),
                "burned_count": len(s["burned"]),
                "comparison_rank": card_view(f"{top}S:0").value if top else None,
                "low_required": top == "7" and s["settings"]["seven_low"],
                "settings": s["settings"],
                "finish_order": s["escaped"],
                "loser": s["loser"],
                "last_play": s["last_play"],
            },
        )
