# webapp

Readme.md
# CSYE 6225 - Spring 2020

# Student Info
Name: Ankit Awadhiya
Nuid: 001449209

## Technology
Node.js
Express.JS
REST API
git
mysql

## Build Instructions

git clone git@github.com:aawadhiya/webapp.git

cd aawadhiya/webapp

npm install

## Deploy Instructions

npm start

## Routes

Routes - visit http://localhost:3001
GET - /v1​/user​/self (Get User Information)
PUT - ​/v1​/user​/self (Update user information)
POST - /v1​/user (Create a user)
POST - /v1/user/bill/ (Create a Bill)
Get - /v1/user/bill/:id (Get a Bill by billId)
Get - /v1/user/bills (Get all Bills of a user)
Put - /v1​/user/bill/:id (Update a Bill)
Delete - /v1​/bill/:id (Delete a Bill)

Install Postman to interact with REST API

create user with 
url - http://localhost:3001/v1/user
Method: POST
Body: raw + JSON (application/json)
Body Content: {"first_name": "test", "last_name":"test", "email_address":"test@test.com", "password":"Password@123"}

get user information with
url - http://localhost:3001/v1/user/self
Method: GET
Authorization - add - username - email_address and password - password

update user information with
url - http://localhost:3001/v1/user/self
Method: PUT
Authorization - add - username - email_address and password - password
Body: raw + JSON (application/json)
Body Content: {"first_name": "test", "last_name":"test", "password":"password"} 

## Running Tests
mocha 

## CI using circleci
Running ci
running cd test2