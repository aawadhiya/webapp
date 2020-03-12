#!/bin/bash

cd /home/ubuntu/webapp/
sudo rm -rf node_modules
sudo rm -rf logs
sudo rm -rf .env
sudo rm app.log
npm install



nohup node app.js >> app.log 2>&1 &

echo "starting application on 3001"


