from __future__ import annotations

import hashlib
import time

from sqlalchemy import and_, delete, func, or_, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session, aliased

from app.models import (
    Match,
    Member,
    Message,
    Profile,
    RateBucket,
    Receipt,
    Room,
    RoomInvite,
    TarotReading,
)

CHANCE_GAME_IDS = ("roulette", "slots")


class Repository:
    def __init__(self, session: Session):
        self.session = session

    def profile(self, user_id: str) -> Profile | None:
        return self.session.get(Profile, user_id)

    def lock_quick_play(self, room_id: str) -> None:
        """Serialize one launch intent, even before its room exists."""
        key = int.from_bytes(hashlib.sha256(room_id.encode()).digest()[:8], signed=True)
        self.session.execute(select(func.pg_advisory_xact_lock(key)))

    def ensure_player(self, user_id: str, default_name: str) -> Profile:
        """Create a first-time player without overwriting a saved profile."""
        self.session.execute(insert(Profile).values(
            id=user_id, name=default_name, avatar=0,
        ).on_conflict_do_nothing(index_elements=[Profile.id]))
        return self.session.scalars(
            select(Profile).where(Profile.id == user_id)
            .execution_options(populate_existing=True)
        ).one()

    def public_action(self, match_id: str, version: int) -> dict | None:
        # The existing match-prefix primary index bounds this lookup to one match.
        response = self.session.scalar(select(Receipt.response).where(
            Receipt.match_id == match_id,
            Receipt.response["committedVersion"].as_integer() == version,
        ).limit(1))
        return response.get("public_action") if isinstance(response, dict) else None

    def public_activity(self, match_id: str) -> list[dict]:
        from app.rooms.public_history import HISTORY_LIMIT

        responses = self.session.scalars(
            select(Receipt.response)
            .where(Receipt.match_id == match_id,
                   Receipt.response["public_move"].is_not(None))
            .order_by(Receipt.response["committedVersion"].as_integer().desc())
            .limit(HISTORY_LIMIT)
        ).all()
        return [response["public_move"] for response in reversed(responses)
                if isinstance(response, dict) and isinstance(response.get("public_move"), dict)]

    def save_profile(self, user_id: str, name: str, avatar: int) -> Profile:
        profile = self.profile(user_id)
        if profile is None:
            profile = Profile(id=user_id, name=name, avatar=avatar)
            self.session.add(profile)
        else:
            profile.name, profile.avatar = name, avatar
        self.session.flush()
        return profile

    def room(self, room_id: str, lock: bool = False) -> Room | None:
        stmt = select(Room).where(Room.id == room_id)
        return self.session.scalar(stmt.with_for_update() if lock else stmt)

    def invite(self, value: str, lock: bool = True) -> Room | None:
        """Find a room by its 6-digit code, an older 8-character code, or its invite token."""
        value = value.strip()
        # People read a code aloud or type it in two halves: "482 913", "482-913".
        digits = value.replace(" ", "").replace("-", "")
        if len(digits) == 6 and digits.isascii() and digits.isdigit():
            stmt = select(Room).where(Room.code == digits)
        elif len(value) == 8:
            stmt = select(Room).where(Room.code == value.upper())
        else:
            stmt = select(Room).where(
                Room.invite_hash == hashlib.sha256(value.encode()).hexdigest()
            )
        return self.session.scalar(stmt.with_for_update() if lock else stmt)

    def claim_code(self, code: str) -> bool:
        """Whether this room code is free, holding it until the transaction ends.

        Two rooms being created at once cannot both take one code. The claim never
        waits: a code another transaction is claiming right now counts as taken, so
        the caller simply draws another and no two claims can block each other.
        """
        digest = hashlib.sha256(("room-code:" + code).encode()).digest()
        key = int.from_bytes(digest[:8], signed=True)
        if not self.session.scalar(select(func.pg_try_advisory_xact_lock(key))):
            return False
        return self.session.scalar(select(Room.id).where(Room.code == code).limit(1)) is None

    def profile_by_username(self, username: str) -> Profile | None:
        return self.session.scalar(select(Profile).where(Profile.username == username))

    def search_players(self, prefix: str, exclude: str, limit: int = 8) -> list[Profile]:
        return list(
            self.session.scalars(
                select(Profile)
                .where(
                    Profile.username.is_not(None),
                    # "_" is a legal username character and a LIKE wildcard.
                    Profile.username.startswith(prefix, autoescape=True),
                    Profile.id != exclude,
                    Profile.id.not_like("bot:%"),
                )
                .order_by(Profile.username != prefix, Profile.username)
                .limit(limit)
            ).all()
        )

    def room_invite(self, room_id: str, user_id: str) -> RoomInvite | None:
        return self.session.get(RoomInvite, (room_id, user_id))

    def room_invites(self, room_id: str) -> list[tuple[RoomInvite, Profile]]:
        return [
            (invite, profile)
            for invite, profile in self.session.execute(
                select(RoomInvite, Profile)
                .join(Profile, Profile.id == RoomInvite.user_id)
                .where(RoomInvite.room_id == room_id)
                .order_by(RoomInvite.created_at, RoomInvite.user_id)
            )
        ]

    def delete_invite(self, room_id: str, user_id: str) -> bool:
        invite = self.room_invite(room_id, user_id)
        if invite is None:
            return False
        self.session.delete(invite)
        self.session.flush()
        return True

    def delete_room_invites(self, room_id: str) -> None:
        self.session.execute(delete(RoomInvite).where(RoomInvite.room_id == room_id))

    def invited_rooms(self, user_id: str) -> list[str]:
        """Rooms holding a pending invitation for this player, in a stable lock order."""
        return list(
            self.session.scalars(
                select(RoomInvite.room_id)
                .where(RoomInvite.user_id == user_id)
                .order_by(RoomInvite.room_id)
            ).all()
        )

    def invitations(
        self, user_id: str, limit: int = 20
    ) -> list[tuple[RoomInvite, Room, Profile, int]]:
        """A player's pending invitations to rooms that are still open, newest first."""
        inviter = aliased(Profile)
        seated = (
            select(func.count())
            .where(
                Member.room_id == Room.id, Member.active.is_(True), Member.seated.is_(True)
            )
            .correlate(Room)
            .scalar_subquery()
        )
        return [
            (invite, room, sender, int(count))
            for invite, room, sender, count in self.session.execute(
                select(RoomInvite, Room, inviter, seated)
                .join(Room, Room.id == RoomInvite.room_id)
                .join(inviter, inviter.id == RoomInvite.invited_by)
                .where(RoomInvite.user_id == user_id, Room.status != "closed")
                .order_by(RoomInvite.created_at.desc(), RoomInvite.room_id)
                .limit(limit)
            )
        ]

    def members(self, room_id: str) -> list[tuple[Member, Profile]]:
        return list(
            self.session.execute(
                select(Member, Profile)
                .join(Profile, Profile.id == Member.user_id)
                .where(Member.room_id == room_id, Member.active.is_(True))
                .order_by(Member.joined_at)
            ).tuples()
        )

    def member(self, room_id: str, user_id: str) -> Member | None:
        return self.session.get(Member, (room_id, user_id))

    def match(self, match_id: str | None) -> Match | None:
        return self.session.get(Match, match_id) if match_id else None

    def receipt(self, match_id: str, action_id: str) -> Receipt | None:
        return self.session.get(Receipt, (match_id, action_id))

    def reading(self, match_id: str) -> TarotReading | None:
        return self.session.get(TarotReading, match_id)

    def messages(self, room_id: str) -> list[Message]:
        return list(
            reversed(
                self.session.scalars(
                    select(Message)
                    .where(Message.room_id == room_id)
                    .order_by(Message.created_at.desc())
                    .limit(100)
                ).all()
            )
        )

    def recent_rooms(self, user_id: str) -> list[tuple[Room, int]]:
        counts = (
            select(Member.room_id, func.count().label("n"))
            .where(Member.active.is_(True))
            .group_by(Member.room_id)
            .subquery()
        )
        return list(
            self.session.execute(
                select(Room, counts.c.n)
                .join(Member, Member.room_id == Room.id)
                .join(counts, counts.c.room_id == Room.id)
                .where(Member.user_id == user_id, Member.active.is_(True))
                .order_by(Room.created_at.desc())
                .limit(12)
            ).tuples()
        )

    def history(self, user_id: str) -> list[Match]:
        # A saved solo match can outlive its room membership.
        return list(
            self.session.scalars(
                select(Match)
                .outerjoin(Member, and_(Member.room_id == Match.room_id, Member.user_id == user_id))
                .where(
                    or_(
                        Member.user_id == user_id,
                        and_(
                            Match.participants[0].as_string() == user_id,
                            or_(
                                Match.game_id == "tarot",
                                and_(Match.game_id.in_(CHANCE_GAME_IDS),
                                     func.json_array_length(Match.participants) == 1,
                                     Match.state["phase"].as_string() == "finished"),
                            ),
                        ),
                    ),
                    Match.result.is_not(None),
                )
                .order_by(Match.created_at.desc())
                .limit(100)
            ).all()
        )

    def rate(self, key: str, seconds: int) -> int:
        window = int(time.time()) // seconds
        key = hashlib.sha256(key.encode()).hexdigest()
        stmt = insert(RateBucket).values(key=key, window=window, count=1)
        returning = stmt.on_conflict_do_update(
            index_elements=[RateBucket.key, RateBucket.window], set_={"count": RateBucket.count + 1}
        ).returning(RateBucket.count)
        return self.session.execute(returning).scalar_one()

    def rate_count(self, key: str, seconds: int) -> int:
        """The current window's count, without spending any of it."""
        window = int(time.time()) // seconds
        key = hashlib.sha256(key.encode()).hexdigest()
        return self.session.scalar(
            select(RateBucket.count).where(RateBucket.key == key, RateBucket.window == window)
        ) or 0

    def add(self, value: object) -> None:
        self.session.add(value)

    def flush(self) -> None:
        self.session.flush()
