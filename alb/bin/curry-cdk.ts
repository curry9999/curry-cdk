#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { ApplicationLoadBalancerStack } from '../lib/alb';

/* OS Environments */
const osenv = {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
}

/* app */
const app = new cdk.App();

/* Stack Global Accelerator */
new ApplicationLoadBalancerStack(app, 'ApplicationLoadBalancerStack', { env: osenv });
