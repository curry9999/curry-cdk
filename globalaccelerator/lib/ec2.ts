#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import events = require('@aws-cdk/aws-events');
import { Duration, Environment } from '@aws-cdk/core';
import { AmazonLinuxImage, Instance, InstanceType, InstanceClass, InstanceSize, IVpc } from '@aws-cdk/aws-ec2';
import { BackupPlan, BackupPlanRule, BackupResource, BackupVault } from '@aws-cdk/aws-backup';
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

      /*
        AWS Backup
      */
      const vault = new BackupVault(this, 'Vault' + i, {
        removalPolicy: cdk.RemovalPolicy.DESTROY
      });
      const plan = BackupPlan.dailyWeeklyMonthly5YearRetention(this, 'Plan' + i, vault);
      plan.addSelection('Selection' + i, {
        resources: [
          BackupResource.fromEc2Instance(ec2),
          BackupResource.fromTag('autobackup','1'),
        ]
      })
      plan.addRule(new BackupPlanRule({
        completionWindow: Duration.hours(2),
        startWindow: Duration.hours(1),
        scheduleExpression: events.Schedule.cron({ // Only cron expressions are supported
          day: '15',
          hour: '3',
          minute: '30'
        }),
        moveToColdStorageAfter: Duration.days(30)
      })); 
    }
  }
}
