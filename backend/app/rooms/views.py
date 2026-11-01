import time

from cryptography.fernet import Fernet

from app.games.registry import ENGINES
from app.models import Room
from app.rooms.bots import next_bot_view
from app.rooms.public_actions import PUBLIC_ACTIONS
from app.rooms.repository import Repository
from app.rooms.schemas import MemberView, MessageView, PublicActionView, RoomView


def room_view(repo: Repository, room: Room, user_id: str, cipher: Fernet) -> RoomView:
    members = repo.members(room.id)
    match = repo.match(room.match_id)
    now = time.time()
    missing = (
        [
            p
            for p in match.participants
            if not any(m.user_id == p and (m.is_bot or now - m.seen_at < 45) for m, _ in members)
        ]
        if match and room.status == "playing"
        else []
    )
    game = (
        ENGINES[match.game_id].project_view(match.state, user_id)
        if match and user_id in match.participants
        else None
    )
    bots = [
        m for m, _ in members if m.is_bot and m.seated and match and m.user_id in match.participants
    ]
    pending_bot = bool(
        match
        and room.status == "playing"
        and not missing
        and next_bot_view(ENGINES[match.game_id], match.state, bots)
    )
    cue = (
        repo.public_action(match.id, match.version)
        if match and match.game_id in PUBLIC_ACTIONS and match.version > 1 else None
    )
    return RoomView(
        id=room.id,
        name=room.name,
        code=room.code,
        game_id=room.game_id,
        owner_id=room.owner_id,
        capacity=room.capacity,
        settings=room.settings,
        status=room.status,
        revision=room.revision,
        match_id=room.match_id,
        match_version=match.version if match else None,
        members=[
            MemberView(
                id=p.id,
                name=p.name,
                avatar=p.avatar,
                ready=m.ready,
                seated=m.seated,
                connected=m.is_bot or now - m.seen_at < 45,
                last_seen=m.seen_at,
                is_bot=m.is_bot,
            )
            for m, p in members
        ],
        messages=[
            MessageView(
                id=m.id, user_id=m.user_id, body=m.body, kind=m.kind, created_at=m.created_at
            )
            for m in repo.messages(room.id)
        ],
        game=game,
        paused=bool(missing),
        missing_players=missing,
        invite_token=cipher.decrypt(room.invite_ciphertext.encode()).decode()
        if room.owner_id == user_id
        else None,
        bot_pending=pending_bot,
        bot_due_at=match.bot_due_at if match and pending_bot else None,
        last_action=PublicActionView.model_validate(cue) if cue else None,
    )
