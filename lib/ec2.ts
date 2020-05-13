import fs = require('fs');
import cdk = require('@aws-cdk/core');
import events = require('@aws-cdk/aws-events');
import targets = require('@aws-cdk/aws-events-targets');
import lambda = require('@aws-cdk/aws-lambda');
import { AmazonLinuxImage, SubnetType, Instance, InstanceType, InstanceClass, InstanceSize, Vpc } from '@aws-cdk/aws-ec2';
import { Alarm, Metric } from '@aws-cdk/aws-cloudwatch';
import { Rule } from '@aws-cdk/aws-events';
import { Role, ServicePrincipal, ManagedPolicy } from '@aws-cdk/aws-iam';

export class Ec2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new Vpc(this, 'Vpc', {
      cidr: "172.16.0.0/16",
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private',
          subnetType: SubnetType.PRIVATE,
        },
     ],
    });

    // EC2
    const ec2 = new Instance(this, 'Instance', {
      vpc: vpc,
      instanceType: InstanceType.of(
        InstanceClass.T2,
        InstanceSize.MICRO
      ),
      machineImage: new AmazonLinuxImage(),
      keyName: 'test',
    });

    // CloudWatch Alarm　CPUUtilization
    new Alarm(this, 'AlarmCPUUtilization', {
      metric: new Metric({
        namespace: 'AWS/EC2',
        metricName: 'CPUUtilization',
        dimensions: {"InstanceId": ec2.instanceId},
      }),
      threshold: 80,
      evaluationPeriods: 1,
    });

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
