"""Evaluation-only effort comparison; production routing is unchanged."""

from copy import deepcopy
from typing import Any

PROFILE_VERSION = "compact-groq-medium-1"


def build_groq_medium_request(source: dict[str, Any]) -> dict[str, Any]:
    """Change only high to medium for the same fixed strict-schema request."""
    response_format = source.get("response_format", {})
    specification = response_format.get("json_schema", {}) if isinstance(response_format, dict) else {}
    if (source.get("model") != "openai/gpt-oss-120b"
            or source.get("reasoning_effort") != "high"
            or source.get("max_completion_tokens") != 4096
            or source.get("include_reasoning") is not False
            or source.get("stream") is not False
            or source.get("service_tier") != "on_demand"
            or not isinstance(response_format, dict) or response_format.get("type") != "json_schema"
            or not isinstance(specification, dict) or specification.get("strict") is not True
            or not isinstance(specification.get("schema"), dict)):
        raise ValueError("invalid_groq_medium_base_request")
    body = deepcopy(source)
    body["reasoning_effort"] = "medium"
    return body
