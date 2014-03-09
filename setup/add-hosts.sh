#!/bin/bash

set -e

echo 'Adding do, app.do, api.do /etc/hosts'

ETCHOSTFILE=/etc/hosts
ETCHOSTURL=127.0.0.1
declare -a DOHOSTS=( "do.localhost" "app.do.localhost" "api.do.localhost" )

for host in "${DOHOSTS[@]}"
do
  FULLHOST="$ETCHOSTURL $host"

  # check if host is already present in /etc/hosts
  # if not present add it
  if ! grep -i "$FULLHOST" $ETCHOSTFILE; then
    sudo echo $FULLHOST >> $ETCHOSTFILE
  else
    echo $FULLHOST already exists in hosts file
  fi
done

exit 0
