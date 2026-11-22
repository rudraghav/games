"""Player progress and earned rewards, worked out from finished matches.

Pure: no database and no clock. The caller passes plain match facts and "now",
so every rule here can be tested with a list and a number. Nothing is stored
except which rewards a player redeemed and what they wear; XP, level, streak
and badges are always recomputed, so a client has nothing to write to.
"""

from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass
from typing import Literal

from app.rooms.schemas import (
    BadgeView,
    ProgressTotals,
    ProgressView,
    RewardView,
    StreakView,
)

XP_PER_GAME = 10
XP_WIN = 10
XP_WITH_FRIENDS = 5
XP_NEW_GAME = 15
FULL_TABLE_PEOPLE = 4
DAY_SECONDS = 86400

RewardKind = Literal["frame", "card_back"]


@dataclass(frozen=True)
class MatchFact:
    """What progress needs to know about one saved match, and nothing else."""

    game_id: str
    created_at: float
    winners: tuple[str, ...] = ()
    participants: tuple[str, ...] = ()
    finished: bool = True
    abandoned: bool = False


@dataclass(frozen=True)
class Badge:
    id: str
    name: str
    description: str
    goal: int
    # Which counted number the badge follows; a key of `_numbers`.
    counts: str


@dataclass(frozen=True)
class Reward:
    id: str
    kind: RewardKind
    name: str
    # Exactly one of these is the requirement.
    level: int | None = None
    badge: str | None = None


# The single source of every name, description and requirement the API returns.
BADGES: tuple[Badge, ...] = (
    Badge("first-game", "First game", "Finish your first game", 1, "games"),
    Badge("regular", "Regular", "Finish 10 games", 10, "games"),
    Badge("veteran", "Veteran", "Finish 50 games", 50, "games"),
    Badge("first-win", "First win", "Win a game", 1, "wins"),
    Badge("five-wins", "Five wins", "Win 5 games", 5, "wins"),
    Badge("twenty-five-wins", "Champion", "Win 25 games", 25, "wins"),
    Badge("explorer", "Explorer", "Finish 5 different games", 5, "different_games"),
    Badge("collector", "Collector", "Finish 15 different games", 15, "different_games"),
    Badge("good-company", "Good company", "Finish 5 games with other people", 5,
          "with_friends"),
    Badge("full-table", "Full table", "Finish a game with 3 or more other people", 1,
          "full_tables"),
    Badge("streak-3", "Three in a row", "Play 3 days in a row", 3, "best_streak"),
    Badge("streak-7", "Full week", "Play 7 days in a row", 7, "best_streak"),
    Badge("reader", "Reader", "Finish a Tarot reading", 1, "readings"),
    Badge("organiser", "Organiser", "Finish a Secret Santa draw", 1, "draws"),
)
BADGE_BY_ID = {badge.id: badge for badge in BADGES}

REWARDS: tuple[Reward, ...] = (
    Reward("frame-gold", "frame", "Gold frame", level=2),
    Reward("frame-laurel", "frame", "Laurel frame", badge="five-wins"),
    Reward("frame-flame", "frame", "Flame frame", badge="streak-3"),
    Reward("frame-confetti", "frame", "Confetti frame", badge="good-company"),
    Reward("frame-crown", "frame", "Crown frame", level=8),
    Reward("back-midnight", "card_back", "Midnight card back", level=3),
    Reward("back-sunrise", "card_back", "Sunrise card back", badge="explorer"),
    Reward("back-emerald", "card_back", "Emerald card back", badge="regular"),
    Reward("back-royal", "card_back", "Royal card back", level=6),
)
REWARD_BY_ID = {reward.id: reward for reward in REWARDS}


def requirement(reward: Reward) -> str:
    """The sentence a player reads: "Reach level 3" or "Earn the Explorer badge"."""
    if reward.badge is not None:
        return f"Earn the {BADGE_BY_ID[reward.badge].name} badge"
    return f"Reach level {reward.level}"


@dataclass(frozen=True)
class Cosmetics:
    """What a profile has stored: redeemed reward ids and the two things worn."""

    claimed: frozenset[str] = frozenset()
    frame: str | None = None
    card_back: str | None = None


def _worn(value: object, kind: RewardKind) -> str | None:
    reward = REWARD_BY_ID.get(value) if isinstance(value, str) else None
    return reward.id if reward and reward.kind == kind else None


def read_cosmetics(stored: object) -> Cosmetics:
    """Read a profile's stored JSON without trusting its shape or its ids."""
    if not isinstance(stored, dict):
        return Cosmetics()
    claimed = stored.get("claimed")
    return Cosmetics(
        claimed=frozenset(
            item for item in claimed if isinstance(item, str) and item in REWARD_BY_ID
        ) if isinstance(claimed, list) else frozenset(),
        frame=_worn(stored.get("frame"), "frame"),
        card_back=_worn(stored.get("card_back"), "card_back"),
    )


def stored_cosmetics(cosmetics: Cosmetics) -> dict[str, object]:
    """The JSON saved on the profile, with redeemed ids in the table's order."""
    return {
        "claimed": [reward.id for reward in REWARDS if reward.id in cosmetics.claimed],
        "frame": cosmetics.frame,
        "card_back": cosmetics.card_back,
    }


def worn_frame(stored: object) -> str | None:
    """The frame everyone sees on this player; None unless it is a known frame."""
    return read_cosmetics(stored).frame


def worn_card_back(stored: object) -> str | None:
    """The card back on this player's own screen; None unless it is a known one."""
    return read_cosmetics(stored).card_back


def level_start(level: int) -> int:
    """XP at which a level begins: 0, 50, 150, 300, 500 ..."""
    return 25 * level * (level - 1)


def level_for(xp: int) -> int:
    level = 1
    while level_start(level + 1) <= xp:
        level += 1
    return level


def is_bot(player_id: str) -> bool:
    return player_id.startswith("bot:")


def counted(player_id: str, facts: Iterable[MatchFact]) -> list[MatchFact]:
    """The player's finished matches that were not abandoned."""
    return [
        fact for fact in facts
        if fact.finished and not fact.abandoned and player_id in fact.participants
    ]


def local_day(moment: float, tz_offset: int) -> int:
    """The calendar day, as a day number, in a zone `tz_offset` minutes east of UTC."""
    return int((moment + tz_offset * 60) // DAY_SECONDS)


def streak(days: set[int], today: int) -> StreakView:
    """Runs of consecutive days. Yesterday keeps a run alive until today ends."""
    best = 0
    for day in days:
        if day - 1 in days:
            continue  # not the first day of its run
        length = 1
        while day + length in days:
            length += 1
        best = max(best, length)
    last = today if today in days else today - 1
    current = 0
    while last - current in days:
        current += 1
    return StreakView(current=current, best=best, played_today=today in days)


def _numbers(player_id: str, matches: list[MatchFact], best_streak: int) -> dict[str, int]:
    """Every number a badge can follow."""
    others = [
        {p for p in fact.participants if p != player_id and not is_bot(p)} for fact in matches
    ]
    return {
        "games": len(matches),
        # A win needs someone to beat, a person or a bot. Finishing a game played alone
        # (a reading, a draw, the wheel or the reels) is a finished game, not a win.
        "wins": sum(
            player_id in fact.winners and len(fact.participants) > 1 for fact in matches
        ),
        "different_games": len({fact.game_id for fact in matches}),
        "with_friends": sum(bool(people) for people in others),
        "full_tables": sum(len(people) + 1 >= FULL_TABLE_PEOPLE for people in others),
        "best_streak": best_streak,
        "readings": sum(fact.game_id == "tarot" for fact in matches),
        "draws": sum(fact.game_id == "secret-santa" for fact in matches),
    }


def build_progress(
    player_id: str,
    facts: Iterable[MatchFact],
    now: float,
    tz_offset: int = 0,
    cosmetics: Cosmetics | None = None,
) -> ProgressView:
    """A player's whole progress view from their matches and what they redeemed."""
    cosmetics = cosmetics or Cosmetics()
    matches = counted(player_id, facts)
    run = streak(
        {local_day(fact.created_at, tz_offset) for fact in matches}, local_day(now, tz_offset)
    )
    numbers = _numbers(player_id, matches, run.best)
    xp = (
        XP_PER_GAME * numbers["games"]
        + XP_WIN * numbers["wins"]
        + XP_WITH_FRIENDS * numbers["with_friends"]
        + XP_NEW_GAME * numbers["different_games"]
    )
    level = level_for(xp)
    badges = [
        BadgeView(
            id=badge.id, name=badge.name, description=badge.description,
            earned=numbers[badge.counts] >= badge.goal,
            value=min(numbers[badge.counts], badge.goal), goal=badge.goal,
        )
        for badge in BADGES
    ]
    badge_views = {badge.id: badge for badge in badges}
    rewards = []
    for reward in REWARDS:
        if reward.badge is not None:
            value, goal = badge_views[reward.badge].value, badge_views[reward.badge].goal
        else:
            assert reward.level is not None
            value, goal = min(level, reward.level), reward.level
        # A stored claim counts only while the requirement is still met.
        state: Literal["locked", "available", "redeemed"] = (
            "locked" if value < goal
            else "redeemed" if reward.id in cosmetics.claimed
            else "available"
        )
        rewards.append(RewardView(
            id=reward.id, kind=reward.kind, name=reward.name,
            requirement=requirement(reward), state=state,
            equipped=state == "redeemed"
            and reward.id == (cosmetics.frame if reward.kind == "frame" else cosmetics.card_back),
            value=value, goal=goal,
        ))
    return ProgressView(
        xp=xp, level=level, level_xp=level_start(level), next_level_xp=level_start(level + 1),
        streak=run,
        totals=ProgressTotals(
            games=numbers["games"], wins=numbers["wins"],
            different_games=numbers["different_games"], with_friends=numbers["with_friends"],
        ),
        badges=badges, rewards=rewards,
    )
