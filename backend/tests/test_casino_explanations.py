"""Authoritative explanation parity and privacy; constructed hands are capability fixtures."""

from copy import deepcopy

import pytest
from test_table_rules import blackjack_scenario

from app.core.cards import poker_rank
from app.core.contracts import Action
from app.core.poker_explanation import explain_poker_hand
from app.games.blackjack.engine import BlackjackEngine
from app.games.holdem.engine import HoldemEngine
from app.games.rummy.engine import RummyEngine
from app.games.rummy.melds import deadwood, hand_analysis, valid_declaration
from app.games.skyjo.engine import SkyjoEngine
from app.games.teen_patti.engine import TeenPattiEngine
from app.games.the_gang.engine import GangEngine


def test_rummy_witness_covers_exactly_the_remaining_hand_and_uses_scoring_gate():
    cards = [c + ':0' for c in ['AS', '2S', '3S', '4H', '5H', '6H', '7H',
                               '8S', '8H', '8D', 'KC', 'KD', 'KH', 'TS']]
    analysis = hand_analysis(cards, '9', omit=13)
    assert analysis['valid'] and analysis['deadwood'] == 0
    groups = [group['cards'] for group in analysis['melds']]
    assert valid_declaration(cards[:-1], '9', groups)
    assert sorted(sum(groups, [])) == sorted(cards[:-1])
    assert not analysis['unmatched']
    # Wild rank used as its natural rank is still a pure sequence.
    assert hand_analysis(cards, '2', omit=13)['pure_sequence_count'] >= 1
    one_sequence = [c + ':0' for c in ['2S', '3S', '4S', '7H', '7D', '7C',
                                      '9H', '9D', '9C', 'JH', 'JD', 'JC', 'KH']]
    blocked = hand_analysis(one_sequence, 'A')
    assert not blocked['scoring_gate'] and blocked['deadwood'] == 80
    two_sequences = [*one_sequence[:3], '5H:0', '6H:0', '7H:0', *one_sequence[6:]]
    allowed = hand_analysis(two_sequences, 'A')
    assert allowed['scoring_gate'] and allowed['deadwood'] == 10
    assert allowed['unmatched'] == ['KH:0']


def test_rummy_previews_match_adjudication_and_never_depend_on_hidden_cards():
    engine = RummyEngine()
    state = engine.setup(['a', 'b'], {}, seed=31)
    state = engine.apply_action(state, 'a', Action(type='draw_stock'))
    view = engine.project_view(state, 'a')
    previews = view.detail['discard_analyses']
    for card, analysis in previews.items():
        remainder = [c for c in state['hands']['a'] if c != card]
        assert analysis['valid'] == valid_declaration(remainder, state['wild'])
        assert analysis['deadwood'] == deadwood(remainder, state['wild'])
    altered = deepcopy(state)
    altered['hands']['b'][0], altered['deck'][0] = altered['deck'][0], altered['hands']['b'][0]
    assert engine.project_view(altered, 'a') == view
    assert engine.project_view(state, 'spectator').detail['analysis'] is None
    assert engine.project_view(state, 'b').detail['discard_analyses'] == {}
    if not state['discard'][-1].startswith('JK') and state['discard'][-1][0] != state['wild']:
        fresh = engine.setup(['a', 'b'], {}, seed=31)
        fresh = engine.apply_action(fresh, 'a', Action(type='draw_discard'))
        assert fresh['open_pickup'] not in engine.project_view(fresh, 'a').detail['discard_analyses']


def test_blackjack_split_active_context_is_viewer_specific_and_hole_card_stays_private():
    engine = BlackjackEngine()
    state = engine.setup(['a', 'b'], {}, seed=31)
    state.update(phase='playing', dealer=['TS:0', '7H:0'], hand_index=1)
    hand = {'cards': ['8S:0', '6H:0'], 'bet': 10, 'done': False, 'split': True}
    state['players']['a']['hands'] = [dict(hand, done=True), hand]
    state['players']['b']['hands'] = [dict(hand, cards=['3S:0', '4H:0'], split=False)]
    a, b = engine.project_view(state, 'a'), engine.project_view(state, 'b')
    assert a.detail['active_hand_index'] == 1 and b.detail['active_hand_index'] is None
    assert a.detail['settlements'] == {} and a.detail['dealer_natural'] is None
    assert all(h['settlement'] is None for h in a.detail['hands'])
    changed = deepcopy(state)
    changed['dealer'][1] = 'AH:0'
    assert engine.project_view(changed, 'a') == a


@pytest.mark.parametrize('split', [False, True])
def test_blackjack_ledger_reconciles_natural_and_split_twenty_one(split):
    engine, state = blackjack_scenario(['TS:0', '7H:0'],
                                       ['TH:0', 'TD:0'] if split else ['AS:0', 'KD:0'],
                                       ['AS:0', 'AH:0'] if split else [])
    if split:
        state = engine.apply_action(state, 'a', Action(type='split'))
    ledger = engine.project_view(state, 'a').detail['settlements']['a']
    assert ledger['net'] == (20 if split else 15)
    assert sum(h['settlement']['net'] for h in ledger['hands']) == ledger['net']
    assert all(h['settlement']['natural'] is (not split) for h in ledger['hands'])
    assert all(h['settlement']['outcome'] == ('win' if split else 'blackjack') for h in ledger['hands'])


def test_blackjack_insurance_is_separate_from_the_natural_push():
    engine, state = blackjack_scenario(['AS:0', 'KH:0'], ['AH:0', 'KD:0'])
    state = engine.apply_action(state, 'a', Action(type='accept'))
    ledger = engine.project_view(state, 'a').detail['settlements']['a']
    assert ledger['hands'][0]['settlement']['net'] == 0
    assert ledger['hands'][0]['settlement']['outcome'] == 'push'
    assert ledger['insurance'] == {'stake': 5, 'payout': 15, 'net': 10}
    assert ledger['net'] == 10


def test_holdem_unequal_stack_capability_fixture_explains_pots_refund_and_folded_privacy():
    engine = HoldemEngine()
    state = engine.setup(['a', 'b', 'c'], {}, seed=31)
    # Unequal commitments are an explicit capability fixture, not natural room evidence.
    state['board'] = ['2S:0', '3H:0', '4D:0', '9C:0', 'TH:0']
    state['players']['a'].update(cards=['AS:0', '5S:0'], total=20, chips=180)
    state['players']['b'].update(cards=['KS:0', 'KH:0'], total=100, chips=100)
    state['players']['c'].update(total=60, chips=140, folded=True)
    before = engine.project_view(state, 'a').detail
    assert before['live_pots'] == [
        {'amount': 60, 'contributors': ['a', 'b', 'c'], 'eligible': ['a', 'b'], 'refund_to': None},
        {'amount': 80, 'contributors': ['b', 'c'], 'eligible': ['b'], 'refund_to': None},
        {'amount': 40, 'contributors': ['b'], 'eligible': ['b'], 'refund_to': 'b'},
    ]
    assert before['hand_evaluations'] == {}
    engine._settle(state, True)
    view = engine.project_view(state, 'a')
    data = view.detail
    assert [pot['awards'] for pot in data['pots']] == [{'a': 60}, {'b': 80}]
    assert data['refunds'] == {'b': 40} and data['live_pots'] == []
    assert set(data['hand_evaluations']) == {'a', 'b'} and not view.players[2].cards
    assert data['hand_evaluations']['a']['description'] == '5-high straight'
    assert sum(p['chips'] for p in state['players'].values()) == 600


def test_holdem_tie_ledger_records_exact_awards_and_clockwise_odd_chip():
    engine = HoldemEngine()
    state = engine.setup(['a', 'b', 'c'], {}, seed=31)
    state['board'] = ['AS:0', 'KS:0', 'QS:0', 'JS:0', 'TS:0']
    for p in state['players'].values():
        p.update(total=5, chips=195)
    state['players']['c']['folded'] = True
    engine._settle(state, True)
    pot = engine.project_view(state, 'a').detail['pots'][0]
    assert pot['awards'] == {'b': 8, 'a': 7} and pot['odd_chips'] == ['b']


def test_poker_explanation_uses_evaluator_for_wheel_and_kicker():
    cards = ['AS:0', '2H:0', '3D:0', '4C:0', '5S:0', 'KH:0', 'QD:0']
    value = explain_poker_hand(cards)
    assert value['comparison'] == [5] and value['description'] == '5-high straight'
    assert poker_rank([card['id'] for card in value['cards']]) == poker_rank(cards)
    paired = explain_poker_hand(['AS:0', 'AH:0', 'KS:0', 'QD:0', 'JC:0', '9C:0', '2H:0'])
    assert paired['comparison'] == [14, 13, 12, 11]
    assert 'kickers king, queen, jack' in paired['description']


def test_teen_patti_seen_and_sideshow_context_are_public_but_cards_are_not():
    engine = TeenPattiEngine()
    state = engine.setup(['a', 'b', 'c'], {}, seed=31)
    for p in state['order']:
        state = engine.apply_action(state, p, Action(type='peek'))
        state = engine.apply_action(state, p, Action(type='bet', amount=2))
    assert engine.project_view(state, 'a').detail['sideshow_target'] == 'c'
    state = engine.apply_action(state, 'a', Action(type='sideshow'))
    for p in ['a', 'b', 'c']:
        view = engine.project_view(state, p)
        assert view.detail['seen'] == {'a': True, 'b': True, 'c': True}
        assert view.detail['sideshow'] == {'actor': 'a', 'target': 'c', 'cost': 2}
        assert not any(person.cards for person in view.players)
        assert len(view.hand) == 3
    state = engine.apply_action(state, 'c', Action(type='decline'))
    assert engine.project_view(state, 'a').detail['sideshow'] is None


@pytest.mark.parametrize('count', [2, 8])
def test_skyjo_final_queue_is_turn_order_and_completed_ledger_reconciles(count):
    engine = SkyjoEngine()
    players = [str(i) for i in range(count)]
    state = engine.setup(players, {}, seed=31)
    closing = count - 1
    state.update(phase='reveal', turn=closing)
    state['grids'] = {p: [f'sky:2:{i}'] + [None] * 11 for i, p in enumerate(players)}
    state['revealed'] = {p: [False] * 12 for p in players}
    state = engine.apply_action(state, players[closing], Action(type='reveal', slot=0))
    assert engine.project_view(state, '0').detail['remaining'] == players[:closing]
    assert engine.project_view(state, '0').detail['round_ledger'] == {}
    for i, p in enumerate(players[:closing]):
        state = engine.apply_action(state, p, Action(type='draw_stock'))
        state = engine.apply_action(state, p, Action(type='discard'))
        state = engine.apply_action(state, p, Action(type='reveal', slot=0))
        assert engine.project_view(state, p).detail['remaining'] == players[i + 1:closing]
    data = engine.project_view(state, '0').detail
    assert data['round_ledger'][players[closing]]['multiplier'] == 2
    for p, row in data['round_ledger'].items():
        assert row['grid_total'] * row['multiplier'] == row['round_points']
        assert row['round_points'] == state['round_scores'][p]
        assert row['total_points'] == state['scores'][p]


def test_gang_explanations_only_reveal_public_hands_and_explain_the_inversion():
    engine = GangEngine()
    state = engine.setup(['a', 'b', 'c'], {}, seed=31)
    state.update(phase='showdown', street=3, chips={'a': 1, 'b': 2, 'c': 3},
                 board=['2S:0', '3H:0', '4D:0', '9C:0', 'TH:0'],
                 hands={'a': ['AS:0', '5S:0'], 'b': ['KS:0', 'KH:0'], 'c': ['QS:0', 'QH:0']})
    before = engine.project_view(state, 'c').detail
    assert before['hand_evaluations'] == {} and before['declared_order'] == []
    state = engine.apply_action(state, 'a', Action(type='reveal_hand'))
    assert set(engine.project_view(state, 'c').detail['hand_evaluations']) == {'a'}
    assert engine.project_view(state, 'c').detail['inversions'] == []
    for p in ['b', 'c']:
        state = engine.apply_action(state, p, Action(type='reveal_hand'))
    data = engine.project_view(state, 'c').detail
    assert not data['last_success']
    assert data['declared_order'] == ['a', 'b', 'c']
    assert data['evaluated_order'] == ['c', 'b', 'a']
    assert data['inversions'] == [{'earlier': 'a', 'later': 'b'}, {'earlier': 'b', 'later': 'c'}]
    assert all(len(value['cards']) == 5 for value in data['hand_evaluations'].values())
