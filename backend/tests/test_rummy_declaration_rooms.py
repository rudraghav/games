"""Natural shuffled declarations at both seat limits, persisted through HTTP.

Only ordinary setup randomness is fixed. Policy decisions receive each actor's
HTTP projection and durable private observations, never engine/database state.
"""

from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from room_helpers import require_isolated, seated_room
from sqlalchemy import select

from app.bots import choose_action
from app.core.contracts import GameView
from app.db import sessions
from app.games.registry import ENGINES
from app.main import app
from app.models import Match, Receipt


@pytest.fixture
def client():
    require_isolated()
    with TestClient(app) as client:
        yield client


@pytest.mark.parametrize('seats', [2, 6])
def test_natural_declaration_saves_zero_sum_scores_and_survives_restart(client, monkeypatch, seats):
    engine = ENGINES['rummy']
    setup = engine.setup
    monkeypatch.setattr(engine, 'setup', lambda players, settings: setup(players, settings, seed=31))
    room, headers = seated_room(client, 'rummy', seats)
    path = f"/v1/rooms/{room['id']}"
    ids = [client.get('/v1/me', headers=h).json()['profile']['id'] for h in headers]
    actors = dict(zip(ids, headers, strict=True))
    memory = {p: {'seed': f'policy:31:p{i}'} for i, p in enumerate(ids)}
    terminal = None
    steps = 0
    for _ in range(400):
        if room['game']['phase'] == 'finished':
            break
        actor = room['game']['current_player']
        room = client.get(path, headers=actors[actor]).json()
        view = GameView.model_validate(room['game'])
        decision = choose_action(view, actor, memory[actor])
        memory[actor] = decision.memory
        assert decision.action.type != 'fold', 'This evidence must reach a declaration, not a drop.'
        if decision.action.type == 'declare':
            assert view.detail['discard_analyses'][decision.action.card]['valid']
        response = client.post(path + '/actions', headers=actors[actor], json={
            'match_id': room['match_id'], 'expected_version': room['match_version'],
            'action_id': str(uuid4()), 'action': decision.action.model_dump(),
        })
        assert response.status_code == 200, response.text
        room = response.json()
        terminal = decision.action.type
        steps += 1
    else:
        pytest.fail('Seeded legal trajectory did not reach a declaration within its bound.')
    assert terminal == 'declare' and room['status'] == 'finished'
    assert room['game']['detail']['finish_reason'] == 'valid_declaration'
    winner = room['game']['winners'][0]
    ledger = room['game']['detail']['settlements']
    assert ledger[winner]['analysis']['valid'] and ledger[winner]['analysis']['deadwood'] == 0
    assert all(result['penalty'] is None for result in ledger.values())
    scores = {p['id']: p['score'] for p in room['game']['players']}
    assert sum(scores.values()) == 0 and scores[winner] > 0
    for ident, header in zip(ids, headers, strict=True):
        history = client.get('/v1/me', headers=header).json()['history']
        result = next(item for item in history if item['id'] == room['match_id'])
        assert result['winners'] == [winner] and result['score'] == scores[ident]
    with sessions()() as db:
        saved = db.get(Match, room['match_id'])
        assert saved.result == {'winners': [winner], 'scores': scores}
        receipts = db.scalars(select(Receipt).where(Receipt.match_id == room['match_id'])).all()
        assert len(receipts) == steps
    with TestClient(app) as restarted:
        restored = restarted.get(path, headers=headers[-1]).json()
        assert restored['status'] == 'finished'
        assert restored['game']['detail']['settlements'] == ledger
        assert restored['match_version'] == room['match_version']
    print(f'Natural Rummy saved declaration: seats={seats}, seed=31, actions={steps}, zero_sum=true, restart=true')
