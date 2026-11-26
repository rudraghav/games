from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.contracts import Action, CardView, GameView
from app.games.tarot.reading import Reading
from app.games.tarot.style import ReadingStyle


class Request(BaseModel):
    model_config = ConfigDict(extra="forbid")


# "hard" is each game's full policy; "medium" and "easy" make deliberate slips.
BotLevel = Literal["easy", "medium", "hard"]


def readable_name(value: str) -> str:
    value = " ".join(value.split())
    if not value or any(ord(c) < 32 for c in value):
        raise ValueError("Choose a readable display name.")
    return value


def clean_username(value: str) -> str:
    """A handle people can be found by: 3 to 20 of a-z, 0-9 and underscore."""
    value = value.strip().removeprefix("@").lower()
    if not 3 <= len(value) <= 20 or any(c not in "abcdefghijklmnopqrstuvwxyz0123456789_" for c in value):
        raise ValueError("Use 3 to 20 letters, numbers or underscores.")
    return value


class ProfileInput(Request):
    name: str = Field(min_length=1, max_length=30)
    avatar: int = Field(default=0, ge=0, le=7)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        return readable_name(value)


class UsernameInput(Request):
    username: str = Field(min_length=3, max_length=21)

    @field_validator("username")
    @classmethod
    def clean(cls, value: str) -> str:
        return clean_username(value)


class BotSeat(Request):
    """One bot the host seats: an optional name of their own and how well it plays."""

    name: str | None = Field(default=None, min_length=1, max_length=30)
    level: BotLevel = "hard"

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str | None) -> str | None:
        return None if value is None else readable_name(value)


class CreateRoom(ProfileInput):
    game_id: str
    room_name: str = Field(default="Game night", min_length=1, max_length=60)
    capacity: int = Field(default=4, ge=1, le=10)
    settings: dict[str, bool] = Field(default_factory=dict)
    bots: int = Field(default=0, ge=0, le=9)
    # When given, these seats replace the plain `bots` count.
    bot_seats: list[BotSeat] | None = Field(default=None, max_length=9)


class QuickPlay(Request):
    request_id: UUID
    bot_count: int | None = Field(default=None, ge=0, le=9, strict=True)


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
    level: BotLevel = "hard"
    # A name of the host's choosing; only for a single bot.
    name: str | None = Field(default=None, min_length=1, max_length=30)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str | None) -> str | None:
        return None if value is None else readable_name(value)


class UpdateBot(Request):
    name: str | None = Field(default=None, min_length=1, max_length=30)
    level: BotLevel | None = None

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str | None) -> str | None:
        return None if value is None else readable_name(value)


class RoomInviteInput(Request):
    username: str = Field(min_length=3, max_length=21)

    @field_validator("username")
    @classmethod
    def clean(cls, value: str) -> str:
        return clean_username(value)


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
    # An avatar frame the player earned and chose to wear. Everyone at the table sees it.
    frame: str | None = None


class OwnProfileView(ProfileView):
    """A player's own profile. The username is never part of another player's view of them."""

    username: str | None = None
    # The card back this player chose for their own screen.
    card_back: str | None = None


class StreakView(BaseModel):
    """Days in a row with at least one finished game, counted in the player's own day."""

    current: int = Field(ge=0)
    best: int = Field(ge=0)
    played_today: bool


class ProgressTotals(BaseModel):
    games: int = Field(ge=0)
    wins: int = Field(ge=0)
    different_games: int = Field(ge=0)
    with_friends: int = Field(ge=0)


class BadgeView(BaseModel):
    id: str
    name: str
    description: str
    earned: bool
    # Progress toward the badge, capped at the goal.
    value: int = Field(ge=0)
    goal: int = Field(ge=1)


class RewardView(BaseModel):
    """A cosmetic earned by playing. `locked` until its requirement is met, then
    `available` to redeem, then `redeemed` and free to wear."""

    id: str
    kind: Literal["frame", "card_back"]
    name: str
    requirement: str
    state: Literal["locked", "available", "redeemed"]
    equipped: bool
    value: int = Field(ge=0)
    goal: int = Field(ge=1)


class ProgressView(BaseModel):
    """A player's own progress, worked out from their finished games. Private to them."""

    xp: int = Field(ge=0)
    level: int = Field(ge=1)
    # XP at which this level began and at which the next begins.
    level_xp: int = Field(ge=0)
    next_level_xp: int = Field(ge=1)
    streak: StreakView
    totals: ProgressTotals
    badges: list[BadgeView] = Field(default_factory=list, max_length=40)
    rewards: list[RewardView] = Field(default_factory=list, max_length=40)


class CosmeticsInput(Request):
    """What to wear. None takes a frame off or returns to the standard card back."""

    frame: str | None = Field(default=None, max_length=32)
    card_back: str | None = Field(default=None, max_length=32)


class PlayerHit(BaseModel):
    """A player found by username. Carries no account or room identifier."""

    username: str
    name: str
    avatar: int


class PlayerSearch(BaseModel):
    players: list[PlayerHit] = Field(default_factory=list, max_length=8)


class MemberView(ProfileView):
    ready: bool
    seated: bool
    connected: bool
    last_seen: float
    is_bot: bool = False
    bot_level: BotLevel | None = None


class PendingInviteView(BaseModel):
    """Someone invited to this room by username who has not answered yet."""

    username: str
    name: str
    avatar: int


class InvitationView(BaseModel):
    """An invitation waiting for the signed-in player."""

    room_id: str
    room_name: str
    game_id: str
    from_name: str
    from_avatar: int
    players: int
    capacity: int
    created_at: float


class SantaLink(BaseModel):
    """One person's private Secret Santa link. Only the organiser receives these."""

    id: str
    name: str
    token: str = Field(min_length=20, max_length=120)


class SantaLinks(BaseModel):
    links: list[SantaLink] = Field(default_factory=list, max_length=30)


class SantaReveal(BaseModel):
    """What one person's private link shows: their own draw and the event, nothing else."""

    title: str
    # Days since 1 January 2020, or None when no date is set.
    day: int | None = None
    location: str = ""
    budget: str = ""
    giver_name: str
    recipient_name: str


class RoomLookup(BaseModel):
    """Where a room code or invite leads for a player who is already in that room."""

    id: str
    game_id: str


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
    pending_invites: list[PendingInviteView] = Field(default_factory=list, max_length=20)
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


class SavedReadingView(BaseModel):
    """One participant's saved spread, independent of the room's current match."""

    match_id: str
    room_id: str
    created_at: float
    status: Literal["complete", "generating", "incomplete", "unavailable"]
    reading_style: ReadingStyle = Field(default_factory=lambda: "classic")
    original_reading_style: ReadingStyle | None = Field(default=None, exclude_if=lambda value: value is None)
    question: str
    cards: list[CardView] = Field(max_length=3)
    reading: Reading | None
    can_resume: bool


class MeView(BaseModel):
    profile: OwnProfileView | None
    anonymous: bool
    rooms: list[RoomSummary]
    history: list[MatchSummary]
    invitations: list[InvitationView] = Field(default_factory=list, max_length=20)
