"""Store constructed output only in one newly created local browser QA spread.

No provider call, public fixture endpoint, historical overwrite or hosted database access.
The caller sends its exact fresh room/match/actor and synthetic payload over stdin.
"""
import json
import os
import sys
import time
from pathlib import Path
from uuid import uuid4

from sqlalchemy.engine import make_url

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "backend"))
from app.db import sessions
from app.games.tarot.engine import TarotEngine
from app.games.tarot.reading import Reading
from app.models import Match, Member, Room, TarotReading
from app.settings import settings

config = settings()
if (config.app_env != "development" or not config.dev_auth_enabled
        or os.environ.get("GAMES_TEST_URL") or os.environ.get("VERCEL")
        or make_url(config.database_url).host not in {"127.0.0.1", "localhost"}):
    raise SystemExit("Archive fixtures require the dedicated local development database.")
fixture = json.load(sys.stdin)
reading = Reading.model_validate(fixture["reading"])
with sessions()() as session, session.begin():
    room = session.get(Room, fixture["room_id"], with_for_update=True)
    match = session.get(Match, fixture["match_id"], with_for_update=True)
    member = session.get(Member, (fixture["room_id"], fixture["actor_id"]))
    assert room and match and member and member.active and not member.is_bot
    assert room.owner_id == fixture["actor_id"] and room.name == fixture["room_name"]
    assert room.name.startswith("Archive QA ") and len(room.name) == 47
    assert 0 <= time.time() - room.created_at < 1800
    assert room.game_id == match.game_id == "tarot" and room.status == "playing"
    assert room.match_id == match.id and match.room_id == room.id
    assert match.participants == [fixture["actor_id"]] and match.result is None
    assert match.state["phase"] == "reading" and len(match.state["picks"]) == 3
    assert session.get(TarotReading, match.id) is None
    cards = TarotEngine().project_view(match.state, fixture["actor_id"]).community
    assert [card.card_id for card in reading.cards] == [card.id for card in cards]
    assert fixture["question"].startswith("Synthetic archive question ")
    session.add(TarotReading(
        match_id=match.id, status="complete", question=fixture["question"],
        attempt_id=str(uuid4()), lease_until=0,
        payload=reading.model_dump(mode="json"), prompt_version="archive-browser-fixture",
    ))
    match.state = {**match.state, "phase": "finished"}
    match.result = {"winners": [], "scores": {fixture["actor_id"]: 0}}
    match.version += 1
    room.status = "finished"
    room.revision += 1
print("Stored one synthetic archive reading in the guarded local QA spread.")
