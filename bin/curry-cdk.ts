#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { EC2Stack , VPCStack } from '../lib/ec2';
import { LabmdaStack } from '../lib/lambda';

/* app */
const app = new cdk.App();

/* Stack VPC */
const vpcstack = new VPCStack(app, 'VPCStack');

/* Stack EC2 */
const ec2stack = new EC2Stack(app, 'EC2Stack', {
    vpc: vpcstack.vpc
});
ec2stack.tags.setTag('autostop','1');

/* Stack Labmda */
const lambdastack = new LabmdaStack(app, 'LabmdaStack');
