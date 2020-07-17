#!/bin/bash
# cdk-deploy-core.sh

# env
## aws profile
export AWS_PROFILE=$1
shift

# main
## check cdk stack count
test `cdk ls --require-approval never | wc -l` != 1 && test $#==0 && echo "*** ERROR: Please specify the stack name in the argument" && cdk ls --require-approval never && exit 1

# execute cdk synth
cdk synth --require-approval never "$@"

# execute cdk deploy
cdk deploy --require-approval never "$@"
