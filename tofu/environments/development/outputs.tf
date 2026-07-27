output "infrastructure_configuration" {
  description = "Validated, provider-neutral configuration composed for this environment."
  value = {
    network   = module.network.configuration
    database  = module.database.configuration
    redis     = module.redis.configuration
    r2_bucket = module.r2_bucket.configuration
    server    = module.server.configuration
    identity  = module.identity.configuration
    vercel    = module.vercel.configuration
  }
}
