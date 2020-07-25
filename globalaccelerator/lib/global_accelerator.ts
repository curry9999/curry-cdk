#!/usr/bin/env node
import fs = require('fs');
import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import { AutoScalingGroup } from '@aws-cdk/aws-autoscaling';
import { Vpc } from '@aws-cdk/aws-ec2';
import { ApplicationLoadBalancer } from '@aws-cdk/aws-elasticloadbalancingv2';
import { Accelerator, Listener, EndpointGroup, EndpointConfiguration, ConnectionProtocol } from '@aws-cdk/aws-globalaccelerator';

export class GlobalAcceleratorStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /*
      VPC
    */
    const vpc = new Vpc(this, 'VPC');

    /*
      AutoScalingGroup
    */
    const asg = new AutoScalingGroup(this, 'AutoScalingGroup', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: new ec2.AmazonLinuxImage,
    });
    asg.addUserData(fs.readFileSync("userdata/base.sh").toString());

    /*
      ApplicationLoadBalancer
    */
    const alb = new ApplicationLoadBalancer(this, 'ApplicationLoadBalancer', {
      vpc,
      internetFacing: true,
    });
    const listener = alb.addListener('Listener', {
      port: 80,
    });
    listener.addTargets('ListenerTargets', {
      port: 80,
      targets: [asg]
    });

    /*
      Global Accelerator
    */
    const accelerator = new Accelerator(this, 'Accelerator', {
      acceleratorName: 'AcceleratorNameTest',
    });
    const acceleratorListener = new Listener(this, 'Listener', {
      accelerator,
      portRanges: [
        {
          fromPort: 80,
          toPort: 80,
        },
      ],
      protocol: ConnectionProtocol.TCP,
    });
    const acceleratorEndpointGroup = new EndpointGroup(this, 'EndpointGroup', {
      region: 'ap-northeast-1',
      listener: acceleratorListener,
    });
    new EndpointConfiguration(this, 'EndpointConfiguration', {
      endpointGroup: acceleratorEndpointGroup,
      endpointId: alb.loadBalancerArn,
    });
  }
}
