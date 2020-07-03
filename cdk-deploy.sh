#!/bin/bash
# cdk-deploy-core.sh

# env
export CDK_ENV=$1
shift

# deploy account and region
export AWS_PROFILE=${CDK_ENV}

# execute cdk synth
cdk synth --require-approval never "$@"

# execute cdk deploy
cdk deploy --require-approval never "$@"
