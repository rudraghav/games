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
                        lambda effort="low", profile="legacy-v1", provider=None:
                        ("fixture-contract" if effort == "low" else "fixture-contract-medium")
                        if profile == "legacy-v1" else f"fixture-{profile}-{provider}-{effort}")
    monkeypatch.setattr(evaluation, "wait_for_groq_window", lambda *_args: None)


def prepared(provider="groq", scenario="ordinary-blank", effort=None, profile="legacy-v1"):
    return evaluation.prepare(provider, evaluation.SCENARIO_BY_ID[scenario], effort, profile)


def envelope(entry, payload=None):
    if payload is None:
        payload = example_reading(list(entry["scenario"].cards))
        if entry["chart"]:
            payload["astrology_interpretation"] = interpretation(
                entry["scenario"].mode, entry["chart"],
            )
        if entry["report"]["profile"] in evaluation.COMPACT_PROFILES:
            cards = payload.pop("cards")
            for index, card in enumerate(cards):
                reference = entry["context"]["cards"][index]["reference_characters"][0]
                payload[f"card_{index + 1}"] = {
                    **{field: card[field] for field in ("title", "interpretation", "quirky_interpretation")},
                    "reference_id": find_character(reference["name"], reference["source"])["id"],
                    "connection": card["characters"][0]["connection"],
                }
            for system in ("western", "vedic"):
                section = payload.get("astrology_interpretation", {}).get(system)
                if section:
                    section["focus_1"], section["focus_2"] = section.pop("focus_points")
            if entry["report"]["profile"] in ("qwen-none-v1", "qwen-evidence-v2", evaluation.ASTROLOGY_PROFILE):
                for index in range(1, 4):
                    card = payload[f"card_{index}"]
                    card["imagery"] = card.pop("quirky_interpretation")
                    if entry["report"]["profile"] in ("qwen-evidence-v2", evaluation.ASTROLOGY_PROFILE):
                        card.pop("interpretation")
                        card["reflection_question"] = "What might this card invite someone to consider before taking a small next step?"
                        card["connection"] = "How might this background offer a useful question about the card's possibilities?"
                for system in ("western", "vedic"):
                    section = payload.get("astrology_interpretation", {}).get(system)
                    if section:
                        section["imagery"] = section.pop("quirky")
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
    monkeypatch.setattr(evaluation, "load_credentials", lambda _provider: {
        "GROQ_API_KEY": "test-secret", "CLOUDFLARE_ACCOUNT_ID": "a" * 32,
        "CLOUDFLARE_API_TOKEN": "test-secret",
    })
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


@pytest.mark.parametrize("provider", evaluation.MODELS)
def test_compact_dry_run_is_explicit_fixed_profile_without_credentials(monkeypatch, capsys, provider):
    def forbidden(*_args, **_kwargs):
        pytest.fail("Compact dry-run must not access credentials or network")
    monkeypatch.setattr(evaluation, "load_credentials", forbidden)
    monkeypatch.setattr(evaluation.httpx, "Client", forbidden)
    assert evaluation.main(["--provider", provider, "--profile", "compact-v2"]) == 0
    report = json.loads(capsys.readouterr().out)
    assert report["provider_calls"] == 0 and len(report["scenarios"]) == 7
    assert report["smoke_scenario"] == "ordinary-grief"
    assert report["max_attempts_provider_total"] == 20
    assert report["max_attempts_combined_total"] == 35
    assert report["reasoning_effort"] == ("high" if provider == "groq" else "none")
    assert not evaluation.EVIDENCE.exists()


@pytest.mark.parametrize("provider", evaluation.MODELS)
@pytest.mark.parametrize("scenario", evaluation.SCENARIO_IDS)
def test_compact_adapter_preserves_exact_local_validation(provider, scenario):
    entry = prepared(provider, scenario, profile="compact-v2")
    result, diagnostic = evaluation.parse_response(envelope(entry), entry)
    assert result is not None and diagnostic["reason"] == "valid_contract"
    assert [card.card_id for card in result.cards] == list(entry["scenario"].cards)
    assert evaluation.reading.validate_reading is validate_reading
    body = entry["body"]
    assert body["response_format"]["type"] == "json_schema"
    assert not any(key in body for key in ("tools", "fallback", "gateway"))
    if provider == "cloudflare":
        assert body["model"] == "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
        assert "reasoning_effort" not in body
    else:
        assert body["reasoning_effort"] == "high" and body["service_tier"] == "on_demand"
    payload = json.loads(envelope(entry)["choices"][0]["message"]["content"])
    payload["card_1"]["interpretation"] = "x"  # Wire omitted length bounds; domain still requires them.
    result, diagnostic = evaluation.parse_response(envelope(entry, payload), entry)
    assert result is None and diagnostic["reason"] == "invalid_schema"


def test_compact_contract_hash_binds_provider_adapter_model_and_profile(monkeypatch):
    from app.games.tarot import providers
    groq = REAL_CONTRACT_HASH("high", "compact-v2", "groq")
    assert groq != REAL_CONTRACT_HASH("medium", "legacy-v1", "groq")
    assert groq != REAL_CONTRACT_HASH("none", "compact-v2", "cloudflare")
    monkeypatch.setitem(providers.ALTERNATIVE_MODELS, "groq", "test-model")
    assert groq != REAL_CONTRACT_HASH("high", "compact-v2", "groq")


def historical_reservations(provider, count):
    evaluation.EVIDENCE.mkdir(mode=0o700, exist_ok=True)
    for attempt in range(1, count + 1):
        evaluation.private_json(evaluation.EVIDENCE / f"{provider}-attempt-{attempt:03}-reserved.json",
                                {"provider": provider, "attempt": attempt, "reserved_unix": 0})


def compact_args(provider="groq", run_id="compact-smoke", scenario="ordinary-grief", profile="compact-v2"):
    return ["--provider", provider, "--profile", profile, "--execute", "--free-plan-confirmed",
            "--max-attempts", "1", "--run-id", run_id, "--scenario", scenario]


def test_compact_counts_all_historical_failures_and_interrupted_reservations(monkeypatch):
    historical_reservations("groq", 7)
    historical_reservations("cloudflare", 8)
    before = {path.name: path.read_bytes() for path in evaluation.EVIDENCE.glob("*.json")}
    entry = prepared(scenario="ordinary-grief", profile="compact-v2")
    def respond(_request):
        assert len(evaluation.combined_reservations()) == 16
        return httpx.Response(200, json=envelope(entry))
    calls = configure_execution(monkeypatch, respond)
    assert evaluation.main(compact_args()) == 0 and len(calls) == 1
    assert all((evaluation.EVIDENCE / name).read_bytes() == contents for name, contents in before.items())
    reservation = evaluation.reservations("groq")[-1]
    assert reservation["attempt"] == 8 and reservation["combined_attempt"] == 16
    assert reservation["profile"] == "compact-v2" and reservation["output_format"] == "json_schema"
    assert evaluation.smoke_passed("groq", "fixture-compact-v2-groq-high", "high", "compact-v2")
    # Orchestration-only source changes retain exact wire compatibility proof.
    assert evaluation.smoke_passed("groq", "changed-orchestration-hash", "high", "compact-v2")


@pytest.mark.parametrize("groq,cloudflare,reason", [(20, 8, "provider_total"), (18, 17, "combined_total")])
def test_compact_cumulative_budgets_fail_before_credentials_or_transmission(monkeypatch, capsys, groq, cloudflare, reason):
    historical_reservations("groq", groq)
    historical_reservations("cloudflare", cloudflare)
    monkeypatch.setattr(evaluation, "load_credentials", lambda *_: pytest.fail("Budget must fail before credentials"))
    assert evaluation.main(compact_args()) == 1
    assert reason in capsys.readouterr().out
    assert len(evaluation.combined_reservations()) == groq + cloudflare


def test_final_combined_slot_is_reserved_once_then_blocks_next_provider(monkeypatch):
    historical_reservations("groq", 17)
    historical_reservations("cloudflare", 17)
    calls = configure_execution(monkeypatch, lambda _: httpx.Response(503, json={"error": {"code": "busy"}}))
    assert evaluation.main(compact_args()) == 1
    assert len(calls) == 1 and len(evaluation.combined_reservations()) == 35
    assert evaluation.main(compact_args("cloudflare", "other-provider")) == 1 and len(calls) == 1


def test_compact_requires_own_grief_smoke_and_legacy_budget_cannot_expand(monkeypatch):
    historical_reservations("groq", 10)
    calls = configure_execution(monkeypatch, lambda _: pytest.fail("No HTTP request allowed"))
    assert evaluation.main(smoke_args("legacy-eleventh")) == 1
    assert evaluation.main(compact_args(scenario="ordinary-blank")) == 1
    assert evaluation.main(compact_args() + ["--reasoning-effort", "low"]) == 1
    assert evaluation.main(compact_args("cloudflare") + ["--reasoning-effort", "medium"]) == 1
    assert calls == []


def test_global_lock_prevents_parallel_provider_budget_race():
    with evaluation.evaluation_lock("groq"):
        with pytest.raises(evaluation.EvaluationStop, match="another_provider_evaluation_is_running"):
            with evaluation.evaluation_lock("cloudflare"):
                pytest.fail("Other provider entered global critical section")


def test_compact_output_cannot_cross_model_or_leak_invalid_keys():
    entry = prepared("cloudflare", profile="compact-v2")
    body = envelope(entry)
    body["model"] = "@cf/openai/gpt-oss-120b"
    assert evaluation.parse_response(body, entry)[1]["reason"] == "unexpected_model"
    body = envelope(entry)
    payload = json.loads(body["choices"][0]["message"]["content"])
    payload["PRIVATE PROVIDER KEY"] = "PRIVATE VALUE"
    result, diagnostic = evaluation.parse_response(envelope(entry, payload), entry)
    assert result is None and "PRIVATE" not in json.dumps(diagnostic)


def test_compact_smoke_reuse_requires_exact_wire_and_current_domain_validation(monkeypatch):
    entry = prepared(scenario="ordinary-grief", profile="compact-v2")
    configure_execution(monkeypatch, lambda _: httpx.Response(200, json=envelope(entry)))
    assert evaluation.main(compact_args()) == 0
    assert evaluation.smoke_passed("groq", "orchestration-changed", "high", "compact-v2")
    with monkeypatch.context() as patch:
        def reject(*_args, **_kwargs):
            raise ValueError("PRIVATE NEW VALIDATOR DETAIL")
        patch.setattr(evaluation.reading, "validate_reading", reject)
        assert not evaluation.smoke_passed("groq", "orchestration-changed", "high", "compact-v2")
    original = evaluation.reading.build_reading_request
    def changed_request(*args, **kwargs):
        request = original(*args, **kwargs)
        request["system_instruction"] += " Changed instruction."
        return request
    monkeypatch.setattr(evaluation.reading, "build_reading_request", changed_request)
    # V2 has its own system prompt; changing unused canonical wording leaves
    # the actual transmitted request identical.
    assert evaluation.smoke_passed("groq", "orchestration-changed", "high", "compact-v2")
    from app.games.tarot import providers
    monkeypatch.setattr(providers, "COMPACT_SYSTEM", providers.COMPACT_SYSTEM + " Actual wire change.")
    assert not evaluation.smoke_passed("groq", "orchestration-changed", "high", "compact-v2")


@pytest.mark.parametrize("change", ["adapter", "reading", "request", "result", "missing"])
def test_compact_smoke_attestation_fails_closed_on_changed_artifacts(monkeypatch, change):
    entry = prepared(scenario="ordinary-grief", profile="compact-v2")
    configure_execution(monkeypatch, lambda _: httpx.Response(200, json=envelope(entry)))
    assert evaluation.main(compact_args()) == 0
    attestation_path = evaluation.EVIDENCE / "groq-attempt-001-smoke-attestation.json"
    attestation = json.loads(attestation_path.read_text())
    assert attestation["editorial_acceptance"] is False  # Schema evidence is never editorial approval.
    if change == "missing":
        attestation_path.unlink()
    elif change == "adapter":
        attestation["adapter_sha256"] = "different"
        attestation_path.write_text(json.dumps(attestation))
    else:
        paths = evaluation.smoke_artifacts(attestation)
        path = paths[change + "_artifact"]
        path.write_text(path.read_text() + " ")
    assert not evaluation.smoke_passed("groq", "new-contract", "high", "compact-v2")


def test_attestation_refuses_source_change_during_request(monkeypatch):
    entry = prepared(scenario="ordinary-grief", profile="compact-v2")
    def respond(_request):
        monkeypatch.setattr(evaluation, "contract_hash", lambda *_: "source-changed-during-call")
        return httpx.Response(200, json=envelope(entry))
    calls = configure_execution(monkeypatch, respond)
    assert evaluation.main(compact_args()) == 1 and len(calls) == 1
    assert len(evaluation.reservations("groq")) == 1
    assert not (evaluation.EVIDENCE / "groq-attempt-001-smoke-attestation.json").exists()


def test_retired_v1_cannot_silently_execute_current_adapter(monkeypatch, capsys):
    monkeypatch.setattr(evaluation, "load_credentials", lambda *_: pytest.fail("No credential read allowed"))
    args = compact_args()
    args[args.index("compact-v2")] = "compact-v1"
    assert evaluation.main(args) == 1
    assert "retired_compact_profile_requires_explicit_new_profile" in capsys.readouterr().out
    assert not evaluation.EVIDENCE.exists()


def test_v1_smoke_does_not_unlock_v2_or_reset_attempt_history(monkeypatch):
    historical_reservations("groq", 8)
    historical_reservations("cloudflare", 9)
    evaluation.private_json(evaluation.EVIDENCE / "groq-attempt-008-result.json", {
        "provider": "groq", "attempt": 8, "profile": "compact-v1", "id": "ordinary-grief",
        "status": "valid", "reasoning_effort": "medium", "contract_sha256": "fixture-compact-v2-groq-high",
    })
    calls = configure_execution(monkeypatch, lambda _: pytest.fail("V2 requires its own grief smoke"))
    assert evaluation.main(compact_args(scenario="ordinary-blank")) == 1
    assert calls == [] and len(evaluation.combined_reservations()) == 17


@pytest.mark.parametrize("scenario", evaluation.SCENARIO_IDS)
def test_groq_json_profile_preserves_exact_schema_facts_and_local_validation(scenario):
    from app.games.tarot.groq_json import build_groq_json_request
    strict = prepared("groq", scenario, profile="compact-v2")
    diagnostic = prepared("groq", scenario, profile="compact-json-v1")
    before = json.dumps(strict["body"], sort_keys=True)
    transformed = build_groq_json_request(strict["body"])
    assert json.dumps(strict["body"], sort_keys=True) == before
    assert diagnostic["body"] == transformed
    assert transformed["response_format"] == {"type": "json_object"}
    original_schema = strict["body"]["response_format"]["json_schema"]["schema"]
    appended = transformed["messages"][0]["content"].split("\nReturn one JSON object matching this exact schema:\n", 1)[1]
    assert json.loads(appended) == original_schema
    assert transformed["messages"][1] == strict["body"]["messages"][1]
    for key in ("context_sha256", "wire_context_sha256", "schema_sha256", "chart_sha256", "candidate_counts", "output_cap"):
        assert diagnostic["report"][key] == strict["report"][key]
    result, reason = evaluation.parse_response(envelope(diagnostic), diagnostic)
    assert result is not None and reason["reason"] == "valid_contract"
    assert transformed["reasoning_effort"] == "high" and transformed["max_completion_tokens"] == 4096
    assert diagnostic["report"]["output_format"] == "json_object"
    assert diagnostic["report"]["request_sha256"] != strict["report"]["request_sha256"]


@pytest.mark.parametrize("change", ["provider", "cap", "effort", "format", "system"])
def test_groq_json_transform_rejects_other_models_caps_or_untrusted_schema(change):
    from app.games.tarot.groq_json import build_groq_json_request
    body = prepared(profile="compact-v2")["body"]
    if change == "provider":
        body["model"] = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
    elif change == "cap":
        body["max_completion_tokens"] = 8192
    elif change == "effort":
        body["reasoning_effort"] = "low"
    elif change == "format":
        body["response_format"] = {"type": "json_object"}
    else:
        body["messages"][0]["role"] = "user"
    with pytest.raises(ValueError, match="invalid_groq_json_base_request"):
        build_groq_json_request(body)


def test_json_profile_is_groq_only_and_never_inherits_strict_smoke(monkeypatch):
    entry = prepared(scenario="ordinary-grief", profile="compact-v2")
    calls = configure_execution(monkeypatch, lambda _: httpx.Response(200, json=envelope(entry)))
    assert evaluation.main(compact_args()) == 0
    assert not evaluation.smoke_passed("groq", "anything", "high", "compact-json-v1")
    assert evaluation.main(compact_args(scenario="ordinary-blank", profile="compact-json-v1", run_id="json-matrix")) == 1
    assert evaluation.main(compact_args("cloudflare", profile="compact-json-v1", run_id="cf-json")) == 1
    assert len(calls) == 1 and len(evaluation.reservations("groq")) == 1


def test_json_profile_has_own_private_attestation_and_same_cumulative_ledger(monkeypatch):
    historical_reservations("groq", 9)
    historical_reservations("cloudflare", 16)
    entry = prepared(scenario="ordinary-grief", profile="compact-json-v1")
    calls = configure_execution(monkeypatch, lambda _: httpx.Response(200, json=envelope(entry)))
    assert evaluation.main(compact_args(profile="compact-json-v1")) == 0
    assert len(calls) == 1 and len(evaluation.combined_reservations()) == 26
    proof = json.loads((evaluation.EVIDENCE / "groq-attempt-010-smoke-attestation.json").read_text())
    assert proof["profile"] == "compact-json-v1" and proof["output_format"] == "json_object"
    assert proof["adapter_sha256"] != evaluation.adapter_fingerprint("compact-v2")
    assert evaluation.smoke_passed("groq", "orchestration-change", "high", "compact-json-v1")
    assert not evaluation.smoke_passed("groq", "orchestration-change", "high", "compact-v2")


def test_json_transform_source_changes_do_not_invalidate_cloudflare_proof(monkeypatch):
    from app.games.tarot import groq_json
    entry = prepared("cloudflare", "ordinary-grief", profile="compact-v2")
    configure_execution(monkeypatch, lambda _: httpx.Response(200, json=envelope(entry)))
    assert evaluation.main(compact_args("cloudflare")) == 0
    before = evaluation.adapter_fingerprint("compact-v2")
    monkeypatch.setattr(groq_json, "PROFILE_VERSION", "a-later-groq-only-version")
    assert evaluation.adapter_fingerprint("compact-v2") == before
    assert evaluation.smoke_passed("cloudflare", "orchestration-change", "none", "compact-v2")


@pytest.mark.parametrize("scenario", evaluation.SCENARIO_IDS)
def test_compact_medium_changes_only_effort_and_preserves_local_contract(scenario):
    from app.games.tarot.groq_medium import build_groq_medium_request
    high = prepared("groq", scenario, profile="compact-v2")
    medium = prepared("groq", scenario, profile="compact-medium-v1")
    before = json.dumps(high["body"], sort_keys=True)
    assert medium["body"] == {**high["body"], "reasoning_effort": "medium"}
    assert medium["body"] == build_groq_medium_request(high["body"])
    assert json.dumps(high["body"], sort_keys=True) == before
    for key in ("context_sha256", "wire_context_sha256", "schema_sha256", "chart_sha256", "candidate_counts", "output_cap"):
        assert medium["report"][key] == high["report"][key]
    assert medium["report"]["reasoning_effort"] == "medium"
    result, diagnostic = evaluation.parse_response(envelope(medium), medium)
    assert result is not None and diagnostic["reason"] == "valid_contract"


def test_compact_medium_requires_separate_smoke_and_preserves_all_26_attempts(monkeypatch):
    historical_reservations("groq", 10)
    historical_reservations("cloudflare", 16)
    entry = prepared(scenario="ordinary-grief", profile="compact-medium-v1")
    calls = configure_execution(monkeypatch, lambda _: httpx.Response(200, json=envelope(entry)))
    assert evaluation.main(compact_args(scenario="ordinary-blank", profile="compact-medium-v1")) == 1
    assert evaluation.main(compact_args("cloudflare", profile="compact-medium-v1")) == 1
    assert calls == []
    assert evaluation.main(compact_args(profile="compact-medium-v1")) == 0 and len(calls) == 1
    assert len(evaluation.combined_reservations()) == 27
    assert evaluation.smoke_passed("groq", "orchestration-change", "medium", "compact-medium-v1")
    assert not evaluation.smoke_passed("groq", "orchestration-change", "high", "compact-v2")
    assert not evaluation.smoke_passed("groq", "orchestration-change", "high", "compact-json-v1")


@pytest.mark.parametrize("failed,expected", [
    ('{"title":"PRIVATE PROVIDER TEXT"}', {"kind": "text", "json_parseable": True, "json_kind": "object"}),
    ('{"title":"PRIVATE PROVIDER TEXT"', {"kind": "text", "json_parseable": False, "json_error_at_end": True}),
    ('<think>PRIVATE REASONING</think>', {"kind": "text", "json_parseable": False, "json_error_offset": 0}),
    ({"PRIVATE PROPERTY": "PRIVATE TEXT"}, {"kind": "object", "member_count": 1}),
    (["PRIVATE TEXT"], {"kind": "array", "member_count": 1}),
    (None, {"kind": "null"}),
])
def test_failed_generation_diagnostics_never_retain_prose_keys_or_reasoning(failed, expected):
    body = {"error": {"code": "json_validate_failed", "message": "PRIVATE ERROR PROSE",
                      "failed_generation": failed, "finish_reason": "length",
                      "usage": {"completion_tokens": 4096, "completion_tokens_details": {"reasoning_tokens": 3000},
                                "PRIVATE USAGE KEY": "PRIVATE VALUE"}}}
    diagnostic = evaluation.http_diagnostics(body, {})
    detail = diagnostic["failed_generation"]
    assert all(detail[key] == value for key, value in expected.items())
    assert detail["reported_finish_reason"] == "length"
    assert diagnostic["failed_generation_usage"] == {"completion_tokens": 4096, "reasoning_tokens": 3000}
    assert "PRIVATE" not in json.dumps(diagnostic)
    assert "PRIVATE" not in json.dumps(evaluation.failed_generation_metadata({"failed_generation": "PRIVATE", "finish_reason": "PRIVATE"}))


def test_failed_generation_transport_keeps_only_structural_metadata():
    calls = []
    failed = '{"title":"' + "PRIVATE" * 3000
    def respond(request):
        calls.append(request)
        return httpx.Response(400, json={"error": {"code": "json_validate_failed", "failed_generation": failed}})
    with httpx.Client(transport=httpx.MockTransport(respond)) as client:
        result, diagnostic, stop = evaluation.send_once(client, "https://api.groq.com/openai/v1/chat/completions", "test-key",
                                                       prepared(profile="compact-medium-v1"))
    assert result is None and stop and len(calls) == 1
    assert diagnostic["failed_generation"]["characters"] == len(failed)
    assert diagnostic["failed_generation"]["json_parseable"] is False
    assert "PRIVATE" not in json.dumps(diagnostic)


@pytest.mark.parametrize("message,expected", [
    ("Name every focus point's computed body, sign and house.", "astrology_anchor_mismatch"),
    ("Choose only from this card's supplied references.", "reference_candidate_mismatch"),
    ("Use different reference families across the spread.", "reference_family_collision"),
    ("PRIVATE ARBITRARY VALIDATION DETAIL", "unclassified_domain_validation"),
])
def test_domain_validation_metadata_uses_only_fixed_allowlisted_classifications(monkeypatch, message, expected):
    entry = prepared(profile="compact-medium-v1")
    def reject(*_args, **_kwargs):
        raise ValueError(message)
    monkeypatch.setattr(evaluation.reading, "validate_reading", reject)
    result, diagnostic = evaluation.parse_response(envelope(entry), entry)
    assert result is None and diagnostic["domain_reason"] == expected
    assert "PRIVATE" not in json.dumps(diagnostic)


def test_real_astrology_anchor_failure_has_safe_specific_reason():
    entry = prepared(scenario="western-rest", profile="compact-medium-v1")
    body = envelope(entry)
    payload = json.loads(body["choices"][0]["message"]["content"])
    payload["astrology_interpretation"]["western"]["normal"] = "Consider what a thoughtful pause might make possible, without a prediction about your future."
    result, diagnostic = evaluation.parse_response(envelope(entry, payload), entry)
    assert result is None and diagnostic["domain_reason"] == "astrology_anchor_mismatch"


@pytest.mark.parametrize("scenario", evaluation.SCENARIO_IDS)
def test_high_profile_binds_effective_shortlist_for_wire_decoder_and_domain(scenario):
    entry = prepared("groq", scenario, profile="compact-high-v1")
    assert entry["body"]["reasoning_effort"] == "high"
    assert entry["body"]["max_completion_tokens"] == entry["report"]["output_cap"] == 5000
    assert entry["report"]["canonical_candidate_limit"] == 2
    assert json.loads(entry["canonical_request"]["input"]) == entry["context"]
    assert all(1 <= len(card["reference_characters"]) <= 2 for card in entry["context"]["cards"])
    result, diagnostic = evaluation.parse_response(envelope(entry), entry)
    assert result is not None and diagnostic["reason"] == "valid_contract"


def test_high_helper_preserves_facts_chart_prompt_and_rejects_trimmed_reference():
    from app.games.tarot.groq_high import build_groq_high_request
    entry = prepared(scenario="both-boundaries", profile="compact-v2")
    source = entry["canonical_request"]
    original_context = json.loads(source["input"])
    original_context["cards"][0]["reference_characters"] += [
        original_context["cards"][1]["reference_characters"][0],
        original_context["cards"][2]["reference_characters"][0],
    ]
    source["input"] = json.dumps(original_context, ensure_ascii=False, separators=(",", ":"))
    before = json.dumps(source, sort_keys=True)
    effective, body = build_groq_high_request(source)
    assert json.dumps(source, sort_keys=True) == before
    context = json.loads(effective["input"])
    assert context["cards"][0]["reference_characters"] == original_context["cards"][0]["reference_characters"][:2]
    assert context["astrology"] == original_context["astrology"]
    assert effective["system_instruction"] == source["system_instruction"]
    new_entry = {**entry, "canonical_request": effective, "context": context, "body": body,
                 "report": {**entry["report"], "profile": "compact-high-v1", "output_cap": 5000}}
    response = envelope(new_entry)
    payload = json.loads(response["choices"][0]["message"]["content"])
    excluded = original_context["cards"][0]["reference_characters"][2]
    payload["card_1"]["reference_id"] = find_character(excluded["name"], excluded["source"])["id"]
    result, diagnostic = evaluation.parse_response(envelope(new_entry, payload), new_entry)
    assert result is None and diagnostic["reason"] == "invalid_reference_id"


def test_high_profile_requires_own_smoke_preserves_27_attempts_and_refuses_cf(monkeypatch):
    historical_reservations("groq", 11)
    historical_reservations("cloudflare", 16)
    entry = prepared(scenario="ordinary-grief", profile="compact-high-v1")
    calls = configure_execution(monkeypatch, lambda _: httpx.Response(200, json=envelope(entry)))
    assert evaluation.main(compact_args(scenario="ordinary-blank", profile="compact-high-v1")) == 1
    assert evaluation.main(compact_args("cloudflare", profile="compact-high-v1")) == 1
    assert calls == []
    assert evaluation.main(compact_args(profile="compact-high-v1")) == 0 and len(calls) == 1
    assert len(evaluation.combined_reservations()) == 28
    assert evaluation.smoke_passed("groq", "orchestration-change", "high", "compact-high-v1")
    assert not evaluation.smoke_passed("groq", "orchestration-change", "high", "compact-v2")


@pytest.mark.parametrize("scenario", evaluation.SCENARIO_IDS)
def test_qwen_profile_binds_actual_model_and_neutral_imagery_without_fact_changes(scenario):
    from app.games.tarot.groq_qwen import build_groq_qwen_request
    original = prepared("groq", scenario, profile="compact-v2")
    entry = prepared("groq", scenario, profile="qwen-none-v1")
    before = json.dumps(original["body"], sort_keys=True)
    assert build_groq_qwen_request(original["body"]) == entry["body"]
    assert json.dumps(original["body"], sort_keys=True) == before
    assert entry["context"] == original["context"]
    assert entry["body"]["messages"][1] == original["body"]["messages"][1]
    assert entry["body"]["model"] == "qwen/qwen3.8-27b"
    assert entry["body"]["reasoning_effort"] == "none"
    assert entry["body"]["reasoning_format"] == "hidden" and "include_reasoning" not in entry["body"]
    assert entry["body"]["max_completion_tokens"] == 4096
    assert "quirky" not in entry["body"]["messages"][0]["content"]
    schema = entry["body"]["response_format"]["json_schema"]["schema"]
    assert "quirky" not in json.dumps(schema) and "imagery" in json.dumps(schema)
    result, diagnostic = evaluation.parse_response(envelope(entry), entry)
    assert result is not None and diagnostic["returned_model"] == "qwen/qwen3.8-27b"
    assert all(card.quirky_interpretation for card in result.cards)
    if entry["chart"]:
        assert result.astrology is not None
        assert all(getattr(result.astrology.interpretation, chart.system).quirky for chart in entry["chart"].charts)


@pytest.mark.parametrize("failure", ["wrong_model", "old_card_key", "both_card_keys", "old_astro_key", "both_astro_keys", "duplicate"])
def test_qwen_rejects_wrong_identity_legacy_colliding_or_duplicate_wire_keys(failure):
    entry = prepared("groq", "both-boundaries", profile="qwen-none-v1")
    body = envelope(entry)
    payload = json.loads(body["choices"][0]["message"]["content"])
    if failure == "wrong_model":
        body["model"] = "openai/gpt-oss-120b"
    elif failure == "duplicate":
        text = body["choices"][0]["message"]["content"]
        body["choices"][0]["message"]["content"] = text.replace('{"title":', '{"title":"PRIVATE DUPLICATE", "title":', 1)
    else:
        if "card" in failure:
            section, old = payload["card_1"], "quirky_interpretation"
        else:
            section, old = payload["astrology_interpretation"]["western"], "quirky"
        section[old] = section["imagery"]
        if failure.startswith("old"):
            section.pop("imagery")
        body["choices"][0]["message"]["content"] = json.dumps(payload)
    result, diagnostic = evaluation.parse_response(body, entry)
    assert result is None and "PRIVATE" not in json.dumps(diagnostic)
    assert diagnostic["reason"] == ("unexpected_model" if failure == "wrong_model" else "duplicate_wire_key" if failure == "duplicate" else "invalid_wire_schema")


def test_qwen_profile_keeps_final_seven_attempt_ceiling_and_requires_new_smoke(monkeypatch):
    historical_reservations("groq", 12)
    historical_reservations("cloudflare", 16)
    entry = prepared(scenario="ordinary-grief", profile="qwen-none-v1")
    calls = configure_execution(monkeypatch, lambda _: httpx.Response(200, json=envelope(entry)))
    assert evaluation.main(compact_args(scenario="ordinary-blank", profile="qwen-none-v1")) == 1
    assert evaluation.main(compact_args("cloudflare", profile="qwen-none-v1")) == 1
    assert calls == []
    assert evaluation.main(compact_args(profile="qwen-none-v1")) == 0 and len(calls) == 1
    assert len(evaluation.combined_reservations()) == 29
    assert evaluation.smoke_passed("groq", "orchestration-change", "none", "qwen-none-v1")
    assert not evaluation.smoke_passed("groq", "orchestration-change", "high", "compact-v2")


def test_qwen_exact_identity_and_prompt_changes_are_in_effective_contract():
    qwen = REAL_CONTRACT_HASH("none", "qwen-none-v1", "groq")
    assert qwen != REAL_CONTRACT_HASH("high", "compact-v2", "groq")
    assert evaluation.adapter_fingerprint("qwen-none-v1") != evaluation.adapter_fingerprint("compact-v2")


@pytest.mark.parametrize("refusal", ["message", "content_filter"])
def test_qwen_refusal_is_distinct_and_stops_evaluation_without_retry(refusal):
    from app.games.tarot.groq_qwen import decode_groq_qwen_output
    from app.games.tarot.providers import AlternativeOutputError
    entry = prepared(profile="qwen-none-v1")
    body = envelope(entry)
    if refusal == "message":
        body["choices"][0]["message"]["refusal"] = "PRIVATE REFUSAL TEXT"
    else:
        body["choices"][0]["finish_reason"] = "content_filter"
    with pytest.raises(AlternativeOutputError) as error:
        decode_groq_qwen_output(body, entry["canonical_request"])
    assert error.value.reason == "refusal"
    calls = []
    def respond(request):
        calls.append(request)
        return httpx.Response(200, json=body)
    with httpx.Client(transport=httpx.MockTransport(respond)) as client:
        result, diagnostic, stop = evaluation.send_once(client, "https://api.groq.com/openai/v1/chat/completions", "test-key", entry)
    assert result is None and stop and len(calls) == 1 and diagnostic["reason"] == "refusal"
    assert "PRIVATE" not in json.dumps(diagnostic)


def test_qwen_tool_call_is_malformed_output_not_a_safety_refusal():
    from app.games.tarot.groq_qwen import decode_groq_qwen_output
    from app.games.tarot.providers import AlternativeOutputError
    entry = prepared(profile="qwen-none-v1")
    body = envelope(entry)
    body["choices"][0]["message"]["tool_calls"] = [{"function": "PRIVATE TOOL"}]
    with pytest.raises(AlternativeOutputError) as error:
        decode_groq_qwen_output(body, entry["canonical_request"])
    assert error.value.reason == "invalid_envelope"


@pytest.mark.parametrize("scenario", evaluation.SCENARIO_IDS)
def test_qwen_evidence_profile_copies_exact_supplied_facts_and_preserves_input(scenario):
    prior = prepared("groq", scenario, profile="qwen-none-v1")
    entry = prepared("groq", scenario, profile="qwen-evidence-v2")
    assert entry["context"] == prior["context"]
    assert entry["body"]["messages"][1] == prior["body"]["messages"][1]
    assert entry["body"]["model"] == prior["body"]["model"]
    assert entry["body"]["reasoning_effort"] == "none"
    schema = entry["body"]["response_format"]["json_schema"]["schema"]
    card_schema = schema["properties"]["card_1"]
    assert "reflection_question" in card_schema["required"]
    assert "interpretation" not in card_schema["properties"]
    assert "evidence" not in json.dumps(schema)
    body = envelope(entry)
    original = json.dumps(body, sort_keys=True)
    result, diagnostic = evaluation.parse_response(body, entry)
    assert result is not None and diagnostic["reason"] == "valid_contract"
    assert json.dumps(body, sort_keys=True) == original
    for card, supplied in zip(result.cards, entry["context"]["cards"], strict=True):
        assert card.characters[0].evidence == supplied["reference_characters"][0]["public_context"]
        assert card.interpretation.endswith("?") and card.characters[0].connection.endswith("?")
    assert all(c.characters[0].evidence is None for c in evaluation.parse_response(envelope(prior), prior)[0].cards)


@pytest.mark.parametrize("failure", ["assertion", "connection_fact", "model_evidence", "old_key", "colliding_key", "duplicate", "missing_fact", "wrong_model"])
def test_qwen_evidence_profile_rejects_untrusted_or_invalid_contract(failure):
    entry = prepared(profile="qwen-evidence-v2")
    body = envelope(entry)
    payload = json.loads(body["choices"][0]["message"]["content"])
    expected = "invalid_wire_schema"
    if failure == "assertion":
        payload["card_1"]["reflection_question"] = "Your community is currently changing and now feels ready to heal."
        expected = "invalid_reflection_question"
    elif failure == "connection_fact":
        payload["card_1"]["connection"] = "This person taught everyone to overcome their pain through determination."
        expected = "invalid_reflection_question"
    elif failure == "model_evidence":
        payload["card_1"]["evidence"] = "PRIVATE PROVIDER FACT"
    elif failure in ("old_key", "colliding_key"):
        payload["card_1"]["interpretation"] = payload["card_1"]["reflection_question"]
        if failure == "old_key":
            payload["card_1"].pop("reflection_question")
    elif failure == "missing_fact":
        source = json.loads(entry["canonical_request"]["input"])
        source["cards"][0]["reference_characters"][0].pop("public_context")
        entry["canonical_request"]["input"] = json.dumps(source)
        expected = "invalid_reference_evidence"
    elif failure == "wrong_model":
        body["model"] = "openai/gpt-oss-120b"
        expected = "unexpected_model"
    body["choices"][0]["message"]["content"] = json.dumps(payload)
    if failure == "duplicate":
        body["choices"][0]["message"]["content"] = body["choices"][0]["message"]["content"].replace(
            '{"title":', '{"title":"PRIVATE DUPLICATE", "title":', 1)
        expected = "duplicate_wire_key"
    result, diagnostic = evaluation.parse_response(body, entry)
    assert result is None and diagnostic["reason"] == expected
    assert "PRIVATE" not in json.dumps(diagnostic)


def test_qwen_evidence_preserves_whitespace_and_rejects_post_adapter_fact_mutation():
    from app.games.tarot.groq_qwen_v2 import decode_groq_qwen_v2_output
    entry = prepared(profile="qwen-evidence-v2")
    fact = "  A source sentence whose exact whitespace is retained.  "
    entry["context"]["cards"][0]["reference_characters"][0]["public_context"] = fact
    entry["canonical_request"]["input"] = json.dumps(entry["context"])
    body = envelope(entry)
    result, diagnostic = evaluation.parse_response(body, entry)
    assert result is not None and diagnostic["reason"] == "valid_contract"
    assert result.cards[0].characters[0].evidence == fact
    normalized = decode_groq_qwen_v2_output(body, entry["canonical_request"])
    normalized["cards"][0]["characters"][0]["evidence"] = fact.strip()
    with pytest.raises(ValueError, match="Reference evidence must exactly match"):
        validate_reading(normalized, list(entry["scenario"].cards),
                         candidates=[card["reference_characters"] for card in entry["context"]["cards"]])


@pytest.mark.parametrize("refusal", ["message", "content_filter"])
def test_qwen_evidence_refusal_remains_nonretryable_and_private(refusal):
    entry = prepared(profile="qwen-evidence-v2")
    body = envelope(entry)
    if refusal == "message":
        body["choices"][0]["message"]["refusal"] = "PRIVATE REFUSAL"
    else:
        body["choices"][0]["finish_reason"] = "content_filter"
    with httpx.Client(transport=httpx.MockTransport(lambda _: httpx.Response(200, json=body))) as client:
        result, diagnosis, stop = evaluation.send_once(client, "https://api.groq.com/openai/v1/chat/completions", "test-key", entry)
    assert result is None and stop and diagnosis["reason"] == "refusal"
    assert "PRIVATE" not in json.dumps(diagnosis)


def test_qwen_evidence_new_budget_counts_all_history_and_requires_own_smoke(monkeypatch):
    historical_reservations("groq", 13)
    historical_reservations("cloudflare", 16)
    entry = prepared(scenario="ordinary-grief", profile="qwen-evidence-v2")
    calls = configure_execution(monkeypatch, lambda _: httpx.Response(200, json=envelope(entry)))
    assert evaluation.main(compact_args(scenario="ordinary-blank", profile="qwen-evidence-v2")) == 1
    assert evaluation.main(compact_args("cloudflare", profile="qwen-evidence-v2")) == 1
    assert calls == []
    assert evaluation.main(compact_args(profile="qwen-evidence-v2")) == 0
    assert len(calls) == 1 and len(evaluation.combined_reservations()) == 30
    assert evaluation.smoke_passed("groq", "orchestration-change", "none", "qwen-evidence-v2")
    assert not evaluation.smoke_passed("groq", "orchestration-change", "none", "qwen-none-v1")


@pytest.mark.parametrize("groq,cloudflare,expected", [(22, 15, None), (23, 15, "combined_total"), (24, 0, "provider_total")])
def test_qwen_evidence_extended_budget_is_explicit_and_fail_closed(groq, cloudflare, expected):
    historical_reservations("groq", groq)
    historical_reservations("cloudflare", cloudflare)
    if expected:
        with pytest.raises(evaluation.EvaluationStop, match=expected):
            evaluation.check_budget("groq", 1, "qwen-evidence-v2")
    else:
        assert len(evaluation.check_budget("groq", 1, "qwen-evidence-v2")) == groq
        with pytest.raises(evaluation.EvaluationStop, match="provider_total"):
            evaluation.check_budget("groq", 1, "qwen-none-v1")


def test_qwen_evidence_new_adapter_and_wire_contract_cannot_reuse_v1_proof():
    assert REAL_CONTRACT_HASH("none", "qwen-evidence-v2", "groq") != REAL_CONTRACT_HASH("none", "qwen-none-v1", "groq")
    assert evaluation.adapter_fingerprint("qwen-evidence-v2") != evaluation.adapter_fingerprint("qwen-none-v1")
    assert evaluation.profile_settings("groq", "qwen-evidence-v2")["max_attempts_provider_total"] == 24
    assert evaluation.profile_settings("groq", "qwen-none-v1")["max_attempts_provider_total"] == 20


@pytest.mark.parametrize("question", [
    "Can a small pause offer room to consider what this card might suggest?",
    "In what way could this image invite a useful conversation about the stated question?",
    "To what extent might this possibility help someone choose a gentle next step?",
])
def test_qwen_evidence_accepts_questions_without_an_english_prefix_whitelist(question):
    entry = prepared(profile="qwen-evidence-v2")
    body = envelope(entry)
    payload = json.loads(body["choices"][0]["message"]["content"])
    payload["card_1"]["reflection_question"] = question
    payload["card_1"]["connection"] = question
    body["choices"][0]["message"]["content"] = json.dumps(payload)
    result, diagnostic = evaluation.parse_response(body, entry)
    assert result is not None and diagnostic["reason"] == "valid_contract"


@pytest.mark.parametrize("question,count,ends", [
    ("PRIVATE CLAIM with no invitation.", 0, False),
    ("PRIVATE first question? PRIVATE second question?", 2, True),
    ("PRIVATE question? Then an assertion.", 1, False),
])
def test_question_shape_failure_reports_only_fixed_paths_and_punctuation(question, count, ends):
    entry = prepared(profile="qwen-evidence-v2")
    body = envelope(entry)
    payload = json.loads(body["choices"][0]["message"]["content"])
    payload["card_2"]["connection"] = question
    payload["PRIVATE UNKNOWN KEY"] = "PRIVATE VALUE"
    body["choices"][0]["message"]["content"] = json.dumps(payload)
    result, diagnostic = evaluation.parse_response(body, entry)
    assert result is None and diagnostic["reason"] == "invalid_reflection_question"
    field = next(row for row in diagnostic["question_shape"] if row["field"] == "card_2.connection")
    assert field == {"field": "card_2.connection", "question_count": count, "ends_with_question_mark": ends}
    assert len(diagnostic["question_shape"]) == 6
    assert "PRIVATE" not in json.dumps(diagnostic)


def test_explicit_synthetic_rejected_capture_saves_only_final_content_privately(monkeypatch, capsys):
    entry = prepared(scenario="ordinary-grief", profile="qwen-evidence-v2")
    body = envelope(entry)
    payload = json.loads(body["choices"][0]["message"]["content"])
    payload["card_1"]["connection"] = "PRIVATE FINAL TEXT with no question."
    text = json.dumps(payload)
    body["choices"][0]["message"].update(content=text, reasoning="PRIVATE HIDDEN REASONING")
    body["PRIVATE ENVELOPE FIELD"] = "PRIVATE ENVELOPE TEXT"
    configure_execution(monkeypatch, lambda _: httpx.Response(200, json=body, headers={"PRIVATE HEADER": "PRIVATE HEADER VALUE"}))
    assert evaluation.main([*compact_args(profile="qwen-evidence-v2"), "--capture-rejected-output"]) == 1
    artifacts = list(evaluation.EVIDENCE.glob("*/*-rejected-final-private.json"))
    assert len(artifacts) == 1 and stat.S_IMODE(artifacts[0].stat().st_mode) == 0o600
    assert json.loads(artifacts[0].read_text()) == {"content": text}
    assert "PRIVATE HIDDEN" not in artifacts[0].read_text()
    assert "PRIVATE ENVELOPE" not in artifacts[0].read_text()
    assert "PRIVATE HEADER" not in artifacts[0].read_text()
    assert "PRIVATE" not in capsys.readouterr().out
    record = json.loads(next(evaluation.EVIDENCE.glob("groq-attempt-*-result.json")).read_text())
    assert record["rejected_final_capture"]["status"] == "saved"
    assert "PRIVATE" not in json.dumps(record)


@pytest.mark.parametrize("case", ["default_off", "valid", "http_error", "refusal", "tools", "reasoning_markup", "oversized_utf8"])
def test_rejected_capture_is_default_off_and_excludes_nonfinal_or_sensitive_envelopes(tmp_path, case):
    entry = prepared(profile="qwen-evidence-v2")
    body = envelope(entry)
    payload = json.loads(body["choices"][0]["message"]["content"])
    payload["card_1"]["connection"] = "PRIVATE REJECTED CLAIM."
    body["choices"][0]["message"]["content"] = json.dumps(payload)
    code = 200
    if case == "valid":
        body = envelope(entry)
    elif case == "http_error":
        code = 400
        body["error"] = {"message": "PRIVATE PROVIDER ERROR"}
    elif case == "refusal":
        body["choices"][0]["message"]["refusal"] = "PRIVATE REFUSAL"
    elif case == "tools":
        body["choices"][0]["message"]["tool_calls"] = [{"PRIVATE TOOL": "PRIVATE VALUE"}]
    elif case == "reasoning_markup":
        body["choices"][0]["message"]["content"] = "<think>PRIVATE REASONING</think>" + json.dumps(payload)
    elif case == "oversized_utf8":
        body["choices"][0]["message"]["content"] = "界" * 40_000
    path = tmp_path / "rejected.json"
    with httpx.Client(transport=httpx.MockTransport(lambda _: httpx.Response(code, json=body))) as client:
        _result, diagnostic, _stop = evaluation.send_once(
            client, "https://api.groq.com/openai/v1/chat/completions", "test-key", entry,
            **({"rejected_output_path": path} if case != "default_off" else {}))
    assert not path.exists()
    assert "PRIVATE" not in json.dumps(diagnostic)


def test_rejected_capture_is_exclusive_and_requires_the_fixed_synthetic_scenario(tmp_path):
    from copy import copy
    entry = prepared(profile="qwen-evidence-v2")
    body = envelope(entry)
    path = tmp_path / "prior.json"
    path.write_text("preserve this prior evidence")
    with pytest.raises(FileExistsError):
        evaluation.capture_rejected_final(body, entry, path)
    assert path.read_text() == "preserve this prior evidence"
    entry["scenario"] = copy(entry["scenario"])
    with pytest.raises(evaluation.EvaluationStop, match="fixed_synthetic_scenario"):
        evaluation.capture_rejected_final(body, entry, tmp_path / "never-created.json")
    assert not (tmp_path / "never-created.json").exists()


def test_rejected_capture_caps_the_actual_utf8_artifact_not_only_character_count(tmp_path):
    entry = prepared(profile="qwen-evidence-v2")
    body = envelope(entry)
    body["choices"][0]["message"]["content"] = "界" * 30_000
    path = tmp_path / "bounded.json"
    result = evaluation.capture_rejected_final(body, entry, path)
    assert result["status"] == "saved" and path.stat().st_size == result["artifact_bytes"] <= 100_000
    assert json.loads(path.read_text())["content"] == "界" * 30_000
    body["choices"][0]["message"]["content"] = "\"" * 60_000
    rejected = tmp_path / "escaping-would-exceed.json"
    assert evaluation.capture_rejected_final(body, entry, rejected)["status"] == "final_text_size_limit"
    assert not rejected.exists()


def test_evidence_imagery_sentence_guidance_versions_wire_without_changing_bounds():
    from app.games.tarot import groq_qwen_v2
    entry = prepared("groq", "both-boundaries", profile="qwen-evidence-v2")
    assert groq_qwen_v2.PROFILE_VERSION == entry["report"]["wire_version"] == "compact-groq-qwen-evidence-3"
    prompt = " ".join(entry["body"]["messages"][0]["content"].split())
    assert "Each imagery field is one complete descriptive sentence, aiming for 80–180 characters." in prompt
    schema = entry["body"]["response_format"]["json_schema"]["schema"]
    assert schema["properties"]["card_1"]["properties"]["imagery"]["description"] == "40–500 characters."
    assert schema["properties"]["astrology_interpretation"]["properties"]["western"]["properties"]["imagery"]["description"] == "40–500 characters."
    body = envelope(entry)
    payload = json.loads(body["choices"][0]["message"]["content"])
    payload["card_1"]["imagery"] = "a single candle in a dark room"
    body["choices"][0]["message"]["content"] = json.dumps(payload)
    result, diagnostic = evaluation.parse_response(body, entry)
    assert result is None and diagnostic["reason"] == "invalid_schema"
    assert any(row["type"] == "string_too_short" for row in diagnostic["fields"])


@pytest.mark.parametrize("scenario", evaluation.ASTROLOGY_SCENARIO_IDS)
def test_astrology_medium_binds_two_exact_candidates_with_same_prompt_and_chart(scenario):
    from app.games.tarot.groq_qwen_astrology import build_groq_qwen_astrology_request
    from app.games.tarot.groq_qwen_v2 import build_groq_qwen_v2_request
    from app.games.tarot.providers import build_alternative_request
    entry = prepared("groq", scenario, profile=evaluation.ASTROLOGY_PROFILE)
    original = prepared("groq", scenario, profile="qwen-evidence-v2")
    before = json.dumps(original["canonical_request"], sort_keys=True)
    effective, body = build_groq_qwen_astrology_request(original["canonical_request"])
    assert json.dumps(original["canonical_request"], sort_keys=True) == before
    assert json.loads(effective["input"]) == entry["context"]
    assert body == entry["body"]
    assert entry["context"]["astrology"] == original["context"]["astrology"]
    assert entry["body"]["messages"][0] == original["body"]["messages"][0]
    assert entry["body"]["reasoning_effort"] == "medium"
    assert entry["body"]["reasoning_format"] == "hidden" and entry["body"]["max_completion_tokens"] == 4096
    baseline_same_candidates = build_groq_qwen_v2_request(build_alternative_request("groq", effective))
    assert {**body, "reasoning_effort": "none"} == baseline_same_candidates
    for current, prior in zip(entry["context"]["cards"], original["context"]["cards"], strict=True):
        assert current["reference_characters"] == prior["reference_characters"][:2]
    result, diagnostic = evaluation.parse_response(envelope(entry), entry)
    assert result is not None and diagnostic["reason"] == "valid_contract"
    assert result.astrology is not None
    for card, supplied in zip(result.cards, entry["context"]["cards"], strict=True):
        assert card.characters[0].evidence == supplied["reference_characters"][0]["public_context"]


def test_astrology_medium_decoder_rejects_full_or_unactually_supplied_shortlist():
    from app.games.tarot.groq_qwen_astrology import (
        build_groq_qwen_astrology_request,
        decode_groq_qwen_astrology_output,
    )
    from app.games.tarot.providers import AlternativeOutputError
    full = prepared("groq", "western-rest", profile="qwen-evidence-v2")
    context = json.loads(full["canonical_request"]["input"])
    context["cards"][0]["reference_characters"] += [
        context["cards"][1]["reference_characters"][0], context["cards"][2]["reference_characters"][0],
    ]
    full["canonical_request"]["input"] = json.dumps(context)
    effective, body = build_groq_qwen_astrology_request(full["canonical_request"])
    entry = {**full, "canonical_request": effective, "context": json.loads(effective["input"]), "body": body,
             "report": {**full["report"], "profile": evaluation.ASTROLOGY_PROFILE}}
    with pytest.raises(AlternativeOutputError, match="alternative reading") as error:
        decode_groq_qwen_astrology_output(envelope(entry), full["canonical_request"])
    assert error.value.reason == "invalid_astrology_effective_shortlist"
    wire = envelope(entry)
    payload = json.loads(wire["choices"][0]["message"]["content"])
    rejected = context["cards"][0]["reference_characters"][2]
    payload["card_1"]["reference_id"] = find_character(rejected["name"], rejected["source"])["id"]
    wire["choices"][0]["message"]["content"] = json.dumps(payload)
    result, diagnostic = evaluation.parse_response(wire, entry)
    assert result is None and diagnostic["reason"] == "invalid_reference_evidence"


@pytest.mark.parametrize("scenario", ["ordinary-blank", "ordinary-grief", "ordinary-nataraja", "ordinary-inbox"])
def test_astrology_medium_rejects_ordinary_scenarios_before_credentials_or_network(monkeypatch, scenario):
    calls = configure_execution(monkeypatch, lambda _: pytest.fail("Unexpected request"))
    assert evaluation.main(compact_args(profile=evaluation.ASTROLOGY_PROFILE, scenario=scenario)) == 1
    assert calls == [] and not list(evaluation.EVIDENCE.glob("*-reserved.json"))


def test_astrology_medium_dryrun_defaults_to_only_three_modes(monkeypatch, capsys):
    monkeypatch.setattr(evaluation, "load_credentials", lambda *_: pytest.fail("Credentials read"))
    monkeypatch.setattr(evaluation.httpx, "Client", lambda *_args, **_kwargs: pytest.fail("Network used"))
    assert evaluation.main(["--provider", "groq", "--profile", evaluation.ASTROLOGY_PROFILE]) == 0
    result = json.loads(capsys.readouterr().out)
    assert [row["id"] for row in result["scenarios"]] == list(evaluation.ASTROLOGY_SCENARIO_IDS)
    assert result["smoke_scenario"] == "western-rest"
    assert result["max_attempts_combined_total"] == 41 and result["max_attempts_provider_total"] == 25


def test_astrology_medium_requires_western_smoke_and_validates_saved_computed_chart(monkeypatch):
    historical_reservations("groq", 22)
    historical_reservations("cloudflare", 16)
    entry = prepared("groq", "western-rest", profile=evaluation.ASTROLOGY_PROFILE)
    calls = configure_execution(monkeypatch, lambda _: httpx.Response(200, json=envelope(entry)))
    assert evaluation.main(compact_args(profile=evaluation.ASTROLOGY_PROFILE, scenario="vedic-resources")) == 1
    assert evaluation.main(compact_args("cloudflare", profile=evaluation.ASTROLOGY_PROFILE, scenario="western-rest")) == 1
    assert calls == []
    assert evaluation.main(compact_args(profile=evaluation.ASTROLOGY_PROFILE, scenario="western-rest")) == 0
    assert len(calls) == 1 and len(evaluation.combined_reservations()) == 39
    assert evaluation.smoke_passed("groq", "orchestration-change", "medium", evaluation.ASTROLOGY_PROFILE)
    assert not evaluation.smoke_passed("groq", "orchestration-change", "none", "qwen-evidence-v2")
    record = json.loads(next(evaluation.EVIDENCE.glob("groq-attempt-023-result.json")).read_text())
    paths = evaluation.smoke_artifacts(record)
    assert paths["request_artifact"].name == "western-rest-request-private.json"
    saved = json.loads(paths["reading_artifact"].read_text())
    saved["astrology"]["chart"]["charts"][0]["ascendant"]["house"] = 12
    paths["reading_artifact"].write_text(json.dumps(saved))
    with pytest.raises(evaluation.EvaluationStop, match="saved_smoke_chart_changed"):
        evaluation.validate_saved_smoke(record, entry)
    assert not evaluation.smoke_passed("groq", "orchestration-change", "medium", evaluation.ASTROLOGY_PROFILE)


@pytest.mark.parametrize("groq,cloudflare,expected", [(24, 16, None), (25, 16, "provider_total"), (24, 17, "combined_total")])
def test_astrology_medium_budget_counts_every_prior_attempt_and_preserves_old_ceilings(groq, cloudflare, expected):
    historical_reservations("groq", groq)
    historical_reservations("cloudflare", cloudflare)
    if expected:
        with pytest.raises(evaluation.EvaluationStop, match=expected):
            evaluation.check_budget("groq", 1, evaluation.ASTROLOGY_PROFILE)
    else:
        assert len(evaluation.check_budget("groq", 1, evaluation.ASTROLOGY_PROFILE)) == 24
        with pytest.raises(evaluation.EvaluationStop, match="provider_total"):
            evaluation.check_budget("groq", 1, "qwen-evidence-v2")
    assert evaluation.profile_combined_limit("qwen-evidence-v2") == 38
    assert evaluation.profile_combined_limit("qwen-none-v1") == 35


def test_astrology_medium_requires_actual_astrology_and_has_distinct_proof():
    from app.games.tarot.groq_qwen_astrology import build_groq_qwen_astrology_request
    from app.games.tarot.providers import AlternativeOutputError
    ordinary = prepared(profile="qwen-evidence-v2")
    with pytest.raises(AlternativeOutputError) as error:
        build_groq_qwen_astrology_request(ordinary["canonical_request"])
    assert error.value.reason == "invalid_astrology_canonical_request"
    assert REAL_CONTRACT_HASH("medium", evaluation.ASTROLOGY_PROFILE, "groq") != REAL_CONTRACT_HASH("none", "qwen-evidence-v2", "groq")
    assert evaluation.adapter_fingerprint(evaluation.ASTROLOGY_PROFILE) != evaluation.adapter_fingerprint("qwen-evidence-v2")


def make_failed_western_capture(monkeypatch):
    historical_reservations("groq", 22)
    historical_reservations("cloudflare", 16)
    entry = prepared("groq", "western-rest", profile=evaluation.ASTROLOGY_PROFILE)
    calls = configure_execution(monkeypatch, lambda _: httpx.Response(200, json=envelope(entry)))
    original = evaluation.reading.validate_reading
    def old_anchor_bug(*_args, **_kwargs):
        raise ValueError("Name every focus point's computed body, sign and house.")
    monkeypatch.setattr(evaluation.reading, "validate_reading", old_anchor_bug)
    assert evaluation.main([*compact_args(profile=evaluation.ASTROLOGY_PROFILE, scenario="western-rest"),
                            "--capture-rejected-output"]) == 1
    monkeypatch.setattr(evaluation.reading, "validate_reading", original)
    assert len(calls) == 1
    record_path = evaluation.EVIDENCE / "groq-attempt-023-result.json"
    record = json.loads(record_path.read_text())
    assert record["domain_reason"] == "astrology_anchor_mismatch"
    return entry, record, calls


def offline_western_args():
    return ["--provider", "groq", "--profile", evaluation.ASTROLOGY_PROFILE,
            "--revalidate-western-smoke-attempt", "23"]


def test_offline_western_revalidation_preserves_failure_and_never_calls_provider(monkeypatch, capsys):
    entry, record, calls = make_failed_western_capture(monkeypatch)
    paths = evaluation.failed_western_artifacts(record)
    before = {name: path.read_bytes() for name, path in paths.items()}
    monkeypatch.setattr(evaluation, "load_credentials", lambda *_: pytest.fail("Credential access"))
    monkeypatch.setattr(evaluation.httpx, "Client", lambda *_args, **_kwargs: pytest.fail("Network access"))
    assert evaluation.main(offline_western_args()) == 0
    assert len(calls) == 1 and len(evaluation.combined_reservations()) == 39
    assert {name: path.read_bytes() for name, path in paths.items()} == before
    receipt_path = evaluation.EVIDENCE / "groq-attempt-023-offline-revalidation.json"
    receipt = json.loads(receipt_path.read_text())
    assert stat.S_IMODE(receipt_path.stat().st_mode) == 0o600
    assert receipt["provider_calls"] == receipt["attempts_reserved"] == 0
    assert receipt["original_status"] == "failed" and receipt["editorial_acceptance"] is False
    assert receipt["generated_prose_unchanged"] and not receipt["credentials_read"]
    assert evaluation.offline_western_smoke_matches(record, entry)
    assert evaluation.smoke_passed("groq", "orchestration-change", "medium", evaluation.ASTROLOGY_PROFILE)
    assert not evaluation.smoke_passed("groq", "orchestration-change", "none", "qwen-evidence-v2")
    assert evaluation.main(offline_western_args()) == 1  # Exclusive, never overwrite.
    assert json.loads(receipt_path.read_text()) == receipt
    assert "PRIVATE" not in capsys.readouterr().out


@pytest.mark.parametrize("tamper", ["refusal", "format", "model", "request", "chart", "capture", "reservation", "preflight", "result_copy"])
def test_offline_western_revalidation_rejects_safety_format_or_changed_artifacts(monkeypatch, tamper):
    _entry, record, _calls = make_failed_western_capture(monkeypatch)
    paths = evaluation.failed_western_artifacts(record)
    if tamper in ("refusal", "format", "model"):
        if tamper == "refusal":
            record["reason"] = "refusal"
        elif tamper == "format":
            record["reason"] = "invalid_schema"
        else:
            record["model"] = "unapproved-model"
        for key in ("result_artifact", "run_result"):
            paths[key].write_text(json.dumps(record))
    else:
        key = {"request": "request_artifact", "chart": "request_artifact", "capture": "captured_final",
               "reservation": "reservation", "preflight": "run_preflight", "result_copy": "run_result"}[tamper]
        data = json.loads(paths[key].read_text())
        if tamper == "request":
            data["context"]["question"] = "PRIVATE DIFFERENT USER QUESTION"
        elif tamper == "chart":
            data["chart"]["charts"][0]["ascendant"]["house"] = 12
        elif tamper == "capture":
            data["content"] += " "
        elif tamper == "reservation":
            data["run_id"] = "different-run"
        elif tamper == "preflight":
            data["contract_sha256"] = "different-contract"
        else:
            data["seconds"] += 1
        paths[key].write_text(json.dumps(data))
    monkeypatch.setattr(evaluation, "load_credentials", lambda *_: pytest.fail("Credentials read"))
    monkeypatch.setattr(evaluation.httpx, "Client", lambda *_args, **_kwargs: pytest.fail("Network access"))
    assert evaluation.main(offline_western_args()) == 1
    assert not (evaluation.EVIDENCE / "groq-attempt-023-offline-revalidation.json").exists()
    assert not (paths["request_artifact"].parent / "western-rest-offline-revalidated-reading-private.json").exists()
    assert len(evaluation.combined_reservations()) == 39


def test_offline_western_revalidation_requires_current_full_validator(monkeypatch):
    entry, record, _calls = make_failed_western_capture(monkeypatch)
    def still_invalid(*_args, **_kwargs):
        raise ValueError("Name every focus point's computed body, sign and house.")
    monkeypatch.setattr(evaluation.reading, "validate_reading", still_invalid)
    assert evaluation.main(offline_western_args()) == 1
    assert not evaluation.offline_western_smoke_matches(record, entry)
    assert not (evaluation.EVIDENCE / "groq-attempt-023-offline-revalidation.json").exists()


@pytest.mark.parametrize("target", ["captured_final", "normalized", "receipt"])
def test_offline_western_proof_rejects_post_attestation_tampering(monkeypatch, target):
    entry, record, _calls = make_failed_western_capture(monkeypatch)
    assert evaluation.main(offline_western_args()) == 0
    paths = evaluation.failed_western_artifacts(record)
    path = (paths["captured_final"] if target == "captured_final" else
            paths["request_artifact"].parent / "western-rest-offline-revalidated-reading-private.json" if target == "normalized" else
            evaluation.EVIDENCE / "groq-attempt-023-offline-revalidation.json")
    data = json.loads(path.read_text())
    if target == "captured_final":
        data["content"] += " "
    elif target == "normalized":
        data["introduction"] = "PRIVATE TAMPERED PROSE"
    else:
        data["adapter_sha256"] = "tampered-adapter"
    path.write_text(json.dumps(data))
    assert not evaluation.offline_western_smoke_matches(record, entry)
    assert not evaluation.smoke_passed("groq", "changed", "medium", evaluation.ASTROLOGY_PROFILE)


@pytest.mark.parametrize("extra", [["--execute"], ["--capture-rejected-output"], ["--scenario", "ordinary-grief"], ["--run-id", "unrelated"]])
def test_offline_revalidation_cli_cannot_turn_into_execution_or_other_scenario(extra):
    with pytest.raises(SystemExit) as error:
        evaluation.main([*offline_western_args(), *extra])
    assert error.value.code == 2
