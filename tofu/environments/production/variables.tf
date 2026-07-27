variable "environment" {
  description = "Deployment environment name."
  type        = string

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "region" {
  description = "Primary region used by regional providers."
  type        = string
}

variable "network_cidr" {
  description = "Private CIDR shared by internal services."
  type        = string
}

variable "public_ingress_cidrs" {
  description = "CIDRs allowed to access public entry points."
  type        = set(string)
  default     = ["0.0.0.0/0", "::/0"]
}

variable "server_instance_size" { type = string }
variable "server_replicas" { type = number }
variable "server_container_image" { type = string }
variable "database_instance_size" { type = string }
variable "database_version" { type = string }
variable "database_backup_retention_days" { type = number }
variable "redis_instance_size" { type = string }
variable "redis_high_availability" { type = bool }
variable "storage_retention_days" { type = number }
variable "storage_versioning_enabled" { type = bool }
variable "identity_container_image" { type = string }
variable "identity_cpu" { type = number }
variable "identity_memory_mb" { type = number }
variable "identity_gpu_enabled" { type = bool }
