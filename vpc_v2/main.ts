#!/usr/bin/env node
import fs = require('fs');
import cdk = require('aws-cdk-lib');
import ec2 = require('aws-cdk-lib/aws-ec2');

//////////////////////
// VPC
//////////////////////
class VpcStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    new ec2.Vpc(this, 'VPC', {
      cidr: "10.0.0.0/16",
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'ingress',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'application',
          subnetType: ec2.SubnetType.PRIVATE,
        },
        {
          cidrMask: 28,
          name: 'rds',
          subnetType: ec2.SubnetType.ISOLATED,
        }
      ]
    });
 
  }
}

//////////////////////
// Main
//////////////////////
// OS Environments
const osenv = {
  account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
}
  
// app
const app = new cdk.App();

// Stack VPC
new VpcStack(app, 'VpcStack', { env: osenv });
