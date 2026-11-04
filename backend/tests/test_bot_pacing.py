"""Bot pacing: reviews stay readable and people get a fair UNO window.

Pure scheduling checks on engine states; no database, network or policy change.
"""

import pytest

from app.games.registry import ENGINES
from app.models import Member
from app.rooms.bots import (
    BOT_CATCH_GRACE_SECONDS,
    BOT_DELAY_SECONDS,
    BOT_REVIEW_DELAY_SECONDS,
    bot_delay,
    next_bot_view,
)

HUMAN = "human-1"


def seats(count: int) -> tuple[list[str], list[Member]]:
    bots = [f"bot:{i:032x}" for i in range(1, count)]
    members = [Member(room_id="room", user_id=bot, is_bot=True, seated=True) for bot in bots]
    return [HUMAN, *bots], members


def started(game: str, count: int, seed: int = 7):
    players, bots = seats(count)
    engine = ENGINES[game]
    return engine, engine.setup(players, {}, seed=seed), players, bots


def test_ordinary_bot_moves_keep_the_short_delay():
    engine, state, players, bots = started("trio", 3)
    state["turn"] = players.index(bots[0].user_id)
    assert bot_delay(engine, state, bots) == BOT_DELAY_SECONDS


@pytest.mark.parametrize(
    ("game", "count", "phase", "action"),
    [
        ("trio", 3, "review", "continue"),
        ("skyjo", 2, "between_rounds", "next_round"),
        ("flip-7", 3, "round_over", "next_round"),
        ("azul", 2, "round_over", "next_round"),
        ("sea-salt-paper", 2, "round_over", "next_round"),
        ("six-nimmt", 2, "review", "next_selection"),
        ("six-nimmt", 2, "round_over", "next_round"),
        ("the-gang", 3, "heist_review", "next_heist"),
    ],
)
def test_a_bot_waits_before_closing_a_review(game, count, phase, action):
    engine, state, players, bots = started(game, count)
    state.update(phase=phase, turn=players.index(bots[0].user_id), failed=True)
    if game == "the-gang":
        # A completed heist: five community cards, every chip ranked, hands shown.
        state.update(
            board=[state["deck"].pop() for _ in range(5)],
            chips={player: rank for rank, player in enumerate(players, 1)},
            revealed=list(players),
            street=3,
        )
    bot_id, view = next_bot_view(engine, state, bots)
    assert bot_id == bots[0].user_id
    assert {option.action.type for option in view.actions} == {action}
    delay = bot_delay(engine, state, bots)
    assert delay == BOT_REVIEW_DELAY_SECONDS[action]
    assert delay >= 4 * BOT_DELAY_SECONDS


def test_party_spotlight_bot_waits_on_the_reveal():
    engine, state, players, bots = started("most-likely", 3)
    # The spotlight rotates with the round; round 1 belongs to the first bot.
    state.update(phase="reveal", round=1, turn=1)
    assert engine.legal_actions(state, bots[0].user_id)[0].action.type == "next_prompt"
    assert bot_delay(engine, state, bots) == BOT_REVIEW_DELAY_SECONDS["next_prompt"]


def test_a_person_holding_the_review_is_never_rushed_or_delayed_by_bots():
    engine, state, players, bots = started("trio", 3)
    state.update(phase="review", turn=players.index(HUMAN), failed=True)
    assert next_bot_view(engine, state, bots) is None
    assert bot_delay(engine, state, bots) == BOT_DELAY_SECONDS


def uno_one_card(state: dict, holder: str) -> None:
    """A conserved state where `holder` has just reached one card without calling."""
    state["deck"].extend(state["hands"][holder][1:])
    state["hands"][holder] = state["hands"][holder][:1]
    state.update(called=[], catchable=holder, pending=None, penalty=0, drawn=None)


@pytest.mark.parametrize("game", ["uno", "uno-no-mercy"])
def test_people_get_a_fair_window_to_call_uno_before_a_bot_catch(game):
    engine, state, players, bots = started(game, 3)
    uno_one_card(state, HUMAN)
    state["turn"] = players.index(bots[0].user_id)
    _, view = next_bot_view(engine, state, bots)
    assert any(o.action.type == "catch_uno" and o.action.target == HUMAN for o in view.actions)
    assert bot_delay(engine, state, bots) == BOT_CATCH_GRACE_SECONDS
    # The catch remains legal after the window: pacing only, never a rule change.
    assert BOT_DELAY_SECONDS < BOT_CATCH_GRACE_SECONDS


def test_a_bot_with_one_card_still_announces_at_the_ordinary_pace():
    engine, state, players, bots = started("uno", 3)
    uno_one_card(state, bots[0].user_id)
    state["turn"] = players.index(bots[1].user_id)
    bot_id, view = next_bot_view(engine, state, bots)
    assert bot_id == bots[0].user_id
    assert any(option.action.type == "uno" for option in view.actions)
    assert bot_delay(engine, state, bots) == BOT_DELAY_SECONDS


def test_the_base_delay_is_respected_and_waiting_bots_are_unpaced():
    engine, state, players, bots = started("six-nimmt", 2)
    state.update(phase="review", turn=players.index(bots[0].user_id))
    assert bot_delay(engine, state, bots, base=12.0) == 12.0
    state["turn"] = players.index(HUMAN)
    assert bot_delay(engine, state, bots, base=0.0) == 0.0
