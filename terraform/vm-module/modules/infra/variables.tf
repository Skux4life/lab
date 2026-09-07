variable "customer_name" {
  description = "Name of the customer (used for resource naming/tagging)"
  type        = string
}

variable "location" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-southeast-2"
}

variable "vpc_cidr" {
  description = "CIDR block for the customer's vpc"
  type        = string
}

variable "admin_username" {
  description = "Admin username for the VM"
  type        = string
  default     = "ubuntu"
}

variable "ssh_public_key" {
  description = "SSH public key for VM access"
  type        = string
}

variable "postgres_admin_password" {
  description = "Admin password for PostgreSQL"
  type        = string
  sensitive   = true
}
