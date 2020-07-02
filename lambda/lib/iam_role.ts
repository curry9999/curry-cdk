#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { PolicyStatement , Role, ServicePrincipal, ManagedPolicy } from '@aws-cdk/aws-iam';

// IAM Stack
export class IamRoleStack extends cdk.Stack {
  public readonly lambdarole: Role;
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /*
      IAM Role
    */
    // IAM Role Lambda Execute
    this.lambdarole = new Role(this, 'IamRoleLambda', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    }); 
    this.lambdarole.addToPolicy(new PolicyStatement({
      resources: ['*'],
      actions: ['ec2:DescribeInstances','ec2:StartInstances'],
    }));
  }
}
