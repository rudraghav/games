"""Reference relevance, source evidence and identity invariants, independently of AI."""

import importlib.util
import json
from collections import Counter
from pathlib import Path

import numpy as np
import pytest

from app.games.tarot.reference_retrieval import (
    FAMILIAR_CAST,
    SUPPORT_SCENES,
    _relative,
    evidence_excerpt,
    rank_candidates,
)

CARDS = ["pentacles-08", "major-08", "wands-11"]


def test_editorial_cast_has_distinct_canonical_identities_sourced_facts_and_matching_art():
    from app.games.tarot.characters import CHARACTERS
    from app.games.tarot.reference_retrieval import ROOT

    catalogue = {entry["id"]: entry for entry in CHARACTERS}
    repo = Path(__file__).resolve().parents[2]
    images = {row["id"]: row for row in json.loads((repo / "packages/api-client/src/generated/tarot-characters.json").read_text())}
    groups = json.loads((ROOT / "familiar-cast.json").read_text())
    scenes = json.loads((ROOT / "familiar-scenes.json").read_text())
    assert len(FAMILIAR_CAST) == sum(map(len, groups.values()))
    assert set(scenes) == FAMILIAR_CAST
    assert SUPPORT_SCENES <= FAMILIAR_CAST
    for identity in FAMILIAR_CAST:
        entry, art = catalogue[identity], images[identity]
        assert entry["name"] == art["name"] and entry["source"] == art["source"]
        assert entry["sourceContext"] and entry["contextSourceUrl"].startswith("https://")
        anchors = scenes[identity]
        assert 1 <= len(anchors) == len(set(anchors)) <= 3
        assert all(len(anchor.split()) >= 2 and anchor in entry["sourceContext"] for anchor in anchors)
        assert art["origin"] == "sourced" and art["sourcePage"]
        assert (repo / "apps/web/public" / art["image"].lstrip("/")).is_file()


def test_short_and_full_fun_lists_only_offer_familiar_distinct_choices():
    from app.games.tarot.characters import reference_candidates

    question = "Practising football with a team"
    full = reference_candidates(CARDS, question, reading_style="fun")
    compact = reference_candidates(CARDS, question, reading_style="fun", per_card=2)
    assert compact == [row[:2] for row in full]
    assert len({item["id"] for row in full for item in row}) == 18
    assert all(item["id"] in FAMILIAR_CAST for row in full for item in row)
    classic = reference_candidates(CARDS, question)
    assert all(item["id"] in FAMILIAR_CAST for row in classic for item in row[:2])
    assert any(item["id"] not in FAMILIAR_CAST for row in classic for item in row)


def test_all_fun_figure_and_card_pairs_retain_a_reviewed_action_in_the_source_excerpt():
    from app.games.tarot.characters import CHARACTERS
    from app.games.tarot.deck import DECK
    from app.games.tarot.reference_retrieval import reviewed_phrases

    for figure in CHARACTERS:
        if hints := reviewed_phrases().get(figure["id"]):
            for card in DECK:
                excerpt = evidence_excerpt(figure, card.meaning, scene_phrases=hints)
                assert any(hint in excerpt for hint in hints)
                assert len(excerpt) <= 320 and excerpt.strip("…") in figure["sourceContext"]


def test_an_explicitly_named_specialist_can_still_lead_a_classic_card():
    from app.games.tarot.characters import reference_candidates

    classic = reference_candidates(CARDS, "How does the philosophy of Pierre de Fermat help me think about dividing rewards?")
    assert any(row[0]["name"] == "Pierre de Fermat" for row in classic)


def test_different_questions_and_spreads_do_not_all_lead_with_the_same_generalist():
    from app.games.tarot.characters import reference_candidates

    leads = Counter()
    for cards, question in [
        (["major-11", "major-09", "wands-01"], ""),
        (["wands-11", "pentacles-08", "major-08"], "What is a small first step for sharing my sketches with friends?"),
        (["cups-05", "major-17", "cups-03"], "How could I ask for company while grieving?"),
        (["swords-02", "pentacles-06", "major-14"], "How can a group split work fairly?"),
        (["major-07", "wands-07", "swords-04"], "How can I pace myself when training for a race?"),
        (["major-00", "major-16", "major-21"], ""),
    ]:
        leads.update(row[0]["id"] for row in reference_candidates(cards, question, reading_style="fun", per_card=1))
    assert len(leads) >= 13
    assert max(leads.values()) <= 3


@pytest.mark.parametrize("style", ["classic", "fun"])
def test_hardship_overrides_requested_comedy_in_every_candidate(style):
    from app.games.tarot.characters import reference_candidates

    rows = reference_candidates(CARDS, "Can you give me a meme about grieving my friend?", reading_style=style)
    assert all(len(row) == 6 for row in rows)
    assert all(item.get("kind") != "meme" for row in rows for item in row)
    if style == "fun":
        assert all(item["id"] in SUPPORT_SCENES for row in rows for item in row)


@pytest.mark.parametrize("phrase", ["Dr. Watson", "Mr. Darcy", "U.S. Navy", "J. R. R. Tolkien"])
def test_cited_excerpt_never_breaks_an_abbreviation_from_its_subject(phrase):
    sentence = f"The observer shared the most important clue with {phrase}."
    ref = {"sourceContext": f"{sentence} A separate description of the evidence follows in the published account."}
    assert evidence_excerpt(ref, "observer important clue", limit=len(sentence) + 1) == sentence


@pytest.mark.parametrize("excluded_position", [0, 180])
def test_reviewed_reference_exclusion_applies_to_primary_and_expanded_pools(excluded_position):
    references = [{
        "id": f"eligible-{index}", "name": f"Eligible {index}", "source": "Public history",
        "kind": "person", "identityFamily": "shared-family" if index < 180 else f"family-{index}",
    } for index in range(183)]
    references[excluded_position]["id"] = "bohdan-khmelnytsky-q203808"
    vectors = np.zeros((183, 384), dtype=np.float32)
    vectors[:180, 0] = 1
    vectors[180:, 0] = -0.1
    vectors[excluded_position, 0] = 10 if excluded_position == 0 else 0
    original_vectors = vectors.copy()
    neutral = np.zeros((3, 384), dtype=np.float32)
    query = np.eye(384, dtype=np.float32)[0]

    selected = rank_candidates(references, vectors, neutral, neutral, query,
                               CARDS, "Support after a loss", per_card=1)
    chosen = [reference for row in selected for reference in row]
    assert len(chosen) == 3
    assert all(reference["id"] != "bohdan-khmelnytsky-q203808" for reference in chosen)
    # Once a top-180 shared family is chosen, later cards require the full pool.
    assert sum(reference["identityFamily"] != "shared-family" for reference in chosen) >= 2
    assert references[excluded_position]["id"] == "bohdan-khmelnytsky-q203808"
    np.testing.assert_array_equal(vectors, original_vectors)


def test_reviewed_selection_exclusion_preserves_canonical_lookup_and_index_alignment():
    from app.games.tarot.characters import CHARACTERS, find_character
    from app.games.tarot.reference_retrieval import catalogue_hash, load_index

    reference = find_character("Bohdan Khmelnytsky", "Royal and political history")
    assert reference is not None and reference["id"] == "bohdan-khmelnytsky-q203808"
    manifest, vectors, _, _ = load_index()
    assert manifest["ids"] == [entry["id"] for entry in CHARACTERS]
    assert manifest["catalogueHash"] == catalogue_hash(CHARACTERS)
    position = manifest["ids"].index(reference["id"])
    assert CHARACTERS[position] is reference
    assert np.isfinite(vectors[position]).all()


def toy_cast():
    references = []
    vectors = []
    for index in range(24):
        art = index < 12
        references.append({
            "id": f"reference-{index}", "name": f"Reference {index}",
            "source": "Painting" if art else "Football", "aliases": [],
            "category": "visualarts" if art else "sport", "kind": "person",
            "sourceContext": "Documented work involves painting." if art else "Documented work involves football.",
            "recognizability": "supporting" if art else "major",
        })
        vector = np.zeros(384, dtype=np.float32)
        vector[0 if art else 1] = 1
        vectors.append(vector)
    return references, np.asarray(vectors)


def test_question_relevance_beats_fame_and_changes_connections_for_the_same_cards():
    references, vectors = toy_cast()
    neutral = np.zeros((3, 384), dtype=np.float32)
    art = np.eye(384, dtype=np.float32)[0]
    sport = np.eye(384, dtype=np.float32)[1]
    first = rank_candidates(references, vectors, neutral, neutral, art, CARDS, "Learning to paint", per_card=3)
    second = rank_candidates(references, vectors, neutral, neutral, sport, CARDS, "Learning football", per_card=3)
    assert first[0][0]["source"] == "Painting"
    assert second[0][0]["source"] == "Football"
    assert first == rank_candidates(references, vectors, neutral, neutral, art, CARDS, "Learning to paint", per_card=3)
    assert first != second


def test_reference_families_are_distinct_across_the_whole_spread():
    references, vectors = toy_cast()
    for reference in references[:5]:
        reference["identityFamily"] = "one-deity-in-distinct-forms"
    neutral = np.zeros((3, 384), dtype=np.float32)
    selected = rank_candidates(references, vectors, neutral, neutral, vectors[0], CARDS, "Reflection", per_card=6)
    flat = [item for row in selected for item in row]
    assert len(flat) == 18
    assert len({item["id"] for item in flat}) == 18
    assert sum(item.get("identityFamily") == "one-deity-in-distinct-forms" for item in flat) <= 1


def test_blank_question_uses_card_meanings_and_does_not_invent_user_context():
    references, vectors = toy_cast()
    roles = np.zeros((3, 384), dtype=np.float32)
    art = np.tile(vectors[0], (3, 1))
    sport = np.tile(vectors[-1], (3, 1))
    first = rank_candidates(references, vectors, art, roles, None, CARDS, "", per_card=2)
    second = rank_candidates(references, vectors, sport, roles, None, CARDS, "", per_card=2)
    assert first[0][0]["source"] == "Painting"
    assert second[0][0]["source"] == "Football"
    assert all("user" not in item for row in first for item in row)


def test_evidence_excerpt_uses_a_complete_relevant_sentence_without_new_facts():
    reference = {"sourceContext": (
        "This painter studied a range of artistic techniques. "
        "Her public work brought painting classes to adult beginners in local community spaces. "
        "She later received an award for her landscape paintings."
    )}
    excerpt = evidence_excerpt(reference, "adult beginners learning in a community class", limit=100)
    assert excerpt == "Her public work brought painting classes to adult beginners in local community spaces."
    assert excerpt in reference["sourceContext"]


def test_meme_shortlist_never_crowds_out_the_rest_of_a_reading():
    references, vectors = toy_cast()
    for reference in references[:12]:
        reference.update(kind="meme", category="memes")
    neutral = np.zeros((3, 384), dtype=np.float32)
    selected = rank_candidates(references, vectors, neutral, neutral, vectors[0], CARDS, "A funny moment", per_card=3)
    assert len([item for row in selected for item in row]) == 9
    assert sum(item["kind"] == "meme" for row in selected for item in row) == 1


def test_strong_semantic_matches_are_not_flattened_into_the_same_rank():
    similarities = np.asarray([0.1] * 400 + [0.4, 0.5, 0.7, 0.95], dtype=np.float32)
    relative = _relative(similarities)
    assert relative[-1] > relative[-2] > relative[-3]


def test_same_display_name_cannot_make_two_individually_valid_choices_conflict():
    references, vectors = toy_cast()
    for reference in references[:5]:
        reference["name"] = "Shared canonical name"
    neutral = np.zeros((3, 384), dtype=np.float32)
    selected = rank_candidates(references, vectors, neutral, neutral, vectors[0], CARDS, "Painting")
    names = [item["name"].casefold() for row in selected for item in row]
    assert len(names) == 18 and len(set(names)) == 18


def source_excerpt(text):
    spec = importlib.util.spec_from_file_location(
        "import_tarot_references", Path(__file__).resolve().parents[2] / "scripts/import_tarot_references.py",
    )
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.informative_excerpt(text)


def test_source_context_never_substitutes_a_real_namesake_for_the_fictional_subject():
    story = "The character supports a colleague at the paper company. He joins a new team after the branch closes."
    namesake = (
        "The character is named after a friend of the producer. "
        "The real-life namesake founded a research group and developed a scientific theory."
    )
    assert source_excerpt(story + "\n" + namesake) == story


def test_source_context_keeps_paragraphs_and_drops_detached_first_person_praise():
    facts = "The mathematician developed a theory of equations. She became the first woman appointed to the faculty."
    praise = "For me she symbolizes courage and wisdom. I admire how her discipline transformed research."
    assert source_excerpt(facts + "\n\n" + praise) == facts


def test_reference_excerpt_prefers_a_complete_subject_over_an_orphaned_pronoun():
    reference = {"sourceContext": (
        "The designer built geometric models while teaching at the academy. "
        "It proved a useful tool for teaching the theory to other people."
    )}
    assert evidence_excerpt(reference, "practising a useful skill", limit=90) == (
        "The designer built geometric models while teaching at the academy."
    )


def test_reference_excerpt_does_not_isolate_half_a_quotation():
    reference = {"sourceContext": (
        'The author wrote: "Learning happens through practice and experiment. '
        'Students should keep trying different approaches." '
        'Her public project provided drawing lessons for local beginners.'
    )}
    assert evidence_excerpt(reference, "learning through practice", limit=100) == (
        "Her public project provided drawing lessons for local beginners."
    )


def test_short_context_preserves_fictional_framing_before_a_relevant_plot_event():
    context = (
        "The author's novel follows a fictional musician as his career stalls. "
        "The death of his friend brings a legacy that could help rebuild his life."
    )
    assert evidence_excerpt({"sourceContext": context}, "support after a loss") == context


def test_unusually_long_source_quote_is_explicitly_shortened_with_balanced_punctuation():
    reference = {"sourceContext": 'The author wrote: "' + "A documented thought about practice " * 15 + '."'}
    excerpt = evidence_excerpt(reference, "practice")
    assert len(excerpt) <= 320
    assert excerpt.endswith('…"') and excerpt.count('"') == 2
    assert excerpt[:-2] in reference["sourceContext"]


def test_later_cards_keep_their_leads_when_a_provider_accepts_more_backups():
    references, vectors = toy_cast()
    neutral = np.zeros((3, 384), dtype=np.float32)
    for size in (1, 2):
        compact = rank_candidates(references, vectors, neutral, neutral, vectors[0], CARDS, "Painting", per_card=size)
        full = rank_candidates(references, vectors, neutral, neutral, vectors[0], CARDS, "Painting", per_card=6)
        assert compact == [row[:size] for row in full]


def test_contested_character_goes_to_the_card_that_has_fewer_close_alternatives():
    references, vectors = toy_cast()
    vectors.fill(0)
    vectors[0, :2] = (1, 1)
    vectors[1, 0] = 0.99
    vectors[2, 1] = 0.3
    vectors[3, 2] = 1
    directions = np.eye(384, dtype=np.float32)[:3]
    selected = rank_candidates(references, vectors, directions, np.zeros_like(directions),
                               None, CARDS, "", per_card=1)
    assert selected[0][0]["id"] == "reference-1"
    assert selected[1][0]["id"] == "reference-0"


def test_neighbour_meaning_breaks_a_tie_between_equally_strong_card_matches():
    references, vectors = toy_cast()
    vectors.fill(0)
    vectors[0, :2] = (1, 0.75)
    vectors[1, [0, 2]] = (1, 0.75)
    for index in (1, 2, 3):
        vectors[index + 1, index] = 1
    axes = np.eye(384, dtype=np.float32)
    neutral = np.zeros((3, 384), dtype=np.float32)
    first = rank_candidates(references, vectors, axes[[0, 1, 3]], neutral, None, CARDS, "", per_card=1)
    second = rank_candidates(references, vectors, axes[[0, 2, 3]], neutral, None, CARDS, "", per_card=1)
    assert first[0][0]["id"] == "reference-0"
    assert second[0][0]["id"] == "reference-1"
