terraform {
  required_version = "~> 1.12.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.22.0"
    }
    contabo = {
      source  = "contabo/contabo"
      version = "~> 0.1.44"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 5.5.0"
    }
  }
}
