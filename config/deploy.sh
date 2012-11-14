#!/bin/bash

# POST-sync installation

domain=$1

echo "DEPLOY"

# GIT DEPLOY
# git clone git@github.com:seanhess/bazookaguys.git
# cd bazookaguys
# git fetch origin
# git reset --hard origin/master

# RSYNC DEPLOY (don't have to push)
# see Makefile

# make sure we are built
# don't bower install. we're already copying everything, it's slow, and there are no system-level dependencies
# public/components/ gets rsynced
#make install
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

# set up test server
sudo cp config/test-upstart.conf /etc/init/test-bazookaguys.conf
sudo stop test-bazookaguys
sudo start test-bazookaguys
