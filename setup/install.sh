#!/bin/bash

# Terminate after the first line that fails (returns nonzero exit code)
set -e

bash ./setup/check-env-arg.sh $1

echo 'Installing' $1 'environment for DoDataDo ...' $(pwd)

sudo apt-get update -y

if [[ $1 == 'development' ]]; then
  bash ./setup/add-hosts.sh
fi

# setup nginx
bash ./setup/nginx/setup.sh $1

bash ./setup/install-npm-global-dependencies.sh
bash ./setup/install-npm-project-dependencies.sh

bash ./setup/install-apps.sh

# create symlink of bin/dodatado.js in /usr/loca/bin/dodatado
sudo ln -sf $(pwd)/bin/dodatado.js /usr/local/bin/dodatado

echo '    Type "dodatado start" in your command line to start application'

exit 0
