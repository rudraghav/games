"""Truth or Dare: the written decks, turns, swaps, burning building and edition secrecy."""

import json
import random
import re
from collections import Counter

import pytest

from app.bots import choose_action
from app.core.contracts import Action, RuleError
from app.games.truth_or_dare.engine import ASSIGNMENTS, TruthOrDareEngine, turns_each
from app.games.truth_or_dare.prompts import (
    FRIENDLY_DARES,
    FRIENDLY_FATES,
    FRIENDLY_TRUTHS,
    NAUGHTY_DARES,
    NAUGHTY_FATES,
    NAUGHTY_TRUTHS,
    TRIOS,
)
from app.models import Member
from app.rooms.bots import BOT_REVIEW_DELAY_SECONDS, bot_delay
from app.rooms.public_history import LABELS, public_move

ENGINE = TruthOrDareEngine()
DETAIL_KEYS = {"edition", "fates", "burning_building", "turns_per_player", "turns_taken",
               "prompt", "swaps_left", "last_result", "scores"}
DECKS = {"friendly truths": FRIENDLY_TRUTHS, "friendly dares": FRIENDLY_DARES,
         "naughty truths": NAUGHTY_TRUTHS, "naughty dares": NAUGHTY_DARES}
NAUGHTY_TEXT = [*NAUGHTY_TRUTHS, *NAUGHTY_DARES]
CANDIDATES = [candidate for trio in TRIOS for candidate in trio]


def start(seats=3, seed=4, **settings):
    return ENGINE.setup([f"p{i}" for i in range(seats)], settings, seed=seed)


def act(state, kind, choice=""):
    actor = state["order"][state["turn"]]
    return ENGINE.apply_action(state, actor, Action(type=kind, choice=choice))


def kinds(state, player=None):
    player = player or state["order"][state["turn"]]
    return [option.action.type for option in ENGINE.legal_actions(state, player)]


def play_out(state, chooser, watch=None):
    """Random legal play to the end; `watch(state)` sees every state on the way."""
    for _ in range(400):
        if watch:
            watch(state)
        if state["phase"] == "finished":
            return state
        actor = state["order"][state["turn"]]
        option = chooser.choice(ENGINE.legal_actions(state, actor))
        state = ENGINE.apply_action(state, actor, option.action)
    raise AssertionError("Truth or Dare did not finish")


def test_manifest_is_the_documented_contract():
    manifest = ENGINE.manifest
    assert (manifest.id, manifest.name, manifest.family) == (
        "truth-or-dare", "Truth or Dare", "truth-dare")
    assert (manifest.min_players, manifest.max_players) == (2, 10)
    assert (manifest.minutes, manifest.icon, manifest.color) == ("10–25", "flame", "coral")
    assert (manifest.score_label, manifest.score_order) == ("Points", "high")
    assert [(s.key, s.label, s.default) for s in manifest.settings] == [
        ("adults_only", "Naughty edition (18+)", False),
        ("burning_building", "Burning building rounds", True),
        ("name_players", "Burning building can name players in this room", False),
    ]
    # The public catalogue never carries the adult fate wording.
    listing = manifest.model_dump_json().lower()
    assert "fuck" not in listing and "kill" not in listing


def test_deck_sizes_and_uniqueness():
    for deck in DECKS.values():
        assert len(deck) >= 70
    assert len(TRIOS) >= 45
    everything = [text.lower() for deck in DECKS.values() for text in deck]
    assert len(set(everything)) == len(everything)
    assert all(len(trio) == 3 for trio in TRIOS)
    assert len(set(CANDIDATES)) == len(CANDIDATES)
    assert FRIENDLY_FATES == ["Kiss", "Marry", "Leave behind"]
    assert NAUGHTY_FATES == ["Fuck", "Marry", "Kill"]
    # A match can never run a deck dry: 21 turns at most, plus one swap each.
    assert min(len(deck) for deck in DECKS.values()) >= 7 * 3 + 10 and len(TRIOS) >= 31


WORDS_NOT_FOR_ANY_PROMPT = [
    # alcohol and drugs
    "drink", "drunk", "beer", "wine", "shot", "vodka", "cocktail", "smoke", "vape", "weed",
    # photos, recordings, posting and people outside the room
    "photo", "selfie", "picture of", "record", "video", "upload", "post", "social media",
    "text your", "message your", "call your", "phone your", "send a",
]
YOUNG_WORDS = ["kid", "kids", "child", "children", "childhood", "teen", "teens", "teenage",
               "teenager", "school", "minor", "boy", "girl", "student", "baby", "young",
               "underage"]
ADULT_WORDS = ["sex", "kiss", "bed", "naked", "nude", "flirt", "seduc", "turn-on", "lust",
               "strip", "hook", "crush", "dating", "fuck", "kill"]
ANOTHER_PLAYER = ["another player", "someone", "the player", "a player"]


@pytest.mark.parametrize("name", list(DECKS))
def test_every_prompt_passes_the_house_lint(name):
    for text in DECKS[name]:
        lowered = text.lower()
        assert 12 <= len(text) <= 110, text
        assert text[0].isupper() and text[-1] in ".?", text
        assert not re.search(r"\d", text), text  # no numbers, so nothing reads as an age
        assert not [word for word in WORDS_NOT_FOR_ANY_PROMPT if word in lowered], text
        assert not [word for word in YOUNG_WORDS if re.search(rf"\b{word}\b", lowered)], text
        # No real, named people: a capital letter only starts a sentence.
        inner = re.findall(r"(?<![.?!] )(?<!^)\b[A-Z][a-z]+", text)
        assert set(inner) <= {"Monday"}, text
        if name.startswith("friendly"):
            assert not [word for word in ADULT_WORDS if word in lowered], text
        if name == "naughty dares" and any(phrase in lowered for phrase in ANOTHER_PLAYER):
            assert "if they say yes" in lowered or "with their yes" in lowered, text


def test_burning_building_candidates_are_plain_fictional_roles():
    for candidate in CANDIDATES:
        assert re.fullmatch(r"an? [a-z' -]+( DJ)?", candidate), candidate
        assert 5 <= len(candidate) <= 40
        assert not [word for word in YOUNG_WORDS if re.search(rf"\b{word}\b", candidate)]
        assert not [word for word in ADULT_WORDS if word in candidate]


@pytest.mark.parametrize(("seats", "each"), [(2, 4), (3, 4), (4, 4), (5, 3), (7, 3), (8, 2), (10, 2)])
def test_everyone_gets_the_same_number_of_turns(seats, each):
    assert turns_each(seats) == each
    state = start(seats)
    assert state["turns_per_player"] == each
    order = []
    chooser = random.Random(seats)

    def watch(current):
        if current["phase"] == "choose":
            order.append(current["order"][current["turn"]])

    state = play_out(state, chooser, watch)
    players = state["order"]
    assert order == players * each
    assert state["turns_taken"] == dict.fromkeys(players, each)
    assert all(ENGINE.legal_actions(state, p) == [] for p in players)
    assert state["winners"] == [p for p in players if state["scores"][p] == max(state["scores"].values())]


def test_seat_limits_and_a_seeded_start():
    for count in (1, 11):
        with pytest.raises(RuleError):
            ENGINE.setup([f"p{i}" for i in range(count)], {})
    assert start() == start() and start(seed=5)["stock"] != start()["stock"]
    state = start()
    assert state["edition"] == "friendly" and state["burning"] and not state["name_players"]
    assert sorted(state["stock"]["truth"]) == list(range(len(FRIENDLY_TRUTHS)))
    assert sorted(state["stock"]["burning"]) == list(range(len(TRIOS)))


def test_truth_and_dare_are_shown_to_everyone_then_done_or_passed():
    state = start()
    assert kinds(state) == ["pick", "pick", "pick"] and kinds(state, "p1") == []
    assert [o.action.choice for o in ENGINE.legal_actions(state, "p0")] == ["truth", "dare", "burning"]
    state = act(state, "pick", "truth")
    prompt = state["prompt"]
    assert prompt["kind"] == "truth" and prompt["text"] in FRIENDLY_TRUTHS
    assert prompt == {"player": "p0", "kind": "truth", "text": prompt["text"],
                      "candidates": None, "swapped": False}
    assert kinds(state) == ["done", "skip", "swap"] and kinds(state, "p2") == []
    details = [ENGINE.project_view(state, p).detail for p in state["order"]]
    assert details[0] == details[1] == details[2] and set(details[0]) == DETAIL_KEYS
    assert details[0]["prompt"] == prompt
    state = act(state, "done")
    assert state["scores"]["p0"] == 1 and state["turns_taken"]["p0"] == 1
    assert state["last_result"] == {"player": "p0", "kind": "truth", "text": prompt["text"],
                                    "candidates": None, "fates": None, "outcome": "done",
                                    "points": 1}
    assert state["phase"] == "choose" and state["prompt"] is None
    assert ENGINE.project_view(state, "p0").current_player == "p1"
    state = act(act(state, "pick", "dare"), "done")
    assert state["scores"]["p1"] == 2 and state["last_result"]["text"] in FRIENDLY_DARES
    state = act(act(state, "pick", "dare"), "skip")
    assert state["scores"]["p2"] == 0 and state["turns_taken"]["p2"] == 1
    assert (state["last_result"]["outcome"], state["last_result"]["points"]) == ("passed", 0)


def test_one_swap_per_player_for_the_whole_match():
    state = act(start(), "pick", "truth")
    first = state["prompt"]["text"]
    assert state["swaps"] == {"p0": 1, "p1": 1, "p2": 1}
    state = act(state, "swap")
    assert state["prompt"]["kind"] == "truth" and state["prompt"]["swapped"] is True
    assert state["prompt"]["text"] != first and state["prompt"]["text"] in FRIENDLY_TRUTHS
    assert state["swaps"]["p0"] == 0 and kinds(state) == ["done", "skip"]
    assert ENGINE.project_view(state, "p1").detail["swaps_left"] == {"p0": 0, "p1": 1, "p2": 1}
    with pytest.raises(RuleError):
        act(state, "swap")
    state = act(state, "done")
    # The swap does not come back on that player's later turns, of any kind.
    for _ in range(2):
        state = act(act(state, "pick", "truth"), "done")
    state = act(state, "pick", "dare")
    assert state["order"][state["turn"]] == "p0" and "swap" not in kinds(state)
    state = act(state, "done")
    for _ in range(2):
        state = act(act(state, "pick", "truth"), "done")
    state = act(state, "pick", "burning")
    assert state["order"][state["turn"]] == "p0" and "swap" not in kinds(state)
    # Another player still has theirs, and can use it on a burning building.
    other = act(act(act(start(), "pick", "truth"), "done"), "pick", "burning")
    shown = other["prompt"]["candidates"]
    other = act(other, "swap")
    assert other["prompt"]["kind"] == "burning" and other["prompt"]["swapped"]
    assert other["prompt"]["candidates"] != shown and other["swaps"]["p1"] == 0


def test_burning_building_gives_three_candidates_three_different_fates():
    state = act(start(), "pick", "burning")
    assert state["phase"] == "assign"
    candidates = state["prompt"]["candidates"]
    assert tuple(c["label"] for c in candidates) in TRIOS
    assert all(c["player"] is None for c in candidates) and state["prompt"]["text"] is None
    options = ENGINE.legal_actions(state, "p0")
    assert [o.action.type for o in options] == ["assign"] * 6 + ["swap"]  # no passing here
    assert sorted(o.action.choice for o in options[:6]) == sorted(ASSIGNMENTS) == [
        "012", "021", "102", "120", "201", "210"]
    labels = [c["label"] for c in candidates]
    assert options[1].label == f"Kiss {labels[0]} · Leave behind {labels[1]} · Marry {labels[2]}"
    before = json.dumps(state, sort_keys=True)
    for kind, choice in [("assign", "001"), ("assign", "0123"), ("assign", ""), ("done", ""),
                         ("skip", ""), ("next", "")]:
        with pytest.raises(RuleError):
            act(state, kind, choice)
    assert json.dumps(state, sort_keys=True) == before
    state = act(state, "assign", "201")
    assert state["phase"] == "result" and state["scores"]["p0"] == 1
    assert state["last_result"] == {"player": "p0", "kind": "burning", "text": None,
                                    "candidates": candidates, "fates": [2, 0, 1],
                                    "outcome": "assigned", "points": 1}
    # Everyone reads the same result; only the player whose turn it was moves on.
    views = [ENGINE.project_view(state, p) for p in state["order"]]
    assert views[0].detail == views[1].detail == views[2].detail
    assert views[0].detail["fates"] == ["Kiss", "Marry", "Leave behind"]
    assert [kinds(state, p) for p in state["order"]] == [["next"], [], []]
    state = act(state, "next")
    assert state["phase"] == "choose" and state["order"][state["turn"]] == "p1"


def test_burning_building_can_be_switched_off():
    state = start(burning_building=False)
    assert [o.action.choice for o in ENGINE.legal_actions(state, "p0")] == ["truth", "dare"]
    assert ENGINE.project_view(state, "p0").detail["burning_building"] is False
    assert ENGINE.project_view(state, "p0").message == "Choose truth or dare."
    with pytest.raises(RuleError):
        act(state, "pick", "burning")
    seen = set()
    play_out(state, random.Random(2), lambda s: seen.add(s["phase"]))
    assert seen == {"choose", "prompt", "finished"}


def test_the_naughty_edition_uses_its_own_deck_and_fates():
    state = start(adults_only=True)
    assert state["edition"] == "naughty"
    view = ENGINE.project_view(state, "p1")
    assert view.detail["edition"] == "naughty" and view.detail["fates"] == NAUGHTY_FATES
    truth = act(state, "pick", "truth")["prompt"]["text"]
    dare = act(state, "pick", "dare")["prompt"]["text"]
    assert truth in NAUGHTY_TRUTHS and dare in NAUGHTY_DARES
    burning = act(state, "pick", "burning")
    assert ENGINE.legal_actions(burning, "p0")[0].label.startswith("Fuck ")
    shown = set()

    def watch(current):
        for key in ("prompt", "last_result"):
            if current[key] and current[key]["text"]:
                shown.add(current[key]["text"])

    play_out(state, random.Random(8), watch)
    assert shown and shown <= set(NAUGHTY_TEXT)


@pytest.mark.parametrize("settings", [{}, {"burning_building": False}, {"name_players": True},
                                      {"adults_only": False, "name_players": True}])
@pytest.mark.parametrize("seats", [2, 5, 10])
def test_a_friendly_match_never_shows_a_naughty_prompt_or_fate(settings, seats):
    needles = [text.lower() for text in NAUGHTY_TEXT] + ["fuck", "kill"]
    friendly = [*FRIENDLY_TRUTHS, *FRIENDLY_DARES]
    for seed in range(4):
        state = start(seats, seed=seed, **settings)
        players = state["order"]

        def watch(current, players=players):
            for viewer in players:
                view = ENGINE.project_view(current, viewer)
                wire = view.model_dump_json()
                lowered = wire.lower()
                assert not [needle for needle in needles if needle in lowered]
                assert '"stock"' not in wire and '"seed"' not in wire and '"named"' not in wire
                # Only the prompt on the table and the last result are ever sent.
                allowed = {item["text"] for item in (current["prompt"], current["last_result"])
                           if item and item["text"]}
                assert {text for text in friendly if json.dumps(text) in wire} == allowed
                labels = {c["label"] for item in (current["prompt"], current["last_result"])
                          if item and item["candidates"] for c in item["candidates"]}
                assert {c for c in CANDIDATES if json.dumps(c) in wire} == labels - {None}

        play_out(state, random.Random(seed), watch)


@pytest.mark.parametrize("adults", [False, True])
def test_no_prompt_repeats_within_a_match(adults):
    for seats in (2, 7, 10):
        for seed in range(6):
            shown = []

            def watch(current, shown=shown):
                # Every state holding a prompt is a fresh draw: a pick or a swap.
                prompt = current["prompt"]
                if prompt:
                    shown.append(prompt["text"] or tuple(
                        c["label"] or c["player"] for c in prompt["candidates"]))

            play_out(start(seats, seed=seed, adults_only=adults), random.Random(seed), watch)
            assert len(shown) == len(set(shown)) and len(shown) >= seats * turns_each(seats)


def test_named_players_need_three_other_people_at_the_table():
    def burning_rounds(seats, seed):
        rounds = []

        def watch(current):
            prompt = current["prompt"]
            if prompt and prompt["kind"] == "burning":
                rounds.append((prompt["player"], prompt["candidates"]))

        state = start(seats, seed=seed, name_players=True)
        chooser = random.Random(seed)
        for _ in range(400):
            watch(state)
            if state["phase"] == "finished":
                break
            options = ENGINE.legal_actions(state, state["order"][state["turn"]])
            wanted = [o for o in options if o.action.choice == "burning"] or options
            state = ENGINE.apply_action(state, state["order"][state["turn"]], chooser.choice(wanted).action)
        return state["order"], rounds

    for seats in (2, 3):
        for seed in range(6):
            _, rounds = burning_rounds(seats, seed)
            assert rounds and all(c["player"] is None and c["label"] in CANDIDATES
                                  for _, trio in rounds for c in trio)
    named = authored = 0
    for seed in range(6):
        players, rounds = burning_rounds(5, seed)
        for chooser, trio in rounds:
            ids = [c["player"] for c in trio]
            if ids[0] is None:
                authored += 1
                assert all(c["player"] is None and c["label"] in CANDIDATES for c in trio)
            else:
                named += 1
                assert len(set(ids)) == 3 and chooser not in ids and set(ids) <= set(players)
                assert all(c["label"] is None for c in trio)
    assert named and authored
    # Off by default: never a player, however many are seated.
    for seed in range(4):
        state = start(10, seed=seed)
        play_out(state, random.Random(seed), lambda s: [
            pytest.fail("a player was named") for c in (s["prompt"] or {}).get("candidates") or []
            if c["player"] is not None])


def test_named_candidates_are_ids_and_the_options_speak_of_seats():
    for seed in range(40):
        state = act(start(5, seed=seed, name_players=True), "pick", "burning")
        if state["prompt"]["candidates"][0]["player"] is not None:
            break
    seats = [state["order"].index(c["player"]) + 1 for c in state["prompt"]["candidates"]]
    label = ENGINE.legal_actions(state, "p0")[0].label
    assert label == (f"Kiss the player in seat {seats[0]} · Marry the player in seat {seats[1]}"
                     f" · Leave behind the player in seat {seats[2]}")


def test_the_view_is_shared_and_never_depends_on_the_undrawn_deck():
    state = act(start(), "pick", "dare")
    wire = [ENGINE.project_view(state, p).model_dump_json() for p in state["order"]]
    other = json.loads(json.dumps(state))
    for kind in other["stock"]:
        other["stock"][kind] = sorted(other["stock"][kind])
    other["seed"] = 1
    assert [ENGINE.project_view(other, p).model_dump_json() for p in state["order"]] == wire
    assert ENGINE.project_view(state, "nobody").actions == []


def test_scores_decide_the_winner_and_ties_share():
    state = start(2, burning_building=False)
    plan = [("truth", "done"), ("dare", "done")] * 2 + [("dare", "skip"), ("truth", "done")] * 2
    for kind, answer in plan:
        state = act(act(state, "pick", kind), answer)
    assert state["phase"] == "finished"
    assert state["scores"] == {"p0": 2, "p1": 6} and state["winners"] == ["p1"]
    view = ENGINE.project_view(state, "p0")
    assert [(p.id, p.score, p.count) for p in view.players] == [("p0", 2, 4), ("p1", 6, 4)]
    assert view.current_player is None and view.winners == ["p1"]
    level = start(2, burning_building=False)
    for _ in range(8):
        level = act(act(level, "pick", "truth"), "skip")
    assert level["scores"] == {"p0": 0, "p1": 0} and level["winners"] == ["p0", "p1"]


def test_rejected_actions_leave_the_state_untouched():
    state = act(start(), "pick", "truth")
    before = json.dumps(state, sort_keys=True)
    for player, action in [
        ("p1", Action(type="done")),
        ("p0", Action(type="pick", choice="dare")),
        ("p0", Action(type="assign", choice="012")),
        ("p0", Action(type="next")),
        ("nobody", Action(type="skip")),
        ("p0", Action(type="invented")),
    ]:
        with pytest.raises(RuleError):
            ENGINE.apply_action(state, player, action)
    assert json.dumps(state, sort_keys=True) == before
    with pytest.raises(RuleError):
        act(start(), "pick", "everything")


def test_history_uses_fixed_wording_and_never_a_prompt():
    state = start(adults_only=True)
    people = state["order"]
    labels = []
    for kind, choice in [("pick", "truth"), ("swap", ""), ("done", ""), ("pick", "dare"),
                         ("skip", ""), ("pick", "burning"), ("assign", "120"), ("next", "")]:
        actor = state["order"][state["turn"]]
        action = Action(type=kind, choice=choice)
        before = {p: ENGINE.project_view(state, p) for p in people}
        state = ENGINE.apply_action(state, actor, action)
        after = {p: ENGINE.project_view(state, p) for p in people}
        event = public_move(before, after, actor, action, len(labels) + 2)
        labels.append(event.label)
        wire = event.model_dump_json().lower()
        assert not [text for text in NAUGHTY_TEXT if text.lower() in wire]
        assert "fuck" not in wire and "kill" not in wire and event.cards == []
    assert labels == ["Chose truth", "Swapped the prompt", "Marked it done", "Chose dare",
                      "Passed", "Chose burning building", "Chose three fates",
                      "Moved to the next turn"]
    assert set(LABELS["truth-or-dare"]) == {"pick", "done", "skip", "swap", "assign", "next"}


def test_hard_bots_mostly_do_it_and_spread_their_choices():
    picks, answers = Counter(), Counter()
    for seed in range(300):
        memory = {"seed": seed}
        state = start(4, seed=seed)
        picks[choose_action(ENGINE.project_view(state, "p0"), "p0", memory).action.choice] += 1
        state = act(state, "pick", "dare")
        answers[choose_action(ENGINE.project_view(state, "p0"), "p0", memory).action.type] += 1
    assert picks["truth"] > picks["dare"] > picks["burning"] > 20
    assert answers["done"] > 240 and answers["skip"] and answers["swap"]
    state = act(start(4), "pick", "burning")
    fates = {choose_action(ENGINE.project_view(state, "p0"), "p0", {"seed": s}).action.choice
             for s in range(60)}
    assert fates == set(ASSIGNMENTS)


@pytest.mark.parametrize("level", ["easy", "medium"])
def test_lower_levels_pass_more_but_never_hold_up_the_table(level):
    done = {"hard": 0, level: 0}
    for seed in range(250):
        state = act(start(4, seed=seed), "pick", "dare")
        view = ENGINE.project_view(state, "p0")
        for name in done:
            done[name] += choose_action(view, "p0", {"seed": seed}, name).action.type == "done"
        review = act(act(start(4, seed=seed), "pick", "burning"), "assign", "012")
        assert choose_action(ENGINE.project_view(review, "p0"), "p0", {"seed": seed},
                             level).action.type == "next"
    assert done[level] < done["hard"]


def test_a_bot_leaves_the_fates_up_before_moving_on():
    human, bot = "human-1", f"bot:{1:032x}"
    state = ENGINE.setup([bot, human], {}, seed=1)
    state = act(act(state, "pick", "burning"), "assign", "012")
    members = [Member(room_id="room", user_id=bot, is_bot=True, seated=True)]
    assert bot_delay(ENGINE, state, members) == BOT_REVIEW_DELAY_SECONDS["next"] == 6.0
