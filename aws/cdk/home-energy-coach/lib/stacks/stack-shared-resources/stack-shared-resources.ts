import * as cdk from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_sns as sns } from "aws-cdk-lib";
import { aws_sns_subscriptions as subscriptions } from "aws-cdk-lib";
import { aws_dynamodb as dynamodb } from "aws-cdk-lib";
import { HecDynamoDbConstruct } from " ../../constructs/construct-hec-dynamodb/construct-hec-dynamodb";

export interface SharedResourcesStackProps extends cdk.StackProps {
  /**
   * Required: The email address to use for the SNS topic
   */
  readonly adminEmailAddress: string;
}

export class SharedResourcesStack extends cdk.Stack {
  /**
    * Constructor for the stack
    * @param {cdk.App} scope - The CDK application scope
    * @param {string} id - Stack ID
    * @param {SharedResourcesStackProps} props - Optional stack properties
    */

  public readonly rawDataUploadBucket: s3.Bucket;
  public readonly snsTopicRawUpload: sns.Topic;
  public readonly snsTopicCalculatorSummary: sns.Topic;
  public readonly calculatedEnergyTable: dynamodb.Table;

  constructor(scope: cdk.App, id: string, props: SharedResourcesStackProps) {
    super(scope, id, props);

    // Create raw landing bucket for S3
    this.rawDataUploadBucket = new s3.Bucket(this, "RawDataUploadBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(1)
        },
      ],
    });

    this.snsTopicRawUpload = new sns.Topic(this, "SnsTopicRawUpload", {
      displayName: "Home Energy Coach SNS Topic",
    });

    this.snsTopicRawUpload.addSubscription(
      new subscriptions.EmailSubscription(props.adminEmailAddress)
    );

    this.snsTopicCalculatorSummary = new sns.Topic(this, "SnsTopicCalculatorSummary", {
      displayName: "Home Energy Coach SNS Topic for calculator summary"
    });

    this.snsTopicCalculatorSummary.addSubscription(
      new subscriptions.EmailSubscription(props.adminEmailAddress)
    );

    this.calculatedEnergyTable = new HecDynamoDbConstruct(this, "CalculatedEnergyTable", {
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "date",
        type: dynamodb.AttributeType.STRING,
      }
    });
  }
}
