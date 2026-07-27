resource "vercel_project" "this" {
  name                = var.project_name
  framework           = var.framework
  root_directory      = var.root_directory
  git_fork_protection = true

  git_repository = {
    type              = var.git_provider
    repo              = var.git_repository
    production_branch = var.production_branch
  }
}

resource "vercel_project_domain" "this" {
  for_each = var.domains

  project_id     = vercel_project.this.id
  domain         = each.value
  wait_for_ready = var.wait_for_domains
}
