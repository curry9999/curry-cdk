import * as cdk from '@aws-cdk/core';
import * as cfn_inc from '@aws-cdk/cloudformation-include';
import { CfnRouteTable } from '@aws-cdk/aws-ec2';
import 'source-map-support/register';

export class MigrationStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const cfnInclude = new cfn_inc.CfnInclude(this, 'Template', { 
      templateFile: 'VpcStack.yml',
    });
  }
}

const app = new cdk.App();
//'MigrationStack' below needs to be the same name as the CloudFormation name
new MigrationStack(app, 'VpcStack');
