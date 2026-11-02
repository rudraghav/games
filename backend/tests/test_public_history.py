"""Cross-family public history and adversarial projection privacy boundaries."""

import json
import random

import pytest
from test_playthroughs import choose

from app.core.contracts import Action, CardView, GameView, PlayerView
from app.games.registry import ENGINES
from app.rooms.public_history import LABELS, family, public_move


def view(game="deal", *, hand=None, community=None, drawn=None, detail=None):
    return GameView(
        game_id=game, phase="playing", current_player="p",
        players=[PlayerView(id="p", count=3, chips=50), PlayerView(id="q", count=3, chips=50)],
        hand=hand or [], community=community or [], drawn=drawn, detail=detail or {},
    )


def both(v):
    return {"p": v, "q": v.model_copy(update={"hand": []})}


@pytest.mark.parametrize("game_id", list(ENGINES))
def test_every_registered_game_has_real_legal_move_history_without_copying_private_fields(game_id):
    engine = ENGINES[game_id]
    assert family(game_id) in LABELS
    people = [f"player-{i}" for i in range(engine.manifest.min_players)]
    state = engine.setup(people, {s.key: s.default for s in engine.manifest.settings}, seed=71)
    rng = random.Random(73)
    events = []
    for version in range(2, 26):
        before = {p: engine.project_view(state, p) for p in people}
        actor = before[people[0]].current_player
        if actor is None or not before[actor].actions:
            break
        action = choose(before[actor], rng)
        state = engine.apply_action(state, actor, action)
        after = {p: engine.project_view(state, p) for p in people}
        event = public_move(before, after, actor, action, version)
        assert event is not None
        assert event.actor_id == actor and event.version == version
        assert event.type == action.type and event.label != "Made a move", (game_id, action.type)
        assert len(event.cards) <= 12
        assert set(event.targets) <= set(people)
        encoded = event.model_dump()
        assert not {"hand", "detail", "actions", "message", "deck", "seed", "question"} & encoded.keys()
        events.append(event)
        if state["phase"] == "finished":
            break
    assert events, game_id


@pytest.mark.parametrize("game", ["hot-seat", "most-likely", "spill-or-chill", "six-nimmt", "tarot"])
def test_private_locked_choices_do_not_copy_submitted_ids_text_targets_or_own_projection(game):
    secret = CardView(id="PRIVATE_CARD_CANARY", label="PRIVATE_FACE_CANARY", value="secret")
    v = view(game, hand=[secret], detail={"own_choice": "PRIVATE_TEXT_CANARY", "question": "PRIVATE_QUESTION_CANARY"})
    action_type = "pick" if game == "tarot" else "select_number" if game == "six-nimmt" else "vote"
    action = Action(type=action_type, choice="PRIVATE_TEXT_CANARY", card=secret.id, cards=[secret.id], target="q")
    result = public_move(both(v), both(v), "p", action, 3)
    assert result is not None
    assert "PRIVATE" not in result.model_dump_json()
    assert result.cards == [] and result.targets == []


def test_only_a_face_visible_identically_to_every_participant_enters_history():
    secret = CardView(id="private", label="PRIVATE_FACE", color="red")
    ordinary = view("holdem", hand=[secret], community=[secret], detail={"arbitrary": secret.model_dump()})
    others = ordinary.model_copy(update={"hand": [], "community": []})
    event = public_move({"p": ordinary, "q": others}, {"p": ordinary, "q": others}, "p", Action(type="call", card=secret.id), 2)
    assert event is not None and event.cards == []
    assert "PRIVATE_FACE" not in event.model_dump_json()
    # An otherwise equal ID with a private role/color does not satisfy visibility.
    different = ordinary.model_copy(update={"community": [secret.model_copy(update={"color": "unknown", "label": "Unknown"})]})
    event = public_move(both(ordinary), {"p": ordinary, "q": different}, "p", Action(type="call"), 3)
    assert event is not None
    assert event.cards == []


def test_public_payment_records_only_real_assets_amount_and_announced_creditor():
    money = CardView(id="bank", label="Money", value="4M")
    v = view(detail={"pending_action": {"actor": "q", "target": "p"}})
    v.players[0].bank = [money]
    event = public_move(both(v), both(v), "p", Action(type="pay", cards=[money.id, "PRIVATE_CARD_CANARY"]), 5)
    assert event is not None
    assert event.amount == 4 and event.targets == ["q"]
    assert [c.id for c in event.cards] == [money.id]
    assert "PRIVATE" not in event.model_dump_json()


def test_a_private_draw_never_logs_the_drawn_face_and_a_public_discard_take_can():
    secret = CardView(id="secret", label="PRIVATE_SKYJO_FACE", value="12")
    v = view("skyjo")
    after = v.model_copy(update={"drawn": secret})
    event = public_move(both(v), {"p": after, "q": v}, "p", Action(type="draw_stock"), 4)
    assert event is not None and event.cards == [] and event.count == 1
    assert "PRIVATE_SKYJO_FACE" not in event.model_dump_json()
    v.discard = secret
    event = public_move(both(v), {"p": after, "q": view("skyjo")}, "p", Action(type="draw_discard"), 5)
    assert event is not None and event.cards == [secret]


def test_spymaster_key_is_private_but_a_committed_word_reveal_can_be_recorded():
    key = CardView(id="0", label="Harbor", color="assassin", subtitle="hidden")
    unknown = key.model_copy(update={"color": "unknown"})
    spy, operative = view("word-agents", community=[key]), view("word-agents", community=[unknown])
    before = {"p": spy, "q": operative}
    event = public_move(before, before, "p", Action(type="end_guesses"), 3)
    assert event is not None and event.cards == []
    revealed = key.model_copy(update={"subtitle": "revealed"})
    after = both(view("word-agents", community=[revealed]))
    event = public_move(before, after, "q", Action(type="guess", choice="0"), 4)
    assert event is not None and event.cards == [revealed]


def test_shithead_burned_and_failed_flip_faces_come_only_from_explicit_public_last_play():
    ten = CardView(id="ten", label="10 of spades", value="10", suit="♠")
    before = both(view("shithead", hand=[ten]))
    burned = both(view("shithead", detail={"last_play": {"cards": [ten.model_dump()], "type": "burn"}}))
    event = public_move(before, burned, "p", Action(type="play", cards=[ten.id]), 5)
    assert event is not None and event.cards == [ten]
    failed = both(view("shithead", detail={"last_play": {"card": ten.model_dump(), "type": "failed_flip"}}))
    event = public_move(before, failed, "p", Action(type="flip", slot=2), 6)
    assert event is not None and event.cards == [ten]


def test_public_reveal_is_bounded_and_unknown_future_moves_fail_closed():
    before = both(view("blackjack"))
    cards = [CardView(id=str(i), label=f"Card {i}", value=str(i)) for i in range(25)]
    event = public_move(before, both(view("blackjack", community=cards)), "p", Action(type="hit"), 3)
    assert event is not None and event.count == 25 and len(event.cards) == 12
    unknown = public_move(before, before, "p", Action(type="secret_future_move", choice="PRIVATE_CANARY", target="q"), 4)
    assert unknown is not None
    assert unknown.type == "move" and unknown.label == "Made a move"
    assert "PRIVATE" not in json.dumps(unknown.model_dump())
    assert public_move(before, before, "outsider", Action(type="hit"), 5) is None


def test_number_selections_stay_private_until_everyone_has_locked():
    engine = ENGINES["six-nimmt"]
    players = ["p", "q"]
    state = engine.setup(players, {}, seed=71)
    before = {p: engine.project_view(state, p) for p in players}
    first = before["p"].actions[0].action
    state = engine.apply_action(state, "p", first)
    after = {p: engine.project_view(state, p) for p in players}
    event = public_move(before, after, "p", first, 2)
    assert event is not None and event.cards == [] and event.label == "Locked a number"
    assert first.card not in event.model_dump_json()
    before = after
    second = before["q"].actions[0].action
    state = engine.apply_action(state, "q", second)
    after = {p: engine.project_view(state, p) for p in players}
    event = public_move(before, after, "q", second, 3)
    assert event is not None and event.label == "Everyone’s numbers were revealed"
    assert {first.card, second.card} <= {card.id for card in event.cards}


def test_board_history_uses_each_games_actual_coordinate_system():
    cases = [
        ("checkers", Action(type="move", choice="42:35"), "C3 → D4"),
        ("reversi", Action(type="place", choice="19"), "D3"),
        ("boop", Action(type="place", choice="8", color="kitten"), "C2"),
        ("boop", Action(type="graduate", choice="6,7,8"), "A2, B2, C2"),
        ("four-in-a-row", Action(type="drop", choice="4"), "Column 5"),
    ]
    for game, action, destination in cases:
        projections = both(view(game))
        event = public_move(projections, projections, "p", action, 2)
        assert event is not None and event.destination == destination


def test_public_resource_and_tile_labels_do_not_mislabel_their_counts_as_cards():
    before = both(view("azul", detail={"draft": []}))
    after = both(view("azul", detail={"draft": ["blue", "blue", "blue"]}))
    event = public_move(before, after, "p", Action(type="draft_tiles", color="blue", choice="0"), 2)
    assert event is not None and event.label == "Drafted 3 tiles" and event.count is None
    assert event.destination == "Blue · factory 1"
    projections = both(view("gem-market"))
    event = public_move(projections, projections, "p", Action(type="take", choice="ruby,pearl,onyx"), 3)
    assert event is not None and event.label == "Took ruby, pearl, onyx" and event.count is None
