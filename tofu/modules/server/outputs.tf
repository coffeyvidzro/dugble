output "instance_ids" { value = contabo_instance.this[*].id }
output "instance_names" { value = contabo_instance.this[*].name }
output "ip_configuration" { value = contabo_instance.this[*].ip_config }
output "firewall_id" { value = contabo_firewall.this.id }
