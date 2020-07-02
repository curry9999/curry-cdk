#!/bin/bash
# cdk-deploy-dev.sh

# default account and region
export CDK_DEFAULT_ACCOUNT=`aws sts get-caller-identity --profile dev --query "Account" --output text`
export CDK_DEFAULT_REGION=`aws configure get region --profile dev`

# execute cdk-deploy-core.sh
bash cdk-deploy-core.sh ${CDK_DEFAULT_ACCOUNT} ap-northeast-1 "$@"
