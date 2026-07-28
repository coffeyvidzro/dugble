# Dugble Identity AI

> Detect real users and deter bad actors using spoofs in seconds during facial verification.

`identity-ai` is Dugble's private, self-hosted, country-neutral biometric evidence service for face liveness, capture guidance, optional one-to-one face comparison, presentation-attack detection, and biometric quality assessment.

The service analyzes facial capture sessions and returns measurements with component versions; it does not establish legal identity, authenticate government-issued credentials, determine age by itself, or make a final authorization decision.

## Capabilities

### Face liveness

Evaluates whether a facial session contains evidence of a live, physically present participant by analyzing short-lived challenges, ordered multi-frame observations, pose transitions, timing, and continuity signals.

### Capture guidance

Provides actionable instructions for face count, framing, distance, pose, stability, lighting, blur, and other conditions that affect genuine-user completion and downstream analysis.

### Face comparison

Performs optional one-to-one comparison between a caller-selected enrolled facial reference and a fresh probe, returning similarity evidence rather than identifying an unknown person from a population.

### Presentation-attack detection

Provides a versioned boundary for detecting supported print, screen-replay, prerecorded-video, mask, camera-injection, and synthetic-media attacks without treating any single signal as conclusive proof of fraud.

### Biometric quality assessment

Separates general image suitability from face-specific quality measurements so calling applications can request a retry before relying on weak liveness or comparison evidence.

## Use cases

1. **User onboarding:** Reduce spoof-assisted account creation by confirming that a live person participates in onboarding.
2. **Step-up authentication:** Strengthen device changes, password recovery, money transfers, and other high-value actions with fresh liveness and optional face comparison.
3. **Age-assurance protection:** Protect a separate age-estimation or age-verification workflow from spoofing; liveness does not determine a person's age.
4. **Bot deterrence:** Deter automated and synthetic participation in camera-gated workflows; general API and web bot protection remains the calling application's responsibility.
5. **Account recovery:** Compare a fresh live capture with an account's enrolled facial reference as one signal in a broader recovery policy.

## Responsibility boundary

The service answers questions such as:

- Is exactly one usable face present?
- Is the capture suitable for biometric analysis?
- Was the issued challenge completed in the expected order and time window?
- Are supported presentation-attack indicators present?
- How similar is the live face to the selected enrolled reference?

The service does not answer:

- What is this person's legal identity?
- Is an account, transaction, or recovery request authorized?
- Is the user old enough for restricted content?
- Is the user fraudulent or universally free of bot activity?

The calling backend owns session authorization, account binding, attempt limits, risk policy, manual review, accessibility alternatives, and the final outcome.

## Country-neutral design

The biometric pipeline operates on facial captures, session challenges, optional enrolled references, and capture metadata; it has no dependency on a national identity system, issuing authority, or country-specific registry.

The technology is country-neutral, but each deployment remains responsible for the privacy, biometric-processing, retention, accessibility, and automated-decision requirements applicable to its users and use case.

## Recommended stack

| Capability | Stack |
| --- | --- |
| Face detection | **OpenCV YuNet** |
| Face recognition and embeddings | **OpenCV SFace** |
| Face landmarks and capture guidance | **MediaPipe Face Landmarker** |
| Model execution | **ONNX Runtime**, where supported by the selected adapter |
| Frame and image processing | **OpenCV** |
| Capture-quality analysis | Deterministic image checks plus a face-specific quality assessor |
| Liveness | Server-generated, short-lived, single-use challenges and multi-frame evidence |
| Presentation-attack detection | Reviewed, versioned detector adapters evaluated by attack type |
| Decision-making | Calling backend's deterministic, versioned policy engine |
| Service boundary | Private **FastAPI** application |

## Processing flows

### Liveness

```text
calling backend creates a verification session
    -> server issues a short-lived challenge
    -> client captures a fresh frame sequence
    -> capture and biometric quality assessment
    -> face landmarks, pose, timing, and continuity observations
    -> presentation-attack analysis
    -> versioned evidence returned to the calling backend
    -> calling backend applies policy
```

### Optional facial verification

```text
caller selects one enrolled facial reference
    -> fresh capture passes quality and liveness analysis
    -> service derives a probe embedding
    -> one-to-one similarity comparison
    -> versioned similarity evidence returned to the caller
```

Routine verification must not search every enrolled face to identify an unknown participant.

## Project structure

```text
services/identity-ai/
├── app/
│   ├── api/                  # Private HTTP transport, schemas, and dependencies
│   ├── capture/              # Capture guidance and biometric quality boundaries
│   ├── contracts/            # Face, liveness, quality, and attack evidence
│   ├── core/                 # Configuration and internal authentication
│   ├── face/                 # Detection, landmarks, embeddings, and 1:1 comparison
│   ├── imaging/              # Bounded decoding, normalization, and image quality
│   ├── inference/            # Model registry, runtime, manifest, and lifecycle
│   └── liveness/             # Challenges, observations, attack detection, and evidence
├── evaluation/               # Face, liveness, and presentation-attack metrics
├── models/                   # Reviewed manifest; downloaded binaries remain untracked
├── scripts/                  # Model verification, download, and synthetic benchmarks
└── tests/                    # Unit and transport tests without real biometric media
```

## Current status

The repository currently provides deterministic image-quality checks, evidence contracts, capture guidance, challenge issuance and observation evaluation, face-comparison orchestration, presentation-attack and biometric-quality adapter boundaries, evaluation metrics, model-artifact tooling, the Phase 1 runtime foundation, the Phase 2 face pipeline, the Phase 3 capture-and-landmarks pipeline, and the Phase 4 liveness-and-attacks orchestration.

The runtime foundation installs pinned NumPy, headless OpenCV, and ONNX Runtime dependencies; validates the configured model manifest and every required artifact before inference; creates optimized ONNX sessions with an explicit provider allowlist; initializes the model bundle during FastAPI lifespan startup; releases it during shutdown; and keeps readiness false when authentication or required models are unavailable.

The Phase 2 pipeline pins exact OpenCV Zoo YuNet and SFace artifacts by byte size and SHA-256 checksum. Concrete, thread-safe OpenCV adapters convert normalized images to BGR, map YuNet's box and five landmarks into stable contracts, use those landmarks for SFace alignment, validate its 128-value embedding, and compose both components into the existing one-to-one comparison service. The model bundle exposes this service only after both verified adapters initialize successfully.

The Phase 3 pipeline pins the MediaPipe Face Landmarker task bundle and processes ordered, timezone-aware capture frames in video mode. It reports face count, normalized face size, and yaw, pitch, and roll from facial transformation matrices, then produces deterministic per-frame guidance. Multiple-face detection is deliberately enabled, timestamps must increase, model output is validated, and the MediaPipe task is released with the runtime bundle.

Phase 4 adds server-owned, verification-bound, expiring challenges with atomic single-use consumption and replay rejection. Its composite analyzer requires one landmark observation per ordered frame, evaluates the active challenge, invokes a versioned presentation-attack detector, and reports attack scores, the applied threshold, suspected attack types, and component failure reasons without making an account authorization decision.

The process-local session store is for development and concurrency tests; a shared transactional store is required before horizontally scaled deployment. The default required bundle still includes a presentation-attack model that is not pinned yet, so enabling the complete service intentionally produces `model_runtime_unavailable` rather than pretending that challenge motion alone proves liveness. A reviewed PAD model and calibrated attack-specific thresholds, encoded frame-sequence decoding, capture-client integrity, media retrieval, durable single-use session persistence, and active model-backed HTTP endpoints are not implemented yet. Placeholder endpoints return `501 Not Implemented` instead of simulated biometric evidence.

Completing a head-pose challenge is limited presence evidence, not strong liveness proof; production policy must combine it with presentation-attack analysis, replay and injection defenses, biometric quality, calibrated thresholds, rate limits, and manual fallback.

## Internal API

```text
GET  /health
GET  /ready
POST /v1/liveness/check
POST /v1/faces/compare
```

Analysis endpoints must remain private, require backend authentication, and accept only server-created verification sessions.

## Runtime configuration

Python 3.14.4 or newer is required. Runtime configuration is environment-backed:

```text
IDENTITY_AI_ENABLED=false
IDENTITY_AI_API_KEY=<private service credential>
IDENTITY_AI_MODEL_MANIFEST=models/manifest.json
IDENTITY_AI_MODEL_DIR=models
IDENTITY_AI_REQUIRED_MODELS=face-detector,face-embedder,face-landmarks,presentation-attack
IDENTITY_AI_ONNX_PROVIDERS=CPUExecutionProvider
```

`/health` reports process liveness. `/ready` reports ready only when the service is disabled or, when enabled, internal authentication is configured and the complete reviewed model bundle has initialized successfully. It returns only a stable model status code rather than filesystem paths or runtime exception details.

## Evaluation and model operations

Evaluation inputs contain randomized sample identifiers and already-derived labels, scores, or outcomes. Raw facial images, videos, embeddings, account identifiers, and consent records must remain in approved encrypted storage and must never be written to reports or committed to Git.

```sh
python -m evaluation.face_verification samples/face-scores.jsonl --threshold 0.6 --output evaluation/reports/face.json
python -m evaluation.liveness samples/challenge-outcomes.jsonl --output evaluation/reports/liveness.json
python -m evaluation.presentation_attack samples/attack-outcomes.jsonl --output evaluation/reports/attacks.json
python -m scripts.verify_models
python -m scripts.download_models --accept-licenses
python -m scripts.benchmark --rounds 20
```

`models/manifest.json` contains the reviewed YuNet and SFace artifacts for Phase 2 and the MediaPipe Face Landmarker task bundle for Phase 3. Downloaded artifacts are accepted only when their basename, byte size, and SHA-256 checksum match the manifest; accepting the download flag confirms that the operator has reviewed the linked model licenses.

## Security and privacy requirements

- Bind every randomized challenge to one verification session, expire it quickly, persist it server-side, and reject reuse.
- Accept live-camera sessions through an integrity-protected client flow; gallery files alone are not liveness evidence.
- Keep the FastAPI service on a private network and authenticate every request.
- Encrypt biometric media and embeddings in transit and at rest with tightly scoped access.
- Do not log raw frames, videos, embeddings, account identifiers, or authorization credentials.
- Apply explicit retention and deletion rules to raw media, derived templates, backups, and evaluation data.
- Record analyzer, model, threshold, and policy versions for auditability.
- Measure genuine-user rejection and attack acceptance by device, capture condition, and appropriately governed cohorts.
- Route uncertain outcomes to retry or manual review rather than presenting them as fraud.
- Review source-code and model-weight licenses before distributing any model artifact.
