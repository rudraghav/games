"""Join the public reference cast to its reviewed portrait/attribution manifest."""

import argparse
import hashlib
import json
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]


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


def export(check: bool = False) -> None:
    cast = json.loads((ROOT / "backend/app/games/tarot/characters.json").read_text())
    media = json.loads((ROOT / "apps/web/public/characters/manifest.json").read_text())
    by_id = {item["id"]: item for item in media}
    if len(by_id) != len(media) or set(by_id) != {c["id"] for c in cast}:
        raise SystemExit("Every Tarot reference needs one reviewed portrait.")
    result = []
    for character in cast:
        portrait = by_id[character["id"]]
        path = portrait["image"]
        if path != f"/characters/{character['id']}.webp":
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
            not portrait["credit"]
            or not portrait["license"]
            or urlparse(portrait["filePage"]).hostname != "commons.wikimedia.org"
        ):
            raise SystemExit("A portrait is missing reviewed attribution.")
        result.append({**character, **portrait})
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
