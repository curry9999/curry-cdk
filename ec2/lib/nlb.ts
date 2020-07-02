#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import { AutoScalingGroup } from '@aws-cdk/aws-autoscaling';
import { Vpc } from '@aws-cdk/aws-ec2';
import { ApplicationLoadBalancer , NetworkLoadBalancer } from '@aws-cdk/aws-elasticloadbalancingv2';

export class NetworkLoadBalancerStack extends cdk.Stack {
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
      machineImage: new ec2.AmazonLinuxImage
    });

    /*
      NetworkLoadBalancer
    */
    const nlb = new NetworkLoadBalancer(this, 'NetworkLoadBalancer', {
      vpc,
      internetFacing: true
    });
    const listener = nlb.addListener('Listener', {
      port: 80,
    });
    listener.addTargets('ListenerTargets', {
      port: 80,
      targets: [asg]
    });
  }
}
