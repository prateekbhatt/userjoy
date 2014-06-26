#!/bin/bash

set -e

SAILS_VERSION=0.10.0-rc4
BOWER_VERSION=1.3.5
PM2_VERSION=0.9.1


echo 'Installing npm global dependencies ...'


bower -v 2>&1 | grep $BOWER_VERSION
if [[ $? == 0 ]]; then
  echo 'bower' $BOWER_VERSION 'is already installed'
else
  echo 'Installing bower globally ...'
  npm install bower -g
fi


sails -v 2>&1 | grep $SAILS_VERSION
if [[ $? == 0 ]]; then
  echo 'sails' $SAILS_VERSION 'is already installed'
else
  # install sails latest version
  echo 'Installing sails' $SAILS_VERSION 'globally ...'
  npm install sails@$SAILS_VERSION -g
fi


pm2 -V 2>&1 | grep $PM2_VERSION
if [[ $? == 0 ]]; then
  echo 'pm2' $PM2_VERSION 'is already installed'
else
  echo 'Installing pm2 globally ...'
  npm install pm2 -g
fi


exit 0
