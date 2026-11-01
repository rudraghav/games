from __future__ import annotations

import time
from typing import Any

from sqlalchemy import JSON, Boolean, Float, ForeignKey, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    __abstract__ = True
    __table_args__ = {"schema": "games"}


class Profile(Base):
    __tablename__ = "profiles"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(30))
    avatar: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[float] = mapped_column(Float, default=time.time)


class Room(Base):
    __tablename__ = "rooms"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    code: Mapped[str] = mapped_column(String(8), unique=True)
    name: Mapped[str] = mapped_column(String(60))
    owner_id: Mapped[str] = mapped_column(ForeignKey("games.profiles.id"))
    game_id: Mapped[str] = mapped_column(String(32))
    settings: Mapped[dict[str, bool]] = mapped_column(JSON, default=dict)
    capacity: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(16), default="lobby")
    revision: Mapped[int] = mapped_column(Integer, default=1)
    round_number: Mapped[int] = mapped_column(Integer, default=0)
    match_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    invite_hash: Mapped[str] = mapped_column(String(64), unique=True)
    invite_ciphertext: Mapped[str] = mapped_column(String(256))
    created_at: Mapped[float] = mapped_column(Float, default=time.time)


class Member(Base):
    __tablename__ = "room_members"
    room_id: Mapped[str] = mapped_column(
        ForeignKey("games.rooms.id", ondelete="CASCADE"), primary_key=True
    )
    user_id: Mapped[str] = mapped_column(ForeignKey("games.profiles.id"), primary_key=True)
    ready: Mapped[bool] = mapped_column(Boolean, default=False)
    seated: Mapped[bool] = mapped_column(Boolean, default=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    joined_at: Mapped[float] = mapped_column(Float, default=time.time)
    seen_at: Mapped[float] = mapped_column(Float, default=time.time)


class Match(Base):
    __tablename__ = "matches"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    room_id: Mapped[str] = mapped_column(
        ForeignKey("games.rooms.id", ondelete="CASCADE"), index=True
    )
    game_id: Mapped[str] = mapped_column(String(32))
    rules_version: Mapped[str] = mapped_column(String(16))
    version: Mapped[int] = mapped_column(Integer, default=1)
    state: Mapped[dict[str, Any]] = mapped_column(JSON)
    participants: Mapped[list[str]] = mapped_column(JSON)
    result: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[float] = mapped_column(Float, default=time.time)


class Receipt(Base):
    __tablename__ = "action_receipts"
    match_id: Mapped[str] = mapped_column(
        ForeignKey("games.matches.id", ondelete="CASCADE"), primary_key=True
    )
    action_id: Mapped[str] = mapped_column(String(36), primary_key=True)
    actor_id: Mapped[str] = mapped_column(String(36))
    fingerprint: Mapped[str] = mapped_column(String(64))
    response: Mapped[dict[str, Any]] = mapped_column(JSON)


class Message(Base):
    __tablename__ = "messages"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    room_id: Mapped[str] = mapped_column(
        ForeignKey("games.rooms.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[str] = mapped_column(ForeignKey("games.profiles.id"))
    body: Mapped[str] = mapped_column(String(300))
    kind: Mapped[str] = mapped_column(String(16), default="message")
    created_at: Mapped[float] = mapped_column(Float, default=time.time)


class RateBucket(Base):
    __tablename__ = "rate_buckets"
    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    window: Mapped[int] = mapped_column(Integer, primary_key=True)
    count: Mapped[int] = mapped_column(Integer, default=1)


class TarotReading(Base):
    __tablename__ = "tarot_readings"
    match_id: Mapped[str] = mapped_column(ForeignKey("games.matches.id"), primary_key=True)
    status: Mapped[str] = mapped_column(String(16), default="generating")
    question: Mapped[str] = mapped_column(String(400))
    attempt_id: Mapped[str] = mapped_column(String(36))
    lease_until: Mapped[float] = mapped_column(Float)
    payload: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    prompt_version: Mapped[str] = mapped_column(String(32))
