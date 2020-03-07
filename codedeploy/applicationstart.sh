#!/bin/bash

cd /home/ubuntu/webapp/
sudo rm -r node_modules
sudo rm -r logs
sudo rm app.log
npm install



nohup node app.js >> app.log 2>&1 &

echo "starting application on 3001"


