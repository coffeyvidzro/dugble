# Dugble Identity AI

`identity-ai` is Dugble's private, self-hosted service for AI-assisted Ghana Card enrollment and biometric cardholder verification; it does not authenticate cards against the National Identification Authority (NIA) or make an official identity determination.

## Initial recommendation

The service uses a modular pipeline so that detection, recognition, capture guidance, text extraction, liveness evidence, and business decisions remain independently testable and replaceable.

| Capability | Stack |
| --- | --- |
| Face detection | **OpenCV YuNet** |
| Face recognition/embedding | **OpenCV SFace** |
| Face landmarks and capture guidance | **MediaPipe Face Landmarker** |
| Model execution | **ONNX Runtime** |
| Image processing | **OpenCV** |
| QR scanning | **ZXing-compatible implementation** |
| Ghana Card text extraction | **PaddleOCR** |
| Liveness | **Supervised capture plus server-generated session challenges** |
| Decision-making | **Dugble deterministic policy engine** |
| Backend | **Private FastAPI application service exposing an internal interface** |

## Stack usage

- **OpenCV YuNet:** Detects the face and its location in each enrollment or verification frame before any quality assessment or comparison occurs.
- **OpenCV SFace:** Converts an aligned face into an embedding and calculates one-to-one similarity between a live capture and the selected member's enrollment reference.
- **MediaPipe Face Landmarker:** Tracks detailed facial landmarks and head pose to guide capture and measure whether the user completed the requested session movement.
- **ONNX Runtime:** Executes the YuNet and SFace model files consistently within the self-hosted inference service.
- **OpenCV:** Decodes, normalizes, aligns, and evaluates images before they are passed to the AI models.
- **ZXing-compatible implementation:** Reads Dugble's signed QR credential so the backend can locate the single member record to verify.
- **PaddleOCR:** Extracts required printed text from a Ghana Card during enrollment without claiming that the card is genuine or NIA-validated.
- **Supervised capture plus server-generated session challenges:** Combines operator observation with unpredictable live-camera actions to provide initial liveness evidence and discourage simple print or replay attacks.
- **Dugble deterministic policy engine:** Combines card status, capture quality, liveness evidence, and face similarity using versioned rules to return verified, retry, or manual-review outcomes.
- **Private FastAPI application service:** Exposes authenticated internal endpoints to Dugble's backend while keeping model inference inaccessible from the public internet.

## Verification pipeline

```text
Signed QR scan
    -> member-record lookup
    -> supervised live capture
    -> face detection and capture guidance
    -> image normalization and face alignment
    -> embedding generation
    -> one-to-one face comparison
    -> liveness and quality evidence
    -> deterministic policy decision
```

The card identifies the member record, while the fresh biometric capture verifies continuity with that record; the system must not search every enrolled face to identify an unknown person during routine verification.

## Implementation status

The Stage 2 face pipeline defines validated detection, embedding, and comparison contracts; detector and embedder interfaces; cosine similarity; one-to-one orchestration; and a process-local model registry.

The Stage 3 capture pipeline adds a MediaPipe-facing landmark tracker boundary, deterministic framing and pose guidance, unpredictable short-lived challenge issuance, and ordered multi-observation challenge evaluation with model-version continuity.

The Stage 4 document-enrollment pipeline adds card-boundary, perspective-correction, and OCR interfaces; conservative label-based Ghana Card field extraction; front/back evidence separation; deterministic quality evidence; and versioned orchestration without asserting document authenticity.

The Stage 5 operational layer adds a reviewed model manifest, checksum verification and license-gated download commands, bounded aggregate evaluation inputs, face/liveness/OCR metrics, and a synthetic quality benchmark without storing real identity media in Git.

YuNet, SFace, MediaPipe, card-detector, perspective-correction, and PaddleOCR adapters; reviewed model artifacts; ONNX Runtime integration; media retrieval; and the HTTP endpoint connections remain intentionally unavailable until their exact versions, preprocessing rules, checksums, and deployment licenses are selected, so model-backed endpoints continue to return `501 Not Implemented` rather than simulated evidence.

Completing a head-pose challenge supplies limited presence evidence only; it is not strong liveness proof and must be combined with supervised capture, replay and injection defenses, biometric comparison, calibrated policy, and manual fallback.

## Responsibility boundary

The AI components produce measurements such as face location, image quality, pose, OCR confidence, face similarity, and liveness evidence, while the deterministic policy engine owns the operational outcome.

The supported outcomes are:

- `verified` when all configured card, quality, liveness, and similarity requirements pass;
- `retry` when the capture is unsuitable or a challenge was not completed reliably; and
- `manual_review` when the evidence is valid but inconclusive.

A failed biometric comparison must not be presented as proof of fraud, and no outcome may be described as official NIA verification.

OCR fields and visible card geometry are enrollment evidence only: they do not prove that NIA issued the card, that printed values are authoritative, or that the card has not been altered.

## Evaluation and model operations

Evaluation commands consume JSON Lines records containing randomized sample IDs and already-derived labels, scores, outcomes, or redacted field maps; raw cards, faces, videos, embeddings, names, and card numbers must remain in approved encrypted storage and must never be placed in evaluation reports.

```sh
python -m evaluation.face_verification samples/face-scores.jsonl --threshold 0.6 --output evaluation/reports/face.json
python -m evaluation.liveness samples/challenge-outcomes.jsonl --output evaluation/reports/liveness.json
python -m evaluation.ocr samples/redacted-ocr.jsonl --output evaluation/reports/ocr.json
python -m scripts.verify_models
python -m scripts.download_models --accept-licenses
python -m scripts.benchmark --rounds 20
```

`models/manifest.json` is intentionally empty until exact model weights and their deployment licenses are reviewed; downloaded binaries are ignored by Git and are accepted only when their filename, byte size, and SHA-256 checksum match the manifest.

## Enrollment and data use

The initial participant records form an enrollment database and an evaluation set, not a dataset for training a new facial-recognition model; pretrained models should be evaluated using separately captured genuine, controlled impostor, and presentation-attack attempts.

Never commit real Ghana Cards, selfies, videos, face embeddings, consent records, or production model artifacts to this repository, and keep all authorized biometric data encrypted, access-controlled, purpose-limited, and subject to defined retention and deletion rules.

## Deployment requirements

- Keep the FastAPI service on a private network and authenticate every backend request.
- Accept only server-created, short-lived verification sessions and live-camera captures.
- Bind each randomized challenge to one verification session, persist it server-side, and reject reuse after its first evaluation.
- Record the model, policy, and analyzer versions used for every decision.
- Do not log raw images, extracted identity fields, card numbers, videos, or face embeddings.
- Store only the enrollment references and audit evidence required for the declared purpose.
- Calibrate similarity and review thresholds using representative pilot results rather than copied model defaults.
- Review the source-code and model-weight licenses for commercial deployment before distributing any model.
