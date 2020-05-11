#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { Ec2Stack } from '../lib/ec2';

/* app */
const app = new cdk.App();

/* Stack */
new Ec2Stack(app, 'Ec2Stack');
