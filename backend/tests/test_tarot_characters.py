"""Fresh references stay accurate while historical readings keep their text."""

import hashlib
import importlib.util
import json
import re
from copy import deepcopy
from pathlib import Path
from urllib.parse import urlparse

import httpx
import pytest
from test_tarot import example_reading

from app.games.tarot.characters import CHARACTERS, find_character, lane_characters, normalized
from app.games.tarot.reading import (
    REFERENCE_LANES,
    CharacterConnection,
    Reading,
    generate_reading,
    provider_schema,
    validate_reading,
)

ROOT = Path(__file__).resolve().parents[2]
CARDS = ["major-00", "cups-03", "swords-10"]
spec = importlib.util.spec_from_file_location(
    "export_tarot_characters", ROOT / "scripts/export_tarot_characters.py"
)
assert spec and spec.loader
portrait_export = importlib.util.module_from_spec(spec)
spec.loader.exec_module(portrait_export)


@pytest.mark.parametrize("character", CHARACTERS, ids=lambda c: c["id"])
def test_canonical_names_and_every_explicit_alias_resolve_to_the_same_cast_member(character):
    for name in [character["name"], *character["aliases"]]:
        for source in [character["source"], *character["sourceAliases"]]:
            assert find_character(name, source) == character


@pytest.mark.parametrize(
    ("name", "source", "expected"),
    [
        ("  CHÍHIRO  ", "Spirited-Away", "chihiro"),
        ("captain holt", "Brooklyn 99", "holt"),
        ("Poo", "K3G", "poo"),
        ("Elizabeth Bennet", "Pride & Prejudice", "elizabeth-bennet"),
        ("Homer Simpson", "The Simpsons", None),
        ("Elsa", "Moana", None),
        ("Elsa", "Unfrozen", None),
        ("Elsa", "Frozen yogurt", None),
        ("Mulan impersonator", "Mulan", None),
        ("Mulan", "", None),
    ],
)
def test_matching_tolerates_typography_but_rejects_unknown_names_and_wrong_sources(
    name, source, expected
):
    actual = find_character(name, source)
    assert (actual["id"] if actual else None) == expected


@pytest.mark.parametrize(
    ("name", "source"), [("Homer Simpson", "The Simpsons"), ("Elsa", "Moana"), ("Elsa", "Unfrozen")]
)
def test_fresh_reading_rejects_unknown_or_mismatched_references(name, source):
    payload = example_reading(CARDS)
    payload["cards"][0]["characters"][0].update(name=name, source=source)
    with pytest.raises(ValueError, match="supplied character references"):
        validate_reading(payload, CARDS)


@pytest.mark.parametrize("same_card", [False, True])
def test_distinct_aliases_cannot_duplicate_a_canonical_character(same_card):
    payload = example_reading(CARDS)
    duplicate = {**payload["cards"][0]["characters"][0], "name": "Sen"}
    if same_card:
        payload["cards"][0]["characters"].append(duplicate)
    else:
        payload["cards"][1]["characters"] = [duplicate]
    with pytest.raises(ValueError, match="different character"):
        validate_reading(payload, CARDS)


def test_historical_unknown_character_connections_remain_accepted_and_unchanged():
    payload = example_reading(CARDS)
    unknown = {**payload["cards"][0]["characters"][0], "name": "Nimona", "source": "Nimona"}
    payload["cards"][0]["characters"] = [unknown]
    assert CharacterConnection.model_validate(unknown).model_dump() == unknown
    saved = Reading.model_validate(payload)
    assert saved.model_dump() == payload
    with pytest.raises(ValueError):
        validate_reading(saved.model_dump(), CARDS)


def test_every_reference_lane_has_distinct_real_choices_and_schema_names_match_the_full_cast():
    assert len(CHARACTERS) == len({c["id"] for c in CHARACTERS}) == 48
    assert set(REFERENCE_LANES) == {c["lane"] for c in CHARACTERS}
    alias_owner = {}
    for character in CHARACTERS:
        for name in [character["name"], *character["aliases"]]:
            key = normalized(name)
            assert alias_owner.setdefault(key, character["id"]) == character["id"]
    all_choices = []
    for lane in REFERENCE_LANES:
        choices = lane_characters(lane)
        assert len(choices) >= 3
        assert all(set(choice) == {"name", "source"} for choice in choices)
        assert all(find_character(**choice)["lane"] == lane for choice in choices)
        all_choices.extend(choices)
    assert len(all_choices) == len({c["name"] for c in all_choices}) == 48
    schema = provider_schema(CARDS)
    names = schema["$defs"]["CharacterConnection"]["properties"]["name"]["enum"]
    assert names == [c["name"] for c in CHARACTERS]
    assert len(names) == len(set(names)) == 48


def test_each_provider_card_receives_its_complete_lane_choices_without_performer_metadata(
    monkeypatch,
):
    real_client = httpx.Client
    calls = []

    def respond(request):
        calls.append(json.loads(request.content))
        return httpx.Response(
            200,
            json={
                "status": "completed",
                "steps": [
                    {
                        "type": "model_output",
                        "content": [{"type": "text", "text": json.dumps(example_reading(CARDS))}],
                    }
                ],
            },
        )

    monkeypatch.setattr(
        "app.games.tarot.reading.httpx.Client",
        lambda **kwargs: real_client(transport=httpx.MockTransport(respond), **kwargs),
    )
    generate_reading(CARDS, "What can I try?")
    assert len(calls) == 1
    cards = json.loads(calls[0]["input"])["cards"]
    assert len({c["reference_lane"] for c in cards}) == 3
    for card in cards:
        assert card["reference_characters"] == lane_characters(card["reference_lane"])


def test_all_48_reviewed_local_photos_match_license_metadata_dimensions_hashes_and_generated_registry():
    media = json.loads((ROOT / "apps/web/public/characters/manifest.json").read_text())
    generated = json.loads(
        (ROOT / "packages/api-client/src/generated/tarot-characters.json").read_text()
    )
    by_id = {c["id"]: c for c in CHARACTERS}
    assert len(media) == len({m["id"] for m in media}) == 48
    assert {m["id"] for m in media} == set(by_id)
    assert generated == [{**by_id[m["id"]], **m} for m in media]
    assert {p.stem for p in (ROOT / "apps/web/public/characters").glob("*.webp")} == set(by_id)
    for image in media:
        assert re.fullmatch(r"[a-z0-9-]+", image["id"])
        assert image["image"] == f"/characters/{image['id']}.webp"
        path = ROOT / "apps/web/public" / image["image"].lstrip("/")
        assert path.is_file() and not path.is_symlink()
        data = path.read_bytes()
        assert len(data) == image["bytes"]
        assert hashlib.sha256(data).hexdigest() == image["sha256"]
        assert portrait_export.webp_dimensions(data) == (image["width"], image["height"])
        assert 0 < image["width"] <= 400 and 0 < image["height"] <= 500
        assert image["credit"] and image["performer"]
        assert re.fullmatch(
            r"CC BY(?:-SA)? (?:2\.0|2\.5|3\.0|4\.0)|Public domain", image["license"]
        )
        for key, hosts in {
            "filePage": {"commons.wikimedia.org"},
            "sourcePage": {"commons.wikimedia.org", "en.wikipedia.org"},
            "remoteImage": {"thumb.wikimedia.org", "upload.wikimedia.org"},
            "licenseUrl": {"creativecommons.org", "commons.wikimedia.org"},
        }.items():
            url = urlparse(image[key])
            assert url.scheme == "https" and url.hostname in hosts
        if image["imageType"] == "cosplay":
            assert image["id"] in {"link", "peach"} and image["performerLabel"] == "Cosplay photo"
        else:
            assert image["imageType"] == "performer"
            assert image["performerLabel"] in {"Portrayed by", "Voiced by", "English voice by"}
    portrait_export.export(check=True)


@pytest.mark.parametrize("fault", ["bytes", "sha256", "dimensions", "truncated"])
def test_exporter_refuses_unreviewed_asset_drift(monkeypatch, tmp_path, fault):
    character = deepcopy(CHARACTERS[0])
    portrait = json.loads((ROOT / "apps/web/public/characters/manifest.json").read_text())[0]
    data = (ROOT / "apps/web/public" / portrait["image"].lstrip("/")).read_bytes()
    if fault == "dimensions":
        portrait["width"] += 1
    elif fault == "truncated":
        data = data[:-8]
        portrait.update(bytes=len(data), sha256=hashlib.sha256(data).hexdigest())
    elif fault == "bytes":
        portrait["bytes"] += 1
    else:
        portrait["sha256"] = "0" * 64
    for relative, content in {
        "backend/app/games/tarot/characters.json": json.dumps([character]),
        "apps/web/public/characters/manifest.json": json.dumps([portrait]),
        f"apps/web/public{portrait['image']}": data,
    }.items():
        target = tmp_path / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content if isinstance(content, bytes) else content.encode())
    monkeypatch.setattr(portrait_export, "ROOT", tmp_path)
    with pytest.raises(SystemExit, match="portrait"):
        portrait_export.export(check=True)
