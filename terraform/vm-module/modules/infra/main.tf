resource "aws_vpc" "customer" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "vpc-${var.customer_name}"
  }
}

resource "aws_subnet" "customer" {
  vpc_id                  = aws_vpc.customer.id
  cidr_block              = var.subnet_cidr
  map_public_ip_on_launch = true # instances in this subnet get a public ip by default
  availability_zone       = "${var.region}a"

  tags = {
    Name = "subnet-${var.customer_name}"
  }
}

# need another subnet for RDS in different AZ, even if single AZ instance
resource "aws_subnet" "customer_db" {
  vpc_id            = aws_vpc.customer.id
  cidr_block        = var.subnet_cidr_db
  availability_zone = "${var.region}b"

  tags = {
    Name = "subnet-${var.customer_name}-db"
  }
}

resource "aws_internet_gateway" "customer" {
  vpc_id = aws_vpc.customer.id

  tags = {
    Name = "igw-${var.customer_name}"
  }
}

resource "aws_route_table" "customer" {
  vpc_id = aws_vpc.customer.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.customer.id
  }

  tags = {
    Name = "rt-${var.customer_name}"
  }
}

resource "aws_route_table_association" "customer" {
  subnet_id      = aws_subnet.customer.id
  route_table_id = aws_route_table.customer.id
}

resource "aws_security_group" "customer" {
  name        = "${var.customer_name}-sg"
  description = "allow SSH inbound"
  vpc_id      = aws_vpc.customer.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.customer_name}-sg"
  }

}

resource "aws_key_pair" "customer" {
  key_name   = "${var.customer_name}-key"
  public_key = var.ssh_public_key
}

data "aws_ami" "customer" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "customer" {
  ami                    = data.aws_ami.customer.id
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.customer.id
  vpc_security_group_ids = [aws_security_group.customer.id]
  key_name               = aws_key_pair.customer.key_name

  root_block_device {
    volume_type = "gp2"
    volume_size = 30
  }

  tags = {
    Name = "vm-${var.customer_name}"
  }
}

resource "aws_eip" "customer" {
  instance = aws_instance.customer.id
  domain   = "vpc"

  tags = {
    Name = "eip-${var.customer_name}"
  }
}

# RDS
resource "aws_db_subnet_group" "customer" {
  name       = "${var.customer_name}-db-subnet-group"
  subnet_ids = [aws_subnet.customer.id, aws_subnet.customer_db.id]

  tags = {
    Name = "${var.customer_name}-db-subnet-group"
  }
}

resource "aws_security_group" "customer_db" {
  name        = "${var.customer_name}-db-sg"
  description = "Allow postgres inbound"
  vpc_id      = aws_vpc.customer.id

  ingress {
    description     = "postgres from vm"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.customer.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.customer_name}-db-sg"
  }
}

resource "aws_db_instance" "customer" {
  identifier             = "${var.customer_name}-pg"
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  max_allocated_storage  = 100
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.customer.name
  vpc_security_group_ids = [aws_security_group.customer_db.id]
  skip_final_snapshot    = true
  publicly_accessible    = false

  tags = {
    Name = "db-${var.customer_name}"
  }
}
