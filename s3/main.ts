#!/usr/bin/env node
import fs = require('fs');
import cdk = require('@aws-cdk/core');
import { PolicyStatement ,Role, IRole, ServicePrincipal, ManagedPolicy } from '@aws-cdk/aws-iam';
import { Rule, Schedule } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { Environment } from '@aws-cdk/core';
import { Function, InlineCode, Runtime } from '@aws-cdk/aws-lambda';
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as iam from "@aws-cdk/aws-iam";
import { Bucket } from "@aws-cdk/aws-s3";

//////////////////////
// S3 Stack
//////////////////////
interface S3StackProps extends cdk.StackProps {
  env: Environment;
}

export class S3Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: S3StackProps) {
  super(scope, id, props);
  
      // Create Bucket
      const bucket = new Bucket(this, "public-s3-bucket", {
        removalPolicy: cdk.RemovalPolicy.DESTROY
      });
  
      // Create OriginAccessIdentity
      const oai = new cloudfront.OriginAccessIdentity(this, "my-oai");
  
      // Create Policy and attach to Bucket
      const bucketPolicy = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:GetObject"],
        principals: [
          new iam.CanonicalUserPrincipal(
            oai.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
        resources: [bucket.bucketArn + "/*"],
      });
      bucket.addToResourcePolicy(bucketPolicy);
  
      // Create CloudFront WebDistribution
      new cloudfront.CloudFrontWebDistribution(this, "WebsiteDistribution", {
        viewerCertificate: {
          aliases: [],
          props: {
            cloudFrontDefaultCertificate: true,
          },
        },
        priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
              originAccessIdentity: oai,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                minTtl: cdk.Duration.seconds(0),
                maxTtl: cdk.Duration.days(365),
                defaultTtl: cdk.Duration.days(1),
                pathPattern: "my-contents/*",
              },
            ],
          },
        ],
        errorConfigurations: [
          {
            errorCode: 403,
            responsePagePath: "/index.html",
            responseCode: 200,
            errorCachingMinTtl: 0,
          },
          {
            errorCode: 404,
            responsePagePath: "/index.html",
            responseCode: 200,
            errorCachingMinTtl: 0,
          },
        ],
      });
  
  }
}

//////////////////////
// IAM Stack
//////////////////////
interface IamStackProps extends cdk.StackProps {
  env: Environment;
}

export class IamRoleStack extends cdk.Stack {
  public readonly lambdarole: Role;
  constructor(scope: cdk.Construct, id: string, props?: IamStackProps) {
    super(scope, id, props);
  
    // IAM Role Lambda Execute
    this.lambdarole = new Role(this, 'IamRoleLambda', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    }); 
    this.lambdarole.addToPolicy(new PolicyStatement({
      resources: ['*'],
      actions: ['ec2:DescribeInstances','ec2:StartInstances'],
    }));
  }
}

//////////////////////
// Lambda Stack
//////////////////////
interface LambdaStackProps extends cdk.StackProps {
  lambdarole: IRole;
  env: Environment;
}

export class LambdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);
  
    // Register Lambda Function
    const lambdaStart = new Function(this, 'LambdaFunctionAutoStart', {
      code: new InlineCode(fs.readFileSync('lambda/lambda-get-number.py', { encoding: 'utf-8' })),
      handler: 'index.main',
      timeout: cdk.Duration.seconds(300),
      runtime: Runtime.PYTHON_3_6,
      role: props.lambdarole,
    });
  
    // CloudWatch Events
    const ruleStart = new Rule(this, 'EventRuleAutoStart', {
      schedule: Schedule.expression('cron(* 0/1 * * ? *)'),
    });
    ruleStart.addTarget(new LambdaFunction(lambdaStart));
  }
}

//////////////////////
// Main
//////////////////////
// OS Environments
const osenv = {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
}

// app
const app = new cdk.App();

// Stack S3
new S3Stack(app, 'S3Stack', {
  env: osenv
});

// Stack Iam Role
const iamstack = new IamRoleStack(app, 'S3IamRoleStack', {
  env: osenv
});

// Stack Lambda
new LambdaStack(app, 'S3LambdaStack', {
    lambdarole: iamstack.lambdarole,
    env: osenv,
});
