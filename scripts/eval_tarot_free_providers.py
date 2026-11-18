"""Evaluation only: fixed free-account Groq/Cloudflare Tarot comparison.

Dry-run by default; execution requires a verified free-only account, an explicit
attempt budget and a new run ID. Never changes application settings or database
records. Ten durable reservations per provider cover all runs, including failures.
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
MAX_TOTAL_ATTEMPTS = 10
WIRE_VERSION = "free-provider-eval-1"
SCENARIO_IDS = (
    "ordinary-blank", "ordinary-grief", "ordinary-nataraja", "ordinary-inbox",
    "western-rest", "vedic-resources", "both-boundaries",
)
SCENARIO_BY_ID = {scenario.id: scenario for scenario in SCENARIOS if scenario.id in SCENARIO_IDS}
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


def contract_hash(reasoning_effort="low"):
    return digest({
        "script": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        "reading": hashlib.sha256(Path(reading.__file__).read_bytes()).hexdigest(),
        "prompt_version": reading.PROMPT_VERSION,
        "reasoning_effort": reasoning_effort,
        "reference_index": hashlib.sha256(
            (ROOT / "backend/app/games/tarot/reference-index.json").read_bytes(),
        ).hexdigest(),
    })


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


def prepare(provider, scenario, reasoning_effort="low"):
    from app.settings import Settings

    if reasoning_effort not in ("low", "medium"):
        raise EvaluationStop("unsupported_evaluation_reasoning_effort")
    chart = chart_for(scenario)
    # The production builder needs only a model name. Avoid reading the existing
    # Gemini credential or any other environment setting even during dry runs.
    # The same code default also keeps shortlist trimming identical across both
    # providers: model-name length must not change the supplied reference facts.
    model_label = Settings.model_fields["tarot_model"].default
    with patch.object(reading, "settings", return_value=SimpleNamespace(tarot_model=model_label)):
        original = reading.build_reading_request(
            list(scenario.cards), scenario.question, astrology_chart=chart,
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
    serialized = httpx.Request("POST", "https://evaluation.invalid", json=body).content
    if len(serialized) > 20_000:
        raise EvaluationStop("wire_request_budget_exceeded")
    estimate = math.ceil(len(serialized) / 4)
    if provider == "groq" and estimate + OUTPUT_CAPS[provider] > 8000:
        raise EvaluationStop("estimated_groq_token_reservation_exceeds_free_tpm")
    report = {
        "id": scenario.id, "mode": scenario.mode, "provider": provider,
        "model": MODELS[provider], "prompt_version": reading.PROMPT_VERSION,
        "wire_version": WIRE_VERSION, "reasoning_effort": reasoning_effort,
        "output_cap": OUTPUT_CAPS[provider], "request_bytes": len(serialized),
        "estimated_input_tokens": estimate,
        "estimate_method": "serialized request bytes / 4; approximate, not provider usage",
        "estimated_input_plus_output_cap": estimate + OUTPUT_CAPS[provider],
        "request_sha256": hashlib.sha256(serialized).hexdigest(), "schema_sha256": digest(schema),
        "context_sha256": digest(context),
        "candidate_counts": [len(card["reference_characters"]) for card in context["cards"]],
        "schema_adaptation": "prefixItems replaced by items and ordered card/position enums; local contract unchanged",
        "chart_sha256": hashlib.sha256(chart.model_dump_json().encode()).hexdigest() if chart else None,
    }
    if provider == "cloudflare":
        report["estimated_neurons_at_output_cap"] = math.ceil(
            estimate * 31818 / 1_000_000 + OUTPUT_CAPS[provider] * 68182 / 1_000_000,
        )
    return {"scenario": scenario, "chart": chart, "context": context, "body": body, "report": report}


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


def http_diagnostics(body, headers):
    """Allowlisted machine diagnostics only; never provider error prose."""
    result = {}
    if isinstance(body, dict):
        errors = body.get("errors", [])
        entries = ([body["error"]] if isinstance(body.get("error"), dict) else [])
        if isinstance(errors, list):
            entries.extend(error for error in errors[:4] if isinstance(error, dict))
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


def parse_response(body, prepared):
    """Never retains reasoning, provider error messages or arbitrary envelope data."""
    if not isinstance(body, dict) or body.get("error") or body.get("errors"):
        return None, {"reason": "invalid_or_error_envelope"}
    model = body.get("model")
    allowed_models = {MODELS[prepared["report"]["provider"]], "openai/gpt-oss-120b", "gpt-oss-120b"}
    if model not in allowed_models:
        return None, {"reason": "unexpected_model"}
    choices = body.get("choices")
    if not isinstance(choices, list) or len(choices) != 1 or not isinstance(choices[0], dict):
        return None, {"reason": "invalid_choices"}
    choice = choices[0]
    message = choice.get("message")
    if not isinstance(message, dict) or message.get("refusal") or message.get("tool_calls"):
        return None, {"reason": "refusal_or_nontext_output"}
    finish = choice.get("finish_reason")
    if finish != "stop":
        return None, {"reason": "truncated" if finish == "length" else "not_completed"}
    text = message.get("content")
    if not isinstance(text, str) or not text or len(text) > 100_000:
        return None, {"reason": "missing_or_oversized_final_text"}
    fingerprint = {"final_text_characters": len(text), "final_text_sha256": hashlib.sha256(text.encode()).hexdigest()}
    # Deliberately do not salvage fenced JSON or strip a model's reasoning tags.
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
            "name", "source", "connection", "astrology_interpretation", "western", "vedic",
            "focus_points", "normal", "quirky", "tarot_connection",
        }
        fields = [{"location": [part if (isinstance(part, str) and part in known_fields)
                                or (type(part) is int and 0 <= part <= 100) else "<extra>"
                                for part in entry["loc"][:12]], "type": entry["type"]}
                  for entry in error.errors(include_input=False, include_context=False, include_url=False)]
        return None, {"reason": "invalid_schema", "fields": fields[:50],
                      "validation_error_count": error.error_count(), **fingerprint}
    except ValueError:
        return None, {"reason": "invalid_card_reference_or_astrology_contract", **fingerprint}
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


def reservations(provider):
    rows = []
    for path in sorted(EVIDENCE.glob(f"{provider}-attempt-???-reserved.json")):
        record = json.loads(path.read_text())
        if record["provider"] != provider or record["attempt"] != len(rows) + 1:
            raise EvaluationStop("reservation_history_is_invalid")
        rows.append(record)
    if len(rows) > MAX_TOTAL_ATTEMPTS:
        raise EvaluationStop("provider_budget_already_exceeded")
    return rows


def smoke_passed(provider, current_contract, reasoning_effort="low"):
    for path in EVIDENCE.glob(f"{provider}-attempt-???-result.json"):
        record = json.loads(path.read_text())
        if (record.get("provider") == provider and record.get("id") == "ordinary-blank"
                and record.get("reasoning_effort") == reasoning_effort
                and record.get("status") == "valid" and record.get("contract_sha256") == current_contract):
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


def send_once(client, endpoint, key, prepared):
    """One HTTP transmission, no SDK retries, redirects, tools or fallback."""
    try:
        with client.stream("POST", endpoint, headers={"Authorization": "Bearer " + key},
                           json=prepared["body"]) as response:
            summary = {"http_status": response.status_code}
            chunks, length = [], 0
            limit = 16_000 if response.status_code != 200 else 500_000
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
                return None, {**summary, "reason": "http_error", **http_diagnostics(body, response.headers)}, True
            usage = normalized_usage(body)
            result, diagnosis = parse_response(body, prepared)
            # Raw body and reasoning fields are discarded, including on errors.
            return result, {**summary, **diagnosis, "usage": usage,
                            **http_diagnostics(None, response.headers)}, diagnosis["reason"] == "unexpected_model"
    except httpx.TimeoutException:
        return None, {"reason": "transport_timeout"}, True
    except httpx.RequestError:
        return None, {"reason": "transport_error"}, True


def evaluate(args):
    selected = args.scenario or list(SCENARIO_IDS)
    prepared = [prepare(args.provider, SCENARIO_BY_ID[ident], args.reasoning_effort) for ident in selected]
    current_contract = contract_hash(args.reasoning_effort)
    planned = {
        "provider": args.provider, "model": MODELS[args.provider], "provider_calls": 0,
        "prompt_version": reading.PROMPT_VERSION, "wire_version": WIRE_VERSION,
        "reasoning_effort": args.reasoning_effort,
        "contract_sha256": current_contract, "max_attempts_this_run": args.max_attempts,
        "max_attempts_provider_total": MAX_TOTAL_ATTEMPTS,
        "free_plan_operator_confirmation": bool(args.free_plan_confirmed),
        "scenarios": [entry["report"] for entry in prepared],
    }
    if not args.execute:
        print(json.dumps(planned, indent=2))
        return 0
    with provider_lock(args.provider):
        previous = reservations(args.provider)
        if len(previous) + len(prepared) > MAX_TOTAL_ATTEMPTS:
            raise EvaluationStop("provider_total_budget_would_be_exceeded")
        if not smoke_passed(args.provider, current_contract, args.reasoning_effort) and selected != ["ordinary-blank"]:
            raise EvaluationStop("run_one_ordinary_blank_smoke_before_matrix")
        credentials = load_credentials(args.provider)
        endpoint, key = endpoint_and_key(args.provider, credentials)
        directory = EVIDENCE / args.run_id
        directory.mkdir(mode=0o700, exist_ok=False)
        private_json(directory / "preflight.json", planned)
        records = []
        with httpx.Client(timeout=httpx.Timeout(90, connect=5), follow_redirects=False,
                          trust_env=False, transport=httpx.HTTPTransport(retries=0)) as client:
            for entry in prepared:
                previous = reservations(args.provider)
                wait_for_groq_window(args.provider, previous)
                attempt = len(previous) + 1
                private_json(directory / f"{entry['scenario'].id}-request-private.json", {
                    "request": entry["body"], "context": entry["context"],
                    "chart": entry["chart"].model_dump(mode="json") if entry["chart"] else None,
                })
                reservation = {
                    "provider": args.provider, "attempt": attempt, "run_id": args.run_id,
                    "scenario": entry["scenario"].id, "reserved_unix": time.time(),
                    "reasoning_effort": args.reasoning_effort,
                    "contract_sha256": current_contract, "free_plan_operator_confirmation": True,
                }
                private_json(EVIDENCE / f"{args.provider}-attempt-{attempt:03}-reserved.json", reservation)
                started = time.monotonic()
                result, diagnosis, stop = send_once(client, endpoint, key, entry)
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
    parser.add_argument("--reasoning-effort", choices=("low", "medium"), default="low",
                        help="Evaluation-only effort; changing it requires a fresh smoke within the same request budget")
    parser.add_argument("--execute", action="store_true")
    parser.add_argument("--free-plan-confirmed", action="store_true",
                        help="Operator verified this account has no paid or overage billing; not an API billing control")
    parser.add_argument("--run-id")
    parser.add_argument("--max-attempts", type=int)
    parser.add_argument("--scenario", action="append", choices=SCENARIO_IDS)
    args = parser.parse_args(argv)
    if args.scenario and len(set(args.scenario)) != len(args.scenario):
        parser.error("Choose each scenario once; retries require a separate explicit run.")
    if args.max_attempts is not None and not 1 <= args.max_attempts <= MAX_TOTAL_ATTEMPTS:
        parser.error("--max-attempts must be between 1 and 10")
    if args.execute:
        if not args.free_plan_confirmed or args.max_attempts is None:
            parser.error("Execution requires --free-plan-confirmed and explicit --max-attempts.")
        if not args.run_id or not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,79}", args.run_id):
            parser.error("Execution requires a new lowercase --run-id.")
        if len(args.scenario or SCENARIO_IDS) > args.max_attempts:
            parser.error("Selected scenarios exceed --max-attempts; select a smaller explicit set.")
    try:
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
