var bcrypt = require('bcrypt');
var mysql = require('mysql');
var connection = require('../models/user');
const uuidv1 = require('uuid/v1');
const qs = require('querystring');

// POST for bill...
exports.registerBill = function (req, res) {
    var today = new Date();

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

    if (req.body.id != null || req.body.created_ts != null || req.body.updated_ts != null)
        return res.status(400).send({ "Bad Request": "id , created_ts, updates_ts are read only, cannot be included when posting data" });

    if (req.body.vendor == null || (req.body.vendor).trim().length < 1) {
        return res.status(400).send({
            message: 'Bad Request, Feilds Cannot be null or Empty'
        });
    }
    if (req.body.due_date == null || (req.body.due_date).trim().length < 1) {
        return res.status(400).send({
            message: 'Bad Request, Feilds Cannot be null or Empty'
        });
    }
    if (req.body.amount_due == null || /^\s*$/.test(req.body.amount_due)) {
        return res.status(400).send({
            message: 'Bad Request, Feilds Cannot be null or Empty'
        });
    }
    if (req.body.categories == null || /^\s*$/.test(req.body.categories) || req.body.categories == null) {
        return res.status(400).send({
            message: 'Bad Request, Feilds Cannot be null or Empty'
        });
    }
    if (req.body.bill_date == null || /^\s*$/.test(req.body.bill_date)) {
        return res.status(400).send({
            message: 'Bad Request, Feilds Cannot be null or Empty'
        });
    }
    // if (req.body.vendor == null || (req.body.vendor).trim().length < 1 || req.body.due_date == null || (req.body.due_date).trim().length < 1 ||
    //     req.body.amount_due == null || (req.body.amount_due).trim().length < 1 || req.body.categories == null || req.body.categories.length < 1 ||
    //   (req.body.categories).trim().length < 1 ||  req.body.paymentStatus == null || (req.body.paymentStatus).trim().length < 1) {
    //     return res.status(400).send({
    //         message: 'Bad Request, Feilds Cannot be null or Empty'
    //     });
    // }
    if (req.body.amount_due < 0) {
        return res.status(400).send({ message: "Bad Request, min value for amount_due cannot be less than 0.1" });
    }


    function isNumber(value) {
        return typeof value === 'number' && isFinite(value);
    }

    function isDouble(value) {
        return !isNaN(value) && parseFloat(value) == value && !isNaN(parseFloat(value, 10)) && !(typeof value === 'string');
    }

    if (!isDouble(req.body.amount_due) || req.body.amount_due < 0.1)
        return res.status(400).send({ "Bad Request": "amount due cannot be less than 0.1 " });

    if (/^\s*$/.test(req.body.paymentStatus) || req.body.paymentStatus == null) {
        return res.status(400).send({ "Bad Request": " payment status can not be left blank" });
    }
    console.log(req.body.paymentStatus);
    // if(req.body.paymentStatus != "paid" || req.body.paymentStatus != "due" || req.body.paymentStatus != "past_due" || req.body.paymentStatus != "no_payment_required" ||
    // req.body.paymentStatus == null || (req.body.paymentStatus).trim() <1 )
    // {
    //     return res.status(400).send({"Bad Request": "Invalid Payment status value"});
    // }

    connection.query("SELECT * FROM users WHERE email_address = ?", username, function (error, results) {
        if (error) {
            return res.status(404).send({ "message": " user not found for this username" });
        }
        else {
            if (results.length > 0) {
                if (bcrypt.compareSync(password, results[0].password)) {
                    var uuid = uuidv1();

                    var categoryArray = [];
                    var categoryList = new Set();
                    categoriesArray = req.body.categories;
                    for (var i = 0; i < categoriesArray.length; i++) {
                        categoryList.add(categoriesArray[i]);
                    }
                    var dueDate = req.body.due_date.toString();
                    console.log("dueDate...", dueDate);

                    var categoryData = Array.from(categoryList);
                    var categoryString = categoryData.toString();
                    //console.log("Category string data ", categoryString);
                    //    var categoryArray = Array.from(categoryList);
                    var bill = {
                        id: uuid,
                        created_ts: today,
                        updated_ts: today,
                        owner_id: results[0].id,
                        vendor: req.body.vendor,
                        bill_date: req.body.bill_date,
                        due_date: dueDate,
                        amount_due: req.body.amount_due,
                        categories: categoryString,
                        paymentStatus: req.body.paymentStatus
                    }

                    connection.query('INSERT INTO bill SET ?', bill, function (error, result1) {
                        if (error) {
                            console.log("error in saving bill is : ", error);
                            return res.status(400).send({ "Bad request": " Failed to save bill" });
                        }
                        else {
                            // Getting the bill data....
                            console.log("eNTERED");
                            connection.query('SELECT * FROM bill WHERE id = ?', bill.id, function (error, qResult) {
                                console.log("Response23 object ", qResult[0]);
                                if (error) {
                                    console.log("Erorrrrrrrr");
                                    return res.status(404).send("Bill not found");
                                }
                                else {
                                    console.log("else...");
                                    if (qResult.length > 0) {
                                        var dueDate1 = qResult[0].due_date.toString().substring(0, 10);
                                        console.log("due date..", qResult[0].due_date);
                                        var catArray = [];
                                        var categories = JSON.stringify(qResult[0]['categories']);
                                        var catList = categories.split(',');
                                        console.log("CATList.....", catList);
                                        for (var i = 0; i < catList.length; i++) {
                                            catArray[i] = catList[i].replace(/[\\"\[\]]/g, '');
                                        }

                                        console.log("CAT.....", catArray);
                                        console.log("stringify cate : ", JSON.stringify(qResult[0]['categories']));
                                        console.log("stringify cate : ", qs.parse(qResult[0].categories));
                                        console.log("stringify cate : ", categories);
                                        qResult[0].categories = catArray;
                                        console.log(qResult[0].categories);
                                        //res.send(qResult);
                                        console.log("Response111 object ", qResult[0]);
                                        // res.send(qResult[0]);
                                    }

                                }
                                return res.status(201).send(qResult[0]);
                            });

                        }
                    });

                }
                else {
                    return res.status(401).send("message: unauthorized");
                }
            }
            else {
                return res.status(401).send("message: unauthorized");
            }
        }
    });
};


exports.getBillById = function (req, res) {

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
    connection.query('SELECT * FROM users WHERE email_address = ?', username, function (error, results) {
        if (error) {
            console.log(error);
            return res.status(401).send({ message: 'Unauthorized' });
        } else {
            if (results.length > 0) {
                if (bcrypt.compareSync(password, results[0].password)) {
                    console.log("Bill id....", req.params['id']);

                    var billId = req.params['id'];

                    connection.query("SELECT * FROM bill where id =?", billId, function (error, qResult) {
                        if (error) {
                            return res.status(404).send({ message: 'Bill Not Found' });
                        } else {
                            var categories = [];
                            if (qResult.length > 0) {

                                var dueDate1 = qResult[0].due_date.toString().substring(0, 10);
                                console.log("due date..", qResult[0].due_date);
                                var catArray = [];
                                var categories = JSON.stringify(qResult[0]['categories']);
                                var catList = categories.split(',');
                                console.log("CATList.....", catList);
                                for (var i = 0; i < catList.length; i++) {
                                    catArray[i] = catList[i].replace(/[\\"\[\]]/g, '');
                                }

                                console.log("CAT.....", catArray);
                                console.log("stringify cate : ", JSON.stringify(qResult[0]['categories']));
                                console.log("stringify cate : ", qs.parse(qResult[0].categories));
                                console.log("stringify cate : ", categories);
                                qResult[0].categories = catArray;
                                console.log(qResult[0].categories);
                                //res.send(qResult);
                                console.log("Response111 object ", qResult[0]);

                            }
                            else {
                                return res.status(404).send({ message: 'Bill not found' });
                            }
                        }
                        return res.status(200).send(qResult[0]);
                    });
                }
                else {
                    return res.status(401).send({ message: 'Unauthorized,username or  password does not match the current user' });
                }
            }
            else {
                return res.status(401).send({ message: "User not found" });
            }
        }
    });

}

// GET all bills...
exports.getBills = function (req, res) {

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
    connection.query('SELECT * FROM users WHERE email_address = ?', username, function (error, results) {
        if (error) {
            console.log(error);
            return res.status(401).send({ message: 'Unauthorized' });
        } else {
            if (results.length > 0) {
                if (bcrypt.compareSync(password, results[0].password)) {

                    connection.query("SELECT * FROM bill where owner_id =?", results[0].id, function (error, qResult) {
                        if (error) {
                            return res.status(404).send({ message: 'Bill Not Found' });
                        } else {
                            var categories = [];
                            if (qResult.length > 0) {
                                var totalBills = qResult.length;
                                var billArray = [];
                                for (var i = 0; i < totalBills; i++) {
                                    var dueDate1 = qResult[0].due_date.toString().substring(0, 10);
                                    console.log("due date..", qResult[0].due_date);
                                    var catArray = [];
                                    var categories = JSON.stringify(qResult[i]['categories']);
                                    var catList = categories.split(',');
                                    console.log("CATList.....", catList);
                                    for (var j = 0; j < catList.length; j++) {
                                        catArray[j] = catList[j].replace(/[\\"\[\]]/g, '');
                                    }

                                    console.log("CAT.....", catArray);
                                    console.log("stringify cate : ", JSON.stringify(qResult[i]['categories']));
                                    console.log("stringify cate : ", qs.parse(qResult[i].categories));
                                    console.log("stringify cate : ", categories);
                                    qResult[i].categories = catArray;
                                    console.log(qResult[0].categories);
                                    billArray[i] = qResult[i];
                                }

                                //res.send(qResult);
                                console.log("Response111 object ", qResult[0]);

                            }
                            else {
                                return res.status(404).send({ message: 'Bill not found' });
                            }
                        }
                        return res.status(200).send(qResult);
                    });
                }
                else {
                    return res.status(401).send({ message: 'Unauthorized,username or password does not match the current user' });
                }
            }
            else {
                return res.status(401).send({ message: "User not found" });
            }
        }
    });

}

// Update bill ....
exports.updateBill = function (req, res) {

    var today = new Date();
    let date = ("0" + today.getDate()).slice(-2);
    let month = ("0" + (today.getMonth() + 1)).slice(-2);
    let year = today.getFullYear();
    var dateOnly = year + "-" + month + "-" + date;
    console.log(year + "-" + month + "-" + date);
    console.log("Today date part..", date);
    console.log("today value..", today);
    var token = req.headers['authorization'];

    if (!token) return res.status(401).send({ message: 'unauthorized' });

    var temp = token.split(' ');
    var basic_auth = Buffer.from(temp[1], 'base64').toString();
    var credential = basic_auth.split(':');

    var username = credential[0];
    var password = credential[1];
    var billId = req.params['id'];

    if (username == null || password == null) return res.status(400).send({ message: 'Bad Request, Password and Username cannot be null' });

    function isDouble(value) {
        return !isNaN(value) && parseFloat(value) == value && !isNaN(parseFloat(value, 10)) && !(typeof value === 'string');
    }
    var minValue = 0.1;
    var amountDue = JSON.parse(req.body.amount_due);
    console.log("Amount due", amountDue);
    if (!isDouble(req.body.amount_due) || req.body.amount_due < minValue)
        return res.status(400).send({ "Bad Request": "amount due cannot be less than 0.1 " });

    if ((req.body.vendor == null || (req.body.vendor).trim().length < 1) || (req.body.due_date == null || (req.body.due_date).trim().length < 1) ||
        (req.body.amount_due == null) || (req.body.categories == null || req.body.categories.length < 1) ||
        (req.body.paymentStatus == null || (req.body.paymentStatus).trim().length < 1)) {
        return res.status(400).send({
            message: 'Bad Request, Feilds Cannot be null or Empty'
        })
    };

    connection.query('SELECT * FROM users WHERE email_address= ?', username, function (error, results) {
        if (error) {
            return res.status(404).send({ message: 'user  Not Found' });
        } else {
            if (results.length > 0) {
                if (bcrypt.compareSync(password, results[0].password)) {
                    userId = results[0].id;
                    var vals = [billId, userId];
                    var selectSqlQuery = mysql.format('SELECT * FROM bill where id= ? AND owner_id=?', vals);
                    connection.query(selectSqlQuery, function (error, results) {
                        if (error) {
                            return res.status(404).send({ message: 'bill  Not Found' });
                        } else {
                            if (results.length > 0) {

                                var categoriesString = req.body.categories.toString();
                                console.log("req.cate....", categoriesString);
                                console.log("request body....", req.body);
                                connection.query('UPDATE bill SET updated_ts = ?, vendor = ?, bill_date = ?, due_date = ?, amount_due = ?, categories = ?, paymentStatus = ? WHERE id = ?',
                                    [today, req.body.vendor, req.body.bill_date, req.body.due_date, req.body.amount_due, categoriesString, req.body.paymentStatus, billId], function (error, results1) {
                                        if (error) {
                                            console.log("Errorr...", error);
                                            res.status(400).send({ "bad request": "unable to update bill" });
                                        }
                                        else {
                                            connection.query("SELECT * FROM bill WHERE id = ?", billId, function (error, result2) {
                                                if (error) {
                                                    return res.status(404).send({ "Not Found": "No bill found" });
                                                }
                                                else {
                                                    // var categories = [];
                                                    if (result2.length > 0) {
                                                        var catArray = [];
                                                        var categories = JSON.stringify(result2[0]['categories']);
                                                        var catList = categories.split(',');
                                                        console.log("CATList.....", catList);
                                                        for (var i = 0; i < catList.length; i++) {
                                                            catArray[i] = catList[i].replace(/[\\"\[\]]/g, '');
                                                        }
                                                        console.log("catArray..", catArray);

                                                        result2[0].categories = catArray;
                                                        console.log("bill..", result2[0]);

                                                        return res.status(200).send(result2[0]);
                                                    }
                                                    else {
                                                        return res.status(404).send({ message: 'Bill not found' });
                                                    }

                                                }

                                            });
                                        }
                                    });
                            }
                            else {
                                return res.status(404).send({ message: 'Bad Request' });
                            }
                        }
                    });
                } else {
                    return res.status(401).send({ message: 'Unauthorized' });
                }
            }
            else {
                return res.status(400).send({ message: 'Bad  Request, user not found' });
            }

        }
    });
}


// Delete bill.......
exports.deleteBill = function (req, res) {

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
    connection.query('SELECT * FROM users WHERE email_address = ?', username, function (error, results) {
        if (error) {
            console.log(error);
            return res.status(401).send({ message: 'Unauthorized' });
        } else {
            if (results.length > 0) {
                if (bcrypt.compareSync(password, results[0].password)) {
                    console.log("Bill id....", req.params['id']);

                    var billId = req.params['id'];
                    connection.query("SELECT * FROM bill WHERE id = ?", billId, function (error, result) {
                        if (error) {
                            return res.status(404).send({ "Bad Request": "No bill found for this Id" });
                        }
                        else {
                            if (result.length > 0) {
                                connection.query("DELETE FROM bill where id =?", billId, function (error, qResult) {
                                    if (error) {
                                        return res.status(404).send({ message: 'Bill Not Found' });
                                    } else {
                                        //console.log("delete result", qResult[0]);
                                        return res.status(204).send({ message: "No content" });
                                    }

                                });
                            }
                            else {
                                return res.status(400).send({ "Bad Request": "not found" });
                            }

                        }
                    });

                }
                else {
                    return res.status(401).send({ message: 'Unauthorized, password does not match the current user' });
                }
            }
            else {
                return res.status(401).send({ message: "User not found" });
            }
        }
    });

}
