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

cd ~/bazookaguys

# make sure we are built
make install
make build

# set up nginx
sudo cp config/bazookaguys.conf /etc/nginx/conf.d/
sudo service nginx stop
sudo service nginx start
