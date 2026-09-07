terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "ap-southeast-2"
}

# Customer 1: CATO Corporation
module "cato" {
  source = "./modules/infra"

  customer_name           = "cato"
  location                = "ap-southeast-2"
  vpc_cidr                = "10.1.0.0/16"
  ssh_public_key          = file("~/.ssh/mercury.pub")
  postgres_admin_password = "CatoP@ssw0rd123!"
}

# Customer 2: Cicero Ltd
# module "cicero" {
#   source = "./modules/infra"
#
#   customer_name           = "cicero"
#   location                = "northeurope"
#   vpc_cidr                = "10.2.0.0/16"
#   ssh_public_key          = file("~/.ssh/mercury.pub")
#   postgres_admin_password = "CiceroP@ssw0rd123!"
# }

# Outputs for Customer 1
output "cato_vm_ip" {
  description = "CATO VM public IP"
  value       = module.cato.vm_public_ip
}

output "cato_ssh" {
  description = "CATO SSH connection"
  value       = module.cato.ssh_connection
}

output "cato_postgres" {
  description = "CATO PostgreSQL FQDN"
  value       = module.cato.postgres_fqdn
}

# # Outputs for Customer 2
# output "cicero_vm_ip" {
#   description = "Cicero VM public IP"
#   value       = module.cicero.vm_public_ip
# }
#
# output "cicero_ssh" {
#   description = "Cicero SSH connection"
#   value       = module.cicero.ssh_connection
# }
#
# output "cicero_postgres" {
#   description = "Cicero PostgreSQL FQDN"
#   value       = module.cicero.postgres_fqdn
# }

