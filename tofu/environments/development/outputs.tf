output "infrastructure_configuration" {
  description = "Validated, provider-neutral configuration composed for this environment."
  value = {
    network  = module.network.configuration
    database = module.database.configuration
    redis    = module.redis.configuration
    storage  = module.storage.configuration
    server   = module.server.configuration
    identity = module.identity.configuration
  }
}
