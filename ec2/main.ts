#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { Environment } from '@aws-cdk/core';
import { AmazonLinuxImage, Instance, InstanceType, InstanceClass, InstanceSize, IVpc } from '@aws-cdk/aws-ec2';
import { Alarm, Metric } from '@aws-cdk/aws-cloudwatch';
import { SubnetType, Vpc } from '@aws-cdk/aws-ec2';

// VPC Stack
export class VPCStack extends cdk.Stack {
  public readonly vpc: Vpc;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /*
      VPC
    */
    this.vpc = new Vpc(this, 'Vpc', {
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
  }
}

// EC2 Stack
interface StackProps extends cdk.StackProps {
  vpc: IVpc;
  env: Environment;
  count: number;
}

export class EC2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: StackProps) {
    super(scope, id, props);
  
    for (var i = 1; i <= props.count; i++) { 
      /*
        EC2
      */
      const ec2 = new Instance(this, 'Instance' + i, {
        vpc: props.vpc,
        instanceType: InstanceType.of(
          InstanceClass.T2,
          InstanceSize.MICRO
        ),
        machineImage: new AmazonLinuxImage(),
        keyName: 'test',
      });
  
      /*
        CloudWatch
      */
      // Alarm CPUUtilization
      new Alarm(this, 'AlarmCPUUtilization' + i, {
        metric: new Metric({
          namespace: 'AWS/EC2',
          metricName: 'CPUUtilization',
          dimensions: {"InstanceId": ec2.instanceId},
        }),
        threshold: 80,
        evaluationPeriods: 1,
      });
    }
  }
}

/* OS Environments */
const osenv = {
  account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
}

/* app */
const app = new cdk.App();

/* Stack VPC */
const vpcstack = new VPCStack(app, 'VPCStack', { env: osenv });

/* Stack EC2 Auto Stop and Auto Backup */
const ec2 = new EC2Stack(app, 'EC2Stack', {
  vpc: vpcstack.vpc,
  env: osenv,
  count: 2
});
ec2.tags.setTag('autostop','1');
ec2.tags.setTag('autostart','1');
ec2.tags.setTag('autobackup','1');
