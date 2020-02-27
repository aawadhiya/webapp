var bcrypt = require('bcrypt');
var mysql = require('mysql');
var connection = require('../models/user');
const uuidv1 = require('uuid/v1');
const aws = require('aws-sdk');
require('dotenv').config();

var fs = require('fs');
var s3 = new aws.S3({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey
});
var today = new Date();
var addFileCounter = 0;
var getFileCounter = 0;
var deleteFileCounter = 0;
var multer = require('multer')
var upload = multer({ dest: 'tmp/', errorHandling: 'manual' })
var datbaseStart = new Date();

// POST
exports.addFile = function (req, res, next) {
    var filename = req.file.filename;
    var apiStart = new Date();
    var today = new Date();
    addFileCounter = addFileCounter + 1;


    var billId = req.params['id'];
    var token = req.headers['authorization'];
    if (!token) return res.status(401).send({ message: 'No authorization token' });


    var temp = token.split(' ');
    var basic_auth = Buffer.from(temp[1], 'base64').toString();
    var credential = basic_auth.split(':');

    var username = credential[0];
    var password = credential[1];


    if (username == null || password == null) {
        return res.status(400).send({ message: 'Bad Request' });
    }

    console.log("Request body is ..", req.file);
    console.log("req file is..", req.file);
    if (req.file == null) return res.status(400).send({ message: 'Bad Request, file in form data cannot be null' });
    if (req.file.mimetype === "image/png" || req.file.mimetype === "image/jpg" || req.file.mimetype === "image/jpeg" || req.file.mimetype == "application/pdf") {
        connection.query('SELECT * FROM csye6225.users WHERE email_address = ?', username, function (error, results, fields) {
            var userid = "";
            if (error) {
                return res.status(400).send({ message: 'Bad Request' });
            }
            if (results.length < 0 || typeof results[0] === 'undefined') {
                return res.status(404).send({ message: 'Not Found, user not found' });
            }
            if (!bcrypt.compareSync(password, results[0].password)) {

                return res.status(401).send({ message: 'Unauthorized User,Password does not match for the current user' });

            }
            userId = results[0].id;
            var insert = [billId, userId]
            var resultsSelectqlquerry = mysql.format('SELECT * FROM csye6225.bill where id= ? AND owner_id=?', insert);
            connection.query(resultsSelectqlquerry, function (error, results, fields) {
                if (error) {
                    return res.status(404).send({ message: 'bill not found' });
                }
                if (results.length < 0) {

                    return res.status(404).send({ message: 'Not Found, Bill not found for this user' });
                }
                else {
                    var attachment = results[0].attachment;
                    console.log(req.file);
                    console.log("----")
                    var file_name = req.file.originalname;
                    var selectSql = "SELECT count(file_name) AS Count  FROM csye6225.File WHERE file_name = ? and bill_id=?";
                    var insert = [file_name, billId];
                    var result = mysql.format(selectSql, insert);
                    console.log(result)
                    connection.query(result, function (error, result, fields) {
                        if (error) {
                            console.log(error);
                            return res.status(404).send({ message: 'Not found' });
                        }
                        var count = result[0].Count;
                        console.log("------------" + count)
                        if (count >= 1) {
                            return res.status(400).send({ message: 'Bad Request, file allready exist , please delete the file and post it' });
                        }
                        var fileId = uuidv1();


                        var fileStream = fs.createReadStream(req.file.path);
                        fileStream.on('error', function (err) {
                            console.log('File Error', err);
                        });
                        console.log("Process env bucket...", process.env.bucket)
                        var uploadParams = { Bucket: process.env.bucket, Key: fileId, Body: '' };
                        uploadParams.Body = fileStream;

                        // res.send("uploded")
                        s3.upload(uploadParams, function (err, data1) {

                            if (err) {
                                console.log(err);
                                return res.status(400).send({ message: 'Bad Request, Please Add File correctly' });
                            } if (data1) {
                                var param1 = { Bucket: process.env.bucket, Key: fileId };
                                s3.getObject(param1, function (err, data) {
                                    if (err) console.log(err, err.stack); // an error occurred
                                    else {
                                        console.log(data);
                                        console.log(data1);
                                    }        // successful response

                                    // res.send("uploded")
                                    var file = {
                                        id: fileId,
                                        file_name: filename,
                                        upload_date: today,
                                        url: data1.Location,
                                        bill_id: billId,
                                        AcceptRanges: data.AcceptRanges,
                                        LastModified: data.LastModified,
                                        ContentLength: data.ContentLength,
                                        ETag: data.ETag,
                                        ContentType: data.ContentLength,
                                    }
                                    var databasecalled = new Date();
                                    connection.query('INSERT INTO csye6225.File SET ?', file, function (error, results, fields) {


                                        if (error) {
                                            console.log("Bad Request", error);
                                            res.status(400).send({
                                                "failed": "Bad Request, Cannot enter bill"
                                            })
                                        } else {
                                            res.status(201).send({

                                                "id": fileId,
                                                "url": data1.Location
                                            });


                                        }
                                    });
                                });
                            }
                        });
                    });
                }
            });
        });

    } else {
        return res.status(400).send({ message: 'Bad Request, Please Add file in correct format' });
    }
}

// GET
exports.getFile = function (req, res) {

    var token = req.headers['authorization'];
    if (!token) return res.status(401).send({ message: 'No authorization token' });


    var temp = token.split(' ');
    var basic_auth = Buffer.from(temp[1], 'base64').toString();
    var credential = basic_auth.split(':');

    var username = credential[0];
    var password = credential[1];
    var billId = req.params['billId'];
    var fileId = req.params['fileId'];
    if (username == null || password == null) {
        return res.status(400).send({ message: 'Bad Request' });
    }
    console.log("username is...", username);
    connection.query('SELECT * FROM csye6225.users WHERE email_address = ?', username, function (error, results, fields) {
        if (error) {
            return res.status(400).send({ message: 'Bad Request' });
        }
        if (results.length < 0 || typeof results[0] === 'undefined') {
            return res.status(404).send({ message: 'Not Found, user not found' });

        }
        if (!bcrypt.compareSync(password, results[0].password)) {

            return res.status(401).send({ message: 'Unauthorized User,Password does not match for the current user' });

        }
        else {
            // logger.info("Get bill Api");
            var authArray = [billId, results[0].id];
            console.log("Auth array..", authArray);
            connection.query("SELECT * FROM csye6225.bill WHERE id = ? AND owner_id = ?", authArray, function (error, authResult) {
                if (error) {
                    return res.status(401).send({ message: "unauthorized, cannot access other user file" });
                }
                if (authResult.length <= 0 || authResult == null) {
                    return res.status(401).send({ message: "unauthorized, cannot access other user file" });
                }
                else {
                    var param1 = { Bucket: process.env.bucket, Key: fileId };
                    s3.getObject(param1, function (err, data) {
                        if (err) return res.status(404).send({ message: 'Not Found, File not found' });
                        // an error occurred
                    });
                    res.status(201).send({
                        "id": fileId,
                        "url": results[0].url
                    });
                }
            });


        }
    })
};

// DELETE
exports.deleteFile = function (req, res) {
    console.log("inside delete")
    // console.log("filename is ..", req.file.filename);
    // var fileName = req.file.filename;

    deleteFileCounter = deleteFileCounter + 1;

    var billId = req.params['billId'];
    var fileId = req.params['fileId'];
    console.log("req param id is...", req.params);
    console.log("File id is...", fileId);
    console.log("Bill id is...", billId);


    var token = req.headers['authorization'];
    if (!token) return res.status(401).send({ message: 'No authorization token' });


    var temp = token.split(' ');
    var basic_auth = Buffer.from(temp[1], 'base64').toString();
    var credential = basic_auth.split(':');

    var username = credential[0];
    var password = credential[1];


    if (username == null || password == null) {
        return res.status(400).send({ message: 'Bad Request' });
    }

    connection.query('SELECT * FROM csye6225.users WHERE email_address = ?', username, function (error, results, fields) {
        var userId = "";
        if (error) {
            return res.status(400).send({ message: 'Bad Request' });
        }
        if (results.length < 0 || typeof results[0] === 'undefined') {
            return res.status(404).send({ message: 'Not Found, user not found' });
            GET
        }
        if (!bcrypt.compareSync(password, results[0].password)) {

            return res.status(401).send({ message: 'Unauthorized User,Password does not match' });

        }
        userId = results[0].id;
        var insert = [billId, userId]
        console.log("user id is ..", userId);
        var resultsSelectqlquerry = mysql.format('SELECT * FROM csye6225.bill where id = ? AND owner_id = ?', insert);
        connection.query(resultsSelectqlquerry, function (error, results, fields) {
            if (error) {
                return res.status(404).send({ message: 'Bill  Not Found' });
            }
            if (results.length < 0 || typeof results[0] === 'undefined') {

                return res.status(404).send({ message: 'Not Found, Bill not found for this user' });
            }
            else {
                var selectSql = "SELECT *  FROM csye6225.File WHERE id = ? AND bill_id = ?";
                var insert = [fileId, billId];
                var resultQuery = mysql.format(selectSql, insert);
                connection.query(resultQuery, function (error, result, fields) {
                    var count = result.Count;
                    console.log("count value is/..", count);
                    if (error) { return res.status(404).send({ message: 'Not Found, File does not exist' }); }

                    if (count < 1 || typeof result[0] === 'undefined') {

                        return res.status(404).send({ message: 'Not Found, File does not exist' });
                    }
                    var filename = result[0].filename;
                    var deleteParams = { Bucket: process.env.bucket, Key: result[0].id };
                    console.log("filename is ..", result[0].filename);
                    s3.deleteObject(deleteParams, function (err, data) {
                        if (err) {
                            console.log(err, err.stack);
                            return res.status(400).send({ message: 'Bad Request, Please Add file correctly' });
                        } else {

                            console.log("Delete Success");
                            connection.query('delete from csye6225.File where id= ?', fileId, function (error, results, fields) {
                                if (error) {
                                    console.log("Bad Request", error);
                                    res.status(400).send({
                                        "failed": "Bad Request, Cannot Delete Bill"
                                    })
                                } else {
                                    console.log(data);
                                    res.status(204).send({ message: 'No Content' });
                                }
                            });
                        }
                    });
                })
            }
        });
    });
};

