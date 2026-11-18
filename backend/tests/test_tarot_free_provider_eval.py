"""Evaluation-only safeguards: no external credentials or provider calls."""

import importlib.util
import json
import stat
import sys
from pathlib import Path

import httpx
import pytest
from test_astrology_reading import interpretation
from test_tarot import example_reading

from app.games.tarot.characters import find_character
from app.games.tarot.reading import validate_reading

SCRIPT = Path(__file__).resolve().parents[2] / "scripts/eval_tarot_free_providers.py"
SPEC = importlib.util.spec_from_file_location("free_provider_eval_under_test", SCRIPT)
evaluation = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = evaluation
SPEC.loader.exec_module(evaluation)
REAL_CONTRACT_HASH = evaluation.contract_hash


@pytest.fixture(autouse=True)
def isolated_evaluator(monkeypatch, tmp_path):
    pairs = [("Chihiro", "Spirited Away"),
             ("Miles Morales", "Spider-Man: Into the Spider-Verse"),
             ("Leslie Knope", "Parks and Recreation")]
    monkeypatch.setattr(evaluation.reading, "reference_candidates",
                        lambda *_args, **_kwargs: [[find_character(*pair)] for pair in pairs])
    monkeypatch.setattr(evaluation, "EVIDENCE", tmp_path / "evidence")
    monkeypatch.setattr(evaluation, "contract_hash",
                        lambda effort="low": "fixture-contract" if effort == "low" else "fixture-contract-medium")
    monkeypatch.setattr(evaluation, "wait_for_groq_window", lambda *_args: None)


def prepared(provider="groq", scenario="ordinary-blank", effort="low"):
    return evaluation.prepare(provider, evaluation.SCENARIO_BY_ID[scenario], effort)


def envelope(entry, payload=None):
    if payload is None:
        payload = example_reading(list(entry["scenario"].cards))
        if entry["chart"]:
            payload["astrology_interpretation"] = interpretation(
                entry["scenario"].mode, entry["chart"],
            )
    return {
        "model": entry["body"]["model"],
        "choices": [{"finish_reason": "stop", "message": {
            "content": json.dumps(payload), "reasoning": "PRIVATE REASONING DO NOT RETAIN",
        }}],
        "usage": {"prompt_tokens": 200, "completion_tokens": 500, "total_tokens": 700,
                  "completion_tokens_details": {"reasoning_tokens": 80},
                  "prompt_tokens_details": {"cached_tokens": 50}, "signature": "PRIVATE SIGNATURE"},
    }


@pytest.mark.parametrize("provider", ["groq", "cloudflare"])
def test_dry_run_reads_no_credentials_and_transmits_nothing(monkeypatch, capsys, provider):
    def forbidden(*_args, **_kwargs):
        pytest.fail("Dry-run accessed settings, credentials or network")
    monkeypatch.setattr(evaluation, "load_credentials", forbidden)
    monkeypatch.setattr(evaluation.reading, "settings", forbidden)
    monkeypatch.setattr(evaluation.httpx, "Client", forbidden)
    assert evaluation.main(["--provider", provider]) == 0
    report = json.loads(capsys.readouterr().out)
    assert report["provider_calls"] == 0 and len(report["scenarios"]) == 7
    assert report["reasoning_effort"] == "low"
    assert not evaluation.EVIDENCE.exists()


@pytest.mark.parametrize("provider", ["groq", "cloudflare"])
@pytest.mark.parametrize("scenario", evaluation.SCENARIO_IDS)
def test_medium_changes_only_effort_not_prompt_context_schema_or_cap(provider, scenario):
    low = prepared(provider, scenario)
    medium = prepared(provider, scenario, "medium")
    assert medium["body"] == {**low["body"], "reasoning_effort": "medium"}
    for field in ("context_sha256", "schema_sha256", "chart_sha256", "output_cap", "candidate_counts"):
        assert medium["report"][field] == low["report"][field]
    assert medium["report"]["reasoning_effort"] == "medium"
    assert medium["report"]["request_sha256"] != low["report"]["request_sha256"]


def test_effective_contract_hash_binds_runtime_effort():
    assert REAL_CONTRACT_HASH() == REAL_CONTRACT_HASH("low")
    assert REAL_CONTRACT_HASH("low") != REAL_CONTRACT_HASH("medium")


@pytest.mark.parametrize("provider,cap", [("groq", 4096), ("cloudflare", 8192)])
@pytest.mark.parametrize("scenario", evaluation.SCENARIO_IDS)
def test_all_modes_reuse_context_and_keep_local_contract(provider, cap, scenario):
    entry = prepared(provider, scenario)
    body = entry["body"]
    schema = body["response_format"]["json_schema"]["schema"]
    assert "prefixItems" not in json.dumps(schema)
    assert schema["properties"]["cards"]["minItems"] == 3
    assert schema["properties"]["cards"]["maxItems"] == 3
    assert schema["properties"]["cards"]["items"]["properties"]["card_id"]["enum"] == list(entry["scenario"].cards)
    assert body["reasoning_effort"] == "low" and body["stream"] is False
    assert body.get("max_completion_tokens", body.get("max_tokens")) == cap
    assert not any(key in body for key in ("tools", "fallback", "gateway", "store"))
    if provider == "groq":
        assert body["include_reasoning"] is False and body["service_tier"] == "on_demand"
    result, diagnostic = evaluation.parse_response(envelope(entry), entry)
    assert result is not None and diagnostic["reason"] == "valid_contract"
    serialized = json.dumps(entry["context"])
    for forbidden in ("birth_date", "birth_time", "latitude", "longitude", "place_id", "timezone"):
        assert forbidden not in serialized


def test_wire_schema_cannot_weaken_exact_order_or_reference_validation():
    entry = prepared()
    payload = example_reading(list(entry["scenario"].cards))
    payload["cards"].reverse()
    result, diagnostic = evaluation.parse_response(envelope(entry, payload), entry)
    assert result is None and diagnostic["reason"] == "invalid_card_reference_or_astrology_contract"
    payload = example_reading(list(entry["scenario"].cards))
    payload["cards"][0]["characters"][0]["name"] = "Invented identity"
    result, diagnostic = evaluation.parse_response(envelope(entry, payload), entry)
    assert result is None and diagnostic["reason"] == "invalid_schema"
    assert evaluation.reading.validate_reading is validate_reading


@pytest.mark.parametrize("scenario", evaluation.SCENARIO_IDS)
def test_both_providers_receive_identical_public_facts_and_schema(scenario):
    groq, cloudflare = prepared("groq", scenario), prepared("cloudflare", scenario)
    assert groq["context"] == cloudflare["context"]
    assert groq["report"]["context_sha256"] == cloudflare["report"]["context_sha256"]
    assert groq["report"]["schema_sha256"] == cloudflare["report"]["schema_sha256"]


@pytest.mark.parametrize("failure", ["length", "refusal", "tool", "wrong_model", "bad_json", "extra"])
def test_failures_are_not_repaired_or_exposed(failure):
    entry = prepared()
    body = envelope(entry)
    message = body["choices"][0]["message"]
    if failure == "length":
        body["choices"][0]["finish_reason"] = "length"
    elif failure == "refusal":
        message["refusal"] = "PRIVATE REFUSAL"
    elif failure == "tool":
        message["tool_calls"] = [{"function": "not_allowed"}]
    elif failure == "wrong_model":
        body["model"] = "paid-other-model"
    elif failure == "bad_json":
        message["content"] = "<think>PRIVATE REASONING</think>```json {} ```"
    else:
        payload = json.loads(message["content"])
        payload["extra"] = "PRIVATE INPUT"
        message["content"] = json.dumps(payload)
    result, diagnostic = evaluation.parse_response(body, entry)
    assert result is None and "PRIVATE" not in json.dumps(diagnostic)


def test_usage_keeps_counts_and_discards_reasoning_signatures():
    usage = evaluation.normalized_usage(envelope(prepared()))
    assert usage == {"prompt_tokens": 200, "completion_tokens": 500, "total_tokens": 700,
                     "reasoning_tokens": 80, "cached_tokens": 50}
    assert evaluation.normalized_usage({"usage": {"prompt_tokens": True, "completion_tokens": -1}}) == {}


def test_unknown_json_property_names_cannot_leak_through_error_locations():
    entry = prepared()
    payload = example_reading(list(entry["scenario"].cards))
    payload["PRIVATE PROVIDER TEXT IN PROPERTY NAME"] = "PRIVATE VALUE"
    payload["cards"][0]["characters"][0]["PRIVATE NESTED REASONING"] = "PRIVATE VALUE"
    result, diagnostic = evaluation.parse_response(envelope(entry, payload), entry)
    assert result is None and diagnostic["reason"] == "invalid_schema"
    assert diagnostic["validation_error_count"] == 2
    assert "PRIVATE" not in json.dumps(diagnostic)
    assert {tuple(field["location"]) for field in diagnostic["fields"]} == {
        ("<extra>",), ("cards", 0, "characters", 0, "<extra>"),
    }


@pytest.mark.parametrize("status", [301, 400, 401, 403, 429, 500, 503])
def test_http_failure_makes_one_request_without_fallback_or_raw_error(status):
    calls = []
    def respond(request):
        calls.append(request)
        return httpx.Response(status, json={"error": {"message": "PRIVATE KEY OR BODY"}})
    with httpx.Client(transport=httpx.MockTransport(respond)) as client:
        result, diagnostic, stop = evaluation.send_once(client, "https://api.groq.com/openai/v1/chat/completions", "test-key", prepared())
    assert len(calls) == 1 and result is None and stop
    assert diagnostic == {"http_status": status, "reason": "http_error"}


def test_http_diagnostics_keep_only_bounded_codes_keywords_and_rate_limits():
    body = {"error": {"code": "json_schema_invalid", "type": "invalid_request_error",
                      "param": "response_format", "message": "PRIVATE prose: minLength unsupported; prefixItems too"}}
    result = evaluation.http_diagnostics(body, {"retry-after": "65", "x-ratelimit-limit-tokens": "8000",
                                               "authorization": "PRIVATE KEY", "set-cookie": "PRIVATE COOKIE"})
    assert result["provider_errors"] == [{"code": "json_schema_invalid", "type": "invalid_request_error",
                                         "param": "response_format"}]
    assert result["mentioned_contract_keywords"] == ["minLength", "prefixItems"]
    assert result["rate_limit_headers"] == {"retry-after": "65", "x-ratelimit-limit-tokens": "8000"}
    assert "PRIVATE" not in json.dumps(result)
    assert evaluation.http_diagnostics({"error": {"code": "gsk_secret", "param": "private prose or key"}}, {}) == {}


def configure_execution(monkeypatch, response):
    real_client = httpx.Client
    calls = []
    def respond(request):
        calls.append(request)
        return response(request)
    def client(**kwargs):
        kwargs["transport"] = httpx.MockTransport(respond)
        return real_client(**kwargs)
    monkeypatch.setattr(evaluation.httpx, "Client", client)
    monkeypatch.setattr(evaluation, "load_credentials", lambda _provider: {"GROQ_API_KEY": "test-secret"})
    return calls


def smoke_args(run_id="smoke-one"):
    return ["--provider", "groq", "--execute", "--free-plan-confirmed", "--max-attempts", "1",
            "--run-id", run_id, "--scenario", "ordinary-blank"]


def test_execution_reserves_before_send_saves_private_evidence_and_never_reasoning(monkeypatch):
    entry = prepared()
    def respond(_request):
        assert len(evaluation.reservations("groq")) == 1
        return httpx.Response(200, json=envelope(entry))
    calls = configure_execution(monkeypatch, respond)
    assert evaluation.main(smoke_args()) == 0 and len(calls) == 1
    files = list(evaluation.EVIDENCE.rglob("*.json"))
    assert all(stat.S_IMODE(path.stat().st_mode) == 0o600 for path in files)
    saved = "".join(path.read_text() for path in files)
    assert all(value not in saved for value in ("test-secret", "PRIVATE REASONING", "PRIVATE SIGNATURE"))
    assert evaluation.smoke_passed("groq", "fixture-contract")
    assert not evaluation.smoke_passed("groq", "changed-contract")
    assert evaluation.main(smoke_args()) == 1 and len(calls) == 1  # Exclusive run directory.


def test_matrix_requires_prior_valid_smoke_and_budget_is_durable(monkeypatch):
    calls = configure_execution(monkeypatch, lambda _request: pytest.fail("No request allowed"))
    args = smoke_args()
    args[-1] = "ordinary-grief"
    assert evaluation.main(args) == 1 and calls == []
    for attempt in range(1, 11):
        evaluation.private_json(evaluation.EVIDENCE / f"groq-attempt-{attempt:03}-reserved.json",
                                {"provider": "groq", "attempt": attempt})
    assert evaluation.main(smoke_args("eleventh-run")) == 1 and calls == []
    assert evaluation.main(smoke_args("eleventh-medium") + ["--reasoning-effort", "medium"]) == 1 and calls == []


def test_medium_requires_own_smoke_and_reuses_total_reservation_history(monkeypatch):
    entries = iter([prepared(), prepared(effort="medium"), prepared(scenario="ordinary-grief", effort="medium")])
    calls = configure_execution(monkeypatch, lambda _request: httpx.Response(200, json=envelope(next(entries))))
    assert evaluation.main(smoke_args()) == 0
    assert not evaluation.smoke_passed("groq", "fixture-contract", "medium")
    medium_grief = smoke_args("medium-grief")
    medium_grief[-1] = "ordinary-grief"
    medium_grief += ["--reasoning-effort", "medium"]
    assert evaluation.main(medium_grief) == 1 and len(calls) == 1
    assert evaluation.main(smoke_args("medium-smoke") + ["--reasoning-effort", "medium"]) == 0
    assert evaluation.smoke_passed("groq", "fixture-contract-medium", "medium")
    assert evaluation.main(medium_grief) == 0 and len(calls) == 3
    reservations = evaluation.reservations("groq")
    assert [row["attempt"] for row in reservations] == [1, 2, 3]
    assert [row["reasoning_effort"] for row in reservations] == ["low", "medium", "medium"]
    result = json.loads((evaluation.EVIDENCE / "groq-attempt-003-result.json").read_text())
    assert result["reasoning_effort"] == "medium" and result["contract_sha256"] == "fixture-contract-medium"


def test_timeout_consumes_reservation_without_retry(monkeypatch):
    def timeout(request):
        raise httpx.ReadTimeout("PRIVATE TRANSPORT MESSAGE", request=request)
    calls = configure_execution(monkeypatch, timeout)
    assert evaluation.main(smoke_args()) == 1
    assert len(calls) == len(evaluation.reservations("groq")) == 1
    record = json.loads((evaluation.EVIDENCE / "groq-attempt-001-result.json").read_text())
    assert record["reason"] == "transport_timeout" and record["automatic_retry"] is False


@pytest.mark.parametrize("args", [
    ["--provider", "groq", "--execute"],
    ["--provider", "groq", "--max-attempts", "11"],
    ["--provider", "groq", "--execute", "--max-attempts", "1", "--free-plan-confirmed", "--run-id", "../escape"],
    ["--provider", "groq", "--execute", "--max-attempts", "1", "--free-plan-confirmed", "--run-id", "many"],
    ["--provider", "groq", "--reasoning-effort", "high"],
])
def test_cli_refuses_unbounded_or_unconfirmed_execution(args):
    with pytest.raises(SystemExit):
        evaluation.main(args)


def test_credentials_are_games_only_selected_names_and_no_environment_fallback(monkeypatch, tmp_path):
    monkeypatch.setattr(evaluation, "ROOT", tmp_path)
    monkeypatch.setenv("GROQ_API_KEY", "must-not-use-process-value")
    path = tmp_path / ".env.ai.local"
    path.write_text("GEMINI_API_KEY=unrelated\nGROQ_API_KEY='selected-groq'\nCLOUDFLARE_API_TOKEN=other\n")
    path.chmod(0o600)
    assert evaluation.load_credentials("groq") == {"GROQ_API_KEY": "selected-groq"}
    path.write_text("GEMINI_API_KEY=unrelated\n")
    with pytest.raises(evaluation.EvaluationStop, match="selected_provider_not_configured"):
        evaluation.load_credentials("groq")
