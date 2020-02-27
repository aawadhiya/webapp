var bcrypt = require('bcrypt');
var validator = require("email-validator");
var mysql = require('mysql');
var connection = require('../models/user.js');
const uuidv1 = require('uuid/v1');
var schema = require('./passwordValidator');

// Register new user...
exports.register = function (req, res) {
    console.log("req", req.body);
    if (req.body.first_name == null || req.body.last_name == null || (req.body.first_name).trim().length < 1 || (req.body.last_name).trim().length < 1 || req.body.password == null || req.body.email_address == null) {
        return res.status(400).send({
            message: 'Bad Request, Parameters are not correct'
        })
    };

    if (!validator.validate(req.body.email_address)) { return res.status(400).send({ message: 'Bad Request, invalid Email' }) };


    if (!schema.validate(req.body.password)) { return res.status(400).send({ message: 'Bad Request, try another Password' }) };

   
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);
    var today = new Date();
    var uuid = uuidv1();
    // var users;
    console.log("password", req.body.password);
    var user = {
        id: uuid,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email_address: req.body.email_address,
        password: hash,
        account_created: today,
        account_modified: today
    }
    // Insert data in the database table...
    var selectSql = "SELECT count(email_address) AS Count  FROM users WHERE email_address = ?";
    var insert = [user.email_address];
    var result = mysql.format(selectSql, insert);
    connection.query(result, function (error, result, fields) {
        console.log("ec2 error", result);
        console.log("ec2 error", result[0]);
        console.log("ec2 error", result[0].count);
        var count = result[0].Count;
        console.log("------------" + count)
        if (count >= 1) {
            return res.status(400).send({ message: 'Bad Request, Email already exist, try other email' });
        }
        connection.query('INSERT INTO users SET ?', user, function (error, results, fields) {

            if (error) {
                console.log("Bad Request, cannot insert user", error);
                res.send({
                    "code": 400,
                    "failed": "Bad Request"
                })
            }
        });
        var sql = 'SELECT id , first_name, last_name, email_address, account_created, account_modified  FROM users WHERE email_address = ?';
        var insert = [user.email_address]
        var result = mysql.format(sql, insert);

        connection.query(result, function (error, result, fields) {
            if (error) {
                console.log("Bad Request", error);
                res.send({
                    "code": 400,
                    "failed": "Bad Request1"
                })
            }
            console.log("result");
            console.log(result[0]);
            res.status(201).send(result[0]);
        });
    });
}

// Login.....
// Reference link for postman basic auth....
// https://learning.getpostman.com/docs/postman/sending-api-requests/authorization/
exports.login = function (req, res) {
    var token = req.headers['authorization'];
    // Basic <Base64 encoded username and password>
    console.log("request :-", req);
    console.log("request header:-", req.headers);
    console.log("token value:", token);
    console.log("request body is:", req.body);
    if (!token) return res.status(401).send({ message: 'unauthorized' });

    var temp = token.split(' ');
    var basic_auth = Buffer.from(temp[1], 'base64').toString();
    var credential = basic_auth.split(':');

    var username = credential[0];
    var password = credential[1];


    if (username == null || password == null) {
        return res.status(400).send({ message: 'Bad Request' });
    }
    console.log("username" + username, "password " + password);
    connection.query('SELECT * FROM users WHERE email_address = ?', username, function (error, results) {
        if (error) {
            console.log(error);
            return res.status(404).send({ message: 'Not found, email address does not exist' });
        } else {
            if (results.length > 0) {
                if (bcrypt.compareSync(password, results[0].password) || password == results[0].password) {
                    var sql = 'SELECT id , first_name, last_name, email_address, account_created, account_modified  FROM users WHERE email_address = ?';
                    var insert = [username]
                    var result = mysql.format(sql, insert);

                    connection.query(result, function (error, result) {
                        if (error) {
                            console.log("Bad Request", error);
                            return res.status(404).send({ message: 'Not Found, no user exist with this email address' });
                        }
                        else {
                            res.send(result[0]);
                        }
                    });
                }
                else {
                    return res.status(401).send({ message: 'Unauthorized, password does not match the current user' });
                }
            }
            else {
                return res.status(404).send({ message: 'Not found, user not found for this email' });
            }
        }
    });
};

// Update existing user...
exports.update = function (req, res) {

    var today = new Date();
    var token = req.headers['authorization'];
    if (!token) return res.status(401).send({ message: 'Unauthorized, please provide authentication' });

    var temp = token.split(' ');
    var basic_auth = Buffer.from(temp[1], 'base64').toString();
    var credential = basic_auth.split(':');

    var username = credential[0];
    var password = credential[1];
    console.log("UserName", username);
    console.log("Password", password);
    console.log("Request body", req.body);
    //update....
    if (username == null || username == "" || password == null || password == "") return res.status(400).send({ message: 'Bad Request, provide proper credentials' });

    connection.query('SELECT * FROM users WHERE email_address = ?', username, function (error, results) {
        if (error) {
            console.log("Error:", error);
            return res.status(404).send({ message: 'Not found, email not found for this user' });

        } else {
            if (results.length > 0) {
                if (bcrypt.compareSync(password, results[0].password)) {
                    if (req.body.first_name == null || req.body.first_name.trim().length < 1 || req.body.last_name.trim().length < 1 || req.body.last_name == null || req.body.password.trim().length < 1 || req.body.password == null) {
                        return res.status(400).send({ "failed": "Bad Request, input fields Cannot be empty" })
                    }
                    else if (req.body.id != null || (req.body.email_address != null && req.body.email_address != username) || req.body.account_created != null || req.body.account_modified != null) {
                        return res.status(400).send({ "failed": " Bad Request, not allowed to update all fields" });
                    }
                    else {
                        if (!schema.validate(req.body.password)) { return res.status(400).send({ message: 'Bad Request, try another Password' }) };
                        var salt = bcrypt.genSaltSync(10);
                        var hash = bcrypt.hashSync(req.body.password, salt);
                        connection.query('UPDATE users SET first_name = ?, last_name = ?, password = ?, account_modified = ? WHERE email_address = ?',
                            [req.body.first_name, req.body.last_name, hash, today, username], function (error, results) {
                                if (error) {
                                    return res.status(400).send({ "failed": "Bad Request" });
                                }
                                else {
                                    return res.status(204).send({ "message": "No Content" });
                                }
                            });
                    }
                }
                else {
                    return res.status(401).send({ message: 'Unauthorized, password do not match to current user' });
                }
            }
            else {
                return res.status(404).send({ message: 'User Not Found' });
            }
        }
    });
};

