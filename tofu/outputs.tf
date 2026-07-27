output "infrastructure" {
  description = "Identifiers and connection metadata for provisioned cloud resources."
  value = {
    r2 = {
      bucket_name = module.r2_bucket.bucket_name
      endpoint    = module.r2_bucket.s3_endpoint
    }
    server = {
      instance_ids     = module.server.instance_ids
      instance_names   = module.server.instance_names
      ip_configuration = module.server.ip_configuration
      firewall_id      = module.server.firewall_id
    }
    vercel = {
      project_id   = module.vercel.project_id
      project_name = module.vercel.project_name
      domains      = module.vercel.domains
    }
  }
}
