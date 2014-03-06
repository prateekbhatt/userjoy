#!/bin/bash

echo 'Installing npm global dependencies ...'

echo 'Installing bower ...'
npm install bower -g

# install sails latest version
echo 'Installing sails 0.10.0-rc4 ...'
npm install sails@0.10.0-rc4 -g

echo 'Installing node pm2 ...'
npm install pm2 -g

exit 0
