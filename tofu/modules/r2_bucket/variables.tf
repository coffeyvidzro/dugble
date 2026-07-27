variable "environment" { type = string }

variable "location" {
  description = "Cloudflare R2 location hint for the bucket."
  type        = string
  default     = "WEUR"

  validation {
    condition     = contains(["WNAM", "ENAM", "WEUR", "EEUR", "APAC", "OC"], var.location)
    error_message = "R2 location must be WNAM, ENAM, WEUR, EEUR, APAC, or OC."
  }
}

variable "retention_days" {
  description = "Days to retain protected uploads before lifecycle expiration."
  type        = number

  validation {
    condition     = var.retention_days > 0 && floor(var.retention_days) == var.retention_days
    error_message = "R2 retention must be a positive whole number of days."
  }
}
