"""Bounded policy context, independent of authoritative engine state."""

from collections.abc import Callable
from copy import deepcopy
from dataclasses import dataclass
from hashlib import sha256
from random import Random
from typing import Any

from app.core.contracts import Action, GameView, LegalAction


@dataclass(frozen=True)
class BotDecision:
    action: Action
    memory: dict[str, Any]


class Context:
    def __init__(self, view: GameView, player: str, memory: dict[str, Any] | None) -> None:
        self.view, self.player = view, player
        self.memory = deepcopy(memory or {})
        self.step = int(self.memory.get("step", 0)) + 1
        self.memory["step"] = self.step
        seed = sha256(
            f"{self.memory.get('seed', player)}:{view.game_id}:{self.step}".encode()
        ).digest()
        self.random = Random(int.from_bytes(seed[:8], "big"))
        self.options = view.actions
        self.detail: dict[str, Any] = view.detail
        self.own = next((p for p in view.players if p.id == player), None)
        self.seat = next((i for i, p in enumerate(view.players) if p.id == player), 0)

    def of(self, *kinds: str) -> list[LegalAction]:
        return [o for o in self.options if o.action.type in kinds]

    def pick(self, options: list[LegalAction]) -> LegalAction:
        return self.random.choice(options)

    def best(
        self, options: list[LegalAction], score: Callable[[LegalAction], float]
    ) -> LegalAction:
        values = [(option, score(option)) for option in options]
        high = max(value for _, value in values)
        return self.pick([option for option, value in values if abs(value - high) < 1e-8])

    def action(self, option: LegalAction) -> Action:
        action = option.action.model_copy(deep=True)
        if option.input == "amount":
            action.amount = option.minimum or 0
        elif option.input == "cards":
            action.cards = list(option.eligible_cards)
        return action
