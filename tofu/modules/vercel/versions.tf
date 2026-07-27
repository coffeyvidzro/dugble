terraform {
  required_version = "~> 1.12.0"
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 5.5.0"
    }
  }
}
