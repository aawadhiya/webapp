#!/bin/bash


cd /home/ubuntu/webapp/
sudo rm -rf /home/ubuntu/webapp/*
sudo rm -rf /home/ubuntu/webapp/.env
npm install

nohup node app.js >> app.log 2>&1 &

echo "starting application on 3001"


