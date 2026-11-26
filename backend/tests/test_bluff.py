"""Bluff: face-down plays, one declared rank, the call, the pass-around and going out."""

import json
from collections import Counter

import pytest

from app.bots import choose_action
from app.core.cards import standard_deck
from app.core.contracts import Action, RuleError
from app.games.bluff.engine import RANK_VALUES, BluffEngine
from app.models import Member
from app.rooms.bots import BOT_REVIEW_DELAY_SECONDS, bot_delay
from app.rooms.public_history import public_move

ENGINE = BluffEngine()
DETAIL_KEYS = {"rank", "pile_count", "discarded_count", "plays", "last_play", "passed",
               "going_out", "reveal"}


def start(players=("a", "b", "c"), seed=3):
    return ENGINE.setup(list(players), {}, seed=seed)


def rigged(hands):
    """A real opening with chosen hands, so a test knows which plays are honest."""
    state = start(tuple(hands))
    state["hands"] = {player: list(cards) for player, cards in hands.items()}
    return state


def play(state, player, rank, *cards):
    return ENGINE.apply_action(state, player, Action(type="play", choice=rank, cards=list(cards)))


def act(state, player, kind):
    return ENGINE.apply_action(state, player, Action(type=kind))


def kinds(state, player):
    return [option.action.type for option in ENGINE.legal_actions(state, player)]


def every_card(state):
    return Counter(state["pile"] + state["discarded"] + sum(state["hands"].values(), []))


HANDS = {
    "a": ["QS:0", "QH:0", "5D:0", "9C:0"],
    "b": ["QD:0", "7S:0", "7H:0", "2C:0"],
    "c": ["KS:0", "KH:0", "3D:0", "4C:0"],
}


def test_manifest_is_the_documented_contract():
    manifest = ENGINE.manifest
    assert (manifest.id, manifest.name, manifest.family) == ("bluff", "Bluff", "bluff")
    assert (manifest.min_players, manifest.max_players) == (2, 6)
    assert (manifest.minutes, manifest.icon, manifest.color) == ("15–30", "spade", "sky")
    assert (manifest.score_label, manifest.score_order) == ("Cards left", "low")
    assert manifest.settings == []


@pytest.mark.parametrize(("seats", "sizes"), [(2, [26, 26]), (3, [18, 17, 17]),
                                              (5, [11, 11, 10, 10, 10]), (6, [9, 9, 9, 9, 8, 8])])
def test_all_fifty_two_cards_are_dealt_out(seats, sizes):
    players = [f"p{i}" for i in range(seats)]
    state = ENGINE.setup(players, {}, seed=11)
    assert [len(state["hands"][p]) for p in players] == sizes
    assert every_card(state) == Counter(standard_deck())
    assert state["pile"] == [] and state["rank"] is None and state["phase"] == "playing"
    assert ENGINE.setup(players, {}, seed=11) == state
    assert ENGINE.setup(players, {}, seed=12)["hands"] != state["hands"]


def test_seat_limits():
    for count in (1, 7):
        with pytest.raises(RuleError):
            ENGINE.setup([f"p{i}" for i in range(count)], {})


def test_the_starter_must_play_and_may_declare_any_rank():
    state = rigged(HANDS)
    options = ENGINE.legal_actions(state, "a")
    assert [o.action.type for o in options] == ["play"] * 13
    assert [o.action.choice for o in options] == RANK_VALUES
    for option in options:
        assert option.input == "cards" and (option.minimum, option.maximum) == (1, 4)
        assert option.eligible_cards == HANDS["a"]
    assert ENGINE.legal_actions(state, "b") == []
    # A lie is a legal play: two cards that are not Kings, declared as Kings.
    state = play(state, "a", "K", "5D:0", "9C:0")
    assert state["rank"] == "K" and state["pile"] == ["5D:0", "9C:0"]
    assert state["hands"]["a"] == ["QS:0", "QH:0"]


def test_a_play_is_one_to_four_of_your_own_cards_as_the_declared_rank():
    state = rigged({**HANDS, "a": ["QS:0", "QH:0", "QD:0", "QC:0", "5D:0", "9C:0"]})
    before = json.dumps(state, sort_keys=True)
    for rank, cards in [
        ("Q", []),
        ("Q", ["QS:0", "QH:0", "QD:0", "QC:0", "5D:0"]),
        ("Q", ["QS:0", "QS:0"]),
        ("Q", ["KS:0"]),  # another player's card
        ("Z", ["QS:0"]),
        ("", ["QS:0"]),
    ]:
        with pytest.raises(RuleError):
            play(state, "a", rank, *cards)
    assert json.dumps(state, sort_keys=True) == before
    state = play(state, "a", "Q", "QS:0", "QH:0", "QD:0", "QC:0")
    assert len(state["pile"]) == 4
    # With a short hand the most you can play is what you hold.
    short = rigged({"a": ["QS:0", "QH:0"], "b": ["7S:0"], "c": ["KS:0"]})
    assert {o.maximum for o in ENGINE.legal_actions(short, "a")} == {2}


def test_followers_keep_the_rank_or_pass_or_call():
    state = play(rigged(HANDS), "a", "Q", "QS:0", "QH:0")
    options = ENGINE.legal_actions(state, "b")
    assert [o.action.type for o in options] == ["play", "skip", "call_bluff"]
    assert [o.label for o in options] == ["Play as Queens", "Pass", "Call bluff"]
    assert options[0].action.choice == "Q" and options[0].eligible_cards == HANDS["b"]
    before = json.dumps(state, sort_keys=True)
    with pytest.raises(RuleError):
        play(state, "b", "7", "7S:0", "7H:0")  # a new rank is only for a new round
    assert json.dumps(state, sort_keys=True) == before
    state = play(state, "b", "Q", "7S:0")  # claimed as a Queen
    assert state["rank"] == "Q" and state["pile"] == ["QS:0", "QH:0", "7S:0"]
    assert state["plays"] == [{"player": "a", "count": 2}, {"player": "b", "count": 1}]
    assert ENGINE.project_view(state, "a").current_player == "c"


def test_when_everyone_else_passes_the_pile_is_set_aside_and_the_last_player_starts():
    state = play(rigged(HANDS), "a", "Q", "QS:0")
    state = play(state, "b", "Q", "QD:0")
    state = act(state, "c", "skip")
    assert state["passed"] == ["c"] and state["pile"] == ["QS:0", "QD:0"]
    state = act(state, "a", "skip")
    assert state["pile"] == [] and state["discarded"] == ["QS:0", "QD:0"]
    assert state["rank"] is None and state["plays"] == [] and state["passed"] == []
    assert ENGINE.project_view(state, "a").current_player == "b"
    assert kinds(state, "b") == ["play"] * 13
    view = ENGINE.project_view(state, "c")
    assert view.detail["pile_count"] == 0 and view.detail["discarded_count"] == 2
    assert "QS:0" not in view.model_dump_json()


def test_a_play_resets_the_passes_and_two_players_need_only_one_pass():
    state = play(rigged(HANDS), "a", "Q", "QS:0")
    state = act(state, "b", "skip")
    state = play(state, "c", "Q", "3D:0")
    assert state["passed"] == []
    state = act(state, "a", "skip")
    assert state["rank"] == "Q" and state["pile"]  # b has not passed since c played
    duel = play(rigged({"a": HANDS["a"], "b": HANDS["b"]}), "a", "Q", "QS:0")
    duel = act(duel, "b", "skip")
    assert duel["discarded"] == ["QS:0"] and duel["rank"] is None
    assert ENGINE.project_view(duel, "b").current_player == "a"


def test_calling_an_honest_play_gives_the_caller_the_whole_pile():
    state = play(rigged(HANDS), "a", "Q", "5D:0")  # a lie that nobody calls
    state = play(state, "b", "Q", "QD:0")  # honest
    state = act(state, "c", "call_bluff")
    assert state["phase"] == "reveal"
    assert state["reveal"] == {"caller": "c", "player": "b", "rank": "Q", "count": 1,
                               "truthful": True, "taker": "c", "pile_count": 2, "starter": "b"}
    # Only the called play is turned over, and only its starter may continue.
    for viewer in "abc":
        view = ENGINE.project_view(state, viewer)
        assert [card.id for card in view.community] == ["QD:0"]
        assert view.detail["reveal"]["truthful"] is True and view.detail["pile_count"] == 2
        assert ("5D:0" in view.model_dump_json()) is False
    assert [kinds(state, p) for p in "abc"] == [[], ["continue"], []]
    state = act(state, "b", "continue")
    assert state["hands"]["c"] == ["3D:0", "4C:0", "5D:0", "QD:0", "KH:0", "KS:0"]
    assert state["pile"] == [] and state["rank"] is None and state["reveal"] is None
    assert ENGINE.project_view(state, "a").current_player == "b"
    assert ENGINE.project_view(state, "a").community == []
    # The cards went into one hand; nobody else is shown them.
    assert "5D:0" not in ENGINE.project_view(state, "a").model_dump_json()
    assert "5D:0" in ENGINE.project_view(state, "c").model_dump_json()


def test_calling_a_bluff_gives_the_pile_to_the_player_who_lied_and_the_caller_starts():
    state = play(rigged(HANDS), "a", "Q", "QS:0", "QH:0")
    state = play(state, "b", "Q", "QD:0", "7S:0")  # one honest card does not save it
    state = act(state, "c", "call_bluff")
    assert state["reveal"]["truthful"] is False
    assert (state["reveal"]["taker"], state["reveal"]["starter"]) == ("b", "c")
    assert [card.id for card in ENGINE.project_view(state, "a").community] == ["QD:0", "7S:0"]
    assert kinds(state, "c") == ["continue"] and kinds(state, "b") == []
    with pytest.raises(RuleError):
        play(state, "c", "K", "KS:0")
    state = act(state, "c", "continue")
    assert sorted(state["hands"]["b"]) == sorted(["QS:0", "QH:0", "QD:0", "7S:0", "7H:0", "2C:0"])
    assert ENGINE.project_view(state, "a").current_player == "c" and kinds(state, "c") == ["play"] * 13


def last_cards():
    """a has played an honest last card; b is next and a's play has yet to stand."""
    state = rigged({"a": ["QS:0"], "b": ["7S:0", "2C:0"], "c": ["KS:0", "3D:0"]})
    state = play(state, "a", "Q", "QS:0")
    assert state["phase"] == "playing" and state["winners"] == [] and state["hands"]["a"] == []
    assert ENGINE.project_view(state, "c").detail["going_out"] == "a"
    return state


def test_an_empty_hand_wins_only_once_the_last_play_stands():
    played = play(last_cards(), "b", "Q", "7S:0")
    assert played["phase"] == "finished" and played["winners"] == ["a"]
    assert played["hands"]["b"] == ["7S:0", "2C:0"]  # the match ended before b laid a card
    passed = act(last_cards(), "b", "skip")
    assert passed["phase"] == "finished" and passed["winners"] == ["a"]
    for state in (played, passed):
        view = ENGINE.project_view(state, "b")
        assert view.current_player is None and view.winners == ["a"] and view.actions == []
        assert [(p.id, p.score) for p in view.players] == [("a", 0), ("b", 2), ("c", 2)]
        assert view.detail["going_out"] is None


def test_an_honest_last_play_that_is_called_wins_after_the_reveal():
    state = act(last_cards(), "b", "call_bluff")
    assert state["phase"] == "reveal" and state["winners"] == []
    assert state["reveal"]["truthful"] is True and kinds(state, "a") == ["continue"]
    state = act(state, "a", "continue")
    assert state["phase"] == "finished" and state["winners"] == ["a"]
    assert state["hands"]["b"] == ["2C:0", "7S:0", "QS:0"] and state["pile"] == []
    # After the finish the revealed card is in b's hand and no longer on the table.
    assert ENGINE.project_view(state, "c").community == []
    assert "QS:0" not in ENGINE.project_view(state, "c").model_dump_json()


def test_a_bluffed_last_play_that_is_called_does_not_win():
    state = rigged({"a": ["5D:0"], "b": ["7S:0", "2C:0"], "c": ["KS:0", "3D:0"]})
    state = play(state, "a", "Q", "5D:0")
    state = act(state, "b", "call_bluff")
    assert state["reveal"]["truthful"] is False and state["reveal"]["taker"] == "a"
    state = act(state, "b", "continue")
    assert state["phase"] == "playing" and state["winners"] == [] and state["hands"]["a"] == ["5D:0"]
    assert ENGINE.project_view(state, "a").current_player == "b"


def test_hands_and_the_pile_stay_private():
    state = start()
    opener = ENGINE.legal_actions(state, "a")[0]
    state = play(state, "a", "A", *opener.eligible_cards[:3])
    state = play(state, "b", "A", *state["hands"]["b"][:2])
    for viewer in state["order"]:
        view = ENGINE.project_view(state, viewer)
        assert set(view.detail) == DETAIL_KEYS and view.community == []
        assert [card.id for card in view.hand] == state["hands"][viewer]
        wire = view.model_dump_json()
        assert '"pile"' not in wire and '"hands"' not in wire and '"discarded"' not in wire
        hidden = set(state["pile"]) | {c for p in state["order"] if p != viewer
                                       for c in state["hands"][p]}
        assert not [card for card in hidden if json.dumps(card) in wire]
        # Canary: deal everything the viewer cannot see out again in another
        # order, keeping only the public counts. Same bytes.
        other = json.loads(json.dumps(state))
        others = [p for p in state["order"] if p != viewer]
        unseen = sorted(other["pile"] + sum((other["hands"][p] for p in others), []), reverse=True)
        other["pile"] = [unseen.pop() for _ in state["pile"]]
        other["last"]["cards"] = other["pile"][-len(state["last"]["cards"]):]
        for player in others:
            other["hands"][player] = [unseen.pop() for _ in state["hands"][player]]
        assert other["pile"] != state["pile"] and not unseen
        assert ENGINE.project_view(other, viewer).model_dump_json() == wire
    assert ENGINE.project_view(state, "nobody").hand == []
    assert ENGINE.project_view(state, "nobody").actions == []


def test_rejected_actions_leave_the_state_untouched():
    state = play(rigged(HANDS), "a", "Q", "QS:0")
    before = json.dumps(state, sort_keys=True)
    for player, action in [
        ("a", Action(type="call_bluff")),
        ("c", Action(type="skip")),
        ("b", Action(type="continue")),
        ("b", Action(type="play", choice="Q")),
        ("b", Action(type="play", choice="Q", cards=["QS:0"])),
        ("nobody", Action(type="skip")),
        ("b", Action(type="invented")),
    ]:
        with pytest.raises(RuleError):
            ENGINE.apply_action(state, player, action)
    assert json.dumps(state, sort_keys=True) == before
    opening = rigged(HANDS)
    for kind in ("skip", "call_bluff"):
        with pytest.raises(RuleError):
            act(opening, "a", kind)


def step(state, actor, action, version):
    people = state["order"]
    before = {p: ENGINE.project_view(state, p) for p in people}
    state = ENGINE.apply_action(state, actor, action)
    after = {p: ENGINE.project_view(state, p) for p in people}
    return state, public_move(before, after, actor, action, version)


def test_history_says_what_was_claimed_and_shows_only_the_called_play():
    state = rigged(HANDS)
    state, event = step(state, "a", Action(type="play", choice="Q", cards=["5D:0", "9C:0"]), 2)
    assert (event.type, event.label, event.count) == ("play", "Played 2 as Queens", 2)
    assert event.cards == [] and "5D" not in event.model_dump_json()
    state, event = step(state, "b", Action(type="skip"), 3)
    assert event.label == "Passed" and event.cards == []
    state, event = step(state, "c", Action(type="play", choice="Q", cards=["3D:0"]), 4)
    state, event = step(state, "a", Action(type="call_bluff"), 5)
    assert event.label == "Called bluff and was right"
    assert [card.id for card in event.cards] == ["3D:0"]  # never the two cards under it
    state, event = step(state, "a", Action(type="continue"), 6)
    assert event.label == "Moved on from the reveal" and event.cards == []
    state, event = step(state, "a", Action(type="play", choice="Q", cards=["QS:0", "QH:0"]), 7)
    state, event = step(state, "b", Action(type="call_bluff"), 8)
    assert event.label == "Called bluff and was wrong"
    assert sorted(card.id for card in event.cards) == ["QH:0", "QS:0"]


def test_history_does_not_claim_a_play_that_only_let_the_last_play_stand():
    state, event = step(last_cards(), "b", Action(type="play", choice="Q", cards=["7S:0"]), 3)
    assert state["phase"] == "finished" and event.label == "Let the last play stand"
    assert event.cards == [] and "7S" not in event.model_dump_json()


def test_bot_tells_the_truth_when_it_can_and_calls_what_cannot_be_true():
    # Following Queens with Queens in hand: an honest play of exactly those cards.
    state = play(rigged({"a": ["KS:0", "5D:0", "9C:0"], "b": ["QD:0", "QC:0", "7S:0", "2C:0"],
                         "c": ["KH:0", "3D:0"]}), "a", "Q", "5D:0")
    for seed in range(12):
        action = choose_action(ENGINE.project_view(state, "b"), "b", {"seed": seed}).action
        assert action.type in {"play", "call_bluff"}
        if action.type == "play":
            assert sorted(action.cards) == ["QC:0", "QD:0"] and action.choice == "Q"
    # Three Queens in hand and two more claimed: five Queens cannot exist.
    state = play(rigged({"a": ["KS:0", "5D:0", "9C:0"], "b": ["QD:0", "QC:0", "QH:0", "2C:0"],
                         "c": ["KH:0", "3D:0"]}), "a", "Q", "5D:0", "9C:0")
    for seed in range(12):
        assert choose_action(ENGINE.project_view(state, "b"), "b", {"seed": seed}).action.type == "call_bluff"
    # A play that empties a hand is always looked at.
    for seed in range(12):
        decision = choose_action(ENGINE.project_view(last_cards(), "b"), "b", {"seed": seed})
        assert decision.action.type == "call_bluff"
    # Starting a round: the rank it holds most of, honestly.
    opening = rigged({"a": ["7S:0", "7H:0", "7D:0", "2C:0"], "b": ["QD:0"], "c": ["KH:0"]})
    action = choose_action(ENGINE.project_view(opening, "a"), "a").action
    assert (action.type, action.choice, sorted(action.cards)) == ("play", "7", ["7D:0", "7H:0", "7S:0"])


def test_bot_never_bluffs_its_last_card_and_bluffs_at_most_one():
    state = play(rigged({"a": ["KS:0", "5D:0", "9C:0"], "b": ["2C:0"], "c": ["KH:0", "3D:0"]}),
                 "a", "Q", "5D:0")
    seen = Counter()
    for seed in range(40):
        action = choose_action(ENGINE.project_view(state, "b"), "b", {"seed": seed}).action
        seen[action.type] += 1
    assert seen["play"] == 0 and seen["skip"]
    state = play(rigged({"a": ["KS:0", "5D:0", "9C:0"], "b": ["2C:0", "4D:0", "4S:0"],
                         "c": ["KH:0", "3D:0"]}), "a", "Q", "5D:0")
    bluffs = [a for a in (choose_action(ENGINE.project_view(state, "b"), "b", {"seed": s}).action
                          for s in range(40)) if a.type == "play"]
    assert bluffs and all(a.cards == ["2C:0"] for a in bluffs)


def test_bot_decisions_ignore_cards_it_cannot_see():
    state = start()
    state = play(state, "a", "A", *state["hands"]["a"][:2])
    other = json.loads(json.dumps(state))
    other["pile"], other["last"]["cards"] = other["hands"]["c"][:2], other["hands"]["c"][:2]
    other["hands"]["c"] = state["pile"] + other["hands"]["c"][2:]
    first, second = ENGINE.project_view(state, "b"), ENGINE.project_view(other, "b")
    assert first == second
    assert choose_action(first, "b", {"seed": 9}) == choose_action(second, "b", {"seed": 9})


@pytest.mark.parametrize("seats", [2, 4, 6])
def test_bot_matches_keep_all_fifty_two_cards(seats):
    players = [f"p{i}" for i in range(seats)]
    state = ENGINE.setup(players, {}, seed=seats)
    memory = {p: {"seed": f"bluff:{p}"} for p in players}
    for _ in range(4000):
        if state["phase"] == "finished":
            break
        actor = ENGINE.project_view(state, players[0]).current_player
        decision = choose_action(ENGINE.project_view(state, actor), actor, memory[actor])
        memory[actor] = decision.memory
        state = ENGINE.apply_action(state, actor, decision.action)
        assert every_card(state) == Counter(standard_deck())
    assert state["phase"] == "finished" and len(state["winners"]) == 1
    assert state["hands"][state["winners"][0]] == []


def test_a_bot_leaves_the_reveal_up_before_continuing():
    human, bot = "human-1", f"bot:{1:032x}"
    state = play(rigged({human: ["QS:0", "5D:0"], bot: ["7S:0", "2C:0"]}), human, "Q", "5D:0")
    state = act(state, bot, "call_bluff")
    assert state["reveal"]["starter"] == bot
    members = [Member(room_id="room", user_id=bot, is_bot=True, seated=True)]
    assert bot_delay(ENGINE, state, members) == BOT_REVIEW_DELAY_SECONDS["continue"]
