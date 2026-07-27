variable "environment" { type = string }
variable "network_cidr" { type = string }
variable "instance_size" { type = string }
variable "high_availability" {
  type    = bool
  default = false
}
