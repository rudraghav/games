"""Word Agents projections say whose clue is current and what just happened."""

from app.core.contracts import Action
from app.games.word_agents.engine import WordAgentsEngine


def started(seed: int = 4):
    engine = WordAgentsEngine()
    players = [f"p{i}" for i in range(6)]
    state = engine.setup(players, {}, seed=seed)
    team = state["active_team"]
    state = engine.apply_action(state, players[team], Action(type="clue", choice="galactic", amount=2))
    return engine, players, state, team


def test_a_finished_clue_is_never_shown_as_the_next_teams_clue():
    engine, players, state, team = started()
    view = engine.project_view(state, players[1 - team])
    assert view.detail["clue"] == "galactic" and view.detail["clue_count"] == 2
    bystander = state["key"].index(2)
    state = engine.apply_action(state, players[2 + team], Action(type="guess", choice=str(bystander)))
    assert state["phase"] == "clue" and state["active_team"] == 1 - team
    word = state["words"][bystander].title()
    for viewer in players:
        detail = engine.project_view(state, viewer).detail
        assert detail["clue"] == "" and detail["clue_count"] == 0
        assert detail["last_clue"] == {"team": team, "clue": "galactic", "count": 2}
        assert detail["turn_end"] == "wrong"
        assert detail["last_reveal"] == {"cell": str(bystander), "word": word,
                                         "player": players[2 + team], "identity": "neutral"}
    message = engine.project_view(state, players[1 - team]).message
    assert word in message and "bystander" in message and "Give your team" in message


def test_unrevealed_identities_never_appear_in_turn_history():
    engine, players, state, team = started()
    own = state["key"].index(team)
    state = engine.apply_action(state, players[2 + team], Action(type="guess", choice=str(own)))
    state = engine.apply_action(state, players[2 + team], Action(type="end_guesses"))
    operative = engine.project_view(state, players[3 - team])
    assert operative.detail["last_reveal"]["cell"] == str(own)
    assert operative.detail["turn_end"] == "stopped"
    assert {card.color for card in operative.community if card.subtitle == "hidden"} == {"unknown"}


def test_the_assassin_ending_names_the_team_and_the_word():
    engine, players, state, team = started()
    cell = state["key"].index(3)
    state = engine.apply_action(state, players[2 + team], Action(type="guess", choice=str(cell)))
    view = engine.project_view(state, players[0])
    names = ["Red", "Blue"]
    assert view.detail["winning_team"] == 1 - team and view.detail["turn_end"] == "assassin"
    assert view.message == (f"{names[team]} revealed the assassin ({state['words'][cell].title()}). "
                            f"{names[1 - team]} team wins.")
