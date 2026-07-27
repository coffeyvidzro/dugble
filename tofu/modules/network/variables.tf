variable "environment" {
  description = "Deployment environment name."
  type        = string

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "network_cidr" {
  description = "Private network CIDR used by Dugble services."
  type        = string

  validation {
    condition     = can(cidrhost(var.network_cidr, 0))
    error_message = "Network CIDR must be a valid IPv4 or IPv6 CIDR."
  }
}

variable "public_ingress_cidrs" {
  description = "CIDRs allowed to reach public entry points."
  type        = set(string)
  default     = []

  validation {
    condition     = alltrue([for cidr in var.public_ingress_cidrs : can(cidrhost(cidr, 0))])
    error_message = "Every public ingress entry must be a valid CIDR."
  }
}
