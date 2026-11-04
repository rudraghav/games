from itertools import combinations
from typing import Any

from app.core.cards import rng
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
from app.games.gem_market.deck import ALL_COLORS, CARDS, COLORS, PATRONS, patron_view

# Engine messages are instructions for the seat that can act; the room shows
# every other seat who it is waiting for and the last public move.
TURN_PROMPT = "Take 3 different gems or 2 of one colour, or buy or reserve a development."
FINAL_PROMPT = "Final round: this is your last turn. Take gems, or buy or reserve a development."


def bonuses(s: State, player: str) -> dict[str, int]:
    return {color: sum(CARDS[c].bonus == color for c in s["bought"][player]) for color in COLORS}


def score(s: State, player: str) -> int:
    return sum(CARDS[c].points for c in s["bought"][player]) + 3 * len(s["claimed"][player])


def purchase_quote(s: State, player: str, card: str) -> dict[str, Any]:
    """Explain the same matching-gems-first payment used when committing a buy."""
    discount, held = bonuses(s, player), s["tokens"][player]
    result = dict.fromkeys(ALL_COLORS, 0)
    applied, missing = {}, {}
    for color, cost in CARDS[card].cost.items():
        applied[color] = min(cost, discount[color])
        needed = cost - applied[color]
        result[color] = min(held[color], needed)
        missing[color] = needed - result[color]
        result["gold"] += missing[color]
    shortfall = max(0, result["gold"] - held["gold"])
    return {"cost": dict(CARDS[card].cost), "discount": applied, "spend": result,
            "missing_colors": missing, "shortfall": shortfall, "affordable": shortfall == 0,
            "after": {c: held[c] - result[c] for c in ALL_COLORS} if not shortfall else None}


def payment(s: State, player: str, card: str) -> dict[str, int] | None:
    quote = purchase_quote(s, player, card)
    return quote["spend"] if quote["affordable"] else None


class GemMarketEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(GameManifest(
            id="gem-market", name="Gem Market", subtitle="Collect gems and buy developments",
            family="gems", min_players=2, max_players=4, minutes="20–40", icon="gem", color="sage",
            score_label="Prestige",
            rules=["Collect gems, reserve a card or buy a development each turn.",
                "Developments discount future purchases; patrons reward a balanced engine.",
                "At 15 prestige, finish the round. Most prestige wins; fewer developments breaks a tie."],
        ))

    def setup(self, players: list[str], settings: dict[str, bool], seed: int | None = None) -> State:
        self.require_players(players)
        randomizer = rng(seed)
        decks = {str(tier): [ident for ident, card in CARDS.items() if card.tier == tier]
                 for tier in (1, 2, 3)}
        for cards in decks.values():
            randomizer.shuffle(cards)
        patrons = randomizer.sample(list(PATRONS), len(players) + 1)
        return {"order": players, "turn": 0, "phase": "playing", "decks": decks,
                "market": {tier: [cards.pop() for _ in range(4)] for tier, cards in decks.items()},
                "bank": {c: 5 if c == "gold" else {2: 4, 3: 5, 4: 7}[len(players)] for c in ALL_COLORS},
                "tokens": {p: dict.fromkeys(ALL_COLORS, 0) for p in players},
                "reserved": {p: [] for p in players}, "bought": {p: [] for p in players},
                "claimed": {p: [] for p in players}, "patrons": patrons, "winners": [],
                "final_round": False, "passes": 0, "message": TURN_PROMPT}

    def eligible_patrons(self, s: State, player: str) -> list[str]:
        discount = bonuses(s, player)
        return [patron for patron in s["patrons"]
                if all(discount[c] >= n for c, n in PATRONS[patron].items())]

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished" or player != s["order"][s["turn"]]:
            return []
        if s["phase"] == "return_tokens":
            return [legal(f"Return one {c}", "return", choice=c) for c, n in s["tokens"][player].items() if n]
        if s["phase"] == "patron":
            return [legal(f"Welcome {patron_view(p).label}", "patron", card=p) for p in self.eligible_patrons(s, player)]
        gold = "+1 gold" if s["bank"]["gold"] else "no gold left"
        market = [c for cards in s["market"].values() for c in cards]
        options = [legal(f"Buy {CARDS[c].view().label} · {CARDS[c].points} prestige", "buy", card=c)
                   for c in [*market, *s["reserved"][player]] if payment(s, player, c) is not None]
        available = [c for c in COLORS if s["bank"][c]]
        if available:
            options.extend(legal("Take " + ", ".join(colors), "take", choice=",".join(colors))
                           for colors in combinations(available, min(3, len(available))))
        options.extend(legal(f"Take two {c}", "take_pair", choice=c) for c in COLORS if s["bank"][c] >= 4)
        if len(s["reserved"][player]) < 3:
            options.extend(legal(f"Reserve {CARDS[c].view().label} · {gold}", "reserve", card=c) for c in market)
            options.extend(legal(f"Reserve face-down from tier {tier} · {gold}", "reserve_blind", choice=tier)
                           for tier, cards in s["decks"].items() if cards)
        return options or [legal("Pass — no action available", "pass")]

    def _settle(self, s: State) -> None:
        best = max((score(s, p), -len(s["bought"][p])) for p in s["order"])
        opening = "Every seat passed in turn." if s["passes"] >= len(s["order"]) else "The final round is complete."
        s.update(phase="finished", message=f"{opening} Most prestige wins; fewer developments break a tie.",
                 winners=[p for p in s["order"] if (score(s, p), -len(s["bought"][p])) == best])

    def _end(self, s: State, player: str) -> None:
        s["final_round"] = s["final_round"] or score(s, player) >= 15
        if (s["final_round"] and s["turn"] == len(s["order"]) - 1) or s["passes"] >= len(s["order"]):
            self._settle(s)
        else:
            s.update(turn=(s["turn"] + 1) % len(s["order"]), phase="playing",
                     message=FINAL_PROMPT if s["final_round"] else TURN_PROMPT)

    def _after_action(self, s: State, player: str) -> None:
        held = sum(s["tokens"][player].values())
        if held > 10:
            extra = held - 10
            s.update(phase="return_tokens",
                     message=f"You hold {held} gems. Return {extra} {'gem' if extra == 1 else 'gems'} to keep ten.")
        elif self.eligible_patrons(s, player):
            s.update(phase="patron", message="Choose a patron to visit you: +3 prestige.")
        else:
            self._end(s, player)

    def _remove_market(self, s: State, card: str) -> None:
        tier = str(CARDS[card].tier)
        position = s["market"][tier].index(card)
        s["market"][tier].pop(position)
        if s["decks"][tier]:
            s["market"][tier].insert(position, s["decks"][tier].pop())

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        if action.type == "patron":
            s["patrons"].remove(action.card)
            s["claimed"][player].append(action.card)
            self._end(s, player)
            return s
        if action.type == "return":
            s["tokens"][player][action.choice] -= 1
            s["bank"][action.choice] += 1
        else:
            s["passes"] = s["passes"] + 1 if action.type == "pass" else 0
            if action.type in {"take", "take_pair"}:
                colors = action.choice.split(",") if action.type == "take" else [action.choice] * 2
                for color in colors:
                    s["bank"][color] -= 1
                    s["tokens"][player][color] += 1
            elif action.type.startswith("reserve"):
                card = action.card if action.type == "reserve" else s["decks"][action.choice].pop()
                if action.type == "reserve":
                    self._remove_market(s, card)
                s["reserved"][player].append(card)
                if s["bank"]["gold"]:
                    s["bank"]["gold"] -= 1
                    s["tokens"][player]["gold"] += 1
            elif action.type == "buy":
                paid = payment(s, player, action.card)
                assert paid is not None
                for color, n in paid.items():
                    s["tokens"][player][color] -= n
                    s["bank"][color] += n
                if action.card in s["reserved"][player]:
                    s["reserved"][player].remove(action.card)
                else:
                    self._remove_market(s, action.card)
                s["bought"][player].append(action.card)
        self._after_action(s, player)
        return s

    def project_view(self, s: State, player: str) -> GameView:
        market = [c for cards in s["market"].values() for c in cards]
        known = set(market + s["reserved"].get(player, []) + [c for cards in s["bought"].values() for c in cards])
        card_info: dict[str, Any] = {c: {"tier": CARDS[c].tier, "cost": CARDS[c].cost,
                                               "bonus": CARDS[c].bonus, "points": CARDS[c].points} for c in known}
        details: dict[str, Any] = {
            "bank": s["bank"], "tokens": s["tokens"],
            "bonuses": {p: bonuses(s, p) for p in s["order"]}, "card_info": card_info,
            "patron_costs": {c: PATRONS[c] for c in s["patrons"]}, "final_round": s["final_round"],
            "purchase_quotes": {c: purchase_quote(s, player, c)
                                for c in [*market, *s["reserved"].get(player, [])]}
            if player in s["order"] else {},
            "return_count": max(0, sum(s["tokens"].get(player, {}).values()) - 10),
            "reservation_limit": len(s["reserved"].get(player, [])) >= 3,
        }
        return GameView(
            game_id=self.manifest.id, phase=s["phase"], message=s["message"],
            current_player=s["order"][s["turn"]] if s["phase"] != "finished" else None,
            players=[PlayerView(id=p, count=len(s["reserved"][p]), score=score(s, p),
                         cards=[None] * len(s["reserved"][p]),
                         properties={"Developments": [CARDS[c].view() for c in s["bought"][p]],
                                     "Patrons": [patron_view(c) for c in s["claimed"][p]]}) for p in s["order"]],
            hand=[CARDS[c].view() for c in s["reserved"].get(player, [])],
            community=[CARDS[c].view() for c in market] + [patron_view(c) for c in s["patrons"]],
            draw_count=sum(len(cards) for cards in s["decks"].values()),
            actions=self.legal_actions(s, player), winners=s["winners"],
            detail=details,
        )
