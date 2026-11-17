"""Fetch the pinned public retrieval model once; production never downloads it."""

import hashlib
import json
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "backend/app/games/tarot/semantic_model"
REPO = "Qdrant/bge-small-en-v1.5-onnx-Q"
REVISION = "aa8f8b060edb00e03bfdd08813a2949946c8ba55"
FILES = ("model_optimized.onnx", "tokenizer.json", "config.json", "tokenizer_config.json")


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    manifest_path = DEST / "manifest.json"
    existing = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    rows = {}
    for name in FILES:
        path = DEST / name
        if path.exists():
            data = path.read_bytes()
            known = existing.get("files", {}).get(name)
            if known and hashlib.sha256(data).hexdigest() != known["sha256"]:
                raise ValueError("Existing model file differs; refusing to overwrite it.")
        else:
            with urlopen(f"https://huggingface.co/{REPO}/resolve/{REVISION}/{name}", timeout=120) as response:
                data = response.read(90_000_001)
            if len(data) > 90_000_000:
                raise ValueError("Model file exceeds the reviewed size budget.")
            with path.open("xb") as stream:
                stream.write(data)
        rows[name] = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
    manifest = {"model": "BAAI/bge-small-en-v1.5", "repository": REPO,
                "revision": REVISION, "dimensions": 384, "license": "MIT",
                "source": f"https://huggingface.co/{REPO}/tree/{REVISION}", "files": rows}
    if existing and existing != manifest:
        raise ValueError("Pinned model manifest drift; refusing to replace it.")
    if not existing:
        manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"Verified {len(rows)} pinned retrieval files ({sum(r['bytes'] for r in rows.values())} bytes).")


if __name__ == "__main__":
    main()
