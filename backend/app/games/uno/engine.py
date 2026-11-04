from __future__ import annotations

from pydantic import JsonValue

from app.core.cards import draw, rng, shuffle_saved
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
)
from app.games.uno.deck import COLORS, LABELS, deck, label, penalty, points, view

LIMIT = 25


class UnoEngine(BaseEngine):
    def __init__(self, mercy: bool = False):
        self.mercy = mercy
        super().__init__(
            GameManifest(
                id="uno-no-mercy" if mercy else "uno",
                name="Uno No Mercy" if mercy else "Uno",
                subtitle="Big draws, stacking and elimination" if mercy else "Match colors and numbers",
                family="shedding",
                min_players=2,
                max_players=6 if mercy else 10,
                minutes="20–40" if mercy else "10–20",
                icon="layers",
                color="coral",
                settings=[]
                if mercy
                else [
                    Setting(key="stack_draw_two", label="Stack draw-two cards", default=False),
                    Setting(key="seven_zero", label="7 swaps & 0 passes", default=False),
                ],
                rules=[
                    "Match the colour, number or symbol.",
                    "Call UNO when one card remains.",
                    "25 cards means elimination; stack equal or higher draws."
                    if mercy
                    else "Empty your hand first. Draw four may be challenged.",
                ],
            )
        )

    def setup(
        self, players: list[str], settings: dict[str, bool], seed: int | None = None
    ) -> State:
        self.require_players(players)
        cards = deck(self.mercy)
        random = rng(seed)
        random.shuffle(cards)
        state: State = {
            "game": self.manifest.id,
            "phase": "playing",
            "order": players,
            "turn": 0,
            "direction": 1,
            "deck": cards,
            "discard": [],
            "hands": {p: [cards.pop() for _ in range(7)] for p in players},
            "settings": settings,
            "penalty": 0,
            "penalty_floor": 0,
            "eliminated": [],
            "called": [],
            "catchable": None,
            "drawn": None,
            "pending": None,
            "winners": [],
            "scores": {p: 0 for p in players},
            "message": "Match the top card.",
        }
        rejected = []
        while True:
            first = cards.pop()
            if (self.mercy and first.split(":")[1].isdigit()) or (
                not self.mercy and first.split(":")[1] != "wild4"
            ):
                break
            rejected.append(first)
        if self.mercy:
            state["discard"] = [*rejected, first]
        else:
            cards.extend(rejected)
            if rejected:
                random.shuffle(cards)
            state["discard"] = [first]
        state["color"] = first.split(":")[0]
        if not self.mercy:
            kind = first.split(":")[1]
            self._event(state, "opening", None, kind=kind)
            if kind == "wild":
                state["pending"] = {"type": "opening_color"}
            elif kind == "draw2":
                state["last_event"]["skipped"] = [players[0]]
                self._take(state, players[0], 2)
                self._advance(state)
            elif kind == "skip":
                state["last_event"]["skipped"] = [players[0]]
                self._advance(state)
            elif kind == "reverse":
                state["direction"], state["turn"] = -1, len(players) - 1
        self._prompt(state)
        return state

    def _advance(self, s: State, steps: int = 1) -> None:
        for _ in range(steps):
            s["turn"] = (s["turn"] + s["direction"]) % len(s["order"])
            while s["order"][s["turn"]] in s["eliminated"]:
                s["turn"] = (s["turn"] + s["direction"]) % len(s["order"])
        s["drawn"] = None

    def _event(self, s: State, event: str, actor: str | None, **extra: object) -> None:
        """What the latest action did, in public terms; drawn faces stay with their owner."""
        s["last_event"] = {
            "type": event, "actor": actor, "kind": None, "color": None, "target": None,
            "outcome": None, "discarded": 0, "skipped": [], "drew": {}, "cards": {},
            "eliminated": [], **extra,
        }

    def _take(self, s: State, player: str, count: int) -> None:
        taken: list[str] = []
        for _ in range(count):
            if not s["deck"] and len(s["discard"]) < 2:
                for out in s["eliminated"]:
                    s["deck"].extend(s["hands"][out])
                    s["hands"][out] = []
                shuffle_saved(s, s["deck"])
            if not s["deck"] and len(s["discard"]) < 2:
                break
            cards = draw(s)
            s["hands"][player].extend(cards)
            taken.extend(cards)
        event = s.get("last_event")
        if event is not None and taken:
            event["drew"][player] = event["drew"].get(player, 0) + len(taken)
            event["cards"].setdefault(player, []).extend(taken)
        if self.mercy and len(s["hands"][player]) >= LIMIT and player not in s["eliminated"]:
            s["eliminated"].append(player)
            s.setdefault("out", {})[player] = len(s["hands"][player])
            if event is not None:
                event["eliminated"].append(player)

    def _can_play(self, s: State, card: str, player: str) -> bool:
        color, kind, _ = card.split(":")
        if s["penalty"]:
            return (
                (self.mercy or s["settings"].get("stack_draw_two", False))
                and penalty(card) >= s["penalty_floor"]
                and (self.mercy or kind == "draw2")
            )
        if s["drawn"] and card != s["drawn"]:
            return False
        return color == "wild" or color == s["color"] or kind == s["discard"][-1].split(":")[1]

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["winners"] or player in s["eliminated"]:
            return []
        actions = []
        if len(s["hands"].get(player, [])) == 1 and player not in s["called"]:
            actions.append(legal("UNO!", "uno"))
        if s["catchable"] and s["catchable"] != player:
            actions.append(legal("Catch missed UNO", "catch_uno", target=s["catchable"]))
        if s["order"][s["turn"]] != player:
            return actions
        pending = s["pending"]
        if pending:
            if pending["type"] in {"roulette", "opening_color"}:
                return [legal(f"Choose {c.title()}", "choose", color=c) for c in COLORS]
            if pending["type"] == "challenge":
                return [legal("Take 4 cards", "accept"), legal("Challenge +4", "challenge")]
        for card in s["hands"][player]:
            if not self._can_play(s, card, player):
                continue
            color, kind, _ = card.split(":")
            targets = (
                [p for p in s["order"] if p != player and p not in s["eliminated"]]
                if kind == "7" and (self.mercy or s["settings"].get("seven_zero"))
                else [None]
            )
            for c in COLORS if color == "wild" and kind != "roulette" else [None]:
                for target in targets:
                    actions.append(
                        legal(
                            f"Play {label(card)}" + (f" · {c.title()}" if c else ""),
                            "play",
                            card=card,
                            color=c,
                            target=target,
                        )
                    )
        held = len(s["hands"][player])
        if s["penalty"]:
            out = self.mercy and held + s["penalty"] >= LIMIT
            actions.append(legal(f"Draw {s['penalty']}" + (" — you’re out" if out else ""), "draw"))
        elif not s["drawn"]:
            if not self.mercy or not any(a.action.type == "play" for a in actions):
                actions.append(
                    legal(
                        ("Draw a card — you’re out" if held + 1 >= LIMIT else "Draw until playable")
                        if self.mercy
                        else "Draw a card",
                        "draw",
                    )
                )
        elif not self.mercy:
            actions.append(legal("Pass", "end_turn"))
        return actions

    def _finish(self, s: State) -> None:
        active = [p for p in s["order"] if p not in s["eliminated"]]
        winner = next((p for p in active if not s["hands"][p]), None)
        if len(active) == 1:
            winner = active[0]
        if winner:
            if not self.mercy:
                # The classic final draw is included in scoring; +4 keeps its challenge window.
                if s["pending"] and s["pending"]["type"] == "challenge":
                    return
                if s["penalty"]:
                    self._take(s, s["order"][s["turn"]], s["penalty"])
                    s["penalty"] = s["penalty_floor"] = 0
            s["winners"] = [winner]
            s["scores"][winner] = sum(
                points(c) for p in active if p != winner for c in s["hands"][p]
            ) + (250 * len(s["eliminated"]) if self.mercy else 0)
            s["phase"] = "finished"

    def _following(self, s: State, turn: int) -> int:
        turn = (turn + s["direction"]) % len(s["order"])
        while s["order"][turn] in s["eliminated"]:
            turn = (turn + s["direction"]) % len(s["order"])
        return turn

    def _prompt(self, s: State) -> None:
        """The instruction for whoever acts next, from public facts only.

        The banner shows it to that player; the last move itself is attributed
        from public history, so it is never restated here.
        """
        if s["winners"]:
            out = len(s["eliminated"])
            if self.mercy and s["hands"][s["winners"][0]]:
                s["message"] = f"Last player standing after {out} elimination{'' if out == 1 else 's'}."
            else:
                s["message"] = "Hand emptied. The winner scores the cards left in the other hands" + (
                    f", plus 250 for each of the {out} eliminated." if self.mercy and out else "."
                )
            return
        held = len(s["hands"][s["order"][s["turn"]]])
        pending = s["pending"]
        if pending and pending["type"] == "opening_color":
            s["message"] = "Choose the opening colour."
        elif pending and pending["type"] == "challenge":
            s["message"] = "Take 4 cards, or challenge the Wild +4."
        elif pending and pending["type"] == "roulette":
            s["message"] = f"Name a colour, then draw until it appears (out at {LIMIT} cards)."
        elif s["penalty"]:
            if self.mercy:
                out = held + s["penalty"] >= LIMIT
                s["message"] = f"Stack +{s['penalty_floor']} or higher, or draw {s['penalty']}" + (
                    " — drawing puts you out." if out else "."
                )
            elif s["settings"].get("stack_draw_two", False):
                s["message"] = f"Stack a +2, or draw {s['penalty']}."
            else:
                s["message"] = f"Draw {s['penalty']}; your turn then passes."
        elif s["drawn"]:
            s["message"] = "Play the card you drew" + ("." if self.mercy else ", or pass.")
        else:
            color, kind, _ = s["discard"][-1].split(":")
            match = f"Match {s['color'].title()}" + (
                "" if color == "wild" else f" or {LABELS.get(kind, kind)}"
            )
            s["message"] = match + (
                (f". Drawing now puts you out at {LIMIT} cards." if held + 1 >= LIMIT
                 else ", or draw until you can.")
                if self.mercy
                else ", or draw a card."
            )

    def apply_action(self, state: State, player: str, action: Action) -> State:
        options = self.legal_actions(state, player)
        if action not in [o.action for o in options]:
            raise RuleError("That card or action cannot be played now.")
        s = self.copy(state)
        if action.type == "uno":
            s["called"].append(player)
            s["catchable"] = None if s["catchable"] == player else s["catchable"]
            return s
        if action.type == "catch_uno":
            self._event(s, "catch_uno", player, target=action.target)
            self._take(s, action.target, 2)
            s["catchable"] = None
            self._finish(s)
            self._prompt(s)
            return s
        s["catchable"] = None
        s["called"] = [p for p in s["called"] if len(s["hands"][p]) == 1]
        self._event(s, action.type, player)
        if action.type in ("accept", "challenge"):
            pending = s["pending"]
            s["pending"] = None
            s["last_event"]["target"] = pending["actor"]
            if action.type == "challenge":
                s["last_event"]["outcome"] = "succeeded" if pending["illegal"] else "failed"
            if action.type == "challenge" and pending["illegal"]:
                self._take(s, pending["actor"], 4)
            else:
                self._take(s, player, 6 if action.type == "challenge" else 4)
                self._advance(s)
        elif action.type == "choose":
            opening = s["pending"]["type"] == "opening_color"
            s["color"] = action.color
            s["last_event"].update(kind="opening" if opening else "roulette", color=action.color)
            if not opening:
                while player not in s["eliminated"]:
                    before = len(s["hands"][player])
                    self._take(s, player, 1)
                    if (
                        len(s["hands"][player]) == before
                        or s["hands"][player][-1].split(":")[0] == action.color
                    ):
                        break
            s["pending"] = None
            if not opening:
                self._advance(s)
        elif action.type == "draw":
            if s["penalty"]:
                s["last_event"]["kind"] = "penalty"
                self._take(s, player, s["penalty"])
                s["penalty"] = s["penalty_floor"] = 0
                self._advance(s)
            else:
                while True:
                    before = len(s["hands"][player])
                    self._take(s, player, 1)
                    if player in s["eliminated"] or len(s["hands"][player]) == before:
                        self._advance(s)
                        break
                    card = s["hands"][player][-1]
                    if not self.mercy or self._can_play(s, card, player):
                        s["drawn"] = card
                        if not self._can_play(s, card, player):
                            self._advance(s)
                        break
        elif action.type == "end_turn":
            self._advance(s)
        elif action.type == "play":
            card = action.card
            color, kind, _ = card.split(":")
            illegal_wild = kind == "wild4" and any(
                c.split(":")[0] == s["color"] for c in s["hands"][player] if c != card
            )
            s["hands"][player].remove(card)
            s["discard"].append(card)
            # The colour a Wild +4 challenge is judged against, already public on the table.
            s["last_event"]["from_color"] = s["color"]
            s["color"] = action.color or color
            s["last_event"].update(kind=kind, color=s["color"], target=action.target)
            if kind == "discard_all":
                extras = [c for c in s["hands"][player] if c.split(":")[0] == color]
                s["hands"][player] = [c for c in s["hands"][player] if c not in extras]
                s["discard"][-1:-1] = extras
                s["last_event"]["discarded"] = len(extras)
            # No Mercy ends as soon as the final card is played, before a 7/0
            # could transfer the newly empty hand to another player.
            final_mercy_card = self.mercy and not s["hands"][player]
            if kind == "7" and action.target and not final_mercy_card:
                s["hands"][player], s["hands"][action.target] = (
                    s["hands"][action.target],
                    s["hands"][player],
                )
            if (
                kind == "0"
                and (self.mercy or s["settings"].get("seven_zero"))
                and not final_mercy_card
            ):
                active = [p for p in s["order"] if p not in s["eliminated"]]
                old = {p: s["hands"][p] for p in active}
                for i, p in enumerate(active):
                    s["hands"][active[(i + s["direction"]) % len(active)]] = old[p]
            active_count = len(s["order"]) - len(s["eliminated"])
            if kind in ("reverse", "reverse4"):
                s["direction"] *= -1
            steps = (
                2
                if kind == "skip" or kind == "reverse" and active_count == 2
                else 0
                if kind == "skip_all" or kind == "reverse4" and active_count == 2
                else 1
            )
            if steps == 2:
                s["last_event"]["skipped"] = [s["order"][self._following(s, s["turn"])]]
            elif kind == "skip_all":
                s["last_event"]["skipped"] = [
                    p for p in s["order"] if p != player and p not in s["eliminated"]
                ]
            self._advance(s, steps)
            if kind == "wild4":
                s["pending"] = {"type": "challenge", "illegal": illegal_wild, "actor": player}
            elif kind == "roulette":
                s["pending"] = {"type": "roulette"}
            elif penalty(card):
                s["penalty"] += penalty(card)
                s["penalty_floor"] = penalty(card)
            for p in s["order"]:
                if len(s["hands"][p]) == 1 and p not in s["called"]:
                    s["catchable"] = p
        self._finish(s)
        self._prompt(s)
        return s

    def project_view(self, s: State, player: str) -> GameView:
        following = next((
            s["order"][(s["turn"] + distance * s["direction"]) % len(s["order"])]
            for distance in range(1, len(s["order"]) + 1)
            if s["order"][(s["turn"] + distance * s["direction"]) % len(s["order"])]
            not in s["eliminated"]
        ), None)
        return GameView(
            game_id=self.manifest.id,
            phase=s["phase"],
            current_player=s["order"][s["turn"]],
            players=[
                PlayerView(
                    id=p,
                    count=len(s["hands"][p]),
                    score=s["scores"][p],
                    eliminated=p in s["eliminated"],
                )
                for p in s["order"]
            ],
            hand=[view(c) for c in s["hands"].get(player, [])],
            discard=view(s["discard"][-1]),
            draw_count=len(s["deck"]),
            message=s["message"],
            actions=self.legal_actions(s, player),
            winners=s["winners"],
            detail={
                "color": s["color"], "penalty": s["penalty"], "direction": s["direction"],
                "pending_kind": s["pending"]["type"] if s["pending"] else None,
                "next_player": following,
                "elimination_limit": LIMIT if self.mercy else None,
                "last_event": self._public_event(s),
                # Only the viewer's own new cards, and only while still in their hand.
                "you_drew": [
                    c for c in (s.get("last_event") or {}).get("cards", {}).get(player, [])
                    if c in s["hands"].get(player, [])
                ],
                "out": [
                    {"player": p, "cards": s.get("out", {}).get(p, len(s["hands"][p]))}
                    for p in s["eliminated"]
                ],
            },
        )

    @staticmethod
    def _public_event(s: State) -> dict[str, JsonValue] | None:
        """Who did what to whom and how many cards moved; never a drawn face."""
        event = s.get("last_event")
        if not event:
            return None
        return {
            "type": event["type"], "actor": event["actor"], "kind": event["kind"],
            "color": event["color"], "from_color": event.get("from_color"),
            "target": event["target"], "outcome": event["outcome"],
            "discarded": event["discarded"], "skipped": list(event["skipped"]),
            "drew": dict(event["drew"]), "eliminated": list(event["eliminated"]),
        }
