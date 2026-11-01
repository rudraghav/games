from collections.abc import Iterator
from typing import Annotated

from fastapi import APIRouter, Depends

from app.auth import Identity, identity
from app.db import sessions
from app.games.tarot.reading import ReadingInput, ReadingView
from app.rooms.schemas import (
    ChatInput,
    CreateRoom,
    JoinRoom,
    MeView,
    Move,
    ProfileInput,
    ProfileView,
    Ready,
    RoomSettings,
    RoomView,
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


@router.put("/profile", response_model=ProfileView)
def profile(data: ProfileInput, actor: Actor, svc: Service) -> ProfileView:
    return svc.profile(actor, data)


@router.post("/rooms", response_model=RoomView, status_code=201)
def create(data: CreateRoom, actor: Actor, svc: Service) -> RoomView:
    return svc.create(actor, data)


@router.post("/rooms/join", response_model=RoomView)
def join(data: JoinRoom, actor: Actor, svc: Service) -> RoomView:
    return svc.join(actor, data)


@router.get("/rooms/{room_id}", response_model=RoomView)
def get(room_id: str, actor: Actor, svc: Service) -> RoomView:
    return svc.get(actor, room_id)


@router.post("/rooms/{room_id}/heartbeat", response_model=RoomView)
def heartbeat(room_id: str, actor: Actor, svc: Service) -> RoomView:
    return svc.heartbeat(actor, room_id)


@router.get("/rooms/{room_id}/reading", response_model=ReadingView)
def reading(room_id: str, actor: Actor, svc: Service) -> ReadingView:
    return svc.reading(actor, room_id)


@router.post("/rooms/{room_id}/reading", response_model=ReadingView)
def generate(room_id: str, data: ReadingInput, actor: Actor, svc: Service) -> ReadingView:
    return svc.reading(actor, room_id, data)


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
