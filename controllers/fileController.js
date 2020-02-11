var bcrypt = require('bcrypt');
var mysql = require('mysql');
var connection = require('../models/user');
const uuidv1 = require('uuid/v1');
var fs = require('fs');
var today = new Date();
var addFileCounter = 0;
var getFileCounter = 0;
var deleteFileCounter = 0;
var multer  = require('multer')
var upload = multer({ dest: 'tmp/',errorHandling: 'manual' })


// POST
exports.addFile = function (req, res, next) {
    // var appiStart = new Date();  
    addFileCounter = addFileCounter + 1;
    //client.count("Add file API counter",addFileCounter);

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
        connection.query('SELECT * FROM users WHERE email_address = ?', username, function (error, results, fields) {
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
            var resultsSelectqlquerry = mysql.format('SELECT * FROM bill where id= ? AND owner_id=?', insert);
            connection.query(resultsSelectqlquerry, function (error, results, fields) {
                if (error) {
                    return res.status(404).send({ message: 'bill not found' });
                }
                if (results.length < 0) {

                    return res.status(404).send({ message: 'Not Found, Bill not found for this user' });
                }
                else {                     
                    console.log(req.file);
                    console.log("----")
                    var file_name = req.file.originalname;
                    var selectSql = "SELECT count(file_name) AS Count  FROM File WHERE file_name = ? and bill_id=?";
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
                        // console.log(process.env.bucket)

                        // res.send("uploded")
                        var file = {
                            id: fileId,
                            file_name: req.file.originalname,
                            url: req.file.destination + req.file.originalname,
                            bill_id: billId,
                            upload_date: today,
                            filename : req.file.filename,
                            mimetype : req.file.mimetype,
                            size: req.file.size,
                            encoding : req.file.encoding
                        }

                        var databsecalled = new Date();
                        connection.query('INSERT INTO File SET ?', file, function (error, results, fields) {
                            if (error) {
                                console.log("Bad Request", error);
                                res.status(400).send({
                                    "failed": "Bad Request, Cannot enter file"
                                })
                            } else {
                                connection.query('SELECT * FROM File WHERE id = ?', fileId, function (error, result1) {
                                    if (error) {
                                        return res.status(400).send({
                                            message: "bad request"
                                        });
                                    }
                                    else {
                                        console.log("response resulttt", result1[0]);
                                        res.status(201).send({
                                            "file_name": result1[0].file_name,
                                            "id": result1[0].id,
                                            "url": result1[0].url,
                                            "upload_date": result1[0].upload_date
                                        });
                                    }
                                })

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


    if (username == null || password == null) {
        return res.status(400).send({ message: 'Bad Request' });
    }
    connection.query('SELECT * FROM users WHERE email_address = ?', username, function (error, results, fields) {
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

            getFileCounter = getFileCounter + 1;
            //  client.count("Get file API counter",getFileCounter);
            var fileId = req.params['fileId'];
            var billId = req.params['billId'];
            console.log("req param id is...", req.params);
            console.log("File id is...", fileId);
            console.log("Bill id is...", billId);

            var insert = [fileId, billId]

            var resultsSelectqlquerry = mysql.format('SELECT * FROM File where id= ? and bill_id=? ', insert);
            connection.query(resultsSelectqlquerry, function (error, results, fields) {
                if (error) {
                    return res.status(400).send({ message: 'Bad Request' });
                }
                if (results.length < 0 || typeof results[0] === 'undefined') {
                    return res.status(404).send({ message: 'Not Found, File not found' });

                }
                else {
                    console.log("result object for response..", results[0])
                    res.status(201).send({
                        "file_name": results[0].file_name,
                        "id": results[0].id,
                        "url": results[0].url,
                        "upload_date": results[0].upload_date
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
    
    connection.query('SELECT * FROM users WHERE email_address = ?', username, function (error, results, fields) {
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
        var resultsSelectqlquerry = mysql.format('SELECT * FROM bill where id= ? AND owner_id=?', insert);
        connection.query(resultsSelectqlquerry, function (error, results, fields) {
            if (error) {
                return res.status(404).send({ message: 'Bill  Not Found' });
            }
            if (results.length < 0 || typeof results[0] === 'undefined') {

                return res.status(404).send({ message: 'Not Found, Bill not found for this user' });
            }
            else {
                var selectSql = "SELECT *  FROM File WHERE id = ?";
                var insert = [fileId];
                var resultQuery = mysql.format(selectSql, insert);
                connection.query(resultQuery, function (error, result, fields) {
                    if (error) { return res.status(404).send({ message: 'Not Found, File does not exist' }); }
                    var count = result[0].Count;
                    if (count < 1) {
                        return res.status(404).send({ message: 'Not Found, File does not exist' });
                    }
                    var filename = result[0].filename;
                    console.log("filename is ..", result[0].filename);
                    connection.query('delete from File where id= ?', fileId, function (error, results, fields) {
                        if (error) {
                            console.log("Bad Request", error);
                            res.status(400).send({
                                "failed": "Bad Request, Cannot Delete File"
                            })
                        } else {                              
                            fs.unlink("./tmp/"+filename, (err) => {
                                if (err) {
                                    console.log("failed to delete local image:"+err);
                                } else {
                                    console.log('successfully deleted local image');                                
                                }
                        });                       
                            res.status(204).send({ message: 'No Content' });
                        }
                    });
                })
            }
        });
    });
};

