variable "customer_name" {
  description = "Name of the customer (used for resource naming/tagging)"
  type        = string
}

variable "region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-southeast-2"
}

variable "vpc_cidr" {
  description = "CIDR block for the customer's vpc"
  type        = string
}

variable "subnet_cidr" {
  description = "CIDR block for the VM subnet"
  type        = string
}

variable "subnet_cidr_db" {
  description = "CIDR block for the other subnet needed for db"
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

variable "db_name" {
  type    = string
  default = "app"
}

variable "db_username" {
  type    = string
  default = "pgadmin"
}

variable "db_password" {
  description = "Admin password for PostgreSQL"
  type        = string
  sensitive   = true
}
