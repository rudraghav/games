"""Player progress rules: XP, levels, streaks, badges and reward states. No database."""

import pytest

from app.rooms.progress import (
    BADGE_BY_ID,
    BADGES,
    REWARDS,
    Cosmetics,
    MatchFact,
    build_progress,
    level_for,
    level_start,
    read_cosmetics,
    stored_cosmetics,
    worn_card_back,
    worn_frame,
)

ME = "me"
DAY = 86400
NOON = 12 * 3600


def match(game="uno", day=0, seconds=NOON, won=False, others=(), **fields):
    # A win needs someone to beat: a won match with nobody named is against one bot.
    return MatchFact(
        game_id=game, created_at=day * DAY + seconds,
        winners=(ME,) if won else tuple(fields.pop("winners", ())),
        participants=(ME, *(others or (("bot:rival",) if won else ()))), **fields,
    )


def progress(facts, now=NOON, tz=0, cosmetics=None):
    return build_progress(ME, facts, now, tz, cosmetics)


def badge(view, badge_id):
    return next(b for b in view.badges if b.id == badge_id)


def reward(view, reward_id):
    return next(r for r in view.rewards if r.id == reward_id)


def test_a_player_who_has_not_played_is_at_level_one_with_nothing_earned():
    view = progress([])
    assert (view.xp, view.level, view.level_xp, view.next_level_xp) == (0, 1, 0, 50)
    assert view.streak.model_dump() == {"current": 0, "best": 0, "played_today": False}
    assert view.totals.model_dump() == {
        "games": 0, "wins": 0, "different_games": 0, "with_friends": 0,
    }
    assert [b.id for b in view.badges] == [b.id for b in BADGES]
    assert all(not b.earned and b.value == 0 for b in view.badges)
    assert [r.id for r in view.rewards] == [r.id for r in REWARDS]
    assert all(r.state == "locked" and not r.equipped for r in view.rewards)


def test_xp_adds_each_bonus_once_per_match():
    # A first finished game: 10 for finishing and 15 for a game never finished before.
    assert progress([match()]).xp == 25
    # The same game again is worth the plain 10.
    assert progress([match(), match()]).xp == 35
    # A win adds 10; another human at the table adds 5; both can apply together.
    assert progress([match(won=True)]).xp == 35
    assert progress([match(others=("friend",))]).xp == 30
    assert progress([match(won=True, others=("friend", "other"))]).xp == 40
    # Being named the winner of a game played alone (the wheel, the reels) is a
    # finished game, not a win: no bonus and no step toward the win badges.
    alone = MatchFact("slots", NOON, winners=(ME,), participants=(ME,))
    assert progress([alone]).xp == 25 and progress([alone]).totals.wins == 0
    assert not next(b for b in progress([alone]).badges if b.id == "first-win").earned
    # Someone else winning is not a win, and a different game earns its own 15.
    lost = match(others=("friend",), winners=("friend",))
    assert progress([lost]).xp == 30 and progress([lost]).totals.wins == 0
    assert progress([match("uno"), match("ludo"), match("uno")]).xp == 10 * 3 + 15 * 2


def test_solo_organiser_and_tarot_matches_count_without_a_win_bonus():
    view = progress([match("tarot"), match("secret-santa"), match("roulette")])
    assert view.xp == 3 * 25
    assert view.totals.model_dump() == {
        "games": 3, "wins": 0, "different_games": 3, "with_friends": 0,
    }


def test_abandoned_unfinished_and_other_peoples_matches_are_ignored():
    facts = [
        match(won=True, abandoned=True),
        match("ludo", won=True, finished=False),
        MatchFact("chess", NOON, winners=("friend",), participants=("friend", "other")),
        # Named a winner of a match the player never sat in: still nothing.
        MatchFact("go", NOON, winners=(ME,), participants=("friend",)),
    ]
    view = progress(facts)
    assert view.xp == 0 and view.totals.games == 0 and view.streak.best == 0
    assert progress([*facts, match()]).xp == 25


def test_bots_are_not_friends_and_do_not_fill_a_table():
    with_bots = match(others=("bot:a", "bot:b", "bot:c"), won=True)
    view = progress([with_bots])
    assert view.xp == 35 and view.totals.with_friends == 0
    assert not badge(view, "full-table").earned
    mixed = progress([match(others=("bot:a", "friend"))])
    assert mixed.xp == 30 and mixed.totals.with_friends == 1
    # Three people and a bot are four seats but only three people.
    assert not badge(progress([match(others=("a", "b", "bot:c"))]), "full-table").earned
    assert badge(progress([match(others=("a", "b", "c"))]), "full-table").earned


@pytest.mark.parametrize(
    ("xp", "level", "began", "next_at"),
    [
        (0, 1, 0, 50), (49, 1, 0, 50), (50, 2, 50, 150), (149, 2, 50, 150),
        (150, 3, 150, 300), (299, 3, 150, 300), (300, 4, 300, 500), (499, 4, 300, 500),
        (500, 5, 500, 750), (749, 5, 500, 750), (750, 6, 750, 1050), (1399, 7, 1050, 1400),
        (1400, 8, 1400, 1800),
    ],
)
def test_level_boundaries(xp, level, began, next_at):
    assert level_for(xp) == level
    assert (level_start(level), level_start(level + 1)) == (began, next_at)


def test_the_view_reports_the_level_its_xp_reached():
    below = progress([match(won=True), match()])
    assert (below.xp, below.level, below.level_xp, below.next_level_xp) == (45, 1, 0, 50)
    exact = progress([match(won=True), match(others=("friend",))])
    assert (exact.xp, exact.level, exact.level_xp, exact.next_level_xp) == (50, 2, 50, 150)
    # Six different games, all won: 6 * 35 = 210, inside level 3.
    third = progress([match(f"g{i}", won=True) for i in range(6)])
    assert (third.xp, third.level, third.level_xp, third.next_level_xp) == (210, 3, 150, 300)


def test_a_streak_counts_consecutive_days_and_today():
    view = progress([match(day=d) for d in (3, 4, 5)], now=5 * DAY + NOON + 60)
    assert view.streak.model_dump() == {"current": 3, "best": 3, "played_today": True}
    # Several games in one day are one day.
    again = progress([match(day=5), match(day=5, seconds=NOON + 5)], now=5 * DAY + NOON + 60)
    assert again.streak.model_dump() == {"current": 1, "best": 1, "played_today": True}


def test_yesterday_keeps_a_streak_alive_until_the_day_after():
    facts = [match(day=d) for d in (0, 1, 2)]
    just_after_midnight = progress(facts, now=3 * DAY + 60)
    assert just_after_midnight.streak.model_dump() == {
        "current": 3, "best": 3, "played_today": False,
    }
    end_of_that_day = progress(facts, now=4 * DAY - 1)
    assert end_of_that_day.streak.current == 3
    gone = progress(facts, now=4 * DAY + 60)
    assert gone.streak.model_dump() == {"current": 0, "best": 3, "played_today": False}


def test_a_gap_resets_the_current_streak_but_not_the_best():
    facts = [match(day=d) for d in (0, 1, 2, 3, 6, 7)]
    view = progress(facts, now=7 * DAY + NOON + 60)
    assert view.streak.model_dump() == {"current": 2, "best": 4, "played_today": True}
    later = progress([*facts, match(day=20)], now=20 * DAY + NOON + 60)
    assert later.streak.model_dump() == {"current": 1, "best": 4, "played_today": True}


def test_a_streak_follows_the_players_own_midnight():
    late = match(day=0, seconds=23 * 3600 + 1800)  # 23:30 UTC on day 0
    early = match(day=2, seconds=3600)  # 01:00 UTC on day 2
    now = 2 * DAY + 2 * 3600
    # In UTC those are day 0 and day 2: two separate single days.
    utc = progress([late, early], now=now)
    assert utc.streak.model_dump() == {"current": 1, "best": 1, "played_today": True}
    # At +05:30 the first is 05:00 on day 1 and the second 06:30 on day 2.
    india = progress([late, early], now=now, tz=330)
    assert india.streak.model_dump() == {"current": 2, "best": 2, "played_today": True}
    # West of UTC a match just after midnight belongs to the day before.
    west = progress([match(day=5, seconds=1800)], now=5 * DAY + 1900, tz=-60)
    assert west.streak.model_dump() == {"current": 1, "best": 1, "played_today": True}
    assert progress([match(day=5, seconds=1800)], now=5 * DAY + 3700, tz=-60).streak.model_dump() == {
        "current": 1, "best": 1, "played_today": False,
    }
    # The widest offsets the API accepts stay whole days apart.
    assert progress([match(day=5)], now=5 * DAY + NOON, tz=840).streak.played_today
    assert progress([match(day=5)], now=5 * DAY + NOON, tz=-720).streak.played_today


def facts_reaching(counts: str, n: int) -> list[MatchFact]:
    """`n` of whatever a badge counts, all on one day unless it counts days."""
    if n == 0:
        return []
    return {
        "games": lambda: [match() for _ in range(n)],
        "wins": lambda: [match(won=True) for _ in range(n)],
        "different_games": lambda: [match(f"game-{i}") for i in range(n)],
        "with_friends": lambda: [match(others=("friend",)) for _ in range(n)],
        "full_tables": lambda: [match(others=("a", "b", "c")) for _ in range(n)],
        "best_streak": lambda: [match(day=d) for d in range(n)],
        "readings": lambda: [match("tarot") for _ in range(n)],
        "draws": lambda: [match("secret-santa") for _ in range(n)],
    }[counts]()


@pytest.mark.parametrize("definition", BADGES, ids=[b.id for b in BADGES])
def test_every_badge_is_earned_exactly_at_its_goal(definition):
    short = badge(progress(facts_reaching(definition.counts, definition.goal - 1)), definition.id)
    assert (short.earned, short.value, short.goal) == (
        False, definition.goal - 1, definition.goal,
    )
    met = badge(progress(facts_reaching(definition.counts, definition.goal)), definition.id)
    assert (met.earned, met.value, met.goal) == (True, definition.goal, definition.goal)
    past = badge(progress(facts_reaching(definition.counts, definition.goal + 3)), definition.id)
    assert (past.earned, past.value) == (True, definition.goal)  # capped at the goal
    assert (met.name, met.description) == (definition.name, definition.description)


def test_the_badge_and_reward_tables_are_the_agreed_ones():
    assert {b.id: b.goal for b in BADGES} == {
        "first-game": 1, "regular": 10, "veteran": 50, "first-win": 1, "five-wins": 5,
        "twenty-five-wins": 25, "explorer": 5, "collector": 15, "good-company": 5,
        "full-table": 1, "streak-3": 3, "streak-7": 7, "reader": 1, "organiser": 1,
    }
    assert [(r.id, r.kind, r.level, r.badge) for r in REWARDS] == [
        ("frame-gold", "frame", 2, None),
        ("frame-laurel", "frame", None, "five-wins"),
        ("frame-flame", "frame", None, "streak-3"),
        ("frame-confetti", "frame", None, "good-company"),
        ("frame-crown", "frame", 8, None),
        ("back-midnight", "card_back", 3, None),
        ("back-sunrise", "card_back", None, "explorer"),
        ("back-emerald", "card_back", None, "regular"),
        ("back-royal", "card_back", 6, None),
    ]
    assert all(r.badge in BADGE_BY_ID for r in REWARDS if r.badge)
    view = progress([])
    assert reward(view, "back-midnight").requirement == "Reach level 3"
    assert reward(view, "back-sunrise").requirement == "Earn the Explorer badge"
    assert reward(view, "frame-laurel").requirement == "Earn the Five wins badge"
    assert all(b.name and b.description and len(b.description) < 60 for b in view.badges)
    assert all(r.name and r.requirement for r in view.rewards)


def test_a_reward_moves_from_locked_to_available_to_redeemed_to_equipped():
    level_two = [match(won=True), match(others=("friend",))]  # 50 XP
    locked = reward(progress([match()]), "frame-gold")
    assert (locked.state, locked.value, locked.goal, locked.equipped) == ("locked", 1, 2, False)
    available = reward(progress(level_two), "frame-gold")
    assert (available.state, available.value, available.goal) == ("available", 2, 2)
    claimed = Cosmetics(frozenset({"frame-gold"}))
    redeemed = reward(progress(level_two, cosmetics=claimed), "frame-gold")
    assert (redeemed.state, redeemed.equipped) == ("redeemed", False)
    wearing = Cosmetics(frozenset({"frame-gold"}), frame="frame-gold")
    equipped = reward(progress(level_two, cosmetics=wearing), "frame-gold")
    assert (equipped.state, equipped.equipped) == ("redeemed", True)
    # Every other reward is untouched by that one claim.
    others = [r for r in progress(level_two, cosmetics=wearing).rewards if r.id != "frame-gold"]
    assert all(r.state == "locked" and not r.equipped for r in others)


def test_a_level_reward_shows_the_level_capped_at_its_goal():
    far = progress([match(f"g{i}", won=True) for i in range(6)])  # level 3
    assert (reward(far, "frame-gold").value, reward(far, "frame-gold").goal) == (2, 2)
    assert (reward(far, "back-midnight").value, reward(far, "back-midnight").state) == (
        3, "available",
    )
    assert (reward(far, "frame-crown").value, reward(far, "frame-crown").goal) == (3, 8)
    assert reward(far, "back-royal").state == "locked"


def test_a_badge_reward_mirrors_its_badges_progress():
    three = progress([match(f"g{i}") for i in range(3)])
    sunrise = reward(three, "back-sunrise")
    assert (sunrise.state, sunrise.value, sunrise.goal) == ("locked", 3, 5)
    five = progress([match(f"g{i}") for i in range(5)])
    assert reward(five, "back-sunrise").state == "available"
    wins = progress([match(won=True) for _ in range(5)])
    assert reward(wins, "frame-laurel").state == "available"
    days = progress([match(day=d) for d in range(3)], now=2 * DAY + NOON)
    assert reward(days, "frame-flame").state == "available"
    company = progress([match(others=("friend",)) for _ in range(5)])
    assert reward(company, "frame-confetti").state == "available"
    regular = progress([match() for _ in range(10)])
    assert reward(regular, "back-emerald").state == "available"


def test_a_stored_claim_that_is_not_earned_stays_locked_and_unworn():
    forged = Cosmetics(
        frozenset({"frame-crown", "back-royal"}), frame="frame-crown", card_back="back-royal"
    )
    view = progress([match()], cosmetics=forged)
    for reward_id in ("frame-crown", "back-royal"):
        assert (reward(view, reward_id).state, reward(view, reward_id).equipped) == (
            "locked", False,
        )


def test_stored_cosmetics_are_read_without_trusting_their_shape():
    assert read_cosmetics(None) == read_cosmetics({}) == read_cosmetics([1]) == Cosmetics()
    messy = read_cosmetics({
        "claimed": ["frame-gold", "frame-made-up", 7, None, "back-royal"],
        "frame": "back-royal",  # a card back is not a frame
        "card_back": "frame-gold",
        "xp": 99999,
    })
    assert messy == Cosmetics(frozenset({"frame-gold", "back-royal"}))
    assert read_cosmetics({"claimed": "frame-gold", "frame": 3}) == Cosmetics()
    assert worn_frame({"frame": "frame-gold"}) == "frame-gold"
    assert worn_frame({"frame": "frame-made-up"}) is None
    assert worn_frame({"frame": "back-royal"}) is None and worn_frame("frame-gold") is None
    assert worn_card_back({"card_back": "back-royal"}) == "back-royal"
    assert worn_card_back({"card_back": "frame-gold"}) is None
    kept = Cosmetics(frozenset({"back-royal", "frame-gold"}), "frame-gold", None)
    assert stored_cosmetics(kept) == {
        "claimed": ["frame-gold", "back-royal"], "frame": "frame-gold", "card_back": None,
    }
    assert read_cosmetics(stored_cosmetics(kept)) == kept
