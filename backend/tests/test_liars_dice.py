"""Liar's Dice: hidden rolls, raise order, wild ones, lost dice and the reveal."""

import json

import pytest

from app.bots import choose_action
from app.core.contracts import Action, RuleError
from app.games.liars_dice.engine import LiarsDiceEngine, matching, minimum_quantity
from app.models import Member
from app.rooms.bots import BOT_REVIEW_DELAY_SECONDS, bot_delay
from app.rooms.public_history import public_move

ENGINE = LiarsDiceEngine()
DETAIL_KEYS = {"round", "dice", "total_dice", "wild_ones", "bid", "bids", "starter", "out", "reveal"}


def start(players=("a", "b", "c"), seed=5, **settings):
    return ENGINE.setup(list(players), settings, seed=seed)


def rigged(dice, **settings):
    """A real opening with chosen dice, so a test knows what a call will find."""
    state = start(tuple(dice), **settings)
    state["dice"] = {player: sorted(values) for player, values in dice.items()}
    state["counts"] = {player: len(values) for player, values in dice.items()}
    return state


def bid(state, player, quantity, face):
    return ENGINE.apply_action(state, player, Action(type="bid", choice=str(face), amount=quantity))


def offers(state, player):
    return {
        int(o.action.choice): (o.minimum, o.maximum)
        for o in ENGINE.legal_actions(state, player)
        if o.action.type == "bid"
    }


def test_manifest_is_the_documented_contract():
    manifest = ENGINE.manifest
    assert (manifest.id, manifest.name, manifest.family) == ("liars-dice", "Liar’s Dice", "dice")
    assert (manifest.min_players, manifest.max_players) == (2, 6)
    assert (manifest.minutes, manifest.icon, manifest.color) == ("10–25", "circle-dot", "plum")
    assert (manifest.score_label, manifest.score_order) == ("Dice left", "high")
    assert [(s.key, s.label, s.default) for s in manifest.settings] == [
        ("wild_ones", "Ones are wild", True)]


def test_setup_rolls_five_hidden_dice_each_from_the_seed():
    state = start()
    assert state["counts"] == {"a": 5, "b": 5, "c": 5} and state["round"] == 1
    for dice in state["dice"].values():
        assert len(dice) == 5 and dice == sorted(dice) and set(dice) <= set(range(1, 7))
    assert state["wild_ones"] is True and start(wild_ones=False)["wild_ones"] is False
    assert start() == state and start(seed=6)["dice"] != state["dice"]
    assert state["phase"] == "bidding" and state["bid"] is None and state["starter"] == "a"
    for count in (1, 7):
        with pytest.raises(RuleError):
            ENGINE.setup([f"p{i}" for i in range(count)], {})


def test_opening_and_raise_order():
    state = start()
    assert offers(state, "a") == {face: (1, 15) for face in range(1, 7)}
    assert "call_liar" not in [o.action.type for o in ENGINE.legal_actions(state, "a")]
    assert ENGINE.legal_actions(state, "b") == []
    state = bid(state, "a", 3, 4)
    assert state["bid"] == {"player": "a", "quantity": 3, "face": 4}
    assert ENGINE.project_view(state, "a").current_player == "b"
    # Same quantity needs a higher face; any face is open at a higher quantity.
    assert offers(state, "b") == {1: (4, 15), 2: (4, 15), 3: (4, 15), 4: (4, 15),
                                  5: (3, 15), 6: (3, 15)}
    assert "call_liar" in [o.action.type for o in ENGINE.legal_actions(state, "b")]
    before = json.dumps(state, sort_keys=True)
    for quantity, face in [(3, 4), (3, 3), (2, 6), (0, 6), (16, 6), (3, 7), (4, 0)]:
        with pytest.raises(RuleError):
            bid(state, "b", quantity, face)
    assert json.dumps(state, sort_keys=True) == before
    state = bid(state, "b", 3, 6)
    state = bid(state, "c", 4, 1)
    assert [(b["player"], b["quantity"], b["face"]) for b in state["bids"]] == [
        ("a", 3, 4), ("b", 3, 6), ("c", 4, 1)]
    assert minimum_quantity(None, 3) == 1
    assert minimum_quantity({"quantity": 4, "face": 1}, 1) == 5
    assert minimum_quantity({"quantity": 4, "face": 1}, 2) == 4


def test_the_highest_possible_bid_can_only_be_called():
    state = bid(start(("a", "b")), "a", 10, 6)
    options = ENGINE.legal_actions(state, "b")
    assert [o.action.type for o in options] == ["call_liar"]
    state = bid(start(("a", "b")), "a", 10, 5)
    assert offers(state, "b") == {6: (10, 10)}


def test_wild_ones_count_for_every_face_except_a_bid_on_ones():
    dice = [1, 1, 3, 3, 6]
    assert matching(dice, 3, True) == 4 and matching(dice, 3, False) == 2
    assert matching(dice, 1, True) == matching(dice, 1, False) == 2
    assert matching(dice, 6, True) == 3 and matching(dice, 5, True) == 2


@pytest.mark.parametrize(
    ("wild", "quantity", "face", "count", "held"),
    [
        (True, 4, 3, 5, True),  # three 3s and two wild ones
        (False, 4, 3, 3, False),  # the ones no longer help
        (True, 3, 1, 2, False),  # a bid on ones counts only ones
        (False, 2, 1, 2, True),
        (True, 5, 3, 5, True),  # exactly met counts as held
        (True, 6, 3, 5, False),
    ],
)
def test_a_call_counts_every_die_and_the_right_player_loses_one(wild, quantity, face, count, held):
    state = rigged({"a": [1, 3, 3, 5, 6], "b": [1, 2, 3, 4, 4]}, wild_ones=wild)
    state = bid(state, "a", quantity, face)
    state = ENGINE.apply_action(state, "b", Action(type="call_liar"))
    loser = "b" if held else "a"
    assert state["reveal"] == {
        "caller": "b", "bidder": "a", "quantity": quantity, "face": face, "count": count,
        "held": held, "loser": loser, "eliminated": False,
    }
    assert state["counts"][loser] == 4 and state["counts"]["a" if held else "b"] == 5
    assert state["phase"] == "reveal" and state["starter"] == loser
    # The loser, and only the loser, rolls the next round and then opens it.
    for player in ("a", "b"):
        expected = ["next_round"] if player == loser else []
        assert [o.action.type for o in ENGINE.legal_actions(state, player)] == expected
    state = ENGINE.apply_action(state, loser, Action(type="next_round"))
    assert state["phase"] == "bidding" and state["round"] == 2 and state["reveal"] is None
    assert state["bid"] is None and state["bids"] == []
    assert len(state["dice"][loser]) == 4 and ENGINE.project_view(state, "a").current_player == loser


def test_only_your_own_dice_are_visible_until_the_call():
    state = bid(start(), "a", 2, 2)
    for viewer in state["order"]:
        view = ENGINE.project_view(state, viewer)
        assert set(view.detail) == DETAIL_KEYS
        assert view.detail["dice"] == state["dice"][viewer]
        assert view.detail["reveal"] is None and view.detail["total_dice"] == 15
        assert [p.count for p in view.players] == [5, 5, 5]
        wire = view.model_dump_json()
        assert '"seed"' not in wire and '"counts"' not in wire
        # Canary: give every other player dice no real roll could mix up with the
        # viewer's own, and change the private roll number. Same bytes.
        other = json.loads(json.dumps(state))
        other["seed"] = 1
        for player in state["order"]:
            if player != viewer:
                other["dice"][player] = [7 - die for die in state["dice"][player]]
        assert ENGINE.project_view(other, viewer).model_dump_json() == wire
    outside = ENGINE.project_view(state, "nobody")
    assert outside.detail["dice"] == [] and outside.actions == []


def test_the_reveal_shows_every_die_to_everyone_until_the_next_round():
    state = bid(start(), "a", 9, 6)
    rolled = {player: list(dice) for player, dice in state["dice"].items()}
    state = ENGINE.apply_action(state, "b", Action(type="call_liar"))
    views = [ENGINE.project_view(state, p) for p in state["order"]]
    for view in views:
        assert view.phase == "reveal" and view.detail["reveal"]["dice"] == rolled
        assert view.detail["reveal"]["count"] == matching(sum(rolled.values(), []), 6, True)
        assert view.detail["bid"] == {"player": "a", "quantity": 9, "face": 6}
        assert view.detail["total_dice"] == 15
    assert len({json.dumps(view.detail["reveal"], sort_keys=True) for view in views}) == 1
    loser = state["reveal"]["loser"]
    assert next(p.count for p in views[0].players if p.id == loser) == 4
    with pytest.raises(RuleError):
        bid(state, loser, 1, 1)
    state = ENGINE.apply_action(state, loser, Action(type="next_round"))
    for viewer in state["order"]:
        detail = ENGINE.project_view(state, viewer).detail
        assert detail["reveal"] is None and detail["dice"] == state["dice"][viewer]
        assert detail["total_dice"] == 14


def test_a_player_with_no_dice_is_out_and_the_next_player_starts():
    state = rigged({"a": [2, 2], "b": [5], "c": [3, 4]}, wild_ones=False)
    state = bid(state, "a", 1, 2)
    state = bid(state, "b", 3, 6)  # there is no six on the table
    state = ENGINE.apply_action(state, "c", Action(type="call_liar"))
    assert state["reveal"]["loser"] == "b" and state["reveal"]["eliminated"] is True
    assert state["counts"]["b"] == 0 and state["out"] == ["b"] and state["starter"] == "c"
    view = ENGINE.project_view(state, "a")
    assert [(p.id, p.eliminated) for p in view.players] == [("a", False), ("b", True), ("c", False)]
    state = ENGINE.apply_action(state, "c", Action(type="next_round"))
    assert state["dice"]["b"] == [] and ENGINE.project_view(state, "b").detail["dice"] == []
    # The player who is out never gets a turn: c bids, then a.
    assert ENGINE.legal_actions(state, "b") == []
    state = bid(state, "c", 1, 1)
    assert ENGINE.project_view(state, "c").current_player == "a"
    state = bid(state, "a", 4, 6)
    assert ENGINE.project_view(state, "c").current_player == "c"


def test_the_last_player_with_dice_wins():
    state = rigged({"a": [6], "b": [2]}, wild_ones=False)
    state = bid(state, "a", 1, 6)
    state = ENGINE.apply_action(state, "b", Action(type="call_liar"))
    assert state["phase"] == "finished" and state["winners"] == ["a"] and state["out"] == ["b"]
    view = ENGINE.project_view(state, "b")
    assert view.current_player is None and view.winners == ["a"]
    assert [(p.id, p.score) for p in view.players] == [("a", 1), ("b", 0)]
    assert view.detail["reveal"]["dice"] == {"a": [6], "b": [2]} and view.detail["reveal"]["held"]
    assert ENGINE.legal_actions(state, "a") == ENGINE.legal_actions(state, "b") == []
    with pytest.raises(RuleError):
        ENGINE.apply_action(state, "a", Action(type="next_round"))


def test_rejected_actions_leave_the_state_untouched():
    state = bid(start(), "a", 2, 2)
    before = json.dumps(state, sort_keys=True)
    for player, action in [
        ("a", Action(type="call_liar")),
        ("c", Action(type="bid", choice="6", amount=5)),
        ("b", Action(type="next_round")),
        ("b", Action(type="bid", choice="six", amount=5)),
        ("b", Action(type="bid", amount=5)),
        ("nobody", Action(type="call_liar")),
        ("b", Action(type="invented")),
    ]:
        with pytest.raises(RuleError):
            ENGINE.apply_action(state, player, action)
    assert json.dumps(state, sort_keys=True) == before


def test_history_records_the_spoken_bid_and_who_was_right_but_no_die():
    state = rigged({"a": [1, 3, 3, 5, 6], "b": [1, 2, 3, 4, 4]})
    people = state["order"]

    def step(state, actor, action, version):
        before = {p: ENGINE.project_view(state, p) for p in people}
        state = ENGINE.apply_action(state, actor, action)
        after = {p: ENGINE.project_view(state, p) for p in people}
        return state, public_move(before, after, actor, action, version)

    state, event = step(state, "a", Action(type="bid", choice="3", amount=4), 2)
    assert (event.type, event.label) == ("bid", "Bid 4 × threes")
    assert event.cards == [] and event.amount is None and event.targets == []
    state, event = step(state, "b", Action(type="call_liar"), 3)
    assert event.label == "Called liar and was wrong" and event.cards == []
    assert "dice" not in event.model_dump_json()
    state, event = step(state, "b", Action(type="next_round"), 4)
    assert event.label == "Rolled the next round"
    state, event = step(state, "b", Action(type="bid", choice="6", amount=9), 5)
    state, event = step(state, "a", Action(type="call_liar"), 6)
    assert event.label == "Called liar and was right"


def test_bot_calls_an_impossible_bid_and_raises_one_it_can_see_is_true():
    state = rigged({"a": [2, 2, 2, 2, 2], "b": [3, 3, 3, 3, 3]}, wild_ones=False)
    # Ten sixes need five from the bot's own hand, which holds none.
    impossible = bid(state, "a", 10, 6)
    assert choose_action(ENGINE.project_view(impossible, "b"), "b").action.type == "call_liar"
    # Two threes are already in the bot's own hand: it never calls that.
    certain = bid(state, "a", 2, 3)
    decision = choose_action(ENGINE.project_view(certain, "b"), "b").action
    assert decision.type == "bid"
    ENGINE.apply_action(certain, "b", decision)
    opening = choose_action(ENGINE.project_view(state, "a"), "a").action
    assert opening.type == "bid" and opening.choice == "2" and opening.amount >= 5
    ENGINE.apply_action(state, "a", opening)


def test_bot_decisions_ignore_dice_it_cannot_see():
    state = bid(start(), "a", 3, 4)
    other = json.loads(json.dumps(state))
    other["dice"]["a"], other["dice"]["c"] = [6] * 5, [6] * 5
    first, second = ENGINE.project_view(state, "b"), ENGINE.project_view(other, "b")
    assert first == second
    assert choose_action(first, "b", {"seed": 3}) == choose_action(second, "b", {"seed": 3})


def test_a_bot_leaves_the_reveal_up_before_rolling_again():
    human, bot = "human-1", f"bot:{1:032x}"
    state = rigged({human: [6, 6], bot: [2, 2]}, wild_ones=False)
    state = bid(state, human, 2, 6)
    state = ENGINE.apply_action(state, bot, Action(type="call_liar"))
    assert state["starter"] == bot
    members = [Member(room_id="room", user_id=bot, is_bot=True, seated=True)]
    assert bot_delay(ENGINE, state, members) == BOT_REVIEW_DELAY_SECONDS["next_round"]
