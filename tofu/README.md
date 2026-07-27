# Dugble Infrastructure as Code (IaC)

Dugble uses [OpenTofu](https://opentofu.org/) to define, provision, and maintain its cloud infrastructure as code.

This directory contains the reusable modules and environment-specific configuration required to operate Dugble consistently across development, staging, and production.

> **Status:** This is an early infrastructure scaffold. The modules and environments will be implemented incrementally as the deployment architecture is finalized.

## Infrastructure overview

Dugble uses a hybrid deployment model:

- **Backend:** Hosted on a Contabo VPS, including the Go API server, background workers, and supporting runtime services.
- **Identity AI:** Deployed as a private Python service and accessible only by the Dugble backend.
- **Frontend:** Hosted on Vercel as a Next.js web application.
- **Database:** PostgreSQL for application and identity-verification records.
- **Cache and queues:** Redis for caching, rate limiting, asynchronous work, and temporary state.
- **Storage:** Private object storage for uploads, identity documents, selfies, liveness videos, and other protected media.

```text
Users
  |
  v
Vercel
Next.js frontend
  |
  v
Contabo VPS
Go API and workers
  |
  +--> PostgreSQL
  +--> Redis
  +--> Private object storage
  +--> Private identity AI service
```

The identity AI service must not be exposed directly to the public internet. Requests should flow through the Go API, which owns authentication, authorization, verification state, policy decisions, and audit logging.

## Directory structure

```text
tofu/
├── modules/
│   ├── network/       # Networking, firewall rules, and private service access
│   ├── database/      # PostgreSQL infrastructure and configuration
│   ├── redis/         # Redis infrastructure and access controls
│   ├── storage/       # Private object storage and lifecycle policies
│   ├── server/        # Contabo VPS and Dugble backend runtime
│   └── identity/      # Private identity AI runtime and service networking
│
├── environments/
│   ├── development/   # Development infrastructure
│   ├── staging/       # Pre-production validation environment
│   └── production/    # Production infrastructure
│
└── README.md
```

## Module responsibilities

### `network`

Defines shared networking and security boundaries, including:

- allowed ingress and egress rules
- internal service communication
- public API exposure
- restricted database, Redis, storage, and AI access

### `database`

Defines PostgreSQL resources and operational settings, including:

- database provisioning
- network access rules
- backups and retention
- connection outputs

Database passwords and connection strings must be supplied through a secrets manager or CI environment and must never be committed to the repository.

### `redis`

Defines Redis resources used for caching, rate limiting, queues, idempotency, and short-lived application state.

### `storage`

Defines private object storage for application uploads and protected identity media.

Storage resources should use:

- private access by default
- encryption at rest
- short-lived signed access
- retention and deletion policies
- restricted service identities

### `server`

Defines the Contabo VPS and the runtime required by the Dugble backend, such as:

- the Go API server
- background workers
- container runtime configuration
- service networking
- logging and monitoring

### `identity`

Defines the runtime for the private Python identity AI service.

This module should ensure that:

- the service is not publicly reachable
- only authorized backend services can call it
- model and media access is restricted
- CPU, memory, and optional GPU resources are configurable
- health checks and logs are available

## Environments

Each environment should compose the shared modules with environment-specific values.

```text
development
  Small, low-cost resources for active development.

staging
  Production-like infrastructure for integration and release testing.

production
  Hardened infrastructure with stricter access, backups, monitoring, and retention.
```

Environment directories will typically contain:

```text
main.tf
providers.tf
variables.tf
outputs.tf
versions.tf
backend.tf
terraform.tfvars.example
```

Do not commit real `terraform.tfvars`, credentials, API tokens, private keys, or generated state files.

## Prerequisites

Install OpenTofu and verify the installation:

```sh
tofu version
```

Provider credentials should be supplied using environment variables, CI secrets, or a dedicated secrets manager.

## Common workflow

Run OpenTofu from the environment you want to manage:

```sh
cd tofu/environments/development
```

Initialize the working directory:

```sh
tofu init
```

Format and validate the configuration:

```sh
tofu fmt -recursive
tofu validate
```

Review proposed changes:

```sh
tofu plan
```

Apply reviewed changes:

```sh
tofu apply
```

Destroy an environment only when explicitly intended:

```sh
tofu destroy
```

Production changes should be applied through CI after review rather than directly from a developer workstation.

## State management

OpenTofu state may contain sensitive infrastructure metadata. State files must not be stored in Git.

Use an encrypted remote backend with locking for shared environments. Development may begin with local state, but staging and production should use remote state before infrastructure is shared or automated.

Recommended ignored files:

```gitignore
.terraform/
*.tfstate
*.tfstate.*
*.tfplan
crash.log
*.auto.tfvars
terraform.tfvars
```

## Secrets

OpenTofu should provision secret stores and access policies, but secret values should not be hardcoded in `.tf` files.

Sensitive values include:

- Contabo credentials
- Vercel API tokens
- database credentials
- Redis credentials
- object-storage access keys
- application signing keys
- identity service credentials

Provide secrets through protected CI variables, environment variables, or a dedicated secrets manager.

## Vercel

OpenTofu may manage stable Vercel resources such as:

- the Dugble web project
- custom domains
- environment-variable references
- project-level configuration

Vercel's Git integration should continue to handle frequent preview and production frontend deployments. OpenTofu should manage infrastructure configuration rather than run for every frontend commit.

## Deployment principles

- Reuse modules across all environments.
- Keep environment differences in variables rather than duplicated resources.
- Pin OpenTofu and provider versions.
- Commit provider lock files.
- Review every plan before applying it.
- Keep backend and identity services containerized.
- Expose only the services that must be public.
- Encrypt data in transit and at rest.
- Never store identity datasets or uploaded identity media in OpenTofu state.
- Prefer reversible and incremental infrastructure changes.

## Planned work

The initial implementation will focus on:

1. OpenTofu version and provider configuration.
2. Contabo server provisioning and firewall rules.
3. Vercel project and domain configuration.
4. PostgreSQL and Redis deployment.
5. Private object storage and access policies.
6. Private identity AI service deployment.
7. Remote state and CI-based plan/apply workflows.
8. Monitoring, backups, and disaster-recovery configuration.

## Contributing

Before submitting infrastructure changes:

```sh
tofu fmt -recursive
tofu validate
```

Include the relevant `tofu plan` output in the pull request description, excluding secrets or sensitive values. Infrastructure changes should be small, reviewable, and scoped to a single purpose whenever possible.
