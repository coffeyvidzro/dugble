resource "contabo_instance" "this" {
  count = var.replicas

  display_name = "dugble-${var.environment}-${count.index + 1}"
  product_id   = var.product_id
  region       = var.region
  period       = var.contract_period
  image_id     = var.image_id
  default_user = "root"
  ssh_keys     = var.ssh_key_ids
  user_data    = var.cloud_init
}

resource "contabo_firewall" "this" {
  name         = "dugble-${var.environment}"
  description  = "Managed ingress for Dugble ${var.environment}"
  status       = "active"
  instance_ids = toset([for instance in contabo_instance.this : tonumber(instance.id)])

  rules {
    dynamic "inbound" {
      for_each = length(var.public_ipv4_cidrs) + length(var.public_ipv6_cidrs) > 0 ? [1] : []
      content {
        protocol   = "tcp"
        action     = "accept"
        status     = "active"
        dest_ports = [for port in var.public_tcp_ports : tostring(port)]
        src_cidr {
          ipv4 = var.public_ipv4_cidrs
          ipv6 = var.public_ipv6_cidrs
        }
      }
    }

    dynamic "inbound" {
      for_each = length(var.ssh_ipv4_cidrs) + length(var.ssh_ipv6_cidrs) > 0 ? [1] : []
      content {
        protocol   = "tcp"
        action     = "accept"
        status     = "active"
        dest_ports = ["22"]
        src_cidr {
          ipv4 = var.ssh_ipv4_cidrs
          ipv6 = var.ssh_ipv6_cidrs
        }
      }
    }
  }
}
