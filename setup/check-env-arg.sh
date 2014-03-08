#!/bin/bash

set -e

# First argument is expected to define environment
# either 'production' or 'development'
if ! ([[ $1 == 'development' ]] || [[ $1 == 'production' ]]); then

  echo
  echo '    Error: <environment> param missing or invalid'
  bash ./setup/print-instructions.sh

  exit 1

fi
