import cdk = require('@aws-cdk/core');
import { AmazonLinuxImage, SubnetType, Instance, InstanceType, InstanceClass, InstanceSize, Vpc, IVpc } from '@aws-cdk/aws-ec2';
import { Alarm, Metric } from '@aws-cdk/aws-cloudwatch';

// VPC Stack
export class VPCStack extends cdk.Stack {
  public readonly vpc: Vpc;
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
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
}

export class EC2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // EC2
    const ec2 = new Instance(this, 'Instance', {
      vpc: props.vpc,
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
  }
}
