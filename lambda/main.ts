#!/usr/bin/env node
import fs = require('fs');
import cdk = require('@aws-cdk/core');
import events = require('@aws-cdk/aws-events');
import targets = require('@aws-cdk/aws-events-targets');
import lambda = require('@aws-cdk/aws-lambda');
import { PolicyStatement , Role, ServicePrincipal, ManagedPolicy } from '@aws-cdk/aws-iam';
import { Rule } from '@aws-cdk/aws-events';
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

// Lambda Stack
interface StackProps extends cdk.StackProps {
  lambdarole: IRole;
  env: Environment;
}
  
export class LambdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: StackProps) {
    super(scope, id, props);
  
    /*
      EC2 Auto Start
    */
    // Register Lambda Function
    const lambdaStart = new lambda.Function(this, 'LambdaFunctionAutoStart', {
      code: new lambda.InlineCode(fs.readFileSync('lambda/lambda-ec2-start.py', { encoding: 'utf-8' })),
      handler: 'index.main',
      timeout: cdk.Duration.seconds(300),
      runtime: lambda.Runtime.PYTHON_3_6,
      role: props.lambdarole,
    });
  
    // CloudWatch Events
    const ruleStart = new Rule(this, 'EventRuleAutoStart', {
      schedule: events.Schedule.expression('cron(0/5 * * * ? *)'),
    });
    ruleStart.addTarget(new targets.LambdaFunction(lambdaStart));
  
    /*
      EC2 Auto Stop
    */
    // Register Lambda Function
    const lambdaStop = new lambda.Function(this, 'LambdaFunctionAutoStop', {
      code: new lambda.InlineCode(fs.readFileSync('lambda/lambda-ec2-stop.py', { encoding: 'utf-8' })),
      handler: 'index.main',
      timeout: cdk.Duration.seconds(300),
      runtime: lambda.Runtime.PYTHON_3_6,
      role: props.lambdarole,
    });
  
    // CloudWatch Events
    const ruleStop = new Rule(this, 'EventRuleAutoStop', {
      schedule: events.Schedule.expression('cron(0/5 * * * ? *)'),
    });
    ruleStop.addTarget(new targets.LambdaFunction(lambdaStop));
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
