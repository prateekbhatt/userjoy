#!/bin/bash

# Terminate after the first line that fails (returns nonzero exit code)
set -e

bash ./setup/check-env-arg.sh $1

echo 'Installing' $1 'environment for UserJoy ...' $(pwd)

sudo apt-get update -y

if [[ $1 == 'development' ]]; then
  sudo bash ./setup/add-hosts.sh
fi

# setup nginx
sudo bash ./setup/nginx/setup.sh $1

bash ./setup/install-npm-global-dependencies.sh
bash ./setup/install-npm-project-dependencies.sh

bash ./setup/install-apps.sh

# create symlink of bin/userjoy.js in /usr/local/bin/userjoy
sudo ln -sf $(pwd)/bin/userjoy.js /usr/local/bin/userjoy

echo
echo '    Type "userjoy start' $1 '" in your command line to start application'
echo '    or "userjoy --help" to learn more'
echo

exit 0
