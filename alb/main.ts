#!/usr/bin/env node
import fs = require('fs');
import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import { AutoScalingGroup } from '@aws-cdk/aws-autoscaling';
import { Vpc } from '@aws-cdk/aws-ec2';
import { ApplicationLoadBalancer } from '@aws-cdk/aws-elasticloadbalancingv2';

/* Stack Global Accelerator */
class ApplicationLoadBalancerStack extends cdk.Stack {
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
      internetFacing: true
    });
    const listener = alb.addListener('Listener', {
      port: 80,
    });
    listener.addTargets('ListenerTargets', {
      port: 80,
      targets: [asg]
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

/* Stack Global Accelerator */
new ApplicationLoadBalancerStack(app, 'ApplicationLoadBalancerStack', { env: osenv });
