from app.core.cards import rng
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
from app.games.deal.deck import make_deck, property_groups
from app.games.deal.payments import payment_bundles
from app.games.deal.table import collection_details, draw_cards, finish, locate, place, rent


class DealEngine(BaseEngine):
    def __init__(self, mercy: bool = False) -> None:
        self.mercy, self.cards = mercy, make_deck(mercy)
        super().__init__(
            GameManifest(
                id="deal-no-mercy" if mercy else "deal",
                name="Monopoly Deal No Mercy" if mercy else "Monopoly Deal",
                subtitle="Property trading with a Games house deck"
                if mercy
                else "Collect three property sets",
                family="property",
                min_players=2,
                max_players=5,
                minutes="15–25",
                icon="building",
                color="plum" if mercy else "sage",
                rules_version="house-deck-1" if mercy else "b0965-faq-2",
                rules=[
                    "Collect three complete property sets in different colours.",
                    "Draw two and play up to three cards per turn. Keep at most seven.",
                    "Debt must be settled before your own plays. Nothing is safe."
                    if mercy
                    else "Bank money to pay rent. Counter attacks with Just Say No.",
                    "Own-turn Just Say No uses a play in this No Mercy house format."
                    if mercy else "Just Say No never uses one of your three ordinary plays.",
                    "Games building convention: linked buildings travel with their property; their full value counts toward payment.",
                    *([
                        "Games house deck: 18 money cards — 5×1M, 4×2M, 3×3M, 2×4M, 2×5M, 1×10M, 1×15M. Printed action effects; money copy counts are a house convention."
                    ] if mercy else []),
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
        s["hands"][players[0]].extend(draw_cards(s, 2))
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
            s["hands"][new].extend(draw_cards(s, 2 if s["hands"][new] else 5))

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
            place(s, player, ident, self.cards, action.color, action.choice)
            return
        kind = card.action
        s["discard"].append(ident)
        others = [p for p in s["order"] if p != player]
        if kind in ("pass_go", "fill"):
            s["hands"][player].extend(
                draw_cards(s, 2 if kind == "pass_go" else max(0, 7 - len(s["hands"][player])))
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
                effects.queue(
                    s, player, target, "bill", amount=amount,
                    source_collection=action.color if kind in ("rent", "rent_double") else None,
                    multiplier=(2 if kind == "rent_double" else s["boost"])
                    if kind in ("rent", "rent_double") else 1,
                )
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
        options = self.legal_actions(state, player)
        if action.type in {"property", "rearrange"} and not action.choice:
            # Pre-destination clients chose only a color. Resolve their action to
            # the same first available pile, without admitting an illegal move.
            action = next(
                (option.action for option in options
                 if option.action.model_copy(update={"choice": ""}) == action),
                action,
            )
        validate_action(options, action)
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
            # Destination availability was checked before vacating the source;
            # place first so its newly empty key cannot replace the chosen key.
            place(s, player, action.card, self.cards, action.color, action.choice)
            s["properties"][player][key].remove(action.card)
            # A building stays with its collection when a property is rearranged.
            # It gives no classic rent bonus while that collection is incomplete.
            remaining = s["properties"][player][key]
            for building, anchor in s["links"].items():
                if anchor == action.card and building in remaining:
                    s["links"][building] = next(
                        (c for c in remaining if self.cards[c].kind == "property"), ""
                    )
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
        pending = None
        if s["queue"]:
            e = s["queue"][0]
            pending = {
                "kind": e["kind"], "actor": e["actor"], "target": e["target"],
                "responder": e["responder"], "amount": e.get("amount"),
                "blocked": e["blocked"],
                "stage": "select" if e.get("select") else "payment" if e.get("payment")
                else "distribution" if e.get("distribution") else "counter",
                "transfers": effects.public_transfers(s, e, self.cards),
                "collection": e.get("color") if e["kind"] == "breaker"
                and e.get("color") in s["properties"][e["target"]] else None,
                "category": e.get("choice") if e["kind"] == "tough"
                and e.get("choice") in ("money", "property", "action") else None,
                "source_collection": e.get("source_collection")
                if e["kind"] == "bill"
                and e.get("source_collection") in s["properties"][e["actor"]] else None,
                "multiplier": e.get("multiplier", 1) if e["kind"] == "bill" else 1,
            }
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
                "rent_multiplier": s["boost"],
                "debts": s["debts"],
                "pending": s["queue"][0]["kind"] if s["queue"] else None,
                "payment_amount": s["queue"][0].get("amount", 0)
                if s["queue"] and s["queue"][0].get("payment") else 0,
                "property_groups": property_groups(),
                "collections": collection_details(s, self.cards),
                "pending_action": pending,
                "payment_bundles": [bundle for bundle in payment_bundles(s, player, self.cards)]
                if s["queue"] and s["queue"][0].get("payment")
                and s["queue"][0]["target"] == player else [],
            },
        )
