from __future__ import annotations

import base64
import hashlib
import json
import logging
import secrets
import time
from uuid import UUID, uuid4, uuid5

from cryptography.fernet import Fernet
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.astrology.chart import calculate_chart
from app.astrology.geocoder import GeocoderUnavailable, resolve_place, search_places
from app.astrology.models import (
    AstrologyChart,
    AstrologyPlaces,
    AstrologyPlaceSearch,
    AstrologyPreview,
    AstrologyPreviewInput,
)
from app.auth import Identity
from app.core.contracts import Action, RuleError
from app.games.registry import ENGINES
from app.games.tarot.reading import (
    PROMPT_VERSION,
    Reading,
    ReadingInput,
    ReadingLimitError,
    ReadingOutputError,
    ReadingView,
    generate_reading,
)
from app.models import Match, Member, Message, Profile, Receipt, Room, TarotReading
from app.rooms.bots import BOT_DELAY_SECONDS, BOT_NAMES, bot_delay, next_bot_view
from app.rooms.public_actions import PUBLIC_ACTIONS, public_action
from app.rooms.public_history import public_move
from app.rooms.repository import Repository
from app.rooms.schemas import (
    AddBots,
    ChatInput,
    CreateRoom,
    DriveBots,
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
        if room is None or member is None or not member.active or member.is_bot:
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

    def _add_bots(self, room: Room, count: int) -> None:
        from app.bots import supports_bots

        members = self.repo.members(room.id)
        if not supports_bots(room.game_id) or count > room.capacity - sum(
            m.seated for m, _ in members
        ):
            raise HTTPException(422, "Choose a bot for each available multiplayer seat.")
        if len(members) + count > 20:
            raise HTTPException(422, "This room has no room for more players.")
        used = {p.name for _, p in members}
        choices = [
            (f"Bot {name}{f' {cycle + 1}' if cycle else ''}", i % 8)
            for cycle in range(3)
            for i, name in enumerate(BOT_NAMES)
        ]
        for _ in range(count):
            choice = next((item for item in choices if item[0] not in used), None)
            if choice is None:
                raise HTTPException(422, "This room already has the maximum number of bots.")
            name, avatar = choice
            used.add(name)
            bot_id = "bot:" + uuid4().hex
            self.repo.add(Profile(id=bot_id, name=name, avatar=avatar))
            self.repo.flush()
            self.repo.add(
                Member(room_id=room.id, user_id=bot_id, is_bot=True, ready=True, seated=True)
            )
        self.repo.flush()

    def _connected(self, room_id: str, match: Match) -> bool:
        available = {
            m.user_id
            for m, _ in self.repo.members(room_id)
            if m.is_bot or time.time() - m.seen_at < 45
        }
        return set(match.participants) <= available

    def _apply_action(
        self,
        room: Room,
        match: Match,
        player_id: str,
        action: Action,
        action_id: str,
        fingerprint: str,
    ) -> None:
        engine = ENGINES[match.game_id]
        before_views = {p: engine.project_view(match.state, p) for p in match.participants}
        cue = (
            public_action(before_views[player_id], player_id, action, match.version + 1)
            if match.game_id in PUBLIC_ACTIONS else None
        )
        try:
            match.state = engine.apply_action(match.state, player_id, action)
        except RuleError as error:
            raise HTTPException(422, str(error)) from error
        after_views = {p: engine.project_view(match.state, p) for p in match.participants}
        event = public_move(before_views, after_views, player_id, action, match.version + 1)
        match_bots = [
            member
            for member, _ in self.repo.members(room.id)
            if member.is_bot and member.user_id in match.participants
        ]
        observing_bots = match_bots if match.game_id in {"trio", "flip-7"} else []
        if observing_bots:
            from app.bots import observe_view

            memories = dict(match.bot_memory)
            for member in observing_bots:
                view = after_views[member.user_id]
                memory = observe_view(view, member.user_id, self._bot_memory(match, member.user_id))
                if len(json.dumps(memory, allow_nan=False)) > 16384:
                    raise HTTPException(
                        503, "This bot could not finish its move. Please try again."
                    )
                memories[member.user_id] = memory
            match.bot_memory = memories
        match.version += 1
        # Reviews and fresh UNO calls get time to be read or answered before a bot acts.
        match.bot_due_at = time.time() + bot_delay(
            engine, match.state, [m for m in match_bots if m.seated], BOT_DELAY_SECONDS
        )
        room.revision += 1
        if match.state["phase"] == "finished":
            view = after_views[player_id]
            match.result = {
                "winners": view.winners,
                "scores": {p.id: p.score for p in view.players},
            }
            room.status = "finished"
        self.repo.add(
            Receipt(
                match_id=match.id,
                action_id=action_id,
                actor_id=player_id,
                fingerprint=fingerprint,
                response={"committedVersion": match.version,
                          **({"public_action": cue} if cue else {}),
                          **({"public_move": event.model_dump()} if event else {})},
            )
        )
        self.repo.flush()

    @staticmethod
    def _bot_memory(match: Match, bot_id: str) -> dict:
        saved = match.bot_memory.get(bot_id)
        # Independent private randomness keeps hidden party choices unpredictable
        # from public identifiers without sharing the engine's shuffle seed.
        return saved if saved is not None else {"seed": secrets.randbits(128)}

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
            if data.bots:
                self._add_bots(room, data.bots)
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
            if room.status != "playing" and not seated and not (existing and existing.active):
                # Friends can replace a lobby bot; never alter a running match.
                replacement = next((m for m, _ in reversed(members) if m.is_bot and m.seated), None)
                if replacement:
                    replacement.active, replacement.seated, replacement.ready = False, False, False
                    seated = True
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
            members = sorted(self.repo.members(room_id), key=lambda pair: pair[0].is_bot)
            bots_allowed = True
            if any(member.is_bot for member, _ in members):
                from app.bots import supports_bots

                bots_allowed = supports_bots(data.game_id)
            for i, (member, _) in enumerate(members):
                member.seated = i < data.capacity and (not member.is_bot or bots_allowed)
                member.ready = member.is_bot and member.seated
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
                (m.is_bot or m.ready and time.time() - m.seen_at < 45) for m in seated
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
                bot_due_at=time.time() + BOT_DELAY_SECONDS,
            )
            self.repo.add(match)
            self.repo.flush()
            room.match_id, room.status = match.id, "playing"
            room.round_number += 1
            room.revision += 1
            for member in seated:
                member.ready = member.is_bot
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
                    409, "The table changed while you were choosing. It is up to date now; choose again."
                )
            self._member(room_id, actor.id).seen_at = time.time()
            if not self._connected(room_id, match):
                raise HTTPException(409, "The table is paused while a player reconnects.")
            self._apply_action(room, match, actor.id, data.action, str(data.action_id), fingerprint)
            return room_view(self.repo, room, actor.id, self.cipher)

    def add_bots(self, actor: Identity, room_id: str, data: AddBots) -> RoomView:
        self._rate(actor, "bots", 30)
        with self.session.begin():
            room = self._room(room_id, actor, lock=True, host=True)
            if room.status == "playing":
                raise HTTPException(409, "Bots can be added between matches.")
            self._add_bots(room, data.count)
            room.revision += 1
            return room_view(self.repo, room, actor.id, self.cipher)

    def drive_bots(self, actor: Identity, room_id: str, data: DriveBots) -> RoomView:
        self._rate(actor, "bot-drive", 180)
        with self.session.begin():
            room = self._room(room_id, actor, lock=True)
            match = self.repo.match(room.match_id)
            # Stale/concurrent drives are successful no-ops with the caller's
            # fresh view; no retry can advance the same expected version twice.
            if (
                not match
                or room.status != "playing"
                or match.id != str(data.match_id)
                or match.version != data.expected_version
            ):
                return room_view(self.repo, room, actor.id, self.cipher)
            self._member(room_id, actor.id).seen_at = time.time()
            if time.time() < match.bot_due_at or not self._connected(room_id, match):
                return room_view(self.repo, room, actor.id, self.cipher)
            bots = [
                m
                for m, _ in self.repo.members(room_id)
                if m.is_bot and m.seated and m.user_id in match.participants
            ]
            selected = next_bot_view(ENGINES[match.game_id], match.state, bots)
            if selected is None:
                return room_view(self.repo, room, actor.id, self.cipher)
            from app.bots import choose_action

            bot_id, view = selected
            memory = self._bot_memory(match, bot_id)
            decision = choose_action(view, bot_id, memory)
            serialized = json.dumps(decision.memory, allow_nan=False)
            if len(serialized) > 16384:
                raise HTTPException(503, "This bot could not finish its move. Please try again.")
            match.bot_memory = {**match.bot_memory, bot_id: decision.memory}
            action_id = str(uuid5(UUID(match.id), f"bot:{match.version}:{bot_id}"))
            fingerprint = hashlib.sha256(decision.action.model_dump_json().encode()).hexdigest()
            self._apply_action(room, match, bot_id, decision.action, action_id, fingerprint)
            return room_view(self.repo, room, actor.id, self.cipher)

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

    def _astrology_match(self, actor: Identity, room_id: str, match_id: str) -> None:
        with self.session.begin():
            room = self._room(room_id, actor)
            match = self.repo.match(room.match_id)
            if not match or match.game_id != "tarot" or match.participants != [actor.id]:
                raise HTTPException(404, "Your Tarot spread is unavailable.")
            if match.id != match_id:
                raise HTTPException(409, "This spread has changed. Open your current spread.")

    def astrology_places(
        self, actor: Identity, room_id: str, data: AstrologyPlaceSearch
    ) -> AstrologyPlaces:
        self._rate(actor, "astrology-places", 20)
        self._astrology_match(actor, room_id, data.match_id)
        try:
            return search_places(data.query)
        except GeocoderUnavailable:
            raise HTTPException(503, "City search is temporarily unavailable. Please try again.") from None

    def astrology_preview(
        self, actor: Identity, room_id: str, data: AstrologyPreviewInput
    ) -> AstrologyPreview:
        self._rate(actor, "astrology-chart", 10)
        self._astrology_match(actor, room_id, data.match_id)
        # Canonical place lookup and chart calculations occur after authorization
        # has committed and released its transaction; no external I/O holds a lock.
        try:
            place = resolve_place(data.astrology.place_id)
        except GeocoderUnavailable:
            raise HTTPException(503, "City lookup is temporarily unavailable. Please try again.") from None
        return calculate_chart(data.astrology, place)

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
                    astrology_chart=self._saved_astrology_chart(saved),
                )
            if not data:
                return ReadingView(
                    status="ready" if settings().gemini_api_key else "unavailable",
                    message="Personal readings are not configured yet."
                    if not settings().gemini_api_key
                    else "",
                    question=saved.question if saved else "",
                    astrology_chart=self._saved_astrology_chart(saved),
                )
            if not settings().gemini_api_key:
                raise HTTPException(
                    503, "Personal readings are not configured yet. Your cards are saved."
                )
            match_id = match.id
            cards = [match.state["deck"][i] for i in match.state["picks"]]
            question = data.question.strip()
            astrology_chart = self._saved_astrology_chart(saved) if data.reuse_saved_astrology else None
            if data.reuse_saved_astrology and astrology_chart is None:
                raise HTTPException(422, "No saved chart is available. Enter your birth details.")

        if data.astrology is not None:
            preview = self.astrology_preview(actor, room_id, AstrologyPreviewInput(
                match_id=match_id, astrology=data.astrology
            ))
            if preview.chart is None:
                raise HTTPException(422, preview.issue.model_dump() if preview.issue else "Check your birth details.")
            astrology_chart = preview.chart

        # Lookup/calculation completed without a lock. Recheck the exact match
        # and lease before reserving one combined Tarot/astrology generation.
        # Sessions retain objects across commits, so discard the earlier snapshot
        # before locking again; another request may have rematched or retried.
        self.session.expire_all()
        with self.session.begin():
            room = self._room(room_id, actor, lock=True)
            if room.match_id != match_id:
                raise HTTPException(409, "This spread has changed. Open your current spread.")
            saved = self.repo.reading(match_id)
            if saved and saved.status == "complete":
                return ReadingView(status="complete", question=saved.question,
                                   reading=Reading.model_validate(saved.payload))
            if saved and saved.status == "generating" and saved.lease_until > time.time():
                return ReadingView(status="generating", question=saved.question,
                                   message="Your personal reading is being written.",
                                   astrology_chart=self._saved_astrology_chart(saved))
            attempt = str(uuid4())
            if saved is None:
                saved = TarotReading(match_id=match_id)
                self.repo.add(saved)
            saved.status, saved.question = "generating", question
            saved.attempt_id, saved.lease_until = attempt, time.time() + 120
            saved.prompt_version = PROMPT_VERSION
            saved.payload = {"astrology_draft": astrology_chart.model_dump(mode="json")} if astrology_chart else None

        # The provider call deliberately runs without a database transaction or row lock.
        def reserve_attempt() -> None:
            with self.session.begin():
                count = self.repo.rate("tarot-provider-daily-budget", 86400)
            if count > settings().tarot_daily_limit:
                raise ReadingLimitError("The daily reading budget is exhausted.")

        try:
            if astrology_chart:
                result = generate_reading(cards, question, before_attempt=reserve_attempt,
                                          astrology_chart=astrology_chart)
            else:
                result = generate_reading(cards, question, before_attempt=reserve_attempt)
        except Exception as error:
            logging.getLogger("uvicorn.error").warning(
                "games.ai.failure model=%s error_type=%s validation_errors=%s",
                settings().tarot_model,
                type(error).__name__,
                error.error_count()
                if isinstance(error, ValidationError)
                else error.errors
                if isinstance(error, ReadingOutputError)
                else 0,
            )
            self.session.expire_all()
            with self.session.begin():
                self._room(room_id, actor, lock=True)
                saved = self.repo.reading(match_id)
                if saved and saved.attempt_id == attempt:
                    saved.status = "failed"
            if isinstance(error, ReadingLimitError):
                raise HTTPException(
                    429, "Today's personal reading limit has been reached. Your spread is saved."
                ) from None
            raise HTTPException(
                502, "Your reading could not be completed. Your cards are saved; please retry."
            ) from None
        self.session.expire_all()
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

    @staticmethod
    def _saved_astrology_chart(saved: TarotReading | None) -> AstrologyChart | None:
        if saved and isinstance(saved.payload, dict) and saved.payload.get("astrology_draft"):
            return AstrologyChart.model_validate(saved.payload["astrology_draft"])
        return None

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
                    member.ready = member.is_bot and member.seated
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
                humans = [m for m, _ in members if not m.is_bot and m.user_id != actor.id]
                if not humans:
                    match = self.repo.match(room.match_id)
                    if match and room.status == "playing":
                        match.result = {"abandoned": True, "winners": [], "scores": {}}
                    room.status = "closed"
                    for member, _ in members:
                        if member.is_bot:
                            member.active, member.seated, member.ready = False, False, False
                elif room.owner_id == actor.id:
                    remaining = [
                        m
                        for m, _ in members
                        if not m.is_bot and m.user_id != actor.id and time.time() - m.seen_at < 45
                    ]
                    if remaining:
                        room.owner_id = remaining[0].user_id
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
