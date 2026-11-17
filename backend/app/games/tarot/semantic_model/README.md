# Local Tarot retrieval model

Unmodified, quantized ONNX export of **BAAI/bge-small-en-v1.5**, supplied by
[Qdrant](https://huggingface.co/Qdrant/bge-small-en-v1.5-onnx-Q), pinned to revision
`aa8f8b060edb00e03bfdd08813a2949946c8ba55`. The upstream model and this export are
listed under the MIT license; upstream attribution and model documentation are
at [BAAI](https://huggingface.co/BAAI/bge-small-en-v1.5).

`manifest.json` records exact file hashes, sizes and origin. Reproduce/download
with `python3 scripts/fetch_tarot_semantic_model.py`; existing bytes are verified,
never silently replaced. This is a retrieval model, not a reading generator.
No model download, external inference request or input logging occurs at runtime.
The model is loaded lazily for Tarot only. Questions are encoded in memory and
never retained in the public reference index or a query cache.

The encoder uses the model's first-token pooling, L2 normalization and a
512-token limit, as documented in the upstream model and Qdrant implementation.
Only relevance ranking uses these vectors; a similarity score is not a fact or
confidence that a personal interpretation is true.
