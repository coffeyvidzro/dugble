variable "environment" { type = string }
variable "network_cidr" { type = string }
variable "engine_version" {
  description = "PostgreSQL major version."
  type        = string
  default     = "17"
}
variable "instance_size" { type = string }
variable "backup_retention_days" {
  type = number
  validation {
    condition     = var.backup_retention_days >= 0 && var.backup_retention_days <= 35
    error_message = "Backup retention must be between 0 and 35 days."
  }
}
