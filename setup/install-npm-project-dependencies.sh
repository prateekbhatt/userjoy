#!/bin/bash

set -e

echo 'Installing npm project dependencies ...'

echo 'Installing commander ...' $(pwd)
npm install commander -y

echo 'Installing shelljs ...' $(pwd)
npm install shelljs -y

echo 'Installing lodash ...' $(pwd)
npm install lodash -y

exit 0
