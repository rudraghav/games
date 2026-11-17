"""Join the public cast to reviewed character artwork and its provenance."""

import argparse
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]


def reviewed_text(value: object) -> bool:
    return isinstance(value, str) and bool(value.strip())


def https_source(value: object) -> bool:
    if not isinstance(value, str):
        return False
    try:
        source = urlparse(value)
    except ValueError:
        return False
    return bool(
        source.scheme == "https"
        and source.hostname
        and source.username is None
        and source.password is None
    )


def artwork_path(character: dict, artwork: dict) -> str:
    """Version new character art while retaining the original photo archive."""
    kind = artwork.get("imageType")
    if kind in {"performer", "cosplay"}:
        return f"/characters/{character['id']}.webp"
    if kind not in {"character", "illustration", "person", "religious_figure", "meme", "artwork"}:
        raise SystemExit("A portrait has an unsupported artwork type.")
    version = artwork.get("artworkVersion")
    if not isinstance(version, str) or not re.fullmatch(
        r"[a-z0-9][a-z0-9-]{0,47}", version
    ):
        raise SystemExit("A portrait needs a safe artwork version.")
    return f"/characters/{version}/{character['id']}.webp"


def validate_attribution(artwork: dict) -> None:
    kind = artwork.get("imageType")
    if not reviewed_text(artwork.get("credit")):
        raise SystemExit("A portrait is missing its reviewed credit.")
    if kind in {"performer", "cosplay"}:
        if (
            not reviewed_text(artwork.get("license"))
            or urlparse(artwork.get("filePage", "")).hostname != "commons.wikimedia.org"
        ):
            raise SystemExit("A portrait is missing reviewed attribution.")
        return
    if not reviewed_text(artwork.get("alt")) or any(
        key in artwork for key in ("performer", "performerLabel")
    ):
        raise SystemExit(
            "Character artwork needs subject alt text without performer metadata."
        )
    if kind == "illustration":
        if artwork.get("origin") != "generated":
            raise SystemExit("A generated portrait needs accurate origin metadata.")
        if any(artwork.get(key) for key in ("license", "licenseUrl")):
            raise SystemExit("A generated portrait must not invent a source license.")
        return
    if artwork.get("origin") != "sourced" or not all(
        https_source(artwork.get(key))
        for key in ("sourcePage", "filePage", "remoteImage")
    ):
        raise SystemExit(
            "A sourced character portrait needs its reviewed HTTPS sources."
        )
    if kind == "artwork" and (
        not reviewed_text(artwork.get("artworkTitle"))
        or not https_source(artwork.get("artworkAttributionUrl"))
    ):
        raise SystemExit("An artwork reference needs its exact work title and source attribution.")
    rights = artwork.get("rights")
    if rights == "licensed":
        if not reviewed_text(artwork.get("license")) or not https_source(
            artwork.get("licenseUrl")
        ):
            raise SystemExit(
                "A licensed portrait needs the actual license and source URL."
            )
    elif rights in {"copyright-reference", "public-domain"}:
        if not reviewed_text(artwork.get("rightsNote")):
            raise SystemExit("A portrait needs its reviewed rights note.")
        if rights == "copyright-reference" and any(
            artwork.get(key) for key in ("license", "licenseUrl")
        ):
            raise SystemExit("A copyrighted reference is not a reusable image license.")
    else:
        raise SystemExit(
            "A sourced character portrait needs an explicit rights category."
        )


def webp_dimensions(data: bytes) -> tuple[int, int]:
    """Read canvas dimensions without installing an image dependency for export."""
    if (
        len(data) < 30
        or data[:4] != b"RIFF"
        or data[8:12] != b"WEBP"
        or int.from_bytes(data[4:8], "little") + 8 != len(data)
    ):
        raise SystemExit("A portrait is not a complete WebP asset.")
    if data[12:16] == b"VP8X":
        return 1 + int.from_bytes(data[24:27], "little"), 1 + int.from_bytes(
            data[27:30], "little"
        )
    if data[12:16] == b"VP8L" and data[20] == 0x2F:
        bits = int.from_bytes(data[21:25], "little")
        return 1 + (bits & 0x3FFF), 1 + ((bits >> 14) & 0x3FFF)
    if data[12:16] == b"VP8 " and data[23:26] == b"\x9d\x01\x2a":
        return int.from_bytes(data[26:28], "little") & 0x3FFF, int.from_bytes(
            data[28:30], "little"
        ) & 0x3FFF
    raise SystemExit("A portrait has an unsupported WebP frame.")


def reviewed_registry(
    manifest: Path, *, allow_legacy: bool = False, additional_manifests: tuple[Path, ...] = (),
) -> list[dict]:
    if not manifest.is_file() or manifest.is_symlink():
        raise SystemExit("The active character artwork manifest is missing or unsafe.")
    cast = json.loads((ROOT / "backend/app/games/tarot/characters.json").read_text())
    media = json.loads(manifest.read_text())
    for extra in additional_manifests:
        if not extra.is_file() or extra.is_symlink():
            raise SystemExit("The additional reference manifest is missing or unsafe.")
        media.extend(json.loads(extra.read_text()))
    by_id = {item["id"]: item for item in media}
    if allow_legacy:
        # The original 48 performer photos are a preserved, explicit archive;
        # expanding the active library does not fabricate old archive entries.
        cast = [c for c in cast if c["id"] in by_id]
    if len(by_id) != len(media) or set(by_id) != {c["id"] for c in cast}:
        raise SystemExit("Every Tarot reference needs one reviewed portrait.")
    entities = [c["wikidataId"] for c in cast if c.get("wikidataId")]
    if len(entities) != len(set(entities)):
        raise SystemExit("One public identity cannot inflate the reference catalogue twice.")
    kinds = {item.get("imageType") for item in media}
    if not allow_legacy and not kinds <= {"character", "illustration", "person", "religious_figure", "meme", "artwork"}:
        raise SystemExit("Active Tarot artwork requires exact character or person images.")
    if kinds & {"character", "illustration", "person", "religious_figure", "meme", "artwork"} and not kinds <= {
        "character",
        "illustration",
        "person",
        "religious_figure",
        "meme",
        "artwork",
    }:
        raise SystemExit(
            "Character artwork cannot be mixed with archived performer/cosplay photos."
        )
    result = []
    for character in cast:
        if (
            not isinstance(character.get("name"), str) or not 1 <= len(character["name"]) <= 70
            or not isinstance(character.get("source"), str) or not 1 <= len(character["source"]) <= 100
            or character.get("kind", "character") not in {"person", "character", "religious_figure", "meme"}
            or len(character.get("description", "")) > 120
        ):
            raise SystemExit("Reference identity exceeds the reading contract or context budget.")
        if character.get("wikidataId") and (
            not re.fullmatch(r"Q[1-9][0-9]*", character["wikidataId"])
            or not https_source(character.get("wikipediaUrl"))
        ):
            raise SystemExit("An expanded reference needs a traceable public identity.")
        portrait = by_id[character["id"]]
        if portrait.get("artworkVersion") == "reference-art-v1" and portrait.get("reviewStatus") != "accepted":
            raise SystemExit("An expanded portrait must pass explicit visual/source review before export.")
        if not allow_legacy and portrait["imageType"] not in {"illustration", "artwork"} and (
            character.get("kind", "character") != portrait["imageType"]
        ):
            raise SystemExit("A reference and its depiction must have the same subject kind.")
        if portrait["imageType"] == "artwork" and character.get("kind") != "person":
            raise SystemExit("Artwork references must identify the actual artist as a person.")
        if character.get("kind") == "religious_figure" and not reviewed_text(character.get("tradition")):
            raise SystemExit("Religious and mythological references need an attributed tradition.")
        if character.get("kind") == "meme" and (
            not reviewed_text(character.get("sourceContext"))
            or not https_source(character.get("contextSourceUrl"))
        ):
            raise SystemExit("Meme references need a sourced scene and reaction context.")
        if character.get("sourceContext") and (
            len(character["sourceContext"]) > 600
            or not https_source(character.get("contextSourceUrl"))
        ):
            raise SystemExit("Public reference context must be bounded and source-linked.")
        if character.get("wikidataId") and portrait.get("entityId") != character["wikidataId"]:
            raise SystemExit("Reference identity and image provenance must name the same entity.")
        path = portrait["image"]
        if path != artwork_path(character, portrait):
            raise SystemExit("Portrait paths must be local, canonical WebP assets.")
        asset = ROOT / "apps/web/public" / path.lstrip("/")
        if not asset.is_file() or asset.is_symlink():
            raise SystemExit("Missing portrait asset.")
        data = asset.read_bytes()
        if (
            len(data) != portrait["bytes"]
            or hashlib.sha256(data).hexdigest() != portrait["sha256"]
        ):
            raise SystemExit("A portrait differs from its reviewed size/hash.")
        width, height = webp_dimensions(data)
        if (
            (width, height) != (portrait["width"], portrait["height"])
            or not 0 < width <= 400
            or not 0 < height <= 500
        ):
            raise SystemExit("A portrait differs from its reviewed bounded dimensions.")
        if (
            character.get("kind") != "meme"
            and portrait["imageType"] in {"character", "illustration", "person", "religious_figure", "artwork"}
            and width * 5 != height * 4
        ):
            raise SystemExit("Character portraits must use the reviewed 4:5 frame.")
        if character.get("kind") == "meme" and not (width * 5 == height * 4 or width * 3 == height * 4):
            raise SystemExit("Meme artwork must retain a reviewed 4:3 scene or 4:5 composition.")
        validate_attribution(portrait)
        # Retrieval excerpts/weights stay server-side; portraits do not require
        # downloading thousands of public biographies into the reading UI.
        identity = {key: value for key, value in character.items() if key in {
            "id", "name", "source", "lane", "aliases", "sourceAliases", "kind", "category",
            "wikidataId", "wikipediaUrl", "tradition", "identityFamily",
        }}
        public_artwork = {key: value for key, value in portrait.items() if key in {
            "id", "imageType", "origin", "artworkVersion", "image", "alt", "credit",
            "sourcePage", "filePage", "rights", "rightsNote", "license", "licenseUrl",
            "bytes", "width", "height", "sha256", "performer", "performerLabel",
            "artworkTitle", "artworkAttributionUrl",
        }}
        if allow_legacy and portrait.get("remoteImage"):
            public_artwork["remoteImage"] = portrait["remoteImage"]
        result.append({**identity, **public_artwork})
    return result


def export(check: bool = False, *, manifest: Path | None = None) -> None:
    # An explicit override supports legacy integrity fixtures; production/codegen
    # always require the complete new manifest and never fall back to actors.
    source = (
        manifest or ROOT / "apps/web/public/characters/character-art-v2/manifest.json"
    )
    extra = ROOT / "apps/web/public/characters/reference-art-v1/manifest.json"
    result = reviewed_registry(
        source, allow_legacy=manifest is not None,
        additional_manifests=(extra,) if manifest is None and extra.is_file() else (),
    )
    target = ROOT / "packages/api-client/src/generated/tarot-characters.json"
    text = json.dumps(result, indent=2, ensure_ascii=False) + "\n"
    if check:
        if not target.is_file() or json.loads(target.read_text()) != result:
            raise SystemExit(
                "Tarot portrait registry drift. Run scripts/export_tarot_characters.py."
            )
    else:
        target.write_text(text)
    print(
        f"{'Checked' if check else 'Exported'} {len(result)} attributed Tarot character portraits."
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    export(parser.parse_args().check)
