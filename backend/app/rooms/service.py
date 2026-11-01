from __future__ import annotations

import base64
import hashlib
import logging
import secrets
import time
from uuid import uuid4

from cryptography.fernet import Fernet
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.auth import Identity
from app.core.contracts import RuleError
from app.games.registry import ENGINES
from app.games.tarot.reading import (
    PROMPT_VERSION,
    Reading,
    ReadingInput,
    ReadingView,
    generate_reading,
)
from app.models import Match, Member, Message, Receipt, Room, TarotReading
from app.rooms.repository import Repository
from app.rooms.schemas import (
    ChatInput,
    CreateRoom,
    JoinRoom,
    MatchSummary,
    MeView,
    Move,
    ProfileInput,
    ProfileView,
    RoomSettings,
    RoomSummary,
    RoomView,
)
from app.rooms.views import room_view
from app.settings import settings


def invite() -> tuple[str, str]:
    token = secrets.token_urlsafe(24)
    return token, hashlib.sha256(token.encode()).hexdigest()


def room_code() -> str:
    return "".join(secrets.choice("ABCDEFGHJKMNPQRSTVWXYZ23456789") for _ in range(8))


class RoomService:
    def __init__(self, session: Session):
        self.repo = Repository(session)
        self.session = session
        key = hashlib.sha256((settings().app_secret + ":invites").encode()).digest()
        self.cipher = Fernet(base64.urlsafe_b64encode(key))

    def _rate(self, actor: Identity, scope: str, maximum: int = 60, seconds: int = 60) -> None:
        # Commit the attempt before the workflow so rejected joins still consume their budget.
        with self.session.begin():
            count = self.repo.rate(actor.id + ":" + scope, seconds)
        if count > maximum:
            raise HTTPException(429, "Please slow down and try again shortly.")

    def _room(self, room_id: str, actor: Identity, lock: bool = False, host: bool = False) -> Room:
        room = self.repo.room(room_id, lock)
        member = self.repo.member(room_id, actor.id)
        if room is None or member is None or not member.active:
            raise HTTPException(404, "This room is unavailable to your player session.")
        if host and room.owner_id != actor.id:
            raise HTTPException(403, "Only the host can do that.")
        return room

    def _settings(self, game_id: str, capacity: int, values: dict[str, bool]) -> dict[str, bool]:
        engine = ENGINES.get(game_id)
        if not engine or not engine.manifest.min_players <= capacity <= engine.manifest.max_players:
            raise HTTPException(422, "Choose a valid game and number of seats.")
        allowed = {setting.key: setting.default for setting in engine.manifest.settings}
        if not set(values) <= set(allowed):
            raise HTTPException(422, "This game does not support one of those rules.")
        return {**allowed, **values}

    def _member(self, room_id: str, user_id: str) -> Member:
        member = self.repo.member(room_id, user_id)
        if member is None or not member.active:
            raise HTTPException(404, "Player membership is unavailable.")
        return member

    def create(self, actor: Identity, data: CreateRoom) -> RoomView:
        self._rate(actor, "create", 12, 3600)
        values = self._settings(data.game_id, data.capacity, data.settings)
        with self.session.begin():
            self.repo.save_profile(actor.id, data.name, data.avatar)
            token, hashed = invite()
            room = Room(
                id=str(uuid4()),
                name=data.room_name.strip() or "Game night",
                code=room_code(),
                owner_id=actor.id,
                game_id=data.game_id,
                capacity=data.capacity,
                settings=values,
                invite_hash=hashed,
                invite_ciphertext=self.cipher.encrypt(token.encode()).decode(),
            )
            self.repo.add(room)
            self.repo.flush()
            self.repo.add(Member(room_id=room.id, user_id=actor.id))
            self.repo.flush()
            return room_view(self.repo, room, actor.id, self.cipher)

    def join(self, actor: Identity, data: JoinRoom) -> RoomView:
        self._rate(actor, "join", 30)
        with self.session.begin():
            room = self.repo.invite(data.invite.strip())
            if room is None or room.status == "closed":
                raise HTTPException(404, "This invite is invalid or has been replaced.")
            members = self.repo.members(room.id)
            existing = self.repo.member(room.id, actor.id)
            if len(members) >= 20 and not (existing and existing.active):
                raise HTTPException(409, "This room is full.")
            self.repo.save_profile(actor.id, data.name, data.avatar)
            seated = room.status != "playing" and sum(m.seated for m, _ in members) < room.capacity
            if existing:
                if not existing.active:
                    existing.active, existing.seated, existing.ready = True, seated, False
                existing.seen_at = time.time()
            else:
                self.repo.add(Member(room_id=room.id, user_id=actor.id, seated=seated))
            room.revision += 1
            self.repo.flush()
            return room_view(self.repo, room, actor.id, self.cipher)

    def get(self, actor: Identity, room_id: str) -> RoomView:
        with self.session.begin():
            return room_view(self.repo, self._room(room_id, actor), actor.id, self.cipher)

    def heartbeat(self, actor: Identity, room_id: str) -> RoomView:
        with self.session.begin():
            room = self._room(room_id, actor)
            member = self._member(room_id, actor.id)
            member.seen_at = time.time()
            self.repo.flush()
            return room_view(self.repo, room, actor.id, self.cipher)

    def ready(self, actor: Identity, room_id: str, ready: bool) -> RoomView:
        self._rate(actor, "ready")
        with self.session.begin():
            room = self._room(room_id, actor, lock=True)
            if room.status == "playing":
                raise HTTPException(409, "Wait until the current match finishes.")
            member = self._member(room_id, actor.id)
            if not member.seated:
                if sum(m.seated for m, _ in self.repo.members(room_id)) >= room.capacity:
                    raise HTTPException(409, "Every seat is occupied.")
                member.seated = True
            member.ready, member.seen_at = ready, time.time()
            room.revision += 1
            self.repo.flush()
            return room_view(self.repo, room, actor.id, self.cipher)

    def configure(self, actor: Identity, room_id: str, data: RoomSettings) -> RoomView:
        values = self._settings(data.game_id, data.capacity, data.settings)
        with self.session.begin():
            room = self._room(room_id, actor, lock=True, host=True)
            if room.status == "playing":
                raise HTTPException(
                    409, "Finish or abandon the current match before changing the game."
                )
            room.game_id, room.capacity, room.settings = data.game_id, data.capacity, values
            room.status, room.match_id = "lobby", None
            for i, (member, _) in enumerate(self.repo.members(room_id)):
                member.ready, member.seated = False, i < data.capacity
            room.revision += 1
            self.repo.flush()
            return room_view(self.repo, room, actor.id, self.cipher)

    def start(self, actor: Identity, room_id: str) -> RoomView:
        self._rate(actor, "start", 20)
        with self.session.begin():
            room = self._room(room_id, actor, lock=True, host=True)
            if room.status == "playing":
                raise HTTPException(409, "A match is already in progress.")
            seated = [m for m, _ in self.repo.members(room_id) if m.seated]
            engine = ENGINES[room.game_id]
            if not engine.manifest.min_players <= len(seated) <= room.capacity or not all(
                m.ready and time.time() - m.seen_at < 45 for m in seated
            ):
                raise HTTPException(
                    409,
                    "Every seated player must be connected and ready, with enough players for this game.",
                )
            players = [m.user_id for m in seated]
            offset = room.round_number % len(players)
            players = players[offset:] + players[:offset]
            match = Match(
                id=str(uuid4()),
                room_id=room.id,
                game_id=room.game_id,
                rules_version=engine.manifest.rules_version,
                state=engine.setup(players, room.settings),
                participants=players,
            )
            self.repo.add(match)
            self.repo.flush()
            room.match_id, room.status = match.id, "playing"
            room.round_number += 1
            room.revision += 1
            for member in seated:
                member.ready = False
            self.repo.flush()
            return room_view(self.repo, room, actor.id, self.cipher)

    def move(self, actor: Identity, room_id: str, data: Move) -> RoomView:
        self._rate(actor, "move", 180)
        fingerprint = hashlib.sha256(data.model_dump_json().encode()).hexdigest()
        with self.session.begin():
            room = self._room(room_id, actor, lock=True)
            match = self.repo.match(room.match_id)
            if not match or match.id != str(data.match_id) or actor.id not in match.participants:
                raise HTTPException(409, "This match is no longer active for your player.")
            receipt = self.repo.receipt(match.id, str(data.action_id))
            if receipt:
                if receipt.actor_id != actor.id or receipt.fingerprint != fingerprint:
                    raise HTTPException(
                        409, "This action identifier was already used for another move."
                    )
                return room_view(self.repo, room, actor.id, self.cipher)
            if match.version != data.expected_version or room.status != "playing":
                raise HTTPException(
                    409, "The table changed. Your hand has been refreshed; choose your move again."
                )
            self._member(room_id, actor.id).seen_at = time.time()
            connected = {
                m.user_id for m, _ in self.repo.members(room_id) if time.time() - m.seen_at < 45
            }
            if not set(match.participants) <= connected:
                raise HTTPException(409, "The table is paused while a player reconnects.")
            engine = ENGINES[match.game_id]
            try:
                match.state = engine.apply_action(match.state, actor.id, data.action)
            except RuleError as error:
                raise HTTPException(422, str(error)) from error
            match.version += 1
            room.revision += 1
            if match.state["phase"] == "finished":
                view = engine.project_view(match.state, actor.id)
                match.result = {
                    "winners": view.winners,
                    "scores": {p.id: p.score for p in view.players},
                }
                room.status = "finished"
            self.repo.flush()
            response = room_view(self.repo, room, actor.id, self.cipher)
            self.repo.add(
                Receipt(
                    match_id=match.id,
                    action_id=str(data.action_id),
                    actor_id=actor.id,
                    fingerprint=fingerprint,
                    response={"committedVersion": match.version},
                )
            )
            return response

    def chat(self, actor: Identity, room_id: str, data: ChatInput) -> RoomView:
        self._rate(actor, "chat", 20)
        body = data.body.strip()
        if not body or data.kind == "reaction" and body not in {"❤️", "😂", "🔥", "👏", "😮", "🎉"}:
            raise HTTPException(422, "Choose a message or a supported reaction.")
        with self.session.begin():
            room = self._room(room_id, actor, lock=True)
            self.repo.add(
                Message(
                    id=str(uuid4()), room_id=room_id, user_id=actor.id, body=body, kind=data.kind
                )
            )
            room.revision += 1
            self.repo.flush()
            return room_view(self.repo, room, actor.id, self.cipher)

    def reading(
        self, actor: Identity, room_id: str, data: ReadingInput | None = None
    ) -> ReadingView:
        if data:
            self._rate(actor, "tarot-reading", 10, 3600)
        with self.session.begin():
            room = self._room(room_id, actor, lock=bool(data))
            match = self.repo.match(room.match_id)
            if not match or match.game_id != "tarot" or match.participants != [actor.id]:
                raise HTTPException(404, "Your Tarot spread is unavailable.")
            if data and (match.id != data.match_id or len(match.state["picks"]) != 3):
                raise HTTPException(409, "Choose all three cards in your current spread first.")
            saved = self.repo.reading(match.id)
            if saved and saved.status == "complete":
                return ReadingView(
                    status="complete",
                    question=saved.question,
                    reading=Reading.model_validate(saved.payload),
                )
            if saved and saved.status == "generating" and saved.lease_until > time.time():
                return ReadingView(
                    status="generating",
                    question=saved.question,
                    message="Your personal reading is being written.",
                )
            if not data:
                return ReadingView(
                    status="ready" if settings().gemini_api_key else "unavailable",
                    message="Personal readings are not configured yet."
                    if not settings().gemini_api_key
                    else "",
                )
            if not settings().gemini_api_key:
                raise HTTPException(
                    503, "Personal readings are not configured yet. Your cards are saved."
                )
            if self.repo.rate("tarot-provider-daily-budget", 86400) > settings().tarot_daily_limit:
                raise HTTPException(
                    429, "Today's personal reading limit has been reached. Your spread is saved."
                )
            attempt, match_id = str(uuid4()), match.id
            if saved is None:
                saved = TarotReading(match_id=match_id)
                self.repo.add(saved)
            saved.status, saved.question = "generating", data.question.strip()
            saved.attempt_id, saved.lease_until = attempt, time.time() + 120
            saved.prompt_version = PROMPT_VERSION
            cards = [match.state["deck"][i] for i in match.state["picks"]]
            question = saved.question
        # The provider call deliberately runs without a database transaction or row lock.
        try:
            result = generate_reading(cards, question)
        except Exception as error:
            logging.getLogger("uvicorn.error").warning(
                "games.ai.failure model=%s error_type=%s validation_errors=%s",
                settings().tarot_model,
                type(error).__name__,
                error.error_count() if isinstance(error, ValidationError) else 0,
            )
            with self.session.begin():
                self._room(room_id, actor, lock=True)
                saved = self.repo.reading(match_id)
                if saved and saved.attempt_id == attempt:
                    saved.status = "failed"
            raise HTTPException(
                502, "Your reading could not be completed. Your cards are saved; please retry."
            ) from None
        with self.session.begin():
            room = self._room(room_id, actor, lock=True)
            match = self.repo.match(match_id)
            saved = self.repo.reading(match_id)
            if (
                room.match_id != match_id
                or saved is None
                or match is None
                or saved.attempt_id != attempt
            ):
                raise HTTPException(409, "This spread has changed. Open your current spread.")
            saved.status, saved.payload = "complete", result.model_dump(mode="json")
            match.state = {**match.state, "phase": "finished", "message": "Your reading is ready."}
            match.version += 1
            match.result = {"winners": [], "scores": {actor.id: 0}}
            room.status, room.revision = "finished", room.revision + 1
            return ReadingView(status="complete", question=question, reading=result)

    def manage(
        self, actor: Identity, room_id: str, action: str, target: str | None = None
    ) -> RoomView:
        self._rate(actor, "manage", 30)
        with self.session.begin():
            room = self._room(
                room_id, actor, lock=True, host=action in {"abandon", "invite", "kick"}
            )
            members = self.repo.members(room_id)
            if action == "claim":
                host = self.repo.member(room_id, room.owner_id)
                if host and host.active and time.time() - host.seen_at < 90:
                    raise HTTPException(409, "The host can still reconnect.")
                room.owner_id = actor.id
            elif action == "invite":
                token, hashed = invite()
                room.invite_hash, room.invite_ciphertext, room.code = (
                    hashed,
                    self.cipher.encrypt(token.encode()).decode(),
                    room_code(),
                )
            elif action == "abandon":
                match = self.repo.match(room.match_id)
                if match and room.status == "playing":
                    match.result = {"abandoned": True, "winners": [], "scores": {}}
                room.status, room.match_id = "lobby", None
                for member, _ in members:
                    member.ready = False
            elif action == "kick":
                if room.status == "playing" or target == actor.id:
                    raise HTTPException(
                        409, "Players can be removed in the lobby, after any active match is ended."
                    )
                if not target:
                    raise HTTPException(422, "Choose a player to remove.")
                victim = self.repo.member(room_id, target)
                if victim:
                    victim.active, victim.seated, victim.ready = False, False, False
            elif action == "leave":
                self._member(room_id, actor.id).active = False
                if room.owner_id == actor.id:
                    remaining = [
                        m
                        for m, _ in members
                        if m.user_id != actor.id and time.time() - m.seen_at < 45
                    ]
                    if remaining:
                        room.owner_id = remaining[0].user_id
                    elif len(members) == 1:
                        room.status = "closed"
            room.revision += 1
            self.repo.flush()
            return room_view(self.repo, room, actor.id, self.cipher)

    def profile(self, actor: Identity, data: ProfileInput) -> ProfileView:
        self._rate(actor, "profile", 20)
        with self.session.begin():
            profile = self.repo.save_profile(actor.id, data.name, data.avatar)
            return ProfileView(id=profile.id, name=profile.name, avatar=profile.avatar)

    def me(self, actor: Identity) -> MeView:
        with self.session.begin():
            profile = self.repo.profile(actor.id)
            return MeView(
                profile=ProfileView(id=profile.id, name=profile.name, avatar=profile.avatar)
                if profile
                else None,
                anonymous=actor.anonymous,
                rooms=[
                    RoomSummary(
                        id=r.id,
                        name=r.name,
                        game_id=r.game_id,
                        status=r.status,
                        players=count,
                        capacity=r.capacity,
                    )
                    for r, count in self.repo.recent_rooms(actor.id)
                ],
                history=[
                    MatchSummary(
                        id=m.id,
                        room_id=m.room_id,
                        game_id=m.game_id,
                        winners=m.result["winners"],
                        score=m.result["scores"].get(actor.id, 0),
                        created_at=m.created_at,
                    )
                    for m in self.repo.history(actor.id)
                    if m.result is not None
                    and actor.id in m.participants
                    and not m.result.get("abandoned")
                ],
            )
