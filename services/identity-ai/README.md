# Dugble Identity AI

> Know when a real person is present during a digital verification.

Dugble Identity AI is Dugble's face-liveness and facial-verification service. It helps products
confirm that a verification is being completed by a live participant rather than a printed
photo, screen replay, prerecorded video, or another supported spoof.

The service powers short, guided camera checks. It evaluates the quality and continuity of the
capture, completion of a server-created challenge, and supported presentation-attack signals,
then returns versioned evidence to Dugble's identity module. The identity module combines that
evidence with the product's policy and decides whether to approve, retry, review, reject, or
offer another verification method.

Identity AI provides decision support. It does not establish legal identity, determine age,
label a person as fraudulent, or authorize an account action by itself.

## What it enables

### Face liveness

Confirm that a live participant is present for a fresh camera session. Each check uses a
short-lived, single-use session and a server-created challenge rather than trusting a
client-provided pass or a gallery upload.

### Guided capture

Help users complete a usable selfie capture with real-time feedback about face count, framing,
distance, pose, stability, lighting, and blur. Clear guidance reduces avoidable retries and
improves the evidence used by downstream checks.

### Presentation-attack detection

Evaluate supported signals associated with attacks such as printed photos and display replays.
Signals are reported with model and analyzer versions so they can be evaluated by a versioned
product policy rather than treated as universal proof of fraud.

### One-to-one face comparison

Optionally compare the best frame from a successful live capture with one enrolled reference
selected by the calling workflow. Identity AI returns similarity evidence; it does not search a
population to identify an unknown person.

### Biometric quality evidence

Separate capture usability from liveness and face similarity. Low-quality or insufficient
evidence can produce a targeted retry instead of an unreliable result.

## Use cases

### User onboarding

Add a fresh-presence check before creating or activating an account, especially when onboarding
also uses a separate identity or document-verification provider.

### Account recovery

Protect high-risk recovery flows with live capture and, when appropriate, one-to-one comparison
against an account's enrolled reference.

### Step-up verification

Request stronger evidence before sensitive actions such as changing security settings, adding a
new device, accessing protected data, or completing a high-value transaction.

### Age-assurance protection

Protect a separate age-estimation or age-verification flow from simple spoofing. Face liveness
can show evidence of fresh participation, but it does not estimate or verify a person's age.

### Human-presence checks

Deter automated and synthetic participation in camera-gated workflows. This complements, but
does not replace, device integrity, abuse prevention, rate limiting, and general bot protection.

## Product experience

A typical liveness check follows this flow:

```text
Dugble application
    -> asks the identity module to start a verification
    -> receives a short-lived capture session
    -> opens the guided camera experience
    -> streams fresh capture evidence
    -> receives capture guidance while the user completes the challenge
    -> waits while Identity AI analyzes the session
    -> receives an approved, retry, review, rejected, or alternative-method outcome
```

The user-facing experience should be short and explain what the camera check needs. When a user
cannot complete facial liveness, the calling product should provide an appropriate retry or
alternative verification path.

## How the product fits together

```text
Dugble application
        |
        | application verification request
        v
server/internal/modules/identity
        |
        | private liveness session and result API
        v
services/identity-ai
        ^
        | short-lived capture session
        |
Dugble web or mobile capture client
```

### Dugble identity module

The identity module owns the verification workflow: user authorization, purpose and account
binding, attempt limits, policy thresholds, durable records, retries, fallbacks, and the final
product outcome.

### Dugble Identity AI

Identity AI owns the biometric session: challenge generation, capture guidance, face and quality
analysis, presentation-attack evidence, model execution, reference-frame selection, and the
versioned analysis result.

### Dugble capture client

The capture client owns the camera experience: permissions, instructions, live evidence capture,
real-time guidance, and session-scoped communication with Identity AI.

## What a result contains

A completed analysis can include:

- session and challenge status;
- a normalized liveness score;
- evidence-sufficiency and capture-quality summaries;
- challenge completion and timing evidence;
- supported presentation-attack signals;
- stable reason and retry codes;
- a selected reference image when capture quality permits;
- optional, policy-controlled audit images;
- face-comparison similarity when requested; and
- challenge, analyzer, threshold, and model versions.

These measurements remain separate so the identity module can apply policy appropriate to the
verification purpose. Completing a movement challenge alone is not treated as conclusive proof
of liveness, and a low-confidence result is not presented as proof that a user is fraudulent.

## Product principles

- **Fresh participation:** liveness checks use server-created, expiring, single-use sessions.
- **Evidence, not identity claims:** Identity AI reports measurements and reasons instead of
  making legal-identity or authorization decisions.
- **Guidance before rejection:** recoverable capture problems should lead to clear feedback and
  targeted retries.
- **Layered protection:** challenge, quality, temporal, presentation-attack, and device signals
  contribute different evidence.
- **Versioned decisions:** results identify the challenge, analyzer, models, and thresholds that
  produced them.
- **Purpose-bound comparison:** face comparison is one-to-one and uses an explicitly selected
  reference.
- **Accessible fallback:** products should offer an appropriate alternative when a user cannot
  complete facial liveness.

## Internal product contract

The detailed session lifecycle, ownership boundaries, target private API, result semantics,
failure codes, retention model, evaluation gates, and delivery milestones are defined in the
[Face Liveness Product Contract](PRODUCT.md).
