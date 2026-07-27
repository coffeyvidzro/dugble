variable "environment" { type = string }
variable "region" { type = string }
variable "retention_days" {
  type = number
  validation {
    condition     = var.retention_days > 0
    error_message = "Storage retention must be at least one day."
  }
}
variable "versioning_enabled" {
  type    = bool
  default = true
}
