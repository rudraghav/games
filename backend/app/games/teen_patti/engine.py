from pydantic import JsonValue

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
from app.core.poker_explanation import explain_teen_hand, teen_comparison


class TeenPattiEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(
            GameManifest(
                id="teen-patti",
                name="Teen Patti",
                subtitle="Three-card blind and seen poker",
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
            # Public table record: chips each seat has put in, why a seat is out,
            # the latest sideshow response and how the hand ended.
            "paid": {p: 1 for p in players},
            "out": {},
            "sideshow_result": None,
            "finish": None,
            "message": "",
        }
        for p in players:
            s["players"][p]["cards"] = draw(s, 3)
        s["message"] = self._prompt(s)
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
                    "Chaal" if p["seen"] else "Blind bet",
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

    def _prompt(self, s: State) -> str:
        """The instruction for the seat that can act, or how the hand ended.

        Only the player who can act sees the in-play line; the closing line is
        shown to everyone and names hand categories, never players.
        """
        if s["phase"] == "finished":
            reason = s.get("finish")
            if reason == "packed" or not s["shown"]:
                return "Everyone else packed."
            ranks = sorted((teen_rank(s["players"][p]["cards"]) for p in s["shown"]), reverse=True)
            if reason == "show":
                winner = teen_rank(s["players"][s["winners"][0]]["cards"]) if s["winners"] else ranks[0]
                loser = next((r for r in ranks if r != winner), winner)
                if loser == winner:
                    return "Show: equal hands, so the player who asked for the show loses."
                return f"Show: {teen_comparison(list(winner), list(loser)).lower()}."
            close = next((r for r in ranks[1:] if r != ranks[0]), None)
            detail = f": {teen_comparison(list(ranks[0]), list(close)).lower()}" if close else ""
            return f"Pot limit reached, so every hand was shown{detail}."
        if s["pending"]:
            return ("Accept to compare hands privately: the weaker hand packs, and equal hands pack "
                    "the player who asked. Decline to play on.")
        player = s["order"][s["turn"]]
        options = {o.action.type: o for o in self.legal_actions(s, player)}
        parts = []
        bet = options.get("bet")
        if bet:
            parts.append(f"bet blind {bet.minimum}–{bet.maximum}" if "peek" in options
                         else f"chaal {bet.minimum}–{bet.maximum} (even)")
        if "peek" in options:
            parts.append("see your cards")
        if "sideshow" in options:
            parts.append("ask for a sideshow")
        if "show" in options:
            parts.append("ask for a show")
        parts.append("pack")
        sentence = ", ".join(parts[:-1]) + (" or " if len(parts) > 1 else "") + parts[-1]
        return sentence[0].upper() + sentence[1:] + "."

    def _pay(self, s: State, player: str, amount: int) -> None:
        s["players"][player]["chips"] -= amount
        s["pot"] += amount
        if isinstance(s.get("paid"), dict):
            s["paid"][player] = s["paid"].get(player, 0) + amount

    def _out(self, s: State, player: str, reason: str) -> None:
        s["players"][player]["folded"] = True
        if isinstance(s.get("out"), dict):
            s["out"][player] = reason

    def _finish(self, s: State, showdown: bool, reason: str = "packed") -> None:
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
        s["finish"] = reason
        s["message"] = self._prompt(s)

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        p = s["players"][player]
        if action.type == "peek":
            p["seen"] = True
            s["message"] = self._prompt(s)
            return s
        if action.type in ("accept", "decline"):
            pending = s["pending"]
            loser = None
            if action.type == "accept":
                requester = pending["actor"]
                loser = (
                    requester
                    if teen_rank(s["players"][requester]["cards"]) <= teen_rank(p["cards"])
                    else player
                )
                self._out(s, loser, "lost_sideshow")
            # Who lost is public (that seat packs); the cards stay private.
            s["sideshow_result"] = {"requester": pending["actor"], "target": player,
                                    "accepted": action.type == "accept", "loser": loser}
            s["pending"] = None
        elif action.type == "fold":
            self._out(s, player, "packed")
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
                    self._finish(s, True, "pot_limit")
                    return s
                s["pending"] = {"actor": player, "target": self._previous(s, player),
                                "cost": s["stake"] * 2}
                s["message"] = self._prompt(s)
                return s
            active = self._active(s)
            other = next(q for q in active if q != player)
            loser = (
                player
                if teen_rank(p["cards"]) <= teen_rank(s["players"][other]["cards"])
                else other
            )
            s["shown"] = [player, other]
            self._out(s, loser, "lost_show")
        if len(self._active(s)) == 1:
            self._finish(s, False, "show" if action.type == "show" else "packed")
        elif s["pot"] >= 1024:
            self._finish(s, True, "pot_limit")
        else:
            self._advance(s)
            s["message"] = self._prompt(s)
        return s

    def project_view(self, s: State, player: str) -> GameView:
        own = s["players"].get(player)
        finished = s["phase"] == "finished"
        evaluations: dict[str, JsonValue] = {
            p: explain_teen_hand(s["players"][p]["cards"]) for p in s["shown"]
        } if finished else {}
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
            message=self._prompt(s),
            detail={"stake": s["stake"], "blind": bool(own and not own["seen"]),
                    "seen": {p: bool(v["seen"]) for p, v in s["players"].items()},
                    "sideshow": {"actor": s["pending"]["actor"], "target": s["pending"]["target"],
                                 "cost": s["pending"].get("cost", s["stake"] * 2)}
                    if s["pending"] else None,
                    "sideshow_target": self._previous(s, player)
                    if own and any(a.action.type == "sideshow" for a in self.legal_actions(s, player))
                    else None,
                    "sideshow_cost": s["stake"] * 2 if own and own["seen"] else None,
                    "paid": dict(s["paid"]) if isinstance(s.get("paid"), dict) else None,
                    "out_reasons": dict(s.get("out") or {}),
                    "sideshow_result": s.get("sideshow_result"),
                    "finish_reason": s.get("finish") if finished else None,
                    "hand_evaluations": evaluations,
                    "own_evaluation": explain_teen_hand(own["cards"])
                    if own and (own["seen"] or player in s["shown"]) else None},
        )
