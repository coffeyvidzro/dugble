variable "environment" { type = string }
variable "network_cidr" { type = string }
variable "instance_size" { type = string }
variable "replicas" {
  type = number
  validation {
    condition     = var.replicas >= 1 && floor(var.replicas) == var.replicas
    error_message = "Server replicas must be a positive integer."
  }
}
variable "container_image" {
  type = string
  validation {
    condition     = trimspace(var.container_image) != ""
    error_message = "A server container image is required."
  }
}
