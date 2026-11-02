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


def test_all_48_reviewed_assets_match_identity_provenance_integrity_and_generated_registry():
    media = json.loads(
        (ROOT / "apps/web/public/characters/character-art-v2/manifest.json").read_text()
    )
    generated = json.loads(
        (ROOT / "packages/api-client/src/generated/tarot-characters.json").read_text()
    )
    by_id = {c["id"]: c for c in CHARACTERS}
    artwork_by_id = {m["id"]: m for m in media}
    assert len(media) == len({m["id"] for m in media}) == 48
    assert {m["id"] for m in media} == set(by_id)
    assert {m["imageType"] for m in media} <= {"character", "illustration"}
    assert generated == [{**c, **artwork_by_id[c["id"]]} for c in CHARACTERS]
    for image in media:
        assert re.fullmatch(r"[a-z0-9-]+", image["id"])
        assert image["image"] == portrait_export.artwork_path(by_id[image["id"]], image)
        path = ROOT / "apps/web/public" / image["image"].lstrip("/")
        assert path.is_file() and not path.is_symlink()
        data = path.read_bytes()
        assert len(data) == image["bytes"]
        assert hashlib.sha256(data).hexdigest() == image["sha256"]
        assert portrait_export.webp_dimensions(data) == (image["width"], image["height"])
        assert 0 < image["width"] <= 400 and 0 < image["height"] <= 500
        portrait_export.validate_attribution(image)
        assert image["width"] * 5 == image["height"] * 4
        assert "performer" not in image and "performerLabel" not in image
    portrait_export.export(check=True)


def test_original_performer_and_cosplay_assets_remain_an_explicit_verified_archive():
    original = ROOT / "apps/web/public/characters/manifest.json"
    archive = portrait_export.reviewed_registry(original, allow_legacy=True)
    assert len(archive) == 48
    assert {image["imageType"] for image in archive} == {"performer", "cosplay"}
    for image in archive:
        assert image["performer"]
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


def versioned_artwork(kind="character"):
    media = json.loads((ROOT / "apps/web/public/characters/manifest.json").read_text())
    # Metadata tests reuse valid bytes and isolate header decoding below. Actual
    # header, dimensions and hash validation run unmocked for every active asset.
    original = media[0]
    data = (ROOT / "apps/web/public" / original["image"].lstrip("/")).read_bytes()
    artwork = {
        "id": CHARACTERS[0]["id"],
        "imageType": kind,
        "origin": "sourced" if kind == "character" else "generated",
        "artworkVersion": "character-art-v2" if kind == "character" else "illustrated-v1",
        "alt": f"{CHARACTERS[0]['name']} from {CHARACTERS[0]['source']}",
        "credit": "Synthetic exporter contract fixture",
        **{k: original[k] for k in ("bytes", "sha256")},
        "width": 400,
        "height": 500,
    }
    artwork["image"] = f"/characters/{artwork['artworkVersion']}/{artwork['id']}.webp"
    if kind == "character":
        artwork.update(
            sourcePage="https://example.test/character",
            filePage="https://example.test/character-art",
            remoteImage="https://example.test/character.webp",
            rights="copyright-reference",
            rightsNote="A copyrighted reference; this fixture grants no reuse license.",
        )
    return artwork, data


def write_artwork_fixture(monkeypatch, tmp_path, artwork, data):
    values = {
        "backend/app/games/tarot/characters.json": json.dumps([CHARACTERS[0]]),
        "apps/web/public/characters/character-art-v2/manifest.json": json.dumps([artwork]),
        f"apps/web/public{artwork['image']}": data,
    }
    for relative, content in values.items():
        target = tmp_path / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content if isinstance(content, bytes) else content.encode())
    (tmp_path / "packages/api-client/src/generated").mkdir(parents=True, exist_ok=True)
    monkeypatch.setattr(portrait_export, "ROOT", tmp_path)
    monkeypatch.setattr(portrait_export, "webp_dimensions", lambda _: (400, 500))


@pytest.mark.parametrize("kind", ["character", "illustration"])
def test_versioned_character_art_exports_without_actor_fields_or_invented_license(
    monkeypatch, tmp_path, kind
):
    artwork, data = versioned_artwork(kind)
    write_artwork_fixture(monkeypatch, tmp_path, artwork, data)
    portrait_export.export()
    portrait_export.export(check=True)
    exported = json.loads(
        (tmp_path / "packages/api-client/src/generated/tarot-characters.json").read_text()
    )[0]
    assert exported["imageType"] == kind and exported["image"] == artwork["image"]
    assert "performer" not in exported and "license" not in exported


@pytest.mark.parametrize(
    "fault",
    [
        "unsafe-version",
        "wrong-path",
        "wrong-origin",
        "missing-alt",
        "performer",
        "fake-license",
        "fake-license-url",
        "missing-rights",
        "missing-rights-note",
        "insecure-source",
    ],
)
def test_sourced_art_rejects_unsafe_identity_paths_and_misleading_provenance(
    monkeypatch, tmp_path, fault
):
    artwork, data = versioned_artwork()
    patches = {
        "unsafe-version": {"artworkVersion": "../performers"},
        "wrong-path": {"image": f"/characters/{artwork['id']}.webp"},
        "wrong-origin": {"origin": "generated"},
        "missing-alt": {"alt": " "},
        "performer": {"performer": "Unrelated actor"},
        "fake-license": {"license": "CC BY 4.0"},
        "fake-license-url": {"licenseUrl": "https://creativecommons.org/licenses/by/4.0/"},
        "missing-rights": {"rights": None},
        "missing-rights-note": {"rightsNote": ""},
        "insecure-source": {"sourcePage": "http://example.test/character"},
    }
    artwork.update(patches[fault])
    write_artwork_fixture(monkeypatch, tmp_path, artwork, data)
    expected = {
        "unsafe-version": "safe artwork version",
        "wrong-path": "canonical WebP",
        "wrong-origin": "HTTPS sources",
        "missing-alt": "subject alt text",
        "performer": "performer metadata",
        "fake-license": "not a reusable image license",
        "fake-license-url": "not a reusable image license",
        "missing-rights": "rights category",
        "missing-rights-note": "rights note",
        "insecure-source": "HTTPS sources",
    }
    with pytest.raises(SystemExit, match=expected[fault]):
        portrait_export.export()


def test_new_character_assets_do_not_silently_mix_in_an_archived_performer(monkeypatch, tmp_path):
    cast = CHARACTERS[:2]
    media = [
        {"id": cast[0]["id"], "imageType": "character"},
        {"id": cast[1]["id"], "imageType": "performer"},
    ]
    for relative, payload in {
        "backend/app/games/tarot/characters.json": cast,
        "apps/web/public/characters/character-art-v2/manifest.json": media,
    }.items():
        path = tmp_path / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(payload))
    monkeypatch.setattr(portrait_export, "ROOT", tmp_path)
    with pytest.raises(SystemExit, match="requires actual-character"):
        portrait_export.export()


def test_exporter_does_not_fall_back_to_the_old_photo_manifest(monkeypatch, tmp_path):
    archived = tmp_path / "apps/web/public/characters/manifest.json"
    archived.parent.mkdir(parents=True)
    archived.write_text("[]")
    monkeypatch.setattr(portrait_export, "ROOT", tmp_path)
    with pytest.raises(SystemExit, match="active character artwork manifest is missing"):
        portrait_export.export()


def test_generated_artwork_does_not_claim_an_unreviewed_external_license():
    artwork, _ = versioned_artwork("illustration")
    artwork["license"] = "CC BY 4.0"
    with pytest.raises(SystemExit, match="must not invent"):
        portrait_export.validate_attribution(artwork)


@pytest.mark.parametrize("kind", ["licensed", "public-domain"])
def test_reusable_source_rights_require_their_actual_supporting_metadata(
    monkeypatch, tmp_path, kind
):
    artwork, data = versioned_artwork()
    artwork["rights"] = kind
    if kind == "licensed":
        artwork.update(
            license="CC BY 4.0", licenseUrl="https://creativecommons.org/licenses/by/4.0/"
        )
    else:
        artwork["rightsNote"] = "Reviewed public-domain source."
    write_artwork_fixture(monkeypatch, tmp_path, artwork, data)
    portrait_export.export()
    if kind == "licensed":
        artwork.pop("licenseUrl")
        write_artwork_fixture(monkeypatch, tmp_path, artwork, data)
        with pytest.raises(SystemExit, match="license"):
            portrait_export.export()


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
        portrait_export.export(
            check=True, manifest=tmp_path / "apps/web/public/characters/manifest.json"
        )
