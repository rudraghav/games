from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.contracts import Action, CardView, GameView


class Request(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ProfileInput(Request):
    name: str = Field(min_length=1, max_length=30)
    avatar: int = Field(default=0, ge=0, le=7)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = " ".join(value.split())
        if not value or any(ord(c) < 32 for c in value):
            raise ValueError("Choose a readable display name.")
        return value


class CreateRoom(ProfileInput):
    game_id: str
    room_name: str = Field(default="Game night", min_length=1, max_length=60)
    capacity: int = Field(default=4, ge=1, le=10)
    settings: dict[str, bool] = Field(default_factory=dict)
    bots: int = Field(default=0, ge=0, le=9)


class JoinRoom(ProfileInput):
    invite: str = Field(min_length=6, max_length=100)


class RoomSettings(Request):
    game_id: str
    capacity: int = Field(ge=1, le=10)
    settings: dict[str, bool] = Field(default_factory=dict)


class Ready(Request):
    ready: bool


class AddBots(Request):
    count: int = Field(default=1, ge=1, le=9)


class DriveBots(Request):
    match_id: UUID
    expected_version: int = Field(ge=1)


class Move(Request):
    match_id: UUID
    action_id: UUID
    expected_version: int = Field(ge=1)
    action: Action


class ChatInput(Request):
    body: str = Field(min_length=1, max_length=300)
    kind: Literal["message", "reaction"] = "message"


class ProfileView(BaseModel):
    id: str
    name: str
    avatar: int


class MemberView(ProfileView):
    ready: bool
    seated: bool
    connected: bool
    last_seen: float
    is_bot: bool = False


class MessageView(BaseModel):
    id: str
    user_id: str
    body: str
    kind: str
    created_at: float


class PublicActionView(BaseModel):
    version: int = Field(ge=2)
    actor_id: str
    type: str
    amount: int | None = Field(default=None, ge=0)


class PublicMoveView(BaseModel):
    """A committed public description, never a stored submitted action."""

    version: int = Field(ge=2)
    actor_id: str
    type: str
    label: str = Field(min_length=1, max_length=160)
    targets: list[str] = Field(default_factory=list, max_length=10)
    amount: int | None = Field(default=None, ge=0)
    cards: list[CardView] = Field(default_factory=list, max_length=12)
    destination: str | None = Field(default=None, max_length=80)
    count: int | None = Field(default=None, ge=0)


class RoomView(BaseModel):
    id: str
    name: str
    code: str
    game_id: str
    owner_id: str
    capacity: int
    settings: dict[str, bool]
    status: str
    revision: int
    match_id: str | None
    match_version: int | None
    members: list[MemberView]
    messages: list[MessageView]
    game: GameView | None
    paused: bool
    missing_players: list[str]
    invite_token: str | None = None
    bot_pending: bool = False
    bot_due_at: float | None = None
    last_action: PublicActionView | None = None
    activity: list[PublicMoveView] = Field(default_factory=list, max_length=80)


class RoomSummary(BaseModel):
    id: str
    name: str
    game_id: str
    status: str
    players: int
    capacity: int


class MatchSummary(BaseModel):
    id: str
    room_id: str
    game_id: str
    winners: list[str]
    score: int
    created_at: float


class MeView(BaseModel):
    profile: ProfileView | None
    anonymous: bool
    rooms: list[RoomSummary]
    history: list[MatchSummary]
