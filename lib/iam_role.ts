#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { Role, ServicePrincipal, ManagedPolicy } from '@aws-cdk/aws-iam';

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
        ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2FullAccess'),
      ],
    });
  }
}
