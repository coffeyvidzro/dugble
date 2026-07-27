# Dugble Infrastructure as Code (IaC)

Dugble uses [OpenTofu](https://opentofu.org/) to define, provision, and maintain its cloud infrastructure as code.

This directory contains the reusable modules and the single production root configuration used to operate Dugble.

> **Status:** The first cloud deployment provisions Contabo VPS instances and firewalls, a private Cloudflare R2 bucket with lifecycle rules, and a Git-connected Vercel project with its domains.

## Infrastructure overview

Dugble uses a hybrid deployment model:

- **Backend:** Hosted on a Contabo VPS, including the Go API server, background workers, and supporting runtime services.
- **Identity AI:** Deployed as a private Python service and accessible only by the Dugble backend.
- **Frontend:** Hosted on Vercel as a Next.js web application.
- **Database:** PostgreSQL for application and identity-verification records.
- **Cache and queues:** Redis for caching, rate limiting, asynchronous work, and temporary state.
- **Storage:** Cloudflare R2 private object storage for uploads, identity documents, selfies, liveness videos, and other protected media.

```text
Users
  |
  v
Vercel
Next.js frontend
  |
  v
Contabo VPS
Docker Compose
  |
  +--> Go API and worker
  +--> Identity service
  +--> PostgreSQL
  +--> Redis
  +--> NATS JetStream
  +--> Caddy
  +--> Cloudflare R2
```

The identity AI service must not be exposed directly to the public internet. Requests should flow through the Go API, which owns authentication, authorization, verification state, policy decisions, and audit logging.

## Directory structure

```text
tofu/
├── main.tf            # Single production deployment composition
├── providers.tf       # Provider configuration
├── variables.tf       # Deployment inputs
├── outputs.tf         # Provisioned resource metadata
├── versions.tf        # OpenTofu and provider constraints
├── backend.tf         # State backend configuration
├── terraform.tfvars.example
├── modules/
│   ├── r2_bucket/     # Cloudflare R2 bucket and lifecycle policies
│   ├── server/        # Contabo VPS and cloud firewall
│   └── vercel/        # Vercel frontend project and domains
│
└── README.md
```

## Module responsibilities

### `r2_bucket`

Defines a private Cloudflare R2 bucket for application uploads and protected identity media.

R2 resources should use:

- private access by default
- encryption at rest
- short-lived signed access
- retention and deletion policies
- restricted service identities

### `vercel`

Defines stable Vercel frontend configuration, including the project name, framework preset, repository root directory, production branch, and environment-specific domains. Git integration remains responsible for deployments.

### `server`

Defines the Contabo VPS instances, cloud-init bootstrap configuration, and cloud firewall. Application processes and data services running on the VPS are owned by Docker Compose rather than OpenTofu.

## Responsibility boundary

OpenTofu creates or records the VPS, configures cloud firewall rules, manages DNS, Cloudflare R2, and Vercel resources, and outputs infrastructure information.

Docker Compose owns the Go API, worker, identity service, PostgreSQL, Redis, NATS JetStream, and Caddy runtime services. OpenTofu must not model those containers as cloud resources.

## Root configuration

Dugble has one OpenTofu deployment. The root of this directory composes the reusable modules directly and contains:

```text
main.tf
providers.tf
variables.tf
outputs.tf
versions.tf
backend.tf
terraform.tfvars.example
```

The root configuration pins OpenTofu to the `1.12.x` release line and uses locked versions of the official Contabo, Cloudflare, and Vercel providers. The provider lock file is committed for reproducible installation.

Do not commit real `terraform.tfvars`, credentials, API tokens, private keys, or generated state files.

## Prerequisites

Install OpenTofu and verify the installation:

```sh
tofu version
```

Provider credentials should be supplied using environment variables, CI secrets, or a dedicated secrets manager.

The first deployment expects these provider environment variables:

```sh
export CNTB_OAUTH2_CLIENT_ID=...
export CNTB_OAUTH2_CLIENT_SECRET=...
export CNTB_OAUTH2_USER=...
export CNTB_OAUTH2_PASS=...
export CLOUDFLARE_API_TOKEN=...
export VERCEL_API_TOKEN=...
```

The Cloudflare token needs `Workers R2 Storage Write`. Replace all account-specific placeholders in `terraform.tfvars` before planning. In particular, use Contabo product, image, and SSH-key secret IDs from the same account. Restrict `ssh_ingress_cidrs` to trusted administrator addresses; never expose SSH to the entire internet.

## Common workflow

Run OpenTofu from its single root configuration:

```sh
cd tofu
```

Create a local values file from the safe example and adjust it for your deployment:

```sh
cp terraform.tfvars.example terraform.tfvars
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

Use an encrypted remote backend with locking before this production infrastructure is shared or automated.

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

- Keep the single root composition small and delegate resource groups to modules.
- Pin OpenTofu and provider versions.
- Commit provider lock files.
- Review every plan before applying it.
- Keep backend and identity services containerized.
- Expose only the services that must be public.
- Encrypt data in transit and at rest.
- Never store identity datasets or uploaded identity media in OpenTofu state.
- Prefer reversible and incremental infrastructure changes.

## Planned work

The remaining implementation will focus on:

1. Contabo private networking and server bootstrapping.
2. Vercel environment variables and Cloudflare DNS records.
3. Cloudflare R2 application credentials and CORS policy.
4. Additional Cloudflare R2 access policies.
5. Remote state and CI-based plan/apply workflows.
6. VPS monitoring, backups, and disaster-recovery configuration.

## Contributing

Before submitting infrastructure changes:

```sh
tofu fmt -recursive
tofu validate
```

Include the relevant `tofu plan` output in the pull request description, excluding secrets or sensitive values. Infrastructure changes should be small, reviewable, and scoped to a single purpose whenever possible.
