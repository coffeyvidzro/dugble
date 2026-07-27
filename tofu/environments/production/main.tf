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

module "storage" {
  source = "../../modules/storage"

  environment        = var.environment
  region             = var.region
  retention_days     = var.storage_retention_days
  versioning_enabled = var.storage_versioning_enabled
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
