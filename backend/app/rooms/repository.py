from __future__ import annotations

import hashlib
import time

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.models import Match, Member, Message, Profile, RateBucket, Receipt, Room, TarotReading


class Repository:
    def __init__(self, session: Session):
        self.session = session

    def profile(self, user_id: str) -> Profile | None:
        return self.session.get(Profile, user_id)

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

    def invite(self, value: str) -> Room | None:
        stmt = (
            select(Room).where(Room.code == value.upper())
            if len(value) == 8
            else select(Room).where(Room.invite_hash == hashlib.sha256(value.encode()).hexdigest())
        )
        return self.session.scalar(stmt.with_for_update())

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
        # The membership join narrows candidates; participant validation is performed by the service.
        return list(
            self.session.scalars(
                select(Match)
                .join(Member, Member.room_id == Match.room_id)
                .where(Member.user_id == user_id, Match.result.is_not(None))
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

    def add(self, value: object) -> None:
        self.session.add(value)

    def flush(self) -> None:
        self.session.flush()
