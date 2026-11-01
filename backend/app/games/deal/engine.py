from app.core.cards import draw, rng
from app.core.contracts import (
    Action,
    BaseEngine,
    GameManifest,
    GameView,
    LegalAction,
    PlayerView,
    State,
    validate_action,
)
from app.games.deal import effects, options
from app.games.deal.deck import make_deck
from app.games.deal.table import finish, locate, place, rent


class DealEngine(BaseEngine):
    def __init__(self, mercy: bool = False) -> None:
        self.mercy, self.cards = mercy, make_deck(mercy)
        super().__init__(
            GameManifest(
                id="deal-no-mercy" if mercy else "deal",
                name="Monopoly Deal No Mercy" if mercy else "Monopoly Deal",
                subtitle="Make bank. Make enemies."
                if mercy
                else "Build an empire, one card at a time.",
                family="property",
                min_players=2,
                max_players=5,
                minutes="15–25",
                icon="building",
                color="plum" if mercy else "sage",
                rules=[
                    "Collect three complete property sets in different colours.",
                    "Draw two and play up to three cards per turn. Keep at most seven.",
                    "Debt must be settled before your own plays. Nothing is safe."
                    if mercy
                    else "Bank money to pay rent. Counter attacks with Just Say No.",
                ],
            )
        )

    def setup(
        self, players: list[str], settings: dict[str, bool], seed: int | None = None
    ) -> State:
        self.require_players(players)
        cards = list(self.cards)
        rng(seed).shuffle(cards)
        s: State = {
            "phase": "playing",
            "order": players,
            "turn": 0,
            "deck": cards,
            "discard": [],
            "hands": {p: [cards.pop() for _ in range(5)] for p in players},
            "banks": {p: [] for p in players},
            "properties": {p: {} for p in players},
            "debts": {p: [] for p in players},
            "scores": {p: 0 for p in players},
            "moves": 3,
            "boost": 1,
            "queue": [],
            "gift": None,
            "links": {},
            "again": False,
            "end_requested": False,
            "winners": [],
            "message": "Three sets. One winner.",
        }
        s["hands"][players[0]].extend(draw(s, 2))
        return s

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        return options.legal_actions(s, player, self.cards, self.mercy)

    def _after(self, s: State) -> None:
        finish(s, self.cards)
        if s["phase"] == "finished" or s["queue"] or s["gift"]:
            return
        if s["moves"] <= 0 or s["end_requested"]:
            owner = s["order"][s["turn"]]
            if len(s["hands"][owner]) > 7:
                s["phase"] = "discard"
                return
            if not s["again"]:
                s["turn"] = (s["turn"] + 1) % len(s["order"])
            s.update(phase="playing", moves=3, boost=1, end_requested=False, again=False)
            new = s["order"][s["turn"]]
            s["hands"][new].extend(draw(s, 2 if s["hands"][new] else 5))

    def _play(self, s: State, player: str, action: Action) -> None:
        ident = action.card
        card = self.cards[ident]
        gift = s["gift"] is not None
        if gift:
            s["gift"] = None
        else:
            s["hands"][player].remove(ident)
            s["moves"] -= 1
        if action.type == "bank":
            s["banks"][player].append(ident)
            return
        if action.type == "property":
            place(s, player, ident, self.cards, action.color)
            return
        kind = card.action
        s["discard"].append(ident)
        others = [p for p in s["order"] if p != player]
        if kind in ("pass_go", "fill"):
            s["hands"][player].extend(
                draw(s, 2 if kind == "pass_go" else max(0, 7 - len(s["hands"][player])))
            )
        elif kind == "go_again":
            s["again"], s["end_requested"] = True, True
        elif kind in ("house", "hotel", "shack"):
            s["discard"].pop()
            group = s["properties"][player][action.color]
            s["links"][ident] = next(c for c in group if self.cards[c].kind == "property")
            group.append(ident)
        elif kind == "double":
            s["boost"] *= 2
        elif kind in ("rent", "rent_double", "birthday", "debt", "yoink"):
            amount = (
                rent(s, player, action.color, self.cards)
                * (2 if kind == "rent_double" else s["boost"])
                if kind in ("rent", "rent_double")
                else 2
                if kind == "birthday"
                else 5
                if kind == "debt"
                else 10
            )
            for target in [action.target] if action.target else others:
                effects.queue(s, player, target, "bill", amount=amount)
            s["boost"] = 1
        elif kind in ("sly", "forced"):
            effects.queue(
                s,
                player,
                action.target,
                kind,
                take=action.choice,
                give=action.cards[0] if action.cards else None,
            )
        elif kind in ("heist", "crash"):
            for target in others:
                if s["banks"][target] if kind == "heist" else any(s["properties"][target].values()):
                    effects.queue(s, player, target, kind, select=True)
        elif kind == "super_sly":
            for target in others:
                if any(
                    action.color in self.cards[c].colors
                    for group in s["properties"][target].values()
                    for c in group
                ):
                    effects.queue(s, player, target, kind, color=action.color)
        else:
            effects.queue(s, player, action.target, kind, color=action.color, choice=action.choice)
        s["message"] = f"Played {card.view().label}."

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        if s["queue"]:
            effects.act(s, player, action, self.cards, self.mercy)
        elif action.type == "settle_debt":
            s["hands"][player].remove(action.card)
            s["debts"][player].remove(action.target)
            s["moves"] -= 1
            s["gift"] = {"card": action.card, "recipient": action.target}
        elif action.type == "rearrange":
            key = locate(s, player, action.card)
            s["properties"][player][key].remove(action.card)
            place(s, player, action.card, self.cards, action.color)
        elif action.type == "discard":
            s["hands"][player].remove(action.card)
            s["discard"].append(action.card)
        elif action.type == "end_turn":
            s["end_requested"] = True
        else:
            self._play(s, player, action)
        self._after(s)
        return s

    def project_view(self, s: State, player: str) -> GameView:
        current = s["order"][s["turn"]]
        if s["queue"]:
            e = s["queue"][0]
            current = (
                e["actor"]
                if e.get("select")
                else e["target"]
                if e.get("payment") or e.get("distribution")
                else e["responder"]
            )
        elif s["gift"]:
            current = s["gift"]["recipient"]
        hand = list(s["hands"].get(player, []))
        if s["gift"] and s["gift"]["recipient"] == player:
            hand.append(s["gift"]["card"])
        return GameView(
            game_id=self.manifest.id,
            phase=s["phase"],
            current_player=current,
            players=[
                PlayerView(
                    id=p,
                    count=len(s["hands"][p]),
                    score=s["scores"][p],
                    bank=[self.cards[c].view() for c in s["banks"][p]],
                    properties={
                        key: [self.cards[c].view(key.split(":")[0]) for c in group]
                        for key, group in s["properties"][p].items()
                        if group
                    },
                )
                for p in s["order"]
            ],
            hand=[self.cards[c].view() for c in hand],
            discard=self.cards[s["discard"][-1]].view() if s["discard"] else None,
            draw_count=len(s["deck"]),
            actions=self.legal_actions(s, player),
            message=s["message"],
            winners=s["winners"],
            detail={
                "moves": s["moves"],
                "debts": s["debts"],
                "pending": s["queue"][0]["kind"] if s["queue"] else None,
            },
        )
