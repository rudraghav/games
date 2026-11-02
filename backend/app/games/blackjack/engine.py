from app.core.cards import blackjack_total, card_view, draw, rng, standard_deck
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


def hand_settlement(hand: dict, dealer: list[str]) -> dict:
    total = blackjack_total(hand["cards"])[0]
    dealer_total = blackjack_total(dealer)[0]
    natural = len(dealer) == 2 and dealer_total == 21
    player_natural = total == 21 and len(hand["cards"]) == 2 and not hand["split"]
    payout, outcome, reason = 0, "loss", "Dealer's total is higher"
    if total > 21:
        reason = "Hand busts"
    elif natural:
        payout = hand["bet"] if player_natural else 0
        outcome, reason = ("push", "Both have natural blackjack") if player_natural else ("loss", "Dealer has natural blackjack")
    elif player_natural:
        payout, outcome, reason = hand["bet"] * 5 // 2, "blackjack", "Natural blackjack pays 3:2"
    elif dealer_total > 21 or total > dealer_total:
        payout, outcome = hand["bet"] * 2, "win"
        reason = "Dealer busts" if dealer_total > 21 else "Hand beats dealer"
    elif total == dealer_total:
        payout, outcome, reason = hand["bet"], "push", "Equal totals return the stake"
    return {"outcome": outcome, "reason": reason, "payout": payout,
            "net": payout - hand["bet"], "natural": player_natural}


class BlackjackEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(
            GameManifest(
                id="blackjack",
                name="Blackjack",
                subtitle="Beat the automated dealer",
                family="casino",
                score_label="Net chips",
                min_players=1,
                max_players=7,
                minutes="5–15",
                icon="club",
                color="pine",
                settings=[Setting(key="hit_soft_17", label="Dealer hits soft 17", default=False)],
                rules=[
                    "Get closer to 21 than the dealer without going over.",
                    "Blackjack pays 3:2. Ties return your stake.",
                    "Split pairs or double on two cards.",
                ],
            )
        )

    def setup(
        self, players: list[str], settings: dict[str, bool], seed: int | None = None
    ) -> State:
        self.require_players(players)
        cards = standard_deck(6)
        rng(seed).shuffle(cards)
        return {
            "phase": "betting",
            "order": players,
            "turn": 0,
            "deck": cards,
            "dealer": [],
            "players": {
                p: {"chips": 200, "hands": [], "bet": 0, "insurance": 0, "profit": 0}
                for p in players
            },
            "hand_index": 0,
            "settings": settings,
            "winners": [],
            "message": "Place your free-chip wager.",
        }

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished" or s["order"][s["turn"]] != player:
            return []
        p = s["players"][player]
        if s["phase"] == "betting":
            return [
                legal("Place bet", "bet", input="amount", minimum=2, maximum=p["chips"], step=2)
            ]
        if s["phase"] == "insurance":
            actions = [legal("No insurance", "decline")]
            if p["chips"] >= p["bet"] // 2:
                actions.append(legal(f"Insure for {p['bet'] // 2}", "accept"))
            return actions
        hand = p["hands"][s["hand_index"]]
        actions = [legal("Hit", "hit"), legal("Stand", "stand")]
        if len(hand["cards"]) == 2 and p["chips"] >= hand["bet"]:
            actions.append(legal("Double down", "double"))
            if hand["cards"][0][0] == hand["cards"][1][0] and len(p["hands"]) < 4:
                actions.append(legal("Split pair", "split"))
        return actions

    def _deal(self, s: State) -> None:
        s["dealer"] = draw(s, 2)
        for p in s["players"].values():
            cards = draw(s, 2)
            p["hands"] = [
                {
                    "cards": cards,
                    "bet": p["bet"],
                    "done": blackjack_total(cards)[0] == 21,
                    "split": False,
                }
            ]
        s["turn"] = 0
        if s["dealer"][0][0] == "A":
            s["phase"] = "insurance"
        elif blackjack_total(s["dealer"])[0] == 21:
            self._settle(s)
        else:
            s["phase"] = "playing"
            self._next(s, initial=True)

    def _next(self, s: State, initial: bool = False) -> None:
        while s["turn"] < len(s["order"]):
            hands = s["players"][s["order"][s["turn"]]]["hands"]
            for i, hand in enumerate(hands):
                if blackjack_total(hand["cards"])[0] >= 21:
                    hand["done"] = True
                if not hand["done"]:
                    s["hand_index"] = i
                    return
            s["turn"] += 1
        s["turn"] = 0
        self._settle(s)

    def _settle(self, s: State) -> None:
        natural = len(s["dealer"]) == 2 and blackjack_total(s["dealer"])[0] == 21
        if not natural:
            while True:
                total, soft = blackjack_total(s["dealer"])
                if total < 17 or total == 17 and soft and s["settings"].get("hit_soft_17"):
                    s["dealer"].extend(draw(s))
                else:
                    break
        dealer_total = blackjack_total(s["dealer"])[0]
        for p in s["players"].values():
            if natural:
                p["chips"] += 3 * p["insurance"]
            for hand in p["hands"]:
                p["chips"] += hand_settlement(hand, s["dealer"])["payout"]
            p["profit"] = p["chips"] - 200
        s["phase"] = "finished"
        s["winners"] = [pid for pid, p in s["players"].items() if p["profit"] > 0]
        s["message"] = (
            f"Dealer {'busts' if dealer_total > 21 else 'has ' + str(dealer_total)}. Wagers settled."
        )

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        p = s["players"][player]
        if action.type == "bet":
            if action.amount % 2:
                raise RuleError("Choose an even wager so blackjack pays exact chips.")
            p["bet"] = action.amount
            p["chips"] -= action.amount
            s["turn"] += 1
            if s["turn"] == len(s["order"]):
                self._deal(s)
        elif s["phase"] == "insurance":
            if action.type == "accept":
                insurance = p["bet"] // 2
                if p["chips"] < insurance:
                    raise RuleError("Not enough chips for insurance.")
                p["insurance"] = insurance
                p["chips"] -= insurance
            s["turn"] += 1
            if s["turn"] == len(s["order"]):
                s["turn"], s["phase"] = 0, "playing"
                if blackjack_total(s["dealer"])[0] == 21:
                    self._settle(s)
                else:
                    self._next(s, initial=True)
        else:
            hand = p["hands"][s["hand_index"]]
            if action.type == "stand":
                hand["done"] = True
            elif action.type == "split":
                p["chips"] -= hand["bet"]
                second = hand["cards"].pop()
                hand["cards"].extend(draw(s))
                hand["split"] = True
                other = {
                    "cards": [second, *draw(s)],
                    "bet": hand["bet"],
                    "done": False,
                    "split": True,
                }
                p["hands"].insert(s["hand_index"] + 1, other)
                if second[0] == "A":
                    hand["done"] = other["done"] = True
            else:
                if action.type == "double":
                    p["chips"] -= hand["bet"]
                    hand["bet"] *= 2
                    hand["done"] = True
                hand["cards"].extend(draw(s))
                if blackjack_total(hand["cards"])[0] >= 21:
                    hand["done"] = True
            self._next(s)
        return s

    def project_view(self, s: State, player: str) -> GameView:
        finished = s["phase"] == "finished"
        dealer_natural = finished and len(s["dealer"]) == 2 and blackjack_total(s["dealer"])[0] == 21

        def projected_hand(h: dict) -> dict:
            total, soft = blackjack_total(h["cards"])
            return {"cards": [card_view(c).model_dump() for c in h["cards"]], "bet": h["bet"],
                    "total": total, "soft": soft, "done": h["done"], "split": h["split"],
                    "settlement": hand_settlement(h, s["dealer"]) if finished else None}

        def insurance(stake: int) -> dict:
            payout = stake * 3 if dealer_natural else 0
            return {"stake": stake, "payout": payout if finished else None,
                    "net": payout - stake if finished else None}
        people = [
            PlayerView(
                id=pid,
                chips=p["chips"],
                bet=sum(h["bet"] for h in p["hands"]) or p["bet"],
                score=p["profit"],
                cards=[card_view(c) for h in p["hands"] for c in h["cards"]],
            )
            for pid, p in s["players"].items()
        ]
        dealer = s["dealer"] if s["phase"] == "finished" else s["dealer"][:1]
        own = s["players"].get(player, {"hands": []})
        hand = (
            own["hands"][s["hand_index"]]
            if own["hands"] and s["hand_index"] < len(own["hands"])
            else {"cards": []}
        )
        return GameView(
            game_id=self.manifest.id,
            phase=s["phase"],
            current_player=s["order"][s["turn"]],
            players=people,
            hand=[card_view(c) for c in hand["cards"]],
            community=[card_view(c) for c in dealer],
            draw_count=len(s["deck"]),
            actions=self.legal_actions(s, player),
            message=s["message"],
            winners=s["winners"],
            detail={
                "dealer_hidden": bool(s["dealer"]) and s["phase"] != "finished",
                "hand_index": s["hand_index"],
                "active_hand_index": s["hand_index"] if s["phase"] == "playing"
                and s["order"][s["turn"]] == player else None,
                "hands": [projected_hand(h) for h in own["hands"]],
                "insurance": insurance(own.get("insurance", 0)),
                "dealer_natural": bool(dealer_natural) if finished else None,
                "settlements": {pid: {"hands": [projected_hand(h) for h in p["hands"]],
                                      "insurance": insurance(p["insurance"]), "net": p["profit"]}
                                for pid, p in s["players"].items()} if finished else {},
            },
        )
