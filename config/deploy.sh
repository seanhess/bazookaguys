#!/bin/bash

# POST-sync installation

domain=$1

echo "DEPLOY"

npm install
make build

# set up nginx
sudo cp config/nginx.conf /etc/nginx/conf.d/bazookaguys.conf
sudo service nginx stop
sudo service nginx start

# set up node server
sudo cp config/upstart.conf /etc/init/bazookaguys.conf
sudo stop bazookaguys
sudo start bazookaguys
