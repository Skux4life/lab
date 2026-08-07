A hello world lambda function CF template

Deploy
```bash
aws cloudformation deploy \
    --stack-name hello-lambda \
    --template-file template.yaml \
    --capabilities CAPABILITY_NAMED_IAM
```
