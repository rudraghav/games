"""Local meaning-based reference selection with public evidence and diversity."""

import hashlib
import json
import re
from collections import Counter
from functools import lru_cache
from pathlib import Path

import numpy as np

from app.games.tarot.deck import BY_ID, DECK
from app.games.tarot.semantic_encoder import FloatMatrix, encoder

ROOT = Path(__file__).parent
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


def enriched(references: list[dict]) -> list[dict]:
    lenses = contexts()
    if set(lenses) - {reference["id"] for reference in references}:
        raise ValueError("A reference lens has no matching canonical identity.")
    return [{**reference, **lenses.get(reference["id"], {})} for reference in references]


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


def evidence_excerpt(reference: dict, query: str, *, limit: int = 320) -> str:
    """Prefer a complete relevant sourced sentence, rather than an occupation label."""
    context = reference.get("sourceContext", "")
    if not context:
        return reference.get("description", "")
    # Preserve subjects and framing (for example, a novelist describing a
    # fictional life) whenever the complete evidence already fits the budget.
    if len(context) <= limit:
        return context
    target = words(query)
    sentences = [part.strip() for part in re.split(r'(?:(?<=[.!?])|(?<=[.!?]["”]))\s+(?=[A-Z\d])', context)]
    complete = [part for part in sentences if 35 <= len(part) <= limit
                and part.count('"') % 2 == 0 and part.count("“") == part.count("”")]
    standalone = [part for part in complete if not re.match(r"(?:It|This|These|Those|One of these)\b", part)]
    complete = standalone or complete
    if complete:
        def value(part: str) -> float:
            overlap = len(words(part) & target) / max(len(words(part)), 8) ** 0.5
            action = bool(re.search(r"\b(?:discover|develop|creat|learn|train|choos|refus|protect|build|invent|help|rescu|reform|transform|lead|leads|found|return|leave|leaves|give|gives|share|teach|taught)\w*\b", part, re.I))
            dates = bool(re.search(r"(?:born|died|\b[12]\d{3}\b.*[–-].*\b[12]\d{3}\b)", part, re.I))
            return overlap + 0.3 * action - 0.35 * dates
        return max(complete, key=value)
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


def rank_candidates(
    references: list[dict], vectors: FloatMatrix, card_vectors: FloatMatrix,
    role_vectors: FloatMatrix, question_vector: FloatMatrix | None,
    card_ids: list[str], question: str, *, per_card: int = 6,
) -> list[list[dict]]:
    """Pure ranking over supplied public vectors; no I/O, model or user-state lookup."""
    question_scores = _relative(vectors @ question_vector) if question_vector is not None else None
    question_words = words(question)
    seed = hashlib.sha256(json.dumps([card_ids, question]).encode()).digest()
    used_ids: set[str] = set()
    used_names: set[str] = set()
    used_families: set[str] = set()
    used_vectors: list[int] = []
    spread_categories: Counter[str] = Counter()
    results = []
    meme_selected = False
    for position, card_id in enumerate(card_ids):
        card_score = _relative(vectors @ card_vectors[position])
        role_score = _relative(vectors @ role_vectors[position])
        relevance = (0.76 * card_score + 0.24 * role_score) if question_scores is None else (
            0.62 * question_scores + 0.32 * card_score + 0.06 * role_score
        )
        # A named interest is useful context, never a request to ignore the card.
        for index, reference in enumerate(references):
            names = [reference["name"], *reference.get("aliases", []), reference["source"]]
            if any(len(words(name)) >= 1 and words(name) <= question_words for name in names):
                relevance[index] += 0.08
            # Regional editorial tiers avoid an English-pageview popularity contest.
            prominence = reference.get("recognizability", "supporting")
            relevance[index] += {"major": 0.035, "regional": 0.025}.get(prominence, 0.0)
            # Stable tiny near-tie variation, not a random pool that ignores meaning.
            tie = hashlib.sha256(seed + card_id.encode() + reference["id"].encode()).digest()
            relevance[index] += int.from_bytes(tie[:2]) / 65535 * 0.008
        # Filter the shared ranked order before either the bounded or expanded
        # candidate pool is built; fallback must not reintroduce reviewed holds.
        order = [int(index) for index in np.argsort(-relevance, kind="stable")
                 if references[int(index)]["id"] not in NEW_READING_EXCLUSIONS]
        meme_pool = set(order[:12])
        pool = order[:180]
        choices: list[dict] = []
        categories: Counter[str] = Counter()
        sources: Counter[str] = Counter()
        while len(choices) < per_card:
            eligible = [index for index in pool if (not meme_selected or references[index].get("kind") != "meme")
                        and (references[index].get("kind") != "meme" or index in meme_pool)
                        and references[index]["name"].casefold() not in used_names
                        and references[index]["id"] not in used_ids
                        and (references[index].get("identityFamily") or references[index]["id"]) not in used_families]
            if not eligible:
                pool = order[:]
                eligible = [index for index in pool if (not meme_selected or references[index].get("kind") != "meme")
                            and (references[index].get("kind") != "meme" or index in meme_pool)
                        and references[index]["name"].casefold() not in used_names
                        and references[index]["id"] not in used_ids
                            and (references[index].get("identityFamily") or references[index]["id"]) not in used_families]
            if not eligible:
                break

            def score(index: int, relevance: FloatMatrix = relevance,
                      categories: Counter[str] = categories, sources: Counter[str] = sources) -> float:
                reference = references[index]
                category = reference.get("category", "fiction")
                similarity = max((float(vectors[index] @ vectors[prior]) for prior in used_vectors), default=0.0)
                return float(relevance[index]) - (
                    0.10 * max(0.0, similarity - 0.55) + 0.10 * categories[category]
                    + 0.025 * spread_categories[category] + 0.07 * sources[reference["source"]]
                )

            chosen = max(eligible, key=score)
            reference = references[chosen]
            context = question + " " + BY_ID[card_id].meaning + " " + ROLE_CONTEXTS[position]
            choices.append({**reference, "public_context": evidence_excerpt(reference, context)})
            meme_selected = meme_selected or reference.get("kind") == "meme"
            used_ids.add(reference["id"])
            used_names.add(reference["name"].casefold())
            used_families.add(reference.get("identityFamily") or reference["id"])
            used_vectors.append(chosen)
            categories[reference.get("category", "fiction")] += 1
            spread_categories[reference.get("category", "fiction")] += 1
            sources[reference["source"]] += 1
        results.append(choices)
    return results


def retrieve(references: list[dict], card_ids: list[str], question: str, *, per_card: int = 6) -> list[list[dict]]:
    public = enriched(references)
    manifest, vectors, all_cards, roles = load_index()
    if manifest["catalogueHash"] != catalogue_hash(public) or manifest["ids"] != [entry["id"] for entry in public]:
        raise ValueError("The public Tarot reference index is stale; regenerate it before release.")
    card_vectors = all_cards[[manifest["cardIds"].index(card_id) for card_id in card_ids]]
    # One in-memory encoding for this question. No query cache, profile lookup or network.
    question_vector = encoder().encode([question], query=True)[0] if question.strip() else None
    return rank_candidates(public, vectors, card_vectors, roles, question_vector,
                           card_ids, question, per_card=per_card)
