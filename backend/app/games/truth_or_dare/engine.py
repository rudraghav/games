"""Truth or Dare: shared prompts, one swap each, and burning-building rounds."""

from itertools import combinations, permutations
from random import Random
from typing import Any

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
from app.games.truth_or_dare.prompts import (
    FRIENDLY_DARES,
    FRIENDLY_FATES,
    FRIENDLY_TRUTHS,
    NAUGHTY_DARES,
    NAUGHTY_FATES,
    NAUGHTY_TRUTHS,
    TRIOS,
)

# The two editions never share a truth, a dare or a fate label.
DECKS: dict[str, dict[str, list[str]]] = {
    "friendly": {"truth": FRIENDLY_TRUTHS, "dare": FRIENDLY_DARES},
    "naughty": {"truth": NAUGHTY_TRUTHS, "dare": NAUGHTY_DARES},
}
FATES = {"friendly": FRIENDLY_FATES, "naughty": NAUGHTY_FATES}
POINTS = {"truth": 1, "dare": 2, "burning": 1}
KIND_LABELS = {"truth": "Truth", "dare": "Dare", "burning": "Burning building"}
# Candidate i receives fate int(choice[i]); six ways to give three different fates.
ASSIGNMENTS = ["".join(order) for order in permutations("012")]
CHOOSE_ANY = "Choose truth, dare or burning building."
CHOOSE_TWO = "Choose truth or dare."


def turns_each(players: int) -> int:
    return 4 if players <= 4 else 3 if players <= 7 else 2


class TruthOrDareEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(
            GameManifest(
                id="truth-or-dare",
                name="Truth or Dare",
                subtitle="Answer honestly, take the dare, or save one from the fire",
                family="truth-dare",
                min_players=2,
                max_players=10,
                minutes="10–25",
                icon="flame",
                color="coral",
                rules_version="house-1",
                settings=[
                    Setting(key="adults_only", label="Naughty edition (18+)", default=False),
                    Setting(key="burning_building", label="Burning building rounds", default=True),
                    Setting(
                        key="name_players",
                        label="Burning building can name players in this room",
                        default=False,
                    ),
                ],
                rules=[
                    "Take turns. On your turn choose truth, dare or, when it is on, burning building. Everyone sees the prompt that is drawn.",
                    "Truth or dare: answer or do it out loud, then mark it done. You can always pass; a pass scores nothing and costs nothing.",
                    "Burning building: three candidates, three different fates. Give each candidate one fate. Everyone sees your choice.",
                    "Once per match you may swap the prompt you drew for another of the same kind.",
                    "A truth done scores 1, a dare done 2 and a burning-building choice 1.",
                    "Everyone gets the same number of turns: four with 2 to 4 players, three with 5 to 7, two with 8 to 10. No prompt repeats in a match.",
                    "Most points wins. Equal highest scores share the win.",
                    "The naughty edition is for adults only and uses a separate deck and blunter fates. Any dare involving another player needs that player's yes.",
                ],
            )
        )

    def setup(
        self, players: list[str], settings: dict[str, bool], seed: int | None = None
    ) -> State:
        self.require_players(players)
        random = rng(seed)
        edition = "naughty" if settings.get("adults_only", False) else "friendly"
        stock: dict[str, list[int]] = {}
        for kind, size in [
            ("truth", len(DECKS[edition]["truth"])),
            ("dare", len(DECKS[edition]["dare"])),
            ("burning", len(TRIOS)),
        ]:
            stock[kind] = list(range(size))
            random.shuffle(stock[kind])
        burning = bool(settings.get("burning_building", True))
        return {
            "order": list(players),
            "turn": 0,
            "phase": "choose",
            "edition": edition,
            "burning": burning,
            "name_players": bool(settings.get("name_players", False)),
            "turns_per_player": turns_each(len(players)),
            "turns_taken": dict.fromkeys(players, 0),
            # Undrawn prompt numbers, drawn from the end. Never projected.
            "stock": stock,
            # Private. Decides when a burning-building round names players.
            "seed": random.randrange(2**63),
            "draws": 0,
            "named": [],
            "prompt": None,
            "swaps": dict.fromkeys(players, 1),
            "last_result": None,
            "scores": dict.fromkeys(players, 0),
            "winners": [],
            "message": CHOOSE_ANY if burning else CHOOSE_TWO,
        }

    def _kinds(self, s: State) -> list[str]:
        kinds = [kind for kind in ("truth", "dare") if s["stock"][kind]]
        if s["burning"] and s["stock"]["burning"]:
            kinds.append("burning")
        return kinds

    def _draw(self, s: State, kind: str, player: str, swapped: bool) -> dict[str, Any]:
        s["draws"] += 1
        prompt: dict[str, Any] = {
            "player": player, "kind": kind, "text": None, "candidates": None, "swapped": swapped,
        }
        if kind != "burning":
            prompt["text"] = DECKS[s["edition"]][kind][s["stock"][kind].pop()]
            return prompt
        others = [seat for seat in s["order"] if seat != player]
        random = Random(s["seed"] + s["draws"])
        if s["name_players"] and len(others) >= 3 and random.random() < 0.5:
            # A trio of other players this player has not been shown before.
            fresh = [list(trio) for trio in combinations(others, 3)
                     if [player, *trio] not in s["named"]]
            if fresh:
                trio = random.choice(fresh)
                s["named"].append([player, *trio])
                random.shuffle(trio)
                prompt["candidates"] = [{"label": None, "player": seat} for seat in trio]
                return prompt
        prompt["candidates"] = [
            {"label": label, "player": None} for label in TRIOS[s["stock"]["burning"].pop()]
        ]
        return prompt

    def _candidate(self, s: State, candidate: dict[str, Any]) -> str:
        if candidate["player"] is None:
            return str(candidate["label"])
        return f"the player in seat {s['order'].index(candidate['player']) + 1}"

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished" or player not in s["order"]:
            return []
        if player != s["order"][s["turn"]]:
            return []
        if s["phase"] == "choose":
            return [legal(KIND_LABELS[kind], "pick", choice=kind) for kind in self._kinds(s)]
        if s["phase"] == "result":
            return [legal("Next turn", "next")]
        prompt = s["prompt"]
        options: list[LegalAction] = []
        if s["phase"] == "prompt":
            options = [legal("Done", "done"), legal("Pass", "skip")]
        else:
            fates = FATES[s["edition"]]
            for choice in ASSIGNMENTS:
                label = " · ".join(
                    f"{fates[int(fate)]} {self._candidate(s, candidate)}"
                    for candidate, fate in zip(prompt["candidates"], choice, strict=True)
                )
                options.append(legal(label, "assign", choice=choice))
        if s["swaps"][player] and s["stock"][prompt["kind"]]:
            options.append(legal("Swap for another", "swap"))
        return options

    def _prompt_message(self, s: State) -> str:
        kind = s["prompt"]["kind"]
        swap = " You can swap once in the match." if s["swaps"][s["prompt"]["player"]] else ""
        if kind == "truth":
            return f"Answer out loud, then mark it done. You can always pass.{swap}"
        if kind == "dare":
            return f"Do the dare, then mark it done. You can always pass.{swap}"
        fates = FATES[s["edition"]]
        return (f"Three in a burning building. Give each a different fate: "
                f"{fates[0]}, {fates[1]} or {fates[2]}.{swap}")

    def _advance(self, s: State) -> None:
        if all(taken == s["turns_per_player"] for taken in s["turns_taken"].values()):
            best = max(s["scores"].values())
            s.update(
                phase="finished",
                winners=[seat for seat in s["order"] if s["scores"][seat] == best],
                message="Everyone has had their turns. Most points wins.",
            )
            return
        s["turn"] = (s["turn"] + 1) % len(s["order"])
        s.update(
            phase="choose",
            message=CHOOSE_ANY if "burning" in self._kinds(s) else CHOOSE_TWO,
        )

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        if action.type == "next":
            self._advance(s)
            return s
        if action.type in {"pick", "swap"}:
            swapped = action.type == "swap"
            kind = s["prompt"]["kind"] if swapped else action.choice
            if swapped:
                s["swaps"][player] = 0
            s["prompt"] = self._draw(s, kind, player, swapped)
            s["phase"] = "assign" if kind == "burning" else "prompt"
            s["message"] = self._prompt_message(s)
            return s
        prompt = s["prompt"]
        s["prompt"] = None
        s["turns_taken"][player] += 1
        result: dict[str, Any] = {
            "player": player, "kind": prompt["kind"], "text": prompt["text"],
            "candidates": prompt["candidates"], "fates": None, "outcome": "passed", "points": 0,
        }
        if action.type == "assign":
            result.update(outcome="assigned", points=POINTS["burning"],
                          fates=[int(fate) for fate in action.choice])
        elif action.type == "done":
            result.update(outcome="done", points=POINTS[prompt["kind"]])
        s["scores"][player] += result["points"]
        s["last_result"] = result
        if action.type == "assign":
            s.update(phase="result",
                     message="Everyone can see the choices. Move on when you are ready.")
        else:
            self._advance(s)
        return s

    def project_view(self, s: State, player: str) -> GameView:
        # One shared table: every viewer receives the same detail.
        return GameView(
            game_id=self.manifest.id,
            phase=s["phase"],
            current_player=None if s["phase"] == "finished" else s["order"][s["turn"]],
            players=[
                PlayerView(id=p, count=s["turns_taken"][p], score=s["scores"][p])
                for p in s["order"]
            ],
            hand=[],
            actions=self.legal_actions(s, player),
            winners=s["winners"],
            message=s["message"],
            detail={
                "edition": s["edition"],
                "fates": list(FATES[s["edition"]]),
                "burning_building": s["burning"],
                "turns_per_player": s["turns_per_player"],
                "turns_taken": dict(s["turns_taken"]),
                "prompt": s["prompt"],
                "swaps_left": dict(s["swaps"]),
                "last_result": s["last_result"],
                "scores": dict(s["scores"]),
            },
        )
