import cdk = require('@aws-cdk/core');
import { SubnetType, Vpc } from '@aws-cdk/aws-ec2';

// VPC Stack
export class VPCStack extends cdk.Stack {
  public readonly vpc: Vpc;
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /*
      VPC
    */
    this.vpc = new Vpc(this, 'Vpc', {
      cidr: "172.16.0.0/16",
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private',
          subnetType: SubnetType.PRIVATE,
        },
     ],
    });
  }
}
