#!/bin/bash

# Terminate after the first line that fails (returns nonzero exit code)
set -e

echo 'Installing nginx'
# TODO: Must install nginx > 1.4 for websockets support
# Install specific nginx version
# Currently, if the installed nginx version is greater than $NGINX_VERSION,
# then it will always try to install the latest stable
# REF: https://www.digitalocean.com/community/articles/how-to-install-the-latest-version-of-nginx-on-ubuntu-12-10
NGINX_VERSION=1.6.0
nginx -v 2>&1 | grep $NGINX_VERSION
if [[ $? == 0 ]]; then
  echo 'nginx' $NGINX_VERSION 'is already installed'
else
  sudo add-apt-repository ppa:nginx/stable
  sudo apt-get update
  sudo apt-get install nginx -yf

  echo 'Stopping process running on port 80 (free it up for nginx)'
  sudo fuser -k 80/tcp

  echo 'Starting nginx server'
  sudo service nginx start
fi


# Create nginx config files in nginx/sites-available
if [[ $1 == 'development' ]]; then

  declare -a DO_APPS=( "website" "dashboard" "api" "cdn")

  echo 'Creating nginx development files in sites-available and'
  echo 'creating symlinks for nginx config files from sites-available in sites-enabled'


  for app in "${DO_APPS[@]}"; do

    CDN_ROOT=$(pwd)'/apps/cdn/'

    # set define port for the app
    if [[ $app == 'website' ]]; then

      PORT=8000
      SERVER_NAME='do.localhost'

    elif [[ $app == 'dashboard' ]]; then

      PORT=8001
      SERVER_NAME='app.do.localhost'

    elif [[ $app == 'api' ]]; then

      PORT=8002
      SERVER_NAME='api.do.localhost'

    elif [[ $app == 'cdn' ]]; then

      PORT=''
      SERVER_NAME='cdn.do.localhost'

    fi


    if [[ $app == 'website' ]] || [[ $app == 'development' ]] || [[ $app == 'api' ]]; then

      # create nginx config files
      cat > /etc/nginx/sites-available/app-$app << EOF

# the IP(s) on which the app node server is running.
upstream $SERVER_NAME {
    server 127.0.0.1:$PORT;
}

# the nginx server instance
server {
    listen 0.0.0.0:80;

    server_name $SERVER_NAME;
    access_log /var/log/nginx/$SERVER_NAME.log;

    # pass the request to the node.js server with the correct headers
    # and much more can be added, see nginx config options
    location / {
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header Host \$http_host;
        proxy_set_header X-NginX-Proxy true;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_pass http://$SERVER_NAME/;
        proxy_redirect off;
    }
}

EOF


    elif [[ $app == 'cdn' ]]; then

      # create nginx config files
      cat > /etc/nginx/sites-available/app-$app << EOF


# the nginx server instance
server {
    listen 0.0.0.0:80;

    server_name $SERVER_NAME;
    access_log /var/log/nginx/$SERVER_NAME.log;

    root $CDN_ROOT;

    location / {
      if (\$request_filename ~ "\.(js|css|gif|png|ico)$") {
          break;
      }
      return 404;
    }
}

EOF

    fi

    sudo ln -sf /etc/nginx/sites-available/app-$app /etc/nginx/sites-enabled/app-$app
  done

elif [[ $1 == 'production' ]]; then

  declare -a DO_APPS=( "website" "dashboard" "api" )

  echo 'Creating nginx production files in sites-available and'
  echo 'creating symlinks for nginx config files from sites-available in sites-enabled'


  for app in "${DO_APPS[@]}"; do

    # set define port for the app
    if [[ $app == 'website' ]]; then

      PORT=8000
      SERVER_NAME='userjoy.co'

    elif [[ $app == 'dashboard' ]]; then

      PORT=8001
      SERVER_NAME='app.userjoy.co'

    elif [[ $app == 'api' ]]; then

      PORT=8002
      SERVER_NAME='api.userjoy.co'

    fi


    # create nginx config files
    cat > /etc/nginx/sites-available/app-$app << EOF

# the IP(s) on which the app node server is running.
upstream $SERVER_NAME {
    server 127.0.0.1:$PORT;
}

# the nginx server instance
server {
    listen 0.0.0.0:80;

    server_name $SERVER_NAME;
    access_log /var/log/nginx/$SERVER_NAME.log;

    # pass the request to the node.js server with the correct headers
    # and much more can be added, see nginx config options
    location / {
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header Host \$http_host;
        proxy_set_header X-NginX-Proxy true;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_pass http://$SERVER_NAME/;
        proxy_redirect off;
    }
}

EOF

    sudo ln -sf /etc/nginx/sites-available/app-$app /etc/nginx/sites-enabled/app-$app
  done

fi

# TODO: To ensure that nginx will be up after reboots,
# it’s best to add it to the startup.
# update-rc.d nginx defaults

echo 'Restarting nginx'
sudo service nginx restart

exit 0
