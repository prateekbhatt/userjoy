#!/bin/bash

set -e

echo 'Installing applications for UserJoy ...'

cd apps

cd website
echo 'Downloading npm modules for website app ...' $(pwd)
npm install -y
bower install
cd ..

cd dashboard
echo 'Downloading npm modules for dashboard app ...' $(pwd)
npm install -y
bower install
cd ..

exit 0
