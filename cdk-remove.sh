#!/bin/bash
# cdk-deploy.sh

# env
## input args
export AWS_PROFILE=$1

# main
if [ $# -eq 1 ];then
  # all stack remove
  cdk ls --require-approval never | xargs cdk destroy -f --require-approval never
else
  STACK_NAME=$2
  # stack remove
  cdk destroy -f --require-approval never ${STACK_NAME} || cdk ls --require-approval never
fi

exit 0
