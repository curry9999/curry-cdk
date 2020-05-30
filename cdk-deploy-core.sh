#!/bin/bash
# cdk-deploy-core.sh

# deploy account and region
export CDK_DEPLOY_ACCOUNT=$1
shift
export CDK_DEPLOY_REGION=$1
shift

# execute cdk synth
cdk synth --require-approval never "$@"

# execute cdk deploy
cdk deploy --require-approval never "$@"
