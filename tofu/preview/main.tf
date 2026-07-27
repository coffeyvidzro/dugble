module "r2_bucket" {
  source = "../modules/r2_bucket"

  account_id     = var.cloudflare_account_id
  bucket_name    = var.r2_bucket_name
  location       = var.r2_location
  jurisdiction   = var.r2_jurisdiction
  storage_class  = var.r2_storage_class
  retention_days = var.r2_retention_days
}

module "server" {
  source = "../modules/server"

  environment       = var.environment
  product_id        = var.contabo_product_id
  region            = var.contabo_region
  contract_period   = var.contabo_contract_period
  image_id          = var.contabo_image_id
  ssh_key_ids       = var.contabo_ssh_key_ids
  replicas          = var.server_replicas
  cloud_init        = var.server_cloud_init
  public_tcp_ports  = var.public_tcp_ports
  public_ipv4_cidrs = toset([for cidr in var.public_ingress_cidrs : cidr if !strcontains(cidr, ":")])
  public_ipv6_cidrs = toset([for cidr in var.public_ingress_cidrs : cidr if strcontains(cidr, ":")])
  ssh_ipv4_cidrs    = toset([for cidr in var.ssh_ingress_cidrs : cidr if !strcontains(cidr, ":")])
  ssh_ipv6_cidrs    = toset([for cidr in var.ssh_ingress_cidrs : cidr if strcontains(cidr, ":")])
}

module "vercel" {
  source = "../modules/vercel"

  environment       = var.environment
  project_name      = var.vercel_project_name
  git_repository    = var.vercel_git_repository
  root_directory    = var.vercel_root_directory
  production_branch = var.vercel_production_branch
  domains           = var.vercel_domains
}
