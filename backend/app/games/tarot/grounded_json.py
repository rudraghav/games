"""Explicit Groq JSON-object transport; the grounded decoder stays authoritative."""

import json
from copy import deepcopy
from typing import Any

from app.games.tarot.groq_qwen import _exact_fields, _unique_object
from app.games.tarot.grounded import MODELS, _schema
from app.games.tarot.grounded_astrology import (
    build_grounded_astrology_request,
    decode_grounded_astrology_output,
)
from app.games.tarot.providers import AlternativeOutputError, _context, _payload

PROFILE_VERSION = "grounded-qwen-json-2"


def _compact_contract(schema: dict[str, Any]) -> object:
    if schema.get("type") == "object":
        return {name: _compact_contract(value) for name, value in schema["properties"].items()}
    # IDs already appear beside their full source facts in the input. Repeating
    # their enums in an inline contract costs tokens without adding information.
    description = schema.get("description", "")
    return "string" + ("; " + description if description else "; choose an allowed ID from the input")


def json_contract_schema(source: dict[str, Any]) -> dict[str, Any]:
    schema = deepcopy(source)
    astrology = schema["properties"]["astrology_interpretation"]
    for name in ("tarot_connection", "next_step"):
        output_name = "astrology_" + name
        schema["properties"][output_name] = astrology["properties"].pop(name)
        schema["required"].append(output_name)
        astrology["required"].remove(name)
    return schema


def json_transport(source: dict[str, Any]) -> dict[str, Any]:
    body = deepcopy(source)
    schema = json_contract_schema(body["response_format"]["json_schema"]["schema"])
    contract = json.dumps(_compact_contract(schema), ensure_ascii=False, separators=(",", ":"))
    body["response_format"] = {"type": "json_object"}
    body["messages"][0]["content"] = (body["messages"][0]["content"]
        .replace("tarot_connection links", "astrology_tarot_connection links")
        .replace("next_step is one practical invitation", "astrology_next_step is one practical invitation"))
    body["messages"][0]["content"] += (
        "\nReturn ONE JSON object with exactly this shape and every field, including astrology. "
        "The strings below describe values to write; never copy these descriptions. "
        "Use only the matching card's reference IDs and each chart's point IDs from the input. "
        "astrology_tarot_connection and astrology_next_step are top-level fields, beside cards and next_step; "
        "astrology_interpretation contains only the requested chart sections.\n" + contract
    )
    return body


def build_grounded_json_request(source: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    effective, body = build_grounded_astrology_request(source)
    return effective, json_transport(body)


def decode_grounded_json_output(body: object, source: dict[str, Any]) -> dict[str, Any]:
    try:
        _payload("groq", body, expected_model=MODELS["groq"])
        assert isinstance(body, dict)
        wire = json.loads(body["choices"][0]["message"]["content"], object_pairs_hook=_unique_object)
    except (ValueError, RecursionError) as error:
        if isinstance(error, AlternativeOutputError):
            raise
        raise AlternativeOutputError("invalid_json") from None
    schema = json_contract_schema(_schema(_context(source)))
    _exact_fields(wire, set(schema["properties"]))
    astrology = _exact_fields(wire["astrology_interpretation"],
                              set(schema["properties"]["astrology_interpretation"]["properties"]))
    for name in ("tarot_connection", "next_step"):
        astrology[name] = wire.pop("astrology_" + name)
    normalized = deepcopy(body)
    normalized["choices"][0]["message"]["content"] = json.dumps(wire, ensure_ascii=False, separators=(",", ":"))
    return decode_grounded_astrology_output(normalized, source)
