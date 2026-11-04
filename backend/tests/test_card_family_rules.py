"""Independent rule examples and inventory invariants for the two card families."""

import hashlib
import json
import random
from collections import Counter
from copy import deepcopy
from pathlib import Path

import pytest

from app.core.contracts import Action, CardView, RuleError
from app.games.deal.deck import RENTS, make_deck, property_groups
from app.games.deal.effects import issue_debt
from app.games.deal.engine import DealEngine
from app.games.deal.payments import combine_payment_bundles, payment_bundles
from app.games.deal.table import assets, draw_cards, groups_for, place, rent
from app.games.uno.deck import COLORS, deck
from app.games.uno.engine import UnoEngine


def uno_case(mercy=False, count=3):
    engine = UnoEngine(mercy)
    players = [f"p{i}" for i in range(count)]
    state = engine.setup(players, {}, seed=19)
    state.update(
        turn=0, direction=1, color="red", pending=None, penalty=0, penalty_floor=0,
        drawn=None, catchable=None, called=[], eliminated=[], discard=["red:5:0"],
        hands={p: [] for p in players}, deck=deck(mercy),
    )
    state["deck"].remove("red:5:0")
    return engine, state


def uno_hand(state, player, cards):
    for card in cards:
        state["deck"].remove(card)
        state["hands"][player].append(card)


def deal_case(mercy=False, count=3):
    engine = DealEngine(mercy)
    players = [f"p{i}" for i in range(count)]
    state = engine.setup(players, {}, seed=19)
    state.update(
        deck=list(engine.cards), discard=[], hands={p: [] for p in players},
        banks={p: [] for p in players}, properties={p: {} for p in players},
        turn=0, queue=[], gift=None, links={}, moves=3,
    )
    return engine, state


def deal_card(engine, state, player, kind=None, action=None, color=None, zone="hands"):
    card = next(
        c for c in engine.cards.values()
        if c.id in state["deck"] and (kind is None or c.kind == kind)
        and (action is None or c.action == action)
        and (color is None or c.colors == (color,))
    )
    state["deck"].remove(card.id)
    if zone == "properties":
        place(state, player, card.id, engine.cards, color)
    else:
        state[zone][player].append(card.id)
    return card.id


def assert_inventory(engine, state):
    cards = state["deck"] + state["discard"] + sum(state["hands"].values(), [])
    if isinstance(engine, DealEngine):
        cards += sum(state["banks"].values(), [])
        cards += [c for groups in state["properties"].values() for g in groups.values() for c in g]
        if state["gift"]:
            cards.append(state["gift"]["card"])
        expected = list(engine.cards)
    else:
        expected = deck(engine.mercy)
    assert Counter(cards) == Counter(expected)


@pytest.mark.parametrize("case", json.loads(
    (Path(__file__).parent / "fixtures/deal_audit_replays.json").read_text()
))
def test_audited_natural_deal_trajectories_now_quote_actual_losses_and_allow_third_play_counter(case):
    engine = DealEngine(case["game"] == "deal-no-mercy")
    state = engine.setup(["p0", "p1", "p2"], {}, seed=case["seed"])
    for step in case["replay"]:
        state = engine.apply_action(state, step["actor"], Action.model_validate(step["action"]))
        assert_inventory(engine, state)
    player = case["player"]
    before = deepcopy(state)
    if "selected" in case:
        bundles = engine.project_view(state, player).detail["payment_bundles"]
        quote = combine_payment_bundles(bundles, case["selected"])
        assert sum(quote.values()) == case["total"]
        after = engine.apply_action(state, player, Action(type="pay", cards=case["selected"]))
        assert set(assets(state, player, engine.cards)) - set(assets(after, player, engine.cards)) == set(quote)
        assert_inventory(engine, after)
    else:
        assert state["moves"] == 0
        counter = next(o.action for o in engine.legal_actions(state, player) if o.action.type == "no")
        after = engine.apply_action(state, player, counter)
        assert after["moves"] == 0 and not after["queue"][0]["blocked"]
        responder = after["queue"][0]["responder"]
        after = engine.apply_action(after, responder, Action(type="accept"))
        assert after["turn"] == 1 and after["moves"] == 3
        assert_inventory(engine, after)
    assert state == before


def linked_payment_case(mercy=False, amount=5):
    """Inventory-conserving boundary: one linked building bundle plus other assets."""
    engine, state = deal_case(mercy)
    anchor = deal_card(engine, state, "p1", kind="property", color="red", zone="properties")
    for _ in range(2):
        deal_card(engine, state, "p1", kind="property", color="red", zone="properties")
    buildings = []
    for effect in (["shack"] if mercy else ["house", "hotel"]):
        card = deal_card(engine, state, "p1", action=effect)
        state["hands"]["p1"].remove(card)
        state["properties"]["p1"]["red:0"].append(card)
        state["links"][card] = anchor
        buildings.append(card)
    money = deal_card(engine, state, "p1", kind="money", zone="banks")
    state["queue"] = [{
        "kind": "bill", "actor": "p0", "target": "p1", "responder": "p1",
        "amount": amount, "blocked": False, "payment": True,
    }]
    return engine, state, anchor, buildings, money


@pytest.mark.parametrize("mercy", [False, True])
@pytest.mark.parametrize("selection", ["anchor", "buildings_first", "anchor_first"])
def test_payment_quote_and_commit_union_linked_buildings_independent_of_selection_order(mercy, selection):
    engine, state, anchor, buildings, _ = linked_payment_case(mercy)
    selected = [anchor] if selection == "anchor" else (
        buildings + [anchor] if selection == "buildings_first" else [anchor] + buildings
    )
    view = engine.project_view(state, "p1")
    before = deepcopy(state)
    bundles = view.detail["payment_bundles"]
    assert len(bundles) == len(assets(state, "p1", engine.cards))
    assert all(engine.project_view(state, p).detail["payment_bundles"] == [] for p in ("p0", "p2"))
    quote = combine_payment_bundles(bundles, selected)
    assert set(quote) == {anchor, *buildings}
    assert sum(quote.values()) == (6 if mercy else 10)
    after = engine.apply_action(state, "p1", Action(type="pay", cards=selected))
    assert set(assets(state, "p1", engine.cards)) - set(assets(after, "p1", engine.cards)) == set(quote)
    assert after["properties"]["p0"]["red:0"] == [anchor, *buildings]
    assert not after["banks"]["p0"]  # Explicitly selecting a carried building cannot bank it instead.
    assert not after["debts"]["p1"] and not after["queue"]
    assert state == before
    assert_inventory(engine, after)


@pytest.mark.parametrize("mercy", [False, True])
def test_payment_bank_only_building_only_insolvency_duplicate_and_nonpayable_boundaries(mercy):
    engine, state, anchor, buildings, money = linked_payment_case(mercy, amount=1)
    for selected in ([money], [buildings[0]]):
        quote = combine_payment_bundles(payment_bundles(state, "p1", engine.cards), selected)
        after = engine.apply_action(state, "p1", Action(type="pay", cards=selected))
        assert list(quote) == selected and after["banks"]["p0"] == selected
        assert anchor in after["properties"]["p1"]["red:0"]
        assert_inventory(engine, after)
    for selected in ([anchor, anchor], [state["deck"][0]]):
        with pytest.raises(RuleError):
            engine.apply_action(state, "p1", Action(type="pay", cards=selected))
    state["queue"][0]["amount"] = 99
    with pytest.raises(RuleError):
        engine.apply_action(state, "p1", Action(type="pay", cards=[anchor]))
    selected = [c for c in assets(state, "p1", engine.cards) if c not in buildings]
    after = engine.apply_action(state, "p1", Action(type="pay", cards=selected))
    assert not assets(after, "p1", engine.cards)
    assert after["debts"]["p1"] == (["p0"] if mercy else [])
    assert_inventory(engine, after)


@pytest.mark.parametrize("mercy", [False, True])
def test_payment_bot_values_actual_carried_assets_using_only_its_projection(mercy):
    from app.bots.cards import _payment
    from app.bots.context import Context

    engine, state, anchor, buildings, money = linked_payment_case(mercy)
    # A previously complete collection can be made incomplete by a free move.
    # Its remaining anchor still carries the building, even without a rent bonus.
    for card in list(state["properties"]["p1"]["red:0"]):
        if card not in [anchor, *buildings]:
            state["properties"]["p1"]["red:0"].remove(card)
            state["deck"].append(card)
    state["banks"]["p1"].remove(money)
    state["deck"].append(money)
    money = next(c.id for c in engine.cards.values() if c.kind == "money" and c.value == 2)
    state["deck"].remove(money)
    state["banks"]["p1"].append(money)
    action = _payment(Context(engine.project_view(state, "p1"), "p1", None))
    quote = combine_payment_bundles(payment_bundles(state, "p1", engine.cards), action.cards)
    # Face values tie the 3M anchor with its building. Actual losses preserve the anchor.
    assert set(action.cards) == {money, buildings[0]}
    assert set(quote) == {money, buildings[0]} and sum(quote.values()) == 5
    assert_inventory(engine, engine.apply_action(state, "p1", action))


def test_forced_deal_pending_preview_names_both_public_sides_and_never_a_hidden_canary():
    engine, state = deal_case()
    effect = deal_card(engine, state, "p0", action="forced")
    give = deal_card(engine, state, "p0", kind="property", color="brown", zone="properties")
    take = deal_card(engine, state, "p1", kind="property", color="red", zone="properties")
    hidden = deal_card(engine, state, "p1", kind="property", color="blue")
    state = engine.apply_action(state, "p0", Action(type="play", card=effect, target="p1", choice=take, cards=[give]))
    for player in state["order"]:
        pending = engine.project_view(state, player).detail["pending_action"]
        assert pending["transfers"] == [
            {"source": "p1", "target": "p0", "cards": [take]},
            {"source": "p0", "target": "p1", "cards": [give]},
        ]
    state["queue"][0]["take"] = hidden
    assert engine.project_view(state, "p2").detail["pending_action"]["transfers"] == [
        {"source": "p0", "target": "p1", "cards": [give]},
    ]


def test_uno_pending_cause_direction_recipient_and_elimination_are_public_without_challenge_secret():
    engine, state = uno_case(True, count=4)
    state.update(direction=-1, eliminated=["p3"], pending={"type": "roulette"})
    for player in state["order"]:
        detail = engine.project_view(state, player).detail
        assert detail == {"color": "red", "penalty": 0, "direction": -1,
                          "pending_kind": "roulette", "next_player": "p2", "elimination_limit": 25,
                          "last_event": None, "you_drew": [], "out": [{"player": "p3", "cards": 0}]}
    classic, state = uno_case()
    state["pending"] = {"type": "challenge", "actor": "p2", "illegal": True}
    detail = classic.project_view(state, "p0").detail
    assert detail["pending_kind"] == "challenge" and detail["elimination_limit"] is None
    assert "illegal" not in detail and "actor" not in detail
    assert "illegal" not in str(detail["last_event"]) and detail["last_event"]["outcome"] is None


def test_classic_deck_matches_publisher_inventory():
    cards = make_deck(False).values()
    assert Counter(c.value for c in cards if c.kind == "money") == {1: 6, 2: 5, 3: 3, 4: 3, 5: 2, 10: 1}
    assert Counter(c.colors[0] for c in cards if c.kind == "property" and len(c.colors) == 1) == {
        "brown": 2, "sky": 3, "pink": 3, "orange": 3, "red": 3, "yellow": 3,
        "green": 3, "blue": 2, "rail": 4, "utility": 2,
    }
    assert Counter(c.action for c in cards if c.kind == "action") == {
        "pass_go": 10, "no": 3, "debt": 3, "birthday": 3, "sly": 3,
        "forced": 3, "breaker": 2, "house": 3, "hotel": 2, "double": 2, "rent": 13,
    }


def test_light_blue_railroad_wild_uses_its_printed_four_million_value():
    cards = make_deck(False).values()
    wild = next(c for c in cards if c.colors == ("sky", "rail"))
    assert wild.value == 4


@pytest.mark.parametrize("mercy", [False, True])
def test_deal_wild_faces_keep_printed_colors_when_orientation_matches(mercy):
    cards = make_deck(mercy).values()
    green_blue = next(c for c in cards if c.kind == "property" and c.colors == ("green", "blue"))
    green_rail = next(c for c in cards if c.kind == "property" and c.colors == ("green", "rail"))
    first, second = green_blue.view("green"), green_rail.view("green")
    assert first.color == second.color == "green"
    assert first.value == second.value == "4M"
    assert first.subtitle == second.subtitle == "Wild property"
    assert first.colors == ["green", "blue"]
    assert second.colors == ["green", "rail"]
    assert first.effect == second.effect == ""
    # Mutating a presentation cannot mutate the canonical deck definition.
    first.colors.append("pink")
    assert green_blue.colors == ("green", "blue")


@pytest.mark.parametrize("mercy", [False, True])
def test_deal_rent_faces_keep_every_printed_color_and_effect(mercy):
    cards = make_deck(mercy).values()
    for effect in ("rent", "rent_double") if mercy else ("rent",):
        rent = next(c for c in cards if c.action == effect and len(c.colors) == 10)
        face = rent.view()
        assert face.color == "brown"
        assert face.colors == list(RENTS)
        assert face.effect == effect
        assert face.suit == "action"


@pytest.mark.parametrize("mercy", [False, True])
def test_deal_face_metadata_does_not_expose_hidden_cards_or_randomness(mercy):
    engine = DealEngine(mercy)
    state = engine.setup(["p0", "p1"], {}, seed=19)
    before = deepcopy(state)
    view = engine.project_view(state, "p0")
    visible = view.hand + [c for p in view.players for c in p.bank]
    visible += [c for p in view.players for group in p.properties.values() for c in group]
    if view.discard:
        visible.append(view.discard)
    assert not {c.id for c in visible}.intersection(state["hands"]["p1"] + state["deck"])
    for face in visible:
        canonical = engine.cards[face.id]
        assert face.colors == list(canonical.colors)
        assert face.effect == canonical.action
        assert set(face.model_dump()) == {
            "id", "label", "color", "subtitle", "value", "suit", "colors", "effect",
            "set_name", "set_size", "rent_ladder",
        }
    assert '"seed"' not in view.model_dump_json()
    assert '"deck"' not in view.model_dump_json()
    assert state == before


@pytest.mark.parametrize("mercy", [False, True])
def test_deal_named_property_faces_match_us_sets_and_rent_schedules(mercy):
    expected = [
        ("brown", "Brown", [1, 2], ["Mediterranean Avenue", "Baltic Avenue"]),
        ("sky", "Light blue", [1, 2, 3], ["Oriental Avenue", "Vermont Avenue", "Connecticut Avenue"]),
        ("pink", "Pink", [1, 2, 4], ["St. Charles Place", "States Avenue", "Virginia Avenue"]),
        ("orange", "Orange", [1, 3, 5], ["St. James Place", "Tennessee Avenue", "New York Avenue"]),
        ("red", "Red", [2, 3, 6], ["Kentucky Avenue", "Indiana Avenue", "Illinois Avenue"]),
        ("yellow", "Yellow", [2, 4, 6], ["Atlantic Avenue", "Ventnor Avenue", "Marvin Gardens"]),
        ("green", "Green", [2, 4, 7], ["Pacific Avenue", "North Carolina Avenue", "Pennsylvania Avenue"]),
        ("blue", "Dark blue", [3, 8], ["Park Place", "Boardwalk"]),
        ("rail", "Railroads", [1, 2, 3, 4], ["Reading Railroad", "Pennsylvania Railroad", "B&O Railroad", "Short Line"]),
        ("utility", "Utilities", [1, 2], ["Electric Company", "Water Works"]),
    ]
    cards = make_deck(mercy)
    ordinary = [c for c in cards.values() if c.kind == "property" and len(c.colors) == 1]
    assert len({card.view().label for card in ordinary}) == 28
    for color, set_name, rents, names in expected:
        faces = [c.view() for c in ordinary if c.colors == (color,)]
        assert [face.label for face in faces] == names
        assert all(face.set_name == set_name for face in faces)
        assert all(face.set_size == len(rents) and face.rent_ladder == rents for face in faces)
    assert property_groups() == [
        {"color": color, "name": name, "set_size": len(rents), "rent_ladder": rents,
         "properties": names}
        for color, name, rents, names in expected
    ]


@pytest.mark.parametrize("mercy,expected", [
    (False, "15fcc20993a3ff031ef5a2243851dbbce7b3fa19b6243c0d98de6392c71af782"),
    (True, "bfcb10728bb76f9d3ab77580517d8799ca03cfabcf8fce00fa6e48f815dc0a6c"),
])
def test_named_deal_cards_preserve_saved_physical_ids_and_mechanical_inventory(mercy, expected):
    # Recorded before adding names: every physical ID/order/value/effect stays compatible.
    mechanical = [(c.id, c.kind, c.value, c.colors, c.action) for c in make_deck(mercy).values()]
    assert hashlib.sha256(json.dumps(mechanical, separators=(",", ":")).encode()).hexdigest() == expected


@pytest.mark.parametrize("mercy,boardwalk,wild", [(False, "d041", "d053"), (True, "d039", "d051")])
def test_old_id_only_match_restores_named_faces_and_current_wild_orientation(mercy, boardwalk, wild):
    engine, saved = deal_case(mercy, count=2)
    saved["deck"].remove(boardwalk)
    saved["deck"].remove(wild)
    saved["hands"]["p0"] = [boardwalk]
    saved["properties"]["p1"] = {"blue:0": [wild]}
    # Database state stores IDs and pile keys, not new presentation fields.
    restored = json.loads(json.dumps(saved))
    view = DealEngine(mercy).project_view(restored, "p0")
    assert view.hand[0].id == boardwalk and view.hand[0].label == "Boardwalk"
    face = view.players[1].properties["blue:0"][0]
    assert (face.label, face.color, face.colors) == ("Wild property", "blue", ["green", "blue"])
    assert (face.set_name, face.set_size, face.rent_ladder) == ("Dark blue", 2, [3, 8])
    assert restored == saved


def test_set_metadata_defaults_and_returned_lists_do_not_mutate_deck_rules():
    face = CardView(id="other-family", label="Other card")
    assert face.set_name is None and face.set_size is None and face.rent_ladder == []
    wild = next(c for c in make_deck(False).values() if c.colors == ("green", "blue"))
    oriented = wild.view("blue")
    oriented.rent_ladder.append(99)
    catalogue = property_groups()
    catalogue[0]["rent_ladder"].append(99)
    catalogue[0]["properties"].append("Not a real property")
    assert wild.view("blue").rent_ladder == [3, 8]
    assert property_groups()[0]["rent_ladder"] == [1, 2]
    assert len(property_groups()[0]["properties"]) == 2


@pytest.mark.parametrize("mercy", [False, True])
def test_deal_explicit_placement_chooses_existing_or_new_collection_and_rejects_forgery(mercy):
    engine, state = deal_case(mercy)
    first = deal_card(engine, state, "p0", kind="property", color="brown", zone="properties")
    second = deal_card(engine, state, "p0", kind="property", color="brown")
    options = [o.action for o in engine.legal_actions(state, "p0") if o.action.card == second]
    assert {o.choice for o in options} == {"brown:0", "brown:1"}
    before = deepcopy(state)
    for color, destination in [("brown", "brown:99"), ("blue", "brown:0"), ("brown", "blue:0")]:
        with pytest.raises(RuleError):
            engine.apply_action(state, "p0", Action(type="property", card=second, color=color, choice=destination))
    assert state == before
    chosen = engine.apply_action(state, "p0", Action(type="property", card=second, color="brown", choice="brown:1"))
    assert chosen["properties"]["p0"] == {"brown:0": [first], "brown:1": [second]}
    assert chosen["moves"] == 2 and chosen["scores"]["p0"] == 0
    legacy = engine.apply_action(state, "p0", Action(type="property", card=second, color="brown"))
    assert legacy["properties"]["p0"] == {"brown:0": [first, second]}
    assert legacy["scores"]["p0"] == 1
    assert_inventory(engine, chosen)
    assert_inventory(engine, legacy)


@pytest.mark.parametrize("mercy", [False, True])
def test_deal_moves_standard_properties_between_same_color_piles_without_spending_a_play(mercy):
    engine, state = deal_case(mercy)
    first = deal_card(engine, state, "p0", kind="property", color="brown", zone="properties")
    second = deal_card(engine, state, "p0", kind="property", color="brown", zone="properties")
    state = engine.apply_action(state, "p0", Action(type="rearrange", card=second, color="brown", choice="brown:1"))
    assert state["properties"]["p0"] == {"brown:0": [first], "brown:1": [second]}
    assert state["scores"]["p0"] == 0 and state["moves"] == 3
    state = engine.apply_action(state, "p0", Action(type="rearrange", card=second, color="brown", choice="brown:0"))
    assert state["properties"]["p0"]["brown:0"] == [first, second]
    assert state["scores"]["p0"] == 1 and state["moves"] == 3
    with pytest.raises(RuleError):
        engine.apply_action(state, "p1", Action(type="rearrange", card=first, color="brown", choice="brown:1"))
    with pytest.raises(RuleError):
        engine.apply_action(state, "p0", Action(type="rearrange", card=first, color="sky", choice="sky:0"))
    assert_inventory(engine, state)


def test_repeated_deal_pile_moves_reuse_empty_slots_and_never_overfill_a_set():
    engine, state = deal_case()
    card = deal_card(engine, state, "p0", kind="property", color="brown", zone="properties")
    for _ in range(200):
        move = next(o.action for o in engine.legal_actions(state, "p0") if o.action.type == "rearrange")
        state = engine.apply_action(state, "p0", move)
    assert len(state["properties"]["p0"]) == 2 and state["moves"] == 3
    second = deal_card(engine, state, "p0", kind="property", color="brown")
    key = next(k for k, group in state["properties"]["p0"].items() if card in group)
    state = engine.apply_action(state, "p0", Action(type="property", card=second, color="brown", choice=key))
    assert key not in groups_for(state, "p0", "brown", engine.cards)
    with pytest.raises(RuleError):
        place(state, "p0", card, engine.cards, "brown", key)
    assert_inventory(engine, state)


def test_legacy_wild_rearrangement_and_built_collection_keep_state_and_rent_consistent():
    engine, state = deal_case()
    brown = deal_card(engine, state, "p0", kind="property", color="brown", zone="properties")
    wild = next(c.id for c in engine.cards.values() if c.colors == ("brown", "sky"))
    state["deck"].remove(wild)
    place(state, "p0", wild, engine.cards, "brown")
    house = deal_card(engine, state, "p0", action="house")
    hotel = deal_card(engine, state, "p0", action="hotel")
    state = engine.apply_action(state, "p0", Action(type="play", card=house, color="brown:0"))
    state = engine.apply_action(state, "p0", Action(type="play", card=hotel, color="brown:0"))
    assert engine.project_view(state, "p0").detail["collections"] == [{
        "player": "p0", "key": "brown:0", "color": "brown", "count": 2,
        "set_size": 2, "complete": True, "rent": 9,
    }]
    state["links"][house] = state["links"][hotel] = wild
    state = engine.apply_action(state, "p0", Action(type="rearrange", card=wild, color="sky"))
    assert state["properties"]["p0"]["brown:0"] == [brown, house, hotel]
    assert state["links"][house] == state["links"][hotel] == brown
    collections = engine.project_view(state, "p0").detail["collections"]
    assert collections[0]["complete"] is False and collections[0]["rent"] == 1
    state = engine.apply_action(state, "p0", Action(type="rearrange", card=wild, color="brown", choice="brown:0"))
    assert engine.project_view(state, "p0").detail["collections"][0]["rent"] == 9
    assert state["moves"] == 1
    assert_inventory(engine, state)


@pytest.mark.parametrize("stage,flags", [
    ("counter", {}), ("select", {"select": True}), ("payment", {"payment": True}),
    ("distribution", {"distribution": True}),
])
def test_deal_pending_context_is_public_minimal_and_does_not_reveal_event_choices(stage, flags):
    engine, state = deal_case()
    state["queue"] = [{
        "kind": "bill", "actor": "p0", "target": "p1", "responder": "p1",
        "amount": 5, "blocked": True, "take": "hidden-card", "give": "hidden-card",
        "choice": "private-choice", **flags,
    }]
    for player in state["order"]:
        pending = engine.project_view(state, player).detail["pending_action"]
        assert pending == {"kind": "bill", "actor": "p0", "target": "p1", "responder": "p1",
                           "amount": 5, "blocked": True, "stage": stage, "transfers": [],
                           "collection": None, "category": None,
                           "source_collection": None, "multiplier": 1}
    state["queue"] = []
    assert engine.project_view(state, "p0").detail["pending_action"] is None


@pytest.mark.parametrize("mercy,effect,amount", [(False, "debt", 5), (True, "yoink", 10)])
def test_real_deal_counter_payment_and_cancellation_project_numeric_public_context(mercy, effect, amount):
    engine, state = deal_case(mercy)
    card = deal_card(engine, state, "p0", action=effect)
    money = deal_card(engine, state, "p1", kind="money", zone="banks")
    no = deal_card(engine, state, "p1", action="no")
    state = engine.apply_action(state, "p0", Action(type="play", card=card, target="p1"))
    counter = engine.project_view(state, "p1").detail["pending_action"]
    assert counter["stage"] == "counter" and type(counter["amount"]) is int
    assert counter["amount"] == amount
    cancelled = engine.apply_action(state, "p1", Action(type="no", card=no))
    assert engine.project_view(cancelled, "p0").detail["pending_action"]["blocked"] is True
    cancelled = engine.apply_action(cancelled, "p0", Action(type="accept"))
    assert engine.project_view(cancelled, "p0").detail["pending_action"] is None
    payment = engine.apply_action(state, "p1", Action(type="accept"))
    context = engine.project_view(payment, "p1").detail["pending_action"]
    assert context["stage"] == "payment" and type(context["amount"]) is int
    assert engine.project_view(payment, "p1").detail["payment_amount"] == amount
    paid = engine.apply_action(payment, "p1", Action(type="pay", cards=[money]))
    assert engine.project_view(paid, "p1").detail["pending_action"] is None
    assert_inventory(engine, cancelled)
    assert_inventory(engine, paid)


def test_deal_non_bill_context_uses_null_amount_and_building_only_collection_has_zero_rent():
    engine, state = deal_case()
    house = deal_card(engine, state, "p0", action="house")
    state["hands"]["p0"].remove(house)
    state["properties"]["p0"] = {"brown:0": [house], "sky:0": []}
    state["queue"] = [{"kind": "forced_debt", "actor": "p0", "target": "p1",
                       "responder": "p1", "blocked": False}]
    view = engine.project_view(state, "p1")
    assert view.detail["pending_action"]["amount"] is None
    assert view.detail["collections"] == [{"player": "p0", "key": "brown:0", "color": "brown",
                                           "count": 0, "set_size": 2, "complete": False, "rent": 0}]
    assert_inventory(engine, state)


@pytest.mark.parametrize("mercy,buildings", [(False, []), (False, ["house", "hotel"]),
                                           (True, []), (True, ["shack"])])
def test_deal_zero_value_wilds_cannot_collect_rent_even_with_inactive_buildings(mercy, buildings):
    engine, state = deal_case(mercy)
    wilds = [c.id for c in engine.cards.values() if c.kind == "property" and c.value == 0]
    for card in wilds:
        state["deck"].remove(card)
        place(state, "p0", card, engine.cards, "brown")
    for kind in buildings:
        building = deal_card(engine, state, "p0", action=kind)
        state["hands"]["p0"].remove(building)
        state["properties"]["p0"]["brown:0"].append(building)
        state["links"][building] = wilds[0]
    rent_card = deal_card(engine, state, "p0", action="rent")
    assert rent(state, "p0", "brown:0", engine.cards) == 0
    collection = engine.project_view(state, "p0").detail["collections"][0]
    assert collection["count"] == 2 and collection["complete"] is False and collection["rent"] == 0
    assert not any(o.action.card == rent_card and o.action.type == "play"
                   for o in engine.legal_actions(state, "p0"))
    assert_inventory(engine, state)


@pytest.mark.parametrize("mercy,building", [(False, "house"), (True, "shack")])
def test_deal_building_only_collection_has_no_rent_base(mercy, building):
    engine, state = deal_case(mercy)
    card = deal_card(engine, state, "p0", action=building)
    state["hands"]["p0"].remove(card)
    state["properties"]["p0"]["brown:0"] = [card]
    assert rent(state, "p0", "brown:0", engine.cards) == 0
    assert engine.project_view(state, "p0").detail["collections"][0]["rent"] == 0
    assert_inventory(engine, state)


@pytest.mark.parametrize("mercy", [False, True])
def test_uno_deck_composition_and_unique_physical_cards(mercy):
    cards = deck(mercy)
    assert len(cards) == len(set(cards)) == (168 if mercy else 108)
    for color in COLORS:
        numbers = Counter(c.split(":")[1] for c in cards if c.startswith(color + ":"))
        assert numbers["0"] == (2 if mercy else 1)
        assert all(numbers[str(n)] == 2 for n in range(1, 10))
        assert numbers["draw2"] == 2
        assert numbers["skip"] == numbers["reverse"] == (3 if mercy else 2)


@pytest.mark.parametrize("last", ["red:0:0", "red:7:0"])
def test_no_mercy_last_swap_card_wins_before_transferring_empty_hand(last):
    engine, state = uno_case(True)
    uno_hand(state, "p0", [last])
    uno_hand(state, "p1", ["blue:2:0"])
    uno_hand(state, "p2", ["green:3:0"])
    action = Action(type="play", card=last, **({"target": "p1"} if ":7:" in last else {}))
    result = engine.apply_action(state, "p0", action)
    assert result["winners"] == ["p0"] and result["scores"]["p0"] == 5
    assert result["hands"]["p1"] == state["hands"]["p1"]
    assert_inventory(engine, result)


def test_roulette_recipient_selects_next_colour_and_wild_does_not_stop_drawing():
    engine, state = uno_case(True)
    uno_hand(state, "p0", ["wild:roulette:0", "red:1:0"])
    uno_hand(state, "p1", ["blue:2:0"])
    uno_hand(state, "p2", ["green:3:0"])
    for card in ["wild:wild6:0", "blue:4:0", "yellow:6:0"]:
        state["deck"].remove(card)
    state["deck"].extend(["yellow:6:0", "blue:4:0", "wild:wild6:0"])
    choices = [o.action for o in engine.legal_actions(state, "p0") if o.action.card == "wild:roulette:0"]
    assert choices == [Action(type="play", card="wild:roulette:0")]
    state = engine.apply_action(state, "p0", choices[0])
    state = engine.apply_action(state, "p1", Action(type="choose", color="yellow"))
    assert state["color"] == "yellow" and state["turn"] == 2
    assert state["hands"]["p1"][-3:] == ["wild:wild6:0", "blue:4:0", "yellow:6:0"]
    assert_inventory(engine, state)


@pytest.mark.parametrize("illegal", [False, True])
def test_classic_challenge_penalty_and_turn_are_independent_of_declared_colour(illegal):
    engine, state = uno_case()
    uno_hand(state, "p0", ["wild:wild4:0", "red:1:0" if illegal else "blue:1:0"])
    uno_hand(state, "p1", ["green:2:0"])
    uno_hand(state, "p2", ["blue:3:0"])
    state = engine.apply_action(state, "p0", Action(type="play", card="wild:wild4:0", color="green"))
    state = engine.apply_action(state, "p1", Action(type="challenge"))
    assert len(state["hands"]["p0"]) == (5 if illegal else 1)
    assert len(state["hands"]["p1"]) == (1 if illegal else 7)
    assert state["turn"] == (1 if illegal else 2)
    assert_inventory(engine, state)


def test_discard_all_keeps_action_on_top_and_skip_everyone_retains_turn():
    engine, state = uno_case(True)
    uno_hand(state, "p0", ["red:discard_all:0", "red:1:0", "red:2:0", "blue:1:0"])
    uno_hand(state, "p1", ["red:skip_all:0", "blue:2:0"])
    uno_hand(state, "p2", ["green:3:0"])
    state = engine.apply_action(state, "p0", Action(type="play", card="red:discard_all:0"))
    assert state["hands"]["p0"] == ["blue:1:0"]
    assert state["discard"][-3:] == ["red:1:0", "red:2:0", "red:discard_all:0"]
    state = engine.apply_action(state, "p1", Action(type="play", card="red:skip_all:0"))
    assert state["turn"] == 1
    assert_inventory(engine, state)


def test_classic_double_rent_requires_playable_matching_rent_and_keeps_it_playable():
    engine, state = deal_case()
    double = deal_card(engine, state, "p0", action="double")
    rent = deal_card(engine, state, "p0", action="rent")
    assert not any(o.action.type == "play" and o.action.card == double for o in engine.legal_actions(state, "p0"))
    color = engine.cards[rent].colors[0]
    property_card = deal_card(engine, state, "p0", kind="property", color=color, zone="properties")
    state = engine.apply_action(state, "p0", Action(type="play", card=double))
    assert state["boost"] == 2 and state["moves"] == 2
    assert all(o.action.type != "rearrange" for o in engine.legal_actions(state, "p0"))
    rent_action = next(o.action for o in engine.legal_actions(state, "p0") if o.action.type == "play" and o.action.card == rent)
    state = engine.apply_action(state, "p0", rent_action)
    assert all(e["amount"] == RENTS[color][0] * 2 for e in state["queue"])
    assert property_card in state["properties"]["p0"][color + ":0"]
    assert_inventory(engine, state)


def test_rainbow_wild_alone_cannot_collect_rent_or_be_used_as_payment():
    engine, state = deal_case()
    rainbow = next(c.id for c in engine.cards.values() if c.kind == "property" and len(c.colors) == 10)
    state["deck"].remove(rainbow)
    place(state, "p0", rainbow, engine.cards, "brown")
    deal_card(engine, state, "p0", action="rent")
    assert not any(o.action.type == "play" for o in engine.legal_actions(state, "p0"))
    assert assets(state, "p0", engine.cards) == []
    assert_inventory(engine, state)


@pytest.mark.parametrize("mercy", [False, True])
def test_deal_recycles_last_discard_instead_of_reserving_an_unplayable_top(mercy):
    engine, state = deal_case(mercy)
    final = state["deck"].pop()
    state["banks"]["p0"] = state["deck"]
    state["deck"] = []
    state["discard"] = [final]
    state["hands"]["p0"] = draw_cards(state, 2)
    assert state["hands"]["p0"] == [final] and not state["discard"]
    assert_inventory(engine, state)


def test_debt_paid_shack_is_banked_instead_of_attached():
    engine, state = deal_case(True)
    shack = deal_card(engine, state, "p0", action="shack")
    deal_card(engine, state, "p1", kind="property", color="brown", zone="properties")
    state["debts"]["p0"] = ["p1"]
    state = engine.apply_action(state, "p0", Action(type="settle_debt", card=shack, target="p1"))
    assert [o.action.type for o in engine.legal_actions(state, "p1")] == ["bank"]
    state = engine.apply_action(state, "p1", Action(type="bank", card=shack))
    assert state["banks"]["p1"] == [shack] and state["moves"] == 2
    assert not state["debts"]["p0"] and state["gift"] is None
    assert_inventory(engine, state)


@pytest.mark.parametrize("mercy", [False, True])
def test_partial_payment_requires_all_assets_never_hand_and_issues_one_debt(mercy):
    engine, state = deal_case(mercy)
    action_card = deal_card(engine, state, "p0", action="yoink" if mercy else "debt")
    money = deal_card(engine, state, "p1", kind="money", zone="banks")
    property_card = deal_card(engine, state, "p1", kind="property", color="brown", zone="properties")
    hand = deal_card(engine, state, "p1", kind="money")
    state = engine.apply_action(state, "p0", Action(type="play", card=action_card, target="p1"))
    state = engine.apply_action(state, "p1", Action(type="accept"))
    original = deepcopy(state)
    with pytest.raises(RuleError):
        engine.apply_action(state, "p1", Action(type="pay", cards=[money]))
    with pytest.raises(RuleError):
        engine.apply_action(state, "p1", Action(type="pay", cards=[money, property_card, hand]))
    assert state == original
    state = engine.apply_action(state, "p1", Action(type="pay", cards=[money, property_card]))
    assert state["banks"]["p0"] == [money] and state["hands"]["p1"] == [hand]
    assert state["debts"]["p1"] == (["p0"] if mercy else [])
    assert_inventory(engine, state)


@pytest.mark.parametrize("mercy", [False, True])
def test_counter_counter_action_resolves_bill_with_edition_specific_play_cost(mercy):
    engine, state = deal_case(mercy)
    bill = deal_card(engine, state, "p0", action="yoink" if mercy else "debt")
    first_no = deal_card(engine, state, "p1", action="no")
    second_no = deal_card(engine, state, "p0", action="no")
    state = engine.apply_action(state, "p0", Action(type="play", card=bill, target="p1"))
    state = engine.apply_action(state, "p1", Action(type="no", card=first_no))
    state = engine.apply_action(state, "p0", Action(type="no", card=second_no))
    state = engine.apply_action(state, "p1", Action(type="accept"))
    assert not state["queue"] and state["moves"] == (1 if mercy else 2)
    assert state["debts"]["p1"] == (["p0"] if mercy else [])
    assert_inventory(engine, state)


def test_no_mercy_go_again_takes_full_new_turn_and_forced_debt_caps_at_three():
    engine, state = deal_case(True)
    again = deal_card(engine, state, "p0", action="go_again")
    state = engine.apply_action(state, "p0", Action(type="play", card=again))
    assert state["turn"] == 0 and state["moves"] == 3 and len(state["hands"]["p0"]) == 5
    for _ in range(3):
        debt = deal_card(engine, state, "p0", action="forced_debt")
        state = engine.apply_action(state, "p0", Action(type="play", card=debt, target="p1"))
        state = engine.apply_action(state, "p1", Action(type="accept"))
    assert len(state["debts"]["p1"]) == 3
    issue_debt(state, "p1", "p2")
    assert state["debts"]["p1"] == ["p0", "p0", "p0"]
    assert_inventory(engine, state)


@pytest.mark.parametrize("kind,zone", [("heist", "banks"), ("crash", "properties")])
def test_no_mercy_collection_attacks_take_actor_choice_from_every_player(kind, zone):
    engine, state = deal_case(True)
    action = deal_card(engine, state, "p0", action=kind)
    chosen = {}
    for player in ["p1", "p2"]:
        if zone == "banks":
            chosen[player] = deal_card(engine, state, player, kind="money", zone=zone)
            deal_card(engine, state, player, kind="money", zone=zone)
        else:
            chosen[player] = deal_card(engine, state, player, kind="property", color="brown", zone=zone)
            deal_card(engine, state, player, kind="property", color="blue", zone=zone)
    state = engine.apply_action(state, "p0", Action(type="play", card=action))
    for player, card in chosen.items():
        assert state["queue"][0]["target"] == player
        assert all(o.action.type == "choose" for o in engine.legal_actions(state, "p0"))
        state = engine.apply_action(state, "p0", Action(type="choose", card=card))
        state = engine.apply_action(state, player, Action(type="accept"))
        assert card in (state["banks"]["p0"] if zone == "banks" else sum(state["properties"]["p0"].values(), []))
    assert not state["queue"] and state["moves"] == 2
    assert_inventory(engine, state)


def test_no_mercy_super_sly_takes_matching_inactive_wild_and_rainbow():
    engine, state = deal_case(True)
    action = deal_card(engine, state, "p0", action="super_sly")
    regular = deal_card(engine, state, "p1", kind="property", color="green", zone="properties")
    wilds = [next(c.id for c in engine.cards.values() if c.kind == "property" and c.colors == colors) for colors in [("green", "blue"), tuple(RENTS)]]
    for card in wilds:
        state["deck"].remove(card)
        place(state, "p2", card, engine.cards, "blue")
    state = engine.apply_action(state, "p0", Action(type="play", card=action, color="green"))
    for player in ["p1", "p2"]:
        state = engine.apply_action(state, player, Action(type="accept"))
    assert set(sum(state["properties"]["p0"].values(), [])) == {regular, *wilds}
    assert not sum(state["properties"]["p1"].values(), []) and not sum(state["properties"]["p2"].values(), [])
    assert_inventory(engine, state)


@pytest.mark.parametrize("kind,zone", [("tax", "banks"), ("repossession", "properties")])
def test_no_mercy_distribution_lets_victim_keep_one_and_choose_recipients(kind, zone):
    engine, state = deal_case(True)
    action = deal_card(engine, state, "p0", action=kind)
    cards = [deal_card(engine, state, "p1", kind="money" if zone == "banks" else "property", color=None if zone == "banks" else color, zone=zone) for color in ["brown", "blue", "green"]]
    state = engine.apply_action(state, "p0", Action(type="play", card=action, target="p1"))
    state = engine.apply_action(state, "p1", Action(type="accept"))
    state = engine.apply_action(state, "p1", Action(type="keep", card=cards[0]))
    state = engine.apply_action(state, "p1", Action(type="give", card=cards[1], target="p2"))
    state = engine.apply_action(state, "p1", Action(type="give", card=cards[2], target="p0"))
    remaining = state[zone]["p1"] if zone == "banks" else sum(state[zone]["p1"].values(), [])
    assert remaining == [cards[0]] and not state["queue"]
    assert_inventory(engine, state)


@pytest.mark.parametrize("kind", ["property", "money", "action"])
def test_no_mercy_tough_luck_takes_only_requested_hand_type(kind):
    engine, state = deal_case(True)
    tough = deal_card(engine, state, "p0", action="tough")
    held = {k: deal_card(engine, state, "p1", kind=k) for k in ["property", "money", "action"]}
    bank = deal_card(engine, state, "p1", kind="money", zone="banks")
    state = engine.apply_action(state, "p0", Action(type="play", card=tough, target="p1", choice=kind))
    state = engine.apply_action(state, "p1", Action(type="accept"))
    assert state["hands"]["p0"] == [held[kind]]
    assert set(state["hands"]["p1"]) == set(held.values()) - {held[kind]}
    assert state["banks"]["p1"] == [bank]
    assert_inventory(engine, state)


def test_no_mercy_unfair_trade_requires_own_bank_and_swaps_banked_actions_as_money():
    engine, state = deal_case(True)
    action = deal_card(engine, state, "p0", action="unfair")
    assert not any(o.action.card == action and o.action.type == "play" for o in engine.legal_actions(state, "p0"))
    own = deal_card(engine, state, "p0", action="go_again", zone="banks")
    other = deal_card(engine, state, "p1", kind="money", zone="banks")
    state = engine.apply_action(state, "p0", Action(type="play", card=action, target="p1"))
    state = engine.apply_action(state, "p1", Action(type="accept"))
    assert state["banks"]["p0"] == [other] and state["banks"]["p1"] == [own]
    assert_inventory(engine, state)


def test_classic_complete_set_protected_from_sly_and_breaker_includes_buildings():
    engine, state = deal_case()
    for _ in range(2):
        deal_card(engine, state, "p1", kind="property", color="brown", zone="properties")
    house = deal_card(engine, state, "p1", action="house")
    state["turn"] = 1
    state = engine.apply_action(state, "p1", Action(type="play", card=house, color="brown:0"))
    state["turn"], state["moves"] = 0, 3
    sly = deal_card(engine, state, "p0", action="sly")
    breaker = deal_card(engine, state, "p0", action="breaker")
    assert not any(o.action.card == sly and o.action.type == "play" for o in engine.legal_actions(state, "p0"))
    state = engine.apply_action(state, "p0", Action(type="play", card=breaker, target="p1", color="brown:0"))
    state = engine.apply_action(state, "p1", Action(type="accept"))
    assert len(state["properties"]["p0"]["brown:0"]) == 3
    assert house in state["properties"]["p0"]["brown:0"]
    assert_inventory(engine, state)


def test_no_mercy_debt_property_can_win_immediately_for_creditor_outside_their_turn():
    engine, state = deal_case(True)
    for color, count in [("brown", 2), ("blue", 2), ("utility", 1)]:
        for _ in range(count):
            deal_card(engine, state, "p1", kind="property", color=color, zone="properties")
    gift = deal_card(engine, state, "p0", kind="property", color="utility")
    state["debts"]["p0"] = ["p1"]
    state = engine.apply_action(state, "p0", Action(type="settle_debt", card=gift, target="p1"))
    state = engine.apply_action(state, "p1", Action(type="property", card=gift, color="utility"))
    assert state["phase"] == "finished" and state["winners"] == ["p1"]
    assert state["scores"]["p1"] == 3
    assert_inventory(engine, state)


def test_no_mercy_shack_adds_five_before_rent_is_doubled_for_every_opponent():
    engine, state = deal_case(True)
    deal_card(engine, state, "p0", kind="property", color="green", zone="properties")
    shack = deal_card(engine, state, "p0", action="shack")
    rent = deal_card(engine, state, "p0", action="rent_double")
    # Use the green/blue double-rent card rather than the first brown/sky pair.
    state["hands"]["p0"].remove(rent)
    state["deck"].append(rent)
    rent = next(c.id for c in engine.cards.values() if c.action == "rent_double" and "green" in c.colors)
    state["deck"].remove(rent)
    state["hands"]["p0"].append(rent)
    state = engine.apply_action(state, "p0", Action(type="play", card=shack, color="green:0"))
    state = engine.apply_action(state, "p0", Action(type="play", card=rent, color="green:0"))
    assert [(e["target"], e["amount"]) for e in state["queue"]] == [("p1", 14), ("p2", 14)]
    assert_inventory(engine, state)


@pytest.mark.parametrize("initial", [0, 6, 8])
def test_no_mercy_pass_go_go_go_fills_to_seven_without_discarding_existing_cards(initial):
    engine, state = deal_case(True)
    action = deal_card(engine, state, "p0", action="fill")
    for _ in range(initial):
        deal_card(engine, state, "p0", kind="money")
    state = engine.apply_action(state, "p0", Action(type="play", card=action))
    assert len(state["hands"]["p0"]) == max(initial, 7)
    assert_inventory(engine, state)


@pytest.mark.parametrize("game", ["uno", "uno-no-mercy", "deal", "deal-no-mercy"])
@pytest.mark.parametrize("maximum", [False, True])
@pytest.mark.parametrize("seed", [7, 31, 53])
def test_complete_card_family_matches_conserve_every_physical_card(game, maximum, seed):
    engine = UnoEngine(game.endswith("no-mercy")) if game.startswith("uno") else DealEngine(game.endswith("no-mercy"))
    count = engine.manifest.max_players if maximum else engine.manifest.min_players
    players = [f"p{i}" for i in range(count)]
    state = engine.setup(players, {}, seed=seed)
    chooser = random.Random(seed + 1)
    for _ in range(5000):
        assert_inventory(engine, state)
        if state["phase"] == "finished":
            break
        current = engine.project_view(state, players[0]).current_player
        choices = engine.legal_actions(state, current)
        assert choices
        if isinstance(engine, UnoEngine):
            preferred = [o for o in choices if o.action.type == "uno"] or [o for o in choices if o.action.type == "play"]
        else:
            preferred = [o for o in choices if o.action.type == "property"] or [o for o in choices if o.action.type not in {"rearrange", "end_turn"}]
        option = chooser.choice(preferred or choices)
        action = option.action.model_copy(update={"cards": option.eligible_cards}) if option.input == "cards" else option.action
        state = engine.apply_action(state, current, action)
    assert state["phase"] == "finished" and len(state["winners"]) == 1
    assert all(not engine.legal_actions(state, p) for p in players)


def test_approved_no_mercy_house_deck_has_explicit_money_counts_and_printed_action_values():
    engine = DealEngine(True)
    assert engine.manifest.rules_version == "house-deck-1"
    assert "house deck" in engine.manifest.subtitle.lower()
    assert any("1×15M" in rule and "house convention" in rule for rule in engine.manifest.rules)
    cards = list(engine.cards.values())
    assert len(cards) == 115
    assert Counter(c.value for c in cards if c.kind == "money") == {1: 5, 2: 4, 3: 3, 4: 2, 5: 2, 10: 1, 15: 1}
    expected = {
        "breaker": (3, 3), "forced_debt": (2, 3), "go_again": (1, 3),
        "heist": (4, 3), "no": (4, 5), "crash": (4, 3), "fill": (1, 4),
        "repossession": (5, 2), "shack": (3, 3), "super_sly": (3, 3),
        "tax": (5, 2), "tough": (5, 3), "unfair": (4, 2), "yoink": (2, 3),
    }
    for kind, (value, count) in expected.items():
        assert [c.value for c in cards if c.action == kind] == [value] * count
    assert sum(count for _, count in expected.values()) == 42
    for kind in ["rent", "rent_double"]:
        assert Counter(c.value for c in cards if c.action == kind) == {1: 5, 3: 3}


def test_repossession_carries_shack_with_given_part_even_when_anchor_is_kept():
    engine, state = deal_case(True)
    keep = deal_card(engine, state, "p1", kind="property", color="brown", zone="properties")
    given = deal_card(engine, state, "p1", kind="property", color="brown", zone="properties")
    shack = deal_card(engine, state, "p1", action="shack")
    state["turn"] = 1
    state = engine.apply_action(state, "p1", Action(type="play", card=shack, color="brown:0"))
    assert state["links"][shack] == keep
    state["turn"], state["moves"] = 0, 3
    repo = deal_card(engine, state, "p0", action="repossession")
    state = engine.apply_action(state, "p0", Action(type="play", card=repo, target="p1"))
    state = engine.apply_action(state, "p1", Action(type="accept"))
    state = engine.apply_action(state, "p1", Action(type="keep", card=keep))
    state = engine.apply_action(state, "p1", Action(type="give", card=given, target="p2"))
    assert state["properties"]["p1"]["brown:0"] == [keep]
    assert state["properties"]["p2"]["brown:0"] == [given, shack]
    assert state["links"][shack] == given and not state["queue"]
    assert_inventory(engine, state)


def test_payment_projection_and_wire_action_support_more_than_thirty_payable_assets():
    engine, state = deal_case(True, count=2)
    bill = deal_card(engine, state, "p0", action="yoink")
    for _ in range(33):
        available = next(c for c in engine.cards.values() if c.id in state["deck"] and c.kind != "property")
        state["deck"].remove(available.id)
        state["banks"]["p1"].append(available.id)
    state = engine.apply_action(state, "p0", Action(type="play", card=bill, target="p1"))
    state = engine.apply_action(state, "p1", Action(type="accept"))
    view = engine.project_view(state, "p1")
    assert view.current_player == "p1"
    payment = next(o for o in view.actions if o.action.type == "pay")
    assert payment.input == "cards" and len(payment.eligible_cards) == 33
    wire = payment.action.model_dump()
    wire["cards"] = payment.eligible_cards
    action = Action.model_validate(wire)
    state = engine.apply_action(state, "p1", action)
    assert len(state["banks"]["p0"]) == 33 and not state["banks"]["p1"]
    assert not state["queue"] and state["moves"] == 2
    assert_inventory(engine, state)
