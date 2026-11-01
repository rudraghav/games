"""Three original social games with private, lock-on-submit party decisions."""

from typing import Literal

from app.core.cards import rng
from app.core.contracts import (
    Action,
    BaseEngine,
    GameManifest,
    GameView,
    LegalAction,
    PlayerView,
    Setting,
    State,
    legal,
    validate_action,
)
from app.games.party.prompts import HOT_SEAT, LIKELY, SPILL

Mode = Literal["spill-or-chill", "most-likely", "hot-seat"]
META: dict[Mode, tuple[str, str, str]] = {
    "spill-or-chill": ("Spill or Chill", "A good story. Zero pressure.", "coral"),
    "most-likely": ("Most Likely", "Secret votes. Extremely public personalities.", "ochre"),
    "hot-seat": ("Hot Seat", "How well do your friends really know you?", "sage"),
}


class PartyEngine(BaseEngine):
    def __init__(self, mode: Mode) -> None:
        self.mode = mode
        name, subtitle, color = META[mode]
        mode_rules = {
            "spill-or-chill": [
                "The spotlight player answers aloud and chooses Share, Chill or Pass.",
                "Share and Chill both earn one participation point. Pass earns zero.",
                "No answers are recorded. The most participation points wins.",
            ],
            "most-likely": [
                "Everyone secretly votes for another player, or passes. No self-votes.",
                "Votes lock on submission and reveal together. Tied positive leaders each earn a point.",
                "All-pass rounds award no points. Most spotlight points wins.",
            ],
            "hot-seat": [
                "The spotlight player privately chooses A or B; everyone else predicts their choice.",
                "Everyone may pass. Decisions lock and reveal only after everyone submits.",
                "Correct predictions earn one point; a spotlight pass awards none. Most points wins.",
            ],
        }
        super().__init__(GameManifest(
            id=mode, name=name, subtitle=subtitle, family="party", min_players=3,
            max_players=10, minutes="10–25", icon="sparkles", color=color,
            rules_version="house-party-1", settings=[Setting(
                key="sip_prompts", label="Optional sip prompts · any drink", default=False,
            )], rules=[
                "Games original house rules: 48 original prompts, two spotlight turns per person.",
                *mode_rules[mode],
                "The spotlight player advances each reveal. Equal highest scores share the win.",
                "Sip prompts are optional, use any drink and never affect scoring. Passing is always available.",
            ],
        ))

    def setup(self, players: list[str], settings: dict[str, bool], seed: int | None = None) -> State:
        self.require_players(players)
        count = len(SPILL if self.mode == "spill-or-chill" else LIKELY if self.mode == "most-likely" else HOT_SEAT)
        deck = list(range(count))
        rng(seed).shuffle(deck)
        return {
            "order": players.copy(), "turn": 0, "phase": self._collect_phase(), "round": 0,
            "rounds": len(players) * 2, "deck": deck, "decisions": {},
            "scores": dict.fromkeys(players, 0), "result": None, "history": [],
            "sip_prompts": bool(settings.get("sip_prompts", False)), "winners": [],
            "message": self._start_message(),
        }

    def _collect_phase(self) -> str:
        return {"spill-or-chill": "answer", "most-likely": "vote", "hot-seat": "predict"}[self.mode]

    def _start_message(self) -> str:
        return {
            "spill-or-chill": "Spotlight player, share a story or keep it chill. Passing is always welcome.",
            "most-likely": "Make your secret vote. Everyone reveals together.",
            "hot-seat": "One secret preference. A room full of predictions. Lock yours in.",
        }[self.mode]

    def _spotlight(self, s: State) -> str:
        return str(s["order"][s["round"] % len(s["order"])])

    def _eligible(self, s: State) -> list[str]:
        return [self._spotlight(s)] if self.mode == "spill-or-chill" else list(s["order"])

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished" or player not in s["order"]:
            return []
        if s["phase"] == "reveal":
            if player != self._spotlight(s):
                return []
            return [legal("See results" if s["round"] + 1 == s["rounds"] else "Next prompt", "next_prompt")]
        if player not in self._eligible(s) or player in s["decisions"]:
            return []
        if self.mode == "spill-or-chill":
            return [legal("Share · I answered aloud", "respond", choice="share"),
                    legal("Chill · keep this one to myself", "respond", choice="chill"),
                    legal("Pass", "respond", choice="pass")]
        if self.mode == "most-likely":
            return [legal(f"Vote for seat {i + 1}", "vote", target=p)
                    for i, p in enumerate(s["order"]) if p != player] + [legal("Pass", "vote", choice="pass")]
        kind = "choose" if player == self._spotlight(s) else "predict"
        return [legal("Choose A" if kind == "choose" else "Predict A", kind, choice="a"),
                legal("Choose B" if kind == "choose" else "Predict B", kind, choice="b"),
                legal("Pass", kind, choice="pass")]

    def _reveal(self, s: State) -> None:
        decisions = s["decisions"]
        points = dict.fromkeys(s["order"], 0)
        tallies = dict.fromkeys(s["order"], 0)
        answer = decisions.get(self._spotlight(s)) if self.mode != "most-likely" else None
        if self.mode == "spill-or-chill":
            if answer in {"share", "chill"}:
                points[self._spotlight(s)] = 1
        elif self.mode == "most-likely":
            for vote in decisions.values():
                if vote != "pass":
                    tallies[vote] += 1
            top = max(tallies.values())
            if top:
                points = {p: int(count == top) for p, count in tallies.items()}
        elif answer != "pass":
            for p, choice in decisions.items():
                points[p] = int(p != self._spotlight(s) and choice == answer)
        for p, count in points.items():
            s["scores"][p] += count
        result = {"choices": decisions.copy(), "tallies": tallies, "answer": answer, "points": points}
        s["result"] = result
        s["history"].append({"prompt_id": s["deck"][s["round"]], **result})
        s.update(phase="reveal", turn=s["order"].index(self._spotlight(s)),
                 message="Choices are in. The spotlight player can move the night along.")

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        if action.type == "next_prompt":
            if s["round"] + 1 == s["rounds"]:
                high = max(s["scores"].values())
                s.update(phase="finished", winners=[p for p in s["order"] if s["scores"][p] == high],
                         message="Two turns in the spotlight each. Keep the good company going.")
            else:
                s["round"] += 1
                s.update(decisions={}, result=None, phase=self._collect_phase(), message=self._start_message())
                pending = self._eligible(s)
                s["turn"] = s["order"].index(pending[0])
            return s
        s["decisions"][player] = action.target if action.type == "vote" and action.target else action.choice
        pending = [p for p in self._eligible(s) if p not in s["decisions"]]
        if pending:
            s.update(turn=s["order"].index(pending[0]), message="Decision locked. Waiting for the rest of the room.")
        else:
            self._reveal(s)
        return s

    def project_view(self, s: State, player: str) -> GameView:
        index = s["deck"][s["round"]]
        if self.mode == "hot-seat":
            prompt, a, b = HOT_SEAT[index]
            options = [a, b]
        else:
            prompt = SPILL[index] if self.mode == "spill-or-chill" else f"Who is most likely to {LIKELY[index]}?"
            options = []
        return GameView(
            game_id=self.manifest.id, phase=s["phase"],
            current_player=None if s["phase"] == "finished" else s["order"][s["turn"]],
            players=[PlayerView(id=p, score=s["scores"][p]) for p in s["order"]], hand=[],
            actions=self.legal_actions(s, player), winners=s["winners"], message=s["message"],
            detail={"mode": self.mode, "round": s["round"] + 1, "rounds": s["rounds"],
                    "spotlight": self._spotlight(s), "prompt": prompt, "options": options,
                    "submitted": list(s["decisions"]), "own_choice": s["decisions"].get(player),
                    "result": s["result"], "sip_prompts": s["sip_prompts"]},
        )
