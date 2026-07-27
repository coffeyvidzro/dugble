variable "environment" {
  description = "Stable deployment name used in resource names."
  type        = string
  default     = "production"

  validation {
    condition     = var.environment == "production"
    error_message = "The single Dugble deployment must be named production."
  }
}

variable "public_ingress_cidrs" {
  description = "CIDRs allowed to access public entry points."
  type        = set(string)
  default     = ["0.0.0.0/0", "::/0"]
}

variable "server_replicas" { type = number }
variable "cloudflare_account_id" { type = string }
variable "r2_bucket_name" { type = string }
variable "r2_location" { type = string }
variable "r2_jurisdiction" { type = string }
variable "r2_storage_class" { type = string }
variable "r2_retention_days" { type = number }
variable "vercel_project_name" { type = string }
variable "vercel_git_repository" { type = string }
variable "vercel_root_directory" { type = string }
variable "vercel_production_branch" { type = string }
variable "vercel_domains" { type = set(string) }

variable "contabo_product_id" { type = string }
variable "contabo_region" { type = string }
variable "contabo_contract_period" { type = number }
variable "contabo_image_id" { type = string }
variable "contabo_ssh_key_ids" { type = list(number) }
variable "server_cloud_init" {
  type      = string
  sensitive = true
}
variable "public_tcp_ports" { type = set(number) }
variable "ssh_ingress_cidrs" { type = set(string) }
variable "vercel_team" {
  type    = string
  default = null
}
