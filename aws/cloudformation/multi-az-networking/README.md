# Multi-az networking cloudformation template

## Features
### Dyanmic AZ assignment
Dynamic AZ assignment eg: `!Select [0, !GetAZs '' ]` means this template can work in any region, no hardcoded values. Fn::GetAZs will return an ordered list of all the availability zones in the region for the AWS account being used.
- Keep in mind using an index (say 3) in a region with only 3 AZs will result in a failure (template uses 0 and 1)
- The order of the array returned by `!GetAZs` typically stays the same. However it's possible AWS could change this order and since the `AvailabilityZone` property of an `AWS::EC2::Subnet` is immutable, this will cause a replacement (delete and create new).

### High availablity
There are 2 distinct NAT Gateways and private route tables. It's possible to use one NAT Gateway for both private subnets. This will save cost. However, if an AZ goes down (the one the NAT Gateway is in) then resources in both the private subnets won't be able to reach the internet.

### Avoid race condition
Cloudformation by default builds everything in parallel unless intrinsic functions `!Ref or !GetAtt` or explicitly use `DependsOn`.
NAT Gateway must have an active route to the internet upon creation. If not the deployment will fail.
Nothing explicitly ties the NatGateway with the VPCGatewayAttachment, but the NAT Gateway needs this otherwise it won't have an active internet connection.
`DependsOn` is used with Elastic IP for the VPCGatewayAttachment that the NAT Gateway needs. The NAT Gateway depends on the Elastic IP via `!GetAtt` 
