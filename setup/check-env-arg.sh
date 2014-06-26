#!/bin/bash

set -e

# First argument is expected to define environment
# either 'prod' or 'dev'
if ! ([[ $1 == 'dev' ]] || [[ $1 == 'prod' ]]); then

  echo
  echo '    Error: <environment> param missing or invalid'
  bash ./setup/print-instructions.sh

  exit 1

fi
