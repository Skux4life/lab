#!/usr/bin/env node

import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import { DataPipelineStack } from "../lib/stacks/stack-data-pipeline/stack-data-pipeline";
import { SharedResourcesStack } from "../lib/stacks/stack-shared-resources/stack-shared-resources";

/**
 * Environment configuration for the CDK app.
 * This includes the account and region.
 * In this configuration account and region are
 * taken from environmental variables with the AWS
 * CLI configured AWS profile.
 * @type {Object}
 */
const appEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

/**
 * Description for the stack. This description gets
 * passed in to every stack to create a unique identifier.
 * @type {string}
 */
const desc =
  "Home energy coach application by Skux4life";

/**
 * The CDK app.
 * This is the top level class and all stacks and constructs are
 * defined within this app construct. There can only be one app
 * within this file, but you can have multiple apps within the
 * bin director.
 * @type {cdk.App}
 */
const app = new cdk.App();

const sharedResourcesStack = new SharedResourcesStack(
  app,
  "SharedResourcesStack",
  {
    env: appEnv,
    description: desc,
    adminEmailAddress: app.node.tryGetContext("adminEmailAddress")
  }
)

const dataPipelineStack = new DataPipelineStack(app, "DataPipelineStack", {
  env: appEnv,
  description: desc,
  rawDataUploadBucket: sharedResourcesStack.rawDataUploadBucket,
  snsTopicRawUpload: sharedResourcesStack.snsTopicRawUpload,
  snsTopicCalculatorSummary: sharedResourcesStack.snsTopicCalculatorSummary,
  calculatedEnergyTable: sharedResourcesStack.calculatedEnergyTable,
})
