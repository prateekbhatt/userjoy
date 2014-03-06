#!/bin/bash

echo 'Installing applications for DoDataDo ...'

# store path to directory in which script is present
APPSSETUPDIR=$( cd $(dirname $0) ; pwd -P )
echo 'Setup directory is', $APPSSETUPDIR
cd $APPSSETUPDIR

cd ../apps/website
echo 'Downloading npm modules for website app ...' $(pwd)
sudo npm install -y
bower install -y

cd ../dashboard
echo 'Downloading npm modules for dashboard app ...' $(pwd)
sudo npm install -y
bower install -y

unset APPSSETUPDIR

exit 0
