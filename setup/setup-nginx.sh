#!/bin/bash

# Terminate after the first line that fails (returns nonzero exit code)
set -e

bash ./setup/check-env-arg.sh $1

echo 'Installing nginx for' $1 'environment for UserJoy ...' $(pwd)

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
if [[ $1 == 'dev' ]]; then

  declare -a DO_APPS=( "website" "dashboard" "api" "cdn" "demo")

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

    elif [[ $app == 'demo' ]]; then

      PORT=8004
      SERVER_NAME='demo.do.localhost'

    elif [[ $app == 'cdn' ]]; then

      PORT=''
      SERVER_NAME='cdn.do.localhost'

    fi


    if [[ $app == 'website' ]] || [[ $app == 'dashboard' ]] || [[ $app == 'api' ]] || [[ $app == 'demo' ]]; then

      # create nginx config files
      cat > /etc/nginx/sites-available/app-$app << EOF

# the IP(s) on which the app node server is running.
upstream $SERVER_NAME {
    server 127.0.0.1:$PORT;
}

# REF: http://stackoverflow.com/a/19238614/1463434
server {
    server_name www.$SERVER_NAME;
    return 301 \$scheme://$SERVER_NAME\$request_uri;
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



server {
    server_name www.$SERVER_NAME;
    return 301 \$scheme://$SERVER_NAME\$request_uri;
}

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

elif [[ $1 == 'prod' ]]; then

  # ask if the user has already copied the private and public ssl keys to /etc/nginx/ssl folder
  # REF: http://stackoverflow.com/a/1885534/1463434
  read -p "Have you put the 'm87_ssl_bundle_public.crt' and 'm87_ssl_private_key.pem' files in /etc/nginx/ssl folder? " -n 1 -r
  echo  'hELLO'   # (optional) move to a new line
  if [[ $REPLY =~ ^[Yy]$ ]]
  then
    # do dangerous stuff

    declare -a DO_APPS=( "website" "dashboard" "api" "demo" )

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

      elif [[ $app == 'demo' ]]; then

        PORT=8002
        SERVER_NAME='demo.userjoy.co'

      fi


      # create nginx config files
      cat > /etc/nginx/sites-available/app-$app << EOF

# the IP(s) on which the app node server is running.
upstream $SERVER_NAME {
    server 127.0.0.1:$PORT;
}


# strip www from url
# redirect http requests to https
# REF: http://serverfault.com/a/337893/191615
server {
    listen 80;
    server_name www.$SERVER_NAME $SERVER_NAME;
    return 301 https://$SERVER_NAME\$request_uri;
}



# strip www from url for https requests
# REF: http://serverfault.com/a/258424/191615
server {
    listen 443;

    # REF: https://support.comodo.com/index.php?/Default/Knowledgebase/Article/View/789/37/certificate-installation-nginx
    ssl on;
    ssl_certificate /etc/nginx/ssl/m87_ssl_bundle_public.crt;
    ssl_certificate_key /etc/nginx/ssl/m87_ssl_private_key.pem;
    #enables SSLv3/TLSv1, but not SSLv2 which is weak and should no longer be used.
    ssl_protocols SSLv3 TLSv1;
    #Disables all weak ciphers
    ssl_ciphers ALL:!aNULL:!ADH:!eNULL:!LOW:!EXP:RC4+RSA:+HIGH:+MEDIUM;

    server_name www.$SERVER_NAME;
    return 301 https://$SERVER_NAME\$request_uri;
}



# the nginx server instance
server {
    listen 443;

    # REF: https://support.comodo.com/index.php?/Default/Knowledgebase/Article/View/789/37/certificate-installation-nginx
    ssl on;
    ssl_certificate /etc/nginx/ssl/m87_ssl_bundle_public.crt;
    ssl_certificate_key /etc/nginx/ssl/m87_ssl_private_key.pem;
    #enables SSLv3/TLSv1, but not SSLv2 which is weak and should no longer be used.
    ssl_protocols SSLv3 TLSv1;
    #Disables all weak ciphers
    ssl_ciphers ALL:!aNULL:!ADH:!eNULL:!LOW:!EXP:RC4+RSA:+HIGH:+MEDIUM;

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


fi

# TODO: To ensure that nginx will be up after reboots,
# it’s best to add it to the startup.
# update-rc.d nginx defaults

echo 'Restarting nginx'
sudo service nginx restart

exit 0
