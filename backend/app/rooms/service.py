from __future__ import annotations

import base64
import hashlib
import json
import logging
import secrets
import time
from typing import Literal
from uuid import UUID, uuid4, uuid5

from cryptography.fernet import Fernet
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.ai_logging import get_ai_logger
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
from app.core.contracts import Action, GameView, RuleError
from app.games.registry import ENGINES
from app.games.secret_santa.engine import SecretSantaEngine
from app.games.tarot.engine import drawn_orientations
from app.games.tarot.progress import ProgressEvent, ProgressState, ReadingProgress
from app.games.tarot.reading import (
    PROMPT_VERSION,
    Reading,
    ReadingFailure,
    ReadingInput,
    ReadingLimitError,
    ReadingOutputError,
    ReadingView,
    alternate_view,
    generate_reading,
    reading_available,
    reading_failure,
)
from app.games.tarot.style import ReadingStyle, saved_style
from app.models import Match, Member, Message, Profile, Receipt, Room, RoomInvite, TarotReading
from app.rooms.bots import BOT_DELAY_SECONDS, BOT_NAMES, bot_delay, next_bot_view
from app.rooms.progress import (
    REWARD_BY_ID,
    Cosmetics,
    MatchFact,
    build_progress,
    read_cosmetics,
    stored_cosmetics,
    worn_card_back,
    worn_frame,
)
from app.rooms.public_actions import PUBLIC_ACTIONS, public_action
from app.rooms.public_history import public_move
from app.rooms.repository import CHANCE_GAME_IDS, Repository
from app.rooms.santa_links import link_token, opens, read_token
from app.rooms.schemas import (
    AddBots,
    BotSeat,
    ChatInput,
    CosmeticsInput,
    CreateRoom,
    DriveBots,
    InvitationView,
    JoinRoom,
    MatchSummary,
    MeView,
    Move,
    OwnProfileView,
    PlayerHit,
    PlayerSearch,
    ProfileInput,
    ProgressView,
    QuickPlay,
    RoomLookup,
    RoomSettings,
    RoomSummary,
    RoomView,
    SantaLink,
    SantaLinks,
    SantaReveal,
    SavedReadingView,
    UpdateBot,
    clean_username,
)
from app.rooms.views import bot_level, room_view
from app.settings import settings


def invite() -> tuple[str, str]:
    token = secrets.token_urlsafe(24)
    return token, hashlib.sha256(token.encode()).hexdigest()


def saved_player_score(match: Match, player: str) -> int:
    assert match.result is not None
    stored: int = match.result["scores"].get(player, 0)
    engine = ENGINES.get(match.game_id)
    return engine.history_score(match.state, player, stored) if engine else stored


def guessable(code: str) -> bool:
    """Codes someone would try first: one repeated digit, or a straight run."""
    steps = {int(b) - int(a) for a, b in zip(code, code[1:], strict=False)}
    return steps in ({0}, {1}, {-1})


def room_code() -> str:
    """Six digits, easy to read aloud; the first is never zero."""
    while True:
        code = str(100_000 + secrets.randbelow(900_000))
        if not guessable(code):
            return code


def retired_code() -> str:
    """The older 8-character format. A closed room's number is swapped for one of
    these, so the number is free again and the closed room answers to nothing typed."""
    return "".join(secrets.choice("ABCDEFGHJKMNPQRSTVWXYZ23456789") for _ in range(8))


# Six digits is a small space, so wrong codes are counted separately from joins.
WRONG_INVITE_LIMIT = 10
WRONG_INVITE_WINDOW_SECONDS = 600
WRONG_CODES = "Too many wrong codes. Wait ten minutes, then try again."
# Secret Santa links that open nothing are counted the same way, on their own.
SANTA_MISSES = "wrong-santa-link"
SANTA_NO_LINK = "This link doesn't open a name. Ask the organiser for a new one."
SANTA_SLOW_DOWN = "Too many links that didn't work. Wait ten minutes, then try again."
MAX_PENDING_INVITES = 20
RESERVED_USERNAMES = frozenset(
    {
        "admin",
        "administrator",
        "moderator",
        "mod",
        "support",
        "help",
        "system",
        "games",
        "bot",
        "guest",
        "anonymous",
        "null",
        "undefined",
        "me",
        "you",
        "host",
        "owner",
        "staff",
        "official",
        "everyone",
        "player",
    }
)


class _WrongInvite(Exception):
    """A code or token that opens nothing for this caller; counted after rollback."""


QUICK_PLAY_NAMESPACE = UUID("80b8112a-4a30-4c3f-9222-77e480956729")


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

    def _check_wrong_invites(
        self, actor: Identity, scope: str = "wrong-invite", slow_down: str = WRONG_CODES
    ) -> None:
        with self.session.begin():
            count = self.repo.rate_count(f"{actor.id}:{scope}", WRONG_INVITE_WINDOW_SECONDS)
        if count > WRONG_INVITE_LIMIT:
            raise HTTPException(429, slow_down)

    def _wrong_invite(
        self, actor: Identity, message: str, scope: str = "wrong-invite",
        slow_down: str = WRONG_CODES,
    ) -> HTTPException:
        """Count one failed lookup, committed on its own, and choose its answer."""
        with self.session.begin():
            count = self.repo.rate(f"{actor.id}:{scope}", WRONG_INVITE_WINDOW_SECONDS)
        if count > WRONG_INVITE_LIMIT:
            return HTTPException(429, slow_down)
        return HTTPException(404, message)

    def _fresh_code(self, retired: bool = False) -> str:
        """A code no room holds, reserved until this transaction commits.

        `retired` draws the older 8-character format, for rooms nobody can join by
        number: a closed room and a solo table."""
        for _ in range(64):
            code = retired_code() if retired else room_code()
            if self.repo.claim_code(code):
                return code
        raise HTTPException(503, "Couldn't open a room just now. Please try again.")

    def _close(self, room: Room) -> None:
        room.status = "closed"
        # The six digits go back into circulation; nothing typed reaches this room.
        room.code = self._fresh_code(retired=True)
        self.repo.delete_room_invites(room.id)

    @staticmethod
    def _solo_refusal(room: Room) -> str | None:
        engine = ENGINES.get(room.game_id)
        if engine is None or engine.manifest.play_mode != "solo":
            return None
        return (
            "This is a private Tarot reading, so it can't be joined. "
            "Start your own reading from the games library."
            if room.game_id == "tarot" else
            "This is a private solo table, so it can't be joined. "
            "Start your own from the games library."
        )

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

    def _add_bots(self, room: Room, seats: list[BotSeat]) -> None:
        from app.bots import supports_bots

        members = self.repo.members(room.id)
        count = len(seats)
        if not supports_bots(room.game_id) or count > room.capacity - sum(
            m.seated for m, _ in members
        ):
            raise HTTPException(422, "Choose a bot for each available multiplayer seat.")
        if len(members) + count > 20:
            raise HTTPException(422, "This room has no room for more players.")
        # Names are compared without case so "ada" and "Ada" never sit together.
        used = {p.name.casefold() for _, p in members}
        for seat in seats:
            if seat.name is not None:
                self._free_name(seat.name, used)
                used.add(seat.name.casefold())
        choices = [
            (f"Bot {name}{f' {cycle + 1}' if cycle else ''}", i % 8)
            for cycle in range(3)
            for i, name in enumerate(BOT_NAMES)
        ]
        for seat in seats:
            if seat.name is not None:
                name = seat.name
                avatar = sum(name.encode()) % 8
            else:
                choice = next((item for item in choices if item[0].casefold() not in used), None)
                if choice is None:
                    raise HTTPException(422, "This room already has the maximum number of bots.")
                name, avatar = choice
                used.add(name.casefold())
            bot_id = "bot:" + uuid4().hex
            self.repo.add(Profile(id=bot_id, name=name, avatar=avatar))
            self.repo.flush()
            self.repo.add(
                Member(
                    room_id=room.id, user_id=bot_id, is_bot=True, ready=True, seated=True,
                    bot_level=seat.level,
                )
            )
        self.repo.flush()

    @staticmethod
    def _free_name(name: str, used: set[str]) -> None:
        if name.casefold() in used:
            raise HTTPException(422, f"Someone at this table is already called {name}.")

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
                # A solo table cannot be joined, so it takes no six-digit number.
                code=self._fresh_code(retired=ENGINES[data.game_id].manifest.play_mode == "solo"),
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
            seats = data.bot_seats if data.bot_seats is not None else [BotSeat()] * data.bots
            if seats:
                self._add_bots(room, seats)
            return room_view(self.repo, room, actor.id, self.cipher)

    def quick_play(self, actor: Identity, game_id: str, data: QuickPlay) -> RoomView:
        """Create and start once; a lost response can safely repeat this same intent."""
        from app.bots import supports_bots

        self._rate(actor, "quick-play")
        engine = ENGINES.get(game_id)
        if engine is None or not (
            engine.manifest.play_mode == "solo" or supports_bots(game_id)
        ):
            raise HTTPException(422, "Choose a game that supports solo play or bots.")
        capacity = (1 if engine.manifest.play_mode == "solo"
                    else max(2, engine.manifest.min_players))
        values = self._settings(game_id, capacity, {})
        # Bind both IDs to the authenticated actor, independently of the URL's game.
        # One intent cannot open another actor's session or be reused for a new game.
        room_id = str(uuid5(QUICK_PLAY_NAMESPACE, f"{actor.id}:{data.request_id}"))
        match_id = str(uuid5(QUICK_PLAY_NAMESPACE, f"{room_id}:first-match"))
        with self.session.begin():
            self.repo.lock_quick_play(room_id)
            existing = self.repo.room(room_id, lock=True)
            if existing is not None:
                if existing.owner_id != actor.id:
                    raise HTTPException(404, "This game is unavailable.")
                if existing.status == "closed":
                    raise HTTPException(410, "This game has ended. Start a new game.")
                self._room(room_id, actor)
                if existing.game_id != game_id or existing.match_id != match_id:
                    raise HTTPException(409, "This start belongs to an earlier game.")
                return room_view(self.repo, existing, actor.id, self.cipher)

            # Retries have their own request throttle above; only a new committed
            # launch consumes the existing room-creation and start allowances.
            if self.repo.rate(actor.id + ":create", 3600) > 12:
                raise HTTPException(429, "Please slow down and try again shortly.")
            if self.repo.rate(actor.id + ":start", 60) > 20:
                raise HTTPException(429, "Please slow down and try again shortly.")
            profile = self.repo.ensure_player(actor.id, "Guest")
            token, hashed = invite()
            room = Room(
                id=room_id, name=f"{profile.name}'s {engine.manifest.name}"[:60],
                code=self._fresh_code(retired=engine.manifest.play_mode == "solo"),
                owner_id=actor.id, game_id=game_id,
                capacity=capacity, settings=values, invite_hash=hashed,
                invite_ciphertext=self.cipher.encrypt(token.encode()).decode(),
            )
            self.repo.add(room)
            self.repo.flush()
            self.repo.add(Member(room_id=room.id, user_id=actor.id, ready=True))
            self.repo.flush()
            if capacity > 1:
                self._add_bots(room, [BotSeat()] * (capacity - 1))
            self._start_match(room, match_id=match_id)
            return room_view(self.repo, room, actor.id, self.cipher)

    def join(self, actor: Identity, data: JoinRoom) -> RoomView:
        self._rate(actor, "join", 30)
        self._check_wrong_invites(actor)
        try:
            with self.session.begin():
                room = self.repo.invite(data.invite)
                if room is None or room.status == "closed":
                    # A wrong code and a closed room get one answer and one count.
                    raise _WrongInvite
                self._enter(room, actor, data)
                return room_view(self.repo, room, actor.id, self.cipher)
        except _WrongInvite:
            raise self._wrong_invite(
                actor, "This invite is invalid or has been replaced."
            ) from None

    def _enter(self, room: Room, actor: Identity, profile: ProfileInput | None = None) -> None:
        """Bring a person into a locked, open room: by code, link or accepted invitation."""
        members = self.repo.members(room.id)
        existing = self.repo.member(room.id, actor.id)
        returning = bool(existing and existing.active)
        refusal = self._solo_refusal(room)
        if refusal and not returning:
            # A solo table has one seat and nothing public to watch; an invite
            # replaced or shared by mistake must not add a silent spectator.
            raise HTTPException(409, refusal)
        if len(members) >= 20 and not returning:
            raise HTTPException(409, "This room is full.")
        if profile is not None:
            self.repo.save_profile(actor.id, profile.name, profile.avatar)
        seated = room.status != "playing" and sum(m.seated for m, _ in members) < room.capacity
        if room.status != "playing" and not seated and not returning:
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
        # However they arrived, an invitation to this room has been answered.
        self.repo.delete_invite(room.id, actor.id)
        room.revision += 1
        self.repo.flush()

    def lookup(self, actor: Identity, invite: str) -> RoomLookup:
        """Where a code leads, only for someone already inside that room."""
        self._rate(actor, "lookup", 30)
        self._check_wrong_invites(actor)
        with self.session.begin():
            room = self.repo.invite(invite, lock=False)
            open_room = room is not None and room.status != "closed"
            member = self.repo.member(room.id, actor.id) if room else None
            if open_room and room and member and member.active and not member.is_bot:
                return RoomLookup(id=room.id, game_id=room.game_id)
        message = "No room of yours matches that code or invite."
        if open_room:
            # A friend's link opened before joining is not a wrong guess: the answer is
            # the same, but it spends none of the wrong-code allowance. It tells the
            # caller nothing a join with that code would not.
            raise HTTPException(404, message)
        # An unknown code and a closed room spend the same allowance as a failed join.
        raise self._wrong_invite(actor, message)

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
            self._start_match(room)
            return room_view(self.repo, room, actor.id, self.cipher)

    def _start_match(self, room: Room, *, match_id: str | None = None) -> None:
        """Start inside the caller's locked transaction, including atomic quick play."""
        if room.status == "playing":
            raise HTTPException(409, "A match is already in progress.")
        seated = [m for m, _ in self.repo.members(room.id) if m.seated]
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
            id=match_id or str(uuid4()), room_id=room.id, game_id=room.game_id,
            rules_version=engine.manifest.rules_version,
            state=engine.setup(players, room.settings), participants=players,
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
        if data.name is not None and data.count != 1:
            raise HTTPException(422, "A name can be given to one bot at a time.")
        with self.session.begin():
            room = self._room(room_id, actor, lock=True, host=True)
            if room.status == "playing":
                raise HTTPException(409, "Bots can be added between matches.")
            self._add_bots(room, [BotSeat(name=data.name, level=data.level)] * data.count)
            room.revision += 1
            return room_view(self.repo, room, actor.id, self.cipher)

    def update_bot(self, actor: Identity, room_id: str, bot_id: str, data: UpdateBot) -> RoomView:
        self._rate(actor, "bots", 30)
        if data.name is None and data.level is None:
            raise HTTPException(422, "Choose a new name or level for this bot.")
        with self.session.begin():
            room = self._room(room_id, actor, lock=True, host=True)
            if room.status == "playing":
                raise HTTPException(409, "Bots can be changed between matches.")
            bot = self.repo.member(room_id, bot_id)
            profile = self.repo.profile(bot_id) if bot and bot.active and bot.is_bot else None
            if bot is None or profile is None:
                raise HTTPException(404, "That bot is not at this table.")
            if data.name is not None:
                self._free_name(data.name, {
                    p.name.casefold() for m, p in self.repo.members(room_id) if m.user_id != bot_id
                })
                profile.name = data.name
            if data.level is not None:
                bot.bot_level = data.level
            room.revision += 1
            self.repo.flush()
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
            level = bot_level(next(m.bot_level for m in bots if m.user_id == bot_id))
            # A hard bot is the plain policy call it has always been.
            decision = (
                choose_action(view, bot_id, memory)
                if level == "hard"
                else choose_action(view, bot_id, memory, level)
            )
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

    def saved_chance_session(self, actor: Identity, match_id: str) -> GameView:
        with self.session.begin():
            match = self.repo.match(match_id)
            if (
                match is None
                or match.game_id not in CHANCE_GAME_IDS
                or match.participants != [actor.id]
                or not match.result
                or match.result.get("abandoned")
                or match.state.get("phase") != "finished"
            ):
                raise HTTPException(404, "This session is unavailable to your player account.")
            return ENGINES[match.game_id].project_view(match.state, actor.id)

    def saved_reading(self, actor: Identity, match_id: str, *, style: ReadingStyle | None = None) -> SavedReadingView:
        # A room can move on or close without taking its participant's reading
        # away. The saved sole participant, not current membership, authorizes it.
        with self.session.begin():
            match = self.repo.match(match_id)
            if not match or match.game_id != "tarot" or match.participants != [actor.id]:
                raise HTTPException(404, "This reading is unavailable to your player session.")
            saved = self.repo.reading(match.id)
            room = self.repo.room(match.room_id)
            member = self.repo.member(match.room_id, actor.id)
            can_resume = bool(
                room and room.status != "closed" and room.match_id == match.id
                and member and member.active and not member.is_bot
            )
            status: Literal["complete", "generating", "incomplete", "unavailable"] = "incomplete"
            reading = None
            if saved and saved.status == "complete":
                try:
                    # Historical output uses the backwards-compatible stored
                    # parser, never the stricter fresh-generation validator.
                    reading = Reading.model_validate(saved.payload)
                    status = "complete"
                except ValidationError:
                    logging.getLogger("uvicorn.error").warning(
                        "games.reading_archive.invalid_payload"
                    )
                    status = "unavailable"
            elif saved and saved.status == "generating" and saved.lease_until > time.time():
                status = "generating"
            original = SavedReadingView(
                match_id=match.id,
                room_id=match.room_id,
                created_at=match.created_at,
                reading_style=saved_style(match.state, submitted=saved is not None),
                status=status,
                question=saved.question if saved else "",
                cards=ENGINES["tarot"].project_view(match.state, actor.id).community,
                reading=reading,
                can_resume=can_resume,
            )

        if not style or style == original.reading_style or original.reading is None:
            return original
        # Local matching can be CPU-intensive. Run it only after authorization
        # and after releasing the database transaction used to load the original.
        try:
            alternate = alternate_view(original.reading, style, [card.id for card in original.cards], original.question)
        except Exception:
            logging.getLogger("uvicorn.error").warning("games.reading_archive.alternate_unavailable")
            raise HTTPException(503, "Couldn’t open this reading style. Try again.") from None
        return original.model_copy(update={
            "reading_style": style, "original_reading_style": original.reading_style, "reading": alternate,
        })

    def reading(
        self, actor: Identity, room_id: str, data: ReadingInput | None = None
    ) -> ReadingView:
        with self.session.begin():
            room = self._room(room_id, actor, lock=bool(data))
            match = self.repo.match(room.match_id)
            if not match or match.game_id != "tarot" or match.participants != [actor.id]:
                raise HTTPException(404, "Your Tarot spread is unavailable.")
            if data and (match.id != data.match_id or len(match.state["picks"]) != 3):
                raise HTTPException(409, "Choose all three cards in your current spread first.")
            saved = self.repo.reading(match.id)
            style = saved_style(match.state, submitted=saved is not None)
            if saved and saved.status == "complete":
                return ReadingView(
                    reading_style=style,
                    status="complete",
                    question=saved.question,
                    reading=Reading.model_validate(saved.payload),
                )
            if saved and saved.status == "generating" and saved.lease_until > time.time():
                return ReadingView(
                    reading_style=style,
                    status="generating",
                    question=saved.question,
                    message="Writing your reading…",
                    astrology_chart=self._saved_astrology_chart(saved),
                    progress=self._saved_reading_progress(saved),
                )
            if not data:
                available = reading_available()
                failure = self._saved_reading_failure(saved) if available else None
                return ReadingView(
                    reading_style=style,
                    status="failed" if failure else "ready" if available else "unavailable",
                    message=failure.message if failure else "" if available else "Readings are unavailable.",
                    failure=failure,
                    question=saved.question if saved else "",
                    astrology_chart=self._saved_astrology_chart(saved),
                )
            if not reading_available():
                raise HTTPException(
                    503, "Readings are unavailable."
                )
            match_id = match.id
            # The saved draw: each drawn card's id and the orientation it landed in.
            orientations = drawn_orientations(match.state)
            cards = list(orientations)
            question = data.question.strip()
            self._check_reading_retry(saved, question)
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
        rate_failure = None
        with self.session.begin():
            room = self._room(room_id, actor, lock=True)
            if room.match_id != match_id:
                raise HTTPException(409, "This spread has changed. Open your current spread.")
            saved = self.repo.reading(match_id)
            style = saved_style(match.state, submitted=saved is not None)
            if saved and saved.status == "complete":
                return ReadingView(status="complete", question=saved.question, reading_style=style,
                                   reading=Reading.model_validate(saved.payload))
            if saved and saved.status == "generating" and saved.lease_until > time.time():
                return ReadingView(status="generating", question=saved.question, reading_style=style,
                                   message="Writing your reading…",
                                   astrology_chart=self._saved_astrology_chart(saved),
                                   progress=self._saved_reading_progress(saved))
            self._check_reading_retry(saved, question)
            # The private match outlives its room and keeps completed reading JSON backwards compatible.
            reading_style = data.reading_style if "reading_style" in data.model_fields_set else style
            if match.state.get("reading_style") != reading_style:
                match.state = {**match.state, "reading_style": reading_style}
            attempt = str(uuid4())
            if saved is None:
                saved = TarotReading(match_id=match_id)
                self.repo.add(saved)
            saved.status, saved.question = "generating", question
            saved.attempt_id, saved.lease_until = attempt, time.time() + 180
            saved.prompt_version = PROMPT_VERSION
            saved.payload = {"astrology_draft": astrology_chart.model_dump(mode="json")} if astrology_chart else None
            mode = ("both" if astrology_chart and len(astrology_chart.charts) == 2 else
                    astrology_chart.charts[0].system if astrology_chart else "ordinary")
            saved.payload = {
                **(saved.payload or {}),
                "_progress": ProgressState.begin(time.time(), mode).model_dump(mode="json"),
            }
            count = self.repo.rate(actor.id + ":tarot-reading", 3600)
            if count > 10:
                rate_failure = ReadingFailure(
                    code="rate_limited", message="Reading limit reached.",
                    retryable=True, retry_at=(int(time.time()) // 3600 + 1) * 3600,
                )
                saved.status = "failed"
                saved.payload = {**(saved.payload or {}), "failure": rate_failure.model_dump(mode="json")}

        if rate_failure:
            raise HTTPException(429, rate_failure.message)

        # The provider call deliberately runs without a database transaction or row lock.
        def reserve_attempt() -> None:
            with self.session.begin():
                count = self.repo.rate("tarot-provider-daily-budget", 86400)
            if count > settings().tarot_daily_limit:
                raise ReadingLimitError("The daily reading budget is exhausted.")

        last_progress = ProgressEvent("preparing")

        def report_progress(event: ProgressEvent) -> None:
            nonlocal last_progress
            last_progress = event
            self._update_reading_progress(room_id, match_id, attempt, event)

        try:
            result = generate_reading(
                cards, question, before_attempt=reserve_attempt, astrology_chart=astrology_chart,
                on_progress=report_progress, reading_style=reading_style,
                orientations=orientations,
            )
            report_progress(ProgressEvent(
                "saving", last_progress.provider, last_progress.attempt, last_progress.max_attempts,
            ))
        except Exception as error:
            failure = reading_failure(error)
            get_ai_logger().warning(
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
                    saved.payload = {**(saved.payload or {}), "failure": failure.model_dump(mode="json")}
            status = (429 if failure.code in {"rate_limited", "daily_limit"}
                      else 503 if failure.code == "unavailable" else 502)
            raise HTTPException(status, failure.message) from None
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
            return ReadingView(status="complete", question=question, reading_style=reading_style, reading=result)

    def _update_reading_progress(
        self, room_id: str, match_id: str, attempt_id: str, event: ProgressEvent,
    ) -> None:
        # Each milestone is a short committed transaction. Network calls hold no
        # locks; a stale generation cannot rewrite a newer lease or rematch.
        self.session.expire_all()
        with self.session.begin():
            room = self.repo.room(room_id, lock=True)
            saved = self.repo.reading(match_id)
            now = time.time()
            if (room is None or room.match_id != match_id or saved is None
                    or saved.status != "generating" or saved.attempt_id != attempt_id
                    or saved.lease_until <= now):
                return
            current = ProgressState.model_validate((saved.payload or {})["_progress"])
            saved.payload = {
                **(saved.payload or {}),
                "_progress": current.advance(event, now).model_dump(mode="json"),
            }

    @staticmethod
    def _saved_reading_progress(saved: TarotReading) -> ReadingProgress:
        value = (saved.payload or {}).get("_progress")
        if value:
            try:
                return ProgressState.model_validate(value).view(time.time())
            except ValidationError:
                pass
        # An older running lease remains readable across this additive release.
        state = ProgressState.begin(max(0, saved.lease_until - 180))
        state.stage = "writing"
        return state.view(time.time())

    @staticmethod
    def _check_reading_retry(saved: TarotReading | None, question: str) -> None:
        failure = RoomService._saved_reading_failure(saved)
        if failure and failure.retry_at and failure.retry_at > time.time():
            raise HTTPException(429 if failure.retryable else 503, failure.message)
        if failure and failure.code == "blocked" and saved and question == saved.question:
            raise HTTPException(422, failure.message)

    @staticmethod
    def _saved_reading_failure(saved: TarotReading | None) -> ReadingFailure | None:
        if saved is None or saved.status != "failed":
            return None
        if isinstance(saved.payload, dict) and saved.payload.get("failure"):
            failure = ReadingFailure.model_validate(saved.payload["failure"])
            # Configuration can recover without rewriting a user's saved spread.
            if failure.code == "unavailable" and failure.retry_at and failure.retry_at <= time.time():
                return None
            return failure
        return ReadingFailure(code="temporary", message="Couldn't complete the reading.", retryable=True)

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
                    self._fresh_code(),
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
                # Removing someone also withdraws any invitation still waiting for them.
                self.repo.delete_invite(room_id, target)
            elif action == "leave":
                self._member(room_id, actor.id).active = False
                humans = [m for m, _ in members if not m.is_bot and m.user_id != actor.id]
                if not humans:
                    match = self.repo.match(room.match_id)
                    if match and room.status == "playing":
                        match.result = {"abandoned": True, "winners": [], "scores": {}}
                    self._close(room)
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

    @staticmethod
    def _own_profile(profile: Profile) -> OwnProfileView:
        return OwnProfileView(
            id=profile.id, name=profile.name, avatar=profile.avatar, username=profile.username,
            frame=worn_frame(profile.cosmetics), card_back=worn_card_back(profile.cosmetics),
        )

    def profile(self, actor: Identity, data: ProfileInput) -> OwnProfileView:
        self._rate(actor, "profile", 20)
        with self.session.begin():
            return self._own_profile(self.repo.save_profile(actor.id, data.name, data.avatar))

    def set_username(self, actor: Identity, username: str | None) -> OwnProfileView:
        self._rate(actor, "username", 20)
        if username is not None and (username in RESERVED_USERNAMES or username.startswith("bot")):
            raise HTTPException(422, "That username is reserved. Choose another.")
        try:
            with self.session.begin():
                profile = self.repo.profile(actor.id)
                if profile is None:
                    raise HTTPException(409, "Choose a display name before picking a username.")
                if profile.username == username:
                    return self._own_profile(profile)
                if username is not None and self.repo.profile_by_username(username) is not None:
                    raise HTTPException(409, "That username is taken.")
                # Rooms that have invited this player show the invitation by username.
                for room_id in self.repo.invited_rooms(actor.id):
                    room = self.repo.room(room_id, lock=True)
                    if room is None:
                        continue
                    if username is None:
                        # Nobody could see or cancel an invitation to a player with
                        # no username, so the ones still waiting are withdrawn.
                        self.repo.delete_invite(room_id, actor.id)
                    room.revision += 1
                profile.username = username
                self.repo.flush()
                return self._own_profile(profile)
        except IntegrityError:
            # Two people asked for the same free name at once; the first one has it.
            raise HTTPException(409, "That username is taken.") from None

    def search_players(self, actor: Identity, query: str) -> PlayerSearch:
        self._rate(actor, "player-search", 30)
        prefix = query.strip().removeprefix("@").lower()
        if not 2 <= len(prefix) <= 20 or any(
            c not in "abcdefghijklmnopqrstuvwxyz0123456789_" for c in prefix
        ):
            return PlayerSearch()
        with self.session.begin():
            return PlayerSearch(players=[
                PlayerHit(username=p.username, name=p.name, avatar=p.avatar)
                for p in self.repo.search_players(prefix, actor.id)
                if p.username
            ])

    def invite_player(self, actor: Identity, room_id: str, username: str) -> RoomView:
        self._rate(actor, "invite-player", 20, 3600)
        with self.session.begin():
            room = self._room(room_id, actor, lock=True)
            if room.status == "closed":
                raise HTTPException(409, "This room has closed.")
            if refusal := self._solo_refusal(room):
                raise HTTPException(409, refusal)
            target = self.repo.profile_by_username(username)
            if target is None:
                raise HTTPException(404, "No player has that username.")
            if target.id == actor.id:
                raise HTTPException(409, "You are already in this room.")
            member = self.repo.member(room_id, target.id)
            if member and member.active:
                raise HTTPException(409, "That player is already in this room.")
            if self.repo.room_invite(room_id, target.id) is None:
                if len(self.repo.room_invites(room_id)) >= MAX_PENDING_INVITES:
                    raise HTTPException(
                        409, "This room already has 20 invitations waiting. Cancel one first."
                    )
                self.repo.add(RoomInvite(room_id=room_id, user_id=target.id, invited_by=actor.id))
                room.revision += 1
                self.repo.flush()
            return room_view(self.repo, room, actor.id, self.cipher)

    def cancel_invite(self, actor: Identity, room_id: str, username: str) -> RoomView:
        self._rate(actor, "manage", 30)
        try:
            username = clean_username(username)
        except ValueError:
            raise HTTPException(404, "That invitation is no longer waiting.") from None
        with self.session.begin():
            room = self._room(room_id, actor, lock=True)
            target = self.repo.profile_by_username(username)
            pending = self.repo.room_invite(room_id, target.id) if target else None
            if pending is None:
                raise HTTPException(404, "That invitation is no longer waiting.")
            if actor.id not in (room.owner_id, pending.invited_by):
                raise HTTPException(
                    403, "Only the host or the player who sent this invitation can cancel it."
                )
            self.repo.delete_invite(room_id, pending.user_id)
            room.revision += 1
            self.repo.flush()
            return room_view(self.repo, room, actor.id, self.cipher)

    def accept_invitation(self, actor: Identity, room_id: str) -> RoomView:
        self._rate(actor, "join", 30)
        with self.session.begin():
            room = self.repo.room(room_id, lock=True)
            if (
                room is None
                or room.status == "closed"
                or self.repo.room_invite(room_id, actor.id) is None
            ):
                raise HTTPException(404, "This invitation is no longer available.")
            # The same door as a code: same seats, bot replacement and full-room rules.
            self._enter(room, actor)
            return room_view(self.repo, room, actor.id, self.cipher)

    def decline_invitation(self, actor: Identity, room_id: str) -> MeView:
        self._rate(actor, "manage", 30)
        with self.session.begin():
            room = self.repo.room(room_id, lock=True)
            if room and self.repo.delete_invite(room_id, actor.id):
                room.revision += 1
            self.repo.flush()
            return self._me(actor)

    # Secret Santa's private links. A token is derived from the saved draw, never
    # stored, and neither a token, a name nor a pairing is ever written to a log.
    def santa_links(self, actor: Identity, room_id: str) -> SantaLinks:
        """Every person's link, for the organiser of the room's current draw only."""
        self._rate(actor, "santa-links")
        with self.session.begin():
            room = self._room(room_id, actor)
            match = self.repo.match(room.match_id)
            if match is None or match.game_id != "secret-santa":
                raise HTTPException(409, "Start a Secret Santa table and draw the names first.")
            if match.participants != [actor.id]:
                raise HTTPException(404, "This room is unavailable to your player session.")
            if not SecretSantaEngine.is_drawn(match.state):
                raise HTTPException(409, "Draw the names first. The links appear after the draw.")
            secret, number = settings().app_secret, match.state["draw_number"]
            return SantaLinks(links=[
                SantaLink(id=person["id"], name=person["name"],
                          token=link_token(secret, match.id, number, person["id"]))
                for person in match.state["people"]
            ])

    def santa_reveal(self, actor: Identity, token: str) -> SantaReveal:
        """One person's own draw, for whoever holds that person's current link.

        The link is the permission: any signed-in session may use it, the organiser
        need not be present and the room may have closed. A token that is malformed,
        forged, from an earlier draw or for nobody gets one answer and one count.
        """
        self._rate(actor, "santa-reveal", 30)
        self._check_wrong_invites(actor, SANTA_MISSES, SANTA_SLOW_DOWN)
        named = read_token(token)
        if named is not None:
            with self.session.begin():
                reveal = self._open_santa_link(*named, token)
            if reveal is not None:
                return reveal
        raise self._wrong_invite(actor, SANTA_NO_LINK, SANTA_MISSES, SANTA_SLOW_DOWN)

    def _open_santa_link(self, match_id: str, person_id: str, token: str) -> SantaReveal | None:
        match = self.repo.match(match_id)
        if match is None or match.game_id != "secret-santa":
            return None
        # Every move holds this row lock, so the draw cannot change between checking
        # the link and recording that it was opened.
        room = self.repo.room(match.room_id, lock=True)
        self.session.refresh(match)
        draw = SecretSantaEngine.private_draw(match.state, person_id)
        if draw is None or not opens(token, link_token(
            settings().app_secret, match.id, match.state["draw_number"], person_id
        )):
            return None
        opened = SecretSantaEngine.mark_opened(match.state, person_id)
        if opened is not None:
            # The organiser's table shows who has looked. That is all it learns: no
            # receipt or activity entry is written, so nothing else records the visit.
            match.state = opened
            # The match version is the organiser's move counter and stays as it is, so
            # a move they are in the middle of is not refused because someone looked.
            # The room revision alone tells their open table to refresh.
            if room is not None and room.status != "closed" and room.match_id == match.id:
                room.revision += 1
            self.repo.flush()
        return SantaReveal.model_validate(draw)

    # Player progress and earned rewards. Nothing here takes a number from the
    # client: XP, level, streak and badges are recomputed from saved results, and a
    # reward is redeemed or worn only when that computation says it is earned.
    def _progress(
        self, actor: Identity, tz_offset: int, cosmetics: Cosmetics,
        facts: list[MatchFact] | None = None,
    ) -> ProgressView:
        if facts is None:
            facts = self._match_facts(actor)
        return build_progress(actor.id, facts, time.time(), tz_offset, cosmetics)

    def _match_facts(self, actor: Identity) -> list[MatchFact]:
        return [
            MatchFact(
                game_id=game_id,
                created_at=created_at,
                winners=tuple(w for w in result.get("winners") or [] if isinstance(w, str)),
                participants=tuple(p for p in participants if isinstance(p, str)),
                abandoned=bool(result.get("abandoned")),
            )
            for game_id, created_at, result, participants in self.repo.played(actor.id)
        ]

    def progress(self, actor: Identity, tz_offset: int = 0) -> ProgressView:
        """The caller's own progress. A player who has not played yet is at level 1."""
        self._rate(actor, "progress")
        with self.session.begin():
            profile = self.repo.profile(actor.id)
            return self._progress(
                actor, tz_offset, read_cosmetics(profile.cosmetics if profile else None)
            )

    def redeem_reward(self, actor: Identity, reward_id: str, tz_offset: int = 0) -> ProgressView:
        self._rate(actor, "rewards", 30)
        if reward_id not in REWARD_BY_ID:
            raise HTTPException(404, "There is no reward with that name.")
        with self.session.begin():
            profile = self.repo.lock_profile(actor.id)
            cosmetics = read_cosmetics(profile.cosmetics if profile else None)
            facts = self._match_facts(actor)
            view = self._progress(actor, tz_offset, cosmetics, facts)
            reward = next(r for r in view.rewards if r.id == reward_id)
            if reward.state == "locked" or profile is None:
                raise HTTPException(
                    409, f"{reward.name} is not earned yet. {reward.requirement} first."
                )
            if reward.state == "redeemed":
                return view
            cosmetics = Cosmetics(
                cosmetics.claimed | {reward_id}, cosmetics.frame, cosmetics.card_back
            )
            profile.cosmetics = stored_cosmetics(cosmetics)
            self.repo.flush()
            return self._progress(actor, tz_offset, cosmetics, facts)

    def wear(self, actor: Identity, data: CosmeticsInput, tz_offset: int = 0) -> ProgressView:
        self._rate(actor, "cosmetics", 30)
        for chosen, kind, wording in (
            (data.frame, "frame", "a frame"), (data.card_back, "card_back", "a card back"),
        ):
            if chosen is not None and (
                chosen not in REWARD_BY_ID or REWARD_BY_ID[chosen].kind != kind
            ):
                raise HTTPException(422, f"Choose {wording} from your rewards.")
        with self.session.begin():
            profile = self.repo.profile(actor.id)
            # Rooms are locked before the profile, the order a join uses, and only
            # when the frame everyone sees is about to change.
            rooms = (
                self.repo.lock_open_rooms(actor.id)
                if profile is not None and worn_frame(profile.cosmetics) != data.frame else []
            )
            profile = self.repo.lock_profile(actor.id)
            cosmetics = read_cosmetics(profile.cosmetics if profile else None)
            facts = self._match_facts(actor)
            view = self._progress(actor, tz_offset, cosmetics, facts)
            states = {reward.id: reward for reward in view.rewards}
            for chosen in (data.frame, data.card_back):
                if chosen is not None and states[chosen].state != "redeemed":
                    raise HTTPException(
                        409,
                        f"Redeem {states[chosen].name} before wearing it."
                        if states[chosen].state == "available"
                        else f"{states[chosen].name} is not earned yet. "
                             f"{states[chosen].requirement} first.",
                    )
            if profile is None:
                # Nothing to take off: a player with no profile wears nothing.
                return view
            changed = cosmetics.frame != data.frame
            cosmetics = Cosmetics(cosmetics.claimed, data.frame, data.card_back)
            profile.cosmetics = stored_cosmetics(cosmetics)
            if changed:
                # Tables showing this player's seat pick up the new frame.
                for room in rooms:
                    room.revision += 1
            self.repo.flush()
            return self._progress(actor, tz_offset, cosmetics, facts)

    def me(self, actor: Identity) -> MeView:
        with self.session.begin():
            return self._me(actor)

    def _me(self, actor: Identity) -> MeView:
        profile = self.repo.profile(actor.id)
        return MeView(
            profile=self._own_profile(profile) if profile else None,
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
                    score=saved_player_score(m, actor.id),
                    created_at=m.created_at,
                )
                for m in self.repo.history(actor.id)
                if m.result is not None
                and actor.id in m.participants
                and not m.result.get("abandoned")
            ],
            # Enough to recognise and answer an invitation; never the room's code or token.
            invitations=[
                InvitationView(
                    room_id=room.id,
                    room_name=room.name,
                    game_id=room.game_id,
                    from_name=sender.name,
                    from_avatar=sender.avatar,
                    players=seated,
                    capacity=room.capacity,
                    created_at=invite.created_at,
                )
                for invite, room, sender, seated in self.repo.invitations(actor.id)
            ],
        )
