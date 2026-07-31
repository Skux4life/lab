# Secure s3 Stack

## Key points
1. `BucketKeyEnabled: true`
When using `SSE-KMS` every time an object is retrieved (GetObject) or updated/added (PutObject) AWS will need to send a request to AWS KMS. Either `kms:GenerateDataKey` or `kms:Decrypt`. This can get extremely expensive if this happens a lot (at scale). By enabling a Bucket Key this means s3 will create a bucket-level key (time-limited). This drastically reduces the requests to KMS. Big savings!

2. `DeletionPolicy: retain`
Good practice in case the CloudFormation stack ever gets accidently deleted.

3. `aws:SecureTransport: false`
This stack makes sure to block public access (HTTP/S). For the users of a our bucket we also want to make sure that encryption in transit is enforced. By adding a policy with an explicit __Deny__ on `aws:SecureTrasnport: false` this blocks any HTTP requests.

4. Abort Incomplete Multipart Upload
This is a lifecycle rule that takes into account that large file uploads can fail part of the way through. Depending on how the client application handles this it can result in hidden object parts sitting in the bucket. This has a storage cost. Enabling an automated rule to cleanup these objects after 7 days is a good practice.
