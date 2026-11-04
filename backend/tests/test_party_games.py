"""Independent party-round expectations, locked decisions and full rotations."""

import random

import pytest

from app.core.contracts import Action, RuleError
from app.games.party.engine import PartyEngine
from app.games.party.prompts import HOT_SEAT, LIKELY, SPILL

MODES = ("spill-or-chill", "most-likely", "hot-seat")


@pytest.mark.parametrize("prompts", [SPILL, LIKELY, HOT_SEAT])
def test_original_prompt_catalogue_has_48_distinct_complete_entries(prompts):
    assert len(prompts) == len(set(prompts)) == 48
    assert all(len(prompt) > 15 for prompt in prompts if isinstance(prompt, str))
    if isinstance(prompts[0], tuple):
        assert all(len(prompt) == 3 and all(len(part) > 10 for part in prompt) for prompt in prompts)


@pytest.mark.parametrize("mode", MODES)
@pytest.mark.parametrize("count", [3, 10])
@pytest.mark.parametrize("sips", [False, True])
def test_full_match_balanced_spotlight_prompt_uniqueness_results_and_purity(mode, count, sips):
    engine = PartyEngine(mode)
    players = [f"p{i}" for i in range(count)]
    state = engine.setup(players, {"sip_prompts": sips}, seed=42)
    assert engine.setup(players, {"sip_prompts": sips}, seed=42) == state
    randomizer = random.Random(71)
    seen, spotlight = [], []
    rounds = set()
    for _ in range(300):
        view = engine.project_view(state, players[0])
        if view.detail["round"] not in rounds:
            rounds.add(view.detail["round"])
            seen.append(view.detail["prompt"])
            spotlight.append(view.detail["spotlight"])
        assert view.detail["sip_prompts"] == sips
        if state["phase"] == "finished":
            break
        actor = view.current_player
        options = engine.legal_actions(state, actor)
        assert options
        before = engine.copy(state)
        state = engine.apply_action(state, actor, randomizer.choice(options).action)
        assert before != state
        # Internal references must not cross snapshots.
        assert before["decisions"] is not state["decisions"]
    assert state["phase"] == "finished"
    assert len(seen) == len(set(seen)) == count * 2
    assert all(spotlight.count(player) == 2 for player in players)
    assert len(state["history"]) == count * 2
    assert state["winners"] == [p for p in players if state["scores"][p] == max(state["scores"].values())]
    assert engine.outcome(state) == state["winners"]
    assert all(not engine.legal_actions(state, p) for p in players)
    with pytest.raises(RuleError):
        engine.apply_action(state, players[0], Action(type="next_prompt"))


def test_spill_share_and_chill_award_equal_points_pass_does_not_require_sip():
    engine = PartyEngine("spill-or-chill")
    state = engine.setup(["a", "b", "c"], {"sip_prompts": True}, seed=1)
    with pytest.raises(RuleError):
        engine.apply_action(state, "b", Action(type="respond", choice="share"))
    original = engine.copy(state)
    state = engine.apply_action(state, "a", Action(type="respond", choice="share"))
    assert original["scores"] == {"a": 0, "b": 0, "c": 0}
    assert state["scores"] == {"a": 1, "b": 0, "c": 0}
    state = engine.apply_action(state, "a", Action(type="next_prompt"))
    state = engine.apply_action(state, "b", Action(type="respond", choice="chill"))
    assert state["scores"] == {"a": 1, "b": 1, "c": 0}
    state = engine.apply_action(state, "b", Action(type="next_prompt"))
    state = engine.apply_action(state, "c", Action(type="respond", choice="pass"))
    assert state["scores"] == {"a": 1, "b": 1, "c": 0}
    assert state["result"]["answer"] == "pass"


def test_votes_can_arrive_out_of_turn_stay_private_lock_and_tied_leaders_score():
    engine = PartyEngine("most-likely")
    state = engine.setup(["a", "b", "c", "d"], {}, seed=2)
    state = engine.apply_action(state, "d", Action(type="vote", target="b"))
    other_vote = engine.setup(["a", "b", "c", "d"], {}, seed=2)
    other_vote = engine.apply_action(other_vote, "d", Action(type="vote", target="c"))
    assert engine.project_view(state, "a") == engine.project_view(other_vote, "a")
    hidden = engine.project_view(state, "a").model_dump()
    assert hidden["detail"]["result"] is None and hidden["detail"]["own_choice"] is None
    assert "deck" not in hidden["detail"] and "history" not in hidden["detail"]
    assert engine.project_view(state, "d").detail["own_choice"] == "b"
    with pytest.raises(RuleError):
        engine.apply_action(state, "d", Action(type="vote", target="a"))
    for player, target in [("a", "b"), ("b", "a"), ("c", "a")]:
        state = engine.apply_action(state, player, Action(type="vote", target=target))
    assert state["result"]["tallies"] == {"a": 2, "b": 2, "c": 0, "d": 0}
    assert state["scores"] == {"a": 1, "b": 1, "c": 0, "d": 0}
    assert engine.project_view(state, "a").detail["result"] == state["result"]
    with pytest.raises(RuleError):
        engine.apply_action(state, "d", Action(type="next_prompt"))


def test_vote_target_self_forged_choice_and_outsider_are_rejected():
    engine = PartyEngine("most-likely")
    state = engine.setup(["a", "b", "c"], {})
    for actor, action in [
        ("a", Action(type="vote", target="a")),
        ("a", Action(type="vote", target="outsider")),
        ("a", Action(type="vote", choice="b")),
        ("outsider", Action(type="vote", target="a")),
        ("a", Action(type="vote", target="b", amount=99)),
    ]:
        with pytest.raises(RuleError):
            engine.apply_action(state, actor, action)


def test_hot_seat_answers_and_predictions_are_secret_until_every_decision_arrives():
    engine = PartyEngine("hot-seat")
    state = engine.setup(["a", "b", "c"], {}, seed=3)
    other = engine.copy(state)
    state = engine.apply_action(state, "a", Action(type="choose", choice="a"))
    other = engine.apply_action(other, "a", Action(type="choose", choice="b"))
    assert engine.project_view(state, "b") == engine.project_view(other, "b")
    assert engine.project_view(state, "a").detail["own_choice"] == "a"
    state = engine.apply_action(state, "c", Action(type="predict", choice="b"))
    assert state["phase"] == "predict" and state["scores"] == {"a": 0, "b": 0, "c": 0}
    state = engine.apply_action(state, "b", Action(type="predict", choice="a"))
    assert state["phase"] == "reveal" and state["scores"] == {"a": 0, "b": 1, "c": 0}
    assert state["result"]["answer"] == "a"
    with pytest.raises(RuleError):
        engine.apply_action(engine.setup(["a", "b", "c"], {}), "a", Action(type="predict", choice="a"))


def test_hot_seat_pass_means_no_points_even_when_predictions_match_each_other():
    engine = PartyEngine("hot-seat")
    state = engine.setup(["a", "b", "c"], {})
    for actor, kind, choice in [("b", "predict", "a"), ("a", "choose", "pass"), ("c", "predict", "a")]:
        state = engine.apply_action(state, actor, Action(type=kind, choice=choice))
    assert state["scores"] == {"a": 0, "b": 0, "c": 0}


@pytest.mark.parametrize("mode", MODES)
def test_all_pass_match_finishes_with_everyone_tied(mode):
    engine = PartyEngine(mode)
    state = engine.setup(["a", "b", "c"], {})
    while state["phase"] != "finished":
        actor = engine.project_view(state, "a").current_player
        options = engine.legal_actions(state, actor)
        action = next((o.action for o in options if o.action.choice == "pass"), options[0].action)
        state = engine.apply_action(state, actor, action)
    assert state["winners"] == ["a", "b", "c"]
    assert not any(state["scores"].values())


@pytest.mark.parametrize("mode", MODES)
def test_seat_limits_unique_identity_and_sip_default(mode):
    engine = PartyEngine(mode)
    for players in [["a", "b"], ["a"] * 3, [str(i) for i in range(11)]]:
        with pytest.raises(RuleError):
            engine.setup(players, {})
    assert not engine.project_view(engine.setup(["a", "b", "c"], {}), "a").detail["sip_prompts"]


@pytest.mark.parametrize("mode", ["most-likely", "hot-seat"])
def test_undecided_players_keep_their_instruction_after_others_lock_in(mode):
    engine = PartyEngine(mode)
    players = ["a", "b", "c"]
    state = engine.setup(players, {}, seed=5)
    start = engine.project_view(state, "b").message
    option = engine.legal_actions(state, "a")[0].action
    state = engine.apply_action(state, "a", option)
    view = engine.project_view(state, "b")
    # Someone else's lock-in never tells an undecided player their decision is locked.
    assert view.actions and view.message == start and "locked" not in view.message.lower()


def test_spill_or_chill_instruction_states_the_scoring():
    state = PartyEngine("spill-or-chill").setup(["a", "b", "c"], {}, seed=3)
    assert "+1" in state["message"] and "Pass scores nothing" in state["message"]
