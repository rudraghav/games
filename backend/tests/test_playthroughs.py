"""Exercise complete matches from legal viewer decisions, at both seat limits."""

import random

import pytest

from app.games.registry import ENGINES


def choose(view, randomizer):
    options = view.actions
    if view.game_id.startswith("uno"):
        calls = [o for o in options if o.action.type == "uno"]
        plays = [o for o in options if o.action.type == "play"]
        option = randomizer.choice(calls or plays or options)
    elif view.game_id.startswith("deal") or view.game_id.startswith("monopoly"):
        properties = [o for o in options if o.action.type == "property"]
        useful = [o for o in options if o.action.type not in {"rearrange", "end_turn"}]
        option = randomizer.choice(properties or useful or options)
    elif view.game_id == "blackjack":
        option = next((o for o in options if o.action.type in {"stand", "decline"}), options[0])
    elif view.game_id in {"holdem", "teen-patti"}:
        option = next(
            (o for o in options if o.action.type in {"call", "check", "show"}), options[-1]
        )
    elif view.game_id == "rummy":
        option = next((o for o in options if o.action.type == "fold"), options[0])
    elif view.game_id == "gem-market":
        buys = [o for o in options if o.action.type == "buy"]
        option = randomizer.choice(buys or options)
    else:
        option = randomizer.choice(options)
    action = option.action
    if option.input == "amount":
        action = action.model_copy(update={"amount": option.minimum})
    elif option.input == "cards":
        action = action.model_copy(update={"cards": option.eligible_cards})
    elif option.input == "text":
        action = action.model_copy(update={"choice": "galactic"})
    return action


@pytest.mark.parametrize("game_id", [g for g in ENGINES if g != "tarot"])
@pytest.mark.parametrize("maximum", [False, True])
def test_complete_match_at_each_player_limit(game_id, maximum):
    engine = ENGINES[game_id]
    count = engine.manifest.max_players if maximum else engine.manifest.min_players
    players = [f"player-{i}" for i in range(count)]
    state = engine.setup(players, {s.key: s.default for s in engine.manifest.settings}, seed=31)
    randomizer = random.Random(73)
    for _ in range(5000):
        if state["phase"] == "finished":
            break
        turn = engine.project_view(state, players[0]).current_player
        view = engine.project_view(state, turn)
        assert view.actions, (game_id, view.phase)
        state = engine.apply_action(state, turn, choose(view, randomizer))
    assert state["phase"] == "finished", f"{game_id} did not complete within its bounded scenario"
    assert state["winners"] or state.get("draw")
    assert all(not engine.legal_actions(state, player) for player in players)
