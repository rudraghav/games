"""Explicit Groq JSON-object transport; the grounded decoder stays authoritative."""

import json
from copy import deepcopy
from typing import Any, Literal

from app.games.tarot.groq_qwen import _exact_fields, _unique_object
from app.games.tarot.grounded import MODELS, _schema
from app.games.tarot.grounded_astrology import (
    build_grounded_astrology_request,
    decode_grounded_astrology_output,
)
from app.games.tarot.providers import AlternativeOutputError, _context, _payload

PROFILE_VERSION = "grounded-qwen-json-2"
INSTRUCT_PROFILE_VERSION = "grounded-qwen-json-instruct-1"


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


def json_transport(
    source: dict[str, Any], *, reasoning_effort: Literal["medium", "none"] = "medium",
) -> dict[str, Any]:
    body = deepcopy(source)
    if reasoning_effort not in ("medium", "none"):
        raise ValueError("unsupported_grounded_json_reasoning_effort")
    if reasoning_effort == "none":
        # Groq's Qwen instruct guidance; keep unsupported sampler controls absent.
        # This changes generation settings only, never the acceptance contract.
        body.update(reasoning_effort="none", temperature=0.7, top_p=0.8)
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


def build_grounded_json_request(
    source: dict[str, Any], *, reasoning_effort: Literal["medium", "none"] = "medium",
) -> tuple[dict[str, Any], dict[str, Any]]:
    effective, body = build_grounded_astrology_request(source)
    return effective, json_transport(body, reasoning_effort=reasoning_effort)


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
    common = {"tarot_connection", "next_step"}
    flat = {"astrology_" + name for name in common}
    sections = schema["properties"]["astrology_interpretation"]["properties"]
    # Accept only complete known placements, never a merge of partial shapes.
    # Qwen has returned valid prose with these two fields nested one level too
    # deep. Moving the unchanged pair is unambiguous for a sole chart section.
    if isinstance(wire, dict) and flat <= wire.keys():
        _exact_fields(wire, set(schema["properties"]))
        astrology = _exact_fields(wire["astrology_interpretation"], set(sections))
        for name in common:
            astrology[name] = wire.pop("astrology_" + name)
    else:
        _exact_fields(wire, set(schema["properties"]) - flat)
        astrology = wire["astrology_interpretation"]
        if isinstance(astrology, dict) and common <= astrology.keys():
            _exact_fields(astrology, set(sections) | common)
        else:
            _exact_fields(astrology, set(sections))
            if len(sections) != 1:
                raise AlternativeOutputError("invalid_wire_schema")
            system = next(iter(sections))
            section = _exact_fields(astrology[system], set(sections[system]["properties"]) | common)
            for name in common:
                astrology[name] = section.pop(name)
    normalized = deepcopy(body)
    normalized["choices"][0]["message"]["content"] = json.dumps(wire, ensure_ascii=False, separators=(",", ":"))
    return decode_grounded_astrology_output(normalized, source)
