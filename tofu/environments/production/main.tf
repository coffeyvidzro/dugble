module "network" {
  source = "../../modules/network"

  environment          = var.environment
  network_cidr         = var.network_cidr
  public_ingress_cidrs = var.public_ingress_cidrs
}

module "database" {
  source = "../../modules/database"

  environment           = var.environment
  network_cidr          = module.network.configuration.cidr
  engine_version        = var.database_version
  instance_size         = var.database_instance_size
  backup_retention_days = var.database_backup_retention_days
}

module "redis" {
  source = "../../modules/redis"

  environment       = var.environment
  network_cidr      = module.network.configuration.cidr
  instance_size     = var.redis_instance_size
  high_availability = var.redis_high_availability
}

module "r2_bucket" {
  source = "../../modules/r2_bucket"

  environment    = var.environment
  location       = var.r2_location
  retention_days = var.r2_retention_days
}

module "server" {
  source = "../../modules/server"

  environment     = var.environment
  network_cidr    = module.network.configuration.cidr
  instance_size   = var.server_instance_size
  replicas        = var.server_replicas
  container_image = var.server_container_image
}

module "identity" {
  source = "../../modules/identity"

  environment     = var.environment
  network_cidr    = module.network.configuration.cidr
  container_image = var.identity_container_image
  cpu             = var.identity_cpu
  memory_mb       = var.identity_memory_mb
  gpu_enabled     = var.identity_gpu_enabled
}

module "vercel" {
  source = "../../modules/vercel"

  environment       = var.environment
  project_name      = var.vercel_project_name
  root_directory    = var.vercel_root_directory
  production_branch = var.vercel_production_branch
  domains           = var.vercel_domains
}
