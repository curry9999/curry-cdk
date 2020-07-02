#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { EC2Stack } from '../lib/ec2';
import { VPCStack } from '../lib/vpc';

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
