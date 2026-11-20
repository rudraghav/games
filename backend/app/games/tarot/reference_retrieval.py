"""Local meaning-based reference selection with public evidence and diversity."""

import hashlib
import json
import re
from collections import Counter
from dataclasses import dataclass, field
from functools import lru_cache, partial
from itertools import islice
from pathlib import Path

import numpy as np

from app.games.tarot.deck import BY_ID, DECK
from app.games.tarot.semantic_encoder import FloatMatrix, encoder
from app.games.tarot.style import ReadingStyle

ROOT = Path(__file__).parent
FAMILIAR_CAST = frozenset(
    identity for group in json.loads((ROOT / "familiar-cast.json").read_text()).values()
    for identity in group
)
# Specific public scenes of asking for help, accompanying someone, or caring
# for others. A sporting defeat can sound semantically close to bereavement.
SUPPORT_SCENES = frozenset({
    "mulan", "moana", "elsa", "joy", "shrek", "miguel", "mirabel", "chihiro",
    "geet", "poo", "rani", "rancho", "leslie-knope", "fleabag", "ted-lasso",
    "shuri", "gandalf", "miles-morales", "katniss", "eleven", "hermione",
    "harry-potter", "matilda", "frodo", "paddington", "munna-bhai-q6936780",
    "winnie-the-pooh-q188574", "simone-biles-q7520267", "dolly-parton-q180453",
    "amitabh-bachchan-q9570", "a-p-j-abdul-kalam-q9513",
})
SENSITIVE_TOPIC = re.compile(
    r"\b(?:grie(?:f|v\w*)|bereav\w*|mourn\w*|funeral|death|dying|died|passed away|"
    r"loss of (?:my|our|a loved|a friend)|lost (?:my|our) (?:friend|partner|parent|mom|mum|dad|"
    r"mother|father|son|daughter|sister|brother|child|baby|husband|wife|grand\w*)|"
    r"miscarri\w*|abuse\w*|abusive|assault\w*|trauma\w*|suicid\w*|self[- ]harm\w*|"
    r"depress\w*|diagnos\w*|cancer|terminal illness|evict\w*|homeless\w*)\b", re.I,
)
ABBREVIATION = re.compile(r"(?:\b(?:mr|mrs|ms|dr|prof|st|sr|jr|no)|\b(?:[a-z]\.)*[a-z])\.$", re.I)
INDEX_VERSION = "tarot-reference-retrieval-1"
# Reviewed eligibility for new comparisons only. Canonical identities, artwork
# and indexed rows remain available to resolve saved historical readings.
NEW_READING_EXCLUSIONS = {
    "bohdan-khmelnytsky-q203808": (
        "Reviewed source context consists of massacres, enslavement and attempted "
        "eradication; unsuitable as a personal reflective comparison."
    ),
}
ROLE_CONTEXTS = (
    "The present situation: notice the current tension, competing needs and what deserves attention.",
    "What is shifting: a transition, changed perspective, letting go or learning a different response.",
    "A useful next step: a small deliberate action, practice, choice or boundary rather than a prediction.",
)


@lru_cache(maxsize=1)
def contexts() -> dict[str, dict]:
    path = ROOT / "reference-lenses.json"
    data = json.loads(path.read_text()) if path.exists() else {}
    allowed = {"sourceContext", "contextSourceUrl", "identityFamily"}
    if not isinstance(data, dict) or any(not isinstance(value, dict) or set(value) - allowed for value in data.values()):
        raise ValueError("Reference lenses may enrich evidence, not overwrite identities.")
    return data


@lru_cache(maxsize=1)
def reviewed_phrases() -> dict[str, list[str]]:
    return json.loads((ROOT / "familiar-scenes.json").read_text())


def enriched(references: list[dict]) -> list[dict]:
    lenses = contexts()
    if set(lenses) - {reference["id"] for reference in references}:
        raise ValueError("A reference lens has no matching canonical identity.")
    result = []
    for reference in references:
        lens = lenses.get(reference["id"], {})
        entry = {**reference, **lens}
        if "sourceContext" in lens:
            # The selected passage's citation replaces the imported excerpt.
            for key in ("contextLicense", "contextAttribution", "contextModifications", "contextRetrievedAt"):
                entry.pop(key, None)
        result.append(entry)
    return result


def document(reference: dict) -> str:
    return " ".join(filter(None, (
        reference["name"] + " (" + reference["source"] + ").",
        reference.get("tradition", ""), reference.get("sourceContext", ""),
    )))


def meaning_hashes() -> dict[str, str]:
    return {
        "cardMeaningHash": hashlib.sha256(json.dumps(
            [(card.id, card.name, card.meaning) for card in DECK], ensure_ascii=False,
        ).encode()).hexdigest(),
        "roleMeaningHash": hashlib.sha256(json.dumps(ROLE_CONTEXTS).encode()).hexdigest(),
    }


def catalogue_hash(references: list[dict]) -> str:
    fields = ("id", "name", "source", "sourceContext", "contextSourceUrl", "kind",
              "category", "identityFamily", "tradition", "recognizability")
    data = [{field: entry.get(field) for field in fields} for entry in references]
    return hashlib.sha256(json.dumps(data, ensure_ascii=False, sort_keys=True).encode()).hexdigest()


@lru_cache(maxsize=1)
def load_index() -> tuple[dict, FloatMatrix, FloatMatrix, FloatMatrix]:
    manifest = json.loads((ROOT / "reference-index.json").read_text())
    path = ROOT / "reference-index.npz"
    model_hash = hashlib.sha256((ROOT / "semantic_model/manifest.json").read_bytes()).hexdigest()
    if any(manifest.get(key) != value for key, value in meaning_hashes().items()):
        raise ValueError("The public Tarot index uses outdated card or position meanings.")
    if manifest["modelManifestSha256"] != model_hash:
        raise ValueError("The public Tarot index uses a different retrieval model.")
    if manifest["version"] != INDEX_VERSION or hashlib.sha256(path.read_bytes()).hexdigest() != manifest["sha256"]:
        raise ValueError("The public Tarot reference index failed its integrity check.")
    with np.load(path, allow_pickle=False) as arrays:
        documents = np.asarray(arrays["references"], dtype=np.float32)
        cards = np.asarray(arrays["cards"], dtype=np.float32)
        roles = np.asarray(arrays["roles"], dtype=np.float32)
    if documents.shape != (len(manifest["ids"]), 384) or cards.shape != (78, 384) or roles.shape != (3, 384):
        raise ValueError("The public Tarot reference index has invalid dimensions.")
    if not all(np.isfinite(values).all() for values in (documents, cards, roles)):
        raise ValueError("The public Tarot reference index contains invalid vectors.")
    return manifest, documents, cards, roles


def words(value: str) -> set[str]:
    return set(re.findall(r"[\w]+", value.casefold())) - {
        "the", "and", "for", "with", "that", "this", "from", "what", "how", "could", "would",
        "should", "have", "has", "was", "were", "are", "can", "someone", "about", "into",
    }


def _scene_window(sentence: str, phrase: str, limit: int) -> str:
    """A verbatim window with the complete phrase, with ellipses for omitted text."""
    if len(sentence) <= limit:
        return sentence
    room = limit - 2
    anchor = sentence.index(phrase)
    start = max(0, min(anchor - (room - len(phrase)) // 2, len(sentence) - room))
    stop = start + room
    if start and not sentence[start - 1].isspace():
        space = sentence.find(" ", start, anchor)
        start = space + 1 if space >= 0 else anchor
    if stop < len(sentence) and not sentence[stop].isspace():
        space = sentence.rfind(" ", anchor + len(phrase), stop)
        stop = space if space >= 0 else anchor + len(phrase)
    return ("…" if start else "") + sentence[start:stop].strip() + ("…" if stop < len(sentence) else "")


def evidence_excerpt(reference: dict, query: str, *, limit: int = 320,
                     scene_phrases: tuple[str, ...] | list[str] = ()) -> str:
    """Prefer a complete relevant sourced sentence, rather than an occupation label."""
    context = reference.get("sourceContext", "")
    if not context:
        return reference.get("description", "")
    # Preserve subjects and framing (for example, a novelist describing a
    # fictional life) whenever the complete evidence already fits the budget.
    if len(context) <= limit:
        return context
    target = words(query)
    boundaries = [boundary for boundary in re.finditer(r'(?:(?<=[.!?])|(?<=[.!?]["”]))\s+(?=[A-Z\d])', context)
                  if not ABBREVIATION.search(context[:boundary.start()])]
    starts = [0, *(boundary.end() for boundary in boundaries)]
    ends = [*(boundary.start() for boundary in boundaries), len(context)]
    sentences = [context[start:end] for start, end in zip(starts, ends, strict=True)]
    complete = [part for part in sentences if 35 <= len(part) <= limit
                and part.count('"') % 2 == 0 and part.count("“") == part.count("”")]
    if scene_phrases:
        anchored = [part for part in complete if any(phrase in part for phrase in scene_phrases)]
        if anchored:
            complete = anchored
        else:
            # Long source sentences sometimes leave only cast or creator credits
            # in the short-sentence pool. Retain a verbatim window around the
            # reviewed action, marking either cut at a whole-word boundary.
            for part in sentences:
                for phrase in scene_phrases:
                    if phrase in part and len(phrase) + 2 <= limit:
                        return _scene_window(part, phrase, limit)
    standalone = [part for part in complete if not re.match(r"(?:It|This|These|Those|One of these)\b", part)]
    complete = standalone or complete
    if complete:
        def value(part: str) -> float:
            overlap = len(words(part) & target) / max(len(words(part)), 8) ** 0.5
            action = bool(re.search(r"\b(?:discover|develop|creat|learn|train|choos|refus|protect|build|invent|help|rescu|reform|transform|lead|leads|found|return|leave|leaves|give|gives|share|teach|taught)\w*\b", part, re.I))
            dates = bool(re.search(r"(?:born|died|\b[12]\d{3}\b.*[–-].*\b[12]\d{3}\b)", part, re.I))
            return overlap + 0.3 * action - 0.35 * dates
        best = max(complete, key=value)
        position = sentences.index(best)
        # Preserve an antecedent or the consequence next to a selected action
        # when both fit. Only return a contiguous passage of the cited source.
        for neighbour in (position - 1, position + 1):
            if 0 <= neighbour < len(sentences) and sentences[neighbour] in complete:
                passage = context[starts[min(position, neighbour)]:ends[max(position, neighbour)]]
                if len(passage) <= limit:
                    return passage
        return best
    # This is an explicitly shortened excerpt, never an invented replacement fact.
    shortened = context[: limit - 3].rsplit(" ", 1)[0] + "…"
    # The ellipsis remains inside the quotation: close punctuation without
    # presenting a partial quotation as a complete source sentence.
    if shortened.count('"') % 2:
        shortened += '"'
    if shortened.count("“") > shortened.count("”"):
        shortened += "”"
    return shortened


def _relative(values: FloatMatrix) -> FloatMatrix:
    # Only relative ranking matters for this model; cosine is not confidence.
    # Preserve strong outliers: clipping the upper tail makes an exact scene
    # indistinguishable from dozens of loosely related biographies.
    low, high = np.percentile(values, [20, 99])
    return np.maximum((values - low) / max(float(high - low), 0.02), 0)


@dataclass
class _CardMatches:
    relevance: FloatMatrix
    rotation: FloatMatrix
    order: list[int]
    familiar: list[int]
    meme_pool: set[int]
    choices: list[dict] = field(default_factory=list)
    categories: Counter[str] = field(default_factory=Counter)
    sources: Counter[str] = field(default_factory=Counter)


def rank_candidates(
    references: list[dict], vectors: FloatMatrix, card_vectors: FloatMatrix,
    role_vectors: FloatMatrix, question_vector: FloatMatrix | None,
    card_ids: list[str], question: str, *, per_card: int = 6, reading_style: ReadingStyle = "classic",
    reference_baseline: FloatMatrix | float = 0.0,
) -> list[list[dict]]:
    """Pure ranking over supplied public vectors; no I/O, model or user-state lookup."""
    question_scores = _relative(vectors @ question_vector - reference_baseline) if question_vector is not None else None
    question_meme_floor = float(np.percentile(question_scores, 98)) if question_scores is not None else 0.0
    question_words = words(question)
    # A player's personal question can sound similar to a comic reaction for
    # the wrong reason. Offer reactions on an open Fun draw or by explicit request.
    sensitive = bool(SENSITIVE_TOPIC.search(question))
    wants_meme = not sensitive and (
        (not question.strip() and reading_style == "fun") or bool(
            question_words & {"meme", "memes", "funny", "playful", "humorous"}
        )
    )
    seed = hashlib.sha256(json.dumps([card_ids, question]).encode()).digest()
    cast_boost = np.zeros(len(references), dtype=np.float32)
    preferred_cast = SUPPORT_SCENES if sensitive else FAMILIAR_CAST
    familiar = {index for index, ref in enumerate(references) if ref["id"] in preferred_cast}
    for index, reference in enumerate(references):
        # Regional editorial tiers avoid an English-pageview popularity contest.
        cast_boost[index] = {"major": 0.035, "regional": 0.025}.get(reference.get("recognizability", ""), 0.0)
        if question_words:
            names = [reference["name"], *reference.get("aliases", []), reference["source"]]
            if any(tokens and tokens <= question_words for tokens in map(words, names)):
                cast_boost[index] += 0.08
            # A named specialist can still lead a Classic reading about them.
            if reading_style == "classic" and any(
                len(name.split()) > 1 and name.casefold() in question.casefold()
                for name in [reference["name"], *reference.get("aliases", [])]
            ):
                familiar.add(index)

    card_scores = [_relative(vectors @ vector - reference_baseline) for vector in card_vectors]
    matches = []
    for position, card_id in enumerate(card_ids):
        card_score = card_scores[position]
        role_score = _relative(vectors @ role_vectors[position] - reference_baseline)
        # A bridge must fit this card first. The middle position can connect
        # either neighbour without averaging away a contrast between the two.
        neighbours = card_scores[max(0, position - 1):position] + card_scores[position + 1:position + 2]
        bridge = np.minimum(card_score, np.maximum.reduce(neighbours)) if neighbours else card_score
        relevance = (0.61 * card_score + 0.23 * role_score + 0.16 * bridge) if question_scores is None else (
            0.54 * question_scores + 0.28 * card_score + 0.08 * role_score + 0.10 * bridge
        )
        relevance += cast_boost
        rotation = np.empty(len(references), dtype=np.float32)
        for index, reference in enumerate(references):
            tie = hashlib.sha256(seed + card_id.encode() + reference["id"].encode()).digest()
            rotation[index] = int.from_bytes(tie[:2]) / 65535
        # Rotate close comparisons between spreads; 0.12 is the maximum seeded
        # advantage for a lead, regardless of the size of the public catalogue.
        relevance += 0.12 * rotation
        order = [int(index) for index in np.argsort(-relevance, kind="stable")
                 if references[int(index)]["id"] not in NEW_READING_EXCLUSIONS]
        # A comic scene is an optional comparison. With a question, it
        # must be among the strongest topical matches as well as fitting the card.
        familiar_order = [index for index in order if index in familiar]
        if reading_style == "fun":
            order = familiar_order
        meme_pool = {index for index in order[:12] if wants_meme
                     and (question_scores is None or question_scores[index] >= question_meme_floor)}
        matches.append(_CardMatches(np.asarray(relevance, dtype=np.float32), rotation, order, familiar_order, meme_pool))

    used_ids: set[str] = set()
    used_names: set[str] = set()
    used_families: set[str] = set()
    similarity = np.zeros(len(references), dtype=np.float32)
    spread_categories: Counter[str] = Counter()
    meme_selected = False

    def available(index: int, card: _CardMatches) -> bool:
        ref = references[index]
        return (ref["id"] not in used_ids and ref["name"].casefold() not in used_names
                and (ref.get("identityFamily") or ref["id"]) not in used_families
                and (ref.get("kind") != "meme" or (bool(card.choices) and not meme_selected and index in card.meme_pool)))

    def score(index: int, card: _CardMatches) -> float:
        ref = references[index]
        category = ref.get("category", "fiction")
        # Alternatives can range a little more widely than the primary match.
        variation = 0.08 * float(card.rotation[index]) if card.choices else 0.0
        return float(card.relevance[index]) + variation - (
            0.10 * max(0.0, float(similarity[index]) - 0.55) + 0.10 * card.categories[category]
            + 0.025 * spread_categories[category] + 0.07 * card.sources[ref["source"]]
        )

    # Give every position its best available lead before reserving backups.
    # A two-candidate provider now sees the same pairs as a six-candidate one.
    def lead_advantage(position: int) -> float:
        card = matches[position]
        leads = list(islice((index for index in card.familiar or card.order
                             if references[index].get("kind") != "meme"), 2))
        if len(leads) < 2:
            return 0.0
        return float(card.relevance[leads[0]] - card.relevance[leads[1]])

    # Let the position with the clearest first choice claim a contested identity.
    # Return rows in draw order regardless of the reservation order.
    positions = sorted(range(len(matches)), key=lead_advantage, reverse=True)
    for slot in range(per_card):
        for position in positions:
            card = matches[position]
            # Compact providers see two familiar options. The full Classic
            # shortlist also gives specialists three unrestricted slots.
            order = card.familiar if slot in (0, 1, 3) and card.familiar else card.order
            eligible = [index for index in order[:180] if available(index, card)]
            if not eligible:
                eligible = [index for index in order[180:] if available(index, card)]
            if not eligible and order is not card.order:
                eligible = [index for index in card.order if available(index, card)]
            if not eligible:
                continue
            chosen = max(eligible, key=partial(score, card=card))
            reference = references[chosen]
            context = question + " " + BY_ID[card_ids[position]].meaning + " " + ROLE_CONTEXTS[position]
            hints = reviewed_phrases().get(reference["id"], []) if reading_style == "fun" else []
            card.choices.append({**reference, "public_context": evidence_excerpt(reference, context, scene_phrases=hints)})
            meme_selected = meme_selected or reference.get("kind") == "meme"
            used_ids.add(reference["id"])
            used_names.add(reference["name"].casefold())
            used_families.add(reference.get("identityFamily") or reference["id"])
            np.maximum(similarity, vectors @ vectors[chosen], out=similarity)
            category = reference.get("category", "fiction")
            card.categories[category] += 1
            card.sources[reference["source"]] += 1
            spread_categories[category] += 1
    return [card.choices for card in matches]


def retrieve(references: list[dict], card_ids: list[str], question: str, *, per_card: int = 6,
             reading_style: ReadingStyle = "classic") -> list[list[dict]]:
    public = enriched(references)
    manifest, vectors, all_cards, roles = load_index()
    if manifest["catalogueHash"] != catalogue_hash(public) or manifest["ids"] != [entry["id"] for entry in public]:
        raise ValueError("The public Tarot reference index is stale; regenerate it before release.")
    card_vectors = all_cards[[manifest["cardIds"].index(card_id) for card_id in card_ids]]
    # One in-memory encoding for this question. No query cache, profile lookup or network.
    question_vector = encoder().encode([question], query=True)[0] if question.strip() else None
    # A multi-theme biography can be close to almost every card. Discount its
    # typical similarity to the *whole public deck* so a specific scene wins
    # on the meaning it adds to this spread. No reading history is involved.
    baseline = 0.8 * (vectors @ all_cards.mean(axis=0))
    return rank_candidates(public, vectors, card_vectors, roles, question_vector,
                           card_ids, question, per_card=per_card, reading_style=reading_style,
                           reference_baseline=baseline)
