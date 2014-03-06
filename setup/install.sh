#!/bin/bash

# store path to directory in which script is present
SETUPDIR=$( cd $(dirname $0) ; pwd -P )
echo 'Setup directory is', $SETUPDIR
cd $SETUPDIR

# First argument is expected to define environment
# either 'production' or 'development'
if ! ([[ $1 == 'development' ]] || [[ $1 == 'production' ]]); then

  echo 'Error: First argument must be either "development" or "production"'
  exit 1

fi

echo 'Installing' $1 'environment for DoDataDo ...'

sudo apt-get update -y

if [[ $1 == 'development' ]]; then

  sudo bash ./add-hosts.sh

fi

# setup nginx
sudo bash ./nginx/setup.sh $1

# go back to setup directory
cd $SETUPDIR
unset SETUPDIR

sudo bash ./install-npm-global-dependencies.sh

bash ./install-apps.sh

# make run.sh executable
sudo chmod u+x ../run.sh

# start application
echo 'To start the application, run:
bash run.sh'
# sh ../run.sh
