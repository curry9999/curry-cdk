#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { User, Policy, PolicyStatement } from '@aws-cdk/aws-iam';

// IAM Stack
export class IamUserStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /*
      IAM Policy
    */
    const policyStatement = new PolicyStatement({
      resources: ['*'],
      actions: [
        'ec2:DescribeInstances',
        'ec2:StartInstances'
      ],
    })
    const policy = new Policy(this, 'IamPolicy', { 
      policyName: 'ec2-describe-start',
      statements: [policyStatement],
    });

    /*
      IAM User
    */
    const iamuser = new User(this, 'IamUser', {
      userName: 'ec2-describe-start',
    });
    iamuser.attachInlinePolicy(policy);
  }
}
