output "project_id" { value = vercel_project.this.id }
output "project_name" { value = vercel_project.this.name }
output "domains" {
  value = { for domain, resource in vercel_project_domain.this : domain => {
    id       = resource.id
    verified = resource.verified
  } }
}
