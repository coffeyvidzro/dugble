output "configuration" {
  description = "Validated Vercel project settings for provider resources."
  value = {
    environment       = var.environment
    project_name      = var.project_name
    framework         = var.framework
    root_directory    = var.root_directory
    production_branch = var.production_branch
    domains           = var.domains
  }
}
