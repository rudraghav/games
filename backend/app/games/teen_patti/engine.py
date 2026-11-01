from app.core.cards import card_view, draw, rng, standard_deck, teen_rank
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


class TeenPattiEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(
            GameManifest(
                id="teen-patti",
                name="Teen Patti",
                subtitle="Three cards. Endless possibilities.",
                family="casino",
                score_label="Net chips",
                min_players=2,
                max_players=6,
                minutes="15–30",
                icon="diamond",
                color="plum",
                settings=[Setting(key="sideshows", label="Allow sideshows", default=True)],
                rules=[
                    "Play blind or look at your three cards and play seen.",
                    "Trail beats sequence, colour, pair and high card.",
                    "Free chips only. Boot 1; base stake cap 64; pot cap 1024.",
                ],
            )
        )

    def setup(
        self, players: list[str], settings: dict[str, bool], seed: int | None = None
    ) -> State:
        self.require_players(players)
        cards = standard_deck()
        rng(seed).shuffle(cards)
        s: State = {
            "phase": "playing",
            "order": players,
            "turn": 0,
            "deck": cards,
            "stake": 1,
            "pot": len(players),
            "players": {
                p: {"cards": [], "chips": 199, "seen": False, "folded": False} for p in players
            },
            "settings": settings,
            "pending": None,
            "shown": [],
            "winners": [],
            "message": "The boot is in. Play blind or see your cards.",
        }
        for p in players:
            s["players"][p]["cards"] = draw(s, 3)
        return s

    def _active(self, s: State) -> list[str]:
        return [p for p in s["order"] if not s["players"][p]["folded"]]

    def _previous(self, s: State, player: str) -> str:
        active = self._active(s)
        return active[(active.index(player) - 1) % len(active)]

    def _advance(self, s: State) -> None:
        s["turn"] = (s["turn"] + 1) % len(s["order"])
        while s["players"][s["order"][s["turn"]]]["folded"]:
            s["turn"] = (s["turn"] + 1) % len(s["order"])

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished":
            return []
        if s["pending"]:
            return (
                [legal("Accept sideshow", "accept"), legal("Decline sideshow", "decline")]
                if s["pending"]["target"] == player
                else []
            )
        if s["order"][s["turn"]] != player:
            return []
        p = s["players"][player]
        minimum = s["stake"] * (2 if p["seen"] else 1)
        actions = [legal("Pack / fold", "fold")]
        if not p["seen"]:
            actions.append(legal("See my cards", "peek"))
        if p["chips"] >= minimum:
            actions.append(
                legal(
                    "Play chips",
                    "bet",
                    input="amount",
                    minimum=minimum,
                    maximum=min(minimum * 2, 128 if p["seen"] else 64, p["chips"]),
                    step=2 if p["seen"] else 1,
                )
            )
            active = self._active(s)
            other = next((q for q in active if q != player), None)
            if len(active) == 2 and (not p["seen"] or s["players"][other]["seen"]):
                actions.append(legal(f"Show · {minimum}", "show"))
            if (
                len(active) > 2
                and p["seen"]
                and s["players"][self._previous(s, player)]["seen"]
                and s["settings"].get("sideshows", True)
            ):
                actions.append(legal(f"Request sideshow · {minimum}", "sideshow"))
        return actions

    def _pay(self, s: State, player: str, amount: int) -> None:
        s["players"][player]["chips"] -= amount
        s["pot"] += amount

    def _finish(self, s: State, showdown: bool) -> None:
        active = self._active(s)
        if showdown:
            best = max(teen_rank(s["players"][p]["cards"]) for p in active)
            winners = [p for p in active if teen_rank(s["players"][p]["cards"]) == best]
            s["shown"] = active
        else:
            winners = active
        for i, p in enumerate(winners):
            s["players"][p]["chips"] += s["pot"] // len(winners) + (i < s["pot"] % len(winners))
        s["phase"], s["winners"] = "finished", winners
        s["message"] = "The pot is settled."

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        p = s["players"][player]
        if action.type == "peek":
            p["seen"] = True
            return s
        if action.type in ("accept", "decline"):
            pending = s["pending"]
            if action.type == "accept":
                requester = pending["actor"]
                loser = (
                    requester
                    if teen_rank(s["players"][requester]["cards"]) <= teen_rank(p["cards"])
                    else player
                )
                s["players"][loser]["folded"] = True
            s["pending"] = None
        elif action.type == "fold":
            p["folded"] = True
        elif action.type == "bet":
            minimum = s["stake"] * (2 if p["seen"] else 1)
            if p["seen"] and action.amount % 2:
                raise RuleError("Seen stakes must be an even number of chips.")
            if action.amount < minimum:
                raise RuleError("The stake has increased.")
            self._pay(s, player, action.amount)
            s["stake"] = action.amount // (2 if p["seen"] else 1)
        else:
            self._pay(s, player, s["stake"] * (2 if p["seen"] else 1))
            if action.type == "sideshow":
                if s["pot"] >= 1024:
                    self._finish(s, True)
                    return s
                s["pending"] = {"actor": player, "target": self._previous(s, player)}
                return s
            active = self._active(s)
            other = next(q for q in active if q != player)
            loser = (
                player
                if teen_rank(p["cards"]) <= teen_rank(s["players"][other]["cards"])
                else other
            )
            s["shown"] = [player, other]
            s["players"][loser]["folded"] = True
        if len(self._active(s)) == 1:
            self._finish(s, False)
        elif s["pot"] >= 1024:
            self._finish(s, True)
        else:
            self._advance(s)
        return s

    def project_view(self, s: State, player: str) -> GameView:
        own = s["players"].get(player)
        return GameView(
            game_id="teen-patti",
            phase=s["phase"],
            current_player=s["pending"]["target"] if s["pending"] else s["order"][s["turn"]],
            players=[
                PlayerView(
                    id=p,
                    count=3,
                    chips=v["chips"],
                    score=v["chips"] - 200,
                    folded=v["folded"],
                    cards=[card_view(c) for c in v["cards"]] if p in s["shown"] else [],
                )
                for p, v in s["players"].items()
            ],
            hand=[card_view(c) for c in own["cards"]]
            if own and (own["seen"] or player in s["shown"])
            else [],
            pot=s["pot"],
            actions=self.legal_actions(s, player),
            winners=s["winners"],
            message=s["message"],
            detail={"stake": s["stake"], "blind": bool(own and not own["seen"])},
        )
