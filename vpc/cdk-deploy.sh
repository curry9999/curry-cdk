#!/bin/bash
# cdk-deploy.sh

# env
## input args
export ARG=$1
shift

## check envs
if [ ${ARG} = "remove" ]; then
    export REMOVE_FLG=1
    export AWS_PROFILE=$1
    shift

    ## check cdk stack count
    test `cdk ls --require-approval never | wc -l` != 1 && test $#==0 && echo "*** ERROR: Please specify the stack name in the argument" && cdk ls --require-approval never && exit 1
    # execute cdk destroy
    cdk destroy -f --require-approval never "$@"
else
    export REMOVE_FLG=0
    export AWS_PROFILE=${ARG}

    # main
    ## check cdk stack count
    test `cdk ls --require-approval never | wc -l` != 1 && test $#==0 && echo "*** ERROR: Please specify the stack name in the argument" && cdk ls --require-approval never && exit 1
    # execute cdk synth
    cdk synth --require-approval never "$@"
    # execute cdk deploy
    cdk deploy --require-approval never "$@"
fi
