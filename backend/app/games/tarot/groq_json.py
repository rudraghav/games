"""Pure, evaluation-only Groq JSON-mode experiment; not production routing.

Keep the v2 content contract and decoder. Only transport the exact schema as a
trusted instruction instead of asking the provider for strict schema decoding.
"""

import json
from copy import deepcopy
from typing import Any

PROFILE_VERSION = "compact-groq-json-1"


def build_groq_json_request(source: dict[str, Any]) -> dict[str, Any]:
    """Return a fixed free-account diagnostic request without mutating v2."""
    response_format = source.get("response_format", {})
    specification = response_format.get("json_schema", {}) if isinstance(response_format, dict) else {}
    messages = source.get("messages")
    if (source.get("model") != "openai/gpt-oss-120b"
            or source.get("reasoning_effort") != "high"
            or source.get("max_completion_tokens") != 4096
            or source.get("include_reasoning") is not False
            or source.get("stream") is not False
            or source.get("service_tier") != "on_demand"
            or not isinstance(response_format, dict) or response_format.get("type") != "json_schema"
            or not isinstance(specification, dict) or specification.get("strict") is not True
            or not isinstance(specification.get("schema"), dict)
            or not isinstance(messages, list) or len(messages) != 2
            or not isinstance(messages[0], dict) or messages[0].get("role") != "system"
            or not isinstance(messages[0].get("content"), str)
            or not isinstance(messages[1], dict) or messages[1].get("role") != "user"):
        raise ValueError("invalid_groq_json_base_request")
    body = deepcopy(source)
    schema = json.dumps(specification["schema"], ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    body["response_format"] = {"type": "json_object"}
    body["messages"][0]["content"] += "\nReturn one JSON object matching this exact schema:\n" + schema
    return body
