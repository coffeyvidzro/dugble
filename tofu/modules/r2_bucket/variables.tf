variable "account_id" {
  description = "Cloudflare account ID that owns the R2 bucket."
  type        = string
}
variable "bucket_name" {
  description = "Globally unique R2 bucket name."
  type        = string
  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$", var.bucket_name))
    error_message = "R2 bucket name must be 3-63 lowercase letters, digits, or hyphens."
  }
}
variable "location" {
  description = "Cloudflare R2 location hint."
  type        = string
  default     = "WEUR"
  validation {
    condition     = contains(["WNAM", "ENAM", "WEUR", "EEUR", "APAC", "OC"], var.location)
    error_message = "R2 location must be WNAM, ENAM, WEUR, EEUR, APAC, or OC."
  }
}
variable "jurisdiction" {
  description = "Data jurisdiction guaranteed by Cloudflare."
  type        = string
  default     = "eu"
  validation {
    condition     = contains(["default", "eu", "fedramp"], var.jurisdiction)
    error_message = "R2 jurisdiction must be default, eu, or fedramp."
  }
}
variable "storage_class" {
  type    = string
  default = "Standard"
  validation {
    condition     = contains(["Standard", "InfrequentAccess"], var.storage_class)
    error_message = "R2 storage class must be Standard or InfrequentAccess."
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
