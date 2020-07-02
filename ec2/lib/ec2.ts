#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import events = require('@aws-cdk/aws-events');
import { Duration, Environment } from '@aws-cdk/core';
import { AmazonLinuxImage, Instance, InstanceType, InstanceClass, InstanceSize, IVpc } from '@aws-cdk/aws-ec2';
import { Alarm, Metric } from '@aws-cdk/aws-cloudwatch';

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
