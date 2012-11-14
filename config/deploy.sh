#!/bin/bash

# POST-sync installation

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
sudo cp config/bazookaguys.conf /etc/nginx/conf.d/
sudo service nginx stop
sudo service nginx start
