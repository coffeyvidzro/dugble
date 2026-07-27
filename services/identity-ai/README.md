# Dugble Identity AI

`identity-ai` is Dugble's private, self-hosted AI service for AI-assisted Ghana Card and biometric verification.

The service is responsible for producing document, image-quality, face-comparison, and liveness measurements. It must not make the final customer approval decision. Dugble's Go identity module owns verification state, tenant authorization, persistence, policy thresholds, manual review, and the final outcome.

## Current status

The deterministic image-quality core is implemented with bounded decoding,
EXIF normalization, configurable thresholds, and per-check results. The model
pipelines and internal HTTP entrypoint are not implemented yet.

The document, face-match, and liveness functions intentionally raise `NotImplementedError`. Do not expose this service publicly or describe its output as official NIA verification.

## Scope

The first supported flow is limited to:

- Ghana Card front and back capture
- image-quality assessment
- visible document-layout checks
- OCR and field extraction
- Ghana Card portrait extraction
- selfie-to-card face comparison
- randomized active-liveness challenges
- measurements for pass, reject, or manual-review policy

NIA verification can be added later as a separate authoritative confirmation layer.

## Structure

```text
services/identity-ai/
├── app/
│   ├── document.py       # Ghana Card quality, OCR, parsing, and document checks
│   ├── face_match.py     # Ghana Card portrait-to-selfie comparison
│   ├── imaging.py        # Bounded decoding and EXIF orientation normalization
│   ├── liveness.py       # Active-liveness challenge analysis
│   └── quality.py        # Blur, glare, brightness, framing, and resolution checks
├── models/               # Locally managed model files; large weights are not committed
├── tests/                # Unit, integration, and evaluation tests
├── requirements.txt
├── Dockerfile
└── README.md
```

A future `app/main.py` entrypoint will expose the internal API after the pipelines are ready.

## Planned internal API

```text
GET  /health
POST /v1/quality/check
POST /v1/documents/analyze
POST /v1/faces/compare
POST /v1/liveness/check
```

These endpoints should be accessible only to Dugble's backend over a private network.

## Responsibility boundary

The AI service should return measurements such as:

```json
{
  "quality_score": 0.91,
  "layout_score": 0.86,
  "ocr_confidence": 0.82,
  "face_similarity": 0.79,
  "liveness_score": 0.93,
  "reasons": []
}
```

It should not return an authoritative identity decision. The Go service should combine the measurements with configured thresholds and choose one of:

```text
checks_passed
manual_review
rejected
```

Reserve an outcome such as `officially_verified` for a future successful NIA verification.

## Local setup

Python 3.14.6 is required for local development and used by the Docker image.

```sh
cd services/identity-ai
python -m venv .venv
. .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Install `requirements-dev.txt` instead to include the test tooling, then run
`python -m pytest` from this directory.

The current dependency file contains the HTTP-service foundation and Pillow for deterministic image analysis. OCR, computer-vision, model-runtime, and media-processing dependencies should be added when each pipeline is implemented and evaluated.

### Quality core

`app.quality.assess_image` analyzes an already decoded Pillow image.
`app.quality.assess_image_quality` is the convenience boundary for bounded
encoded bytes, binary streams, and local paths. Results contain an analyzer
version, the overall suitability measurement, and individual resolution,
brightness, contrast, sharpness, and glare checks. `passed` remains a
compatibility alias for `meets_quality_thresholds`; neither value is a final
identity approval decision.

### Quality evaluation

The public evaluation set procedurally renders fictional documents and
degradations in memory; the repository contains no fixture image binaries and
no real identity or biometric data.
Run it from this directory with `python -m evaluation.quality`. The command
prints a JSON report with per-fixture outcomes and accept/reject counts, and
exits nonzero if analyzer output drifts from `tests/fixtures/quality/manifest.json`.
Use `--output <path>` to save the report. See the fixture README for regeneration
instructions and important calibration limitations.

## Docker

Build the current scaffold with:

```sh
docker build -t dugble-identity-ai .
```

The image does not currently start an HTTP server because `app/main.py` has not been implemented. Add the runtime command only after the entrypoint exists.

## Dataset policy

Never commit real Ghana Cards, selfies, videos, face embeddings, consent records, or production model artifacts to this public repository.

GitHub may contain only:

- dataset schemas
- synthetic or fully redacted examples
- collection and annotation instructions
- evaluation code
- model download instructions and checksums

Store real evaluation data in encrypted private storage using random participant and sample identifiers. Names, dates of birth, Ghana Card numbers, and other sensitive values must not appear in filenames or ordinary application logs.

Start with a small consented evaluation pilot before training custom models. Use pretrained models first, measure their failures, and fine-tune only the components that need improvement.

## Suggested implementation order

1. Implement deterministic image-quality checks in `quality.py`.
2. Add synthetic and redacted Ghana Card test fixtures.
3. Implement card detection, perspective correction, OCR, and field parsing in `document.py`.
4. Implement portrait and selfie face detection and similarity scoring in `face_match.py`.
5. Implement server-generated active-liveness challenges in `liveness.py`.
6. Add `app/main.py` and the private FastAPI routes.
7. Add unit and integration tests.
8. Connect the Go `server/internal/modules/identity` workflow.
9. Run a small consented Ghana evaluation pilot and calibrate thresholds.

## Security requirements

- Keep the service private and authenticate backend-to-service requests.
- Retrieve media from private object storage using short-lived access.
- Encrypt sensitive data in transit and at rest.
- Do not log raw images, videos, identity numbers, OCR values, or embeddings.
- Apply strict retention and deletion rules.
- Record model versions and analysis timestamps for auditability.
- Route uncertain results to manual review.

## Limitations

Phone-camera analysis can evaluate visible layout, text, image quality, face similarity, and basic presentation attacks. It cannot independently confirm that NIA issued the card, validate the card chip, or reliably inspect every physical security feature.

Until NIA confirmation is integrated, describe the product as **AI-assisted Ghana Card and biometric verification**, not official Ghana Card verification.
