#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { Ec2Stack } from '../lib/ec2';
import { LabmdaStack } from '../lib/lambda';

/* app */
const app = new cdk.App();

/* Stack EC2 */
const ec2stack = new Ec2Stack(app, 'Ec2Stack');
ec2stack.tags.setTag('autostop','1');

/* Stack Labmda */
const lambdastack = new LabmdaStack(app, 'LabmdaStack');
