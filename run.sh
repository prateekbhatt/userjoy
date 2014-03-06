#!/bin/bash

ROOTDIR=$( cd $(dirname $0) ; pwd -P )
cd $ROOTDIR

# First argument is expected to define environment
# either 'production' or 'development'
if ! ([[ $1 == 'development' ]] || [[ $1 == 'production' ]]); then

  echo 'Error: First argument must be either "development" or "production"'
  exit 1

fi

if [[ $1 == 'development' ]]; then

  APPENV=dev

elif [[ $1 == 'production' ]]; then

  APPENV=prod

fi

cd apps/website

echo 'Running website ...'
if pm2 start app.js --name website --port=8000 --$APPENV; then
  echo "website is running"
else
  echo "website already running. restarting ..."
  pm2 restart website
fi

cd ../dashboard

echo 'Running dashboard ...'
if pm2 start app.js --name dashboard --port=8001 --$APPENV; then
  echo "dashboard is running"
else
  echo "dashboard already running. restarting ..."
  pm2 restart dashboard
fi

pm2 ping

echo 'Streaming logs..'
pm2 logs
