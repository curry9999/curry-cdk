#!/bin/bash
# cdk-deploy.sh

# env
## input args
export AWS_PROFILE=$1
export STACK_NAME=$2

## check cdk stack count
test `cdk ls --require-approval never | wc -l` != 1 && test $# != 2 && echo "*** ERROR: Please specify the stack name in the argument" && cdk ls --require-approval never && exit 1

# execute cdk destroy
cdk destroy -f --require-approval never ${STACK_NAME}
