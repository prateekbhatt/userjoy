#!/bin/bash

# Terminate after the first line that fails (returns nonzero exit code)
set -e

bash ./setup/check-env-arg.sh $1

echo 'Installing dependencies for' $1 'environment for UserJoy ...' $(pwd)

if [[ $1 == 'dev' ]]; then
  sudo bash ./setup/add-hosts.sh
fi

bash ./setup/install-npm-global-dependencies.sh
bash ./setup/install-npm-project-dependencies.sh

bash ./setup/install-apps.sh

# create symlink of bin/userjoy.js in /usr/local/bin/userjoy
sudo ln -sf $(pwd)/bin/userjoy.js /usr/local/bin/userjoy

echo
echo '    Type "userjoy --help" to learn how to use the application'
echo

exit 0
