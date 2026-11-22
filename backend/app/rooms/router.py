from collections.abc import Iterator
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from app.astrology.models import (
    AstrologyPlaces,
    AstrologyPlaceSearch,
    AstrologyPreview,
    AstrologyPreviewInput,
)
from app.auth import Identity, identity
from app.core.contracts import GameView
from app.db import sessions
from app.games.tarot.reading import ReadingInput, ReadingView
from app.games.tarot.style import ReadingStyle
from app.rooms.schemas import (
    AddBots,
    ChatInput,
    CreateRoom,
    DriveBots,
    JoinRoom,
    MeView,
    Move,
    OwnProfileView,
    PlayerSearch,
    ProfileInput,
    QuickPlay,
    Ready,
    RoomInviteInput,
    RoomLookup,
    RoomSettings,
    RoomView,
    SantaLinks,
    SantaReveal,
    SavedReadingView,
    UpdateBot,
    UsernameInput,
)
from app.rooms.service import RoomService

router = APIRouter(prefix="/v1")


def service() -> Iterator[RoomService]:
    with sessions()() as session:
        yield RoomService(session)


Actor = Annotated[Identity, Depends(identity)]
Service = Annotated[RoomService, Depends(service)]


@router.get("/me", response_model=MeView)
def me(actor: Actor, svc: Service) -> MeView:
    return svc.me(actor)


@router.put("/profile", response_model=OwnProfileView)
def profile(data: ProfileInput, actor: Actor, svc: Service) -> OwnProfileView:
    return svc.profile(actor, data)


@router.put("/profile/username", response_model=OwnProfileView)
def set_username(data: UsernameInput, actor: Actor, svc: Service) -> OwnProfileView:
    return svc.set_username(actor, data.username)


@router.delete("/profile/username", response_model=OwnProfileView)
def clear_username(actor: Actor, svc: Service) -> OwnProfileView:
    return svc.set_username(actor, None)


@router.get("/players/search", response_model=PlayerSearch)
def search_players(
    actor: Actor, svc: Service, q: Annotated[str, Query(min_length=2, max_length=21)]
) -> PlayerSearch:
    return svc.search_players(actor, q)


@router.post("/invitations/{room_id}/accept", response_model=RoomView)
def accept_invitation(room_id: str, actor: Actor, svc: Service) -> RoomView:
    return svc.accept_invitation(actor, room_id)


@router.delete("/invitations/{room_id}", response_model=MeView)
def decline_invitation(room_id: str, actor: Actor, svc: Service) -> MeView:
    return svc.decline_invitation(actor, room_id)


@router.post("/rooms", response_model=RoomView, status_code=201)
def create(data: CreateRoom, actor: Actor, svc: Service) -> RoomView:
    return svc.create(actor, data)


@router.post("/games/{game_id}/play", response_model=RoomView)
def quick_play(game_id: str, data: QuickPlay, actor: Actor, svc: Service) -> RoomView:
    return svc.quick_play(actor, game_id, data)


@router.post("/rooms/join", response_model=RoomView)
def join(data: JoinRoom, actor: Actor, svc: Service) -> RoomView:
    return svc.join(actor, data)


@router.get("/rooms/lookup/{invite}", response_model=RoomLookup)
def lookup(invite: str, actor: Actor, svc: Service) -> RoomLookup:
    return svc.lookup(actor, invite)


@router.get("/rooms/{room_id}", response_model=RoomView)
def get(room_id: str, actor: Actor, svc: Service) -> RoomView:
    return svc.get(actor, room_id)


@router.post("/rooms/{room_id}/heartbeat", response_model=RoomView)
def heartbeat(room_id: str, actor: Actor, svc: Service) -> RoomView:
    return svc.heartbeat(actor, room_id)


@router.get("/rooms/{room_id}/reading", response_model=ReadingView)
def reading(room_id: str, actor: Actor, svc: Service) -> ReadingView:
    return svc.reading(actor, room_id)


@router.get("/readings/{match_id}", response_model=SavedReadingView)
def saved_reading(match_id: UUID, actor: Actor, svc: Service, style: ReadingStyle | None = None) -> SavedReadingView:
    return svc.saved_reading(actor, str(match_id), style=style)


@router.get("/chance-sessions/{match_id}", response_model=GameView)
def saved_chance_session(match_id: UUID, actor: Actor, svc: Service) -> GameView:
    return svc.saved_chance_session(actor, str(match_id))


@router.post("/rooms/{room_id}/reading", response_model=ReadingView)
def generate(room_id: str, data: ReadingInput, actor: Actor, svc: Service) -> ReadingView:
    return svc.reading(actor, room_id, data)


@router.post("/rooms/{room_id}/astrology/places", response_model=AstrologyPlaces)
def astrology_places(
    room_id: str, data: AstrologyPlaceSearch, actor: Actor, svc: Service
) -> AstrologyPlaces:
    return svc.astrology_places(actor, room_id, data)


@router.post("/rooms/{room_id}/astrology/chart", response_model=AstrologyPreview)
def astrology_chart(
    room_id: str, data: AstrologyPreviewInput, actor: Actor, svc: Service
) -> AstrologyPreview:
    return svc.astrology_preview(actor, room_id, data)


@router.get("/rooms/{room_id}/secret-santa/links", response_model=SantaLinks)
def santa_links(room_id: str, actor: Actor, svc: Service) -> SantaLinks:
    return svc.santa_links(actor, room_id)


@router.get("/secret-santa/{token}", response_model=SantaReveal)
def santa_reveal(token: str, actor: Actor, svc: Service) -> SantaReveal:
    return svc.santa_reveal(actor, token)


@router.put("/rooms/{room_id}/ready", response_model=RoomView)
def ready(room_id: str, data: Ready, actor: Actor, svc: Service) -> RoomView:
    return svc.ready(actor, room_id, data.ready)


@router.put("/rooms/{room_id}/settings", response_model=RoomView)
def configure(room_id: str, data: RoomSettings, actor: Actor, svc: Service) -> RoomView:
    return svc.configure(actor, room_id, data)


@router.post("/rooms/{room_id}/start", response_model=RoomView)
def start(room_id: str, actor: Actor, svc: Service) -> RoomView:
    return svc.start(actor, room_id)


@router.post("/rooms/{room_id}/actions", response_model=RoomView)
def move(room_id: str, data: Move, actor: Actor, svc: Service) -> RoomView:
    return svc.move(actor, room_id, data)


@router.post("/rooms/{room_id}/bots", response_model=RoomView)
def add_bots(room_id: str, data: AddBots, actor: Actor, svc: Service) -> RoomView:
    return svc.add_bots(actor, room_id, data)


@router.patch("/rooms/{room_id}/bots/{bot_id}", response_model=RoomView)
def update_bot(
    room_id: str, bot_id: str, data: UpdateBot, actor: Actor, svc: Service
) -> RoomView:
    return svc.update_bot(actor, room_id, bot_id, data)


@router.post("/rooms/{room_id}/invites", response_model=RoomView)
def invite_player(room_id: str, data: RoomInviteInput, actor: Actor, svc: Service) -> RoomView:
    return svc.invite_player(actor, room_id, data.username)


@router.delete("/rooms/{room_id}/invites/{username}", response_model=RoomView)
def cancel_invite(room_id: str, username: str, actor: Actor, svc: Service) -> RoomView:
    return svc.cancel_invite(actor, room_id, username)


@router.post("/rooms/{room_id}/bots/drive", response_model=RoomView)
def drive_bots(room_id: str, data: DriveBots, actor: Actor, svc: Service) -> RoomView:
    return svc.drive_bots(actor, room_id, data)


@router.post("/rooms/{room_id}/chat", response_model=RoomView)
def chat(room_id: str, data: ChatInput, actor: Actor, svc: Service) -> RoomView:
    return svc.chat(actor, room_id, data)


@router.post("/rooms/{room_id}/claim-host", response_model=RoomView)
def claim(room_id: str, actor: Actor, svc: Service) -> RoomView:
    return svc.manage(actor, room_id, "claim")


@router.post("/rooms/{room_id}/invite", response_model=RoomView)
def rotate_invite(room_id: str, actor: Actor, svc: Service) -> RoomView:
    return svc.manage(actor, room_id, "invite")


@router.post("/rooms/{room_id}/abandon", response_model=RoomView)
def abandon(room_id: str, actor: Actor, svc: Service) -> RoomView:
    return svc.manage(actor, room_id, "abandon")


@router.post("/rooms/{room_id}/leave", response_model=RoomView)
def leave(room_id: str, actor: Actor, svc: Service) -> RoomView:
    return svc.manage(actor, room_id, "leave")


@router.delete("/rooms/{room_id}/members/{user_id}", response_model=RoomView)
def kick(room_id: str, user_id: str, actor: Actor, svc: Service) -> RoomView:
    return svc.manage(actor, room_id, "kick", user_id)
