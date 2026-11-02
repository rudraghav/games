"""Bots make legal useful decisions using only their authorized projections."""

import json
from copy import deepcopy
from time import perf_counter

import pytest

from app.bots import choose_action, observe_view, supports_bots
from app.bots.policy import BOT_GAMES
from app.bots.words import LEXICON
from app.core.cards import card_view
from app.core.contracts import CardView, GameView, PlayerView, legal
from app.games.blackjack.engine import BlackjackEngine
from app.games.board.four import FourEngine
from app.games.board.reversi import ReversiEngine
from app.games.boop.engine import BoopEngine
from app.games.deal.engine import DealEngine
from app.games.registry import ENGINES
from app.games.rummy.engine import RummyEngine
from app.games.rummy.melds import valid_declaration
from app.games.word_agents.engine import WORDS, WordAgentsEngine


def test_registry_covers_every_multiplayer_experience_and_no_tarot_opponent():
    assert BOT_GAMES == set(ENGINES) - {"tarot"}
    assert not supports_bots("tarot")
    assert not supports_bots("unknown")


@pytest.mark.parametrize("game_id", sorted(BOT_GAMES))
def test_decisions_are_reproducible_immutable_and_memory_bounded(game_id):
    e = ENGINES[game_id]
    players = [f"p{i}" for i in range(e.manifest.min_players)]
    s = e.setup(players, {}, seed=31)
    actor = e.project_view(s, players[0]).current_player
    view = e.project_view(s, actor)
    memory = {"seed": "independent-policy-seed"}
    before = view.model_dump_json()
    old_memory = deepcopy(memory)
    one = choose_action(view, actor, memory)
    two = choose_action(view, actor, memory)
    assert one == two
    assert before == view.model_dump_json()
    assert memory == old_memory
    assert len(json.dumps(one.memory)) <= 16384
    e.apply_action(s, actor, one.action)


@pytest.mark.parametrize("game_id", sorted(BOT_GAMES))
@pytest.mark.parametrize("maximum,seed", [(False, 17), (True, 31), (False, 73), (True, 93)])
def test_bots_complete_normal_matches_at_every_seat_limit(game_id, maximum, seed):
    e = ENGINES[game_id]
    n = e.manifest.max_players if maximum else e.manifest.min_players
    players = [f"p{i}" for i in range(n)]
    s = e.setup(players, {}, seed=seed)
    memory = {p: {"seed": f"policy:{seed}:{p}"} for p in players}
    peak = 0.0
    for _ in range(4000):
        if s["phase"] == "finished":
            break
        actor = e.project_view(s, players[0]).current_player
        if game_id.startswith("uno"):
            # Own announcements are legal reactions between ordinary turns.
            # The room scheduler gives these precedence over another bot's catch.
            actor = next(
                (p for p in players if any(o.action.type == "uno" for o in e.legal_actions(s, p))),
                actor,
            )
        if actor is None or not e.legal_actions(s, actor):
            actor = next(p for p in players if e.legal_actions(s, p))
        view = e.project_view(s, actor)
        old = view.model_dump_json()
        start = perf_counter()
        decision = choose_action(view, actor, memory[actor])
        peak = max(peak, perf_counter() - start)
        assert old == view.model_dump_json()
        memory[actor] = decision.memory
        s = e.apply_action(s, actor, decision.action)
        # This observer is the only source of remembered other-turn information.
        if game_id in {"trio", "flip-7"}:
            for p in players:
                memory[p] = observe_view(e.project_view(s, p), p, memory[p])
    assert s["phase"] == "finished", (game_id, maximum, s["phase"])
    assert (
        e.outcome(s)
        or s.get("draw")
        or e.manifest.play_mode == "cooperative"
        or game_id == "blackjack"
        and all(p["profit"] <= 0 for p in s["players"].values())
    )
    assert all(len(json.dumps(value)) <= 16384 for value in memory.values())
    # Generous CI bound catches unbounded searches without a brittle ms benchmark.
    assert peak < 2.0, (game_id, peak)


def test_unseen_opponent_hands_do_not_influence_a_decision():
    e = ENGINES["uno"]
    s = e.setup(["own", "other"], {}, seed=17)
    other = deepcopy(s)
    other["hands"]["other"][0], other["deck"][0] = other["deck"][0], other["hands"]["other"][0]
    first, second = e.project_view(s, "own"), e.project_view(other, "own")
    assert first == second
    assert choose_action(first, "own", {"seed": 7}) == choose_action(second, "own", {"seed": 7})


def test_four_in_a_row_takes_a_win_and_blocks_an_immediate_loss():
    e = FourEngine()
    s = e.setup(["a", "b"], {})
    for slot in [35, 36, 37]:
        s["board"][slot] = 0
    for slot in [39, 40, 41]:
        s["board"][slot] = 1
    assert choose_action(e.project_view(s, "a"), "a").action.choice == "3"
    s["board"] = [None] * 42
    for slot in [35, 36, 37]:
        s["board"][slot] = 1
    for slot in [34, 40, 41]:
        s["board"][slot] = 0
    assert choose_action(e.project_view(s, "a"), "a").action.choice == "3"


def test_reversi_values_a_safe_corner_over_a_central_capture():
    e = ReversiEngine()
    s = e.setup(["a", "b"], {})
    s["board"][1], s["board"][2] = 1, 0
    assert len(e.legal_actions(s, "a")) > 1
    assert choose_action(e.project_view(s, "a"), "a").action.choice == "0"


@pytest.mark.parametrize(
    "hand,dealer,expected",
    [
        (["TH:0", "6S:0"], "6D:0", "stand"),
        (["TH:0", "6S:0"], "KD:0", "hit"),
        (["8H:0", "8S:0"], "KD:0", "split"),
        (["AH:0", "7S:0"], "KD:0", "hit"),
        (["AH:0", "7S:0"], "6D:0", "double"),
    ],
)
def test_blackjack_uses_hard_soft_and_pair_strategy(hand, dealer, expected):
    e = BlackjackEngine()
    s = e.setup(["a"], {}, seed=3)
    s.update(phase="playing", turn=0, hand_index=0, dealer=[dealer, "2C:0"])
    s["players"]["a"].update(
        chips=180, bet=20, hands=[{"cards": hand, "bet": 20, "done": False, "split": False}]
    )
    decision = choose_action(e.project_view(s, "a"), "a")
    assert decision.action.type == expected


def test_rummy_declares_a_real_two_sequence_hand_instead_of_folding():
    e = RummyEngine()
    s = e.setup(["a", "b"], {}, seed=3)
    s.update(phase="discard", wild="A", open_pickup=None)
    s["hands"]["a"] = [
        c + ":0"
        for c in [
            "2H",
            "3H",
            "4H",
            "5S",
            "6S",
            "7S",
            "8D",
            "8H",
            "8C",
            "9D",
            "TD",
            "JD",
            "QD",
            "KC",
        ]
    ]
    decision = choose_action(e.project_view(s, "a"), "a")
    assert decision.action.type == "declare"
    remaining = [c for c in s["hands"]["a"] if c != decision.action.card]
    assert valid_declaration(remaining, "A")
    assert e.apply_action(s, "a", decision.action)["winners"] == ["a"]


def test_deal_pays_bank_first_without_breaking_property_sets():
    view = GameView(
        game_id="deal",
        phase="playing",
        current_player="a",
        hand=[],
        players=[
            PlayerView(
                id="a",
                bank=[
                    CardView(id="cash2", label="2M", value="2M"),
                    CardView(id="cash3", label="3M", value="3M"),
                ],
                properties={
                    "brown": [
                        CardView(id="prop1", label="Brown", value="1M", suit="property"),
                        CardView(id="prop2", label="Brown", value="1M", suit="property"),
                    ]
                },
            ),
            PlayerView(id="b"),
        ],
        actions=[
            legal(
                "Select payment assets",
                "pay",
                input="cards",
                eligible_cards=["cash2", "cash3", "prop1", "prop2"],
            )
        ],
        detail={"payment_amount": 5},
    )
    assert set(choose_action(view, "a").action.cards) == {"cash2", "cash3"}


def test_deal_payment_amount_is_public_only_during_payment_selection():
    e = DealEngine()
    s = e.setup(["a", "b"], {}, seed=3)
    assert e.project_view(s, "a").detail["payment_amount"] == 0
    s["queue"] = [
        {
            "kind": "bill",
            "actor": "a",
            "target": "b",
            "amount": 5,
            "payment": True,
            "responder": "b",
            "blocked": False,
        }
    ]
    assert e.project_view(s, "b").detail["payment_amount"] == 5
    assert e.project_view(s, "a").detail["payment_amount"] == 5
    s["queue"][0]["payment"] = False
    assert e.project_view(s, "b").detail["payment_amount"] == 0


def test_deal_bot_chooses_the_specific_pile_that_completes_a_set():
    e = DealEngine()
    s = e.setup(["a", "b"], {}, seed=3)
    brown = [c.id for c in e.cards.values() if c.kind == "property" and c.colors == ("brown",)]
    s["hands"]["a"] = [brown[1]]
    s["properties"]["a"] = {"brown:0": [brown[0]]}
    for step in range(10):
        decision = choose_action(e.project_view(s, "a"), "a", {"step": step})
        assert decision.action.type == "property" and decision.action.choice == "brown:0"


def test_boop_finishes_a_public_three_adult_line():
    e = BoopEngine()
    s = e.setup(["a", "b"], {})
    s["board"][0] = {"owner": "a", "kind": "cat"}
    s["board"][1] = {"owner": "a", "kind": "cat"}
    s["retired"]["a"], s["reserve"]["a"] = 3, 5
    s["pools"]["a"] = {"kitten": 5, "cat": 1}
    decision = choose_action(e.project_view(s, "a"), "a")
    assert e.apply_action(s, "a", decision.action)["winners"] == ["a"]


def test_word_lexicon_covers_the_original_board_vocabulary():
    covered = set().union(*LEXICON.values())
    assert not set(WORDS) - covered


def test_word_operative_receives_a_clue_without_the_hidden_target_key():
    e = WordAgentsEngine()
    s = e.setup(["a", "b", "c", "d"], {}, seed=17)
    spy = e.project_view(s, s["order"][s["turn"]])
    clue = choose_action(spy, spy.current_player).action
    s = e.apply_action(s, spy.current_player, clue)
    actor = s["order"][s["turn"]]
    operative = e.project_view(s, actor)
    assert operative.detail["role"] == "operative"
    assert all(c.color == "unknown" for c in operative.community)
    assert "trio_ends" not in choose_action(operative, actor).memory
    action = choose_action(operative, actor).action
    assert action.type == "guess"
    assert operative.community[int(action.choice)].value.upper() in LEXICON[clue.choice]


def test_party_bot_does_not_claim_it_answered_aloud_or_drank():
    e = ENGINES["spill-or-chill"]
    s = e.setup(["a", "b", "c"], {}, seed=3)
    assert choose_action(e.project_view(s, "a"), "a").action.choice == "chill"


def test_gang_uses_its_own_strength_and_only_takes_a_free_chip():
    e = ENGINES["the-gang"]
    s = e.setup(["a", "b", "c"], {}, seed=17)
    view = e.project_view(s, "a")
    strong = view.model_copy(update={"hand": [card_view("AS:0"), card_view("AH:0")]})
    weak = view.model_copy(update={"hand": [card_view("7S:0"), card_view("2H:0")]})
    assert choose_action(strong, "a").action.amount == 3
    assert choose_action(weak, "a").action.amount == 1
    strong.detail["chips"]["b"] = 3
    assert choose_action(strong, "a").action.amount == 2


def test_trio_observer_remembers_public_table_cards_without_advancing_rng():
    e = ENGINES["trio"]
    s = e.setup(["a", "b", "c"], {}, seed=17)
    before = {"seed": "only-this-bot", "step": 5}
    option = next(o for o in e.legal_actions(s, "a") if o.action.type == "reveal_table")
    s = e.apply_action(s, "a", option.action)
    view = e.project_view(s, "b")
    assert not view.actions
    original = view.model_dump_json()
    memory = observe_view(view, "b", before)
    assert memory["step"] == 5
    assert memory["trio_table"][option.action.choice] == int(
        view.community[int(option.action.choice)].value
    )
    assert before == {"seed": "only-this-bot", "step": 5}
    assert view.model_dump_json() == original


def test_word_operative_decision_is_independent_of_unrevealed_key():
    e = WordAgentsEngine()
    s = e.setup(["a", "b", "c", "d"], {}, seed=17)
    spy = s["order"][s["turn"]]
    s = e.apply_action(s, spy, choose_action(e.project_view(s, spy), spy).action)
    actor = s["order"][s["turn"]]
    alternate = deepcopy(s)
    a, b = next((i, j) for i in range(25) for j in range(25) if s["key"][i] != s["key"][j])
    alternate["key"][a], alternate["key"][b] = alternate["key"][b], alternate["key"][a]
    original, changed = e.project_view(s, actor), e.project_view(alternate, actor)
    assert original == changed
    assert choose_action(original, actor) == choose_action(changed, actor)
