"""Offline, lazy public-reference retrieval encoder; never retains player input."""

import hashlib
import json
import threading
from functools import lru_cache
from pathlib import Path
from typing import Any

import numpy as np
import numpy.typing as npt

FloatMatrix = npt.NDArray[np.float32]
MODEL_DIR = Path(__file__).with_name("semantic_model")
QUERY_PREFIX = "Represent this sentence for searching relevant passages: "


class Encoder:
    def __init__(self) -> None:
        # No hub client, remote code, downloads or automatic model replacement.
        import onnxruntime as ort  # type: ignore[import-untyped]
        from tokenizers import Tokenizer

        manifest = json.loads((MODEL_DIR / "manifest.json").read_text())
        for filename in ("model_optimized.onnx", "tokenizer.json"):
            path = MODEL_DIR / filename
            if path.is_symlink() or hashlib.sha256(path.read_bytes()).hexdigest() != manifest["files"][filename]["sha256"]:
                raise ValueError("The pinned Tarot retrieval model failed its integrity check.")
        options = ort.SessionOptions()
        options.intra_op_num_threads = 2
        options.inter_op_num_threads = 1
        options.log_severity_level = 3
        self.session = ort.InferenceSession(
            str(MODEL_DIR / "model_optimized.onnx"), options,
            providers=["CPUExecutionProvider"],
        )
        self.tokenizer = Tokenizer.from_file(str(MODEL_DIR / "tokenizer.json"))
        self.tokenizer.enable_truncation(max_length=512)
        self.tokenizer.enable_padding(pad_id=0, pad_token="[PAD]")
        self.inputs = {entry.name for entry in self.session.get_inputs()}
        self.lock = threading.Lock()

    def encode(self, texts: list[str], *, query: bool = False) -> FloatMatrix:
        if not texts:
            return np.empty((0, 384), dtype=np.float32)
        with self.lock:
            tokens = self.tokenizer.encode_batch(
                [QUERY_PREFIX + text if query else text for text in texts]
            )
            fields: dict[str, Any] = {
                "input_ids": np.asarray([item.ids for item in tokens], dtype=np.int64),
                "attention_mask": np.asarray([item.attention_mask for item in tokens], dtype=np.int64),
                "token_type_ids": np.asarray([item.type_ids for item in tokens], dtype=np.int64),
            }
            output = np.asarray(self.session.run(None, {k: v for k, v in fields.items() if k in self.inputs})[0])
            vectors = output[:, 0] if output.ndim == 3 else output
            normalized = vectors / np.maximum(np.linalg.norm(vectors, axis=1, keepdims=True), 1e-12)
            return np.asarray(normalized, dtype=np.float32)


@lru_cache(maxsize=1)
def encoder() -> Encoder:
    """Cache the public model only, never questions or their embeddings."""
    return Encoder()
