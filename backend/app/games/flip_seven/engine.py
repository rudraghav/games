"""Flip 7 edition 3.1: interruptible dealing, deferred effects, persistent shoe."""

from random import Random

from app.core.contracts import (
    Action,
    BaseEngine,
    CardView,
    GameManifest,
    GameView,
    LegalAction,
    PlayerView,
    State,
    legal,
    validate_action,
)


def deck() -> list[str]:
    return ([f"n-{n}-{i}" for n in range(13) for i in range(max(1, n))]
            + [f"plus-{n}" for n in (2, 4, 6, 8, 10)] + ["times-2"]
            + [f"{kind}-{i}" for kind in ("freeze", "three", "chance") for i in range(3)])


def face(card: str) -> CardView:
    kind, value, *_ = card.split("-")
    label = {"freeze": "Freeze", "three": "Flip Three", "chance": "Second Chance"}.get(kind)
    text = label or (f"+{value}" if kind == "plus" else "×2" if kind == "times" else value)
    color = "red" if label else "yellow" if kind == "n" else "blue"
    return CardView(id=card, label=text, value=text, color=color, suit="✦")


def round_points(s: State, player: str) -> int:
    if s["status"][player] == "busted":
        return 0
    cards = s["table"][player]
    numbers = [int(c.split("-")[1]) for c in cards if c.startswith("n-")]
    multiplier = 2 if "times-2" in cards else 1
    return sum(numbers) * multiplier + sum(int(c.split("-")[1]) for c in cards
                                         if c.startswith("plus-")) + (15 if len(numbers) == 7 else 0)


class FlipSevenEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(GameManifest(
            id="flip-7", name="Flip 7", subtitle="Push your luck without repeating a number",
            family="flip-seven", min_players=3, max_players=10, minutes="15–25", icon="sparkles",
            color="coral", rules_version="edition-3.1", rules=[
                "94-card deck. Hit for a card or Stay to bank your round points. Duplicate numbers bust.",
                "Freeze banks a target; Flip Three forces up to three cards; Second Chance saves one duplicate.",
                "During Flip Three, resolve extra Freeze/Flip Three cards after the batch unless the drawer busts.",
                "Seven distinct numbers end the round and add 15. Double numbers before adding modifiers.",
                "Highest score at 200 wins after the round. Tied leaders play on. Resolved actions stay out until round end.",
            ],
        ))

    def setup(self, players: list[str], settings: dict[str, bool], seed: int | None = None) -> State:
        self.require_players(players)
        rng = Random(seed)
        cards = deck()
        rng.shuffle(cards)
        s: State = {"order": players, "turn": 0, "phase": "playing", "deck": cards,
                    "discard": [], "seed": rng.randrange(2**63), "shuffle": 0,
                    "table": {p: [] for p in players}, "status": dict.fromkeys(players, "active"),
                    "scores": dict.fromkeys(players, 0), "round_scores": {}, "winners": [],
                    "round": 0, "dealer": 0, "tasks": [], "pending": None, "resume": 0,
                    "effects": []}
        self._begin_round(s)
        return s

    def _begin_round(self, s: State) -> None:
        s["round"] += 1
        s.update(phase="playing", table={p: [] for p in s["order"]},
                 status=dict.fromkeys(s["order"], "active"), pending=None, resume=s["dealer"],
                 effects=[])
        order = s["order"][s["dealer"]:] + s["order"][:s["dealer"]]
        s["tasks"] = [{"kind": "draw", "player": p, "remaining": 1, "batch": False,
                       "deferred": []} for p in order]
        self._advance(s)

    def _finish_round(self, s: State) -> None:
        s["round_scores"] = {p: round_points(s, p) for p in s["order"]}
        for p in s["order"]:
            s["scores"][p] += s["round_scores"][p]
        best = max(s["scores"].values())
        leaders = [p for p in s["order"] if s["scores"][p] == best]
        s.update(tasks=[], pending=None, dealer=(s["dealer"] + 1) % len(s["order"]))
        s["turn"] = s["dealer"]
        if best >= 200 and len(leaders) == 1:
            s.update(phase="finished", winners=leaders)
        else:
            s.update(phase="round_over")

    def _active(self, s: State) -> list[str]:
        return [p for p in s["order"] if s["status"][p] == "active"]

    def _advance(self, s: State) -> None:
        """Run automatic draws until a human target decision or normal turn is needed."""
        while s["tasks"]:
            task = s["tasks"][0]
            p = task["player"]
            if task["kind"] == "effect":
                s["tasks"].pop(0)
                if s["status"][p] != "busted" and self._active(s):
                    s.update(pending={"card": task["card"], "player": p}, phase="target",
                             turn=s["order"].index(p))
                    return
                continue
            if not task["remaining"] or s["status"][p] != "active":
                s["tasks"].pop(0)
                if s["status"][p] == "active":
                    s["tasks"][0:0] = [{"kind": "effect", "player": p, "card": c}
                                         for c in task["deferred"]]
                continue
            if not s["deck"]:
                s["shuffle"] += 1
                Random(s["seed"] + s["shuffle"]).shuffle(s["discard"])
                s["deck"], s["discard"] = s["discard"], []
            if not s["deck"]:
                self._finish_round(s)
                return
            card = s["deck"].pop()
            task["remaining"] -= 1
            held = s["table"][p]
            if card.startswith("n-") and any(c.startswith("n-") and
                    c.split("-")[1] == card.split("-")[1] for c in held):
                protection = next((c for c in held if c.startswith("chance-")), None)
                if protection:
                    held.remove(protection)
                    s["discard"].extend([protection, card])
                else:
                    held.append(card)
                    s["status"][p] = "busted"
                continue
            if card.startswith("chance-") and any(c.startswith("chance-") for c in held):
                targets = [q for q in self._active(s) if not any(c.startswith("chance-") for c in s["table"][q])]
                if targets:
                    held.append(card)
                    s.update(pending={"card": card, "player": p}, phase="target", turn=s["order"].index(p))
                    return
                s["discard"].append(card)
                continue
            held.append(card)
            if card.startswith(("freeze-", "three-")):
                if task["batch"]:
                    task["deferred"].append(card)
                else:
                    s.update(pending={"card": card, "player": p}, phase="target", turn=s["order"].index(p))
                    return
            if sum(c.startswith("n-") for c in held) == 7:
                self._finish_round(s)
                return
        if not self._active(s):
            self._finish_round(s)
            return
        index = s["resume"]
        while s["status"][s["order"][index]] != "active":
            index = (index + 1) % len(s["order"])
        s.update(turn=index, phase="playing", pending=None)

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished" or player != s["order"][s["turn"]]:
            return []
        if s["phase"] == "round_over":
            return [legal("Next round", "next_round")]
        if s["pending"]:
            kind = s["pending"]["card"].split("-")[0]
            targets = self._active(s)
            if kind == "chance":
                targets = [p for p in targets if p != player
                           and not any(c.startswith("chance-") for c in s["table"][p])]
            return [legal(f"Give {face(s['pending']['card']).label}", "target_effect", target=p) for p in targets]
        options = [legal("Hit · flip a card", "hit")]
        if s["table"][player]:
            options.append(legal(f"Stay · bank {round_points(s, player)}", "stay"))
        return options

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        if action.type == "next_round":
            for cards in s["table"].values():
                s["discard"].extend(cards)
            self._begin_round(s)
            return s
        if action.type == "target_effect":
            card = s["pending"]["card"]
            kind = card.split("-")[0]
            s.update(pending=None, phase="playing")
            # Public record of who gave which action card, so every seat can see it.
            s.setdefault("effects", []).append(
                {"card": face(card).label, "by": player, "to": action.target})
            if kind == "chance":
                s["table"][player].remove(card)
                s["table"][action.target].append(card)
            else:
                if action.target != player:
                    s["table"][player].remove(card)
                    s["table"][action.target].append(card)
                if kind == "freeze":
                    s["status"][action.target] = "frozen"
                else:
                    s["tasks"].insert(0, {"kind": "draw", "player": action.target, "remaining": 3,
                                          "batch": True, "deferred": []})
        else:
            s["resume"] = (s["turn"] + 1) % len(s["order"])
            if action.type == "stay":
                s["status"][player] = "stayed"
            else:
                s["tasks"] = [{"kind": "draw", "player": player, "remaining": 1,
                               "batch": False, "deferred": []}]
        self._advance(s)
        return s

    def _message(self, s: State) -> str:
        """The instruction for the seat that can act. Every Flip 7 card is public."""
        if s["phase"] == "finished":
            return "A total reached 200, so the match is over. The highest total wins."
        if s["phase"] == "round_over":
            best = max(s["scores"].values())
            tie = " The leaders are tied, so play continues." if best >= 200 else ""
            return (f"Round {s['round']} is banked.{tie} Deal round {s['round'] + 1} "
                    "when everyone has checked the scores.")
        if s["pending"]:
            kind = s["pending"]["card"].split("-")[0]
            if kind == "chance":
                return "You already hold a Second Chance. Give this one to another active player."
            if kind == "freeze":
                return "Choose who receives Freeze. Their round ends and their points are banked."
            return "Choose who must flip three cards. A repeated number busts them."
        actor = s["order"][s["turn"]]
        held = s["table"][actor]
        if not held:
            return "Hit to flip your first card."
        text = f"Hit to flip another card, or stay to bank {round_points(s, actor)}."
        numbers = sorted({int(c.split("-")[1]) for c in held if c.startswith("n-")})
        if any(c.startswith("chance-") for c in held):
            text += " Your Second Chance saves one repeated number."
        elif numbers:
            listed = ", ".join(str(n) for n in numbers[:-1])
            text += f" A repeated {listed + ' or ' if listed else ''}{numbers[-1]} busts you."
        if len(numbers) == 6:
            text += " One more new number ends the round with a 15-point bonus."
        return text

    def project_view(self, s: State, player: str) -> GameView:
        return GameView(
            game_id=self.manifest.id, phase=s["phase"],
            current_player=None if s["phase"] == "finished" else s["order"][s["turn"]],
            players=[PlayerView(id=p, score=s["scores"][p], count=len(s["table"][p]),
                                folded=s["status"][p] != "active", cards=[face(c) for c in s["table"][p]])
                     for p in s["order"]], hand=[], draw_count=len(s["deck"]),
            actions=self.legal_actions(s, player), winners=s["winners"], message=self._message(s),
            detail={"round": s["round"], "status": s["status"], "round_scores": s["round_scores"],
                    "at_risk": {p: round_points(s, p) for p in s["order"]},
                    "pending_card": face(s["pending"]["card"]).label if s["pending"] else "",
                    "dealer": s["order"][s["dealer"]],
                    "effects": [dict(effect) for effect in s.get("effects", [])]},
        )
