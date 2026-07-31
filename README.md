# Dugble

Dugble is a multi-tenant communications platform for African startups and teams. It combines browser authentication, team-scoped API tokens, email and SMS delivery, webhooks, and operational tooling.

## Architecture

```text
Browser and API clients
        |
        +--------------------+
        |                    |
        v                    v
Next.js web             Go HTTP API :8080
                             |
              +--------------+--------------+
              |              |              |
              v              v              v
         PostgreSQL        Redis      transactional outbox
                                             |
                                             v
                                      NATS JetStream
                                             |
                                             v
                                      delivery worker
                                      /      |      \
                                   email    SMS   webhooks
```

The Go API owns authentication, tenant authorization, persistence, policy decisions, and public API contracts. Background workers deliver queued email, SMS, and webhook events.

## Repository layout

```text
web/                       # Next.js website and dashboard
server/                    # Go API, workers, backoffice, migrations, and tests
docs/                      # Mintlify documentation and OpenAPI contract
deploy/                    # Docker Compose, Caddy, and NATS configuration
```

## Current status

| Area | Status |
| --- | --- |
| Authentication, teams, sessions, and team tokens | Implemented |
| Email and SMS APIs with asynchronous delivery | Implemented |
| Webhook signing, retries, and operational controls | Implemented |
| Backoffice administration | Implemented; internal use only |

## Local development

### Requirements

- Go version declared in `server/go.mod`
- Bun version declared in `web/package.json`
- Docker and Docker Compose

### Environment

```sh
cp .env.example .env
```

Replace all placeholder secrets before starting the stack. The Compose environment expects PostgreSQL, Redis, NATS, Arcjet, and AWS SES credentials.


### AWS SES and SNS feedback

Dugble sends outbound email through AWS SES and accepts SES lifecycle feedback through an HTTPS SNS subscription at `POST /integrations/aws/sns/ses`. Configure SES to publish `send`, `delivery`, `deliveryDelay`, `bounce`, `complaint`, `reject`, and `renderingFailure` events to an SNS topic, then set `AWS_SNS_TOPIC_ARNS` to the exact comma-separated topic ARN allowlist. The webhook verifies the SNS signature, restricts signing certificates to AWS SNS endpoints, rejects mismatched `x-amz-sns-message-type` headers, auto-confirms allowed subscription confirmations, and stores a durable normalized provider event before JetStream processing updates message and recipient lifecycle state.

Required AWS environment variables are `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_FROM_EMAIL`. Set `AWS_SES_CONFIGURATION_SET` when SES events are attached to a configuration set; set `AWS_SNS_TOPIC_ARNS` in API deployments so unsigned or unexpected topics cannot ingest feedback.

### Run the full stack

```sh
make up
make logs
make down
```

Deployment assets live in `deploy/`. `compose.yaml` defines the runtime stack, while `Caddyfile` and `nats-server.conf` configure the edge proxy and NATS JetStream.

### Run individual services

```sh
# API
cd server
go run ./cmd/server

# Delivery worker (health and readiness on :8082)
cd server
go run ./cmd/worker

# Web
cd web
bun install --frozen-lockfile
bun run dev
```

### Backoffice

The backoffice is an internal administrative application. It can inspect operational data and perform privileged mutations including team-status changes, sender-ID decisions, and domain-status decisions.

It reuses the normal Dugble session cookie and restricts access to emails listed in `BACKOFFICE_ADMIN_EMAILS`. Treat the allowlist as a temporary administrative control, keep the service private, and audit privileged actions.

```sh
cd server
BACKOFFICE_ADMIN_EMAILS=you@example.com go run ./cmd/backoffice
```

Then sign in through the normal Dugble app/API flow and open `http://localhost:8081`.

```env
BACKOFFICE_HTTP_PORT=8081
BACKOFFICE_ADMIN_EMAILS=you@example.com
```

## Checks

```sh
# Go
cd server
test -z "$(gofmt -l .)"
go vet ./...
go test -race ./...

# Web
cd web
bun run lint
bun run build
```

## Documentation

Developer documentation lives in `docs/`, including the OpenAPI contract in `docs/openapi.json`. Public examples use team-scoped bearer tokens and should remain synchronized with the registered Go routes.

The delivery worker uses an explicit fail-fast component policy: an unexpected exit from the outbox relay, a delivery consumer, domain reconciliation, or the worker health server cancels the other components and terminates the process for orchestration-level restart. Its `/health` endpoint reports process liveness, while `/ready` requires PostgreSQL, JetStream, and every supervised component to be available.

## Security notes

- Never commit populated environment files or production credentials.
- Keep team tokens on trusted servers rather than browser or mobile clients.
- Keep the backoffice on private networks.

## License

MIT
