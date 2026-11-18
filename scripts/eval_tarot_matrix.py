"""Bounded Tarot evaluation: dry-run by default; private outputs, safe usage receipts.

Run from the repository root with backend/.venv/bin/python. --execute is reserved
for an explicitly authorized provider evaluation after the candidate contract is
frozen. This script never creates rooms or writes a production database.
"""

import argparse
import hashlib
import json
import logging
import math
import os
import re
import sys
import time
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from unittest.mock import patch

import httpx
import numpy as np
from pydantic import ValidationError

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from app.astrology.chart import chart_at
from app.games.tarot import characters, reading, reference_retrieval
from app.games.tarot.deck import BY_ID
from app.settings import settings


@dataclass(frozen=True)
class SyntheticChart:
    location: str
    utc: str
    latitude: float
    longitude: float


@dataclass(frozen=True)
class Scenario:
    id: str
    mode: str
    cards: tuple[str, str, str]
    question: str
    chart: SyntheticChart | None = None


SCENARIOS = (
    Scenario("ordinary-blank", "ordinary", ("swords-02", "major-11", "pentacles-08"), ""),
    Scenario("ordinary-reset", "ordinary", ("major-16", "swords-03", "cups-05"),
             "How could a small volunteer group reflect after a project did not go as planned?"),
    Scenario("western-rest", "western", ("wands-06", "wands-10", "swords-04"),
             "How can someone make room for rest while preparing a community performance?",
             SyntheticChart("Greenwich", "2000-01-01T12:00:00+00:00", 51.4779, 0)),
    Scenario("western-beginner", "western", ("wands-11", "major-08", "cups-03"),
             "What might a beginner reflect on before speaking at a book club?",
             SyntheticChart("Sydney", "1990-06-15T03:30:00+00:00", -33.8688, 151.2093)),
    Scenario("vedic-resources", "vedic", ("pentacles-04", "pentacles-05", "pentacles-06"),
             "How could a community garden share limited tools fairly?",
             SyntheticChart("Chennai", "1985-09-23T04:45:00+00:00", 13.0827, 80.2707)),
    Scenario("vedic-learning", "vedic", ("swords-11", "pentacles-08", "wands-02"),
             "How could someone choose a manageable first step in learning to draw?",
             SyntheticChart("Tokyo", "2010-03-20T18:00:00+00:00", 35.6762, 139.6503)),
    Scenario("both-boundaries", "both", ("swords-13", "cups-14", "pentacles-02"),
             "What could a team reflect on when balancing kindness, boundaries and deadlines?",
             SyntheticChart("New York", "1975-12-05T19:20:00+00:00", 40.7128, -74.0060)),
    Scenario("both-change", "both", ("major-13", "cups-06", "major-17"),
             "How might a local club preserve what matters while changing an old routine?",
             SyntheticChart("Cape Town", "2020-08-11T06:10:00+00:00", -33.9249, 18.4241)),
    Scenario("ordinary-inbox", "ordinary", ("wands-10", "swords-02", "pentacles-02"),
             "For a lighthearted office-inbox example, how could the 'This Is Fine' dog sipping "
             "coffee in a burning room help a team notice its denial of an overflowing inbox "
             "and take one practical next step?"),
    Scenario("ordinary-nataraja", "ordinary", ("major-13", "major-10", "major-21"),
             "How could a community dance group reflect on Nataraja's symbolism of creation "
             "and dissolution while changing an old routine, without assuming anyone's faith?"),
    Scenario("ordinary-grief", "ordinary", ("cups-05", "swords-03", "major-17"),
             "How can a community choir support a member mourning a loss, without rushing "
             "them to feel better?"),
)


@contextmanager
def reference_override(snapshot_path: Path | None, index_directory: Path | None):
    """Use a frozen public candidate locally without promoting pending artwork.

    The index's retained enriched corpus is authoritative for this evaluation.
    Every vector, public document, identity and meaning is checked before any
    request is constructed. All patches are scoped to this script's process.
    """
    if snapshot_path is None and index_directory is None:
        yield {"mode": "production-catalogue"}
        return
    if snapshot_path is None or index_directory is None:
        raise ValueError("Supply both --snapshot and --index-directory.")
    snapshot_path, index_directory = snapshot_path.resolve(), index_directory.resolve()
    snapshot = json.loads(snapshot_path.read_text())
    corpus_path = index_directory / "reference-corpus.json"
    corpus = json.loads(corpus_path.read_text())
    manifest_path = index_directory / "reference-index.json"
    manifest = json.loads(manifest_path.read_text())
    vectors_path = index_directory / "reference-index.npz"
    ids = [entry["id"] for entry in corpus]
    if ids != [entry["id"] for entry in snapshot] or ids != manifest["ids"] or len(set(ids)) != len(ids):
        raise ValueError("Evaluation snapshot, corpus and index identities differ.")
    # Only the production evidence-lens fields may differ from the raw snapshot.
    lens_fields = {"sourceContext", "contextSourceUrl", "identityFamily"}
    if any({k: v for k, v in raw.items() if k not in lens_fields}
           != {k: v for k, v in entry.items() if k not in lens_fields}
           for raw, entry in zip(snapshot, corpus, strict=True)):
        raise ValueError("Evaluation corpus changed a canonical snapshot identity.")
    hashes = {
        "version": reference_retrieval.INDEX_VERSION,
        "catalogueHash": reference_retrieval.catalogue_hash(corpus),
        "sha256": hashlib.sha256(vectors_path.read_bytes()).hexdigest(),
        "modelManifestSha256": hashlib.sha256(
            (reference_retrieval.ROOT / "semantic_model/manifest.json").read_bytes(),
        ).hexdigest(),
        **reference_retrieval.meaning_hashes(),
    }
    if any(manifest.get(key) != value for key, value in hashes.items()):
        raise ValueError("Evaluation index failed a version, corpus, model or meaning integrity check.")
    documents = [hashlib.sha256(reference_retrieval.document(entry).encode()).hexdigest() for entry in corpus]
    if manifest.get("documentHashes") != documents or manifest.get("cardIds") != list(BY_ID):
        raise ValueError("Evaluation index documents or card ordering differ.")
    with np.load(vectors_path, allow_pickle=False) as arrays:
        vectors = tuple(np.asarray(arrays[key], dtype=np.float32) for key in ("references", "cards", "roles"))
    if [values.shape for values in vectors] != [(len(corpus), 384), (78, 384), (3, 384)] \
            or not all(np.isfinite(values).all() for values in vectors):
        raise ValueError("Evaluation index has invalid vectors.")
    for values in vectors:
        values.flags.writeable = False
    receipt = {
        "mode": "private-frozen-public-snapshot", "references": len(corpus),
        "snapshot_sha256": hashlib.sha256(snapshot_path.read_bytes()).hexdigest(),
        "corpus_sha256": hashlib.sha256(corpus_path.read_bytes()).hexdigest(),
        "manifest_sha256": hashlib.sha256(manifest_path.read_bytes()).hexdigest(),
        "catalogue_hash": hashes["catalogueHash"], "vectors_sha256": hashes["sha256"],
    }
    with (
        patch.object(characters, "CHARACTERS", corpus),
        patch.object(characters, "REFERENCE_LANES", tuple(dict.fromkeys(c["lane"] for c in corpus))),
        patch.object(reference_retrieval, "enriched", lambda entries: entries),
        patch.object(reference_retrieval, "load_index", lambda: (manifest, *vectors)),
        patch.object(characters, "_IDENTITIES", characters._identity_index()),
    ):
        yield receipt


def chart_for(scenario):
    # Arbitrary synthetic instants and public city coordinates, not real birth
    # profiles. Only computed charts reach the adapter; no geocoder is used.
    if scenario.mode == "ordinary":
        assert scenario.chart is None
        return None
    fixture = scenario.chart
    assert fixture is not None
    instant = datetime.fromisoformat(fixture.utc).astimezone(UTC)
    result = chart_at(instant, fixture.latitude, fixture.longitude, scenario.mode)
    assert result.status == "ready" and result.chart is not None
    return result.chart


def preflight(scenario):
    """Measure the exact production request without transmitting it."""
    chart = chart_for(scenario)
    payload = reading.build_reading_request(list(scenario.cards), scenario.question,
                                           astrology_chart=chart)
    generation = payload["generation_config"]
    assert payload["store"] is False
    assert payload["model"] == settings().tarot_model
    assert generation["thinking_level"] == reading.THINKING_LEVEL
    assert generation["max_output_tokens"] == reading.MAX_OUTPUT_TOKENS
    # Request construction serializes exactly as Client.post(json=...) but sends nothing.
    content = httpx.Request("POST", "https://evaluation.invalid", json=payload).content
    serialized = content.decode()
    assert len(serialized) <= 16000
    context = json.loads(payload["input"])
    candidates = [card["reference_characters"] for card in context["cards"]]
    return {
        "id": scenario.id, "mode": scenario.mode,
        "model": payload["model"], "effort": generation["thinking_level"],
        "api_tier": settings().tarot_api_tier,
        "output_cap": generation["max_output_tokens"],
        "request_characters": len(serialized),
        "estimated_input_tokens": math.ceil(len(serialized) / 4),
        "estimate_method": "full serialized request characters / 4; not provider usage",
        "request_sha256": hashlib.sha256(content).hexdigest(),
        "candidate_counts": [len(group) for group in candidates],
        "candidate_kinds": sorted({c.get("kind", "character") for group in candidates for c in group}),
        "candidate_identities": [[{"name": c["name"], "source": c["source"],
                                    "kind": c.get("kind", "character")}
                                   for c in group] for group in candidates],
        "synthetic_chart_location": scenario.chart.location if scenario.chart else None,
        "chart_summary": [
            {"system": entry.system, "ascendant": entry.ascendant.sign,
             "points": [{"id": point.id, "sign": point.sign, "house": point.house}
                        for point in entry.placements if point.id in {"sun", "moon"}]}
            for entry in chart.charts
        ] if chart else [],
        "chart_sha256": hashlib.sha256(chart.model_dump_json().encode()).hexdigest() if chart else None,
    }


class UsageCapture(logging.Handler):
    """Retain only the adapter's allowlisted token metadata, never arbitrary logs."""

    def __init__(self):
        super().__init__(logging.INFO)
        self.entries = []

    def emit(self, record):
        try:
            entry = json.loads(record.getMessage())
        except (ValueError, TypeError):
            return
        if not isinstance(entry, dict) or entry.get("provider") != "gemini":
            return
        keys = ("model", "effort", "provider", "mode", "input_tokens", "cached_tokens",
                "output_tokens", "thought_tokens", "generated_tokens", "cache_hit_rate",
                "over_cliff", "prompt_version", "attempt")
        self.entries.append({key: entry[key] for key in keys if key in entry})


def private_json(path, data):
    # Exclusive creation preserves earlier evaluations and avoids accidental raw
    # reading output in committed docs or terminal logs.
    with os.fdopen(os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600), "w") as stream:
        json.dump(data, stream, indent=2)
        stream.write("\n")


@contextmanager
def capture_provider_responses():
    """Evaluation-only capture; never changes the production adapter or its logs.

    Read the same response once, retain no headers/tokens, and keep only the
    exact synthetic request context needed to diagnose per-card validation.
    Successful responses are discarded by the caller; rejected ones are private.
    """
    responses = []
    original_client = httpx.Client

    def capture(response):
        url = response.request.url
        if url.host != "generativelanguage.googleapis.com" or url.path != "/v1beta/interactions":
            return
        response.read()
        request = json.loads(response.request.content)
        record = {"status_code": response.status_code,
                  "request_context": json.loads(request["input"])}
        if len(response.content) > 500_000:
            record["capture_omitted"] = "response exceeds private diagnostic size limit"
        else:
            try:
                record["provider_body"] = response.json()
            except ValueError:
                record["invalid_json_body"] = response.text
        responses.append(record)

    def client(*args, **kwargs):
        hooks = dict(kwargs.pop("event_hooks", {}))
        hooks["response"] = [*hooks.get("response", []), capture]
        return original_client(*args, event_hooks=hooks, **kwargs)

    with patch.object(reading.httpx, "Client", client):
        yield responses


def diagnose_response(scenario, response):
    """Private field/contract diagnosis from a captured synthetic response only."""
    if response["status_code"] >= 400:
        return {"reason": "http_error", "status_code": response["status_code"]}
    body = response.get("provider_body")
    if not isinstance(body, dict):
        return {"reason": "invalid_envelope"}
    steps = body.get("steps", [])
    if not isinstance(steps, list) or any(
        not isinstance(step, dict) or not isinstance(step.get("content", []), list)
        for step in steps
    ):
        return {"reason": "invalid_envelope"}
    parts = [part.get("text", "") for step in steps
             if isinstance(step, dict) and step.get("type") == "model_output"
             for part in step.get("content", [])
             if isinstance(part, dict) and part.get("type") == "text"]
    try:
        payload = json.loads("".join(part for part in parts if isinstance(part, str)))
    except (TypeError, ValueError):
        return {"reason": "invalid_json", "provider_status": body.get("status")}
    try:
        reading.validate_reading(
            payload, list(scenario.cards), astrology_chart=chart_for(scenario),
            candidates=[card["reference_characters"] for card in response["request_context"]["cards"]],
        )
    except ValidationError as error:
        return {"reason": "invalid_schema", "fields": error.errors(
            include_input=False, include_url=False, include_context=False,
        )}
    except ValueError as error:
        return {"reason": "invalid_contract", "contract_message": str(error)}
    return {"reason": "valid_payload", "provider_status": body.get("status")}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--execute", action="store_true")
    parser.add_argument("--run-id", help="New private evidence directory name; required for execution")
    parser.add_argument("--max-attempts", type=int, default=12)
    parser.add_argument("--scenario", action="append", choices=[s.id for s in SCENARIOS])
    parser.add_argument("--snapshot", type=Path, help="Read-only public candidate catalogue; requires its retained index")
    parser.add_argument("--index-directory", type=Path, help="Read-only index with retained enriched corpus")
    args = parser.parse_args()
    if not 1 <= args.max_attempts <= 12:
        parser.error("--max-attempts must be between 1 and 12")
    if args.execute and (not args.run_id or not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,79}", args.run_id)):
        parser.error("Execution needs a new lowercase --run-id")
    if bool(args.snapshot) != bool(args.index_directory):
        parser.error("Supply both --snapshot and --index-directory.")
    with reference_override(args.snapshot, args.index_directory) as catalogue:
        return evaluate(args, catalogue)


def evaluate(args, catalogue):
    scenarios = [s for s in SCENARIOS if not args.scenario or s.id in args.scenario]
    assert all(len(set(s.cards)) == 3 and all(c in BY_ID for c in s.cards) for s in scenarios)
    planned = {
        "prompt_version": reading.PROMPT_VERSION, "provider_calls": 0,
        "max_attempts": args.max_attempts,
        "evaluation_catalogue": catalogue,
        "scenarios": [preflight(s) for s in scenarios],
    }
    if not args.execute:
        print(json.dumps(planned, indent=2))
        return 0
    if not settings().gemini_api_key:
        raise SystemExit("GEMINI_API_KEY is not configured; no provider call made.")
    directory = ROOT / ".vercel" / "tarot-expansion-evaluations" / args.run_id
    directory.mkdir(parents=True, mode=0o700, exist_ok=False)
    private_json(directory / "preflight.json", planned)
    attempts = 0
    results = []
    capture = UsageCapture()
    logger = logging.getLogger("uvicorn.error")
    old_level = logger.level
    logger.addHandler(capture)
    logger.setLevel(logging.INFO)

    def reserve():
        nonlocal attempts
        if attempts >= args.max_attempts:
            raise reading.ReadingLimitError("Evaluation attempt budget exhausted")
        attempts += 1

    try:
        for scenario in scenarios:
            if attempts >= args.max_attempts:
                break
            started, before, usage_start = time.monotonic(), attempts, len(capture.entries)
            record = {"id": scenario.id, "mode": scenario.mode, "status": "failed"}
            stop = False
            captured = []
            try:
                with capture_provider_responses() as captured:
                    result = reading.generate_reading(
                        list(scenario.cards), scenario.question, before_attempt=reserve,
                        astrology_chart=chart_for(scenario),
                    )
                private_json(directory / f"{scenario.id}.json", {
                    "question": scenario.question, "card_ids": scenario.cards,
                    "reading": result.model_dump(),
                })
                record["status"] = "validated"
            except (httpx.HTTPError, ValueError, reading.ReadingLimitError) as error:
                record["error_type"] = type(error).__name__
                if isinstance(error, reading.ReadingOutputError):
                    record["failure_reason"] = error.reason
                    record["validation_error_count"] = error.errors
                if isinstance(error, httpx.HTTPStatusError):
                    record["http_status"] = error.response.status_code
                    stop = error.response.status_code in {401, 403, 429}
                stop |= isinstance(error, reading.ReadingLimitError)
            rejected = captured[:-1] if record["status"] == "validated" else captured
            for index, response in enumerate(rejected, 1):
                private_json(directory / f"{scenario.id}-attempt-{index}-failed-private.json", {
                    "scenario": scenario.id, "attempt": index, **response,
                    "diagnostic": diagnose_response(scenario, response),
                })
            record["private_diagnostic_count"] = len(rejected)
            record.update({"seconds": round(time.monotonic() - started, 2),
                           "attempts": attempts - before,
                           "usage": capture.entries[usage_start:]})
            results.append(record)
            private_json(directory / f"{scenario.id}-usage.json", record)
            print(json.dumps(record), flush=True)
            if stop:
                break
    finally:
        logger.removeHandler(capture)
        logger.setLevel(old_level)
        private_json(directory / "summary.json", {
            "prompt_version": reading.PROMPT_VERSION, "model": settings().tarot_model,
            "effort": reading.THINKING_LEVEL, "attempts": attempts, "max_attempts": args.max_attempts,
            "evaluation_catalogue": catalogue,
            "planned_scenarios": len(scenarios), "completed_scenarios": len(results),
            "results": results,
        })
    return 0 if len(results) == len(scenarios) and all(r["status"] == "validated" for r in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
