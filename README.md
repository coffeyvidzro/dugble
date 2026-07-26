# dugble

dugble is a lightweight Go HTTP server for multi-tenant identity and team management. It provides browser authentication, user profiles, team membership workflows, scoped team tokens, and security middleware.

## Architecture

```text
Client applications
        |
        v
HTTP API :8080 (Echo v5)
        |
        v
Authentication, CSRF/CORS/security middleware,
tenant resolution, and permission checks
        |
        v
PostgreSQL
```

PostgreSQL stores users, sessions, verification tokens, teams, memberships, team invitations, and team tokens.

## Repository layout

```text
cmd/
└── server/                         # HTTP server entrypoint

internal/
├── config/                         # Environment loading and normalization
├── database/                       # PostgreSQL setup and SQLC-generated data access
├── integration/
│   ├── email/                      # AWS SES email integration
│   └── security/                   # Arcjet client integration
├── modules/                        # Identity, users, teams, sessions, and team tokens
├── notifications/                  # Account and team notification templates
├── platform/                       # Auth, tenant, and shared helpers
└── transport/                      # Router and HTTP middleware

pkg/
├── errors/                         # Application error types
├── httputil/                       # HTTP response helpers
├── pgconv/                         # pgtype conversion helpers
└── ptr/                            # Pointer helpers
```

## Features

- Echo v5 HTTP API
- User registration, login, logout, and profile management
- Email verification and password reset flows
- Session listing and revocation
- Team creation and membership management
- Team invitation accept/decline workflows
- Scoped team token creation, update, listing, and revocation
- Tenant context and permission checks
- CSRF, CORS, secure headers, request IDs, panic recovery, and Arcjet request protection
- PostgreSQL persistence through `pgx` and SQLC
- Docker and Caddy local runtime support

## Email pricing

Planned launch pricing for Dugble's transactional email API:

| Plan | Monthly price | Included emails | Overage | Sending domains |
| --- | ---: | ---: | ---: | ---: |
| Free | $0 | 1,000 | No overage | 1 |
| Developer | $29 | 50,000 | $1.00 per additional 1,000 | 5 |
| Pro | $59 | 100,000 | $0.80 per additional 1,000 | 25 |
| Scale | $349 | 500,000 | $0.60 per additional 1,000 | 100 |

Need more than 500,000 emails per month? Contact Dugble for custom pricing.

Email usage is counted per recipient. One message sent to ten recipients counts as ten emails. Paid overage is billed in blocks of 1,000 emails. Pricing is provisional and may change before public launch.

## Local development

### Requirements

- Go
- Docker and Docker Compose
- PostgreSQL when not using Docker
- Arcjet key for request protection
- AWS SES sender credentials for transactional email

### Environment

Copy the example environment file and fill in required values:

```sh
cp .env.example .env
```

The server requires PostgreSQL, Arcjet, and AWS SES email configuration at startup.

### Docker Compose

```sh
make up
make logs
make down
```

### Run locally

```sh
go run ./cmd/server
```

### Backoffice

The backoffice is a separate, intentionally simple internal web server for
read-only operational checks. It reuses the normal Dugble session cookie and
then restricts access to emails listed in `BACKOFFICE_ADMIN_EMAILS`.

To run it locally:

```sh
BACKOFFICE_ADMIN_EMAILS=you@example.com go run ./server/cmd/backoffice
```

Then sign in as that user through the normal Dugble app/API flow and open:

```text
http://localhost:8081
```

Useful configuration:

```env
BACKOFFICE_HTTP_PORT=8081
BACKOFFICE_ADMIN_EMAILS=you@example.com
```

### Checks

```sh
gofmt -w .
go test ./...
go vet ./...
```

## Tech stack

- [Go](https://go.dev/)
- [Echo v5](https://echo.labstack.com/)
- [SQLC](https://sqlc.dev/)
- [PostgreSQL](https://www.postgresql.org/)
- [Caddy](https://caddyserver.com/)
- [Docker](https://www.docker.com/)
- [Atlas](https://atlasgo.io/)
- [Arcjet](https://arcjet.com/)
- [Amazon SES](https://aws.amazon.com/ses/)
