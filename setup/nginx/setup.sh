#!/bin/bash

# store path to directory in which script is present
NGINXSETUPDIR=$( cd $(dirname $0) ; pwd -P )
cd $NGINXSETUPDIR

# First argument is expected to define environment
# either 'production' or 'development'
if ! ([[ $1 == 'development' ]] || [[ $1 == 'production' ]]); then

  echo 'Error: First argument must be either "development" or "production"'
  exit 1

else

  echo 'Installing nginx'
  # TODO: Must install nginx > 1.4 for websockets support
  sudo apt-get install nginx -y

  echo 'Stopping process running on port 80 (free it up for nginx)'
  sudo fuser -k 80/tcp

  echo 'Starting nginx server'
  sudo service nginx start

fi

# Copy the config files in nginx/sites-available
if [[ $1 == 'development' ]]; then

  echo 'Copying nginx development files to sites-available' $(pwd)
  sudo cp -f ./development/* /etc/nginx/sites-available/

elif [[ $1 == 'production' ]]; then

  echo 'SETUP FOR production environment NOT configured yet'
  # TODO: write config for setting up nginx on production environment
  exit 1

fi

echo 'Creating symlinks for nginx config files from sites-available to sites-enabled'
cd /etc/nginx/sites-enabled/

sudo ln -s /etc/nginx/sites-available/app-api app-api
sudo ln -s /etc/nginx/sites-available/app-dashboard app-dashboard
sudo ln -s /etc/nginx/sites-available/app-website app-website

# TODO: To ensure that nginx will be up after reboots,
# it’s best to add it to the startup.
# update-rc.d nginx defaults

echo 'Restarting nginx'
sudo service nginx restart

unset NGINXSETUPDIR

exit 0
