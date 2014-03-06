#!/bin/bash

# store path to directory in which script is present
ROOTDIR=$( cd $(dirname $0) ; pwd -P )
cd $ROOTDIR

# First argument is expected to define environment
# either 'production' or 'development'
if ! ([[ $1 == 'development' ]] || [[ $1 == 'production' ]]); then

  echo 'Error: First argument must be either "development" or "production"'
  exit 1

fi

sudo bash ./setup/install.sh $1
