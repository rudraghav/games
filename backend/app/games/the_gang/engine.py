"""The Gang's basic cooperative game: four chip rounds and ranked showdowns."""

from random import Random

from app.core.cards import card_view, poker_rank, rng, standard_deck
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

STREETS = ("Preflop", "Flop", "Turn", "River")
HAND_NAMES = ("High card", "Pair", "Two pair", "Three of a kind", "Straight", "Flush",
              "Full house", "Four of a kind", "Straight flush")


def hand_name(cards: list[str]) -> str:
    rank = poker_rank(cards)
    return "Royal flush" if rank == (8, 14) else HAND_NAMES[rank[0]]


class GangEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(GameManifest(
            id="the-gang", name="The Gang", subtitle="One crew. Three vaults. No poker faces spared.",
            family="cooperative-poker", min_players=3, max_players=6, minutes="20–30",
            icon="spade", color="pine", rules_version="basic-1", play_mode="cooperative",
            score_label="Vaults", score_order="high", rules=[
                "Basic cooperative game. Win three vaults before three alarms. No betting or money.",
                "Two private pocket cards; reveal the flop, turn and river across four chip rounds.",
                "Take or steal a current-color chip, or return yours. One star means weakest; the highest means strongest.",
                "The instant everyone holds a chip, that round ends. Earlier chip colors remain as public history.",
                "Reveal in red-chip order. Best five-of-seven poker hands must be equally strong or stronger each time; exact ties are fine.",
                "Do not share information about your own hand. Challenge/specialist and advanced modes are not included.",
            ],
        ))

    def setup(self, players: list[str], settings: dict[str, bool], seed: int | None = None) -> State:
        self.require_players(players)
        s: State = {"order": players, "turn": 0, "phase": "chips", "heist": 0,
                    "vaults": 0, "alarms": 0, "seed": rng(seed).randrange(2**63),
                    "winners": [], "last_success": None}
        self._deal(s)
        return s

    def _deal(self, s: State) -> None:
        s["heist"] += 1
        deck = standard_deck()
        Random(s["seed"] + s["heist"]).shuffle(deck)
        s.update(deck=deck, hands={p: [deck.pop(), deck.pop()] for p in s["order"]},
                 board=[], chips=dict.fromkeys(s["order"]), history=[], revealed=[], street=0,
                 phase="chips", turn=0, last_success=None,
                 message="Estimate your pocket cards. Everyone can take a white chip.")

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if player not in s["order"] or s["phase"] == "finished":
            return []
        if s["phase"] == "chips":
            actions = [legal(f"Take {rank}-star chip", "claim_chip", amount=rank)
                       for rank in range(1, len(s["order"]) + 1) if s["chips"][player] != rank]
            if s["chips"][player] is not None:
                actions.append(legal("Return my chip", "return_chip"))
            return actions
        if player != s["order"][s["turn"]]:
            return []
        return [legal("Reveal my hand", "reveal_hand")] if s["phase"] == "showdown" else [
            legal("Next heist", "next_heist")]

    def _complete_chips(self, s: State) -> None:
        s["history"].append(dict(s["chips"]))
        if s["street"] == 3:
            first = min(s["order"], key=lambda p: s["chips"][p])
            s.update(phase="showdown", turn=s["order"].index(first),
                     message="Red chips are locked. Reveal hands from weakest chip to strongest.")
        else:
            s["street"] += 1
            s["board"].extend(s["deck"].pop() for _ in range(3 if s["street"] == 1 else 1))
            s.update(chips=dict.fromkeys(s["order"]), turn=0,
                     message=f"{STREETS[s['street']]}. Estimate again using the new community cards.")

    def _settle(self, s: State) -> None:
        ordered = sorted(s["order"], key=lambda p: s["chips"][p])
        ranks = [poker_rank(s["hands"][p] + s["board"]) for p in ordered]
        success = all(a <= b for a, b in zip(ranks, ranks[1:], strict=False))
        s["vaults" if success else "alarms"] += 1
        s.update(last_success=success, turn=0, phase="heist_review",
                 message="Vault cracked. The order was right!" if success else "Alarm triggered. At least one hand was out of order.")
        if s["vaults"] == 3:
            s.update(phase="finished", winners=list(s["order"]), message="Three vaults cracked. The whole crew wins!")
        elif s["alarms"] == 3:
            s.update(phase="finished", message="Three alarms. The heist is over; regroup for another attempt.")

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        if action.type == "next_heist":
            self._deal(s)
        elif action.type == "reveal_hand":
            s["revealed"].append(player)
            remaining = [p for p in sorted(s["order"], key=lambda p: s["chips"][p]) if p not in s["revealed"]]
            if remaining:
                s["turn"] = s["order"].index(remaining[0])
                s["message"] = "Hand revealed. The next chip reveals now."
            else:
                self._settle(s)
        else:
            if action.type == "return_chip":
                s["chips"][player] = None
                s["message"] = "Chip returned. Everyone can revise their estimate."
            else:
                for owner in s["order"]:
                    if s["chips"][owner] == action.amount:
                        s["chips"][owner] = None
                s["chips"][player] = action.amount
                s["message"] = f"{action.amount}-star chip chosen. Revise until everyone holds a chip."
            pending = [p for p in s["order"] if s["chips"][p] is None]
            if pending:
                s["turn"] = s["order"].index(pending[0])
            else:
                self._complete_chips(s)
        return s

    def project_view(self, s: State, player: str) -> GameView:
        own = s["hands"].get(player, [])
        return GameView(
            game_id=self.manifest.id, phase=s["phase"],
            current_player=None if s["phase"] == "finished" else s["order"][s["turn"]],
            players=[PlayerView(id=p, count=2, score=s["vaults"],
                                cards=[card_view(c) for c in s["hands"][p]] if p in s["revealed"] else [None, None])
                     for p in s["order"]], hand=[card_view(c) for c in own],
            community=[card_view(c) for c in s["board"]], draw_count=len(s["deck"]),
            actions=self.legal_actions(s, player), winners=s["winners"], message=s["message"],
            detail={"heist": s["heist"], "street": s["street"], "vaults": s["vaults"],
                    "alarms": s["alarms"], "chips": s["chips"], "history": s["history"],
                    "revealed": s["revealed"], "last_success": s["last_success"],
                    "own_hand_name": hand_name(own + s["board"]) if own and len(s["board"]) >= 3 else None,
                    "decision_mode": "simultaneous" if s["phase"] == "chips" else "turn",
                    "pending_players": [p for p in s["order"] if s["chips"][p] is None] if s["phase"] == "chips" else [],
                    "hand_names": {p: hand_name(s["hands"][p] + s["board"]) for p in s["revealed"]}},
        )
