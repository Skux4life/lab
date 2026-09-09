output "vm_public_ip" {
  description = "Public IP address of the VM"
  value       = aws_eip.customer.public_ip
}

output "postgres_fqdn" {
  description = "FQDN of the PostgresSQL server"
  value       = aws_db_instance.customer.endpoint
}

output "ssh_connection" {
  description = "SSH connection command"
  value       = "ssh ${var.admin_username}@${aws_eip.customer.public_ip}"
}
