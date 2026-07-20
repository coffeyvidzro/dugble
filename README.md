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
