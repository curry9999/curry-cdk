#!/usr/bin/env node
import fs = require('fs');
import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import apigateway = require('@aws-cdk/aws-apigateway');
import { Role, ServicePrincipal, ManagedPolicy } from '@aws-cdk/aws-iam';
import { IRole } from '@aws-cdk/aws-iam';
import { Environment } from '@aws-cdk/core';

// IAM Stack
export class IamRoleStack extends cdk.Stack {
  public readonly lambdarole: Role;
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  
    /*
      IAM Role
    */
    // IAM Role Lambda Execute
    this.lambdarole = new Role(this, 'IamRoleLambda', {
      roleName: 'lambdaRole',
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    }); 
  }
}

// Lambda Stack
interface StackProps extends cdk.StackProps {
  lambdarole: IRole;
  env: Environment;
}
  
export class LambdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: StackProps) {
    super(scope, id, props);
  
    // Register Lambda Function
    const lambdaStart = new lambda.Function(this, 'LambdaFunctionAutoStart', {
      functionName: 'lambdaExecute',
      code: new lambda.InlineCode(fs.readFileSync('lambda/lambda-main.js', { encoding: 'utf-8' })),
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(300),
      runtime: lambda.Runtime.NODEJS_12_X,
      role: props.lambdarole,
      environment: {
        env: 'test'
      }
    });
 
    // Register API Gateway
    const api = new apigateway.RestApi(this, 'test-api');
    const getBookIntegration = new apigateway.LambdaIntegration(lambdaStart, {
      proxy: false
    });
    api.root.addMethod('POST', getBookIntegration);
     
  }
}
  
/* OS Environments */
const osenv = {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
}

/* app */
const app = new cdk.App();

/* Stack Labmda */
const iamstack = new IamRoleStack(app, 'IamRoleStack', { env: osenv });

new LambdaStack(app, 'LambdaStack', {
    lambdarole: iamstack.lambdarole,
    env: osenv,
});
