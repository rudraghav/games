"""Evaluation-only Qwen profile with a neutral name for the imagery layer."""

import json
from copy import deepcopy
from typing import Any

from app.games.tarot.providers import AlternativeOutputError, decode_alternative_output

PROFILE_VERSION = "compact-groq-qwen-1"
MODEL = "qwen/qwen3.8-27b"
OUTPUT_CAP = 4096


def _rename_schema(properties: dict[str, Any], old: str, new: str) -> None:
    properties["properties"][new] = properties["properties"].pop(old)
    properties["required"] = [new if field == old else field for field in properties["required"]]


def build_groq_qwen_request(source: dict[str, Any]) -> dict[str, Any]:
    """Preserve facts and schema constraints; change model and layer names only."""
    response_format = source.get("response_format", {})
    specification = response_format.get("json_schema", {}) if isinstance(response_format, dict) else {}
    if (source.get("model") != "openai/gpt-oss-120b"
            or source.get("reasoning_effort") != "high" or source.get("max_completion_tokens") != OUTPUT_CAP
            or source.get("stream") is not False or source.get("service_tier") != "on_demand"
            or not isinstance(specification, dict) or specification.get("strict") is not True
            or not isinstance(specification.get("schema"), dict)):
        raise ValueError("invalid_groq_qwen_base_request")
    body = deepcopy(source)
    body.update(model=MODEL, reasoning_effort="none", reasoning_format="hidden")
    body.pop("include_reasoning", None)
    schema = body["response_format"]["json_schema"]["schema"]
    for index in range(1, 4):
        _rename_schema(schema["properties"][f"card_{index}"], "quirky_interpretation", "imagery")
    astrology = schema["properties"].get("astrology_interpretation")
    if astrology:
        for system in ("western", "vedic"):
            if system in astrology["properties"]:
                _rename_schema(astrology["properties"][system], "quirky", "imagery")
    # Only trusted instructions change. User questions and source facts are data.
    body["messages"][0]["content"] = (body["messages"][0]["content"]
                                       .replace("quirky_interpretation", "imagery")
                                       .replace("quirky uses", "imagery uses"))
    return body


def _unique_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise AlternativeOutputError("duplicate_wire_key")
        result[key] = value
    return result


def _exact_fields(value: object, fields: set[str]) -> dict[str, Any]:
    if not isinstance(value, dict) or set(value) != fields:
        raise AlternativeOutputError("invalid_wire_schema")
    return value


def decode_groq_qwen_output(body: object, canonical_request: dict[str, Any]) -> dict[str, Any]:
    """Validate the real Qwen envelope before a deterministic layer-key rename."""
    if not isinstance(body, dict) or body.get("error") or body.get("errors"):
        raise AlternativeOutputError("invalid_envelope")
    if body.get("model") != MODEL:
        raise AlternativeOutputError("unexpected_model")
    choices = body.get("choices")
    if not isinstance(choices, list) or len(choices) != 1 or not isinstance(choices[0], dict):
        raise AlternativeOutputError("invalid_envelope")
    choice = choices[0]
    message = choice.get("message")
    if not isinstance(message, dict):
        raise AlternativeOutputError("invalid_envelope")
    if message.get("refusal") or choice.get("finish_reason") == "content_filter":
        raise AlternativeOutputError("refusal")
    if message.get("tool_calls"):
        raise AlternativeOutputError("invalid_envelope")
    if choice.get("finish_reason") != "stop":
        raise AlternativeOutputError("truncated" if choice.get("finish_reason") == "length" else "not_completed")
    text = message.get("content")
    if not isinstance(text, str) or not text or len(text) > 100_000:
        raise AlternativeOutputError("invalid_envelope")
    try:
        payload = json.loads(text, object_pairs_hook=_unique_object)
    except (ValueError, RecursionError) as error:
        if isinstance(error, AlternativeOutputError):
            raise
        raise AlternativeOutputError("invalid_json") from None
    context = json.loads(canonical_request["input"])
    systems = {chart["system"] for chart in context.get("astrology", [])}
    expected = {"title", "introduction", "next_step", "card_1", "card_2", "card_3"}
    if systems:
        expected.add("astrology_interpretation")
    normalized = _exact_fields(payload, expected)
    for index in range(1, 4):
        card = _exact_fields(normalized[f"card_{index}"], {
            "title", "interpretation", "imagery", "reference_id", "connection",
        })
        card["quirky_interpretation"] = card.pop("imagery")
    if systems:
        astrology = _exact_fields(normalized["astrology_interpretation"], systems | {"tarot_connection", "next_step"})
        for system in systems:
            section = _exact_fields(astrology[system], {"focus_1", "focus_2", "normal", "imagery"})
            section["quirky"] = section.pop("imagery")
    adapted = deepcopy(body)
    adapted["choices"][0]["message"]["content"] = json.dumps(normalized, ensure_ascii=False, separators=(",", ":"))
    # The real returned model is unchanged; the shared decoder separately checks
    # it against its fixed Groq model allowlist before the domain validator runs.
    return decode_alternative_output("groq", adapted, canonical_request, expected_model=MODEL)
