#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { LambdaStack } from '../lib/lambda';
import { IamRoleStack } from '../lib/iam_role';

/* OS Environments */
const osenv = {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
}

/* app */
const app = new cdk.App();

/* Stack Labmda */
const iamstack = new IamRoleStack(app, 'IamRoleStack', { env: osenv });

new LambdaStack(app, 'LambdaStack', {
    lambdarole: iamstack.lambdarole,
    env: osenv,
});
