from pydantic import JsonValue

from app.core.cards import card_view, draw, poker_rank, rng, standard_deck
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
from app.core.poker_explanation import explain_poker_hand, short_poker_name


class HoldemEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(
            GameManifest(
                id="holdem",
                name="Texas Hold’em",
                subtitle="No-limit Texas Hold’em poker",
                family="casino",
                score_label="Net chips",
                min_players=2,
                max_players=9,
                minutes="20–60",
                icon="spade",
                color="pine",
                rules=[
                    "Make the best five-card hand from your two cards and five community cards.",
                    "Blinds 1/2. Each player starts with 200 free chips.",
                    "No-limit betting, side pots and split pots are supported.",
                ],
            )
        )

    def setup(
        self, players: list[str], settings: dict[str, bool], seed: int | None = None
    ) -> State:
        self.require_players(players)
        cards = standard_deck()
        rng(seed).shuffle(cards)
        n = len(players)
        s: State = {
            "phase": "preflop",
            "order": players,
            "turn": 0,
            "button": 0,
            "deck": cards,
            "board": [],
            "burn": [],
            "current_bet": 2,
            "min_raise": 2,
            "players": {
                p: {
                    "cards": [cards.pop(), cards.pop()],
                    "chips": 200,
                    "bet": 0,
                    "total": 0,
                    "folded": False,
                    "acted_at": None,
                }
                for p in players
            },
            "winners": [],
            "shown": [],
            "pots": [],
            "refunds": {},
            "message": "",
        }
        sb, bb = (0, 1) if n == 2 else (1, 2)
        self._commit(s, players[sb], 1)
        self._commit(s, players[bb], 2)
        s["turn"] = (bb + 1) % n
        s["message"] = self._prompt(s)
        return s

    def _commit(self, s: State, player: str, amount: int) -> None:
        p = s["players"][player]
        p["chips"] -= amount
        p["bet"] += amount
        p["total"] += amount

    def _active(self, s: State) -> list[str]:
        return [p for p in s["order"] if not s["players"][p]["folded"]]

    def _pot_layers(self, s: State) -> list[dict]:
        """Exact contribution layers; settlement awards each one separately."""
        previous = 0
        layers = []
        active = self._active(s)
        for level in sorted({p["total"] for p in s["players"].values() if p["total"]}):
            contributors = [p for p in s["order"] if s["players"][p]["total"] >= level]
            eligible = [p for p in active if s["players"][p]["total"] >= level] or active
            layers.append({"amount": (level - previous) * len(contributors),
                           "contributors": contributors, "eligible": eligible,
                           "refund_to": contributors[0] if len(contributors) == 1 else None})
            previous = level
        return layers

    def _live_pots(self, s: State) -> list[dict]:
        """Pots as the table sees them while betting: one pot until someone is all in.

        A pot splits only at an all-in player's total. Everyone still in the hand
        who has matched that level, or still holds chips to match it, can win it.
        Settlement keeps using the exact contribution layers in `_pot_layers`.
        """
        players = s["players"]
        active = self._active(s)
        caps = sorted({players[p]["total"] for p in active
                       if not players[p]["chips"] and players[p]["total"]})
        pots: list[dict] = []
        previous = 0
        for level in [*caps, None]:
            top = max((v["total"] for v in players.values()), default=0) if level is None else level
            amount = sum(min(v["total"], top) - min(v["total"], previous) for v in players.values())
            if amount <= 0:
                previous = top
                continue
            pots.append({
                "amount": amount,
                "contributors": [p for p in s["order"] if players[p]["total"] > previous],
                "eligible": [p for p in active if players[p]["total"] >= top
                             or players[p]["chips"] and players[p]["total"] + players[p]["chips"] > previous]
                or active,
                "refund_to": None,
                "all_in": [p for p in active if not players[p]["chips"] and players[p]["total"] == level],
            })
            previous = top
        return pots

    def _hand_phrase(self, rank: tuple[int, ...]) -> str:
        name = short_poker_name(rank)
        lower = name[0].lower() + name[1:]
        return lower if rank[0] in (0, 2, 3, 7) else f"a {lower}"

    def _prompt(self, s: State) -> str:
        """The instruction for the seat that can act, or how the hand was settled.

        The table shows this line only to the player who can act; at the end it
        explains the result to everyone without naming anyone.
        """
        if s["phase"] == "finished":
            if not s["shown"]:
                return "Everyone else folded."
            ranks = {p: poker_rank(s["players"][p]["cards"] + s["board"]) for p in s["shown"]}
            winners = {w for pot in s["pots"] for w in pot["winners"]}
            best = max(ranks[p] for p in winners) if winners else None
            if best is None:
                return "Showdown. Pots settled."
            phrase = self._hand_phrase(best)
            if len(winners) > 1 and all(ranks[p] == best for p in winners):
                return f"Tied hands split the pot ({phrase})."
            if len(winners) > 1:
                return "Showdown: different hands won the main and side pots."
            return f"Won at showdown with {phrase}."
        player = s["order"][s["turn"]]
        p = s["players"][player]
        call = s["current_bet"] - p["bet"]
        options = {o.action.type: o for o in self.legal_actions(s, player)}
        raise_option = options.get("raise")
        if call and call >= p["chips"]:
            return f"Call all in for {p['chips']}, or fold."
        if call:
            more = f", raise to {raise_option.minimum} or more," if raise_option else ""
            return f"Call {call} to stay in{more} or fold."
        if raise_option:
            verb = "bet" if not s["current_bet"] else "raise to"
            return f"Check, or {verb} {raise_option.minimum} or more."
        return "Check, or go all in." if "all_in" in options else "Check."

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished" or s["order"][s["turn"]] != player:
            return []
        p = s["players"][player]
        if p["folded"] or not p["chips"]:
            return []
        call = s["current_bet"] - p["bet"]
        actions = [legal("Fold", "fold")]
        actions.append(
            legal(f"Call {min(call, p['chips'])}", "call") if call else legal("Check", "check")
        )
        maximum = p["chips"] + p["bet"]
        can_raise = p["acted_at"] is None or s["current_bet"] - p["acted_at"] >= s["min_raise"]
        minimum = s["current_bet"] + s["min_raise"]
        if (
            can_raise
            and maximum >= minimum
            and any(s["players"][q]["chips"] for q in self._active(s) if q != player)
        ):
            # With nothing to match yet the same move is a bet.
            actions.append(
                legal("Raise to" if s["current_bet"] else "Bet", "raise", input="amount",
                      minimum=minimum, maximum=maximum)
            )
        opponents_can_bet = any(
            s["players"][q]["chips"] for q in self._active(s) if q != player
        )
        if maximum <= s["current_bet"] or can_raise and opponents_can_bet:
            actions.append(legal(f"All in · {p['chips']}", "all_in"))
        return actions

    def _settle(self, s: State, showdown: bool) -> None:
        active = self._active(s)
        s["shown"] = active if showdown else []
        ranks = (
            {p: poker_rank(s["players"][p]["cards"] + s["board"]) for p in active}
            if showdown
            else {}
        )
        winners = set()
        for layer in self._pot_layers(s):
            amount = layer["amount"]
            if layer["refund_to"] is not None:
                # Returning an unmatched wager is not winning a side pot.
                p = layer["refund_to"]
                s["players"][p]["chips"] += amount
                s.setdefault("refunds", {})[p] = amount
                continue
            eligible = layer["eligible"]
            best = max(ranks.get(p, (0,)) for p in eligible)
            won = [p for p in eligible if ranks.get(p, (0,)) == best]
            clockwise = s["order"][s["button"] + 1 :] + s["order"][: s["button"] + 1]
            won.sort(key=clockwise.index)
            awards = {p: amount // len(won) + (1 if i < amount % len(won) else 0)
                      for i, p in enumerate(won)}
            for p in won:
                s["players"][p]["chips"] += awards[p]
                winners.add(p)
            s["pots"].append({"amount": amount, "winners": won, "eligible": eligible,
                              "awards": awards, "odd_chips": won[:amount % len(won)]})
        s["winners"] = [p for p in s["order"] if p in winners]
        s["phase"] = "finished"
        s["message"] = self._prompt(s)

    def _next_street(self, s: State) -> None:
        if s["phase"] == "river":
            self._settle(s, True)
            return
        s["burn"].extend(draw(s))
        count = 3 if s["phase"] == "preflop" else 1
        s["board"].extend(draw(s, count))
        s["phase"] = {"preflop": "flop", "flop": "turn", "turn": "river"}[s["phase"]]
        s["current_bet"], s["min_raise"] = 0, 2
        for p in s["players"].values():
            p["bet"], p["acted_at"] = 0, None
        able = [p for p in self._active(s) if s["players"][p]["chips"]]
        if len(able) <= 1:
            self._next_street(s)
        else:
            s["turn"] = (s["button"] + 1) % len(s["order"])
            self._seek(s)

    def _seek(self, s: State) -> None:
        for _ in s["order"]:
            p = s["players"][s["order"][s["turn"]]]
            if (
                not p["folded"]
                and p["chips"]
                and (p["acted_at"] is None or p["bet"] < s["current_bet"])
            ):
                return
            s["turn"] = (s["turn"] + 1) % len(s["order"])
        self._next_street(s)

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        p = s["players"][player]
        if action.type == "fold":
            p["folded"] = True
        elif action.type != "check":
            amount = (
                min(s["current_bet"] - p["bet"], p["chips"])
                if action.type == "call"
                else p["chips"]
                if action.type == "all_in"
                else action.amount - p["bet"]
            )
            self._commit(s, player, amount)
            if p["bet"] > s["current_bet"]:
                increase = p["bet"] - s["current_bet"]
                if increase >= s["min_raise"]:
                    s["min_raise"] = increase
                s["current_bet"] = p["bet"]
        p["acted_at"] = s["current_bet"]
        if len(self._active(s)) == 1:
            self._settle(s, False)
        else:
            s["turn"] = (s["turn"] + 1) % len(s["order"])
            self._seek(s)
            if s["phase"] != "finished":
                s["message"] = self._prompt(s)
        return s

    def project_view(self, s: State, player: str) -> GameView:
        live_pots: list[JsonValue] = list(self._live_pots(s)) if s["phase"] != "finished" else []
        return GameView(
            game_id="holdem",
            phase=s["phase"],
            current_player=s["order"][s["turn"]],
            players=[
                PlayerView(
                    id=p,
                    count=2,
                    chips=v["chips"],
                    bet=v["bet"],
                    folded=v["folded"],
                    score=v["chips"] - 200,
                    cards=[card_view(c) for c in v["cards"]] if p in s["shown"] else [],
                )
                for p, v in s["players"].items()
            ],
            hand=[card_view(c) for c in s["players"][player]["cards"]]
            if player in s["players"]
            else [],
            community=[card_view(c) for c in s["board"]],
            pot=sum(pot["amount"] for pot in s["pots"])
            if s["phase"] == "finished"
            else sum(p["total"] for p in s["players"].values()),
            actions=self.legal_actions(s, player),
            message=self._prompt(s),
            winners=s["winners"],
            detail={
                "button": s["order"][s["button"]],
                "current_bet": s["current_bet"],
                "pots": s["pots"],
                "refunds": s.get("refunds", {}),
                "contributions": {p: v["total"] for p, v in s["players"].items()},
                "live_pots": live_pots,
                "hand_evaluations": {
                    p: explain_poker_hand(s["players"][p]["cards"] + s["board"])
                    for p in s["shown"] if len(s["board"]) == 5
                },
                "settlement_reason": ("showdown" if s["shown"] else "uncontested")
                if s["phase"] == "finished" else None,
            },
        )
