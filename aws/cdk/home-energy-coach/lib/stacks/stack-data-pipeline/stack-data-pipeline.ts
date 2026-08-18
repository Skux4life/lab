import * as cdk from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { aws_s3_notifications as s3n } from "aws-cdk-lib";
import { aws_dynamodb as ddb } from "aws-cdk-lib";
import { aws_sns as sns } from "aws-cdk-lib";
import * as path from "path";

export interface DataPipelineStackProps extends cdk.StackProps {
  /**
    * Required: S3 bucket for raw data upload
    */
  readonly rawDataLandingBucket: s3.Bucket;

  /**
   * Required: notification topic
   */
  readonly snsTopicRawUpload: sns.Topic;

  /**
   * Required: notification topic
   */
  readonly snsTopicCalculatorSummary: sns.Topic;

  /**
   * Required: dynamodb table for calculated energy
   */
  readonly calculatedEnergyTable: ddb.Table;
}

export class DataPipelineStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: DataPipelineStackProps) {
    super(scope, id, props);

    const jsonTransformedBucket = new s3.Bucket(this, "JsonTransformedBucket", {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const transformToJsonLambdaFunction = new lambda.Function(this, "TransformToJsonLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.main",
      code: lambda.Code.fromAsset(path.join(__dirname, "./lambda/lambda-transform-to-json")),
      environment: {
        transformedToJsonBucket: jsonTransformedBucket.bucketName,
        AWS_REGION: cdk.Stack.of(this).region,
      },
      description: "Lambda function transforms CSV to JSON and sves to S3",
    });

    const calculateAndNotifyLambdaFunction = new lambda.Function(this, "CalculateAndNotifyLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.main",
      code: lambda.Code.fromAsset(path.join(__dirname, "./lambda/lambda-calculate-notify")),
      environment: {
        snsTopicCalculatorSummaryArn: props.snsTopicCalculatorSummary.topicArn,
        AWS_REGION: cdk.Stack.of(this).region,
        CALCULATED_ENERGY_TABLE_NAME: props.calculatedEnergyTable.tableName,
      },
      description: "Lambda function calculates stuff",
    });

    props.rawDataLandingBucket.grantRead(transformToJsonLambdaFunction);
    jsonTransformedBucket.grantWrite(transformToJsonLambdaFunction)
    jsonTransformedBucket.grantRead(calculateAndNotifyLambdaFunction)

    props.rawDataLandingBucket.addEventNotification(s3.EventType.OBJECT_CREATED,
      new s3n.SnsDestination(props.snsTopicRawUpload), {
      suffix: ".csv",
    });

    props.rawDataLandingBucket.addEventNotification(s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(calculateAndNotifyLambdaFunction), {
      suffix: ".json",
    });

    new cdk.CfnOutput(this, "RawDataLandingBucketName", {
      value: props.rawDataLandingBucket.bucketName,
    });

    new cdk.CfnOutput(this, "JsonTransformedBucketName", {
      value: jsonTransformedBucket.bucketName,
    });
  }
}
