#!/bin/bash

cd /home/ubuntu/webapp/
sudo rm -rf node_modules
sudo rm -rf logs
sudo rm -rf .env
sudo rm app.log
npm install
