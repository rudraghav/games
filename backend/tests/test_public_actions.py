import json

import pytest

from app.core.contracts import Action, GameView, PlayerView
from app.rooms.public_actions import public_action


def view(game="holdem", **detail):
    return GameView(
        game_id=game,
        phase="playing",
        current_player="p",
        players=[PlayerView(id="p", chips=80, bet=20)],
        hand=[],
        detail=detail,
    )


@pytest.mark.parametrize(
    ("kind", "amount", "expected"),
    [("call", 0, 10), ("raise", 50, 30), ("all_in", 0, 80), ("check", 0, None), ("fold", 0, None)],
)
def test_holdem_public_amount_uses_before_projection_even_when_move_settles(kind, amount, expected):
    cue = public_action(view(current_bet=30), "p", Action(type=kind, amount=amount), 12)
    assert cue == {"actor_id": "p", "type": kind, "amount": expected, "version": 12}


@pytest.mark.parametrize("kind", ["split", "double"])
def test_blackjack_records_active_hand_wager_not_total_or_private_cards(kind):
    cue = public_action(
        view("blackjack", hand_index=1, hands=[{"bet": 10}, {"bet": 30, "cards": ["private"]}]),
        "p",
        Action(type=kind, cards=["private"]),
        3,
    )
    assert cue["amount"] == 30
    assert set(cue) == {"version", "actor_id", "type", "amount"}
    assert "private" not in json.dumps(cue)


def test_blackjack_insurance_and_teen_seen_stakes_are_exact():
    before = view("blackjack")
    before.phase = "insurance"
    assert public_action(before, "p", Action(type="accept"), 4)["amount"] == 10
    assert (
        public_action(view("teen-patti", stake=8, blind=False), "p", Action(type="show"), 4)[
            "amount"
        ]
        == 16
    )
    assert (
        public_action(view("teen-patti", stake=8, blind=True), "p", Action(type="sideshow"), 4)[
            "amount"
        ]
        == 8
    )


def test_private_or_unknown_choices_never_become_public_events():
    assert public_action(view("hot-seat"), "p", Action(type="choose", choice="private"), 3) is None
    assert public_action(view(), "p", Action(type="private", choice="private"), 3) is None
    assert public_action(view(), "outsider", Action(type="fold"), 3) is None
