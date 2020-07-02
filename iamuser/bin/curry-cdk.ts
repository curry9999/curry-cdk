#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { IamUserStack } from '../lib/iam_user';

/* OS Environments */
const osenv = {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
}

/* app */
const app = new cdk.App();

/* Stack IamUser */
new IamUserStack(app, 'IamUserStack', { env: osenv });
