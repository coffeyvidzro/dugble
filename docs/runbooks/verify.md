# Verify operations runbook

## Surfaces

Verify uses the platform HTTP tracing and error-monitoring stack for API requests. Background worker telemetry is exposed on the worker health server:

- `GET /health` — liveness
- `GET /ready` — PostgreSQL, JetStream, and supervised-component readiness
- `GET /metrics/verify` — Verify dispatch and expiry metrics

The Verify metrics endpoint uses Prometheus text exposition and does not include team, recipient, verification, challenge, or provider message identifiers in labels.

## Metrics

### `dugble_verify_operations_total`

Counter labelled by `operation` and `outcome`.

Current operations:

- `dispatch` — attempts to process a verification dispatch command
- `dispatch_exhausted` — terminal handling after dispatch retries are exhausted
- `expiry_batch` — expiry worker batch execution

Outcomes are `success` or `error`.

### `dugble_verify_operation_duration_seconds`

Summary containing `_sum` and `_count` series for each operation. Use these to calculate average duration over a window:

```text
rate(dugble_verify_operation_duration_seconds_sum[5m])
/
rate(dugble_verify_operation_duration_seconds_count[5m])
```

### `dugble_verify_expired_total`

Counter of verifications transitioned to `expired` by the expiry worker.

## Recommended alerts

### Dispatch errors

Alert when the dispatch error ratio exceeds 5% for 10 minutes and there is meaningful traffic.

```text
sum(rate(dugble_verify_operations_total{operation="dispatch",outcome="error"}[10m]))
/
sum(rate(dugble_verify_operations_total{operation="dispatch"}[10m])) > 0.05
```

Check provider availability, billing authorization failures, database errors, JetStream redelivery activity, and the structured `verification dispatch failed` logs.

### Dispatch exhaustion

Alert on any sustained increase in successful `dispatch_exhausted` handling. A successful outcome means the verification was safely transitioned to `delivery_failed`; it does not mean message delivery succeeded.

```text
increase(dugble_verify_operations_total{operation="dispatch_exhausted",outcome="success"}[10m]) > 0
```

Inspect `verification dispatch exhausted` logs using the internal verification, challenge, and team IDs. Confirm whether the failure is provider-specific or systemic before replaying dead-lettered commands.

### Expiry worker failures

Alert when expiry batches fail repeatedly:

```text
increase(dugble_verify_operations_total{operation="expiry_batch",outcome="error"}[10m]) >= 3
```

Check PostgreSQL connectivity, lock contention, event emission failures, and worker readiness. Do not manually update verification status unless event and webhook consistency are also preserved.

### Expiry throughput stops

A flat `dugble_verify_expired_total` is only suspicious when pending verifications are known to be reaching their expiry time. Correlate with product traffic and database counts before alerting.

## Incident workflow

1. Check `/ready` and identify unavailable dependencies or stopped components.
2. Compare dispatch and expiry error rates with their operation durations.
3. Search structured logs by internal verification or challenge ID. Never copy recipients or verification codes into incident channels.
4. Check JetStream consumer state, redelivery counts, and the Verify dispatch dead-letter subject.
5. Check email/SMS provider health and channel lifecycle feedback.
6. Confirm that `verification.delivery_failed` or `verification.expired` events were emitted before taking manual action.
7. Record the affected time range, channels, providers, and remediation in the incident timeline.

## Safety notes

- Verification codes must never appear in logs, metrics, traces, tickets, or dashboards.
- Recipients and IP fingerprints must not be metric labels.
- High-cardinality identifiers are allowed only in structured logs intended for targeted incident investigation.
- Replaying a dispatch command is safe only after confirming the current verification and challenge remain eligible; normal handlers enforce these guards.
