import fs = require('fs');
import cdk = require('@aws-cdk/core');
import events = require('@aws-cdk/aws-events');
import targets = require('@aws-cdk/aws-events-targets');
import lambda = require('@aws-cdk/aws-lambda');
import { Rule } from '@aws-cdk/aws-events';
import { Role, ServicePrincipal, ManagedPolicy } from '@aws-cdk/aws-iam';

export class LambdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /*
      Common
    */
    // IAM Role Lambda Execute
    const lambdarole = new Role(this, 'IamRoleLambda', {
      roleName: 'IamRoleLambda',
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2FullAccess'),
      ],
    });

    /*
      EC2 Auto Start
    */
    // Register Lambda Function
    const lambdaStart = new lambda.Function(this, 'LambdaFunctionAutoStart', {
      code: new lambda.InlineCode(fs.readFileSync('lambda/lambda-ec2-start.py', { encoding: 'utf-8' })),
      handler: 'index.main',
      timeout: cdk.Duration.seconds(300),
      runtime: lambda.Runtime.PYTHON_3_6,
      role: lambdarole,
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
      role: lambdarole,
    });

    // CloudWatch Events
    const ruleStop = new Rule(this, 'EventRuleAutoStop', {
      schedule: events.Schedule.expression('cron(0/5 * * * ? *)'),
    });
    ruleStop.addTarget(new targets.LambdaFunction(lambdaStop));
  }
}
