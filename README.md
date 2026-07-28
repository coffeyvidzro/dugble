# Dugble

Dugble is a multi-tenant communications and identity platform for African startups and teams. It combines browser authentication, team-scoped API tokens, email and SMS delivery, webhooks, operational tooling, and an experimental private identity-analysis service.

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

Go API ---- private authenticated HTTP ----> Identity AI
```

The Go API owns authentication, tenant authorization, persistence, policy decisions, and public API contracts. Background workers deliver queued email, SMS, and webhook events. The Python identity service supplies measurements only; it must not make an authoritative identity decision.

## Repository layout

```text
web/                       # Next.js website and dashboard
server/                    # Go API, workers, backoffice, migrations, and tests
services/identity-ai/      # Private Python identity-analysis service
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
| Identity image-quality analysis | Implemented foundation |
| Document analysis, face matching, and liveness | Experimental stubs; not production-ready |

## Local development

### Requirements

- Go version declared in `server/go.mod`
- Bun version declared in `web/package.json`
- Python 3.14.6 and `uv` for `services/identity-ai`
- Docker and Docker Compose

### Environment

```sh
cp .env.example .env
```

Replace all placeholder secrets before starting the stack. The Compose environment expects PostgreSQL, Redis, NATS, Arcjet, AWS SES, and the private identity-service key.

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

# Identity AI
cd services/identity-ai
uv sync --locked --dev
uv run pytest
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Backoffice

The backoffice is an internal administrative application. It can inspect operational data and perform privileged mutations including team-status changes, SMS-pricing changes, wallet adjustments, sender-ID decisions, and domain-status decisions.

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

# Identity AI
cd services/identity-ai
uv run pytest
```

Email transaction integration tests require a migrated, disposable PostgreSQL database and are skipped when `TEST_DATABASE_URL` is unset:

```sh
cd server
TEST_DATABASE_URL='postgres://postgres:postgres@localhost:5432/dugble_test?sslmode=disable' \
  go test ./internal/modules/email -run 'Test(Send|Batch|Get)' -v
```

## Documentation

Developer documentation lives in `docs/`, including the OpenAPI contract in `docs/openapi.json`. Public examples use team-scoped bearer tokens and should remain synchronized with the registered Go routes.

The delivery worker uses an explicit fail-fast component policy: an unexpected exit from the outbox relay, a delivery consumer, domain reconciliation, or the worker health server cancels the other components and terminates the process for orchestration-level restart. Its `/health` endpoint reports process liveness, while `/ready` requires PostgreSQL, JetStream, and every supervised component to be available.

## Security notes

- Never commit populated environment files, production credentials, real identity documents, selfies, videos, or biometric artifacts.
- Keep team tokens on trusted servers rather than browser or mobile clients.
- Keep the identity-analysis service and backoffice on private networks.
- Use synthetic or fully redacted identity fixtures in this public repository.

## License

MIT
