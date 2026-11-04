"""Private draw/inspection decisions, optional duos and cumulative round scoring."""

from itertools import combinations
from random import Random

from pydantic import JsonValue

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
from app.games.sea_salt_paper.deck import BY_ID, CARDS, card_points, color_bonus

DRAW_MESSAGE = "Draw two from the stock and keep one, or take the top card of a discard pile."
PLAY_MESSAGE = "Play any duos you want, then finish your turn."


def pair_kind(cards: list[str]) -> str | None:
    kinds = [BY_ID[c].kind for c in cards]
    if kinds[0] == kinds[1] and kinds[0] in {"crab", "boat", "fish"}:
        return kinds[0]
    return "steal" if set(kinds) == {"shark", "swimmer"} else None


class PaperEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(GameManifest(
            id="sea-salt-paper", name="Sea Salt & Paper", subtitle="Collect sets and play card pairs",
            family="paper", min_players=2, max_players=4, minutes="15–25", icon="sailboat",
            color="sky", rules_version="base58-exhaust-1", rules=[
                "58-card base edition. Take a discard top, or draw two, keep one and discard the other.",
                "Play duos: crabs search one discard, boats repeat your turn, fish draw, shark+swimmer steal.",
                "Played and unplayed cards both score. At 7+ points, choose Stop or bet on Last Chance.",
                "Last Chance reveals/protects hands. A successful caller scores cards+color; others color only. Failed caller scores color only.",
                "Games exhaustion convention: an empty stock at turn end cancels scoring, including unfinished Last Chance. Stop scores immediately.",
                "Targets 40/35/30 at 2/3/4 seats; all four mermaids win instantly.",
            ],
        ))

    def setup(self, players: list[str], settings: dict[str, bool], seed: int | None = None) -> State:
        self.require_players(players)
        s: State = {"order": players, "turn": 0, "phase": "draw", "scores": dict.fromkeys(players, 0),
                    "winners": [], "round": 0, "seed": Random(seed).randrange(2**63), "randomness": 0,
                    "target": {2: 40, 3: 35, 4: 30}[len(players)], "starter": 0,
                    "round_result": {}, "last_round": None, "private_events": {},
                    "message": DRAW_MESSAGE}
        self._round(s)
        return s

    def _round(self, s: State) -> None:
        s["round"] += 1
        cards = [card.id for card in CARDS]
        Random(s["seed"] + s["round"]).shuffle(cards)
        s.update(deck=cards, piles=[[cards.pop()], [cards.pop()]],
                 hands={p: [] for p in s["order"]}, played={p: [] for p in s["order"]},
                 phase="draw", turn=s["starter"], draft=[], protected=[], final_queue=[],
                 caller=None, crab_pile=None, instant_mermaids=None, round_result={},
                 private_events={}, message=DRAW_MESSAGE)

    def _all(self, s: State, p: str) -> list[str]:
        return s["hands"][p] + s["played"][p]

    def _note(self, s: State, player: str, kind: str, card: str, other: str | None = None) -> None:
        """Remember a private outcome for one seat only; projected to nobody else."""
        events = s.setdefault("private_events", {}).setdefault(player, [])
        events.append({"kind": kind, "card": card, "other": other})
        del events[:-4]

    @staticmethod
    def _event_view(event: dict[str, JsonValue]) -> dict[str, JsonValue]:
        """A seat's own notice. A victim learns only the name of the card they lost:
        its identity now sits in another private hand, so no card view or ID is sent."""
        card = BY_ID[str(event["card"])]
        return {"kind": event["kind"], "other": event["other"],
                "name": f"{card.color.title()} {card.view().value}",
                "card": None if event["kind"] == "stolen" else card.view().model_dump()}

    def _final_turn_message(self, s: State) -> str:
        points = card_points(self._all(s, s["caller"]))
        return f"Last Chance: this is your final turn. Beat {points} card points or the caller wins the bet."

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished" or player != s["order"][s["turn"]]:
            return []
        phase = s["phase"]
        if phase == "round_over":
            return [legal("Next round", "next_round")]
        if phase == "draw":
            options = [legal("Draw from deck", "take_stock")] if s["deck"] else []
            return options + [legal(f"Take discard {i + 1}", "take_discard", choice=str(i))
                              for i, pile in enumerate(s["piles"]) if pile]
        if phase == "choosing":
            empty = [i for i, pile in enumerate(s["piles"]) if not pile]
            return [legal(f"Keep {BY_ID[card].view().label}; discard other to pile {i + 1}",
                          "keep", card=card, choice=str(i)) for card in s["draft"] for i in empty or [0, 1]]
        if phase == "crab_pile":
            return [legal(f"Inspect discard {i + 1}", "inspect", choice=str(i))
                    for i, pile in enumerate(s["piles"]) if pile]
        if phase == "crab_card":
            return [legal(f"Take {BY_ID[card].view().label}", "take_inspected", card=card)
                    for card in s["piles"][s["crab_pile"]]]
        if phase == "steal":
            return [legal("Steal a random card", "steal", target=p) for p in s["order"]
                    if p != player and p not in s["protected"] and s["hands"][p]]
        options = []
        if sum(BY_ID[c].kind == "mermaid" for c in self._all(s, player)) == 4:
            options.append(legal("Reveal all four mermaids · win", "reveal_mermaids"))
        for cards in combinations(sorted(s["hands"][player]), 2):
            kind = pair_kind(list(cards))
            if kind:
                options.append(legal(f"Play {kind} duo", "pair", cards=list(cards)))
        if not s["caller"] and card_points(self._all(s, player)) >= 7:
            options.extend([legal("Stop · bank card points", "stop"),
                            legal("Last Chance · bet on your hand", "last_chance")])
        options.append(legal("Finish turn", "end_turn"))
        return options

    def _finish(self, s: State, *, exhausted: bool = False, stopper: str | None = None) -> None:
        values = {p: card_points(self._all(s, p)) for p in s["order"]}
        bonuses = {p: color_bonus(self._all(s, p)) for p in s["order"]}
        caller = s["caller"]
        if exhausted:
            awards = dict.fromkeys(s["order"], 0)
        elif caller:
            won = values[caller] == max(values.values())
            awards = {p: values[p] + bonuses[p] if p == caller and won else
                      bonuses[p] if p == caller or won else values[p] for p in s["order"]}
        else:
            awards = values
        for p in s["order"]:
            s["scores"][p] += awards[p]
        s.update(protected=list(s["order"]), phase="round_over", draft=[],
                 round_result={p: {"card_points": values[p], "color_bonus": bonuses[p], "award": awards[p]}
                               for p in s["order"]}, final_queue=[])
        outcome = "exhausted" if exhausted else ("caller_won" if won else "caller_lost") if caller else "stopped"
        s["last_round"] = {"round": s["round"], "outcome": outcome, "caller": caller, "stopper": stopper,
                           "result": dict(s["round_result"])}
        s["starter"] = (s["turn"] + 1) % len(s["order"]) if exhausted or not caller else (s["order"].index(caller) + 1) % len(s["order"])
        s["turn"] = s["starter"]
        s["message"] = ("The stock ran out, so this round scores no points. Start the next round when ready."
                        if exhausted else "Check the round scores, then start the next round.")
        if max(s["scores"].values()) >= s["target"]:
            best = max((s["scores"][p], awards[p]) for p in s["order"])
            s.update(phase="finished", winners=[p for p in s["order"] if (s["scores"][p], awards[p]) == best],
                     message="The final tide. Every collection and color counted.")

    def _end_turn(self, s: State) -> None:
        if not s["deck"]:
            self._finish(s, exhausted=True)
        elif s["caller"]:
            p = s["order"][s["turn"]]
            s["protected"].append(p)
            if s["final_queue"]:
                s["turn"] = s["order"].index(s["final_queue"].pop(0))
                s.update(phase="draw", message=self._final_turn_message(s))
            else:
                self._finish(s)
        else:
            s.update(turn=(s["turn"] + 1) % len(s["order"]), phase="draw", message=DRAW_MESSAGE)

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        kind = action.type
        if kind in {"take_stock", "take_discard"}:
            # A seat's private notices last until it starts drawing again.
            s.setdefault("private_events", {}).pop(player, None)
        if kind == "next_round":
            self._round(s)
        elif kind == "take_stock":
            s["draft"] = [s["deck"].pop() for _ in range(min(2, len(s["deck"])))]
            s["phase"] = "choosing"
            s["message"] = "Keep one of your two drawn cards. The other goes face up on a discard pile."
            if len(s["draft"]) == 1:
                s["hands"][player].append(s["draft"].pop())
                s["phase"] = "playing"
                s["message"] = "The last stock card is in your hand. " + PLAY_MESSAGE
        elif kind == "take_discard":
            s["hands"][player].append(s["piles"][int(action.choice)].pop())
            s["phase"] = "playing"
            s["message"] = PLAY_MESSAGE
        elif kind == "keep":
            s["hands"][player].append(action.card)
            s["draft"].remove(action.card)
            s["piles"][int(action.choice)].append(s["draft"].pop())
            s["phase"] = "playing"
            s["message"] = PLAY_MESSAGE
        elif kind == "pair":
            for card in action.cards:
                s["hands"][player].remove(card)
                s["played"][player].append(card)
            effect = pair_kind(action.cards)
            name = "shark and swimmer" if effect == "steal" else effect
            s["message"] = f"Your {name} duo has no effect now. {PLAY_MESSAGE}"
            if effect == "boat":
                s["phase"] = "draw" if s["deck"] or any(s["piles"]) else "playing"
                if s["phase"] == "draw":
                    s["message"] = "Boat duo: take another turn. " + DRAW_MESSAGE
            elif effect == "fish" and s["deck"]:
                drawn = s["deck"].pop()
                s["hands"][player].append(drawn)
                self._note(s, player, "fish", drawn)
                s["message"] = f"Fish duo: you drew the top stock card. {PLAY_MESSAGE}"
            elif effect == "crab" and any(s["piles"]):
                s["phase"] = "crab_pile"
                s["message"] = "Crab duo: choose a discard pile to search."
            elif effect == "steal" and any(p != player and p not in s["protected"] and s["hands"][p] for p in s["order"]):
                s["phase"] = "steal"
                s["message"] = "Shark and swimmer: choose a player to steal a random card from."
        elif kind == "inspect":
            s.update(crab_pile=int(action.choice), phase="crab_card",
                     message=f"Take any one card from discard pile {int(action.choice) + 1}. Only you see this pile.")
        elif kind == "take_inspected":
            s["piles"][s["crab_pile"]].remove(action.card)
            s["hands"][player].append(action.card)
            self._note(s, player, "crab", action.card)
            s.update(crab_pile=None, phase="playing", message=PLAY_MESSAGE)
        elif kind == "steal":
            s["randomness"] += 1
            index = Random(s["seed"] + s["randomness"]).randrange(len(s["hands"][action.target]))
            stolen = s["hands"][action.target].pop(index)
            s["hands"][player].append(stolen)
            # Only the two seats involved learn which card moved.
            self._note(s, player, "stole", stolen, action.target)
            self._note(s, action.target, "stolen", stolen, player)
            s.update(phase="playing", message=PLAY_MESSAGE)
        elif kind == "reveal_mermaids":
            s.update(phase="finished", winners=[player], protected=list(s["order"]),
                     instant_mermaids=player, message="All four mermaids! An instant game win.")
            s["last_round"] = {"round": s["round"], "outcome": "mermaids", "caller": None,
                               "stopper": player, "result": {}}
        elif kind == "stop":
            self._finish(s, stopper=player)
        elif kind == "last_chance":
            s["caller"] = player
            s["protected"] = [player]
            order = s["order"][s["turn"] + 1:] + s["order"][:s["turn"]]
            s["turn"] = s["order"].index(order[0])
            s.update(final_queue=order[1:], phase="draw")
            s["message"] = self._final_turn_message(s)
        else:
            self._end_turn(s)
        return s

    def project_view(self, s: State, player: str) -> GameView:
        private = []
        if player == s["order"][s["turn"]]:
            if s["phase"] == "choosing":
                private = s["draft"]
            elif s["phase"] == "crab_card":
                private = list(reversed(s["piles"][s["crab_pile"]]))
        seated = player in s["order"]
        points = card_points(self._all(s, player)) if seated else 0
        bonus = color_bonus(self._all(s, player)) if seated else 0
        # Only the viewer's own totals: the stakes of their own Stop or Last Chance.
        bet = (f"Your hand is revealed and protected; each opponent takes one final turn. "
               f"If no one ends with more than your {points} card points, you score {points + bonus} "
               f"({points} + color bonus {bonus}) and the others score only their color bonus. "
               f"Otherwise you score only your color bonus ({bonus}) and they score their card points.")
        endings: dict[str, JsonValue] = {
            "stop": f"End the round: everyone scores their card points now (you: {points}). No color bonus.",
            "last_chance": bet + " " + (
                "Stock empty: opponents may take discards, but the first finished final turn "
                "ends the round with no points. Four mermaids still win immediately."
                if not s["deck"] else
                "If the stock runs out at the end of a final turn, the round scores no points."
            ),
            "end_turn": (
                "Stock empty: finishing ends this round with no points for anyone."
                if not s["deck"] else
                "Protect your hand and continue the final turns."
                if s["caller"] and s["final_queue"] else
                "Protect your hand and score the Last Chance result."
                if s["caller"] else "Pass play to the next player."
            ),
        }
        return GameView(
            game_id=self.manifest.id, phase=s["phase"],
            current_player=None if s["phase"] == "finished" else s["order"][s["turn"]],
            players=[PlayerView(id=p, score=s["scores"][p], count=len(s["hands"][p]),
                                bank=[BY_ID[c].view() for c in s["played"][p]],
                                cards=[BY_ID[c].view() for c in s["hands"][p]] if p in s["protected"] else [])
                     for p in s["order"]], hand=[BY_ID[c].view() for c in s["hands"].get(player, [])],
            draw_count=len(s["deck"]), winners=s["winners"], actions=self.legal_actions(s, player), message=s["message"],
            detail={"round": s["round"], "target": s["target"], "caller": s["caller"],
                    "protected": s["protected"], "pile_counts": [len(p) for p in s["piles"]],
                    "discard_tops": [BY_ID[p[-1]].view().model_dump() if p else None for p in s["piles"]],
                    "private_options": [BY_ID[c].view().model_dump() for c in private],
                    "own_points": card_points(self._all(s, player)) if player in s["order"] else 0,
                    "own_bonus": color_bonus(self._all(s, player)) if player in s["order"] else 0,
                    "round_result": s["round_result"], "instant_mermaids": s["instant_mermaids"],
                    "ending_consequences": endings,
                    # Revealed (protected) hands are public, so their card points are too.
                    "protected_points": {p: card_points(self._all(s, p)) for p in s["protected"]},
                    # Which pile a crab duo is searching is public; its contents are not.
                    "crab_pile": s["crab_pile"],
                    "last_round": s.get("last_round"),
                    "private_events": [self._event_view(event)
                                       for event in s.get("private_events", {}).get(player, [])]},
        )
