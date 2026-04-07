## Get the ECS EC2 Optimized AMI

https://docs.aws.amazon.com/AmazonECS/latest/developerguide/retrieve-ecs-optimized_AMI.html

```sh
aws ssm get-parameters --names /aws/service/ecs/optimized-ami/amazon-linux-2023/recommended --region us-east-1
```
> Swap the region for your usecase

## Create the roles
Example for creating the service execution role and attaching policy. The task execution role also is needed.

```sh
 aws iam put-role-policy --role-name EscEc2BasicServiceExecutionRole --policy-name task-policy --policy-document file://policies/execution-policy.json

 aws iam put-role-policy --role-name EscEc2BasicServiceExecutionRole --policy-name task-policy --policy-document file://policies/execution.json
```

## Create Log Group

aws logs create-log-group --log-group-name ecs-ec2-basic

## Create our Task Def

aws ecs register-task-definition --cli-input-json file://task-def.json

## Deploy Container

aws ecs create-service --cli-input-json file://serv.json
