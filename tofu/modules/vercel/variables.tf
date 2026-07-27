variable "environment" {
  description = "Deployment environment name."
  type        = string

  validation {
    condition     = contains(["preview", "production"], var.environment)
    error_message = "Environment must be preview or production."
  }
}

variable "project_name" {
  description = "Stable Vercel project name."
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9._-]{0,99}$", var.project_name))
    error_message = "Vercel project name must contain only lowercase letters, digits, dots, underscores, and hyphens."
  }
}

variable "framework" {
  description = "Vercel framework preset."
  type        = string
  default     = "nextjs"
}

variable "root_directory" {
  description = "Frontend path relative to the repository root."
  type        = string
  default     = "web"
}

variable "production_branch" {
  description = "Git branch Vercel treats as production."
  type        = string
  default     = "main"
}

variable "domains" {
  description = "Domains attached to the Vercel project in this environment."
  type        = set(string)
  default     = []

  validation {
    condition     = alltrue([for domain in var.domains : can(regex("^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$", domain))])
    error_message = "Every Vercel domain must be a valid lowercase DNS name."
  }
}

variable "git_provider" {
  description = "Git provider connected to Vercel."
  type        = string
  default     = "github"
  validation {
    condition     = contains(["github", "gitlab", "bitbucket"], var.git_provider)
    error_message = "Git provider must be github, gitlab, or bitbucket."
  }
}

variable "git_repository" {
  description = "Repository in owner/name format."
  type        = string
  validation {
    condition     = can(regex("^[^/]+/[^/]+$", var.git_repository))
    error_message = "Git repository must use owner/name format."
  }
}

variable "wait_for_domains" {
  description = "Wait for Vercel to verify configured domains."
  type        = bool
  default     = true
}
