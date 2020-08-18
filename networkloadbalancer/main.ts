#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import { AutoScalingGroup } from '@aws-cdk/aws-autoscaling';
import { Vpc } from '@aws-cdk/aws-ec2';
import { NetworkLoadBalancer } from '@aws-cdk/aws-elasticloadbalancingv2';

/* NetworkLoadBalancer */
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
      machineImage: new ec2.AmazonLinuxImage,
    });

    /*
      NetworkLoadBalancer
    */
    const nlb = new NetworkLoadBalancer(this, 'NetworkLoadBalancer', {
      vpc,
      internetFacing: true,
    });
    const listener = nlb.addListener('Listener', {
      port: 80,
    });
    listener.addTargets('ListenerTargets', {
      port: 80,
      targets: [asg],
    });
  }
}

/* OS Environments */
const osenv = {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
}

/* app */
const app = new cdk.App();

/* Stack NetworkLoadBalancer */
new NetworkLoadBalancerStack(app, 'NetworkLoadBalancerStack', { env: osenv });
