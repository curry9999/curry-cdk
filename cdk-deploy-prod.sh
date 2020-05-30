#!/bin/bash
# cdk-deploy-prod.sh

# default account and region
export CDK_DEFAULT_ACCOUNT=`aws sts get-caller-identity --profile prod --query "Account" --output text`
export CDK_DEFAULT_REGION=`aws configure get region --profile prod`

# execute cdk-deploy-core.sh
bash cdk-deploy-core.sh ${CDK_DEFAULT_ACCOUNT} ap-northeast-1 "$@"
bash cdk-deploy-core.sh ${CDK_DEFAULT_ACCOUNT} ap-southeast-1 "$@"
