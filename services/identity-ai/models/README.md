# Model artifacts

Model binaries are downloaded from reviewed HTTPS sources and are never committed to Git.

Add an entry to `manifest.json` only after reviewing both the model license and the source of the exact weights, then run `python -m scripts.download_models --accept-licenses` followed by `python -m scripts.verify_models`.

Every entry records the logical model name, immutable version, local basename, expected byte size, SHA-256 checksum, source URL, and license metadata; changing model bytes requires a new reviewed manifest entry or version.
