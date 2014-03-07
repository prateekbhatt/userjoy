#!/bin/bash

ROOTDIR=$( cd $(dirname $0) ; pwd -P )
cd $ROOTDIR

# First argument is expected to define environment
# either 'production' or 'development'
if ! ([[ $1 == 'development' ]] || [[ $1 == 'production' ]]); then

  echo 'Error: First argument must be either "development" or "production"'
  exit 1

fi

# FIXME
if [[ $1 == 'production' ]]; then

  echo "NOTE: node-args is not being passed to individual processes by pm2"
  echo "Unless that works the app cannot be started in production environment"
  echo "Another approach would be to create separate development.js and"
  echo "production.js files inside the applications which in turn call"
  echo "app.js with the right arguments"

  exit 1

fi

if [[ $1 == 'development' ]]; then

  APPENV=dev

elif [[ $1 == 'production' ]]; then

  APPENV=prod

fi

cd apps/website

echo 'Running website ...'
# FIXME --node-args not working
if pm2 start app.js --name website --node-args="--port=8000 --$APPENV"; then
  echo "website is running"
else
  echo "website already running. restarting ..."
  pm2 restart website
fi

cd ../dashboard

echo 'Running dashboard ...'
# FIXME --node-args not working
if pm2 start app.js --name dashboard --node-args="--port=8001 --$APPENV"; then
  echo "dashboard is running"
else
  echo "dashboard already running. restarting ..."
  pm2 restart dashboard
fi

pm2 ping

echo 'Streaming logs..'
pm2 logs
