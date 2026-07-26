# SMS API contract

The SMS API creates durable message resources and delivers them asynchronously.
This document defines what a successful request means, how API clients
authenticate, and how clients should follow delivery progress.

## Authentication

Server-to-server clients authenticate with a team token:

```http
Authorization: Bearer dgb_team_<secret>
```

A team token identifies its team, so bearer-token requests must not send an
`X-Team-ID` header. Grant tokens only the permissions they need:

- `sms:send` permits `POST /sms`, `POST /sms/batch`, and status synchronization.
- `sms:read` permits `GET /sms` and `GET /sms/{message_id}`.

Dashboard clients may use their session cookie instead. Session requests must
include `X-Team-ID` and a valid CSRF token. CSRF validation does not apply to
team-token requests.

Team-token secrets are returned only when a token is created. Store them in a
secret manager, create separate tokens for each service and environment, set an
expiration, and revoke credentials that are no longer needed.

## Sending a message

```http
POST /sms HTTP/1.1
Authorization: Bearer dgb_team_<secret>
Idempotency-Key: order-481-confirmation-v1
Content-Type: application/json

{
  "to": "+233241234567",
  "from": "Dugble",
  "body": "Your order #481 has been confirmed.",
  "metadata": {
    "order_id": "481"
  }
}
```

A successful send returns `201 Created`, a `Location` header for the new SMS
resource, and the resource with a `queued` status:

```http
HTTP/1.1 201 Created
Location: /sms/4b9e2cbe-85f3-4c85-a82d-336e87274485
```

`201 Created` means Dugble has validated and priced the message, charged the
team wallet, persisted the message, and durably queued delivery. It does not
mean that an SMS provider, carrier, or recipient has accepted the message.

## Idempotency and retries

Clients should include a stable `Idempotency-Key` on every single and batch
send. When a connection fails or times out, retry the unchanged request with
the same key. Do not reuse a key for a different method, path, query, or body.

Completed responses can be replayed for 24 hours. Reusing a key with different
request content returns a conflict. A batch key covers the complete batch, not
each individual message.

Dugble avoids resubmitting a message when an upstream result is ambiguous, but
does not promise exactly-once delivery across providers and carriers. Clients
must not create a new send merely because a message remains `processing` or its
status is temporarily `unknown`.

## Delivery statuses

| Status | Meaning | Terminal |
| --- | --- | --- |
| `queued` | Durably accepted and waiting for a delivery worker. | No |
| `processing` | Claimed by a worker; the provider outcome is pending or ambiguous. | No |
| `submitted` | Accepted by an upstream provider. | No |
| `sent` | Reported as sent onward by the provider. | No |
| `delivered` | Delivery was confirmed. | Yes |
| `undelivered` | The provider or carrier reported non-delivery. | Yes |
| `rejected` | The provider or carrier rejected the message. | Yes |
| `expired` | The provider's delivery window expired. | Yes |
| `refund_pending` | Delivery failed and wallet compensation is in progress. | No |
| `failed` | Dugble could not complete delivery. | Yes |
| `unknown` | The provider status cannot currently be mapped confidently. | No |

Providers may omit intermediate states; for example, a message may move from
`submitted` directly to `delivered`. Clients can read the current resource with
`GET /sms/{message_id}`. They should stop polling at a terminal status and use
increasing delays between non-terminal status checks.

## Batch sends

`POST /sms/batch` accepts up to 50 messages. The HTTP response describes the
completed batch-admission operation, while delivery of every accepted message
continues asynchronously. Each result contains its zero-based input index and
either a queued message or an error. One rejected item does not roll back other
accepted items.
