from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass
from typing import Any, Literal, Protocol

from pydantic import BaseModel, ConfigDict, Field, JsonValue

State = dict[str, Any]


class RuleError(ValueError):
    """A rejected game move, safe to explain to its actor."""


class Action(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: str = Field(min_length=1, max_length=32)
    card: str = ""
    target: str = ""
    color: str = ""
    choice: str = ""
    amount: int = Field(default=0, ge=0, le=1_000_000)
    slot: int = Field(default=0, ge=0, le=11)
    cards: list[str] = Field(default_factory=list, max_length=30)
    groups: list[list[str]] = Field(default_factory=list, max_length=13)


class LegalAction(BaseModel):
    label: str
    action: Action
    input: Literal["amount", "cards", "text"] | None = None
    minimum: int | None = None
    maximum: int | None = None
    step: int = Field(default=1, ge=1)
    eligible_cards: list[str] = Field(default_factory=list)


class CardView(BaseModel):
    id: str
    label: str
    color: str = "neutral"
    subtitle: str = ""
    value: str = ""
    suit: str = ""


class PlayerView(BaseModel):
    id: str
    count: int = 0
    score: int = 0
    chips: int | None = None
    bet: int = 0
    folded: bool = False
    eliminated: bool = False
    removed_slots: list[int] = Field(default_factory=list)
    cards: list[CardView | None] = Field(default_factory=list)
    bank: list[CardView] = Field(default_factory=list)
    properties: dict[str, list[CardView]] = Field(default_factory=dict)


class GameView(BaseModel):
    game_id: str
    phase: str
    current_player: str | None
    players: list[PlayerView]
    hand: list[CardView]
    community: list[CardView] = Field(default_factory=list)
    discard: CardView | None = None
    drawn: CardView | None = None
    draw_count: int = 0
    pot: int = 0
    message: str = ""
    actions: list[LegalAction] = Field(default_factory=list)
    winners: list[str] = Field(default_factory=list)
    detail: dict[str, JsonValue] = Field(default_factory=dict)


class Setting(BaseModel):
    key: str
    label: str
    default: bool


class GameManifest(BaseModel):
    id: str
    name: str
    subtitle: str
    family: str
    min_players: int
    max_players: int
    minutes: str
    icon: str
    color: str
    rules_version: str = "1"
    settings: list[Setting] = Field(default_factory=list)
    rules: list[str] = Field(default_factory=list)


class Engine(Protocol):
    manifest: GameManifest

    def setup(
        self, players: list[str], settings: dict[str, bool], seed: int | None = None
    ) -> State: ...
    def legal_actions(self, state: State, player: str) -> list[LegalAction]: ...
    def apply_action(self, state: State, player: str, action: Action) -> State: ...
    def project_view(self, state: State, player: str) -> GameView: ...


@dataclass
class BaseEngine:
    manifest: GameManifest

    def require_turn(self, state: State, player: str) -> None:
        if state.get("winners") or state["phase"] == "finished":
            raise RuleError("This match has finished.")
        if state["order"][state["turn"]] != player:
            raise RuleError("It is another player's turn.")

    def require_players(self, players: list[str]) -> None:
        if not self.manifest.min_players <= len(players) <= self.manifest.max_players:
            raise RuleError("The number of ready players does not fit this game.")
        if len(set(players)) != len(players):
            raise RuleError("Each seat needs a different player.")

    def copy(self, state: State) -> State:
        return deepcopy(state)

    def outcome(self, state: State) -> list[str]:
        return list(state.get("winners", []))


def legal(label: str, kind: str, **kwargs: Any) -> LegalAction:
    input_kind = kwargs.pop("input", None)
    minimum = kwargs.pop("minimum", None)
    maximum = kwargs.pop("maximum", None)
    step = kwargs.pop("step", 1)
    eligible = kwargs.pop("eligible_cards", [])
    return LegalAction(
        label=label,
        action=Action(type=kind, **{k: v for k, v in kwargs.items() if v is not None}),
        input=input_kind,
        minimum=minimum,
        maximum=maximum,
        step=step,
        eligible_cards=eligible,
    )


def validate_action(options: list[LegalAction], action: Action) -> None:
    for option in options:
        if option.input == "amount":
            if (
                action.amount is None
                or (action.amount - (option.minimum or 0)) % option.step
                or not (option.minimum or 0) <= action.amount <= (option.maximum or 0)
            ):
                continue
            if action.model_copy(update={"amount": 0}) == option.action:
                return
        elif option.input == "cards":
            if action.model_copy(update={"cards": [], "groups": []}) == option.action:
                return
        elif option.input == "text":
            if ((option.minimum or 1) <= len(action.choice.strip()) <= (option.maximum or 64)
                    and action.model_copy(update={"choice": ""}) == option.action):
                return
        elif action == option.action:
            return
    raise RuleError("That action is not available now.")
