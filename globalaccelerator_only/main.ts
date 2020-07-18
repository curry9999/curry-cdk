#!/usr/bin/env node
import fs = require('fs');
import cdk = require('@aws-cdk/core');
import { CfnAccelerator , CfnListener , CfnEndpointGroup } from '@aws-cdk/aws-globalaccelerator';

export class GlobalAcceleratorStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);
  
      /*
        Global Accelerator
      */
      const cfnAccelerator = new CfnAccelerator(this, 'CfnAccelerator', {
        name: 'AcceleratorNameTest'
      })
      const cfnListener = new CfnListener(this, 'CfnListener', {
        acceleratorArn: cfnAccelerator.attrAcceleratorArn,
        portRanges: [{
          fromPort: 80,
          toPort: 80
        }],
        protocol: 'TCP',
      })
      const cfnEndpointGroup = new CfnEndpointGroup(this, 'CfnEndpointGroup', {
        endpointGroupRegion: 'ap-northeast-1',
        listenerArn: cfnListener.attrListenerArn,
      })
    }
  }

  /* OS Environments */
const osenv = {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
}

/* app */
const app = new cdk.App();

/* Stack Global Accelerator */
new GlobalAcceleratorStack(app, 'GlobalAcceleratorOnlyStack', { env: osenv });
