provider "cloudflare" {}
provider "contabo" {}
provider "vercel" {
  team = var.vercel_team
}
