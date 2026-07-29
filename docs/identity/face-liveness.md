# Dugble Face Liveness Product Contract

Status: Draft  
Contract version: `v1alpha1`  
Owners: Dugble Identity and Identity AI

## Purpose

Dugble Face Liveness is a session-based verification capability that gathers fresh camera
evidence and estimates whether a physically present person participated in the capture. It is
designed for onboarding, account recovery, step-up authentication, and protection of separate
age-assurance workflows.

The product returns probabilistic, versioned evidence. It does not establish legal identity,
declare that a person is fraudulent, determine age, or authorize an account action. The Dugble
server applies a versioned policy to the evidence and owns the final workflow outcome.

This document defines the intended product boundary and integration contract. It is not a claim
that every component described here is implemented or production-ready.

## V1 scope

V1 will provide:

- server-created, short-lived, single-use liveness sessions;
- a live-camera capture flow with real-time user guidance;
- an active, versioned movement challenge;
- capture-quality, challenge, continuity, and supported presentation-attack evidence;
- a normalized liveness score and explicit evidence-sufficiency result;
- one selected reference image when capture quality permits;
- stable failure and retry reason codes;
- immutable, versioned analysis results; and
- optional one-to-one comparison against a caller-selected enrolled reference.

V1 will not provide:

- legal-identity or document verification;
- age estimation;
- one-to-many face identification or population search;
- a universal bot or fraud determination;
- guaranteed detection of every presentation, replay, synthetic-media, or camera-injection
  attack;
- a final authorization decision; or
- indefinite storage of raw captures, reference images, audit images, or biometric templates.

## Actors and ownership

### Dugble application

The product surface that starts onboarding, recovery, or step-up verification and presents the
resulting workflow state to the user. It never calls Identity AI's private control API directly.

### Dugble identity module

`server/internal/modules/identity` is the product control plane. It owns:

- user and tenant authorization;
- verification purpose and subject binding;
- consent and policy prerequisites;
- durable verification and attempt records;
- idempotency, attempt limits, and rate limits;
- selection of required checks;
- policy thresholds and the final workflow outcome;
- retry, manual-review, and alternative-verification behavior;
- retention and deletion policy; and
- application-facing APIs and audit events.

### Dugble capture client

The web or native client component owns:

- camera permission and device compatibility checks;
- live-camera capture without a gallery-file fallback in liveness mode;
- challenge and accessibility instructions;
- real-time framing, distance, lighting, and movement guidance;
- bounded, ordered capture streaming;
- use of a short-lived, session-scoped capture credential; and
- safe handling of cancellation, timeout, retry, and unsupported-device states.

The capture client is not trusted to decide that a challenge passed. Client timestamps, device
signals, and completion messages are evidence that the server validates rather than authority.

### Dugble Identity AI

`services/identity-ai` is the private biometric execution plane. It owns:

- creation of randomized, versioned liveness challenges;
- capture-session authentication and replay protection;
- capture constraints and real-time guidance;
- face, landmark, quality, temporal, and presentation-attack analysis;
- reference-image and optional audit-image selection;
- immutable, versioned biometric evidence;
- model artifact verification and inference lifecycle; and
- short-lived processing state required to conduct a capture.

Identity AI does not own Dugble accounts, tenant policy, final authorization, or long-term
business records.

## Trust boundaries

```text
Dugble application
        |
        | user authorization
        v
server/internal/modules/identity
        |
        | private service credential
        v
services/identity-ai control API
        ^
        | one-session capture credential
        |
Dugble capture client
```

The server-to-service credential must never be exposed to a browser or mobile client. A capture
credential must be scoped to one session and capture operation, expire with or before the
session, and be unusable against the private control API.

## Product workflow

1. The application asks the identity module to create a verification for an authenticated
   subject and purpose.
2. The identity module authorizes the request, applies attempt limits, creates a durable
   verification attempt, and requests an Identity AI session using an idempotency key.
3. Identity AI creates a randomized challenge and returns an opaque session ID plus a
   short-lived capture configuration.
4. The identity module returns only the safe capture configuration to the application.
5. The capture client opens the camera and streams fresh, ordered evidence directly to the
   capture endpoint while applying server guidance.
6. Identity AI closes the capture, analyzes the evidence, selects a reference image when
   possible, and records one immutable terminal result.
7. The identity module retrieves or reconciles that result and applies its versioned policy.
8. The application receives a product outcome such as approved, retry required, manual review,
   alternative verification required, rejected, expired, or cancelled.
9. Raw capture data and retained derivative artifacts are deleted according to explicit policy.

## Identifiers and binding

- `verification_id` identifies the durable business workflow owned by the identity module.
- `attempt_id` identifies one liveness attempt within that verification.
- `session_id` identifies one Identity AI capture and analysis session.
- All identifiers are opaque and globally unique.
- A session is bound to exactly one verification and attempt.
- A session cannot be reassigned to a different subject, tenant, purpose, or attempt.
- Identity AI must compare the supplied binding on every privileged session operation.
- Logs and metrics should use a dedicated correlation ID rather than account identifiers or
  biometric-media keys.

## Idempotency

Creating a verification attempt and creating its Identity AI session must be idempotent.

- The application supplies an idempotency key to the identity module.
- The identity module derives or stores a stable idempotency key for the Identity AI request.
- Repeating an identical create request returns the existing verification, attempt, and session.
- Reusing a key with different immutable parameters is rejected.
- Retrying result retrieval never reruns analysis or creates a new result.
- A new liveness attempt always receives a new session ID and capture credential.

## Session lifecycle

### States

| State | Meaning |
| --- | --- |
| `created` | The session exists, but no capture connection has been accepted. |
| `capturing` | The capture client is authenticated and sending evidence. |
| `processing` | Capture is closed and final analysis is running. |
| `succeeded` | Analysis completed and immutable evidence is available. |
| `failed` | The session ended with a terminal capture or analysis failure. |
| `expired` | The allowed session or capture window elapsed. |
| `cancelled` | The owning verification cancelled the session before completion. |

### Allowed transitions

```text
created -> capturing -> processing -> succeeded
    |          |            |
    |          |            +------> failed
    |          +-------------------> failed
    +------------------------------> cancelled
    +------------------------------> expired
               +-------------------> cancelled
               +-------------------> expired
```

Terminal states are `succeeded`, `failed`, `expired`, and `cancelled`. A terminal state cannot be
reopened. A technically successful analysis does not mean the user passed the identity module's
policy.

### Expiration and single use

- The session expiry is chosen by server policy within Identity AI's configured bounds.
- The initial V1 target is a maximum three-minute session lifetime and a shorter active capture
  window.
- The capture credential expires no later than the session.
- Only one capture connection may claim a session.
- Reconnect behavior, if supported, uses a bounded lease and cannot restart the challenge.
- Completed, failed, expired, and cancelled sessions reject new capture evidence.
- Expired result metadata may be retained for audit, but biometric media follows its separate
  deletion schedule.

## Challenge profiles

Challenges are server-selected and versioned. Clients render instructions but do not choose or
alter the challenge.

### `movement_v1`

The initial profile uses randomized face positioning and natural movement with ordered timing
constraints. Completion is presence evidence, not sufficient proof of liveness by itself.

### Future profiles

- `passive_v1` may reduce friction but requires stronger passive presentation-attack and device
  integrity evidence.
- `movement_and_light_v1` may add randomized screen illumination after accessibility,
  photosensitivity, device support, and attack-performance evaluation.

Adding or changing a profile requires a new challenge version and evaluation against the
supported device and attack matrix.

## Capture contract

The production capture path is an integrity-protected live stream. A stored video object is an
evaluation or trusted batch input, not equivalent liveness evidence.

The capture protocol must provide:

- a session-scoped credential;
- monotonically increasing sequence numbers;
- client capture timestamps and server receipt timestamps;
- bounded frame count, dimensions, frame rate, encoded bytes, and duration;
- an explicit content format and supported codec set;
- challenge and guidance events;
- duplicate, gap, and out-of-order detection;
- an explicit end-of-capture message;
- timeout, cancellation, and overload behavior; and
- a terminal acknowledgement that does not itself reveal the policy outcome.

The server must not accept path names, URLs, or object keys that allow a client to select
arbitrary server-side resources.

## Private control API

The paths below describe the target contract. Exact transport details may change before the
contract leaves `v1alpha1`.

### Create a session

```http
POST /internal/v1/liveness/sessions
Authorization: Bearer <service-credential>
Idempotency-Key: <attempt-id>
```

```json
{
  "verification_id": "019b...",
  "attempt_id": "019b...",
  "challenge_profile": "movement_v1",
  "capture_profile": "web_v1",
  "expires_in_seconds": 180,
  "audit_image_limit": 0
}
```

```json
{
  "session_id": "019b...",
  "status": "created",
  "expires_at": "2026-07-29T12:03:00Z",
  "capture": {
    "endpoint": "wss://capture.example/v1/liveness/sessions/019b...",
    "token": "<single-use-token>",
    "token_expires_at": "2026-07-29T12:03:00Z"
  },
  "challenge": {
    "type": "movement",
    "version": "movement-v1"
  }
}
```

The capture token is sensitive and must not be persisted in logs or ordinary audit records.

### Get a session result

```http
GET /internal/v1/liveness/sessions/{session_id}
Authorization: Bearer <service-credential>
```

Non-terminal sessions return their current status and expiry. Successful sessions return the
immutable result contract described below. Retrieval is idempotent.

### Cancel a session

```http
POST /internal/v1/liveness/sessions/{session_id}/cancel
Authorization: Bearer <service-credential>
```

Cancellation is idempotent. It cannot replace an existing terminal result.

## Result contract

```json
{
  "contract_version": "v1alpha1",
  "session_id": "019b...",
  "verification_id": "019b...",
  "attempt_id": "019b...",
  "status": "succeeded",
  "completed_at": "2026-07-29T12:01:24Z",
  "liveness": {
    "score": 0.93,
    "evidence": "sufficient",
    "reasons": []
  },
  "capture_quality": {
    "score": 0.88,
    "usable": true,
    "reasons": []
  },
  "challenge": {
    "type": "movement",
    "version": "movement-v1",
    "completed": true,
    "completion_ratio": 1.0
  },
  "presentation_attack": {
    "suspected": false,
    "signals": [
      {
        "type": "two_dimensional",
        "score": 0.04
      }
    ]
  },
  "reference_image": {
    "object_key": "identity/retained/019b.../reference.jpg",
    "width": 640,
    "height": 640
  },
  "audit_images": [],
  "components": {
    "analyzer": "liveness-v1",
    "face_detector": "...",
    "landmark_model": "...",
    "presentation_attack_model": "..."
  }
}
```

### Result semantics

- `score` is a finite normalized value from `0.0` to `1.0`; it is not a probability of fraud.
- `evidence` is `sufficient`, `insufficient`, or `indeterminate`.
- `challenge.completed` alone never establishes liveness.
- `presentation_attack.suspected` summarizes versioned signals at the recorded analyzer
  threshold; the identity module may apply a stricter policy.
- A missing reference image makes downstream face comparison unavailable and normally produces
  a retry rather than a fabricated result.
- Component versions and thresholds used to derive summaries must be reproducible from the
  stored result version or included directly in the evidence.
- Once a session succeeds, its result is immutable.

## Failures and retry policy

Failures use stable machine-readable codes. Human messages are supplied by the application and
must not depend on internal exception text.

### Retryable capture failures

- `camera_permission_denied`
- `capture_timed_out`
- `no_face`
- `multiple_faces`
- `face_too_small`
- `face_out_of_frame`
- `lighting_too_low`
- `motion_blur`
- `challenge_incomplete`
- `capture_quality_insufficient`
- `reference_image_unavailable`

### Terminal or security-sensitive failures

- `session_expired`
- `session_already_claimed`
- `session_already_completed`
- `session_binding_mismatch`
- `capture_integrity_failed`
- `presentation_attack_suspected`
- `attempt_limit_exceeded`

### Operational failures

- `model_runtime_unavailable`
- `capture_capacity_exceeded`
- `analysis_failed`
- `storage_unavailable`

Operational failures do not imply that the participant failed liveness. The identity module
decides whether to retry without consuming a user attempt, wait, or offer an alternative method.

## Identity-module outcomes

The identity module converts evidence into one of these product outcomes:

| Outcome | Meaning |
| --- | --- |
| `approved` | All required checks satisfied the active policy. |
| `retry_required` | A new attempt may resolve insufficient or low-quality evidence. |
| `review_required` | Policy requires a governed human or secondary review. |
| `alternative_required` | The user must use a non-biometric or different verification method. |
| `rejected` | Policy reached a terminal negative outcome. |
| `expired` | The verification window elapsed. |
| `cancelled` | The application or user cancelled the verification. |

The policy record must include its version, applied thresholds, attempt number, reason codes,
and referenced Identity AI result version. Identity AI never returns these business outcomes.

## Face comparison

One-to-one comparison is optional and downstream of usable fresh capture evidence.

- The identity module explicitly selects one enrolled reference belonging to the verification
  subject.
- Identity AI compares that reference only with the selected fresh reference image.
- The result is a versioned similarity score, not an identity assertion.
- The identity module applies the comparison threshold.
- Routine verification must not search an enrolled population to identify an unknown person.
- Raw embeddings are not returned through the application-facing API.

## Media and retention

| Data | V1 default | Owner |
| --- | --- | --- |
| Raw capture stream | Delete after analysis or short failure-debug window | Identity AI storage policy |
| Reference image | Retain only when required by verification policy | Identity module and approved object storage |
| Audit images | Disabled by default; maximum explicitly configured | Identity module and approved object storage |
| Face embedding | Do not persist unless a defined workflow requires it | Identity module policy |
| Scores and reason codes | Retain with verification audit record | Identity module |
| Model/runtime diagnostics | Retain without biometric media or account identifiers | Identity AI operations |

All retained biometric media must be encrypted in transit and at rest, tenant-bound, access
controlled, deletion scheduled, and excluded from logs, traces, analytics events, and error
reports. Object keys are sensitive metadata and must not be exposed to unauthorized clients.

## Security requirements

- Keep the Identity AI control API on a private network.
- Authenticate and authorize every control operation.
- Use constant-time credential validation and support credential rotation.
- Use a distinct, short-lived capture credential for each session.
- Reject replayed credentials, duplicate streams, and reused terminal sessions.
- Bind capture evidence to session, attempt, verification, challenge, and capture-profile
  versions.
- Apply request, frame, pixel, byte, duration, concurrency, and rate limits.
- Validate sequence ordering and both client and server timing.
- Redact authorization values, tokens, raw media, embeddings, account identifiers, and object
  keys from logs.
- Verify model artifacts and record model versions in results.
- Make deletion and retention observable and auditable without retaining deleted media.
- Treat client device and attestation signals as risk evidence, not an absolute trust decision.

## Accessibility and fallback

- The application must explain camera use before requesting permission.
- Capture instructions must not rely on color or audio alone.
- Movement and timing requirements must be tested for motor and visual accessibility.
- Light-based challenges require photosensitivity review and a non-light alternative.
- A user who cannot complete facial liveness must have an appropriate alternative verification
  route where product and legal requirements permit it.
- Retry messaging must describe capture conditions without labeling the user as fraudulent.

## Evaluation and release gates

Before enabling a challenge, model, or threshold in production, Dugble must evaluate:

- false acceptance and false rejection at the selected operating point;
- failure-to-acquire and retry rates;
- supported presentation attacks by attack type;
- device, browser, camera, lighting, motion, and network conditions;
- appropriately governed performance cohorts;
- accessibility completion and fallback behavior;
- latency, throughput, memory, and overload behavior; and
- regressions against the currently approved bundle.

Evaluation reports contain randomized sample identifiers and derived metrics, never raw facial
media, embeddings, account identifiers, or consent records. A release records the approved model
bundle, analyzer, challenge, capture profile, thresholds, evaluation report, approver, and rollback
criteria.

## Observability

Identity AI should emit privacy-safe metrics for:

- sessions created, claimed, completed, failed, expired, and cancelled;
- capture and processing duration;
- guidance and retry reason frequencies;
- evidence sufficiency and quality distributions;
- presentation-attack signal distributions;
- model initialization and inference failures;
- queue saturation, timeouts, and rejected overload; and
- retention and deletion completion.

Traces use correlation IDs and stable reason codes. They must not include media, embeddings,
capture tokens, authorization headers, object keys, or user/account identifiers.

## Delivery milestones

### Milestone 1: Contract and control-plane skeleton

- Review and approve this contract.
- Define Go verification and attempt domain models.
- Define the Go Identity AI client interface.
- Implement create/get behavior with fakes and idempotency tests.

### Milestone 2: Identity AI session control API

- Implement create, get, and cancel operations.
- Add shared session state transitions and immutable results.
- Add binding, expiry, and replay tests.

### Milestone 3: Capture client and transport

- Implement a web capture component and bounded streaming protocol.
- Add real-time guidance and short-lived capture credentials.
- Test disconnect, replay, ordering, timeout, and overload behavior.

### Milestone 4: End-to-end evidence

- Connect capture frames to quality, challenge, continuity, and presentation-attack analysis.
- Select reference images and apply deletion policy.
- Reconcile results into the identity module and apply versioned policy.

### Milestone 5: Evaluation and production readiness

- Calibrate thresholds on representative governed data.
- Complete security, privacy, accessibility, and abuse reviews.
- Add capacity planning, operational dashboards, alerts, and rollback procedures.

## Open decisions

The contract cannot leave draft status until these are decided:

1. The V1 client platforms and supported browser/device matrix.
2. The capture transport and reconnect policy.
3. Session lifetime and active capture timeout bounds.
4. The initial movement challenge and capture-profile details.
5. Whether V1 exposes a liveness score directly or only evidence plus server policy summaries.
6. The initial reference-image and raw-capture retention periods.
7. Whether audit images are supported in V1.
8. The storage system and ownership transfer for retained reference images.
9. The shared session-state store used by Identity AI.
10. The result notification mechanism: polling, signed callback, event, or a combination.
11. The retry policy for operational failures versus user-evidence failures.
12. The first production use case and its acceptance thresholds.

## Current implementation note

The repository currently contains model-runtime, face-comparison, landmark, active-challenge,
capture-guidance, presentation-attack, evidence-contract, and evaluation foundations. It does not
yet implement the complete session control plane, production capture stream, shared durable
session state, deployment media integration, calibrated product score, or Go identity workflow
defined by this contract.
