"""Evaluation only: fixed free-account Groq/Cloudflare Tarot comparison.

Dry-run by default; execution requires a verified free-only account, an explicit
attempt budget and a new run ID. Never changes application settings or database
records. Legacy runs retain their ten-attempt limit. The explicit compact profile
shares all historical reservations, including failures and interrupted requests.
Historical phases keep their original ceilings. The explicit instruct phase
allows four new Groq calls after 57 direct attempts and one imported hosted
Cloudflare attempt: cumulative62, Groq39 and Cloudflare23.
"""

import argparse
import fcntl
import hashlib
import json
import math
import os
import re
import sys
import time
from contextlib import contextmanager
from copy import deepcopy
from datetime import UTC, datetime
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import httpx
from pydantic import ValidationError

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from eval_tarot_matrix import SCENARIOS, chart_for, private_json, reading

EVIDENCE = ROOT / ".vercel/tarot-free-provider-evaluations"
LEGACY_MAX_PROVIDER_ATTEMPTS = 10
COMPACT_MAX_PROVIDER_ATTEMPTS = 20
COMPACT_MAX_COMBINED_ATTEMPTS = 35
EVIDENCE_MAX_PROVIDER_ATTEMPTS = 24
EVIDENCE_MAX_COMBINED_ATTEMPTS = 38
MAX_PROVIDER_ATTEMPTS = 25
MAX_COMBINED_ATTEMPTS = 41
GROUNDED_PROFILE = "grounded-v1"
GROUNDED_MAX_PROVIDER_ATTEMPTS = {"groq": 31, "cloudflare": 22}
GROUNDED_MAX_COMBINED_ATTEMPTS = 53
GROUNDED_MEDIUM_PROFILE = "grounded-medium-v1"
GROUNDED_MEDIUM_MAX_PROVIDER_ATTEMPTS = 35
GROUNDED_MEDIUM_MAX_COMBINED_ATTEMPTS = 57
GROUNDED_JSON_PROFILE = "grounded-json-v1"
GROUNDED_JSON_MAX_PROVIDER_ATTEMPTS = 37
GROUNDED_JSON_MAX_COMBINED_ATTEMPTS = 59
GROUNDED_INSTRUCT_PROFILE = "grounded-json-instruct-v1"
GROUNDED_INSTRUCT_MAX_PROVIDER_ATTEMPTS = 39
GROUNDED_INSTRUCT_MAX_COMBINED_ATTEMPTS = 62
HISTORY_MAX_PROVIDER_ATTEMPTS = {"groq": 39, "cloudflare": 23}
ASTROLOGY_PROFILE = "qwen-astrology-medium-v1"
COMPACT_PROFILES = ("compact-v2", "compact-json-v1", "compact-medium-v1", "compact-high-v1", "qwen-none-v1", "qwen-evidence-v2", ASTROLOGY_PROFILE, GROUNDED_PROFILE, GROUNDED_MEDIUM_PROFILE, GROUNDED_JSON_PROFILE, GROUNDED_INSTRUCT_PROFILE)
PROFILES = ("legacy-v1", "compact-v1", *COMPACT_PROFILES)
WIRE_VERSION = "free-provider-eval-1"
SCENARIO_IDS = (
    "ordinary-blank", "ordinary-grief", "ordinary-nataraja", "ordinary-inbox",
    "western-rest", "vedic-resources", "both-boundaries",
)
SCENARIO_BY_ID = {scenario.id: scenario for scenario in SCENARIOS if scenario.id in SCENARIO_IDS}
ASTROLOGY_SCENARIO_IDS = ("western-rest", "vedic-resources", "both-boundaries")
MODELS = {"groq": "openai/gpt-oss-120b", "cloudflare": "@cf/openai/gpt-oss-120b"}
OUTPUT_CAPS = {"groq": 4096, "cloudflare": 8192}
CREDENTIAL_NAMES = {
    "groq": {"GROQ_API_KEY"},
    "cloudflare": {"CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN"},
}


class EvaluationStop(ValueError):
    """Only fixed, safe classifications may be printed or persisted."""


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def profile_combined_limit(profile):
    if profile == GROUNDED_INSTRUCT_PROFILE:
        return GROUNDED_INSTRUCT_MAX_COMBINED_ATTEMPTS
    if profile == GROUNDED_JSON_PROFILE:
        return GROUNDED_JSON_MAX_COMBINED_ATTEMPTS
    if profile == GROUNDED_MEDIUM_PROFILE:
        return GROUNDED_MEDIUM_MAX_COMBINED_ATTEMPTS
    if profile == GROUNDED_PROFILE:
        return GROUNDED_MAX_COMBINED_ATTEMPTS
    if profile == ASTROLOGY_PROFILE:
        return MAX_COMBINED_ATTEMPTS
    return EVIDENCE_MAX_COMBINED_ATTEMPTS if profile == "qwen-evidence-v2" else COMPACT_MAX_COMBINED_ATTEMPTS


def profile_scenarios(profile):
    if profile == GROUNDED_INSTRUCT_PROFILE:
        return ("vedic-resources", "both-boundaries")
    if profile == GROUNDED_PROFILE:
        return ("ordinary-grief", *ASTROLOGY_SCENARIO_IDS)
    return ASTROLOGY_SCENARIO_IDS if profile in (ASTROLOGY_PROFILE, GROUNDED_MEDIUM_PROFILE, GROUNDED_JSON_PROFILE) else SCENARIO_IDS


def profile_settings(provider, profile="legacy-v1", reasoning_effort=None):
    if provider not in MODELS or profile not in PROFILES:
        raise EvaluationStop("unsupported_evaluation_profile")
    if profile == GROUNDED_INSTRUCT_PROFILE:
        from app.games.tarot import grounded, grounded_json

        if provider != "groq" or reasoning_effort not in (None, "none"):
            raise EvaluationStop("grounded_instruct_requires_groq_none")
        return {"profile": profile, "model": grounded.MODELS[provider],
                "reasoning_effort": "none", "output_cap": grounded.OUTPUT_CAP,
                "wire_version": grounded_json.INSTRUCT_PROFILE_VERSION, "smoke_scenario": "vedic-resources",
                "max_attempts_provider_total": GROUNDED_INSTRUCT_MAX_PROVIDER_ATTEMPTS}
    if profile == GROUNDED_JSON_PROFILE:
        from app.games.tarot import grounded, grounded_json

        if provider != "groq" or reasoning_effort not in (None, "medium"):
            raise EvaluationStop("grounded_json_requires_groq_medium")
        return {"profile": profile, "model": grounded.MODELS[provider],
                "reasoning_effort": "medium", "output_cap": grounded.OUTPUT_CAP,
                "wire_version": grounded_json.PROFILE_VERSION, "smoke_scenario": "western-rest",
                "max_attempts_provider_total": GROUNDED_JSON_MAX_PROVIDER_ATTEMPTS}
    if profile == GROUNDED_MEDIUM_PROFILE:
        from app.games.tarot import grounded, grounded_astrology

        if provider != "groq" or reasoning_effort not in (None, "medium"):
            raise EvaluationStop("grounded_medium_requires_groq_medium")
        return {"profile": profile, "model": grounded.MODELS[provider],
                "reasoning_effort": "medium", "output_cap": grounded.OUTPUT_CAP,
                "wire_version": grounded_astrology.PROFILE_VERSION, "smoke_scenario": "western-rest",
                "max_attempts_provider_total": GROUNDED_MEDIUM_MAX_PROVIDER_ATTEMPTS}
    if profile == GROUNDED_PROFILE:
        from app.games.tarot import grounded

        if reasoning_effort not in (None, "none"):
            raise EvaluationStop("grounded_profile_has_fixed_reasoning_effort")
        return {"profile": profile, "model": grounded.MODELS[provider],
                "reasoning_effort": "none", "output_cap": grounded.OUTPUT_CAP,
                "wire_version": grounded.PROFILE_VERSION, "smoke_scenario": "ordinary-grief",
                "max_attempts_provider_total": GROUNDED_MAX_PROVIDER_ATTEMPTS[provider]}
    if profile == "compact-v1":
        raise EvaluationStop("retired_compact_profile_requires_explicit_new_profile")
    if profile in COMPACT_PROFILES:
        from app.games.tarot import providers

        if providers.PROFILE_VERSION != "compact-reading-2":
            raise EvaluationStop("compact_adapter_version_mismatch")
        if profile == "compact-json-v1" and provider != "groq":
            raise EvaluationStop("json_diagnostic_is_groq_only")
        if profile == "compact-medium-v1" and provider != "groq":
            raise EvaluationStop("medium_diagnostic_is_groq_only")
        if profile == "compact-high-v1" and provider != "groq":
            raise EvaluationStop("high_diagnostic_is_groq_only")
        if profile in ("qwen-none-v1", "qwen-evidence-v2", ASTROLOGY_PROFILE) and provider != "groq":
            raise EvaluationStop("qwen_diagnostic_is_groq_only")
        effort = providers.ALTERNATIVE_REASONING_EFFORTS[provider] or "none"
        if profile in ("compact-medium-v1", ASTROLOGY_PROFILE):
            effort = "medium"
        elif profile in ("qwen-none-v1", "qwen-evidence-v2"):
            effort = "none"
        if reasoning_effort not in (None, effort):
            raise EvaluationStop("compact_profile_has_fixed_reasoning_effort")
        wire_version = providers.PROFILE_VERSION
        model = providers.ALTERNATIVE_MODELS[provider]
        output_cap = providers.ALTERNATIVE_OUTPUT_CAPS[provider]
        extra = {}
        if profile == "compact-json-v1":
            from app.games.tarot import groq_json

            wire_version = groq_json.PROFILE_VERSION
        elif profile == "compact-medium-v1":
            from app.games.tarot import groq_medium

            wire_version = groq_medium.PROFILE_VERSION
        elif profile == "compact-high-v1":
            from app.games.tarot import groq_high

            wire_version, output_cap = groq_high.PROFILE_VERSION, groq_high.OUTPUT_CAP
            extra["canonical_candidate_limit"] = groq_high.CANDIDATE_LIMIT
        elif profile == "qwen-none-v1":
            from app.games.tarot import groq_qwen

            wire_version, model, output_cap = groq_qwen.PROFILE_VERSION, groq_qwen.MODEL, groq_qwen.OUTPUT_CAP
        elif profile == "qwen-evidence-v2":
            from app.games.tarot import groq_qwen_v2

            wire_version, model, output_cap = groq_qwen_v2.PROFILE_VERSION, groq_qwen_v2.MODEL, groq_qwen_v2.OUTPUT_CAP
        elif profile == ASTROLOGY_PROFILE:
            from app.games.tarot import groq_qwen_astrology

            wire_version, model, output_cap = groq_qwen_astrology.PROFILE_VERSION, groq_qwen_astrology.MODEL, groq_qwen_astrology.OUTPUT_CAP
            extra["canonical_candidate_limit"] = groq_qwen_astrology.CANDIDATE_LIMIT
        return {"profile": profile, "model": model,
                "reasoning_effort": effort, "output_cap": output_cap, **extra,
                "wire_version": wire_version, "smoke_scenario": "western-rest" if profile == ASTROLOGY_PROFILE else "ordinary-grief",
                "max_attempts_provider_total": (MAX_PROVIDER_ATTEMPTS if profile == ASTROLOGY_PROFILE else
                                                EVIDENCE_MAX_PROVIDER_ATTEMPTS if profile == "qwen-evidence-v2" else COMPACT_MAX_PROVIDER_ATTEMPTS)}
    effort = reasoning_effort or "low"
    if effort not in ("low", "medium"):
        raise EvaluationStop("unsupported_evaluation_reasoning_effort")
    return {"profile": profile, "model": MODELS[provider], "reasoning_effort": effort,
            "output_cap": OUTPUT_CAPS[provider], "wire_version": WIRE_VERSION,
            "smoke_scenario": "ordinary-blank", "max_attempts_provider_total": LEGACY_MAX_PROVIDER_ATTEMPTS}


def adapter_fingerprint(profile):
    from app.games.tarot import providers

    decoder = hashlib.sha256(Path(providers.__file__).read_bytes()).hexdigest()
    if profile in (GROUNDED_JSON_PROFILE, GROUNDED_INSTRUCT_PROFILE):
        from app.games.tarot import grounded_json

        return digest({"base": adapter_fingerprint(GROUNDED_MEDIUM_PROFILE),
                       "json_transport": hashlib.sha256(Path(grounded_json.__file__).read_bytes()).hexdigest()})
    if profile == GROUNDED_MEDIUM_PROFILE:
        from app.games.tarot import grounded_astrology

        return digest({"base": adapter_fingerprint(GROUNDED_PROFILE),
                       "astrology_transform": hashlib.sha256(Path(grounded_astrology.__file__).read_bytes()).hexdigest()})
    if profile == GROUNDED_PROFILE:
        from app.games.tarot import groq_qwen, grounded

        return digest({"decoder": decoder,
                       "wire_transform": hashlib.sha256(Path(grounded.__file__).read_bytes()).hexdigest(),
                       "shared_helpers": hashlib.sha256(Path(groq_qwen.__file__).read_bytes()).hexdigest()})
    if profile == "compact-json-v1":
        from app.games.tarot import groq_json

        return digest({"decoder": decoder, "wire_transform": hashlib.sha256(Path(groq_json.__file__).read_bytes()).hexdigest()})
    if profile == "compact-medium-v1":
        from app.games.tarot import groq_medium

        return digest({"decoder": decoder, "wire_transform": hashlib.sha256(Path(groq_medium.__file__).read_bytes()).hexdigest()})
    if profile == "compact-high-v1":
        from app.games.tarot import groq_high

        return digest({"decoder": decoder, "wire_transform": hashlib.sha256(Path(groq_high.__file__).read_bytes()).hexdigest()})
    if profile == "qwen-none-v1":
        from app.games.tarot import groq_qwen

        return digest({"decoder": decoder, "wire_transform": hashlib.sha256(Path(groq_qwen.__file__).read_bytes()).hexdigest()})
    if profile == "qwen-evidence-v2":
        from app.games.tarot import groq_qwen, groq_qwen_v2

        return digest({"decoder": decoder,
                       "base_transform": hashlib.sha256(Path(groq_qwen.__file__).read_bytes()).hexdigest(),
                       "wire_transform": hashlib.sha256(Path(groq_qwen_v2.__file__).read_bytes()).hexdigest()})
    if profile == ASTROLOGY_PROFILE:
        from app.games.tarot import groq_qwen_astrology

        return digest({"evidence_adapter": adapter_fingerprint("qwen-evidence-v2"),
                       "astrology_transform": hashlib.sha256(Path(groq_qwen_astrology.__file__).read_bytes()).hexdigest()})
    return decoder


def contract_hash(reasoning_effort="low", profile="legacy-v1", provider=None):
    parts = {
        "script": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        "reading": hashlib.sha256(Path(reading.__file__).read_bytes()).hexdigest(),
        "prompt_version": reading.PROMPT_VERSION,
        "reasoning_effort": reasoning_effort,
        "profile": profile,
        "reference_index": hashlib.sha256(
            (ROOT / "backend/app/games/tarot/reference-index.json").read_bytes(),
        ).hexdigest(),
    }
    if provider is not None:
        parts["effective_profile"] = profile_settings(provider, profile, reasoning_effort)
    if profile in COMPACT_PROFILES:
        parts["adapter"] = adapter_fingerprint(profile)
    return digest(parts)


def portable_schema(source):
    """Only tuple binding changes; the production validator remains authoritative."""
    schema = deepcopy(source)
    cards = schema["properties"]["cards"]
    ordered = cards.pop("prefixItems")
    if len(ordered) != 3:
        raise EvaluationStop("unexpected_card_schema")
    item = deepcopy(ordered[0])
    for field in ("card_id", "position"):
        item["properties"][field]["enum"] = [
            section["properties"][field]["enum"][0] for section in ordered
        ]
    cards["items"] = item
    cards["description"] = "Exactly three cards in this order: " + "; ".join(
        f"{section['properties']['card_id']['enum'][0]} = "
        f"{section['properties']['position']['enum'][0]}" for section in ordered
    )
    return schema


def prepare(provider, scenario, reasoning_effort=None, profile="legacy-v1"):
    from app.settings import Settings

    settings = profile_settings(provider, profile, reasoning_effort)
    if profile in (ASTROLOGY_PROFILE, GROUNDED_MEDIUM_PROFILE, GROUNDED_JSON_PROFILE, GROUNDED_INSTRUCT_PROFILE) and scenario.id not in ASTROLOGY_SCENARIO_IDS:
        raise EvaluationStop("astrology_profile_requires_astrology_scenario")
    reasoning_effort, output_cap = settings["reasoning_effort"], settings["output_cap"]
    chart = chart_for(scenario)
    # The production builder needs only a model name. Avoid reading the existing
    # Gemini credential or any other environment setting even during dry runs.
    # The same code default also keeps shortlist trimming identical across both
    # providers: model-name length must not change the supplied reference facts.
    model_label = Settings.model_fields["tarot_model"].default
    with patch.object(reading, "settings", return_value=SimpleNamespace(tarot_model=model_label)):
        original = reading.build_reading_request(
            list(scenario.cards), scenario.question, astrology_chart=chart,
            **({"_candidate_limit": settings["canonical_candidate_limit"]}
               if "canonical_candidate_limit" in settings else {}),
        )
    context = json.loads(original["input"])
    schema = portable_schema(original["response_format"]["schema"])
    body = {
        "model": MODELS[provider],
        "messages": [
            {"role": "system", "content": original["system_instruction"]},
            {"role": "user", "content": original["input"]},
        ],
        "stream": False,
        "reasoning_effort": reasoning_effort,
        "response_format": {
            "type": "json_schema",
            "json_schema": {"name": "tarot_reading", "strict": True, "schema": schema},
        },
    }
    if provider == "groq":
        body.update(max_completion_tokens=OUTPUT_CAPS[provider], include_reasoning=False,
                    service_tier="on_demand")
    else:
        body.update(max_tokens=OUTPUT_CAPS[provider], options={"rejectIfBusy": True})
    if profile in COMPACT_PROFILES:
        from app.games.tarot import providers

        if profile in (GROUNDED_MEDIUM_PROFILE, GROUNDED_JSON_PROFILE, GROUNDED_INSTRUCT_PROFILE):
            from app.games.tarot.grounded_astrology import (
                build_grounded_astrology_request,
            )

            original, body = build_grounded_astrology_request(original)
            context = json.loads(original["input"])
        elif profile == GROUNDED_PROFILE:
            from app.games.tarot.grounded import build_grounded_request

            body = build_grounded_request(provider, original)
        elif profile == ASTROLOGY_PROFILE:
            from app.games.tarot.groq_qwen_astrology import (
                build_groq_qwen_astrology_request,
            )

            original, body = build_groq_qwen_astrology_request(original)
            context = json.loads(original["input"])
        elif profile == "compact-high-v1":
            from app.games.tarot.groq_high import build_groq_high_request

            original, body = build_groq_high_request(original)
            context = json.loads(original["input"])
        else:
            body = providers.build_alternative_request(provider, original)
        schema = body["response_format"]["json_schema"]["schema"]
        if profile in (GROUNDED_JSON_PROFILE, GROUNDED_INSTRUCT_PROFILE):
            from app.games.tarot.grounded_json import (
                json_contract_schema,
                json_transport,
            )

            body = json_transport(body, reasoning_effort=reasoning_effort)
            schema = json_contract_schema(schema)
        elif profile == "compact-json-v1":
            from app.games.tarot.groq_json import build_groq_json_request

            body = build_groq_json_request(body)
        elif profile == "compact-medium-v1":
            from app.games.tarot.groq_medium import build_groq_medium_request

            body = build_groq_medium_request(body)
        elif profile == "qwen-none-v1":
            from app.games.tarot.groq_qwen import build_groq_qwen_request

            body = build_groq_qwen_request(body)
            schema = body["response_format"]["json_schema"]["schema"]
        elif profile == "qwen-evidence-v2":
            from app.games.tarot.groq_qwen_v2 import build_groq_qwen_v2_request

            body = build_groq_qwen_v2_request(body)
            schema = body["response_format"]["json_schema"]["schema"]
    if (body["model"] != settings["model"]
            or body.get("max_completion_tokens", body.get("max_tokens")) != output_cap
            or body.get("reasoning_effort", "none") != reasoning_effort
            or body.get("stream") is not False):
        raise EvaluationStop("profile_request_contract_mismatch")
    serialized = httpx.Request("POST", "https://evaluation.invalid", json=body).content
    if len(serialized) > 20_000:
        raise EvaluationStop("wire_request_budget_exceeded")
    estimate = math.ceil(len(serialized) / 4)
    if provider == "groq" and estimate + output_cap > 8000:
        raise EvaluationStop("estimated_groq_token_reservation_exceeds_free_tpm")
    report = {
        "id": scenario.id, "mode": scenario.mode, "provider": provider,
        **settings, "prompt_version": reading.PROMPT_VERSION,
        "output_format": body["response_format"]["type"],
        "reasoning_format": body.get("reasoning_format"),
        "request_bytes": len(serialized),
        "estimated_input_tokens": estimate,
        "estimate_method": "serialized request bytes / 4; approximate, not provider usage",
        "estimated_input_plus_output_cap": estimate + output_cap,
        "request_sha256": hashlib.sha256(serialized).hexdigest(), "schema_sha256": digest(schema),
        "context_sha256": digest(context),
        "wire_context_sha256": digest(json.loads(body["messages"][1]["content"])),
        "candidate_counts": [len(card["reference_characters"]) for card in context["cards"]],
        "schema_adaptation": ("fixed slots and canonical identity IDs; deterministic adapter; local contract unchanged"
                              if profile in COMPACT_PROFILES else
                              "prefixItems replaced by items and ordered card/position enums; local contract unchanged"),
        "chart_sha256": hashlib.sha256(chart.model_dump_json().encode()).hexdigest() if chart else None,
    }
    if profile == "compact-json-v1":
        report["schema_adaptation"] += "; exact schema supplied as trusted system JSON instead of strict provider decoding"
    elif profile == "qwen-none-v1":
        report["schema_adaptation"] += "; neutral imagery wire keys mapped exactly to canonical layers; explicit returned Qwen identity"
    elif profile == "qwen-evidence-v2":
        report["schema_adaptation"] += "; generated reflection questions and imagery; exact supplied source evidence injected server-side"
    elif profile in (GROUNDED_PROFILE, GROUNDED_MEDIUM_PROFILE, GROUNDED_JSON_PROFILE, GROUNDED_INSTRUCT_PROFILE):
        report["schema_adaptation"] += "; generated reflection and imagery; server-owned exact evidence and selected chart placement headers"
    elif profile == ASTROLOGY_PROFILE:
        report["schema_adaptation"] += "; same evidence-3 schema/prompt; two effective candidates per card and medium reasoning; exact local chart validation"
    if provider == "cloudflare":
        input_rate, output_rate = (26668, 204805) if profile in COMPACT_PROFILES else (31818, 68182)
        report["estimated_neurons_at_output_cap"] = math.ceil(
            estimate * input_rate / 1_000_000 + output_cap * output_rate / 1_000_000,
        )
    return {"scenario": scenario, "chart": chart, "context": context, "body": body,
            "canonical_request": original, "wire_schema": schema, "report": report}


def load_credentials(provider):
    """Read only the selected provider's names from this Games checkout."""
    path = ROOT / ".env.ai.local"
    if not path.is_file() or path.is_symlink() or path.stat().st_mode & 0o077:
        raise EvaluationStop("games_ai_env_missing_or_not_private")
    selected = {}
    with path.open() as stream:
        for line in stream:
            match = re.match(r"\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=\s*(.*)", line)
            if not match or match[1] not in CREDENTIAL_NAMES[provider]:
                continue
            if match[1] in selected:
                raise EvaluationStop("duplicate_provider_credential_name")
            value = match[2].strip()
            if value[:1] in {"'", '"'}:
                if len(value) < 2 or value[-1] != value[0]:
                    raise EvaluationStop("invalid_credential_quoting")
                value = value[1:-1]
            if not value or any(character.isspace() for character in value):
                raise EvaluationStop("invalid_provider_credential")
            selected[match[1]] = value
    if set(selected) != CREDENTIAL_NAMES[provider]:
        raise EvaluationStop("selected_provider_not_configured")
    if provider == "cloudflare" and not re.fullmatch(r"[0-9a-f]{32}", selected["CLOUDFLARE_ACCOUNT_ID"]):
        raise EvaluationStop("invalid_cloudflare_account_id")
    return selected


def endpoint_and_key(provider, credentials):
    if provider == "groq":
        return "https://api.groq.com/openai/v1/chat/completions", credentials["GROQ_API_KEY"]
    account = credentials["CLOUDFLARE_ACCOUNT_ID"]
    return (f"https://api.cloudflare.com/client/v4/accounts/{account}/ai/v1/chat/completions",
            credentials["CLOUDFLARE_API_TOKEN"])


def normalized_usage(body):
    raw = body.get("usage", {}) if isinstance(body, dict) else {}
    if not isinstance(raw, dict):
        return {}
    result = {}
    for name in ("prompt_tokens", "completion_tokens", "total_tokens"):
        value = raw.get(name)
        if type(value) is int and value >= 0:
            result[name] = value
    for parent, names in {"prompt_tokens_details": ("cached_tokens",),
                          "completion_tokens_details": ("reasoning_tokens",)}.items():
        detail = raw.get(parent, {})
        if isinstance(detail, dict):
            result.update({name: detail[name] for name in names
                           if type(detail.get(name)) is int and detail[name] >= 0})
    return result


DOMAIN_REASONS = {
    "Reference evidence must exactly match the supplied source context.": "reference_evidence_mismatch",
    "The reading did not match this spread.": "spread_mismatch",
    "Choose only from this card's supplied references.": "reference_candidate_mismatch",
    "Interpret only the requested astrology systems.": "astrology_system_mismatch",
    "Choose unique focus points from the computed chart.": "astrology_focus_mismatch",
    "Name every focus point's computed body, sign and house.": "astrology_anchor_mismatch",
    "Use a different character for each connection in this spread.": "reference_duplicate",
    "Choose a name and source from the supplied character references.": "reference_unknown",
    "Use at most one meme connection across the spread.": "meme_limit",
    "Use different reference families across the spread.": "reference_family_collision",
}


def failed_generation_metadata(error, expected_schema=None):
    """Describe failure structure in memory; never return text, keys or thoughts."""
    if not isinstance(error, dict) or "failed_generation" not in error:
        return {}
    value = error["failed_generation"]
    detail = {"present": True}
    parsed = value if isinstance(value, dict) else None
    if isinstance(value, str):
        detail.update(kind="text", characters=len(value),
                      ends_with_json_close=value.rstrip().endswith(("}", "]")))
        try:
            parsed = json.loads(value)
            detail["json_parseable"] = True
            detail["json_kind"] = "object" if isinstance(parsed, dict) else "array" if isinstance(parsed, list) else "scalar"
        except (ValueError, RecursionError) as problem:
            detail["json_parseable"] = False
            if isinstance(problem, json.JSONDecodeError):
                detail["json_error_offset"] = problem.pos
                detail["json_error_at_end"] = problem.pos >= len(value.rstrip())
    elif isinstance(value, dict):
        detail.update(kind="object", member_count=len(value))
    elif isinstance(value, list):
        detail.update(kind="array", member_count=len(value))
    else:
        detail["kind"] = "null" if value is None else "scalar"
    if isinstance(parsed, dict) and isinstance(expected_schema, dict):
        present, missing, wrong_types = [], [], []
        unknown_count = 0
        def inspect(actual, schema, path="", depth=0):
            nonlocal unknown_count
            if depth > 5 or not isinstance(schema, dict) or schema.get("type") != "object":
                return
            if not isinstance(actual, dict):
                wrong_types.append(path or "root")
                return
            properties = schema.get("properties", {})
            if not isinstance(properties, dict):
                return
            unknown_count += len(set(actual) - set(properties))
            for name, child in properties.items():
                if not re.fullmatch(r"[a-z][a-z0-9_]{0,40}", name):
                    continue
                location = (path + "." if path else "") + name
                if name not in actual:
                    if name in schema.get("required", []):
                        missing.append(location)
                else:
                    present.append(location)
                    inspect(actual[name], child, location, depth + 1)
        inspect(parsed, expected_schema)
        detail["schema_shape"] = {"known_present_fields": present[:40], "missing_required_fields": missing[:40],
                                  "wrong_object_fields": wrong_types[:40], "unknown_field_count": unknown_count}
    finish = error.get("finish_reason")
    if finish in ("stop", "length", "content_filter", "tool_calls"):
        detail["reported_finish_reason"] = finish
    usage = normalized_usage(error)
    return {"failed_generation": detail, **({"failed_generation_usage": usage} if usage else {})}


def http_diagnostics(body, headers, expected_schema=None):
    """Allowlisted machine diagnostics only; never provider error prose."""
    result = {}
    if isinstance(body, dict):
        errors = body.get("errors", [])
        entries = ([body["error"]] if isinstance(body.get("error"), dict) else [])
        if isinstance(errors, list):
            entries.extend(error for error in errors[:4] if isinstance(error, dict))
        for error in entries[:4]:
            if "failed_generation" in error:
                result.update(failed_generation_metadata(error, expected_schema))
                break
        usage = normalized_usage(body)
        if usage:
            result["error_response_usage"] = usage
        safe_errors, keywords = [], set()
        allowed_keywords = (
            "prefixItems", "minLength", "maxLength", "minItems", "maxItems",
            "additionalProperties", "$defs", "$ref", "required", "strict",
            "response_format", "json_schema", "reasoning_effort", "include_reasoning",
            "max_tokens", "max_completion_tokens", "rejectIfBusy", "service_tier",
        )
        for error in entries[:4]:
            fields = {name: value for name in ("code", "type", "param")
                      if (type(value := error.get(name)) is int and 0 <= value <= 1_000_000)
                      or (isinstance(value, str)
                          and re.fullmatch(r"[a-zA-Z][a-zA-Z0-9_.-]{0,63}", value)
                          and not value.startswith(("gsk_", "sk-", "hf_")))}
            if fields:
                safe_errors.append(fields)
            message = error.get("message")
            if isinstance(message, str):
                if error.get("code") == "rate_limit_exceeded":
                    quota = {}
                    for unit in ("TPM", "TPD"):
                        if re.search(r"\b" + unit + r"\b", message, re.IGNORECASE):
                            quota["unit"] = unit
                            break
                    for name in ("requested", "limit"):
                        match = re.search(r"\b" + name + r"\s*[:=]?\s*(\d{1,9})(?!\d|\.\d)", message, re.IGNORECASE)
                        if match:
                            quota[name] = int(match[1])
                    if quota:
                        result["token_quota"] = quota
                keywords.update(keyword for keyword in allowed_keywords if re.search(
                    r"(?<![\w])" + re.escape(keyword) + r"(?![\w])", message,
                ))
        if safe_errors:
            result["provider_errors"] = safe_errors
        if keywords:
            result["mentioned_contract_keywords"] = sorted(keywords)
    allowed_headers = ("retry-after", "x-ratelimit-limit-requests", "x-ratelimit-remaining-requests",
                       "x-ratelimit-reset-requests", "x-ratelimit-limit-tokens",
                       "x-ratelimit-remaining-tokens", "x-ratelimit-reset-tokens")
    safe_headers = {name: value for name in allowed_headers if isinstance(value := headers.get(name), str)
                    and re.fullmatch(r"[0-9A-Za-z.,:+ /-]{1,80}", value)}
    if safe_headers:
        result["rate_limit_headers"] = safe_headers
    return result


def question_shape_diagnostics(text):
    """Known field paths and punctuation counts only, never rejected prose."""
    try:
        payload = json.loads(text)
    except (ValueError, RecursionError):
        return []
    if not isinstance(payload, dict):
        return []
    rows = []
    for index in range(1, 4):
        card = payload.get(f"card_{index}")
        if not isinstance(card, dict):
            continue
        for field in ("reflection_question", "connection"):
            value = card.get(field)
            if isinstance(value, str):
                rows.append({"field": f"card_{index}.{field}", "question_count": value.count("?"),
                             "ends_with_question_mark": value.rstrip().endswith("?")})
    return rows


def parse_response(body, prepared):
    """Never retains reasoning, provider error messages or arbitrary envelope data."""
    if not isinstance(body, dict) or body.get("error") or body.get("errors"):
        return None, {"reason": "invalid_or_error_envelope"}
    model = body.get("model")
    compact = prepared["report"].get("profile") in COMPACT_PROFILES
    expected_model = prepared["report"]["model"]
    allowed_models = {expected_model, expected_model.removeprefix("@cf/")}
    if "gpt-oss-120b" in expected_model:
        allowed_models.add("gpt-oss-120b")
    if model not in allowed_models:
        return None, {"reason": "unexpected_model"}
    choices = body.get("choices")
    if not isinstance(choices, list) or len(choices) != 1 or not isinstance(choices[0], dict):
        return None, {"reason": "invalid_choices"}
    choice = choices[0]
    message = choice.get("message")
    if not isinstance(message, dict):
        return None, {"reason": "invalid_envelope"}
    if message.get("refusal") or choice.get("finish_reason") == "content_filter":
        return None, {"reason": "refusal"}
    if message.get("tool_calls"):
        return None, {"reason": "invalid_envelope"}
    finish = choice.get("finish_reason")
    if finish != "stop":
        return None, {"reason": "truncated" if finish == "length" else "not_completed"}
    text = message.get("content")
    if not isinstance(text, str) or not text or len(text) > 100_000:
        return None, {"reason": "missing_or_oversized_final_text"}
    fingerprint = {"final_text_characters": len(text), "final_text_sha256": hashlib.sha256(text.encode()).hexdigest()}
    # Deliberately do not salvage fenced JSON or strip a model's reasoning tags.
    if compact:
        from app.games.tarot import providers

        try:
            if prepared["report"]["profile"] in (GROUNDED_JSON_PROFILE, GROUNDED_INSTRUCT_PROFILE):
                from app.games.tarot.grounded_json import decode_grounded_json_output

                payload = decode_grounded_json_output(body, prepared["canonical_request"])
            elif prepared["report"]["profile"] == GROUNDED_MEDIUM_PROFILE:
                from app.games.tarot.grounded_astrology import (
                    decode_grounded_astrology_output,
                )

                payload = decode_grounded_astrology_output(body, prepared["canonical_request"])
            elif prepared["report"]["profile"] == GROUNDED_PROFILE:
                from app.games.tarot.grounded import decode_grounded_output

                payload = decode_grounded_output(prepared["report"]["provider"], body, prepared["canonical_request"])
            elif prepared["report"]["profile"] == ASTROLOGY_PROFILE:
                from app.games.tarot.groq_qwen_astrology import (
                    decode_groq_qwen_astrology_output,
                )

                payload = decode_groq_qwen_astrology_output(body, prepared["canonical_request"])
            elif prepared["report"]["profile"] == "qwen-evidence-v2":
                from app.games.tarot.groq_qwen_v2 import decode_groq_qwen_v2_output

                payload = decode_groq_qwen_v2_output(body, prepared["canonical_request"])
            elif prepared["report"]["profile"] == "qwen-none-v1":
                from app.games.tarot.groq_qwen import decode_groq_qwen_output

                payload = decode_groq_qwen_output(body, prepared["canonical_request"])
            else:
                payload = providers.decode_alternative_output(
                    prepared["report"]["provider"], body, prepared["canonical_request"],
                )
        except providers.AlternativeOutputError as error:
            return None, {"reason": error.reason, **fingerprint,
                          **({"question_shape": question_shape_diagnostics(text)}
                             if error.reason == "invalid_reflection_question" else {})}
    else:
        try:
            payload = json.loads(text)
        except ValueError:
            return None, {"reason": "invalid_json", **fingerprint}
    try:
        result = reading.validate_reading(
            payload, list(prepared["scenario"].cards), astrology_chart=prepared["chart"],
            candidates=[card["reference_characters"] for card in prepared["context"]["cards"]],
        )
    except ValidationError as error:
        # Unknown JSON property names also appear in Pydantic error locations.
        # Keep only known contract names and small indices, never model text.
        known_fields = {
            "title", "introduction", "next_step", "cards", "card_id", "position",
            "interpretation", "pop_culture", "quirky_interpretation", "characters",
            "name", "source", "connection", "evidence", "astrology_interpretation", "western", "vedic",
            "focus_points", "normal", "quirky", "tarot_connection",
        }
        validation_errors = error.errors(include_input=False, include_context=True, include_url=False)
        fields = [{"location": [part if (isinstance(part, str) and part in known_fields)
                                or (type(part) is int and 0 <= part <= 100) else "<extra>"
                                for part in entry["loc"][:12]], "type": entry["type"]}
                  for entry in validation_errors]
        domain_reasons = sorted({reason for entry in validation_errors
                                 if (reason := DOMAIN_REASONS.get(str(entry.get("ctx", {}).get("error", ""))))})
        return None, {"reason": "invalid_schema", "fields": fields[:50],
                      "validation_error_count": error.error_count(),
                      **({"domain_reasons": domain_reasons} if domain_reasons else {}), **fingerprint}
    except ValueError as error:
        return None, {"reason": "invalid_card_reference_or_astrology_contract",
                      "domain_reason": DOMAIN_REASONS.get(str(error), "unclassified_domain_validation"), **fingerprint}
    return result, {"reason": "valid_contract", "returned_model": model, **fingerprint}


@contextmanager
def provider_lock(provider):
    EVIDENCE.mkdir(parents=True, mode=0o700, exist_ok=True)
    descriptor = os.open(EVIDENCE / f"{provider}.lock", os.O_CREAT | os.O_RDWR, 0o600)
    with os.fdopen(descriptor, "w") as stream:
        try:
            fcntl.flock(stream, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise EvaluationStop("another_provider_evaluation_is_running") from None
        try:
            yield
        finally:
            fcntl.flock(stream, fcntl.LOCK_UN)


@contextmanager
def evaluation_lock(provider):
    # A cross-provider lock makes the combined budget atomic. Old per-provider
    # locks remain in use, so this also excludes an older in-flight evaluator.
    with provider_lock("all-providers"), provider_lock(provider):
        yield


def reservations(provider):
    rows = []
    for path in sorted(EVIDENCE.glob(f"{provider}-attempt-???-reserved.json")):
        record = json.loads(path.read_text())
        expected_attempt = len(rows) + 1
        if (record["provider"] != provider or type(record["attempt"]) is not int
                or record["attempt"] != expected_attempt
                or path.name != f"{provider}-attempt-{expected_attempt:03}-reserved.json"):
            raise EvaluationStop("reservation_history_is_invalid")
        rows.append(record)
    if len(rows) > HISTORY_MAX_PROVIDER_ATTEMPTS[provider]:
        raise EvaluationStop("provider_budget_already_exceeded")
    return rows


def combined_reservations():
    rows = [row for provider in MODELS for row in reservations(provider)]
    if len(rows) > GROUNDED_INSTRUCT_MAX_COMBINED_ATTEMPTS:
        raise EvaluationStop("combined_budget_already_exceeded")
    return rows


def check_budget(provider, count, profile="legacy-v1"):
    previous = reservations(provider)
    limit = profile_settings(provider, profile)["max_attempts_provider_total"]
    if len(previous) + count > limit:
        raise EvaluationStop("provider_total_budget_would_be_exceeded")
    combined_limit = profile_combined_limit(profile)
    if len(combined_reservations()) + count > combined_limit:
        raise EvaluationStop("combined_total_budget_would_be_exceeded")
    return previous


SMOKE_FIELDS = (
    "provider", "attempt", "run_id", "id", "profile", "model", "reasoning_effort",
    "output_cap", "output_format", "wire_version", "request_sha256", "schema_sha256",
)


def smoke_artifacts(record):
    """Resolve only the evaluator's fixed filenames beneath its private run."""
    run_id, provider, attempt = record["run_id"], record["provider"], record["attempt"]
    scenario_id = ("vedic-resources" if record.get("profile") == GROUNDED_INSTRUCT_PROFILE else
                   "western-rest" if record.get("profile") in (ASTROLOGY_PROFILE, GROUNDED_MEDIUM_PROFILE, GROUNDED_JSON_PROFILE) else "ordinary-grief")
    if (not isinstance(run_id, str) or not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,79}", run_id)
            or provider not in MODELS or type(attempt) is not int or not 1 <= attempt <= HISTORY_MAX_PROVIDER_ATTEMPTS[provider]
            or record["id"] != scenario_id):
        raise EvaluationStop("invalid_smoke_artifact_identity")
    paths = {
        "result_artifact": EVIDENCE / f"{provider}-attempt-{attempt:03}-result.json",
        "request_artifact": EVIDENCE / run_id / f"{scenario_id}-request-private.json",
        "reading_artifact": EVIDENCE / run_id / f"{scenario_id}-reading-private.json",
    }
    if any(path.is_symlink() or not path.resolve().is_relative_to(EVIDENCE.resolve()) for path in paths.values()):
        raise EvaluationStop("invalid_smoke_artifact_path")
    return paths


def validate_saved_smoke(record, prepared):
    paths = smoke_artifacts(record)
    saved = json.loads(paths["request_artifact"].read_text())
    serialized = httpx.Request("POST", "https://evaluation.invalid", json=saved["request"]).content
    report = prepared["report"]
    expected_chart = prepared["chart"].model_dump(mode="json") if prepared["chart"] else None
    if (hashlib.sha256(serialized).hexdigest() != report["request_sha256"]
            or saved["context"] != prepared["context"] or saved["chart"] != expected_chart):
        raise EvaluationStop("saved_smoke_request_changed")
    payload = json.loads(paths["reading_artifact"].read_text())
    if expected_chart is not None:
        stored_astrology = payload.pop("astrology", None)
        if not isinstance(stored_astrology, dict) or stored_astrology.get("chart") != expected_chart:
            raise EvaluationStop("saved_smoke_chart_changed")
        # Reconstruct the generation contract from its stored, validated shape;
        # every interpretation and computed chart value stays unchanged.
        payload["astrology_interpretation"] = stored_astrology.get("interpretation")
    reading.validate_reading(
        payload, list(prepared["scenario"].cards),
        astrology_chart=prepared["chart"],
        candidates=[card["reference_characters"] for card in prepared["context"]["cards"]],
    )
    return paths


def attest_compact_smoke(record, prepared):
    """Add proof while the original whole-source fingerprint still matches."""
    if (record["profile"] not in COMPACT_PROFILES or record["id"] != prepared["report"]["smoke_scenario"]
            or record["status"] != "valid"
            or record["contract_sha256"] != contract_hash(
                record["reasoning_effort"], record["profile"], record["provider"],
            )):
        raise EvaluationStop("smoke_source_changed_before_attestation")
    paths = validate_saved_smoke(record, prepared)
    attestation = {
        **{field: record[field] for field in SMOKE_FIELDS},
        "attestation_version": "compact-smoke-attestation-1",
        "verified_at": datetime.now(UTC).isoformat(),
        "original_contract_sha256": record["contract_sha256"],
        "adapter_sha256": adapter_fingerprint(record["profile"]),
        **{name + "_sha256": hashlib.sha256(path.read_bytes()).hexdigest() for name, path in paths.items()},
        "local_contract_valid": True, "editorial_acceptance": False,
    }
    private_json(EVIDENCE / f"{record['provider']}-attempt-{record['attempt']:03}-smoke-attestation.json", attestation)


def compact_smoke_matches(record, prepared):
    try:
        paths = smoke_artifacts(record)
        attestation = json.loads((EVIDENCE / (
            f"{record['provider']}-attempt-{record['attempt']:03}-smoke-attestation.json"
        )).read_text())
        if (attestation.get("attestation_version") != "compact-smoke-attestation-1"
                or attestation.get("local_contract_valid") is not True
                or attestation.get("original_contract_sha256") != record["contract_sha256"]
                or attestation.get("adapter_sha256") != adapter_fingerprint(record["profile"])
                or any(attestation.get(field) != record[field] for field in SMOKE_FIELDS)
                or any(record[field] != prepared["report"][field] for field in SMOKE_FIELDS
                       if field not in ("attempt", "run_id"))
                or any(attestation.get(name + "_sha256") != hashlib.sha256(path.read_bytes()).hexdigest()
                       for name, path in paths.items())):
            return False
        validate_saved_smoke(record, prepared)
        return True
    except (OSError, ValueError, KeyError, TypeError):
        return False


def failed_western_artifacts(record):
    """Only the original fixed-scenario domain failure can be reconsidered."""
    if (record.get("provider") != "groq" or record.get("profile") != ASTROLOGY_PROFILE
            or record.get("id") != "western-rest" or record.get("http_status") != 200
            or record.get("status") != "failed"
            or record.get("reason") != "invalid_card_reference_or_astrology_contract"
            or record.get("domain_reason") != "astrology_anchor_mismatch"
            or record.get("rejected_final_capture", {}).get("status") != "saved"):
        raise EvaluationStop("not_an_eligible_western_anchor_failure")
    paths = smoke_artifacts(record)
    directory = paths["request_artifact"].parent
    paths.pop("reading_artifact")
    paths.update({
        "run_result": directory / "western-rest-result.json",
        "captured_final": directory / "western-rest-rejected-final-private.json",
        "run_preflight": directory / "preflight.json",
        "reservation": EVIDENCE / f"groq-attempt-{record['attempt']:03}-reserved.json",
    })
    if any(path.is_symlink() or not path.resolve().is_relative_to(EVIDENCE.resolve()) for path in paths.values()):
        raise EvaluationStop("invalid_revalidation_artifact_path")
    return paths


def validate_failed_western(record, prepared):
    paths = failed_western_artifacts(record)
    if any(not path.is_file() or path.stat().st_mode & 0o077 for path in paths.values()):
        raise EvaluationStop("revalidation_artifact_missing_or_not_private")
    if paths["result_artifact"].read_bytes() != paths["run_result"].read_bytes():
        raise EvaluationStop("original_result_copies_disagree")
    report = prepared["report"]
    for field in ("provider", "id", "profile", "model", "reasoning_effort", "output_cap", "output_format",
                  "wire_version", "smoke_scenario", "request_sha256", "schema_sha256", "context_sha256", "chart_sha256"):
        if record.get(field) != report.get(field):
            raise EvaluationStop("revalidation_request_contract_changed")
    reservation = json.loads(paths["reservation"].read_text())
    for field in ("provider", "attempt", "run_id", "profile", "model", "reasoning_effort", "output_cap", "wire_version", "contract_sha256"):
        if reservation.get(field) != record.get(field):
            raise EvaluationStop("revalidation_reservation_mismatch")
    if reservation.get("scenario") != "western-rest":
        raise EvaluationStop("revalidation_reservation_mismatch")
    preflight = json.loads(paths["run_preflight"].read_text())
    if (preflight.get("contract_sha256") != record["contract_sha256"]
            or preflight.get("provider") != "groq" or preflight.get("profile") != ASTROLOGY_PROFILE
            or len(preflight.get("scenarios", [])) != 1
            or any(preflight["scenarios"][0].get(field) != report[field]
                   for field in ("id", "model", "wire_version", "request_sha256", "schema_sha256", "context_sha256", "chart_sha256"))):
        raise EvaluationStop("revalidation_preflight_mismatch")
    saved = json.loads(paths["request_artifact"].read_text())
    raw_request = httpx.Request("POST", "https://evaluation.invalid", json=saved["request"]).content
    if (hashlib.sha256(raw_request).hexdigest() != report["request_sha256"]
            or saved["context"] != prepared["context"]
            or saved["chart"] != prepared["chart"].model_dump(mode="json")):
        raise EvaluationStop("revalidation_saved_request_changed")
    captured_bytes = paths["captured_final"].read_bytes()
    if len(captured_bytes) > 100_000:
        raise EvaluationStop("revalidation_capture_size_limit")
    captured = json.loads(captured_bytes)
    if not isinstance(captured, dict) or set(captured) != {"content"} or not isinstance(captured["content"], str):
        raise EvaluationStop("revalidation_capture_shape_mismatch")
    text = captured["content"]
    fingerprint = hashlib.sha256(text.encode()).hexdigest()
    capture_record = record["rejected_final_capture"]
    if (fingerprint != record.get("final_text_sha256") or fingerprint != capture_record.get("sha256")
            or len(text) != record.get("final_text_characters") or len(text) != capture_record.get("characters")
            or len(text.encode()) != capture_record.get("bytes") or len(captured_bytes) != capture_record.get("artifact_bytes")):
        raise EvaluationStop("revalidation_capture_fingerprint_mismatch")
    # The original domain-failure path already verified the exact model, a stop
    # finish, and final text before validation. Reconstruct only that verified
    # envelope; this is not a new provider response or a retry.
    body = {"model": record["model"], "choices": [{"finish_reason": "stop", "message": {"content": text}}]}
    result, diagnosis = parse_response(body, prepared)
    if result is None or diagnosis["reason"] != "valid_contract":
        raise EvaluationStop("captured_western_still_fails_current_validation")
    wire = json.loads(text)
    for field in ("title", "introduction", "next_step"):
        if getattr(result, field) != wire[field]:
            raise EvaluationStop("revalidation_changed_generated_prose")
    for index, card in enumerate(result.cards, 1):
        section = wire[f"card_{index}"]
        if (card.title != section["title"] or card.interpretation != section["reflection_question"]
                or card.quirky_interpretation != section["imagery"] or card.characters[0].connection != section["connection"]):
            raise EvaluationStop("revalidation_changed_generated_prose")
    astrology = result.astrology.interpretation
    original = wire["astrology_interpretation"]
    if (astrology.tarot_connection != original["tarot_connection"] or astrology.next_step != original["next_step"]
            or astrology.western.normal != original["western"]["normal"]
            or astrology.western.quirky != original["western"]["imagery"]):
        raise EvaluationStop("revalidation_changed_generated_prose")
    return result, paths


def revalidate_western_smoke(attempt):
    """Explicit offline correction proof; never edits failed records or reserves calls."""
    if type(attempt) is not int or not 1 <= attempt <= MAX_PROVIDER_ATTEMPTS:
        raise EvaluationStop("invalid_revalidation_attempt")
    with evaluation_lock("groq"):
        reservations("groq")
        record = json.loads((EVIDENCE / f"groq-attempt-{attempt:03}-result.json").read_text())
        if record.get("attempt") != attempt:
            raise EvaluationStop("revalidation_attempt_mismatch")
        prepared = prepare("groq", SCENARIO_BY_ID["western-rest"], "medium", ASTROLOGY_PROFILE)
        result, paths = validate_failed_western(record, prepared)
        target = EVIDENCE / f"groq-attempt-{attempt:03}-offline-revalidation.json"
        normalized = paths["request_artifact"].parent / "western-rest-offline-revalidated-reading-private.json"
        if target.exists() or target.is_symlink() or normalized.exists() or normalized.is_symlink():
            raise EvaluationStop("offline_revalidation_evidence_already_exists")
        private_json(normalized, result.model_dump(mode="json"))
        receipt = {
            **{field: record[field] for field in SMOKE_FIELDS},
            "attestation_version": "western-offline-revalidation-1",
            "original_status": "failed", "original_reason": record["reason"], "original_domain_reason": record["domain_reason"],
            "original_contract_sha256": record["contract_sha256"],
            "current_contract_sha256": contract_hash("medium", ASTROLOGY_PROFILE, "groq"),
            "current_validator_sha256": hashlib.sha256(Path(reading.__file__).read_bytes()).hexdigest(),
            "adapter_sha256": adapter_fingerprint(ASTROLOGY_PROFILE),
            "verified_at": datetime.now(UTC).isoformat(), "local_contract_valid": True,
            "editorial_acceptance": False, "provider_calls": 0, "attempts_reserved": 0, "credentials_read": False,
            "generated_prose_unchanged": True,
            "envelope_basis": "Original HTTP200 exact-model/stop domain-failure path; unchanged captured final text, not a new response",
            "artifacts": {name: hashlib.sha256(path.read_bytes()).hexdigest() for name, path in paths.items()},
            "normalized_reading_sha256": hashlib.sha256(normalized.read_bytes()).hexdigest(),
        }
        private_json(target, receipt)
        print(json.dumps({"offline_revalidation": "valid", "attempt": attempt, "provider_calls": 0,
                          "original_status": "failed", "editorial_acceptance": False}))
        return 0


def offline_western_smoke_matches(record, prepared):
    try:
        target = EVIDENCE / f"groq-attempt-{record['attempt']:03}-offline-revalidation.json"
        if target.is_symlink() or target.stat().st_mode & 0o077:
            return False
        receipt = json.loads(target.read_text())
        if (receipt.get("attestation_version") != "western-offline-revalidation-1"
                or any(receipt.get(field) != record.get(field) for field in SMOKE_FIELDS)
                or receipt.get("adapter_sha256") != adapter_fingerprint(ASTROLOGY_PROFILE)
                or receipt.get("original_contract_sha256") != record["contract_sha256"]
                or receipt.get("original_status") != "failed" or receipt.get("local_contract_valid") is not True
                or receipt.get("provider_calls") != 0 or receipt.get("attempts_reserved") != 0
                or receipt.get("generated_prose_unchanged") is not True):
            return False
        result, paths = validate_failed_western(record, prepared)
        if receipt.get("artifacts") != {name: hashlib.sha256(path.read_bytes()).hexdigest() for name, path in paths.items()}:
            return False
        normalized = paths["request_artifact"].parent / "western-rest-offline-revalidated-reading-private.json"
        return not (normalized.is_symlink() or normalized.stat().st_mode & 0o077
                or hashlib.sha256(normalized.read_bytes()).hexdigest() != receipt.get("normalized_reading_sha256")
                or json.loads(normalized.read_text()) != result.model_dump(mode="json"))
    except (OSError, ValueError, KeyError, TypeError, AttributeError):
        return False


def _only_wider_prose_targets(old, new):
    """Prove the wire differs only by broader length guidance, not instructions/data."""
    if isinstance(old, dict) and isinstance(new, dict) and old.keys() == new.keys():
        return all(_only_wider_prose_targets(old[key], new[key]) for key in old)
    if isinstance(old, list) and isinstance(new, list) and len(old) == len(new):
        return all(_only_wider_prose_targets(a, b) for a, b in zip(old, new, strict=True))
    if old == new:
        return True
    pattern = r"(\d+)–(\d+) characters\."
    before = re.fullmatch(pattern, old) if isinstance(old, str) else None
    after = re.fullmatch(pattern + r" Aim (\d+)–(\d+)\.", new) if isinstance(new, str) else None
    return bool(before and after and after.groups()[2:] == before.groups()
                and int(after[1]) <= int(before[1]) and int(after[2]) >= int(before[2]))


def validate_grounded_recheck(record, prepared):
    """Revalidate unchanged saved content; never turn an HTTP error into output."""
    if (record.get("profile") != GROUNDED_PROFILE or record.get("wire_version") != "grounded-reading-2"
            or record.get("http_status") != 200
            or record.get("id") != prepared["report"]["id"]
            or record.get("model") != prepared["report"]["model"]
            or record.get("status") not in {"valid", "failed"}
            or record.get("reason") not in {"valid_contract", "invalid_text_length"}):
        raise EvaluationStop("not_an_eligible_grounded_length_recheck")
    provider, run_id, ident, attempt = record["provider"], record["run_id"], record["id"], record["attempt"]
    if (provider not in MODELS or ident not in SCENARIO_BY_ID
            or not isinstance(run_id, str) or not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,79}", run_id)
            or type(attempt) is not int or not 1 <= attempt <= GROUNDED_MAX_PROVIDER_ATTEMPTS[provider]):
        raise EvaluationStop("invalid_grounded_recheck_identity")
    folder = EVIDENCE / run_id
    paths = {
        "result": EVIDENCE / f"{provider}-attempt-{attempt:03}-result.json",
        "run_result": folder / f"{ident}-result.json",
        "reservation": EVIDENCE / f"{provider}-attempt-{attempt:03}-reserved.json",
        "request": folder / f"{ident}-request-private.json",
        "preflight": folder / "preflight.json",
        "content": folder / (f"{ident}-reading-private.json" if record["status"] == "valid"
                             else f"{ident}-rejected-final-private.json"),
    }
    if any(path.is_symlink() or not path.resolve().is_relative_to(EVIDENCE.resolve())
           or path.stat().st_mode & 0o077 for path in paths.values()):
        raise EvaluationStop("invalid_grounded_recheck_artifact")
    if json.loads(paths["run_result"].read_text()) != record or json.loads(paths["result"].read_text()) != record:
        raise EvaluationStop("grounded_recheck_result_mismatch")
    reservation = json.loads(paths["reservation"].read_text())
    for field in ("provider", "attempt", "run_id", "model", "profile", "wire_version", "contract_sha256"):
        if reservation.get(field) != record.get(field):
            raise EvaluationStop("grounded_recheck_reservation_mismatch")
    preflight = json.loads(paths["preflight"].read_text())
    scenario = next((row for row in preflight.get("scenarios", []) if row.get("id") == ident), None)
    if (scenario is None or any(scenario.get(field) != record.get(field)
                               for field in ("request_sha256", "schema_sha256", "context_sha256", "chart_sha256"))):
        raise EvaluationStop("grounded_recheck_preflight_mismatch")
    saved = json.loads(paths["request"].read_text())
    encoded = httpx.Request("POST", "https://evaluation.invalid", json=saved["request"]).content
    chart = prepared["chart"].model_dump(mode="json") if prepared["chart"] else None
    if (hashlib.sha256(encoded).hexdigest() != record["request_sha256"]
            or saved["context"] != prepared["context"] or saved["chart"] != chart
            or not _only_wider_prose_targets(saved["request"], prepared["body"])):
        raise EvaluationStop("grounded_recheck_wire_changed_beyond_lengths")
    stored = json.loads(paths["content"].read_text())
    if record["status"] == "failed":
        raw = stored.get("content")
        if (not isinstance(raw, str) or record.get("rejected_final_capture", {}).get("status") != "saved"
                or hashlib.sha256(raw.encode()).hexdigest() != record.get("final_text_sha256")):
            raise EvaluationStop("grounded_recheck_capture_mismatch")
        from app.games.tarot.grounded import decode_grounded_output

        payload = decode_grounded_output(provider, {"model": record["model"], "choices": [{
            "finish_reason": "stop", "message": {"content": raw},
        }]}, prepared["canonical_request"])
    else:
        payload = deepcopy(stored)
        if chart:
            astrology = payload.pop("astrology", None)
            if not isinstance(astrology, dict) or astrology.get("chart") != chart:
                raise EvaluationStop("grounded_recheck_saved_chart_changed")
            payload["astrology_interpretation"] = astrology["interpretation"]
    result = reading.validate_reading(payload, list(prepared["scenario"].cards),
                                     astrology_chart=prepared["chart"],
                                     candidates=[c["reference_characters"] for c in prepared["context"]["cards"]])
    return result, paths


def grounded_recheck_paths(record):
    revision = adapter_fingerprint(GROUNDED_PROFILE)[:12]
    normalized = EVIDENCE / record["run_id"] / f"{record['id']}-bounds-{revision}-revalidated-reading-private.json"
    receipt = EVIDENCE / f"{record['provider']}-attempt-{record['attempt']:03}-bounds-{revision}-revalidation.json"
    return normalized, receipt


def revalidate_grounded_attempt(provider, attempt):
    with evaluation_lock(provider):
        record = json.loads((EVIDENCE / f"{provider}-attempt-{attempt:03}-result.json").read_text())
        prepared = prepare(provider, SCENARIO_BY_ID[record["id"]], "none", GROUNDED_PROFILE)
        result, paths = validate_grounded_recheck(record, prepared)
        normalized, receipt_path = grounded_recheck_paths(record)
        if normalized.exists() or receipt_path.exists():
            raise EvaluationStop("grounded_recheck_receipt_exists")
        private_json(normalized, result.model_dump(mode="json"))
        private_json(receipt_path, {
            "attestation_version": "grounded-bounds-revalidation-1", "provider": provider, "attempt": attempt,
            "original_status": record["status"], "original_reason": record["reason"],
            "original_contract_sha256": record["contract_sha256"],
            "adapter_sha256": adapter_fingerprint(GROUNDED_PROFILE),
            "current_contract_sha256": contract_hash("none", GROUNDED_PROFILE, provider),
            "current_request_sha256": prepared["report"]["request_sha256"],
            "artifacts": {name: hashlib.sha256(path.read_bytes()).hexdigest() for name, path in paths.items()},
            "artifact_paths": {name: str(path) for name, path in paths.items()},
            "normalized_path": str(normalized),
            "normalized_sha256": hashlib.sha256(normalized.read_bytes()).hexdigest(),
            "local_contract_valid": True, "editorial_acceptance": False, "generated_prose_unchanged": True,
            "provider_calls": 0, "attempts_reserved": 0, "credentials_read": False,
            "envelope_basis": "Original HTTP200 exact-model stop decode; no new inference or response",
        })
        print(json.dumps({"offline_revalidation": "valid", "provider": provider, "attempt": attempt,
                          "original_status": record["status"], "provider_calls": 0, "editorial_acceptance": False}))
        return 0


def grounded_recheck_matches(record, prepared):
    try:
        normalized, receipt_path = grounded_recheck_paths(record)
        if receipt_path.is_symlink() or receipt_path.stat().st_mode & 0o077:
            return False
        receipt = json.loads(receipt_path.read_text())
        result, paths = validate_grounded_recheck(record, prepared)
        return (receipt.get("attestation_version") == "grounded-bounds-revalidation-1"
                and receipt.get("adapter_sha256") == adapter_fingerprint(GROUNDED_PROFILE)
                and receipt.get("current_request_sha256") == prepared["report"]["request_sha256"]
                and receipt.get("original_contract_sha256") == record["contract_sha256"]
                and receipt.get("provider_calls") == 0 and receipt.get("generated_prose_unchanged") is True
                and receipt.get("artifacts") == {name: hashlib.sha256(path.read_bytes()).hexdigest() for name, path in paths.items()}
                and not normalized.is_symlink() and normalized.stat().st_mode & 0o077 == 0
                and receipt.get("normalized_sha256") == hashlib.sha256(normalized.read_bytes()).hexdigest()
                and json.loads(normalized.read_text()) == result.model_dump(mode="json"))
    except (OSError, ValueError, KeyError, TypeError, AttributeError):
        return False


def smoke_passed(provider, current_contract, reasoning_effort="low", profile="legacy-v1"):
    expected = profile_settings(provider, profile, reasoning_effort)
    fresh = prepare(provider, SCENARIO_BY_ID[expected["smoke_scenario"]], reasoning_effort, profile) if profile in COMPACT_PROFILES else None
    for path in EVIDENCE.glob(f"{provider}-attempt-???-result.json"):
        record = json.loads(path.read_text())
        if (profile == GROUNDED_PROFILE and record.get("profile") == profile
                and record.get("id") == "ordinary-grief" and fresh is not None
                and grounded_recheck_matches(record, fresh)):
            return True
        if (profile == ASTROLOGY_PROFILE and record.get("profile") == profile
                and record.get("id") == "western-rest" and record.get("status") == "failed"
                and fresh is not None and offline_western_smoke_matches(record, fresh)):
            return True
        if (record.get("provider") == provider and record.get("id") == expected["smoke_scenario"]
                and record.get("profile", "legacy-v1") == profile
                and record.get("reasoning_effort") == reasoning_effort and record.get("status") == "valid"):
            if fresh is not None:
                if compact_smoke_matches(record, fresh):
                    return True
            elif record.get("contract_sha256") == current_contract:
                return True
    return False


def wait_for_groq_window(provider, previous):
    if provider != "groq" or not previous:
        return
    # Conservative free-tier pacing spans run IDs; never retry a 429 response.
    remaining = previous[-1]["reserved_unix"] + 65 - time.time()
    while remaining > 0:
        print(json.dumps({"provider": provider, "waiting_seconds": math.ceil(remaining)}), flush=True)
        time.sleep(min(remaining, 30))
        remaining = previous[-1]["reserved_unix"] + 65 - time.time()


def capture_rejected_final(body, prepared, path):
    """Explicit synthetic-only capture of bounded final content, never an envelope."""
    scenario = prepared["scenario"]
    if (SCENARIO_BY_ID.get(scenario.id) is not scenario
            or prepared["context"].get("question") != scenario.question):
        raise EvaluationStop("rejected_capture_requires_fixed_synthetic_scenario")
    if not isinstance(body, dict) or body.get("error") or body.get("errors"):
        return {"status": "not_final_envelope"}
    expected_model = prepared["report"]["model"]
    if body.get("model") not in {expected_model, expected_model.removeprefix("@cf/")}:
        return {"status": "unexpected_model"}
    choices = body.get("choices")
    if not isinstance(choices, list) or len(choices) != 1 or not isinstance(choices[0], dict):
        return {"status": "not_final_envelope"}
    choice = choices[0]
    message = choice.get("message")
    if (not isinstance(message, dict) or message.get("role", "assistant") != "assistant"
            or message.get("refusal") or message.get("tool_calls")
            or choice.get("finish_reason") not in {"stop", "length"}):
        return {"status": "not_final_envelope"}
    text = message.get("content")
    if not isinstance(text, str) or not text:
        return {"status": "missing_final_text"}
    raw = text.encode("utf-8")
    artifact = (json.dumps({"content": text}, ensure_ascii=False) + "\n").encode("utf-8")
    if len(raw) > 100_000 or len(artifact) > 100_000:
        return {"status": "final_text_size_limit"}
    if re.search(r"<(?:think|analysis|reasoning)\b|<\|(?:analysis|channel|start)\|>", text, re.IGNORECASE):
        return {"status": "reasoning_markup_excluded"}
    with os.fdopen(os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600), "wb") as stream:
        stream.write(artifact)
    return {"status": "saved", "characters": len(text), "bytes": len(raw), "artifact_bytes": len(artifact),
            "sha256": hashlib.sha256(raw).hexdigest()}


def send_once(client, endpoint, key, prepared, *, rejected_output_path=None):
    """One HTTP transmission, no SDK retries, redirects, tools or fallback."""
    try:
        with client.stream("POST", endpoint, headers={"Authorization": "Bearer " + key},
                           json=prepared["body"]) as response:
            summary = {"http_status": response.status_code}
            chunks, length = [], 0
            # Bounded in-memory failure inspection permits structural diagnostics
            # for a full 4K-token rejected completion; none of its prose is saved.
            limit = 64_000 if response.status_code != 200 else 500_000
            for chunk in response.iter_bytes():
                length += len(chunk)
                if length > limit:
                    return None, {**summary, "reason": "response_size_limit"}, True
                chunks.append(chunk)
            try:
                body = json.loads(b"".join(chunks))
            except ValueError:
                if response.status_code != 200:
                    return None, {**summary, "reason": "http_error", **http_diagnostics(None, response.headers)}, True
                return None, {**summary, "reason": "invalid_envelope_json"}, True
            if response.status_code != 200:
                return None, {**summary, "reason": "http_error", **http_diagnostics(body, response.headers, prepared.get("wire_schema"))}, True
            if prepared["report"].get("profile") in COMPACT_PROFILES:
                from app.games.tarot import providers

                usage = providers.alternative_usage(prepared["report"]["provider"], body)
            else:
                usage = normalized_usage(body)
            result, diagnosis = parse_response(body, prepared)
            if result is None and rejected_output_path is not None:
                diagnosis["rejected_final_capture"] = capture_rejected_final(body, prepared, rejected_output_path)
            # Envelope, error prose and reasoning fields are always discarded.
            return result, {**summary, **diagnosis, "usage": usage,
                            **http_diagnostics(None, response.headers)}, diagnosis["reason"] in {"unexpected_model", "refusal"}
    except httpx.TimeoutException:
        return None, {"reason": "transport_timeout"}, True
    except httpx.RequestError:
        return None, {"reason": "transport_error"}, True


def evaluate(args):
    selected = args.scenario or list(profile_scenarios(args.profile))
    settings = profile_settings(args.provider, args.profile, args.reasoning_effort)
    effort = settings["reasoning_effort"]
    prepared = [prepare(args.provider, SCENARIO_BY_ID[ident], effort, args.profile) for ident in selected]
    current_contract = contract_hash(effort, args.profile, args.provider)
    planned = {
        **settings, "provider": args.provider, "provider_calls": 0,
        "prompt_version": reading.PROMPT_VERSION,
        "contract_sha256": current_contract, "max_attempts_this_run": args.max_attempts,
        "max_attempts_combined_total": profile_combined_limit(args.profile),
        "free_plan_operator_confirmation": bool(args.free_plan_confirmed),
        "capture_rejected_output": bool(args.capture_rejected_output),
        "scenarios": [entry["report"] for entry in prepared],
    }
    if args.execute and args.profile == GROUNDED_MEDIUM_PROFILE:
        raise EvaluationStop("grounded_medium_execution_retired")
    if args.execute and args.profile == GROUNDED_JSON_PROFILE:
        raise EvaluationStop("grounded_json_medium_execution_retired")
    if not args.execute:
        print(json.dumps(planned, indent=2))
        return 0
    with evaluation_lock(args.provider):
        previous = check_budget(args.provider, len(prepared), args.profile)
        planned["reserved_provider_before_run"] = len(previous)
        planned["reserved_combined_before_run"] = len(combined_reservations())
        if (not smoke_passed(args.provider, current_contract, effort, args.profile)
                and selected != [settings["smoke_scenario"]]):
            raise EvaluationStop("run_one_vedic_resources_smoke_before_matrix" if args.profile == GROUNDED_INSTRUCT_PROFILE else
                                 "run_one_western_rest_smoke_before_matrix" if args.profile in (ASTROLOGY_PROFILE, GROUNDED_MEDIUM_PROFILE, GROUNDED_JSON_PROFILE) else
                                 "run_one_ordinary_grief_smoke_before_matrix" if args.profile in COMPACT_PROFILES
                                 else "run_one_ordinary_blank_smoke_before_matrix")
        credentials = load_credentials(args.provider)
        endpoint, key = endpoint_and_key(args.provider, credentials)
        directory = EVIDENCE / args.run_id
        directory.mkdir(mode=0o700, exist_ok=False)
        private_json(directory / "preflight.json", planned)
        records = []
        with httpx.Client(timeout=httpx.Timeout(90, connect=5), follow_redirects=False,
                          trust_env=False, transport=httpx.HTTPTransport(retries=0)) as client:
            for entry in prepared:
                previous = check_budget(args.provider, 1, args.profile)
                wait_for_groq_window(args.provider, previous)
                attempt = len(previous) + 1
                private_json(directory / f"{entry['scenario'].id}-request-private.json", {
                    "request": entry["body"], "context": entry["context"],
                    "chart": entry["chart"].model_dump(mode="json") if entry["chart"] else None,
                })
                reservation = {
                    "provider": args.provider, "attempt": attempt, "run_id": args.run_id,
                    "scenario": entry["scenario"].id, "reserved_unix": time.time(),
                    **settings, "output_format": entry["report"]["output_format"],
                    "combined_attempt": len(combined_reservations()) + 1,
                    "contract_sha256": current_contract, "free_plan_operator_confirmation": True,
                }
                private_json(EVIDENCE / f"{args.provider}-attempt-{attempt:03}-reserved.json", reservation)
                started = time.monotonic()
                capture_path = (directory / f"{entry['scenario'].id}-rejected-final-private.json"
                                if args.capture_rejected_output else None)
                result, diagnosis, stop = send_once(client, endpoint, key, entry, rejected_output_path=capture_path)
                record = {
                    **entry["report"], "attempt": attempt, "run_id": args.run_id,
                    "contract_sha256": current_contract, "status": "valid" if result else "failed",
                    "seconds": round(time.monotonic() - started, 3), **diagnosis,
                    "editorial_review": "pending", "automatic_retry": False,
                }
                if result:
                    private_json(directory / f"{entry['scenario'].id}-reading-private.json", result.model_dump(mode="json"))
                private_json(directory / f"{entry['scenario'].id}-result.json", record)
                private_json(EVIDENCE / f"{args.provider}-attempt-{attempt:03}-result.json", record)
                if result and args.profile in COMPACT_PROFILES and entry["scenario"].id == settings["smoke_scenario"]:
                    attest_compact_smoke(record, entry)
                records.append(record)
                print(json.dumps({name: record[name] for name in
                                  ("provider", "id", "status", "reason", "seconds", "attempt")}), flush=True)
                if stop:
                    break
        summary = {
            **planned, "provider_calls": len(records), "results": records,
            "checked_at": datetime.now(UTC).isoformat(),
            "all_selected_contracts_valid": len(records) == len(prepared) and all(r["status"] == "valid" for r in records),
            "editorial_review": "pending", "production_changed": False,
            "raw_provider_reasoning_retained": False,
        }
        private_json(directory / "summary.json", summary)
        return 0 if summary["all_selected_contracts_valid"] else 1


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--provider", required=True, choices=MODELS)
    parser.add_argument("--profile", choices=PROFILES, default="legacy-v1",
                        help="Historical phase ceilings unchanged; instruct62/39Groq/23Cloudflare includes the imported hosted call; all history counts")
    parser.add_argument("--reasoning-effort", choices=("none", "low", "medium", "high"),
                        help="Legacy default low; compact-v2 fixes Groq high and Cloudflare nonreasoning")
    parser.add_argument("--execute", action="store_true")
    parser.add_argument("--revalidate-western-smoke-attempt", type=int,
                        help="Offline-only explicit attestation of an unchanged captured Western anchor failure")
    parser.add_argument("--revalidate-grounded-attempt", type=int,
                        help="Offline-only exact-content proof after widening compact prose bounds")
    parser.add_argument("--capture-rejected-output", action="store_true",
                        help="Opt in to private bounded final content for failed HTTP200 synthetic cases; no reasoning or error bodies")
    parser.add_argument("--free-plan-confirmed", action="store_true",
                        help="Operator verified this account has no paid or overage billing; not an API billing control")
    parser.add_argument("--run-id")
    parser.add_argument("--max-attempts", type=int)
    parser.add_argument("--scenario", action="append", choices=SCENARIO_IDS)
    args = parser.parse_args(argv)
    if args.revalidate_western_smoke_attempt is not None and (
            args.provider != "groq" or args.profile != ASTROLOGY_PROFILE
            or args.scenario not in (None, ["western-rest"]) or args.reasoning_effort not in (None, "medium")
            or args.execute or args.capture_rejected_output or args.run_id or args.max_attempts is not None
            or args.free_plan_confirmed):
        parser.error("Offline Western revalidation requires only Groq astrology profile and the original attempt number.")
    if args.revalidate_grounded_attempt is not None and (
            args.profile != GROUNDED_PROFILE or args.reasoning_effort not in (None, "none")
            or args.execute or args.capture_rejected_output or args.run_id or args.max_attempts is not None
            or args.free_plan_confirmed or args.scenario or args.revalidate_western_smoke_attempt is not None):
        parser.error("Offline grounded revalidation requires only provider, grounded profile and attempt number.")
    if args.profile == "legacy-v1" and args.reasoning_effort == "high":
        parser.error("Legacy evaluations support only low or medium reasoning.")
    if args.scenario and len(set(args.scenario)) != len(args.scenario):
        parser.error("Choose each scenario once; retries require a separate explicit run.")
    limit = (GROUNDED_INSTRUCT_MAX_PROVIDER_ATTEMPTS if args.profile == GROUNDED_INSTRUCT_PROFILE else
             GROUNDED_JSON_MAX_PROVIDER_ATTEMPTS if args.profile == GROUNDED_JSON_PROFILE else
             GROUNDED_MEDIUM_MAX_PROVIDER_ATTEMPTS if args.profile == GROUNDED_MEDIUM_PROFILE else
             GROUNDED_MAX_PROVIDER_ATTEMPTS[args.provider] if args.profile == GROUNDED_PROFILE else
             MAX_PROVIDER_ATTEMPTS if args.profile == ASTROLOGY_PROFILE else
             EVIDENCE_MAX_PROVIDER_ATTEMPTS if args.profile == "qwen-evidence-v2" else
             COMPACT_MAX_PROVIDER_ATTEMPTS if args.profile in COMPACT_PROFILES else LEGACY_MAX_PROVIDER_ATTEMPTS)
    if args.max_attempts is not None and not 1 <= args.max_attempts <= limit:
        parser.error(f"--max-attempts must be between 1 and {limit}")
    if args.execute:
        if not args.free_plan_confirmed or args.max_attempts is None:
            parser.error("Execution requires --free-plan-confirmed and explicit --max-attempts.")
        if not args.run_id or not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,79}", args.run_id):
            parser.error("Execution requires a new lowercase --run-id.")
        if len(args.scenario or profile_scenarios(args.profile)) > args.max_attempts:
            parser.error("Selected scenarios exceed --max-attempts; select a smaller explicit set.")
    try:
        if args.revalidate_grounded_attempt is not None:
            return revalidate_grounded_attempt(args.provider, args.revalidate_grounded_attempt)
        if args.revalidate_western_smoke_attempt is not None:
            return revalidate_western_smoke(args.revalidate_western_smoke_attempt)
        return evaluate(args)
    except EvaluationStop as error:
        print(json.dumps({"stopped": str(error), "automatic_retry": False}))
        return 1
    except Exception as error:  # noqa: BLE001 - CLI boundary must never print credential-bearing exceptions.
        # Never print a credential-bearing URL, provider body, request or exception.
        print(json.dumps({"stopped": "evaluation_error", "error_type": type(error).__name__, "automatic_retry": False}))
        return 1


if __name__ == "__main__":
    sys.exit(main())
