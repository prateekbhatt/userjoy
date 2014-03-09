#!/bin/bash

# Terminate after the first line that fails (returns nonzero exit code)
set -e

bash ./setup/check-env-arg.sh $1

echo 'Installing' $1 'environment for DoDataDo ...' $(pwd)

sudo apt-get update -y

if [[ $1 == 'development' ]]; then
  sudo bash ./setup/add-hosts.sh
fi

# setup nginx
sudo bash ./setup/nginx/setup.sh $1

bash ./setup/install-npm-global-dependencies.sh
bash ./setup/install-npm-project-dependencies.sh

bash ./setup/install-apps.sh

# create symlink of bin/dodatado.js in /usr/loca/bin/dodatado
sudo ln -sf $(pwd)/bin/dodatado.js /usr/local/bin/dodatado

echo
echo '    Type "dodatado start' $1 '" in your command line to start application'
echo '    or "dodatado --help" to learn more'
echo

exit 0
