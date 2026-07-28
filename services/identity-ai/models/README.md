# Model artifacts

Model binaries are downloaded from reviewed HTTPS sources and are never committed to Git.

Add an entry to `manifest.json` only after reviewing both the model license and the source of the exact weights, then run `python -m scripts.download_models --accept-licenses` followed by `python -m scripts.verify_models`.

Every entry records the logical model name, immutable version, runtime (`onnx`, `opencv`, `mediapipe`, or `external`), local basename, expected byte size, SHA-256 checksum, source URL, and license metadata; changing model bytes requires a new reviewed manifest entry or version.

The enabled service fails readiness unless every name in `IDENTITY_AI_REQUIRED_MODELS` exists in this manifest, passes size and checksum verification, and initializes in its declared runtime.

Phase 2 pins OpenCV Zoo's YuNet detector and SFace embedder. Phase 3 pins Google's MediaPipe Face Landmarker task bundle. Each initializes through its reviewed runtime adapter. An `external` artifact is valid manifest metadata but cannot satisfy runtime readiness until a reviewed loader for that runtime is registered.
