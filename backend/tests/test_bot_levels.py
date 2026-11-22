"""Bot difficulty: hard is the policy as it was; easy and medium slip, reproducibly."""

from collections import Counter

import pytest

from app.bots import choose_action, observe_view
from app.bots.context import Context
from app.bots.policy import (
    BOT_GAMES,
    SLIP_AVOIDS,
    SLIP_CHANCE,
    STEADY_ACTIONS,
    slip_options,
)
from app.core.contracts import validate_action
from app.games.registry import ENGINES

LEVELS = ("easy", "medium")


def decisions(game_id, level, seed=41, steps=4000, maximum=False):
    """Play one whole table at a level; yield (view, actor, memory before, decision)."""
    e = ENGINES[game_id]
    n = e.manifest.max_players if maximum else e.manifest.min_players
    players = [f"p{i}" for i in range(n)]
    s = e.setup(players, {}, seed=seed)
    memory = {p: {"seed": f"levels:{seed}:{p}"} for p in players}
    for _ in range(steps):
        if s["phase"] == "finished":
            return
        actor = e.project_view(s, players[0]).current_player
        if game_id.startswith("uno"):
            actor = next(
                (p for p in players if any(o.action.type == "uno" for o in e.legal_actions(s, p))),
                actor,
            )
        if actor is None or not e.legal_actions(s, actor):
            actor = next(p for p in players if e.legal_actions(s, p))
        view = e.project_view(s, actor)
        before = memory[actor]
        decision = choose_action(view, actor, before, level)
        yield view, actor, before, decision
        memory[actor] = decision.memory
        s = e.apply_action(s, actor, decision.action)
        if game_id in {"trio", "flip-7"}:
            for p in players:
                memory[p] = observe_view(e.project_view(s, p), p, memory[p])


def test_levels_and_their_slip_chances_are_fixed():
    assert SLIP_CHANCE == {"medium": 0.18, "easy": 0.5}
    assert "hard" not in SLIP_CHANCE
    assert STEADY_ACTIONS <= SLIP_AVOIDS
    assert {"fold", "all_in", "rearrange", "return_chip"} <= SLIP_AVOIDS - STEADY_ACTIONS


@pytest.mark.parametrize("game_id", sorted(BOT_GAMES))
def test_hard_is_exactly_the_policy_without_a_level(game_id):
    """Every decision of a whole match: same bytes, same memory, with or without "hard"."""
    count = 0
    for view, actor, memory, decision in decisions(game_id, "hard", steps=400):
        plain = choose_action(view, actor, memory)
        assert plain == decision
        assert plain.action.model_dump_json() == decision.action.model_dump_json()
        count += 1
    assert count


@pytest.mark.parametrize("game_id", sorted(BOT_GAMES))
@pytest.mark.parametrize("level", LEVELS)
def test_a_level_repeats_its_decisions_for_one_seed(game_id, level):
    first = [d.action.model_dump_json() for *_, d in decisions(game_id, level, steps=300)]
    again = [d.action.model_dump_json() for *_, d in decisions(game_id, level, steps=300)]
    assert first == again and first


@pytest.mark.parametrize("game_id", sorted(BOT_GAMES))
@pytest.mark.parametrize("level", LEVELS)
def test_slips_keep_memory_accounting_and_only_make_ordinary_legal_moves(game_id, level):
    slips = total = 0
    # A short game (a blackjack round is two or three decisions) may not slip at
    # all, so further seeded games are played until one does.
    for seed in range(41, 81):
        for view, actor, memory, decision in decisions(game_id, level, seed=seed, steps=600):
            hard = choose_action(view, actor, memory)
            total += 1
            # One decision is one step of the bot's private cursor at every level.
            assert decision.memory["step"] == hard.memory["step"]
            assert decision.memory.get("seed") == hard.memory.get("seed")
            validate_action(view.actions, decision.action)
            if decision.action == hard.action:
                assert decision.memory == hard.memory
                continue
            slips += 1
            chosen = decision.action
            # The policy's move was a real choice, and the slip is an ordinary one.
            assert hard.action.type not in STEADY_ACTIONS
            assert chosen.type not in SLIP_AVOIDS and chosen.choice != "pass"
            options = slip_options(Context(view, actor, memory))
            assert any(Context(view, actor, memory).action(o) == chosen for o in options)
            assert all(o.input in (None, "amount") for o in options)
        if slips:
            break
    assert total
    # Spill or Chill is a single honest answer: there is nothing to slip on.
    assert bool(slips) == (game_id != "spill-or-chill"), (game_id, level)


def test_easy_slips_more_often_than_medium_and_near_its_fixed_chance():
    rate = {}
    for level in LEVELS:
        eligible = slipped = 0
        for seed in (3, 5, 8, 13):
            for view, actor, memory, decision in decisions("four-in-a-row", level, seed=seed):
                hard = choose_action(view, actor, memory)
                ctx = Context(view, actor, memory)
                others = [o for o in slip_options(ctx) if ctx.action(o) != hard.action]
                if not others:
                    continue
                eligible += 1
                slipped += decision.action != hard.action
        assert eligible > 40
        rate[level] = slipped / eligible
    # A slip may land on the policy's own move, so the seen rate sits a little lower.
    assert 0.05 < rate["medium"] < 0.3 < rate["easy"] < 0.6


@pytest.mark.parametrize("level", LEVELS)
def test_reviews_reactions_and_composed_moves_are_never_replaced(level):
    seen = Counter()
    for game_id in sorted(BOT_GAMES):
        for view, actor, memory, decision in decisions(game_id, level, steps=1500, maximum=True):
            hard = choose_action(view, actor, memory)
            if hard.action.type in STEADY_ACTIONS:
                seen[hard.action.type] += 1
                assert decision == hard, (game_id, hard.action.type)
            # A slip never drops out of a hand or deal, and never passes on a prompt.
            if decision.action != hard.action:
                assert decision.action.type not in {"fold", "all_in", "rearrange", "return_chip"}
    for kind in ("continue", "next_round", "next_prompt", "next_selection", "next_heist",
                 "uno", "respond", "reveal_hand", "arrange", "clue"):
        assert seen[kind], kind


def test_a_gang_slip_takes_a_free_chip_and_never_a_crewmates():
    for level in LEVELS:
        for view, actor, memory, decision in decisions("the-gang", level, maximum=True):
            if decision.action.type != "claim_chip":
                continue
            hard = choose_action(view, actor, memory)
            if decision.action != hard.action:
                assert decision.action.amount not in set(view.detail["chips"].values())


def test_a_trio_slip_remembers_the_card_it_really_turned():
    turned = 0
    for view, actor, memory, decision in decisions("trio", "easy", maximum=True):
        hard = choose_action(view, actor, memory)
        if decision.action == hard.action or "trio_last" not in decision.memory:
            continue
        turned += 1
        last = decision.memory["trio_last"]
        action = decision.action
        assert (last["kind"], last["owner"], last["edge"]) == (
            action.type, action.target, action.choice,
        )
    assert turned
