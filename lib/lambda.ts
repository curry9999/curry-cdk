import fs = require('fs');
import cdk = require('@aws-cdk/core');
import events = require('@aws-cdk/aws-events');
import targets = require('@aws-cdk/aws-events-targets');
import lambda = require('@aws-cdk/aws-lambda');
import { Rule } from '@aws-cdk/aws-events';
import { Role, ServicePrincipal, ManagedPolicy } from '@aws-cdk/aws-iam';

export class LabmdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // IAM Role Lambda Execute
    const lambdarole = new Role(this, 'IamRoleLambda', {
      roleName: 'IamRoleLambda',
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2FullAccess'),
      ],
    });

    // Register Lambda Function
    const lambdaFn = new lambda.Function(this, 'Singleton', {
      code: new lambda.InlineCode(fs.readFileSync('lambda-ec2-stop.py', { encoding: 'utf-8' })),
      handler: 'index.main',
      timeout: cdk.Duration.seconds(300),
      runtime: lambda.Runtime.PYTHON_3_6,
      role: lambdarole,
    });

    // CloudWatch Events
    const rule = new Rule(this, 'EventRuleAutoStart', {
      schedule: events.Schedule.expression('cron(0/5 * * * ? *)'),
    });
    rule.addTarget(new targets.LambdaFunction(lambdaFn));
  }
}
