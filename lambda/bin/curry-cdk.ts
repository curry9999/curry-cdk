#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { EC2Stack } from '../lib/ec2';
import { VPCStack } from '../lib/vpc';
import { LambdaStack } from '../lib/lambda';
import { IamRoleStack } from '../lib/iam_role';
import { IamUserStack } from '../lib/iam_user';
import { NetworkLoadBalancerStack } from '../lib/nlb';
import { WorkSpacesStack } from '../lib/workspaces';
import { GlobalAcceleratorStack } from '../lib/global_accelerator';

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

/* Stack Labmda */
const iamstack = new IamRoleStack(app, 'IamRoleStack', { env: osenv });

new LambdaStack(app, 'LambdaStack', {
    lambdarole: iamstack.lambdarole,
    env: osenv,
});

/* Stack IamUser */
new IamUserStack(app, 'IamUserStack', { env: osenv });

/* Stack WorkSpaces */
new WorkSpacesStack(app, 'WorkSpacesStack', {
    vpc: vpcstack.vpc,
    env: osenv
});

/* Stack NetworkLoadBalancer */
new NetworkLoadBalancerStack(app, 'NetworkLoadBalancerStack', { env: osenv });

/* Stack Global Accelerator */
new GlobalAcceleratorStack(app, 'GlobalAcceleratorStack', { env: osenv });
