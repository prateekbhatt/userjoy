#!/bin/bash

# Terminate after the first line that fails (returns nonzero exit code)
set -e

# set node js environment variable
export DODATADO_ROOTDIR=$( cd $(dirname $0) ; pwd -P )

bash ./setup/install.sh $1
