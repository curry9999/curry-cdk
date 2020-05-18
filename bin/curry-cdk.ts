#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { EC2Stack } from '../lib/ec2';
import { VPCStack } from '../lib/vpc';
import { LambdaStack } from '../lib/lambda';

/* app */
const app = new cdk.App();

/* Stack VPC */
const vpcstack = new VPCStack(app, 'VPCStack');

/* Stack EC2 Auto Start and Auto Stop */
const ec2stack = new EC2Stack(app, 'EC2Stack', {
    vpc: vpcstack.vpc
});
ec2stack.tags.setTag('autostop','1');
ec2stack.tags.setTag('autostart','0');
ec2stack.tags.setTag('autobackup','1');

/* Stack Labmda */
const lambdastack = new LambdaStack(app, 'LambdaStack');
