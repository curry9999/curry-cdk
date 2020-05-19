#!/usr/bin/env node
import cdk = require('@aws-cdk/core');
import { IVpc, Vpc } from '@aws-cdk/aws-ec2';
import { CfnSimpleAD } from '@aws-cdk/aws-directoryservice';
import { CfnWorkspace } from '@aws-cdk/aws-workspaces';

interface StackProps extends cdk.StackProps {
  vpc: IVpc;
}

// WorkSpaces Stack
export class WorkSpacesStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: StackProps) {
    super(scope, id, props);

    /*
      DirectoryService
    */
    const simplead = new CfnSimpleAD(this, 'SimpleAD', {
      name: 'corp.curryworkspaces.com',
      password: 'P@ssword1',
      size: 'Small',
      vpcSettings: {
        vpcId: props.vpc.vpcId.toString(),
        subnetIds: props.vpc.selectSubnets().subnetIds
      },
    });

    /*
      WorkSpaces
    */
    new CfnWorkspace(this, 'WorkSpaces', {
      directoryId: simplead.ref,
      bundleId: 'wsb-5sbs0y26m',
      userName: 'test',
    });
  }
}
