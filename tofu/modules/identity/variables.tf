variable "environment" { type = string }
variable "network_cidr" { type = string }
variable "container_image" { type = string }
variable "cpu" {
  type = number
  validation {
    condition     = var.cpu > 0
    error_message = "Identity CPU allocation must be greater than zero."
  }
}
variable "memory_mb" {
  type = number
  validation {
    condition     = var.memory_mb >= 256
    error_message = "Identity memory allocation must be at least 256 MB."
  }
}
variable "gpu_enabled" {
  type    = bool
  default = false
}
