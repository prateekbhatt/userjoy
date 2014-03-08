#!/bin/bash

# Terminate after the first line that fails (returns nonzero exit code)
set -e

echo 'Installing nginx'
# TODO: Must install nginx > 1.4 for websockets support
sudo apt-get install nginx -y

echo 'Stopping process running on port 80 (free it up for nginx)'
sudo fuser -k 80/tcp

echo 'Starting nginx server'
sudo service nginx start

# Copy the config files in nginx/sites-available
if [[ $1 == 'development' ]]; then

  declare -a DO_APPS=( "website" "dashboard" "api" )

  echo 'Copying nginx development files to sites-available and'
  echo 'creating symlinks for nginx config files from sites-available to sites-enabled'

  for app in "${DO_APPS[@]}"; do
    sudo cp -f ./setup/nginx/development/app-$app /etc/nginx/sites-available/
    sudo ln -sf /etc/nginx/sites-available/app-$app /etc/nginx/sites-enabled/app-$app
  done

elif [[ $1 == 'production' ]]; then

  echo 'SETUP FOR production environment NOT configured yet'
  # TODO: write config for setting up nginx on production environment
  exit 1

fi

# TODO: To ensure that nginx will be up after reboots,
# it’s best to add it to the startup.
# update-rc.d nginx defaults

echo 'Restarting nginx'
sudo service nginx restart

exit 0
