import cdk = require('@aws-cdk/core');
import { AmazonLinuxImage, SubnetType, Instance, InstanceType, InstanceClass, InstanceSize, Vpc } from '@aws-cdk/aws-ec2';
import { Alarm, Metric } from '@aws-cdk/aws-cloudwatch';

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

    // CloudWatch Alarm
    new Alarm(this, 'MyAlarm', {
      metric: new Metric({
        namespace: 'AWS/EC2',
        metricName: 'CPUUtilization',
        dimensions: {"InstanceId": ec2.instanceId},
      }),
      threshold: 0,
      evaluationPeriods: 1,
    });
  }
}
