#!/bin/bash

set -e

SAILS_VERSION=0.10.0-rc4

echo 'Installing npm global dependencies ...'

echo 'Installing bower globally ...'
npm install bower -g

# install sails latest version
echo 'Installing sails' $SAILS_VERSION 'globally ...'
npm install sails@$SAILS_VERSION -g

echo 'Installing pm2 globally ...'
npm install pm2 -g

exit 0
