"""Build the public-only Tarot semantic index; no AI provider or player data."""

import argparse
import hashlib
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
import numpy as np
from app.games.tarot.deck import DECK
from app.games.tarot.reference_retrieval import (
    INDEX_VERSION,
    ROLE_CONTEXTS,
    catalogue_hash,
    document,
    enriched,
    meaning_hashes,
)
from app.games.tarot.semantic_encoder import encoder


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cast", type=Path, default=ROOT / "backend/app/games/tarot/characters.json")
    parser.add_argument("--output", type=Path, default=ROOT / "backend/app/games/tarot")
    parser.add_argument("--retain-corpus", action="store_true", help="Retain the public snapshot for an offline relevance review")
    parser.add_argument("--reuse", type=Path, help="Reuse verified unchanged public vectors from an earlier build")
    args = parser.parse_args()
    public = enriched(json.loads(args.cast.read_text()))
    args.output.mkdir(parents=True, exist_ok=True)
    if args.retain_corpus:
        (args.output / "reference-corpus.json").write_text(json.dumps(public, ensure_ascii=False))
    start = time.monotonic()
    model_hash = hashlib.sha256((ROOT / "backend/app/games/tarot/semantic_model/manifest.json").read_bytes()).hexdigest()
    texts = [document(reference) for reference in public]
    hashes = [hashlib.sha256(text.encode()).hexdigest() for text in texts]
    reusable = {}
    previous = args.reuse or args.output
    if (previous / "reference-index.json").exists():
        metadata = json.loads((previous / "reference-index.json").read_text())
        previous_path = previous / "reference-index.npz"
        if hashlib.sha256(previous_path.read_bytes()).hexdigest() != metadata["sha256"]:
            raise ValueError("Previous public index integrity check failed.")
        if metadata["modelManifestSha256"] == model_hash:
            previous_hashes = metadata.get("documentHashes")
            snapshot = previous / "reference-corpus.json"
            if not previous_hashes and snapshot.exists():
                previous_public = json.loads(snapshot.read_text())
                if catalogue_hash(previous_public) != metadata["catalogueHash"]:
                    raise ValueError("Previous public snapshot does not match its index.")
                previous_hashes = [hashlib.sha256(document(item).encode()).hexdigest() for item in previous_public]
            if previous_hashes:
                with np.load(previous_path, allow_pickle=False) as old:
                    reusable = dict(zip(previous_hashes, old["references"], strict=True))
    model = encoder()
    vectors = np.zeros((len(public), 384), dtype=np.float32)
    missing = []
    for index, digest in enumerate(hashes):
        if digest in reusable:
            vectors[index] = reusable[digest]
        else:
            missing.append(index)
    for offset in range(0, len(missing), 24):
        indices = missing[offset:offset + 24]
        vectors[indices] = model.encode([texts[index] for index in indices])
        if offset and offset % 480 == 0:
            print(f"Encoded {min(offset + 24, len(missing))}/{len(missing)} changed public references", flush=True)
    cards = model.encode([card.name + ". " + card.meaning for card in DECK], query=True)
    roles = model.encode(list(ROLE_CONTEXTS), query=True)
    path = args.output / "reference-index.npz"
    with path.with_suffix(".npz.tmp").open("wb") as stream:
        np.savez_compressed(stream, references=np.asarray(vectors, dtype=np.float32), cards=cards, roles=roles)
    path.with_suffix(".npz.tmp").replace(path)
    manifest = {"version": INDEX_VERSION, "catalogueHash": catalogue_hash(public),
                "ids": [reference["id"] for reference in public], "cardIds": [card.id for card in DECK],
                "sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "dimensions": 384,
                "documentHashes": hashes, "modelManifestSha256": model_hash, **meaning_hashes()}
    (args.output / "reference-index.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps({"references": len(public), "bytes": path.stat().st_size,
                      "seconds": round(time.monotonic() - start, 2), "publicDataOnly": True,
                      "reused": len(public) - len(missing)}))


if __name__ == "__main__":
    main()
