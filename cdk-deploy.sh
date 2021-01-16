#!/bin/bash
# cdk-deploy.sh

# env
## input args
export AWS_PROFILE=$1

# main
npm install
npm run build

if [ $# -eq 1 ];then
  # all stack create
  cdk ls --require-approval never | xargs cdk deploy --require-approval never
else
  STACK_NAME=$2
  # stack create
  cdk deploy --require-approval never ${STACK_NAME} || cdk ls --require-approval never
fi

exit 0
